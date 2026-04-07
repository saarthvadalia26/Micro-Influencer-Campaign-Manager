'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getStatusColor, getStatusLabel } from '@/lib/utils'
import type { ContentDraft } from '@/lib/supabase/types'
import { CheckCircle, XCircle, FileImage, FileVideo, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

interface ContentDraftReviewProps {
  drafts: ContentDraft[]
  onUpdate: () => void
}

export function ContentDraftReview({ drafts, onUpdate }: ContentDraftReviewProps) {
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  const handleApprove = async (draft: ContentDraft) => {
    setLoading(draft.id)
    const { error } = await supabase
      .from('content_drafts')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', draft.id)

    if (error) {
      toast.error('Failed to approve draft')
    } else {
      toast.success('Draft approved!')
      onUpdate()
    }
    setLoading(null)
  }

  const handleRequestRevision = async (draft: ContentDraft) => {
    const fb = feedback[draft.id]
    if (!fb?.trim()) {
      toast.error('Please provide feedback before requesting revision')
      return
    }
    setLoading(draft.id)
    const { error } = await supabase
      .from('content_drafts')
      .update({
        status: 'revision_requested',
        brand_feedback: fb,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', draft.id)

    if (error) {
      toast.error('Failed to request revision')
    } else {
      toast.success('Revision requested')
      onUpdate()
    }
    setLoading(null)
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No content drafts submitted yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <Card key={draft.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {draft.file_type === 'image' ? (
                  <FileImage className="h-4 w-4 text-blue-500" />
                ) : (
                  <FileVideo className="h-4 w-4 text-purple-500" />
                )}
                <CardTitle className="text-sm">
                  {draft.file_type === 'image' ? 'Image' : 'Video'} Draft
                </CardTitle>
              </div>
              <Badge className={getStatusColor(draft.status)}>
                {getStatusLabel(draft.status)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Submitted {format(new Date(draft.submitted_at), 'MMM d, yyyy h:mm a')}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Preview */}
            <div className="rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
              {draft.file_type === 'image' ? (
                <img
                  src={draft.file_url}
                  alt="Content draft"
                  className="max-h-48 max-w-full object-contain"
                />
              ) : (
                <video
                  src={draft.file_url}
                  controls
                  className="max-h-48 max-w-full"
                />
              )}
            </div>

            <a
              href={draft.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Open full size
            </a>

            {draft.caption_draft && (
              <div>
                <p className="text-xs font-medium mb-1">Caption Draft:</p>
                <p className="text-sm bg-muted rounded-md p-2">{draft.caption_draft}</p>
              </div>
            )}

            {draft.brand_feedback && (
              <div>
                <p className="text-xs font-medium mb-1">Previous Feedback:</p>
                <p className="text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-md p-2">
                  {draft.brand_feedback}
                </p>
              </div>
            )}

            {draft.status === 'pending_review' && (
              <div className="space-y-3 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor={`feedback-${draft.id}`} className="text-xs">
                    Revision feedback (required for revision request)
                  </Label>
                  <Textarea
                    id={`feedback-${draft.id}`}
                    placeholder="Describe what changes are needed..."
                    rows={2}
                    value={feedback[draft.id] ?? ''}
                    onChange={(e) => setFeedback((prev) => ({ ...prev, [draft.id]: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(draft)}
                    disabled={loading === draft.id}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequestRevision(draft)}
                    disabled={loading === draft.id}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4" />
                    Request Revision
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
