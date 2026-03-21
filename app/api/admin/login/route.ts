import { NextResponse } from 'next/server'
import { validateCredentials } from '@/lib/auth'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const isValid = validateCredentials(username, password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Build session payload
    const session = {
      username,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION,
    }
    const sessionValue = Buffer.from(JSON.stringify(session)).toString('base64')

    // Return a redirect response with the session cookie attached so the
    // browser navigates to /admin with the cookie already committed.
    const response = NextResponse.redirect(new URL('/admin', request.url), 303)
    response.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
