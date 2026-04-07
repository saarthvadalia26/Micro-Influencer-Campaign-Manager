'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { influencerSchema, type InfluencerFormValues } from '@/lib/validations/influencer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Influencer } from '@/lib/supabase/types'
import { Loader2, Instagram, Youtube } from 'lucide-react'

const NICHES = [
  'Fashion', 'Beauty', 'Fitness', 'Food', 'Tech', 'Travel',
  'Lifestyle', 'Gaming', 'Music', 'Education', 'Finance', 'Health',
  'Sports', 'Entertainment', 'Business', 'Art', 'Parenting', 'Pets',
]

interface InfluencerFormProps {
  defaultValues?: Partial<Influencer>
  onSubmit: (values: InfluencerFormValues) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function InfluencerForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'Save Influencer',
}: InfluencerFormProps) {
  const form = useForm<InfluencerFormValues>({
    resolver: zodResolver(influencerSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      instagram_handle: defaultValues?.instagram_handle ?? '',
      tiktok_handle: defaultValues?.tiktok_handle ?? '',
      youtube_handle: defaultValues?.youtube_handle ?? '',
      niche: defaultValues?.niche ?? '',
      follower_count: defaultValues?.follower_count ?? 0,
      avg_engagement_rate: defaultValues?.avg_engagement_rate ?? 0,
      location: defaultValues?.location ?? '',
      rate_per_post: defaultValues?.rate_per_post ?? 0,
      notes: defaultValues?.notes ?? '',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" placeholder="Jane Smith" {...form.register('name')} />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="jane@example.com" {...form.register('email')} />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Social Handles</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="instagram" className="flex items-center gap-1.5 text-xs">
              <Instagram className="h-3.5 w-3.5 text-pink-500" />
              Instagram
            </Label>
            <Input id="instagram" placeholder="username" {...form.register('instagram_handle')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tiktok" className="flex items-center gap-1.5 text-xs">
              <span className="text-xs font-bold">TT</span>
              TikTok
            </Label>
            <Input id="tiktok" placeholder="username" {...form.register('tiktok_handle')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="youtube" className="flex items-center gap-1.5 text-xs">
              <Youtube className="h-3.5 w-3.5 text-red-500" />
              YouTube
            </Label>
            <Input id="youtube" placeholder="channel" {...form.register('youtube_handle')} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Niche / Category</Label>
          <Input
            id="niche"
            placeholder="e.g. Fashion, Tech..."
            list="niches"
            {...form.register('niche')}
          />
          <datalist id="niches">
            {NICHES.map((n) => <option key={n} value={n} />)}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="New York, USA" {...form.register('location')} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="follower_count">Follower Count</Label>
          <Input
            id="follower_count"
            type="number"
            min="0"
            placeholder="50000"
            {...form.register('follower_count')}
          />
          {form.formState.errors.follower_count && (
            <p className="text-sm text-destructive">{form.formState.errors.follower_count.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="avg_engagement_rate">Avg. Engagement Rate (%)</Label>
          <Input
            id="avg_engagement_rate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="3.5"
            {...form.register('avg_engagement_rate')}
          />
          {form.formState.errors.avg_engagement_rate && (
            <p className="text-sm text-destructive">{form.formState.errors.avg_engagement_rate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate_per_post">Rate Per Post ($)</Label>
          <Input
            id="rate_per_post"
            type="number"
            min="0"
            step="0.01"
            placeholder="500"
            {...form.register('rate_per_post')}
          />
          {form.formState.errors.rate_per_post && (
            <p className="text-sm text-destructive">{form.formState.errors.rate_per_post.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Any notes about this influencer..." rows={3} {...form.register('notes')} />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  )
}
