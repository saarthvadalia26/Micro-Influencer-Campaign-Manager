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
import { CampaignForm } from './CampaignForm'
import type { CampaignFormValues } from '@/lib/validations/campaign'
import { Plus } from 'lucide-react'

export function CreateCampaignDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (values: CampaignFormValues) => {
    setIsLoading(true)
    const { error } = await supabase.from('campaigns').insert({
      brand_id: userId,
      title: values.title,
      description: values.description || null,
      budget: values.budget,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      status: values.status,
    })

    if (error) {
      toast.error('Failed to create campaign')
    } else {
      toast.success('Campaign created!')
      setOpen(false)
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        <CampaignForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Create Campaign" />
      </DialogContent>
    </Dialog>
  )
}
