import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PortalContent } from '@/components/portal/PortalContent'
import { PortalSignOutButton } from '@/components/portal/PortalSignOutButton'
import { format } from 'date-fns'
import { Package, Calendar, FileText } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface PageProps { params: Promise<{ token: string }> }

export default async function PortalPage({ params }: PageProps) {
  const { token } = await params

  // Check if user is logged in
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    redirect(`/portal/login?redirect=${encodeURIComponent(`/portal/${token}`)}`)
  }

  // Use service role to bypass RLS for data fetching
  const supabase = createServiceClient()

  // Fetch the campaign_influencer by token
  const { data: ci } = await supabase
    .from('campaign_influencers')
    .select(`
      *,
      campaign:campaigns(
        id, title, description, start_date, end_date, status
      ),
      influencer:influencers(id, name, email, instagram_handle, tiktok_handle)
    `)
    .eq('portal_token', token)
    .single()

  if (!ci || !ci.campaign || !ci.influencer) {
    notFound()
  }

  const { data: drafts } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('campaign_influencer_id', ci.id)
    .order('submitted_at', { ascending: false })

  const latestDraft = drafts?.[0] ?? null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Logo size={32} />
          <div className="flex-1">
            <p className="font-semibold text-sm">Creator Portal</p>
            <p className="text-xs text-muted-foreground">{ci.campaign.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
            <PortalSignOutButton redirectTo={`/portal/login?redirect=${encodeURIComponent(`/portal/${token}`)}`} />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold mb-1">
            Hey {ci.influencer.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s everything you need for the <strong>{ci.campaign.title}</strong> campaign.
          </p>
        </div>

        {/* Campaign Brief */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Campaign Brief
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ci.campaign.description ? (
              <p className="text-sm whitespace-pre-wrap">{ci.campaign.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No brief provided yet.</p>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-3 text-sm">
              {ci.campaign.start_date && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(ci.campaign.start_date), 'MMM d, yyyy')}
                    {ci.campaign.end_date && ` – ${format(new Date(ci.campaign.end_date), 'MMM d, yyyy')}`}
                  </span>
                </div>
              )}
              {ci.agreed_rate > 0 && (
                <div className="font-medium text-emerald-600">
                  Agreed rate: ${ci.agreed_rate.toFixed(2)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Tracking */}
        {ci.product_tracking_number && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Package className="h-5 w-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">Product Shipped!</p>
                <p className="text-xs text-muted-foreground">
                  Tracking: <span className="font-mono">{ci.product_tracking_number}</span>
                </p>
              </div>
              <Badge className="ml-auto bg-orange-100 text-orange-700">In Transit</Badge>
            </CardContent>
          </Card>
        )}

        {/* Previous feedback / status */}
        {latestDraft?.status === 'revision_requested' && latestDraft.brand_feedback && (
          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-1 text-orange-700 dark:text-orange-300">
                Revision Requested
              </p>
              <p className="text-sm">{latestDraft.brand_feedback}</p>
            </CardContent>
          </Card>
        )}

        {/* Upload form / Post URL submission */}
        <PortalContent
          campaignInfluencerId={ci.id}
          latestDraftStatus={latestDraft?.status ?? null}
          existingPostUrl={ci.post_url ?? null}
          drafts={drafts ?? []}
          pipelineStatus={ci.status}
        />
      </main>
    </div>
  )
}
