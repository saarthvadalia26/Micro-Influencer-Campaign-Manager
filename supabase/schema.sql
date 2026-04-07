-- ============================================================
-- Micro-Influencer Campaign Manager — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase Auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'brand' CHECK (role IN ('brand', 'admin', 'influencer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profile creation is handled in app code (signup page) instead of a trigger
-- to avoid "Database error saving new user" issues.

-- ============================================================
-- CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INFLUENCERS
-- ============================================================
CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_handle TEXT,
  niche TEXT,
  follower_count INTEGER DEFAULT 0,
  avg_engagement_rate NUMERIC(5, 2) DEFAULT 0,
  location TEXT,
  rate_per_post NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CAMPAIGN <> INFLUENCER JUNCTION
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_influencers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'outreach' CHECK (
    status IN ('outreach', 'product_sent', 'content_pending', 'live', 'paid')
  ),
  portal_token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  product_tracking_number TEXT,
  agreed_rate NUMERIC(12, 2) DEFAULT 0,
  post_url TEXT,
  post_screenshot_url TEXT,
  post_screenshot_taken_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  payment_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, influencer_id)
);

-- ============================================================
-- CONTENT DRAFTS
-- ============================================================
CREATE TABLE IF NOT EXISTS content_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_influencer_id UUID NOT NULL REFERENCES campaign_influencers(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  caption_draft TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (
    status IN ('pending_review', 'approved', 'revision_requested')
  ),
  brand_feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ============================================================
-- POST SUBMISSIONS (multiple posts per influencer per campaign)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_influencer_id UUID NOT NULL REFERENCES campaign_influencers(id) ON DELETE CASCADE,
  post_url TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS (supports multiple payments per influencer)
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_influencer_id UUID NOT NULL REFERENCES campaign_influencers(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  note TEXT,
  post_url TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CAMPAIGN ANALYTICS
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL UNIQUE REFERENCES campaigns(id) ON DELETE CASCADE,
  total_spend NUMERIC(12, 2) DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_engagements INTEGER DEFAULT 0,
  cpm NUMERIC(10, 4) GENERATED ALWAYS AS (
    CASE WHEN total_views > 0 THEN (total_spend / total_views) * 1000 ELSE 0 END
  ) STORED,
  cpe NUMERIC(10, 4) GENERATED ALWAYS AS (
    CASE WHEN total_engagements > 0 THEN total_spend / total_engagements ELSE 0 END
  ) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER influencers_updated_at BEFORE UPDATE ON influencers FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER campaign_influencers_updated_at BEFORE UPDATE ON campaign_influencers FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER campaign_analytics_updated_at BEFORE UPDATE ON campaign_analytics FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles: users manage their own
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Campaigns: brands see only their own
CREATE POLICY "campaigns_select_own" ON campaigns FOR SELECT USING (auth.uid() = brand_id);
CREATE POLICY "campaigns_insert_own" ON campaigns FOR INSERT WITH CHECK (auth.uid() = brand_id);
CREATE POLICY "campaigns_update_own" ON campaigns FOR UPDATE USING (auth.uid() = brand_id);
CREATE POLICY "campaigns_delete_own" ON campaigns FOR DELETE USING (auth.uid() = brand_id);

-- Influencers: brands see only their own
CREATE POLICY "influencers_select_own" ON influencers FOR SELECT USING (auth.uid() = brand_id);
CREATE POLICY "influencers_insert_own" ON influencers FOR INSERT WITH CHECK (auth.uid() = brand_id);
CREATE POLICY "influencers_update_own" ON influencers FOR UPDATE USING (auth.uid() = brand_id);
CREATE POLICY "influencers_delete_own" ON influencers FOR DELETE USING (auth.uid() = brand_id);

-- Campaign influencers: via campaign ownership
CREATE POLICY "campaign_influencers_select_own" ON campaign_influencers FOR SELECT
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_influencers.campaign_id AND campaigns.brand_id = auth.uid()));
CREATE POLICY "campaign_influencers_insert_own" ON campaign_influencers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_influencers.campaign_id AND campaigns.brand_id = auth.uid()));
CREATE POLICY "campaign_influencers_update_own" ON campaign_influencers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_influencers.campaign_id AND campaigns.brand_id = auth.uid()));
CREATE POLICY "campaign_influencers_delete_own" ON campaign_influencers FOR DELETE
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_influencers.campaign_id AND campaigns.brand_id = auth.uid()));

-- Portal access: authenticated users can read campaign_influencers by token
CREATE POLICY "campaign_influencers_portal_select" ON campaign_influencers FOR SELECT
  USING (auth.uid() IS NOT NULL AND portal_token IS NOT NULL);

-- Content drafts: authenticated users can insert and read
CREATE POLICY "content_drafts_auth_insert" ON content_drafts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "content_drafts_auth_select" ON content_drafts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Content drafts: brand can update (approve/reject)
CREATE POLICY "content_drafts_brand_update" ON content_drafts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM campaign_influencers ci
    JOIN campaigns c ON c.id = ci.campaign_id
    WHERE ci.id = content_drafts.campaign_influencer_id AND c.brand_id = auth.uid()
  ));

-- Analytics: brand can see and update own campaigns
CREATE POLICY "analytics_select_own" ON campaign_analytics FOR SELECT
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_analytics.campaign_id AND campaigns.brand_id = auth.uid()));
CREATE POLICY "analytics_insert_own" ON campaign_analytics FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_analytics.campaign_id AND campaigns.brand_id = auth.uid()));
CREATE POLICY "analytics_update_own" ON campaign_analytics FOR UPDATE
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_analytics.campaign_id AND campaigns.brand_id = auth.uid()));

-- Payments: brand can manage payments for own campaigns
CREATE POLICY "payments_select_own" ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = payments.campaign_id AND campaigns.brand_id = auth.uid()));
CREATE POLICY "payments_insert_own" ON payments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = payments.campaign_id AND campaigns.brand_id = auth.uid()));
CREATE POLICY "payments_delete_own" ON payments FOR DELETE
  USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = payments.campaign_id AND campaigns.brand_id = auth.uid()));

-- Post submissions: authenticated users can insert, brand can select/update
CREATE POLICY "post_submissions_auth_insert" ON post_submissions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "post_submissions_auth_select" ON post_submissions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "post_submissions_auth_update" ON post_submissions
  FOR UPDATE TO authenticated USING (true);

-- ============================================================
-- STORAGE BUCKET for content drafts
-- ============================================================
-- Create bucket: Supabase Dashboard > Storage > Create bucket "content-drafts" (public for reading)

-- Storage policies: only authenticated users can upload
CREATE POLICY "auth_upload_content_drafts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'content-drafts' AND auth.uid() IS NOT NULL);

CREATE POLICY "public_read_content_drafts" ON storage.objects
  FOR SELECT USING (bucket_id = 'content-drafts');

-- ============================================================
-- STORAGE BUCKET for post screenshots
-- ============================================================
-- Create bucket: Supabase Dashboard > Storage > Create bucket "post-screenshots" (public for reading)

CREATE POLICY "auth_upload_post_screenshots" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-screenshots' AND auth.uid() IS NOT NULL);

CREATE POLICY "public_read_post_screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-screenshots');

CREATE POLICY "auth_delete_post_screenshots" ON storage.objects
  FOR DELETE USING (bucket_id = 'post-screenshots' AND auth.uid() IS NOT NULL);
