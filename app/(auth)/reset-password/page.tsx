'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Loader2, KeyRound } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setHasSession(!!session)
      setChecking(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasSession(true)
        setChecking(false)
      }
    })

    checkSession()
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated! Redirecting to sign in...')
      await supabase.auth.signOut()
      setTimeout(() => router.push('/login'), 1500)
    }
    setIsLoading(false)
  }

  if (checking) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/[0.05]">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/[0.05]">
        <div className="flex flex-col items-center py-10 px-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Invalid or Expired Link</h2>
          <p className="text-violet-300/50 text-sm max-w-sm mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/forgot-password" className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
            Request new link
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
          <h2 className="text-xl font-semibold text-white">Reset Password</h2>
          <p className="text-sm text-violet-300/50 mt-1">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-violet-200/70">New Password</Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-400/50 focus:ring-violet-400/20 transition-colors h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm text-violet-200/70">Confirm New Password</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-400/50 focus:ring-violet-400/20 transition-colors h-11"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:from-fuchsia-400 hover:to-violet-500 text-white font-medium shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all duration-300 border-0"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Update Password
          </Button>
        </form>
      </div>

      <div className="border-t border-white/[0.06] px-8 py-4 text-center">
        <Link href="/login" className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
