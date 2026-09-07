'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)

  // When pathname or searchParams finish updating, complete the progress bar
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Ignore external links, downloads, same-page anchors, or modifier keys
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        target.target === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }

      // If navigating to the same URL, ignore
      const currentUrl = window.location.pathname + window.location.search
      if (href === currentUrl) return

      // Start navigation indicator immediately
      setIsNavigating(true)
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [])

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ width: '0%', opacity: 1 }}
          animate={{ width: '85%', opacity: 1 }}
          exit={{ width: '100%', opacity: 0 }}
          transition={{
            width: { duration: 0.8, ease: 'easeOut' },
            opacity: { duration: 0.2 },
          }}
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-[9999] shadow-[0_0_12px_rgba(99,102,241,0.8)] pointer-events-none"
        />
      )}
    </AnimatePresence>
  )
}
