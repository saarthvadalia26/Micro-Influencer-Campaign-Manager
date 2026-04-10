import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LayoutDashboard, Megaphone, Users, LogOut, Settings, Menu, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { SignOutButton } from '@/components/SignOutButton'
import { MobileSidebar, type MobileNavItem } from '@/components/MobileSidebar'
import { ThemeMenuItems } from '@/components/ThemeMenuItems'
import { SidebarNav } from '@/components/SidebarNav'
import { PageTransition } from '@/components/PageTransition'

const baseNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/influencers', label: 'Influencers', icon: Users },
]

const baseMobileNavItems: MobileNavItem[] = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/campaigns', label: 'Campaigns', icon: 'campaigns' },
  { href: '/influencers', label: 'Influencers', icon: 'influencers' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  const isSuperAdmin = (profile as { role?: string } | null)?.role === 'super_admin'
  const navItems = isSuperAdmin
    ? [...baseNavItems, { href: '/admin', label: 'Super Admin', icon: ShieldCheck }]
    : baseNavItems
  const mobileNavItems: MobileNavItem[] = isSuperAdmin
    ? [...baseMobileNavItems, { href: '/admin', label: 'Super Admin', icon: 'admin' }]
    : baseMobileNavItems

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? 'U'

  return (
    <div className="min-h-screen bg-background relative">
      {/* Atmospheric radial gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-indigo-600/[0.15] blur-[150px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full bg-violet-700/[0.15] blur-[150px] translate-x-1/4 translate-y-1/4" />
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-white/[0.08] bg-white/[0.03] backdrop-blur-xl hidden lg:flex flex-col z-30">
        <div className="p-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <div>
              <p className="font-semibold text-sm leading-none text-gradient-brand">Influencer Manager</p>
              {profile?.company_name && (
                <p className="text-xs text-muted-foreground mt-0.5">{profile.company_name}</p>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <SidebarNav items={navItems} />
        </nav>

        <div className="p-4 border-t border-white/[0.08]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full rounded-md px-3 py-2 hover:bg-muted transition-colors text-left">
                <Avatar className="h-8 w-8">
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile?.full_name ?? 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ThemeMenuItems />
              <DropdownMenuSeparator />
              <SignOutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile sidebar + header */}
      <MobileSidebar
        navItems={mobileNavItems}
        profile={profile as { full_name?: string | null; company_name?: string | null; avatar_url?: string | null } | null}
        userEmail={user.email ?? ''}
        initials={initials}
      />

      {/* Main content */}
      <main className="lg:pl-64 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  )
}
