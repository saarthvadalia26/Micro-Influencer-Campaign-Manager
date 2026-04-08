'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu'

export function ThemeMenuItems() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  return (
    <>
      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Theme</DropdownMenuLabel>
      {options.map((opt) => {
        const Icon = opt.icon
        const active = mounted && theme === opt.value
        return (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className="cursor-pointer"
          >
            <Icon className="h-4 w-4 mr-2" />
            {opt.label}
            {active && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        )
      })}
    </>
  )
}
