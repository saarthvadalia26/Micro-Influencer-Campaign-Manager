'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Loader2, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      router.push('/')
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/[0.05]">
      {/* Subtle top glow */}
      <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Sign In</h2>
          <p className="text-sm text-violet-300/50 mt-1">Enter your credentials to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm text-violet-200/70">Password</Label>
              <Link href="/forgot-password" className="text-xs text-violet-400/70 hover:text-violet-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-400/50 focus:ring-violet-400/20 transition-colors h-11"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:from-fuchsia-400 hover:to-violet-500 text-white font-medium shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all duration-300 border-0"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Sign In
          </Button>
        </form>
      </div>

      <div className="border-t border-white/[0.06] px-8 py-4 text-center">
        <p className="text-sm text-violet-300/40">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
