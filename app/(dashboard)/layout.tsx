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
import { SignOutButton } from '@/components/SignOutButton'

const baseNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/influencers', label: 'Influencers', icon: Users },
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

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? 'U'

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card hidden lg:flex flex-col z-30">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-lg">
              🚀
            </div>
            <div>
              <p className="font-semibold text-sm leading-none">Influencer Manager</p>
              {profile?.company_name && (
                <p className="text-xs text-muted-foreground mt-0.5">{profile.company_name}</p>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors group"
              >
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
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
              <SignOutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <span className="font-semibold text-sm">Influencer Manager</span>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </Link>
            )
          })}
          <SignOutButton iconOnly />
        </nav>
      </header>

      {/* Main content */}
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
