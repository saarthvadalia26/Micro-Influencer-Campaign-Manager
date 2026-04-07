'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addInfluencerToCampaignSchema, type AddInfluencerFormValues } from '@/lib/validations/campaign'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Influencer } from '@/lib/supabase/types'
import { UserPlus, Search, Loader2 } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface AddInfluencerDialogProps {
  campaignId: string
  influencers: Influencer[]
  onAdd: (values: AddInfluencerFormValues) => Promise<void>
}

export function AddInfluencerDialog({ campaignId: _campaignId, influencers, onAdd }: AddInfluencerDialogProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Influencer | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<AddInfluencerFormValues>({
    resolver: zodResolver(addInfluencerToCampaignSchema),
    defaultValues: { influencer_id: '', agreed_rate: 0, notes: '' },
  })

  const filtered = influencers.filter(
    (inf) =>
      inf.name.toLowerCase().includes(search.toLowerCase()) ||
      (inf.instagram_handle ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (inf.niche ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (inf: Influencer) => {
    setSelected(inf)
    form.setValue('influencer_id', inf.id)
    form.setValue('agreed_rate', inf.rate_per_post)
  }

  const handleSubmit = async (values: AddInfluencerFormValues) => {
    setIsLoading(true)
    try {
      await onAdd(values)
      setOpen(false)
      form.reset()
      setSelected(null)
      setSearch('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4" />
          Add Influencer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Influencer to Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Influencer</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, handle, or niche..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {form.formState.errors.influencer_id && (
              <p className="text-sm text-destructive">{form.formState.errors.influencer_id.message}</p>
            )}

            <div className="border rounded-md max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground text-center">No influencers found</p>
              ) : (
                filtered.map((inf) => (
                  <button
                    key={inf.id}
                    type="button"
                    onClick={() => handleSelect(inf)}
                    className={`w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-0 ${
                      selected?.id === inf.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{inf.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {inf.niche} • {formatNumber(inf.follower_count)} followers
                        </p>
                      </div>
                      <span className="text-xs font-medium text-emerald-600">
                        {formatCurrency(inf.rate_per_post)}/post
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {selected && (
            <div className="space-y-2">
              <Label htmlFor="agreed_rate">Agreed Rate ($)</Label>
              <Input
                id="agreed_rate"
                type="number"
                min="0"
                step="0.01"
                {...form.register('agreed_rate')}
              />
              {form.formState.errors.agreed_rate && (
                <p className="text-sm text-destructive">{form.formState.errors.agreed_rate.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" placeholder="Any notes for this collaboration..." {...form.register('notes')} />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selected}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Add to Campaign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
