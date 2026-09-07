'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function PortalSignOutButton({ redirectTo }: { redirectTo: string }) {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    toast.info('Signing out...')

    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch {
      // Continue even if remote network fails
    }

    window.location.href = redirectTo
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
      {isSigningOut ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <LogOut className="h-3.5 w-3.5" />
      )}
      {isSigningOut ? 'Signing Out...' : 'Sign Out'}
    </Button>
  )
}
