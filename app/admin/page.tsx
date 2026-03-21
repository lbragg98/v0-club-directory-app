'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import {
  RefreshCw,
  LogOut,
  UserPlus,
  Home,
  Shield,
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/clubs/refresh', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to refresh')
      }

      toast.success('Club data refreshed successfully from Google Sheets')
    } catch {
      toast.error('Failed to refresh club data')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      })
      window.location.href = '/admin/login'
    } catch {
      toast.error('Failed to logout')
      setIsLoggingOut(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error('Please enter both username and password')
      return
    }

    setIsCreatingAdmin(true)
    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to create admin')
        return
      }

      toast.success(`Admin "${newUsername}" created successfully`)
      setNewUsername('')
      setNewPassword('')
    } catch {
      toast.error('Failed to create admin')
    } finally {
      setIsCreatingAdmin(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="gap-2"
          >
            {isLoggingOut ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          
          {/* Refresh API Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Refresh Data
              </CardTitle>
              <CardDescription>
                Sync club data from Google Sheets to update the directory with the latest information.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-end">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full gap-2"
              >
                {isRefreshing ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh from Sheets
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Create Admin Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Add New Admin
              </CardTitle>
              <CardDescription>
                Create a new admin account. Note: Additional admins are stored in memory and will reset on server restart.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <form onSubmit={handleCreateAdmin} className="space-y-3">
                <Input
                  placeholder="Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={isCreatingAdmin}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isCreatingAdmin}
                />
                <Button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="w-full gap-2"
                >
                  {isCreatingAdmin ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Admin
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Return to Directory Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Club Directory
              </CardTitle>
              <CardDescription>
                Return to the public club directory to browse and search clubs.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-end">
              <Link href="/" className="w-full">
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
