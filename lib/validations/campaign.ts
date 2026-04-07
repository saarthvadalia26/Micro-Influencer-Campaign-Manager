import { z } from 'zod'

export const campaignSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional().or(z.literal('')),
  budget: z.coerce.number().min(0, 'Budget must be positive'),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
})

export type CampaignFormValues = z.infer<typeof campaignSchema>

export const addInfluencerToCampaignSchema = z.object({
  influencer_id: z.string().uuid('Select an influencer'),
  agreed_rate: z.coerce.number().min(0, 'Rate must be positive'),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

export type AddInfluencerFormValues = z.infer<typeof addInfluencerToCampaignSchema>

export const campaignInfluencerUpdateSchema = z.object({
  status: z.enum(['outreach', 'product_sent', 'content_pending', 'live', 'paid']),
  product_tracking_number: z.string().optional().or(z.literal('')),
  post_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  views: z.coerce.number().min(0).optional(),
  engagement: z.coerce.number().min(0).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

export type CampaignInfluencerUpdateValues = z.infer<typeof campaignInfluencerUpdateSchema>
