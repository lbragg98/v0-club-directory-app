import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'admin_auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCookie = request.cookies.get(COOKIE_NAME)
  const isAuthenticated = !!authCookie?.value

  // Development logging
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    if (pathname === '/admin/login') {
      console.log('[auth] /admin/login: cookie exists =', !!authCookie?.value)
    } else if (pathname.startsWith('/admin')) {
      console.log('[auth] /admin: cookie exists =', !!authCookie?.value)
    }
  }

  // If accessing /admin/login while authenticated, redirect to dashboard
  if (pathname === '/admin/login' && isAuthenticated) {
    if (isDev) console.log('[auth] Already authenticated, redirecting /admin/login → /admin')
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // If accessing /admin (not login) without auth, redirect to login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !isAuthenticated) {
    if (isDev) console.log('[auth] Not authenticated, redirecting /admin → /admin/login')
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
