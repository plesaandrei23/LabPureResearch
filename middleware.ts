import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.email === process.env.ADMIN_EMAIL
  const isAdminRoute = pathname.startsWith('/admin')

  // Non-admin trying to access admin panel → home
  if (!isAdmin && isAdminRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Admin trying to access anything outside admin panel → admin panel
  if (isAdmin && !isAdminRoute) {
    return NextResponse.redirect(new URL('/admin/comenzi', request.url))
  }

  return response
}

export const config = {
  // Run on all routes except Next.js internals, static files, and auth callback
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/confirm|api/).*)'],
}
