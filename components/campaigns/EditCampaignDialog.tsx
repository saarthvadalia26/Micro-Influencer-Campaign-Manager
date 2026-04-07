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
import type { Campaign } from '@/lib/supabase/types'
import { Edit2 } from 'lucide-react'

export function EditCampaignDialog({ campaign }: { campaign: Campaign }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (values: CampaignFormValues) => {
    setIsLoading(true)
    const { error } = await supabase
      .from('campaigns')
      .update({
        title: values.title,
        description: values.description || null,
        budget: values.budget,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        status: values.status,
      })
      .eq('id', campaign.id)

    if (error) {
      toast.error('Failed to update campaign')
    } else {
      toast.success('Campaign updated!')
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
        </DialogHeader>
        <CampaignForm
          defaultValues={campaign}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Update Campaign"
        />
      </DialogContent>
    </Dialog>
  )
}
