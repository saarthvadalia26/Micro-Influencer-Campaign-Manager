import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

let browserClient: any

export function createClient(): any {
  if (browserClient) return browserClient

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  )

  return browserClient
}


