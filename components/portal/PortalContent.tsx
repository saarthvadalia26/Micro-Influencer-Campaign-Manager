'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ContentUploadForm } from './ContentUploadForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, CheckCircle, Link2, ExternalLink, Loader2, FileImage, FileVideo, Clock, AlertCircle } from 'lucide-react'
import type { ContentDraft } from '@/lib/supabase/types'
import { format } from 'date-fns'

interface PortalContentProps {
  campaignInfluencerId: string
  latestDraftStatus: 'pending_review' | 'approved' | 'revision_requested' | null
  existingPostUrl: string | null
  drafts: ContentDraft[]
  pipelineStatus: string
}

export function PortalContent({ campaignInfluencerId, latestDraftStatus, existingPostUrl, drafts, pipelineStatus }: PortalContentProps) {
  const isPaid = pipelineStatus === 'paid'
  const [postUrl, setPostUrl] = useState(isPaid ? '' : (existingPostUrl ?? ''))
  const [isSaving, setIsSaving] = useState(false)
  const [urlSubmitted, setUrlSubmitted] = useState(isPaid ? false : !!existingPostUrl)
  const [localDrafts, setLocalDrafts] = useState<ContentDraft[]>(isPaid ? [] : drafts)
  const supabase = createClient()

  const handleSubmitPostUrl = async () => {
    if (!postUrl.trim()) {
      toast.error('Please enter the post URL')
      return
    }
    try {
      new URL(postUrl)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setIsSaving(true)
    const { error } = await supabase
      .from('campaign_influencers')
      .update({ post_url: postUrl.trim(), status: 'live' })
      .eq('id', campaignInfluencerId)

    if (error) {
      toast.error('Failed to submit post URL')
    } else {
      toast.success('Live post URL submitted!')
      setUrlSubmitted(true)
    }
    setIsSaving(false)
  }

  const handleUploadSuccess = async () => {
    // If status was 'paid', move back to 'content_pending' for the new round
    if (isPaid) {
      await supabase
        .from('campaign_influencers')
        .update({ status: 'content_pending', post_url: null })
        .eq('id', campaignInfluencerId)
    }

    // Refetch drafts to update the list
    const { data } = await supabase
      .from('content_drafts')
      .select('*')
      .eq('campaign_influencer_id', campaignInfluencerId)
      .order('submitted_at', { ascending: false })

    if (data) setLocalDrafts(data)
    toast.success('Content submitted successfully!')
  }

  const hasApprovedDraft = !isPaid && localDrafts.some((d) => d.status === 'approved')
  const latestDraft = localDrafts[0] ?? null
  const latestFeedback = !isPaid && latestDraft?.status === 'revision_requested' ? latestDraft.brand_feedback : null

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 text-xs"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'revision_requested':
        return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-xs"><AlertCircle className="h-3 w-3 mr-1" />Revision Requested</Badge>
      default:
        return null
    }
  }

  // If content is approved and URL submitted — all done
  if (hasApprovedDraft && urlSubmitted) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">You&apos;re all set!</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-3">
              Your content was approved and your live post URL has been submitted.
              The brand will verify your post and process payment.
            </p>
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary flex items-center gap-1.5 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View your post
            </a>
          </CardContent>
        </Card>

        {/* Still allow uploading additional content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Submit Additional Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContentUploadForm
              campaignInfluencerId={campaignInfluencerId}
              onSuccess={handleUploadSuccess}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // If content is approved — show URL submission + upload form
  if (hasApprovedDraft) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4 text-green-600" />
              Content Approved — Submit Your Live Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <p className="text-sm text-green-700 dark:text-green-300">
                Your content has been approved! Now post it on your social media and paste the live post URL below so the brand can verify it.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postUrl">Live Post URL *</Label>
              <Input
                id="postUrl"
                placeholder="https://instagram.com/p/... or https://tiktok.com/..."
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste the direct link to your published post
              </p>
            </div>

            <Button onClick={handleSubmitPostUrl} disabled={isSaving || !postUrl.trim()} className="w-full">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              Submit Live Post URL
            </Button>
          </CardContent>
        </Card>

        {/* Allow uploading more content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Submit Additional Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContentUploadForm
              campaignInfluencerId={campaignInfluencerId}
              onSuccess={handleUploadSuccess}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default: show previous submissions + upload form
  return (
    <div className="space-y-6">
      {/* Previous submissions */}
      {localDrafts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Submissions ({localDrafts.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {localDrafts.map((draft) => (
              <div key={draft.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="shrink-0">
                  {draft.file_type === 'image' ? (
                    <FileImage className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FileVideo className="h-5 w-5 text-purple-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {statusBadge(draft.status)}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(draft.submitted_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  {draft.caption_draft && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{draft.caption_draft}</p>
                  )}
                  {draft.status === 'revision_requested' && draft.brand_feedback && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Feedback: {draft.brand_feedback}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Latest revision feedback banner */}
      {latestFeedback && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-1 text-orange-700 dark:text-orange-300">
              Revision Requested
            </p>
            <p className="text-sm">{latestFeedback}</p>
          </CardContent>
        </Card>
      )}

      {/* Upload form — always available */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            {latestFeedback ? 'Re-Submit Content' : 'Submit Content for Review'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContentUploadForm
            campaignInfluencerId={campaignInfluencerId}
            onSuccess={handleUploadSuccess}
          />
        </CardContent>
      </Card>
    </div>
  )
}
