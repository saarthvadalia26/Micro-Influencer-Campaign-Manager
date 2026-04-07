import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Plus, Megaphone, Calendar, Users } from 'lucide-react'
import { CreateCampaignDialog } from '@/components/campaigns/CreateCampaignDialog'
import { format } from 'date-fns'

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_influencers(id, status)
    `)
    .eq('brand_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all your influencer campaigns</p>
        </div>
        <CreateCampaignDialog userId={user.id} />
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-sm">
              Create your first campaign to start working with micro-influencers
            </p>
            <CreateCampaignDialog userId={user.id} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Budget</TableHead>
                <TableHead className="hidden md:table-cell">Influencers</TableHead>
                <TableHead className="hidden lg:table-cell">Dates</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.title}</p>
                      {campaign.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {campaign.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusLabel(campaign.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="font-medium">{formatCurrency(campaign.budget)}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{campaign.campaign_influencers?.length ?? 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {campaign.start_date
                        ? format(new Date(campaign.start_date), 'MMM d, yyyy')
                        : '—'}
                      {campaign.end_date && ` → ${format(new Date(campaign.end_date), 'MMM d, yyyy')}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/campaigns/${campaign.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
