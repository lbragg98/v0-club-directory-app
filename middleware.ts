import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('[v0] Middleware: checking path:', pathname)
  console.log('[v0] Middleware: cookies:', request.cookies.getAll().map(c => c.name))
  
  // Check if accessing admin routes (but not login page)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionCookie = request.cookies.get('admin_session')
    
    console.log('[v0] Middleware: admin_session cookie exists:', !!sessionCookie?.value)
    
    if (!sessionCookie?.value) {
      console.log('[v0] Middleware: no session cookie, redirecting to login')
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    try {
      const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
      const session = JSON.parse(decoded)
      
      console.log('[v0] Middleware: session parsed, expires:', session.expiresAt, 'now:', Date.now())
      
      if (session.expiresAt < Date.now()) {
        console.log('[v0] Middleware: session expired, redirecting to login')
        const loginUrl = new URL('/admin/login', request.url)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('admin_session')
        return response
      }
      
      console.log('[v0] Middleware: session valid, allowing access')
    } catch (err) {
      console.log('[v0] Middleware: error parsing session:', err)
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
