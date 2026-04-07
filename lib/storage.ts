import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Delete all files in the content-drafts bucket for given campaign_influencer IDs.
 * Also deletes file URLs found in content_drafts DB rows as a fallback.
 * Files are stored as: {campaign_influencer_id}/{timestamp}.{ext}
 */
export async function deleteStorageFiles(
  supabase: SupabaseClient,
  campaignInfluencerIds: string[]
) {
  const allPaths: string[] = []

  for (const ciId of campaignInfluencerIds) {
    // Approach 1: List files from storage folder
    const { data: files } = await supabase.storage
      .from('content-drafts')
      .list(ciId)

    if (files && files.length > 0) {
      allPaths.push(...files.map((f) => `${ciId}/${f.name}`))
    }

    // Approach 2: Get file paths from content_drafts DB rows
    const { data: drafts } = await supabase
      .from('content_drafts')
      .select('file_url')
      .eq('campaign_influencer_id', ciId)

    if (drafts) {
      for (const draft of drafts) {
        // Extract storage path from the public URL
        const match = draft.file_url?.match(/content-drafts\/(.+)$/)
        if (match) {
          const path = decodeURIComponent(match[1])
          if (!allPaths.includes(path)) {
            allPaths.push(path)
          }
        }
      }
    }
  }

  // Delete all found files in one call
  if (allPaths.length > 0) {
    await supabase.storage.from('content-drafts').remove(allPaths)
  }

  // Delete post screenshots
  const screenshotPaths: string[] = []
  for (const ciId of campaignInfluencerIds) {
    const { data: files } = await supabase.storage
      .from('post-screenshots')
      .list(ciId)

    if (files && files.length > 0) {
      screenshotPaths.push(...files.map((f) => `${ciId}/${f.name}`))
    }
  }

  if (screenshotPaths.length > 0) {
    await supabase.storage.from('post-screenshots').remove(screenshotPaths)
  }
}
