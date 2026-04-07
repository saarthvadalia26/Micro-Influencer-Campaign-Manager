'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AddInfluencerDialog } from './AddInfluencerDialog'
import type { AddInfluencerFormValues } from '@/lib/validations/campaign'
import type { Influencer } from '@/lib/supabase/types'

interface Props {
  campaignId: string
  influencers: Influencer[]
}

export function AddInfluencerDialogClient({ campaignId, influencers }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const handleAdd = async (values: AddInfluencerFormValues) => {
    const { error } = await supabase.from('campaign_influencers').insert({
      campaign_id: campaignId,
      influencer_id: values.influencer_id,
      agreed_rate: values.agreed_rate,
      notes: values.notes || null,
    })

    if (error) {
      if (error.code === '23505') {
        toast.error('This influencer is already in the campaign')
      } else {
        toast.error('Failed to add influencer')
      }
      throw error
    }

    toast.success('Influencer added to campaign!')
    router.refresh()
  }

  return (
    <AddInfluencerDialog
      campaignId={campaignId}
      influencers={influencers}
      onAdd={handleAdd}
    />
  )
}
