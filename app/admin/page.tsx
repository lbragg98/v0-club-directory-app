'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { RefreshCw, LogOut, Home, Shield } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/clubs/refresh', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to refresh')
      }

      toast.success('Club data refreshed from Google Sheets')
    } catch {
      toast.error('Failed to refresh club data')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.replace('/admin/login')
    } catch {
      toast.error('Failed to logout')
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Club Directory Admin</h1>
              <p className="text-sm text-muted-foreground">Manage club records and data</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="gap-2"
          >
            {isLoggingOut ? <Spinner className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          
          {/* Sync Data Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Sync From Google Sheets
              </CardTitle>
              <CardDescription>
                Refresh club data from the MASTER sheet to update the directory with latest information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full gap-2"
              >
                {isRefreshing ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Return to Directory Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Back to Directory
              </CardTitle>
              <CardDescription>
                Return to the public club directory to view the list of all clubs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="h-4 w-4" />
                  Go to Directory
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  )
}
