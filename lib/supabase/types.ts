export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          company_name: string | null
          avatar_url: string | null
          role: 'brand' | 'admin' | 'influencer' | 'super_admin'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          company_name?: string | null
          avatar_url?: string | null
          role?: 'brand' | 'admin' | 'super_admin'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          company_name?: string | null
          avatar_url?: string | null
          role?: 'brand' | 'admin' | 'super_admin'
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          brand_id: string
          title: string
          description: string | null
          budget: number
          start_date: string | null
          end_date: string | null
          status: 'draft' | 'active' | 'completed' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          title: string
          description?: string | null
          budget?: number
          start_date?: string | null
          end_date?: string | null
          status?: 'draft' | 'active' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          title?: string
          description?: string | null
          budget?: number
          start_date?: string | null
          end_date?: string | null
          status?: 'draft' | 'active' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      influencers: {
        Row: {
          id: string
          brand_id: string
          name: string
          email: string | null
          instagram_handle: string | null
          tiktok_handle: string | null
          youtube_handle: string | null
          niche: string | null
          follower_count: number
          avg_engagement_rate: number
          location: string | null
          rate_per_post: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          email?: string | null
          instagram_handle?: string | null
          tiktok_handle?: string | null
          youtube_handle?: string | null
          niche?: string | null
          follower_count?: number
          avg_engagement_rate?: number
          location?: string | null
          rate_per_post?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          email?: string | null
          instagram_handle?: string | null
          tiktok_handle?: string | null
          youtube_handle?: string | null
          niche?: string | null
          follower_count?: number
          avg_engagement_rate?: number
          location?: string | null
          rate_per_post?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaign_influencers: {
        Row: {
          id: string
          campaign_id: string
          influencer_id: string
          status: 'outreach' | 'product_sent' | 'content_pending' | 'live' | 'paid'
          portal_token: string
          product_tracking_number: string | null
          agreed_rate: number
          post_url: string | null
          post_screenshot_url: string | null
          post_screenshot_taken_at: string | null
          views: number
          engagement: number
          payment_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          influencer_id: string
          status?: 'outreach' | 'product_sent' | 'content_pending' | 'live' | 'paid'
          portal_token?: string
          product_tracking_number?: string | null
          agreed_rate?: number
          post_url?: string | null
          post_screenshot_url?: string | null
          post_screenshot_taken_at?: string | null
          views?: number
          engagement?: number
          payment_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          influencer_id?: string
          status?: 'outreach' | 'product_sent' | 'content_pending' | 'live' | 'paid'
          portal_token?: string
          product_tracking_number?: string | null
          agreed_rate?: number
          post_url?: string | null
          post_screenshot_url?: string | null
          post_screenshot_taken_at?: string | null
          views?: number
          engagement?: number
          payment_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_drafts: {
        Row: {
          id: string
          campaign_influencer_id: string
          file_url: string
          file_type: 'image' | 'video'
          caption_draft: string | null
          status: 'pending_review' | 'approved' | 'revision_requested'
          brand_feedback: string | null
          submitted_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          campaign_influencer_id: string
          file_url: string
          file_type: 'image' | 'video'
          caption_draft?: string | null
          status?: 'pending_review' | 'approved' | 'revision_requested'
          brand_feedback?: string | null
          submitted_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          campaign_influencer_id?: string
          file_url?: string
          file_type?: 'image' | 'video'
          caption_draft?: string | null
          status?: 'pending_review' | 'approved' | 'revision_requested'
          brand_feedback?: string | null
          submitted_at?: string
          reviewed_at?: string | null
        }
      }
      post_submissions: {
        Row: {
          id: string
          campaign_influencer_id: string
          post_url: string
          verified: boolean
          submitted_at: string
        }
        Insert: {
          id?: string
          campaign_influencer_id: string
          post_url: string
          verified?: boolean
          submitted_at?: string
        }
        Update: {
          id?: string
          campaign_influencer_id?: string
          post_url?: string
          verified?: boolean
          submitted_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          campaign_influencer_id: string
          campaign_id: string
          amount: number
          note: string | null
          post_url: string | null
          paid_at: string
        }
        Insert: {
          id?: string
          campaign_influencer_id: string
          campaign_id: string
          amount: number
          note?: string | null
          post_url?: string | null
          paid_at?: string
        }
        Update: {
          id?: string
          campaign_influencer_id?: string
          campaign_id?: string
          amount?: number
          note?: string | null
          post_url?: string | null
          paid_at?: string
        }
      }
      campaign_analytics: {
        Row: {
          id: string
          campaign_id: string
          total_spend: number
          total_views: number
          total_engagements: number
          cpm: number
          cpe: number
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          total_spend?: number
          total_views?: number
          total_engagements?: number
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          total_spend?: number
          total_views?: number
          total_engagements?: number
          updated_at?: string
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type Influencer = Database['public']['Tables']['influencers']['Row']
export type CampaignInfluencer = Database['public']['Tables']['campaign_influencers']['Row']
export type ContentDraft = Database['public']['Tables']['content_drafts']['Row']
export type PostSubmission = Database['public']['Tables']['post_submissions']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type CampaignAnalytics = Database['public']['Tables']['campaign_analytics']['Row']

export type CampaignStatus = Campaign['status']
export type CampaignInfluencerStatus = CampaignInfluencer['status']
export type ContentDraftStatus = ContentDraft['status']

// Extended types with joins
export type CampaignInfluencerWithDetails = CampaignInfluencer & {
  influencer: Influencer
  campaign: Campaign
  content_drafts: ContentDraft[]
}

export type CampaignWithStats = Campaign & {
  campaign_influencers: { status: CampaignInfluencerStatus }[]
  campaign_analytics: CampaignAnalytics | null
}
