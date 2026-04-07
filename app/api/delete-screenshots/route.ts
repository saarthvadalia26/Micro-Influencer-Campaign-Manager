import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const screenshotPaths: string[] = []
  for (const ciId of campaignInfluencerIds) {
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
