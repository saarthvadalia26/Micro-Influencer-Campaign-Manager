import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { cache } from 'react'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  ) as any
}

/**
 * Cached version of getUser to avoid redundant network calls.
 * First checks headers for user verified by middleware (0ms round-trip).
 * Falls back to supabase.auth.getUser() if headers are unavailable.
 */
export const getUser = cache(async () => {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userEmail = headersList.get('x-user-email')

    if (userId) {
      return {
        data: {
          user: {
            id: userId,
            email: userEmail || undefined,
          } as any,
        },
        error: null,
      }
    }
  } catch {
    // headers() might throw in certain build/prerender contexts; proceed to fallback
  }

  const supabase = await createClient()
  return await supabase.auth.getUser()
})
