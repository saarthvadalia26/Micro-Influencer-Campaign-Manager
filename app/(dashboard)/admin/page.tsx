import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Building2, Megaphone, Users, DollarSign, TrendingUp, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'

type BrandRow = {
  id: string
  full_name: string | null
  company_name: string | null
  created_at: string
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  draftCampaigns: number
  totalBudget: number
  totalSpent: number
  totalInfluencers: number
}

export default async function SuperAdminPage() {
  // 1. Verify the current user is a super_admin (server-side)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as { role?: string }).role !== 'super_admin') {
    notFound()
  }

  // 2. Use service role to bypass RLS and fetch ALL brands' data
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [brandsResult, campaignsResult, influencersResult, paymentsResult] = await Promise.all([
    serviceSupabase
      .from('profiles')
      .select('id, full_name, company_name, created_at, role')
      .in('role', ['brand', 'admin'])
      .order('created_at', { ascending: false }),
    serviceSupabase
      .from('campaigns')
      .select('id, brand_id, status, budget'),
    serviceSupabase
      .from('campaign_influencers')
      .select('id, campaign_id'),
    serviceSupabase
      .from('payments')
      .select('campaign_id, amount'),
  ])

  const brands = brandsResult.data ?? []
  const campaigns = campaignsResult.data ?? []
  const influencerLinks = influencersResult.data ?? []
  const payments = paymentsResult.data ?? []

  // 3. Aggregate stats per brand
  const campaignsByBrand = new Map<string, typeof campaigns>()
  for (const c of campaigns) {
    const list = campaignsByBrand.get(c.brand_id) ?? []
    list.push(c)
    campaignsByBrand.set(c.brand_id, list)
  }

  const paymentsByCampaign = new Map<string, number>()
  for (const p of payments) {
    paymentsByCampaign.set(p.campaign_id, (paymentsByCampaign.get(p.campaign_id) ?? 0) + p.amount)
  }

  const influencersByCampaign = new Map<string, number>()
  for (const ci of influencerLinks) {
    influencersByCampaign.set(ci.campaign_id, (influencersByCampaign.get(ci.campaign_id) ?? 0) + 1)
  }

  const brandRows: BrandRow[] = brands.map((b) => {
    const brandCampaigns = campaignsByBrand.get(b.id) ?? []
    const totalSpent = brandCampaigns.reduce((sum, c) => sum + (paymentsByCampaign.get(c.id) ?? 0), 0)
    const totalInfluencers = brandCampaigns.reduce((sum, c) => sum + (influencersByCampaign.get(c.id) ?? 0), 0)

    return {
      id: b.id,
      full_name: b.full_name,
      company_name: b.company_name,
      created_at: b.created_at,
      totalCampaigns: brandCampaigns.length,
      activeCampaigns: brandCampaigns.filter((c) => c.status === 'active').length,
      completedCampaigns: brandCampaigns.filter((c) => c.status === 'completed').length,
      draftCampaigns: brandCampaigns.filter((c) => c.status === 'draft').length,
      totalBudget: brandCampaigns.reduce((sum, c) => sum + (c.budget ?? 0), 0),
      totalSpent,
      totalInfluencers,
    }
  })

  // 4. Platform-wide totals
  const platformTotals = {
    brands: brands.length,
    campaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
    completedCampaigns: campaigns.filter((c) => c.status === 'completed').length,
    totalSpent: payments.reduce((s, p) => s + p.amount, 0),
    totalInfluencers: influencerLinks.length,
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="h-7 w-7 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Platform-wide overview of all brands and campaigns</p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Brands</p>
                <p className="text-lg font-bold">{formatNumber(platformTotals.brands)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Campaigns</p>
                <p className="text-lg font-bold">{formatNumber(platformTotals.campaigns)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-lg font-bold">{formatNumber(platformTotals.activeCampaigns)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-lg font-bold">{formatNumber(platformTotals.completedCampaigns)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Influencers</p>
                <p className="text-lg font-bold">{formatNumber(platformTotals.totalInfluencers)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Spent</p>
                <p className="text-lg font-bold">{formatCurrency(platformTotals.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-brand breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brands Overview ({brandRows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {brandRows.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">No brands registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Brand</th>
                    <th className="py-2 pr-4 font-medium text-right">Total</th>
                    <th className="py-2 pr-4 font-medium text-right">Active</th>
                    <th className="py-2 pr-4 font-medium text-right">Completed</th>
                    <th className="py-2 pr-4 font-medium text-right">Influencers</th>
                    <th className="py-2 pr-4 font-medium text-right">Budget</th>
                    <th className="py-2 pr-4 font-medium text-right">Spent</th>
                    <th className="py-2 pr-4 font-medium text-right">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {brandRows.map((b) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{b.full_name ?? 'Unnamed'}</div>
                        {b.company_name && (
                          <div className="text-xs text-muted-foreground">{b.company_name}</div>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right font-medium">{b.totalCampaigns}</td>
                      <td className="py-3 pr-4 text-right">
                        {b.activeCampaigns > 0 ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
                            {b.activeCampaigns}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {b.completedCampaigns > 0 ? (
                          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs">
                            {b.completedCampaigns}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right">{b.totalInfluencers}</td>
                      <td className="py-3 pr-4 text-right text-muted-foreground">{formatCurrency(b.totalBudget)}</td>
                      <td className="py-3 pr-4 text-right font-medium text-emerald-600">{formatCurrency(b.totalSpent)}</td>
                      <td className="py-3 pr-4 text-right text-xs text-muted-foreground">
                        {format(new Date(b.created_at), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
