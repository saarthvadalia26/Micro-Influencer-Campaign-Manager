'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InfluencerForm } from './InfluencerForm'
import type { InfluencerFormValues } from '@/lib/validations/influencer'
import type { Influencer } from '@/lib/supabase/types'
import { Edit2 } from 'lucide-react'

export function EditInfluencerDialog({ influencer }: { influencer: Influencer }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (values: InfluencerFormValues) => {
    setIsLoading(true)
    const { error } = await supabase
      .from('influencers')
      .update({
        name: values.name,
        email: values.email || null,
        instagram_handle: values.instagram_handle || null,
        tiktok_handle: values.tiktok_handle || null,
        youtube_handle: values.youtube_handle || null,
        niche: values.niche || null,
        follower_count: values.follower_count,
        avg_engagement_rate: values.avg_engagement_rate,
        location: values.location || null,
        rate_per_post: values.rate_per_post,
        notes: values.notes || null,
      })
      .eq('id', influencer.id)

    if (error) {
      toast.error('Failed to update influencer')
    } else {
      toast.success('Influencer updated!')
      setOpen(false)
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Influencer</DialogTitle>
        </DialogHeader>
        <InfluencerForm
          defaultValues={influencer}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Update Influencer"
        />
      </DialogContent>
    </Dialog>
  )
}
