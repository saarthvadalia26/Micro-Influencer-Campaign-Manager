'use client'

import { useState, useCallback } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { KanbanColumn } from './KanbanColumn'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { recordPayment } from '@/lib/payments'
import type { CampaignInfluencer, Influencer, Campaign, CampaignInfluencerStatus } from '@/lib/supabase/types'

const COLUMNS: CampaignInfluencerStatus[] = ['outreach', 'product_sent', 'content_pending', 'live', 'paid']

type KanbanItem = CampaignInfluencer & { influencer: Influencer; campaign: Campaign }

interface KanbanBoardProps {
  initialItems: KanbanItem[]
}

export function KanbanBoard({ initialItems }: KanbanBoardProps) {
  const [items, setItems] = useState<KanbanItem[]>(initialItems)
  const supabase = createClient()

  const groupedItems = COLUMNS.reduce((acc, status) => {
    acc[status] = items.filter((item) => item.status === status)
    return acc
  }, {} as Record<CampaignInfluencerStatus, KanbanItem[]>)

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result

      if (!destination) return
      if (destination.droppableId === source.droppableId && destination.index === source.index) return

      const newStatus = destination.droppableId as CampaignInfluencerStatus
      const oldStatus = source.droppableId as CampaignInfluencerStatus
      const draggedItem = items.find((item) => item.id === draggableId)

      // Optimistic update
      setItems((prev) =>
        prev.map((item) => (item.id === draggableId ? { ...item, status: newStatus } : item))
      )

      // When moving to "paid", auto-record a payment at the agreed rate
      if (newStatus === 'paid' && oldStatus !== 'paid' && draggedItem) {
        const payResult = await recordPayment(
          supabase,
          draggableId,
          draggedItem.campaign.id,
          draggedItem.agreed_rate,
          'Auto-payment on status change'
        )
        if (!payResult.success) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === draggableId ? { ...item, status: oldStatus } : item
            )
          )
          toast.error(payResult.message)
          return
        }
        toast.success(payResult.message)
        return
      }

      // Persist status change to Supabase
      const { error } = await supabase
        .from('campaign_influencers')
        .update({ status: newStatus })
        .eq('id', draggableId)

      if (error) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === draggableId ? { ...item, status: oldStatus } : item
          )
        )
        toast.error('Failed to update status. Please try again.')
      } else {
        toast.success(`Moved to ${newStatus.replace('_', ' ')}`)
      }
    },
    [supabase]
  )

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn key={status} status={status} items={groupedItems[status]} />
        ))}
      </div>
    </DragDropContext>
  )
}
