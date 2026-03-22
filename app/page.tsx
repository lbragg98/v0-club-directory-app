'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { ClubCard } from '@/components/club-card'
import { ClubCardSkeleton } from '@/components/club-card-skeleton'
import { FilterBar } from '@/components/filter-bar'
import { ClubDetailModal } from '@/components/club-detail-modal'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Users, Sparkles } from 'lucide-react'
import type { Club, ClubFilters } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const defaultFilters: ClubFilters = {
  search: '',
  type: 'All',
  platform: 'All',
  breakFilter: 'All',
  sfwFilter: 'All Clubs',
  ratingFilter: 'All Clubs',
  openOnly: false,
  invitePartiesOnly: false,
}

export default function HomePage() {
  const [filters, setFilters] = useState<ClubFilters>(defaultFilters)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { data, error, isLoading, mutate } = useSWR<{ clubs: Club[]; debug?: Record<string, unknown> }>(
    '/api/clubs',
    fetcher
  )

  const clubs = data?.clubs ?? []

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      if (filters.search && !club.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.type !== 'All' && club.type !== filters.type) {
        return false
      }
      if (filters.platform !== 'All' && club.platform !== filters.platform) {
        return false
      }
      if (filters.breakFilter === 'Has Break' && club.break !== 'yes') {
        return false
      }
      if (filters.breakFilter === 'No Break' && club.break !== 'no') {
        return false
      }
      if (filters.openOnly && club.status !== 'Open') {
        return false
      }
      if (filters.sfwFilter === 'Active SFW' && !club.sfwActive) {
        return false
      }
      if (filters.sfwFilter === 'No Active SFW' && club.sfwActive) {
        return false
      }
      if (filters.invitePartiesOnly && !club.inviteParties) {
        return false
      }
      if (filters.ratingFilter === '1+' && club.overallRating < 1) {
        return false
      }
      if (filters.ratingFilter === '2+' && club.overallRating < 2) {
        return false
      }
      if (filters.ratingFilter === '3+' && club.overallRating < 3) {
        return false
      }
      if (filters.ratingFilter === '4+' && club.overallRating < 4) {
        return false
      }
      if (filters.ratingFilter === '5' && club.overallRating < 5) {
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
    <main className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-[var(--gold)]/[0.02] pointer-events-none" />

      <section className="relative border-b border-border/40">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              EC Club Database
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Discover and explore the best clubs with detailed ratings, reviews, and real-time status updates.
            </p>

            {!isLoading && !error && (
              <div className="flex flex-wrap gap-8 pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalClubs}</p>
                    <p className="text-sm text-muted-foreground">Total Clubs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-success/10 ring-1 ring-success/20">
                    <Sparkles className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.openClubs}</p>
                    <p className="text-sm text-muted-foreground">Open Now</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative container mx-auto px-4 py-8">
        <div className="sticky top-0 z-10 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-xl">
          <FilterBar filters={filters} onFiltersChange={setFilters} />
        </div>

        {!isLoading && !error && (
          <p className="text-sm text-muted-foreground mt-6 mb-8">
            Showing <span className="text-foreground font-medium">{filteredClubs.length}</span> of{' '}
            <span className="text-foreground font-medium">{clubs.length}</span> clubs
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <ClubCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-destructive/10 ring-1 ring-destructive/20 mb-6">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Failed to load clubs</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
              There was an error fetching the club data. Please try again.
            </p>
            <Button onClick={() => mutate()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && filteredClubs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted ring-1 ring-border mb-6">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No clubs found</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
              Try adjusting your filters to find more clubs.
            </p>
            <Button onClick={() => setFilters(defaultFilters)} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}

        {!isLoading && !error && filteredClubs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClubs.map((club) => (
              <ClubCard key={club.id} club={club} onClick={() => handleClubClick(club)} />
            ))}
          </div>
        )}
      </section>

      <ClubDetailModal club={selectedClub} open={modalOpen} onOpenChange={setModalOpen} />
    </main>
  )
}
