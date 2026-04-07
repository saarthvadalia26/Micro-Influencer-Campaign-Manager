'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useRealtimeDrafts(
  campaignId: string,
  onNewDraft: () => void
) {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`campaign-drafts-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'content_drafts',
        },
        (payload) => {
          toast.info('New content draft submitted!', {
            description: 'A creator just submitted content for review.',
            action: { label: 'Refresh', onClick: onNewDraft },
          })
          onNewDraft()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaignId, onNewDraft, supabase])
}
