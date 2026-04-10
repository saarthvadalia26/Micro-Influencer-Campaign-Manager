'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Megaphone, Users, ShieldCheck, type LucideIcon } from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-300 group ${
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
              style={isActive ? {
                filter: 'drop-shadow(0 0 6px rgba(129,140,248,0.5))',
              } : undefined}
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
    </>
  )
}
