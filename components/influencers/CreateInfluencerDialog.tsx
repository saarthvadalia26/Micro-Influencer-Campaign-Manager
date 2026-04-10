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
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InfluencerForm } from './InfluencerForm'
import type { InfluencerFormValues } from '@/lib/validations/influencer'
import { UserPlus } from 'lucide-react'

export function CreateInfluencerDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (values: InfluencerFormValues) => {
    setIsLoading(true)

    // Create portal auth account if email and password provided
    if (values.email && values.password) {
      const res = await fetch('/api/create-portal-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          full_name: values.name,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || 'Failed to create portal account')
        setIsLoading(false)
        return
      }
    }

    const { error } = await supabase.from('influencers').insert({
      brand_id: userId,
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

    if (error) {
      toast.error('Failed to add influencer')
    } else {
      toast.success('Influencer added!')
      setOpen(false)
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          Add Influencer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Influencer</DialogTitle>
        </DialogHeader>
        <InfluencerForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Add Influencer" showPassword />
      </DialogContent>
    </Dialog>
  )
}
