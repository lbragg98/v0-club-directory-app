'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StarRating } from '@/components/star-rating'
import { MiniRatingBar } from '@/components/mini-rating-bar'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import {
  Search,
  RefreshCw,
  LogOut,
  Users,
  Star,
  Sparkles,
  Eye,
} from 'lucide-react'
import type { Club } from '@/lib/types'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminDashboardPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const { data, error, isLoading, mutate } = useSWR<{ clubs: Club[] }>(
    '/api/clubs',
    fetcher
  )

  const clubs = data?.clubs ?? []

  const filteredClubs = useMemo(() => {
    if (!search) return clubs
    return clubs.filter((club) =>
      club.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [clubs, search])

  const stats = useMemo(() => {
    const totalClubs = clubs.length
    const openClubs = clubs.filter((c) => c.status === 'Open').length
    const avgRating =
      clubs.length > 0
        ? clubs.reduce((sum, c) => sum + c.overallRating, 0) / clubs.length
        : 0

    return { totalClubs, openClubs, avgRating }
  }, [clubs])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/clubs/refresh', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to refresh')
      }

      await mutate()
      toast.success('Club data refreshed successfully')
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
      router.push('/admin/login')
      router.refresh()
    } catch {
      toast.error('Failed to logout')
      setIsLoggingOut(false)
    }
  }

  const handleViewClub = (club: Club) => {
    setSelectedClub(club)
    setViewModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              {isRefreshing ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync from Sheets
            </Button>
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clubs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalClubs}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Clubs
              </CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {stats.openClubs}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">
                {stats.avgRating.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner className="h-8 w-8" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground">Failed to load clubs</p>
                <Button onClick={() => mutate()} variant="outline" className="mt-4">
                  Retry
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>SFW</TableHead>
                    <TableHead>Parties</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClubs.map((club) => (
                    <TableRow key={club.id}>
                      <TableCell className="font-medium">{club.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{club.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{club.platform}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            club.status === 'Open'
                              ? 'bg-green-500 text-white'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {club.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <StarRating rating={club.overallRating} size="sm" />
                          <span className="text-sm ml-1">
                            {club.overallRating.toFixed(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {club.sfwFriendly ? (
                          <Badge className="bg-green-100 text-green-700">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {club.inviteParties ? (
                          <Badge className="bg-orange-100 text-orange-700">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewClub(club)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Results count */}
        {!isLoading && !error && (
          <p className="text-sm text-muted-foreground mt-4">
            Showing {filteredClubs.length} of {clubs.length} clubs
          </p>
        )}
      </div>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedClub && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedClub.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <StarRating rating={selectedClub.overallRating} size="lg" />
                  <span className="text-xl font-bold">
                    {selectedClub.overallRating.toFixed(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{selectedClub.type}</Badge>
                  <Badge variant="outline">{selectedClub.platform}</Badge>
                  <Badge
                    className={cn(
                      selectedClub.status === 'Open'
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {selectedClub.status}
                  </Badge>
                </div>

                <div className="space-y-3 bg-muted/50 rounded-xl p-4">
                  <MiniRatingBar label="Invites" value={selectedClub.invitesScore} />
                  <MiniRatingBar label="Door" value={selectedClub.doorScore} />
                  <MiniRatingBar label="Calls" value={selectedClub.callsScore} />
                </div>

                {selectedClub.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedClub.notes}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
