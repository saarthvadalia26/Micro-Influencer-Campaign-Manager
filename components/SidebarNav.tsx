'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Megaphone, Users, ShieldCheck, type LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  campaigns: Megaphone,
  influencers: Users,
  admin: ShieldCheck,
}

export type SidebarNavItem = {
  href: string
  label: string
  icon: string
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
}

export function SidebarNav({ items }: { items: SidebarNavItem[] }) {
  const pathname = usePathname()

  return (
    <div className="space-y-1">
      {items.map((item, index) => {
        const Icon = iconMap[item.icon]
        if (!Icon) return null
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

        return (
          <motion.div
            key={item.href}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-300 group ${
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-white/[0.06] dark:text-white font-medium'
                  : 'hover:bg-accent hover:text-foreground text-muted-foreground'
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-all duration-300 group-hover:scale-110 ${
                  isActive
                    ? 'text-primary dark:text-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]'
                    : 'text-muted-foreground group-hover:text-foreground'
                }`}
                style={isActive ? {
                  filter: 'drop-shadow(0 0 6px rgba(129,140,248,0.5))',
                } : undefined}
              />
              {isActive ? (
                <motion.span 
                  layoutId="active-nav-text"
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent font-medium"
                >
                  {item.label}
                </motion.span>
              ) : (
                item.label
              )}
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
