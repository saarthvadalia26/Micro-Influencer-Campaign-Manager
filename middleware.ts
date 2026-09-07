import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Truly public routes that NEVER need auth check
  const isPublicRoute =
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/portal/')

  if (isPublicRoute) {
    return NextResponse.next({ request })
  }

  // 2. Fast-path check for session cookies
  // Supabase auth cookies are prefixed with "sb-" and end with or contain "-auth-token"
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )

  const isAuthRoute = pathname === '/login' || pathname === '/signup'

  // If there are NO auth cookies at all:
  // - On auth routes (/login, /signup), immediately allow access with 0ms remote latency.
  // - On protected routes, immediately redirect to /login with 0ms remote latency.
  if (!hasAuthCookie) {
    if (isAuthRoute) {
      return NextResponse.next({ request })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. User might be logged in (auth cookie is present) -> verify and refresh session
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. Auth routes: redirect to dashboard if already logged in
  if (isAuthRoute) {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  // 5. Protected routes: redirect to login if session is invalid/expired
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 6. Forward verified user identity in request headers so Server Components
  // don't have to make redundant remote network calls to Supabase Auth.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', user.id)
  requestHeaders.set('x-user-email', user.email ?? '')

  const finalResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Preserve any refreshed cookies from supabaseResponse
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value, cookie)
  })

  return finalResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
