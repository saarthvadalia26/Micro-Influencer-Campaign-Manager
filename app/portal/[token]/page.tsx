import { createServiceClient } from '@/lib/supabase/service'
import { createClient, getUser } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PortalContent } from '@/components/portal/PortalContent'
import { PortalSignOutButton } from '@/components/portal/PortalSignOutButton'
import { format } from 'date-fns'
import { Package, Calendar, FileText } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { AnimatedWrapper } from '@/components/portal/AnimatedWrapper'

interface PageProps { params: Promise<{ token: string }> }

export default async function PortalPage({ params }: PageProps) {
  const { token } = await params

  // Check if user is logged in
  const { data: { user } } = await getUser()
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
        id, brand_id, title, description, start_date, end_date, status
      ),
      influencer:influencers(id, name, email, instagram_handle, tiktok_handle)
    `)
    .eq('portal_token', token)
    .single()

  if (!ci || !ci.campaign || !ci.influencer) {
    notFound()
  }

  // Authorization check: verify logged-in user is the assigned influencer or the campaign owner
  const userEmail = user.email?.toLowerCase()
  const influencerEmail = ci.influencer.email?.toLowerCase()
  const isBrandOwner = ci.campaign.brand_id === user.id
  const isAssignedInfluencer = !!influencerEmail && userEmail === influencerEmail

  if (!isBrandOwner && !isAssignedInfluencer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <h2 className="text-xl font-bold">Unauthorized Portal Access</h2>
          <p className="text-sm text-muted-foreground">
            You are logged in as <strong>{user.email}</strong>, which does not match the creator assigned to this collaboration.
          </p>
          <div className="pt-2 flex justify-center">
            <PortalSignOutButton redirectTo={`/portal/login?redirect=${encodeURIComponent(`/portal/${token}`)}`} />
          </div>
        </Card>
      </div>
    )
  }


  const { data: drafts } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('campaign_influencer_id', ci.id)
    .order('submitted_at', { ascending: false })

  const latestDraft = drafts?.[0] ?? null

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Atmospheric radial gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-indigo-600/[0.08] blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-700/[0.08] blur-[120px] translate-x-1/4 translate-y-1/4" />
      </div>
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

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6 relative z-10">
        {/* Welcome */}
        <AnimatedWrapper>
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Hey {ci.influencer.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s everything you need for the <strong>{ci.campaign.title}</strong> campaign.
            </p>
          </div>
        </AnimatedWrapper>

        {/* Campaign Brief */}
        <AnimatedWrapper delay={0.1}>
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
        </AnimatedWrapper>

        {/* Product Tracking */}
        {ci.product_tracking_number && (
          <AnimatedWrapper delay={0.2}>
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
          </AnimatedWrapper>
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
