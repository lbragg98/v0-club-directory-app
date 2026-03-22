import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateCredentials } from '@/lib/auth'

const COOKIE_NAME = 'admin_auth'
const COOKIE_MAX_AGE = 24 * 60 * 60 // 24 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log('[v0] Login attempt with username:', username)

    if (!username || !password) {
      console.log('[v0] Login failed: missing username or password')
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Validate credentials (server-side only)
    const isValid = validateCredentials(username, password)
    console.log('[v0] Login credentials valid:', isValid)
    
    if (!isValid) {
      console.log('[v0] Login failed: invalid credentials')
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create response and set cookie directly on it
    console.log('[v0] Login successful, setting cookie')
    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })
    console.log('[v0] Cookie set, responding with success')

    return response
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
