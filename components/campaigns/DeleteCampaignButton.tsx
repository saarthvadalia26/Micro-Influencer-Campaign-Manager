'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteStorageFiles } from '@/lib/storage'

export function DeleteCampaignButton({ campaignId, campaignTitle }: { campaignId: string; campaignTitle: string }) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)

    // 1. Get all campaign_influencer IDs to clean up storage
    const { data: ciRows } = await supabase
      .from('campaign_influencers')
      .select('id')
      .eq('campaign_id', campaignId)

    // 2. Delete uploaded files from storage
    if (ciRows && ciRows.length > 0) {
      const ciIds = ciRows.map((r) => r.id)
      await deleteStorageFiles(supabase, ciIds)

      // Delete screenshots via service role API (uploaded by service role, can't delete client-side)
      await fetch('/api/delete-screenshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignInfluencerIds: ciIds }),
      })
    }

    // 3. Delete the campaign (cascades to campaign_influencers, content_drafts, analytics)
    const { error } = await supabase.from('campaigns').delete().eq('id', campaignId)
    if (error) {
      toast.error('Failed to delete campaign')
    } else {
      toast.success('Campaign deleted')
      router.push('/campaigns')
      router.refresh()
    }
    setIsDeleting(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Campaign</DialogTitle>
          <DialogDescription>
            This will permanently delete <strong>{campaignTitle}</strong> and remove all linked influencers, content drafts, and analytics. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
