'use client'

import { Droppable } from '@hello-pangea/dnd'
import { KanbanCard } from './KanbanCard'
import { Badge } from '@/components/ui/badge'
import type { CampaignInfluencer, Influencer, Campaign, CampaignInfluencerStatus } from '@/lib/supabase/types'
import { getStatusColor, getStatusLabel } from '@/lib/utils'

interface KanbanColumnProps {
  status: CampaignInfluencerStatus
  items: (CampaignInfluencer & { influencer: Influencer; campaign: Campaign })[]
}

const columnIcons: Record<CampaignInfluencerStatus, string> = {
  outreach: '📬',
  product_sent: '📦',
  content_pending: '🎬',
  live: '🟢',
  paid: '💰',
}

export function KanbanColumn({ status, items }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-base">{columnIcons[status]}</span>
        <h3 className="font-semibold text-sm">{getStatusLabel(status)}</h3>
        <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">
          {items.length}
        </Badge>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] rounded-lg p-2 transition-colors ${
              snapshot.isDraggingOver
                ? 'bg-primary/5 border-2 border-dashed border-primary/30'
                : 'bg-muted/40'
            }`}
          >
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                Drop here
              </div>
            ) : (
              items.map((item, index) => (
                <KanbanCard key={item.id} item={item} index={index} />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
