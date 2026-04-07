import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils'
import { ArrowLeft, Package, DollarSign } from 'lucide-react'
import { AddInfluencerDialogClient } from '@/components/campaigns/AddInfluencerDialogClient'
import { CampaignInfluencerCard } from '@/components/campaigns/CampaignInfluencerCard'
import { ROICalculator } from '@/components/roi-calculator/ROICalculator'
import { EditCampaignDialog } from '@/components/campaigns/EditCampaignDialog'
import { DeleteCampaignButton } from '@/components/campaigns/DeleteCampaignButton'
import { format } from 'date-fns'

interface PageProps { params: Promise<{ id: string }> }

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [campaignResult, influencersResult, analyticsResult] = await Promise.all([
    supabase
      .from('campaigns')
      .select(`
        *,
        campaign_influencers(
          *,
          influencer:influencers(*),
          content_drafts(*),
          payments(*)
        )
      `)
      .eq('id', id)
      .eq('brand_id', user.id)
      .single(),
    supabase.from('influencers').select('*').eq('brand_id', user.id),
    supabase.from('campaign_analytics').select('*').eq('campaign_id', id).single(),
  ])

  if (!campaignResult.data) notFound()

  const campaign = campaignResult.data
  const influencers = influencersResult.data ?? []
  const analytics = analyticsResult.data ?? null
  const ciItems = campaign.campaign_influencers ?? []

  const totalPaid = ciItems.reduce((s: number, ci: { payments: { amount: number }[] }) =>
    s + (ci.payments ?? []).reduce((ps: number, p: { amount: number }) => ps + p.amount, 0), 0)
  const totalCommitted = ciItems.reduce((s: number, ci: { agreed_rate: number }) => s + (ci.agreed_rate ?? 0), 0)
  const pendingDrafts = ciItems.flatMap((ci: { content_drafts: { status: string }[] }) =>
    (ci.content_drafts ?? []).filter((d: { status: string }) => d.status === 'pending_review')
  ).length

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold truncate">{campaign.title}</h1>
            <Badge className={getStatusColor(campaign.status)}>
              {getStatusLabel(campaign.status)}
            </Badge>
            {pendingDrafts > 0 && (
              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                {pendingDrafts} draft{pendingDrafts > 1 ? 's' : ''} pending review
              </Badge>
            )}
          </div>
          {campaign.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{campaign.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <EditCampaignDialog campaign={campaign} />
          <DeleteCampaignButton campaignId={campaign.id} campaignTitle={campaign.title} />
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Budget', value: formatCurrency(campaign.budget), icon: DollarSign, color: 'text-blue-500' },
          { label: 'Committed', value: formatCurrency(totalCommitted), icon: DollarSign, color: 'text-orange-500' },
          { label: 'Paid Out', value: formatCurrency(totalPaid), icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Influencers', value: ciItems.length.toString(), icon: Package, color: 'text-purple-500' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-5 w-5 shrink-0 ${s.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-bold text-sm">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {campaign.start_date && (
        <p className="text-sm text-muted-foreground mb-6">
          {format(new Date(campaign.start_date), 'MMM d, yyyy')}
          {campaign.end_date && ` → ${format(new Date(campaign.end_date), 'MMM d, yyyy')}`}
        </p>
      )}

      <Tabs defaultValue="influencers">
        <TabsList className="mb-4">
          <TabsTrigger value="influencers">
            Influencers ({ciItems.length})
          </TabsTrigger>
          <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="influencers">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Influencer Pipeline</h2>
            <AddInfluencerDialogClient campaignId={campaign.id} influencers={influencers} />
          </div>

          {ciItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-medium mb-1">No influencers added yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add influencers from your directory to begin the campaign workflow
                </p>
                <AddInfluencerDialogClient campaignId={campaign.id} influencers={influencers} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {ciItems.map((ci: Parameters<typeof CampaignInfluencerCard>[0]['item']) => (
                <CampaignInfluencerCard
                  key={ci.id}
                  item={ci}
                  appUrl={appUrl}
                  campaignEndDate={campaign.end_date}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="roi">
          <ROICalculator campaignId={campaign.id} analytics={analytics} niche={undefined} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
