import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatNumber, formatPercentage, getStatusColor, getStatusLabel } from '@/lib/utils'
import { ArrowLeft, Instagram, Youtube, Mail, MapPin, Users } from 'lucide-react'
import { EditInfluencerDialog } from '@/components/influencers/EditInfluencerDialog'
import { DeleteInfluencerButton } from '@/components/influencers/DeleteInfluencerButton'

interface PageProps { params: Promise<{ id: string }> }

export default async function InfluencerDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [infResult, ciResult] = await Promise.all([
    supabase
      .from('influencers')
      .select('*')
      .eq('id', id)
      .eq('brand_id', user.id)
      .single(),
    supabase
      .from('campaign_influencers')
      .select(`
        *,
        campaign:campaigns(id, title, status)
      `)
      .eq('influencer_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!infResult.data) notFound()

  const influencer = infResult.data
  const campaigns = ciResult.data ?? []

  const stats = [
    { label: 'Followers', value: formatNumber(influencer.follower_count) },
    { label: 'Avg. Engagement', value: formatPercentage(influencer.avg_engagement_rate) },
    { label: 'Rate / Post', value: formatCurrency(influencer.rate_per_post) },
    { label: 'Campaigns', value: campaigns.length.toString() },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/influencers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{influencer.name}</h1>
            {influencer.niche && (
              <Badge variant="secondary">{influencer.niche}</Badge>
            )}
          </div>
          {influencer.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {influencer.location}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <EditInfluencerDialog influencer={influencer} />
          <DeleteInfluencerButton influencerId={influencer.id} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact & Social</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {influencer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${influencer.email}`} className="hover:underline">{influencer.email}</a>
              </div>
            )}
            {influencer.instagram_handle && (
              <div className="flex items-center gap-2 text-sm">
                <Instagram className="h-4 w-4 text-pink-500" />
                <a
                  href={`https://instagram.com/${influencer.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  @{influencer.instagram_handle}
                </a>
              </div>
            )}
            {influencer.tiktok_handle && (
              <div className="flex items-center gap-2 text-sm">
                <span className="h-4 w-4 text-xs font-bold">TT</span>
                <a
                  href={`https://tiktok.com/@${influencer.tiktok_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  @{influencer.tiktok_handle}
                </a>
              </div>
            )}
            {influencer.youtube_handle && (
              <div className="flex items-center gap-2 text-sm">
                <Youtube className="h-4 w-4 text-red-500" />
                <span>{influencer.youtube_handle}</span>
              </div>
            )}
            {influencer.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{influencer.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Campaign History ({campaigns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Not part of any campaigns yet
                </p>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((ci) => (
                    <div key={ci.id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                      <div className="min-w-0">
                        <Link
                          href={`/campaigns/${ci.campaign.id}`}
                          className="font-medium text-sm hover:text-primary transition-colors"
                        >
                          {ci.campaign.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className={`text-xs ${getStatusColor(ci.status)}`}>
                            {getStatusLabel(ci.status)}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(ci.campaign.status)}`}>
                            {getStatusLabel(ci.campaign.status)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-emerald-600 shrink-0">
                        {formatCurrency(ci.agreed_rate)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
