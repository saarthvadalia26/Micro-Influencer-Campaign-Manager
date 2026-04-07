import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // 2. Parse body
  const { campaignInfluencerId, postUrl } = await request.json()
  if (!campaignInfluencerId || !postUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // 3. Verify ownership (RLS ensures user can only see their own campaign_influencers)
  const { data: ci } = await supabase
    .from('campaign_influencers')
    .select('id, campaign_id')
    .eq('id', campaignInfluencerId)
    .single()

  if (!ci) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // 4. Capture screenshot via screenshotone.com API
  const apiKey = process.env.SCREENSHOT_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Screenshot API key not configured' }, { status: 500 })
  }

  const screenshotApiUrl = `https://api.screenshotone.com/take?access_key=${apiKey}&url=${encodeURIComponent(postUrl)}&viewport_width=1280&viewport_height=900&format=png&block_ads=true&delay=3`

  const screenshotResponse = await fetch(screenshotApiUrl)
  if (!screenshotResponse.ok) {
    return NextResponse.json({ error: 'Screenshot capture failed' }, { status: 502 })
  }

  const imageBuffer = Buffer.from(await screenshotResponse.arrayBuffer())

  // 5. Upload to Supabase Storage using service role
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const filePath = `${campaignInfluencerId}/${Date.now()}.png`
  const { error: uploadError } = await serviceSupabase.storage
    .from('post-screenshots')
    .upload(filePath, imageBuffer, {
      contentType: 'image/png',
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Failed to store screenshot' }, { status: 500 })
  }

  const { data: urlData } = serviceSupabase.storage
    .from('post-screenshots')
    .getPublicUrl(filePath)

  // 6. Save screenshot reference to campaign_influencers
  const { error: updateError } = await supabase
    .from('campaign_influencers')
    .update({
      post_screenshot_url: urlData.publicUrl,
      post_screenshot_taken_at: new Date().toISOString(),
    })
    .eq('id', campaignInfluencerId)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save screenshot reference' }, { status: 500 })
  }

  return NextResponse.json({ screenshotUrl: urlData.publicUrl })
}
