'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getCPMEfficiency } from '@/lib/utils'
import type { CampaignAnalytics } from '@/lib/supabase/types'
import { TrendingUp, Eye, Heart, DollarSign, Save, Loader2 } from 'lucide-react'

interface ROICalculatorProps {
  campaignId: string
  analytics: CampaignAnalytics | null
  niche?: string
}

export function ROICalculator({ campaignId, analytics, niche }: ROICalculatorProps) {
  const [spend, setSpend] = useState(analytics?.total_spend ?? 0)
  const [views, setViews] = useState(analytics?.total_views ?? 0)
  const [engagements, setEngagements] = useState(analytics?.total_engagements ?? 0)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setSpend(analytics?.total_spend ?? 0)
    setViews(analytics?.total_views ?? 0)
    setEngagements(analytics?.total_engagements ?? 0)
  }, [analytics])

  const cpm = views > 0 ? (spend / views) * 1000 : 0
  const cpe = engagements > 0 ? spend / engagements : 0
  const efficiency = cpm > 0 ? getCPMEfficiency(cpm, niche) : null

  const efficiencyConfig = {
    green: { label: 'Excellent ROI', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', desc: 'CPM is below industry benchmark — great efficiency!' },
    yellow: { label: 'Average ROI', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', desc: 'CPM is within acceptable range.' },
    red: { label: 'Poor ROI', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', desc: 'CPM exceeds industry benchmark — consider optimizing.' },
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (analytics?.id) {
        const { error } = await supabase
          .from('campaign_analytics')
          .update({
            total_spend: spend,
            total_views: views,
            total_engagements: engagements,
            updated_at: new Date().toISOString(),
          })
          .eq('campaign_id', campaignId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('campaign_analytics').insert({
          campaign_id: campaignId,
          total_spend: spend,
          total_views: views,
          total_engagements: engagements,
        })
        if (error) throw error
      }
      toast.success('Analytics saved successfully')
    } catch {
      toast.error('Failed to save analytics')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          ROI Calculator
        </CardTitle>
        <CardDescription>Track campaign performance and cost efficiency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs">
              <DollarSign className="h-3.5 w-3.5" />
              Total Spend ($)
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={spend}
              onChange={(e) => setSpend(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs">
              <Eye className="h-3.5 w-3.5" />
              Total Views
            </Label>
            <Input
              type="number"
              min="0"
              value={views}
              onChange={(e) => setViews(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs">
              <Heart className="h-3.5 w-3.5" />
              Total Engagements
            </Label>
            <Input
              type="number"
              min="0"
              value={engagements}
              onChange={(e) => setEngagements(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">CPM</p>
            <p className="text-lg font-bold">{formatCurrency(cpm)}</p>
            <p className="text-xs text-muted-foreground">per 1K views</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">CPE</p>
            <p className="text-lg font-bold">{formatCurrency(cpe)}</p>
            <p className="text-xs text-muted-foreground">per engagement</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground mb-1">Efficiency Score</p>
            {efficiency ? (
              <>
                <Badge className={`${efficiencyConfig[efficiency].className} text-xs`}>
                  {efficiencyConfig[efficiency].label}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {efficiencyConfig[efficiency].desc}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Enter data above</p>
            )}
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full" size="sm">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Analytics
        </Button>
      </CardContent>
    </Card>
  )
}
