import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { Users, Instagram, Youtube } from 'lucide-react'
import Link from 'next/link'
import { CreateInfluencerDialog } from '@/components/influencers/CreateInfluencerDialog'

export default async function InfluencersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: influencers } = await supabase
    .from('influencers')
    .select('*')
    .eq('brand_id', user.id)
    .order('name')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Influencer Directory</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your creator relationships
          </p>
        </div>
        <CreateInfluencerDialog userId={user.id} />
      </div>

      {!influencers || influencers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No influencers yet</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-sm">
              Add your first influencer to start building your creator directory
            </p>
            <CreateInfluencerDialog userId={user.id} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {influencers.map((inf) => (
            <Card key={inf.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{inf.name}</p>
                    {inf.location && (
                      <p className="text-xs text-muted-foreground mt-0.5">{inf.location}</p>
                    )}
                  </div>
                  {inf.niche && (
                    <Badge variant="secondary" className="text-xs shrink-0">{inf.niche}</Badge>
                  )}
                </div>

                <div className="space-y-1.5 mb-4">
                  {inf.instagram_handle && (
                    <p className="text-sm flex items-center gap-2">
                      <Instagram className="h-3.5 w-3.5 text-pink-500" />
                      <span className="text-muted-foreground">@{inf.instagram_handle}</span>
                    </p>
                  )}
                  {inf.tiktok_handle && (
                    <p className="text-sm flex items-center gap-2">
                      <span className="h-3.5 w-3.5 text-xs font-bold shrink-0">TT</span>
                      <span className="text-muted-foreground">@{inf.tiktok_handle}</span>
                    </p>
                  )}
                  {inf.youtube_handle && (
                    <p className="text-sm flex items-center gap-2">
                      <Youtube className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-muted-foreground truncate">{inf.youtube_handle}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center border rounded-lg p-2 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Followers</p>
                    <p className="text-sm font-semibold">{formatNumber(inf.follower_count)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Eng. Rate</p>
                    <p className="text-sm font-semibold">{formatPercentage(inf.avg_engagement_rate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rate/Post</p>
                    <p className="text-sm font-semibold text-emerald-600">{formatCurrency(inf.rate_per_post)}</p>
                  </div>
                </div>

                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href={`/influencers/${inf.id}`}>View Profile</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
