'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import { Button } from './ui/button'

export function SignOutButton({ iconOnly }: { iconOnly?: boolean }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (iconOnly) {
    return (
      <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
        <LogOut className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10">
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </DropdownMenuItem>
  )
}
