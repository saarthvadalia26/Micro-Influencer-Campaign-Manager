'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { deleteStorageFiles } from '@/lib/storage'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'

export function DeleteAccountButton({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') return

    setIsDeleting(true)
    try {
      // 1. Get all campaign_influencer IDs across all user's campaigns
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('brand_id', (await supabase.auth.getUser()).data.user?.id ?? '')

      if (campaigns && campaigns.length > 0) {
        const campaignIds = campaigns.map((c) => c.id)
        const { data: ciRows } = await supabase
          .from('campaign_influencers')
          .select('id')
          .in('campaign_id', campaignIds)

        // 2. Delete all storage files
        if (ciRows && ciRows.length > 0) {
          await deleteStorageFiles(supabase, ciRows.map((r) => r.id))
        }
      }

      // 3. Call server API to delete auth user (cascades to profile + all data)
      const res = await fetch('/api/delete-account', { method: 'DELETE' })
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to delete account')
      }

      // 4. Sign out
      await supabase.auth.signOut()

      toast.success('Account deleted permanently')
      router.push('/login')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete account'
      toast.error(message)
    }
    setIsDeleting(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setConfirmation('') }}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="h-4 w-4" />
          Delete Account Permanently
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This will permanently delete your account (<strong>{email}</strong>), all campaigns, influencers, content drafts, uploaded files, and analytics. This action <strong>cannot be undone</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="confirm">Type <strong>DELETE</strong> to confirm</Label>
          <Input
            id="confirm"
            placeholder="DELETE"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || confirmation !== 'DELETE'}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete Everything
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
