'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, FileImage, FileVideo, X, Loader2, CheckCircle } from 'lucide-react'

interface ContentUploadFormProps {
  campaignInfluencerId: string
  onSuccess: () => void
}

export function ContentUploadForm({ campaignInfluencerId, onSuccess }: ContentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const supabase = createClient()

  const handleFileSelect = useCallback((selectedFile: File) => {
    const isImage = selectedFile.type.startsWith('image/')
    const isVideo = selectedFile.type.startsWith('video/')
    if (!isImage && !isVideo) {
      toast.error('Please upload an image or video file')
      return
    }
    if (selectedFile.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB')
      return
    }
    setFile(selectedFile)
    const url = URL.createObjectURL(selectedFile)
    setPreview(url)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) handleFileSelect(dropped)
    },
    [handleFileSelect]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    setIsUploading(true)
    try {
      // Upload to Supabase Storage
      const ext = file.name.split('.').pop()
      const filePath = `${campaignInfluencerId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('content-drafts')
        .upload(filePath, file, { upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('content-drafts')
        .getPublicUrl(filePath)

      // Create content_draft record
      const { error: dbError } = await supabase.from('content_drafts').insert({
        campaign_influencer_id: campaignInfluencerId,
        file_url: urlData.publicUrl,
        file_type: file.type.startsWith('image/') ? 'image' : 'video',
        caption_draft: caption.trim() || null,
        status: 'pending_review',
      })

      if (dbError) throw dbError

      toast.success('Content submitted successfully!')
      onSuccess()
    } catch (err: unknown) {
      console.error(err)
      const message = err instanceof Error ? err.message : String(err)
      toast.error(`Upload failed: ${message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Content File *</Label>
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => document.getElementById('file-input')?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
            }`}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-sm mb-1">Drag & drop your file here</p>
            <p className="text-xs text-muted-foreground mb-3">or click to browse</p>
            <p className="text-xs text-muted-foreground">
              Images (JPG, PNG, GIF, WebP) or Videos (MP4, MOV, AVI) · Max 100MB
            </p>
            <input
              id="file-input"
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {preview && (
                    <div className="mb-3 rounded-lg overflow-hidden bg-muted">
                      {file.type.startsWith('image/') ? (
                        <img src={preview} alt="Preview" className="max-h-48 w-full object-contain" />
                      ) : (
                        <video src={preview} controls className="max-h-48 w-full" />
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {file.type.startsWith('image/') ? (
                      <FileImage className="h-4 w-4 text-blue-500 shrink-0" />
                    ) : (
                      <FileVideo className="h-4 w-4 text-purple-500 shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate">{file.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="caption">Caption Draft</Label>
        <Textarea
          id="caption"
          placeholder="Write your caption here, including hashtags and mentions..."
          rows={4}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isUploading || !file} className="w-full" size="lg">
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            Submit for Review
          </>
        )}
      </Button>
    </form>
  )
}
