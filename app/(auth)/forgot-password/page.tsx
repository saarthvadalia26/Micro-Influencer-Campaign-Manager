'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
    setIsLoading(false)
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/[0.05]">
        <div className="flex flex-col items-center py-10 px-8 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-violet-300/50 text-sm max-w-sm">
            We&apos;ve sent a password reset link to <strong className="text-white">{email}</strong>.
            Click the link in the email to reset your password.
          </p>
          <Link href="/login" className="text-violet-400 hover:text-violet-300 text-sm mt-6 font-medium transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/[0.05]">
      <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Forgot Password</h2>
          <p className="text-sm text-violet-300/50 mt-1">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-violet-200/70">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-400/50 focus:ring-violet-400/20 transition-colors h-11"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:from-fuchsia-400 hover:to-violet-500 text-white font-medium shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all duration-300 border-0"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Send Reset Link
          </Button>
        </form>
      </div>

      <div className="border-t border-white/[0.06] px-8 py-4 text-center">
        <p className="text-sm text-violet-300/40">
          Remember your password?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
