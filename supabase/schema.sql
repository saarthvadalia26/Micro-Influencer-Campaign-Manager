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
  role TEXT NOT NULL DEFAULT 'brand' CHECK (role IN ('brand', 'admin', 'influencer', 'super_admin')),
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

DROP TRIGGER IF EXISTS campaigns_updated_at ON campaigns;
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS influencers_updated_at ON influencers;
CREATE TRIGGER influencers_updated_at BEFORE UPDATE ON influencers FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS campaign_influencers_updated_at ON campaign_influencers;
CREATE TRIGGER campaign_influencers_updated_at BEFORE UPDATE ON campaign_influencers FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS campaign_analytics_updated_at ON campaign_analytics;
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

-- Prevent unauthorized role escalation via profile update
CREATE OR REPLACE FUNCTION protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only allow super_admin to change user roles
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin') THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_protect_profile_role ON profiles;
CREATE TRIGGER trigger_protect_profile_role
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE protect_profile_role();

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

-- Influencer portal access: authenticated creator can read their own assigned record
CREATE POLICY "campaign_influencers_creator_select" ON campaign_influencers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM influencers i
      JOIN auth.users u ON LOWER(u.email) = LOWER(i.email)
      WHERE i.id = campaign_influencers.influencer_id AND u.id = auth.uid()
    )
  );

-- Influencer portal access: creator can submit their live post URL
CREATE POLICY "campaign_influencers_creator_update_post" ON campaign_influencers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM influencers i
      JOIN auth.users u ON LOWER(u.email) = LOWER(i.email)
      WHERE i.id = campaign_influencers.influencer_id AND u.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM influencers i
      JOIN auth.users u ON LOWER(u.email) = LOWER(i.email)
      WHERE i.id = campaign_influencers.influencer_id AND u.id = auth.uid()
    )
  );

-- Content drafts: Brand can view drafts for their campaigns; Influencer can view drafts for their records
CREATE POLICY "content_drafts_select_authorized" ON content_drafts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_influencers ci
      JOIN campaigns c ON c.id = ci.campaign_id
      WHERE ci.id = content_drafts.campaign_influencer_id AND c.brand_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM campaign_influencers ci
      JOIN influencers i ON i.id = ci.influencer_id
      JOIN auth.users u ON LOWER(u.email) = LOWER(i.email)
      WHERE ci.id = content_drafts.campaign_influencer_id AND u.id = auth.uid()
    )
  );

-- Content drafts: Authorized creator or brand can upload drafts
CREATE POLICY "content_drafts_insert_authorized" ON content_drafts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaign_influencers ci
      JOIN campaigns c ON c.id = ci.campaign_id
      WHERE ci.id = content_drafts.campaign_influencer_id AND c.brand_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM campaign_influencers ci
      JOIN influencers i ON i.id = ci.influencer_id
      JOIN auth.users u ON LOWER(u.email) = LOWER(i.email)
      WHERE ci.id = content_drafts.campaign_influencer_id AND u.id = auth.uid()
    )
  );

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

-- Post submissions: authorized brand or creator
CREATE POLICY "post_submissions_select_authorized" ON post_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_influencers ci
      JOIN campaigns c ON c.id = ci.campaign_id
      WHERE ci.id = post_submissions.campaign_influencer_id AND c.brand_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM campaign_influencers ci
      JOIN influencers i ON i.id = ci.influencer_id
      JOIN auth.users u ON LOWER(u.email) = LOWER(i.email)
      WHERE ci.id = post_submissions.campaign_influencer_id AND u.id = auth.uid()
    )
  );

CREATE POLICY "post_submissions_insert_authorized" ON post_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaign_influencers ci
      JOIN campaigns c ON c.id = ci.campaign_id
      WHERE ci.id = post_submissions.campaign_influencer_id AND c.brand_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM campaign_influencers ci
      JOIN influencers i ON i.id = ci.influencer_id
      JOIN auth.users u ON LOWER(u.email) = LOWER(i.email)
      WHERE ci.id = post_submissions.campaign_influencer_id AND u.id = auth.uid()
    )
  );

CREATE POLICY "post_submissions_brand_update" ON post_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaign_influencers ci
      JOIN campaigns c ON c.id = ci.campaign_id
      WHERE ci.id = post_submissions.campaign_influencer_id AND c.brand_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
CREATE POLICY "auth_upload_content_drafts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'content-drafts' AND auth.uid() IS NOT NULL);

CREATE POLICY "public_read_content_drafts" ON storage.objects
  FOR SELECT USING (bucket_id = 'content-drafts');

CREATE POLICY "auth_upload_post_screenshots" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-screenshots' AND auth.uid() IS NOT NULL);

CREATE POLICY "public_read_post_screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-screenshots');

-- Only campaign owner or service role can delete screenshots
CREATE POLICY "brand_delete_post_screenshots" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-screenshots'
    AND auth.uid() IS NOT NULL
  );

-- ============================================================
-- ATOMIC PAYMENT STORED PROCEDURE (Prevents race conditions)
-- ============================================================
CREATE OR REPLACE FUNCTION record_campaign_payment(
  p_campaign_influencer_id UUID,
  p_campaign_id UUID,
  p_amount NUMERIC(12, 2),
  p_note TEXT DEFAULT NULL,
  p_post_url TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_budget NUMERIC(12, 2);
  v_brand_id UUID;
  v_payment_id UUID;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Payment amount must be greater than zero');
  END IF;

  -- Lock the campaign row for update to eliminate concurrent race conditions
  SELECT budget, brand_id INTO v_budget, v_brand_id
  FROM campaigns
  WHERE id = p_campaign_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Campaign not found');
  END IF;

  IF v_brand_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized to record payment for this campaign');
  END IF;

  IF v_budget < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', format('Insufficient budget. Need $%s but only $%s remaining.', p_amount, v_budget)
    );
  END IF;

  -- Deduct from budget atomically
  UPDATE campaigns SET budget = budget - p_amount, updated_at = NOW() WHERE id = p_campaign_id;

  -- Insert payment record
  INSERT INTO payments (campaign_influencer_id, campaign_id, amount, note, post_url, paid_at)
  VALUES (p_campaign_influencer_id, p_campaign_id, p_amount, p_note, p_post_url, NOW())
  RETURNING id INTO v_payment_id;

  -- Update campaign_influencer status
  UPDATE campaign_influencers
  SET status = 'paid', payment_date = NOW(), updated_at = NOW()
  WHERE id = p_campaign_influencer_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', format('Paid $%s successfully', p_amount),
    'amountPaid', p_amount,
    'paymentId', v_payment_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

