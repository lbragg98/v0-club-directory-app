import { cookies } from 'next/headers'

// Cookie configuration
const COOKIE_NAME = 'admin_auth'
const COOKIE_MAX_AGE = 24 * 60 * 60 // 24 hours in seconds

export async function setAuthCookie(value: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

export async function getAuthCookie() {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value || null
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export function validateCredentials(username: string, password: string): boolean {
  // Validate against environment variables only
  // Server-side validation only - credentials never sent to client
  const validUsername = process.env.ADMIN_USERNAME
  const validPassword = process.env.ADMIN_PASSWORD

  if (!validUsername || !validPassword) {
    console.error('[v0] Admin credentials not configured in environment')
    return false
  }

  const isValid = username === validUsername && password === validPassword
  
  if (process.env.NODE_ENV === 'development') {
    if (!isValid) {
      console.log('[v0] Login failed: invalid credentials')
    } else {
      console.log('[v0] Login successful for admin user')
    }
  }

  return isValid
}
