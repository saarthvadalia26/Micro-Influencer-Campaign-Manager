'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils'
import type { CampaignInfluencer, Influencer, Campaign } from '@/lib/supabase/types'
import { Instagram, Youtube, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface KanbanCardProps {
  item: CampaignInfluencer & { influencer: Influencer; campaign: Campaign }
  index: number
}

export function KanbanCard({ item, index }: KanbanCardProps) {
  const { influencer, campaign } = item

  if (!influencer || !campaign) return null

  const primaryHandle =
    influencer.instagram_handle
      ? `@${influencer.instagram_handle}`
      : influencer.tiktok_handle
      ? `@${influencer.tiktok_handle}`
      : influencer.youtube_handle ?? ''

  const platformIcon = influencer.instagram_handle ? (
    <Instagram className="h-3 w-3" />
  ) : influencer.youtube_handle ? (
    <Youtube className="h-3 w-3" />
  ) : null

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? 'rotate-1 opacity-90' : ''}`}
        >
          <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-l-4 border-l-primary/30">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{influencer.name}</p>
                  {primaryHandle && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      {platformIcon}
                      <span className="truncate">{primaryHandle}</span>
                    </p>
                  )}
                </div>
                <Badge className={`text-xs shrink-0 ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </Badge>
              </div>

              <Link
                href={`/campaigns/${campaign.id}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors truncate block mb-2"
                onClick={(e) => e.stopPropagation()}
              >
                {campaign.title}
              </Link>

              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-3 w-3" />
                {formatCurrency(item.agreed_rate)}
              </div>

              {influencer.niche && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {influencer.niche}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
