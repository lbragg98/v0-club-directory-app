import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateCredentials } from '@/lib/auth'

const COOKIE_NAME = 'admin_auth'
const COOKIE_MAX_AGE = 24 * 60 * 60 // 24 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Validate credentials (server-side only)
    const isValid = validateCredentials(username, password)
    
    if (!isValid) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[auth] Login failed: invalid credentials for user', username)
      }
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Set auth cookie on response
    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('[auth] Login successful, cookie set for user', username)
    }

    return response
  } catch (error) {
    console.error('[auth] Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
