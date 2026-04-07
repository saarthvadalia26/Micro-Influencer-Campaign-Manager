'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Profile } from '@/lib/supabase/types'
import { Loader2, Save } from 'lucide-react'

interface ProfileFormProps {
  profile: Profile | null
  email: string
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [companyName, setCompanyName] = useState(profile?.company_name ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, company_name: companyName })
      .eq('id', profile?.id ?? '')

    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated!')
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={email} disabled className="opacity-60" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Smith"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Inc."
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </Button>
    </form>
  )
}
