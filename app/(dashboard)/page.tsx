import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Megaphone, Users, DollarSign, TrendingUp } from 'lucide-react'
import { Suspense } from 'react'

async function DashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [campaignsResult, ciResult] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id, budget, status')
      .eq('brand_id', user.id),
    supabase
      .from('campaign_influencers')
      .select('id, agreed_rate, campaign:campaigns!inner(brand_id), payments(amount)')
      .eq('campaign.brand_id', user.id),
  ])

  const campaigns = campaignsResult.data ?? []
  const influencerLinks = ciResult.data ?? []

  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
  const totalInfluencers = influencerLinks.length
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget ?? 0), 0)
  const totalPaid = influencerLinks.reduce(
    (sum, ci) => sum + ((ci.payments as { amount: number }[]) ?? []).reduce((ps, p) => ps + p.amount, 0), 0
  )

  const stats = [
    { label: 'Active Campaigns', value: activeCampaigns.toString(), icon: Megaphone, color: 'text-blue-500' },
    { label: 'Influencers Engaged', value: formatNumber(totalInfluencers), icon: Users, color: 'text-purple-500' },
    { label: 'Total Budget', value: formatCurrency(totalBudget), icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Total Paid', value: formatCurrency(totalPaid), icon: TrendingUp, color: 'text-orange-500' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

async function KanbanData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: items } = await supabase
    .from('campaign_influencers')
    .select(`
      *,
      influencer:influencers!inner(*),
      campaign:campaigns!inner(*)
    `)
    .eq('campaign.brand_id', user.id)
    .order('created_at', { ascending: false })

  // Filter out any rows where the joined records are missing (defensive)
  const validItems = (items ?? []).filter(
    (it: { influencer: unknown; campaign: unknown }) => it.influencer && it.campaign
  )

  return <KanbanBoard initialItems={(validItems as Parameters<typeof KanbanBoard>[0]['initialItems']) ?? []} />
}

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campaign Health Board</h1>
          <p className="text-muted-foreground text-sm mt-1">Drag cards to update influencer pipeline status</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="min-w-[280px]">
                <Skeleton className="h-8 mb-3 rounded" />
                <Skeleton className="h-[200px] rounded-lg" />
              </div>
            ))}
          </div>
        }
      >
        <KanbanData />
      </Suspense>
    </div>
  )
}
