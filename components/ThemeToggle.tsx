'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'full' }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  if (variant === 'full') {
    return (
      <div className="space-y-1">
        {options.map((opt) => {
          const Icon = opt.icon
          const active = mounted && theme === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm transition-colors ${
                active ? 'bg-muted' : 'hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left">{opt.label}</span>
              {active && <Check className="h-4 w-4" />}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((opt) => {
          const Icon = opt.icon
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className="cursor-pointer"
            >
              <Icon className="h-4 w-4 mr-2" />
              {opt.label}
              {mounted && theme === opt.value && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
