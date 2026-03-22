// Minimal auth helpers - only what's needed for Route Handlers
// Note: API Routes set cookies directly on NextResponse, not via next/headers/cookies

export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.ADMIN_USERNAME
  const validPassword = process.env.ADMIN_PASSWORD

  if (!validUsername || !validPassword) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[auth] Admin credentials not configured in environment')
    }
    return false
  }

  return username === validUsername && password === validPassword
}
