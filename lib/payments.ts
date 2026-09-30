import type { SupabaseClient } from '@supabase/supabase-js'

export interface PaymentResult {
  success: boolean
  message: string
  amountPaid?: number
}

/**
 * Record a payment to an influencer.
 * - Checks if campaign has enough budget
 * - Deducts amount from campaign budget
 * - Creates a row in the payments table
 * - Supports multiple payments per influencer
 */
export async function recordPayment(
  supabase: any,
  campaignInfluencerId: string,
  campaignId: string,
  amount: number,
  note?: string,
  postUrl?: string
): Promise<PaymentResult> {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return { success: false, message: 'Payment amount must be greater than zero' }
  }

  // 1. Try atomic PostgreSQL function first (prevents race conditions and lost updates)
  try {
    const { data, error } = await supabase.rpc('record_campaign_payment', {
      p_campaign_influencer_id: campaignInfluencerId,
      p_campaign_id: campaignId,
      p_amount: amount,
      p_note: note || null,
      p_post_url: postUrl || null,
    })

    if (!error && data) {
      return data as PaymentResult
    }
  } catch {
    // Fall back to direct queries if RPC is not yet executed in Supabase SQL editor
  }

  // 2. Direct fallback
  const { data: campaign, error: campError } = await supabase
    .from('campaigns')
    .select('id, budget')
    .eq('id', campaignId)
    .single()

  if (campError || !campaign) {
    return { success: false, message: 'Could not find campaign' }
  }

  if (campaign.budget < amount) {
    return {
      success: false,
      message: `Insufficient budget. Need $${amount.toFixed(2)} but only $${campaign.budget.toFixed(2)} remaining.`,
    }
  }

  const newBudget = campaign.budget - amount
  const { error: budgetError } = await supabase
    .from('campaigns')
    .update({ budget: newBudget })
    .eq('id', campaign.id)

  if (budgetError) {
    return { success: false, message: 'Failed to deduct from campaign budget' }
  }

  const { error: payError } = await supabase.from('payments').insert({
    campaign_influencer_id: campaignInfluencerId,
    campaign_id: campaignId,
    amount,
    note: note || null,
    post_url: postUrl || null,
  })

  if (payError) {
    // Rollback budget
    await supabase
      .from('campaigns')
      .update({ budget: campaign.budget })
      .eq('id', campaign.id)
    return { success: false, message: 'Failed to record payment. Budget was not deducted.' }
  }

  await supabase
    .from('campaign_influencers')
    .update({ status: 'paid', payment_date: new Date().toISOString() })
    .eq('id', campaignInfluencerId)

  return {
    success: true,
    message: `Paid $${amount.toFixed(2)} successfully`,
    amountPaid: amount,
  }
}

