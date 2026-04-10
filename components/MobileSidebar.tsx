'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LayoutDashboard, Megaphone, Users, LogOut, Settings, Menu, ShieldCheck, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Logo } from '@/components/Logo'

type IconKey = 'dashboard' | 'campaigns' | 'influencers' | 'admin'

const iconMap = {
  dashboard: LayoutDashboard,
  campaigns: Megaphone,
  influencers: Users,
  admin: ShieldCheck,
}

export type MobileNavItem = {
  href: string
  label: string
  icon: IconKey
}

type Props = {
  navItems: MobileNavItem[]
  profile: {
    full_name?: string | null
    company_name?: string | null
    avatar_url?: string | null
  } | null
  userEmail: string
  initials: string
}

export function MobileSidebar({ navItems, profile, userEmail, initials }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 border-b border-white/[0.08] bg-white/[0.03] backdrop-blur-xl px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => setOpen(true)}
          className="p-2 -ml-2 rounded-md hover:bg-white/[0.06] transition-all duration-300 active:scale-95"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="font-semibold text-sm text-gradient-brand">Influencer Manager</span>
        </div>
        <div className="w-9" />
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-72 max-w-[80vw] bg-white/[0.03] backdrop-blur-xl border-r border-white/[0.08] z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <div>
              <p className="font-semibold text-sm leading-none text-gradient-brand">Influencer Manager</p>
              {profile?.company_name && (
                <p className="text-xs text-muted-foreground mt-0.5">{profile.company_name}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-md hover:bg-white/[0.06] transition-all duration-300 active:scale-95"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-300 group ${
                  isActive
                    ? 'bg-white/[0.06] text-white'
                    : 'hover:bg-white/[0.04] text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-all duration-300 ${
                    isActive
                      ? 'text-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                {isActive ? (
                  <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent font-medium">
                    {item.label}
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            )
          })}
          {(() => {
            const isSettingsActive = pathname.startsWith('/settings')
            return (
              <Link
                href="/settings"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-300 group ${
                  isSettingsActive
                    ? 'bg-white/[0.06] text-white'
                    : 'hover:bg-white/[0.04] text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings
                  className={`h-4 w-4 transition-all duration-300 ${
                    isSettingsActive
                      ? 'text-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                {isSettingsActive ? (
                  <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent font-medium">
                    Settings
                  </span>
                ) : (
                  'Settings'
                )}
              </Link>
            )
          })()}

          <div className="pt-4">
            <p className="px-3 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Theme</p>
            <ThemeToggle variant="full" />
          </div>
        </nav>

        <div className="p-4 border-t border-white/[0.08] space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-9 w-9">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name ?? 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
