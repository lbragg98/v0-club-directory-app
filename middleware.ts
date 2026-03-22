import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'admin_auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (not /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const authCookie = request.cookies.get(COOKIE_NAME)

    if (!authCookie?.value) {
      // No auth cookie - redirect to login
      if (process.env.NODE_ENV === 'development') {
        console.log('[v0] Middleware: No auth cookie, redirecting to login')
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[v0] Middleware: Auth cookie found, allowing access')
    }
  }

  // Allow /admin/login to redirect to /admin if already authenticated
  if (pathname === '/admin/login') {
    const authCookie = request.cookies.get(COOKIE_NAME)
    if (authCookie?.value) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[v0] Middleware: Already authenticated, redirecting from login to admin')
      }
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
