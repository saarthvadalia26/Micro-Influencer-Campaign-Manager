'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { campaignSchema, type CampaignFormValues } from '@/lib/validations/campaign'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Campaign } from '@/lib/supabase/types'
import { Loader2 } from 'lucide-react'

interface CampaignFormProps {
  defaultValues?: Partial<Campaign>
  onSubmit: (values: CampaignFormValues) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function CampaignForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'Save Campaign',
}: CampaignFormProps) {
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      budget: defaultValues?.budget ?? 0,
      start_date: defaultValues?.start_date ?? '',
      end_date: defaultValues?.end_date ?? '',
      status: defaultValues?.status ?? 'draft',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Campaign Title *</Label>
        <Input id="title" placeholder="e.g. Summer Launch 2024" {...form.register('title')} />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Campaign brief, deliverables, and requirements..."
          rows={4}
          {...form.register('description')}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Total Budget ($) *</Label>
          <Input
            id="budget"
            type="number"
            min="0"
            step="0.01"
            placeholder="5000"
            {...form.register('budget')}
          />
          {form.formState.errors.budget && (
            <p className="text-sm text-destructive">{form.formState.errors.budget.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            defaultValue={defaultValues?.status ?? 'draft'}
            onValueChange={(val) => form.setValue('status', val as CampaignFormValues['status'])}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input id="start_date" type="date" {...form.register('start_date')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input id="end_date" type="date" {...form.register('end_date')} />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  )
}
