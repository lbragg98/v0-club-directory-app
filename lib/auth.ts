import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// In-memory store for additional admins (note: resets on server restart)
// For persistence, integrate a database like Supabase or Neon
const additionalAdmins: Map<string, string> = new Map()

export function addAdmin(username: string, password: string): boolean {
  if (!username || !password) return false
  additionalAdmins.set(username, password)
  return true
}

export function getAdminCount(): number {
  // Primary admin from env + additional admins
  return 1 + additionalAdmins.size
}

export async function createSession(): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION
  const sessionData = JSON.stringify({ isAuthenticated: true, expiresAt })
  const encoded = Buffer.from(sessionData).toString('base64')
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
    path: '/',
  })
  
  return encoded
}

export async function getSession(): Promise<{ isAuthenticated: boolean; expiresAt: number } | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie?.value) {
    return null
  }
  
  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    const session = JSON.parse(decoded)
    
    if (session.expiresAt < Date.now()) {
      await destroySession()
      return null
    }
    
    return session
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export function validateCredentials(username: string, password: string): boolean {
  // Check primary admin from environment
  const validUsername = process.env.ADMIN_USERNAME
  const validPassword = process.env.ADMIN_PASSWORD
  
  if (validUsername && validPassword && username === validUsername && password === validPassword) {
    return true
  }
  
  // Check additional admins stored in memory
  const storedPassword = additionalAdmins.get(username)
  if (storedPassword && storedPassword === password) {
    return true
  }
  
  return false
}
