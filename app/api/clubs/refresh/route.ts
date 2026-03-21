import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getSession } from '@/lib/auth'

export async function POST() {
  const session = await getSession()
  
  if (!session?.isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    revalidateTag('clubs', 'max')
    
    return NextResponse.json({ 
      success: true,
      message: 'Club data refresh triggered'
    })
  } catch (error) {
    console.error('Error refreshing clubs:', error)
    return NextResponse.json(
      { error: 'Failed to refresh club data' },
      { status: 500 }
    )
  }
}
