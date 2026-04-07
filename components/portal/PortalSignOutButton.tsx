'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function PortalSignOutButton({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      <LogOut className="h-3.5 w-3.5" />
      Sign Out
    </Button>
  )
}
