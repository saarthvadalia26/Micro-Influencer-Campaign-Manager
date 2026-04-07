import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toString()
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Campaign statuses
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    // Influencer pipeline statuses
    outreach: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    product_sent: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    content_pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    live: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    // Content draft statuses
    pending_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    revision_requested: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-700'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
    outreach: 'Outreach',
    product_sent: 'Product Sent',
    content_pending: 'Content Pending',
    live: 'Live',
    paid: 'Paid',
    pending_review: 'Pending Review',
    approved: 'Approved',
    revision_requested: 'Revision Requested',
  }
  return labels[status] ?? status
}

export function getCPMEfficiency(cpm: number, niche?: string): 'green' | 'yellow' | 'red' {
  // CPM benchmarks vary by niche; general benchmarks:
  // Green: < $10, Yellow: $10-$25, Red: > $25
  const benchmarks: Record<string, { good: number; ok: number }> = {
    fashion: { good: 8, ok: 20 },
    beauty: { good: 6, ok: 18 },
    fitness: { good: 7, ok: 18 },
    food: { good: 5, ok: 15 },
    tech: { good: 10, ok: 25 },
    travel: { good: 8, ok: 22 },
    default: { good: 8, ok: 20 },
  }
  const bench = niche ? (benchmarks[niche.toLowerCase()] ?? benchmarks.default) : benchmarks.default
  if (cpm <= bench.good) return 'green'
  if (cpm <= bench.ok) return 'yellow'
  return 'red'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
