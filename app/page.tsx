'use client'

import { useEffect, useState, useMemo } from 'react'
import useSWR from 'swr'
import { ClubCard } from '@/components/club-card'
import { ClubCardSkeleton } from '@/components/club-card-skeleton'
import { FilterBar } from '@/components/filter-bar'
import { ClubDetailModal } from '@/components/club-detail-modal'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Users, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Club, ClubFilters } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const defaultFilters: ClubFilters = {
  search: '',
  type: 'All',
  platform: 'All',
  breakFilter: 'All',
  sfwFilter: 'All Clubs',
  sfwFriendlyFilter: 'All Clubs',
  ratingFilter: 'All Clubs',
  openOnly: false,
  invitePartiesOnly: false,
}

export default function HomePage() {
  const [filters, setFilters] = useState<ClubFilters>(defaultFilters)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all')
  const { data, error, isLoading, mutate } = useSWR<{ clubs: Club[]; debug?: Record<string, unknown> }>(
    '/api/clubs',
    fetcher
  )

  useEffect(() => {
    const saved = localStorage.getItem('favoriteClubIds')
    if (saved) {
      try {
        setFavoriteIds(JSON.parse(saved))
      } catch {
        setFavoriteIds([])
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('favoriteClubIds', JSON.stringify(favoriteIds))
  }, [favoriteIds])

  function toggleFavorite(clubId: string) {
    setFavoriteIds((prev) =>
      prev.includes(clubId)
        ? prev.filter((id) => id !== clubId)
        : [...prev, clubId]
    )
  }

  const clubs = useMemo(() => {
    return [...(data?.clubs ?? [])].sort((a, b) => b.overallRating - a.overallRating)
  }, [data?.clubs])

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
      if (filters.sfwFriendlyFilter === 'SFW Friendly' && club.sfwFriendly !== 'yes') {
        return false
      }
      if (filters.sfwFriendlyFilter === 'Not Friendly' && club.sfwFriendly !== 'no') {
        return false
      }
      if (filters.sfwFriendlyFilter === 'Case by Case' && club.sfwFriendly !== 'cbc') {
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

  const displayedClubs = useMemo(() => {
    if (activeTab === 'favorites') {
      return filteredClubs.filter((club) => favoriteIds.includes(club.id))
    }
    return filteredClubs
  }, [activeTab, filteredClubs, favoriteIds])

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

            <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-2xl">
              <span className="font-medium text-muted-foreground">Disclaimer:</span> These ratings are solely based on the three features needed for club hopping and last bar chasing. These ratings do not reflect the club environment and the people there or their sfw policies. To request updated information/re-evaluation, use this{' '}
              <a
                href="https://omfgdogs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                Google Form
              </a>
              . To submit a review for a club to be taken under consideration, use this{' '}
              <a
                href="https://omfgdogs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                Google Form
              </a>
              .
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
          <>
            <div className="flex gap-2 mt-6 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  activeTab === 'all'
                    ? 'bg-white text-black'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary/70'
                )}
              >
                All Clubs
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  activeTab === 'favorites'
                    ? 'bg-white text-black'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary/70'
                )}
              >
                Favorites
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-8">
              Showing <span className="text-foreground font-medium">{displayedClubs.length}</span> of{' '}
              <span className="text-foreground font-medium">
                {activeTab === 'favorites' ? favoriteIds.length : clubs.length}
              </span>{' '}
              {activeTab === 'favorites' ? 'favorite clubs' : 'clubs'}
            </p>
          </>
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

        {!isLoading && !error && displayedClubs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted ring-1 ring-border mb-6">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              {activeTab === 'favorites' ? 'No favorite clubs yet' : 'No clubs found'}
            </h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
              {activeTab === 'favorites'
                ? 'Save clubs to favorites to see them here.'
                : 'Try adjusting your filters to find more clubs.'}
            </p>
            <Button onClick={() => setFilters(defaultFilters)} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}

        {!isLoading && !error && displayedClubs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onClick={() => handleClubClick(club)}
                isFavorite={favoriteIds.includes(club.id)}
                onToggleFavorite={() => toggleFavorite(club.id)}
              />
            ))}
          </div>
        )}
      </section>

      <ClubDetailModal club={selectedClub} open={modalOpen} onOpenChange={setModalOpen} />
    </main>
  )
}
