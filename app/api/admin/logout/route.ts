import { NextResponse } from 'next/server'

const COOKIE_NAME = 'admin_auth'

export async function POST() {
  try {
    // Clear auth cookie by setting maxAge to 0
    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('[auth] Logout: cookie cleared')
    }

    return response
  } catch (error) {
    console.error('[auth] Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
