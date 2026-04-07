'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { recordPayment } from '@/lib/payments'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import type { Payment } from '@/lib/supabase/types'
import { CircleDollarSign, Loader2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

interface RecordPaymentDialogProps {
  campaignInfluencerId: string
  campaignId: string
  influencerName: string
  agreedRate: number
  payments: Payment[]
}

export function RecordPaymentDialog({
  campaignInfluencerId,
  campaignId,
  influencerName,
  agreedRate,
  payments,
}: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(agreedRate)
  const [note, setNote] = useState('')
  const [postUrl, setPostUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)

  const handlePay = async () => {
    if (amount <= 0) {
      toast.error('Amount must be greater than zero')
      return
    }
    setIsLoading(true)
    const result = await recordPayment(
      supabase,
      campaignInfluencerId,
      campaignId,
      amount,
      note,
      postUrl
    )

    if (result.success) {
      toast.success(result.message)
      setNote('')
      setPostUrl('')
      setAmount(agreedRate)
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.message)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1">
          <CircleDollarSign className="h-3.5 w-3.5" />
          Pay
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Record Payment — {influencerName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Payment history */}
          {payments.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Payment History ({payments.length})</p>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-1.5 last:pb-0">
                  <div className="min-w-0">
                    <span className="font-medium">{formatCurrency(p.amount)}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {format(new Date(p.paid_at), 'MMM d, yyyy')}
                    </span>
                    {p.note && (
                      <p className="text-xs text-muted-foreground truncate">{p.note}</p>
                    )}
                  </div>
                  {p.post_url && (
                    <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="shrink-0 ml-2">
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    </a>
                  )}
                </div>
              ))}
              </div>
              <div className="flex justify-between text-sm pt-1.5 border-t font-medium">
                <span>Total Paid</span>
                <span className="text-emerald-600">{formatCurrency(totalPaid)}</span>
              </div>
            </div>
          )}

          {/* New payment form */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($) *</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Agreed rate: {formatCurrency(agreedRate)} per post
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="post_url">Post URL (optional)</Label>
            <Input
              id="post_url"
              placeholder="https://instagram.com/p/..."
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="e.g. Payment for 2nd Instagram reel"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button onClick={handlePay} disabled={isLoading || amount <= 0} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleDollarSign className="h-4 w-4" />}
            Pay {formatCurrency(amount)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
