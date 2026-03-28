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
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'forms' | 'info'>('all')
  const { data, error, isLoading, mutate } = useSWR<{ clubs: Club[]; debug?: Record<string, unknown> }>(
    '/api/clubs',
    fetcher
  )
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

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
        <div className="container mx-auto px-4 py-10 md:py-20">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              EC Club Database
            </h1>

            <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-2xl">
              <span className="font-medium text-muted-foreground">Disclaimer:</span> These ratings are based on the features needed for club/last bar hopping and do not reflect the club environment, members, or SFW policies. For more information on the creation and collaboration of this app, click the <span className="font-bold">Info</span> tab below.
            </p>

            <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-2xl">
              To request a re-evaluation, update information, or submit a review, please select the <span className="font-medium text-muted-foreground">Forms</span> tab.
            </p>

            {!isLoading && !error && (
              <div className="flex flex-wrap gap-8 pt-2">
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

      <section className="relative container mx-auto px-4 py-4 md:py-8">
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

              <button
                type="button"
                onClick={() => setActiveTab('forms')}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  activeTab === 'forms'
                    ? 'bg-white text-black'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary/70'
                )}
              >
                Forms
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  activeTab === 'info'
                    ? 'bg-white text-black'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary/70'
                )}
              >
                Info
              </button>
            </div>

            {activeTab !== 'forms' && activeTab !== 'info' && (
              <p className="text-sm text-muted-foreground mb-8">
                Showing <span className="text-foreground font-medium">{displayedClubs.length}</span> of{' '}
                <span className="text-foreground font-medium">
                  {activeTab === 'favorites' ? favoriteIds.length : clubs.length}
                </span>{' '}
                {activeTab === 'favorites' ? 'favorite clubs' : 'clubs'}
              </p>
            )}
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

        {!isLoading && !error && activeTab === 'forms' && (
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Forms</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Submit updates or reviews directly here.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="rounded-2xl border border-border/50 bg-card p-4">
                <div className="flex flex-col items-start gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Request Updated Information / Re-Evaluation
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowUpdateForm((prev) => !prev)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors text-sm font-medium"
                  >
                    {showUpdateForm ? 'Hide Form' : 'Show Form'}
                  </button>
                </div>

                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    showUpdateForm ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSccFqJyWX_K_HUwlZyiSa4vVbeje84icuIko5gAYdtwWK46Ww/viewform?embedded=true"
                    width="100%"
                    height="900"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    className="rounded-xl"
                  >
                    Loading…
                  </iframe>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-4">
                <div className="flex flex-col items-start gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Submit a Club Review
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm((prev) => !prev)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors text-sm font-medium"
                  >
                    {showReviewForm ? 'Hide Form' : 'Show Form'}
                  </button>
                </div>

                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    showReviewForm ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSd1y4fEerDt3SbbNJRw4oQCZ0jLVlW7-xioAnnVSioIHhIIFQ/viewform?embedded=true"
                    width="100%"
                    height="900"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    className="rounded-xl"
                  >
                    Loading…
                  </iframe>
                </div>
              </div>
            </div>
          </section>
        )}

        {!isLoading && !error && activeTab === 'info' && (
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Info</h2>
              <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-3xl">
                Our team compiled a spreadsheet of active PIMD EC clubs using data pulled from the club leaderboard. To be included, clubs needed to host cats, dogs, or invites during open hours and charge bookers set rates. Clubs were also generally expected to be established for at least 2 to 4 hunts before being added, allowing time for testing and evaluation.
              </p>

              <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-3xl">
                The information shown in each club snapshot was researched, documented, and reviewed in a secure spreadsheet. Clubs were booked for testing, and once a large portion had been evaluated, the results were further refined through collaboration with experienced leaderboarders and club hoppers. The app was then built using that combined data.
              </p>

              <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-3xl">
                Please note that all club ratings are based specifically on leaderboarding and last bar hopping. <span className="font-semibold text-foreground">Invites, calls, and door</span> are the three main attributes used to evaluate how effective a club is for hopping.
              </p>

              <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-3xl">
                Ratings were discussed and influenced by a team process, and many leaderboarders were given early access to review the app, suggest adjustments, and submit corrections before launch.
              </p>

              <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-3xl">
                No rating is considered final. We welcome feedback, different perspectives, and club growth over time. If you would like to share your experience with a club for team review, please use the <span className="font-semibold text-foreground">Forms</span> tab.
              </p>

              <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-3xl">
                Some details, such as LB speed, may shift during especially active or popular hunts. This app is intended to serve as a helpful guide rather than a fixed authority. If you believe a club has changed significantly and should be reassessed, please use the <span className="font-semibold text-foreground">Forms</span> tab to submit feedback.
              </p>
            </div>
          </section>
        )}

        {!isLoading && !error && activeTab !== 'forms' && activeTab !== 'info' && displayedClubs.length === 0 && (
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

        {!isLoading && !error && activeTab !== 'forms' && activeTab !== 'info' && displayedClubs.length > 0 && (
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
