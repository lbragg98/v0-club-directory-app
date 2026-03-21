import { NextResponse } from 'next/server'
import { getSession, addAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Verify the requester is authenticated
    const session = await getSession()
    if (!session?.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const success = addAdmin(username, password)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to create admin' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Admin created successfully. Note: This admin will be removed when the server restarts. For persistence, add a database integration.'
    })
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
