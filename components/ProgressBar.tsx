'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ width: 0, opacity: 1 }}
          animate={{ width: '100%', opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-violet-500 z-[9999] shadow-[0_0_10px_rgba(99,102,241,0.5)]"
        />
      )}
    </AnimatePresence>
  )
}
