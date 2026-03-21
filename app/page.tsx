'use client'

import { useState, useMemo, useEffect } from 'react'
import useSWR from 'swr'
import { ClubCard } from '@/components/club-card'
import { ClubCardSkeleton } from '@/components/club-card-skeleton'
import { FilterBar } from '@/components/filter-bar'
import { ClubDetailModal } from '@/components/club-detail-modal'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Users, Star, Sparkles } from 'lucide-react'
import type { Club, ClubFilters } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const defaultFilters: ClubFilters = {
  search: '',
  type: 'All',
  platform: 'All',
  openOnly: false,
  sfwOnly: false,
  invitePartiesOnly: false,
}

export default function HomePage() {
  const [filters, setFilters] = useState<ClubFilters>(defaultFilters)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, error, isLoading, mutate } = useSWR<{ clubs: Club[] }>(
    '/api/clubs',
    fetcher
  )

  const clubs = data?.clubs ?? []

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      // Search filter
      if (
        filters.search &&
        !club.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }

      // Type filter
      if (filters.type !== 'All' && club.type !== filters.type) {
        return false
      }

      // Platform filter
      if (filters.platform !== 'All' && club.platform !== filters.platform) {
        return false
      }

      // Open only filter
      if (filters.openOnly && club.status !== 'Open') {
        return false
      }

      // SFW only filter
      if (filters.sfwOnly && !club.sfwFriendly) {
        return false
      }

      // Invite parties filter
      if (filters.invitePartiesOnly && !club.inviteParties) {
        return false
      }

      return true
    })
  }, [clubs, filters])

  const stats = useMemo(() => {
    const totalClubs = clubs.length
    const openClubs = clubs.filter((c) => c.status === 'Open').length
    const avgRating =
      clubs.length > 0
        ? clubs.reduce((sum, c) => sum + c.overallRating, 0) / clubs.length
        : 0

    return { totalClubs, openClubs, avgRating }
  }, [clubs])

  const handleClubClick = (club: Club) => {
    setSelectedClub(club)
    setModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-blue-500/5" />
        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
              Club Directory
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty max-w-2xl">
              Discover and explore the best clubs with detailed ratings, reviews,
              and real-time status updates.
            </p>

            {/* Stats */}
            {!isLoading && !error && (
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-500/10">
                    <Users className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalClubs}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Clubs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Sparkles className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.openClubs}
                    </p>
                    <p className="text-sm text-muted-foreground">Open Now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.avgRating.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        {/* Sticky Filter Bar */}
        <div className="sticky top-0 z-10 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-lg">
          <FilterBar filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Results Count */}
        {!isLoading && !error && (
          <p className="text-sm text-muted-foreground mt-4 mb-6">
            Showing {filteredClubs.length} of {clubs.length} clubs
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ClubCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-3 rounded-full bg-destructive/10 mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Failed to load clubs
            </h3>
            <p className="text-muted-foreground mt-1 mb-4">
              There was an error fetching the club data. Please try again.
            </p>
            <Button onClick={() => mutate()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredClubs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-3 rounded-full bg-muted mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No clubs found
            </h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Try adjusting your filters to find more clubs.
            </p>
            <Button
              onClick={() => setFilters(defaultFilters)}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Club Grid */}
        {!isLoading && !error && filteredClubs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onClick={() => handleClubClick(club)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Club Detail Modal */}
      <ClubDetailModal
        club={selectedClub}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </main>
  )
}
