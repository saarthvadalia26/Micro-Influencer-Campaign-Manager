import { z } from 'zod'

export const influencerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  instagram_handle: z.string().max(50).optional().or(z.literal('')),
  tiktok_handle: z.string().max(50).optional().or(z.literal('')),
  youtube_handle: z.string().max(100).optional().or(z.literal('')),
  niche: z.string().max(50).optional().or(z.literal('')),
  follower_count: z.coerce.number().min(0, 'Must be positive').default(0),
  avg_engagement_rate: z.coerce.number().min(0).max(100, 'Max 100%').default(0),
  location: z.string().max(100).optional().or(z.literal('')),
  rate_per_post: z.coerce.number().min(0, 'Must be positive').default(0),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

export type InfluencerFormValues = z.infer<typeof influencerSchema>
