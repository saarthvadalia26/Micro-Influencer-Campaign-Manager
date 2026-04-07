'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ContentDraftReview } from './ContentDraftReview'
import { recordPayment } from '@/lib/payments'
import { formatCurrency, formatNumber, getStatusColor, getStatusLabel } from '@/lib/utils'
import type { CampaignInfluencer, Influencer, ContentDraft, Payment } from '@/lib/supabase/types'
import {
  Instagram, Youtube, Copy, ExternalLink, Package, Link2, Loader2, CheckCircle2,
  FileImage, ChevronDown, ChevronUp, Edit2, Check, CircleDollarSign, Camera,
} from 'lucide-react'
import { format } from 'date-fns'

type CIWithDetails = CampaignInfluencer & {
  influencer: Influencer
  content_drafts: ContentDraft[]
  payments: Payment[]
}

interface CampaignInfluencerCardProps {
  item: CIWithDetails
  appUrl: string
  campaignEndDate: string | null
}

export function CampaignInfluencerCard({ item, appUrl, campaignEndDate }: CampaignInfluencerCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [status, setStatus] = useState(item.status)
  const [tracking, setTracking] = useState(item.product_tracking_number ?? '')
  const [postUrl, setPostUrl] = useState(item.post_url ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const portalUrl = `${appUrl}/portal/${item.portal_token}`
  const pendingDrafts = item.content_drafts?.filter((d) => d.status === 'pending_review').length ?? 0
  const payments = item.payments ?? []
  const totalPaidAmount = payments.reduce((s, p) => s + p.amount, 0)

  const [isVerifying, setIsVerifying] = useState(false)
  const [urlClicked, setUrlClicked] = useState(false)
  const [urlVerified, setUrlVerified] = useState(false)

  const isCampaignEnded = campaignEndDate
    ? new Date(campaignEndDate) < new Date()
    : false

  const handlePostUrlClick = useCallback(async () => {
    setUrlClicked(true)

    // Capture screenshot in background if not already captured
    if (!item.post_screenshot_url && item.post_url) {
      try {
        const res = await fetch('/api/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignInfluencerId: item.id,
            postUrl: item.post_url,
          }),
        })
        if (res.ok) {
          router.refresh()
        }
      } catch {
        // Screenshot is non-blocking — silent fail
        console.error('Screenshot capture failed')
      }
    }
  }, [item.id, item.post_url, item.post_screenshot_url, router])

  useEffect(() => {
    if (!urlClicked) return
    const handleFocus = () => {
      setUrlVerified(true)
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [urlClicked])

  const handleVerifyAndPay = async () => {
    setIsVerifying(true)
    const result = await recordPayment(
      supabase,
      item.id,
      item.campaign_id,
      item.agreed_rate,
      `Verified post: ${item.post_url}`,
      item.post_url ?? undefined
    )

    if (result.success) {
      toast.success(`Post verified! ${result.message}`)
      router.refresh()
    } else {
      toast.error(result.message)
    }
    setIsVerifying(false)
  }

  const copyPortalLink = () => {
    navigator.clipboard.writeText(portalUrl)
    toast.success('Portal link copied!')
  }

  const handleSave = async () => {
    setIsSaving(true)
    const { error } = await supabase
      .from('campaign_influencers')
      .update({
        status,
        product_tracking_number: tracking || null,
        post_url: postUrl || null,
      })
      .eq('id', item.id)

    if (error) {
      toast.error('Failed to save changes')
    } else {
      toast.success('Changes saved')
      setEditOpen(false)
      router.refresh()
    }
    setIsSaving(false)
  }

  const { influencer } = item

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold">{influencer.name}</p>
              <Badge className={getStatusColor(status)} >
                {getStatusLabel(status)}
              </Badge>
              {pendingDrafts > 0 && (
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 text-xs">
                  <FileImage className="h-3 w-3 mr-1" />
                  {pendingDrafts} pending
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {influencer.instagram_handle && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Instagram className="h-3 w-3 text-pink-500" />
                  @{influencer.instagram_handle}
                </span>
              )}
              {influencer.youtube_handle && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Youtube className="h-3 w-3 text-red-500" />
                  {influencer.youtube_handle}
                </span>
              )}
              {influencer.niche && (
                <Badge variant="outline" className="text-xs">{influencer.niche}</Badge>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(item.agreed_rate)}
              <span className="text-xs font-normal text-muted-foreground">/post</span>
            </p>
            {totalPaidAmount > 0 ? (
              <p className="text-xs text-emerald-600 flex items-center gap-1 justify-end">
                <CircleDollarSign className="h-3 w-3" />
                {formatCurrency(totalPaidAmount)} paid ({payments.length}x)
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">not paid yet</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3 space-y-3">
        {/* Portal Link */}
        <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
          <code className="text-xs truncate flex-1 text-muted-foreground">{portalUrl}</code>
          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={copyPortalLink}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" asChild>
            <a href={portalUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>

        {/* Live Post URL / Screenshot section */}
        {item.post_url && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-md p-3 space-y-2">
            {isCampaignEnded && item.post_screenshot_url ? (
              <>
                {/* Campaign ended: show archived screenshot */}
                <div className="flex items-center gap-2">
                  <Camera className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    Archived Post Snapshot
                  </span>
                </div>
                <div className="rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={item.post_screenshot_url}
                    alt={`Screenshot of ${item.post_url}`}
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Captured on {item.post_screenshot_taken_at
                    ? format(new Date(item.post_screenshot_taken_at), 'MMM d, yyyy \'at\' h:mm a')
                    : 'unknown date'}
                  {' · '}
                  <span className="text-muted-foreground/70">{item.post_url}</span>
                </p>
              </>
            ) : (
              <>
                {/* Campaign active: show clickable URL */}
                <div className="flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Live Post:</span>
                  <a
                    href={item.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary truncate hover:underline flex-1"
                    onClick={handlePostUrlClick}
                  >
                    {item.post_url}
                  </a>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" asChild>
                    <a href={item.post_url} target="_blank" rel="noopener noreferrer" title="Open post" onClick={handlePostUrlClick}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>

                {/* Screenshot captured indicator */}
                {item.post_screenshot_url && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    Screenshot captured
                  </p>
                )}

                {/* Verify & Pay flow */}
                {item.status === 'live' && !urlVerified && (
                  <p className="text-xs text-muted-foreground">
                    Click the post link above to verify it, then return here to approve payment.
                  </p>
                )}
                {item.status === 'live' && urlVerified && (
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleVerifyAndPay}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Verified — Pay {formatCurrency(item.agreed_rate)}
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {item.product_tracking_number && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Package className="h-3.5 w-3.5" />
            Tracking: <span className="font-mono">{item.product_tracking_number}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex-1">
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update {influencer.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Pipeline Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['outreach', 'product_sent', 'content_pending', 'live', 'paid'].map((s) => (
                        <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Product Tracking Number</Label>
                  <Input
                    placeholder="1Z999AA10123456784"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Live Post URL</Label>
                  <Input
                    placeholder="https://instagram.com/p/..."
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="flex-1"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Hide' : 'Show'} Content Drafts ({item.content_drafts?.length ?? 0})
          </Button>
        </div>

        {/* Content Drafts */}
        {expanded && (
          <div className="border-t pt-3">
            <ContentDraftReview
              drafts={item.content_drafts ?? []}
              onUpdate={() => router.refresh()}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
