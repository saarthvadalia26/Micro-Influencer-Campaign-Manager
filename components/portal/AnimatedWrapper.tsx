'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedWrapperProps {
  children: ReactNode
  delay?: number
}

export function AnimatedWrapper({ children, delay = 0 }: AnimatedWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
