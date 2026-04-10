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
import { Loader2, UserPlus } from 'lucide-react'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setIsLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company_name: companyName },
      },
    })
    if (error) {
      toast.error(error.message)
    } else if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        company_name: companyName,
        role: 'brand',
      })
      toast.success('Account created! Redirecting...')
      router.push('/')
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="relative rounded-2xl border border-rose-300/[0.1] bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-rose-200/[0.05]">
      {/* Warm top border glow */}
      <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />

      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Create Account</h2>
          <p className="text-sm text-rose-200/40 mt-1">It only takes a minute to get started</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm text-rose-100/60">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/20 focus:border-rose-400/50 focus:ring-rose-400/20 transition-colors h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm text-rose-100/60">Company</Label>
              <Input
                id="companyName"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/20 focus:border-rose-400/50 focus:ring-rose-400/20 transition-colors h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-rose-100/60">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/20 focus:border-rose-400/50 focus:ring-rose-400/20 transition-colors h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-rose-100/60">Password</Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/20 focus:border-rose-400/50 focus:ring-rose-400/20 transition-colors h-11"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 hover:from-pink-400 hover:via-rose-400 hover:to-orange-400 text-white font-medium shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300 border-0"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create Account
          </Button>
        </form>
      </div>

      <div className="border-t border-white/[0.06] px-8 py-4 text-center">
        <p className="text-sm text-rose-200/35">
          Already have an account?{' '}
          <Link href="/login" className="text-rose-400 hover:text-rose-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
