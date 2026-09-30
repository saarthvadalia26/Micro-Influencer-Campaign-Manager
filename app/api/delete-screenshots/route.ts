import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { campaignInfluencerIds } = await request.json()
  if (!Array.isArray(campaignInfluencerIds) || campaignInfluencerIds.length === 0) {
    return NextResponse.json({ error: 'Missing campaignInfluencerIds' }, { status: 400 })
  }

  // Validate format of all IDs
  const validFormatIds = campaignInfluencerIds.filter(
    (id) => typeof id === 'string' && UUID_REGEX.test(id)
  )

  if (validFormatIds.length === 0) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
  }

  // Verify ownership: ensure IDs belong to campaigns owned by the authenticated brand
  const { data: validCIs, error: verifyError } = await supabase
    .from('campaign_influencers')
    .select('id, campaign:campaigns!inner(brand_id)')
    .in('id', validFormatIds)
    .eq('campaign.brand_id', user.id)

  if (verifyError) {
    return NextResponse.json({ error: 'Failed to verify ownership' }, { status: 500 })
  }

  const authorizedIds = (validCIs ?? []).map((ci: any) => ci.id)
  if (authorizedIds.length === 0) {
    return NextResponse.json({ error: 'Unauthorized: records do not belong to you' }, { status: 403 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  )

  const screenshotPaths: string[] = []
  for (const ciId of authorizedIds) {
    const { data: files } = await serviceSupabase.storage
      .from('post-screenshots')
      .list(ciId)

    if (files && files.length > 0) {
      screenshotPaths.push(...files.map((f) => `${ciId}/${f.name}`))
    }
  }

  if (screenshotPaths.length > 0) {
    await serviceSupabase.storage.from('post-screenshots').remove(screenshotPaths)
  }

  return NextResponse.json({ deleted: screenshotPaths.length })
}

