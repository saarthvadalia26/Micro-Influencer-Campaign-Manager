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

export function DeleteInfluencerButton({ influencerId }: { influencerId: string }) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)

    // 1. Get all campaign_influencer IDs for this influencer
    const { data: ciRows } = await supabase
      .from('campaign_influencers')
      .select('id')
      .eq('influencer_id', influencerId)

    // 2. Delete uploaded files from storage
    if (ciRows && ciRows.length > 0) {
      await deleteStorageFiles(supabase, ciRows.map((r) => r.id))
    }

    // 3. Delete the influencer (cascades to campaign_influencers + content_drafts)
    const { error } = await supabase.from('influencers').delete().eq('id', influencerId)
    if (error) {
      toast.error('Failed to delete influencer')
    } else {
      toast.success('Influencer deleted')
      router.push('/influencers')
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
          <DialogTitle>Delete Influencer</DialogTitle>
          <DialogDescription>
            This will permanently delete this influencer and remove them from all campaigns. This action cannot be undone.
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
