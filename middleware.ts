import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'admin_auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCookie = request.cookies.get(COOKIE_NAME)
  const isAuthenticated = !!authCookie?.value

  console.log('[v0] Middleware: checking path:', pathname, 'authenticated:', isAuthenticated)

  // If accessing /admin/login while already authenticated, redirect to dashboard
  if (pathname === '/admin/login' && isAuthenticated) {
    console.log('[v0] Middleware: already authenticated, redirecting to /admin')
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // If accessing /admin (not login) without auth, redirect to login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !isAuthenticated) {
    console.log('[v0] Middleware: not authenticated, redirecting to /admin/login')
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
