'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { toast } from 'sonner'

export function SignOutButton({ iconOnly }: { iconOnly?: boolean }) {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const supabase = createClient()

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isSigningOut) return
    setIsSigningOut(true)
    toast.info('Signing out...')

    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch {
      // Continue even if signout fails
    }

    window.location.href = '/login'
  }

  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        title="Sign out"
        disabled={isSigningOut}
      >
        {isSigningOut ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <LogOut className="h-5 w-5" />
        )}
      </Button>
    )
  }

  return (
    <DropdownMenuItem
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
    >
      {isSigningOut ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4 mr-2" />
      )}
      {isSigningOut ? 'Signing Out...' : 'Sign Out'}
    </DropdownMenuItem>
  )
}
