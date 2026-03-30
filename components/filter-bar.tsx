'use client'

import { useState } from 'react'
import { Search, X, ArrowUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ClubFilters } from '@/lib/types'

interface FilterBarProps {
  filters: ClubFilters
  onFiltersChange: (filters: ClubFilters) => void
  className?: string
}

export function FilterBar({ filters, onFiltersChange, className }: FilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  const updateFilter = <K extends keyof ClubFilters>(
    key: K,
    value: ClubFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: 'All',
      platform: 'All',
      breakFilter: 'All',
      sfwFilter: 'All Clubs',
      ratingFilter: 'All Clubs',
      sfwFriendlyFilter: 'All Clubs',
      openOnly: false,
      invitePartiesOnly: false,
    })
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.type !== 'All' ||
    filters.platform !== 'All' ||
    filters.breakFilter !== 'All' ||
    filters.sfwFilter !== 'All Clubs' ||
    filters.ratingFilter !== 'All Clubs' ||
    filters.sfwFriendlyFilter !== 'All Clubs' ||
    filters.openOnly ||
    filters.invitePartiesOnly

  return (
    <div
      className={cn(
        'bg-[#2f3136] sm:bg-card backdrop-blur-xl',
        'border border-border/50 rounded-2xl',
        'p-3 sm:p-4 shadow-lg shadow-black/5',
        className
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clubs..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className={cn(
              'pl-10 h-10 bg-secondary/50 border-border/50',
              'rounded-xl',
              'placeholder:text-muted-foreground/60',
              'focus:bg-secondary/80 focus:border-primary/30',
              'transition-all duration-200'
            )}
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="w-full sm:w-auto rounded-x1 border-border/50 bg-secondary/50 hover:bg-secondary/70"
          >
            Filter Clubs
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={scrollToTop}
            className="w-full sm:w-auto rounded-x1 border-border/50 bg-secondary/50 hover:bg-secondary/70"
          >
            <ArrowUp className="h-4 w-4" />
            Back to Top
          </Button>
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            filtersOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="flex flex-col gap-5 pt-1">
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <Select
                value={filters.type}
                onValueChange={(value) => updateFilter('type', value as ClubFilters['type'])}
              >
                <SelectTrigger className="w-full sm:w-[140px] h-10 bg-secondary/50 border-border/50 rounded-xl hover:bg-secondary/70 transition-colors">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Cat">Cat</SelectItem>
                  <SelectItem value="Dog">Dog</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Invite">Invite</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.platform}
                onValueChange={(value) => updateFilter('platform', value as ClubFilters['platform'])}
              >
                <SelectTrigger className="w-full sm:w-[140px] h-10 bg-secondary/50 border-border/50 rounded-xl hover:bg-secondary/70 transition-colors">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="All">All Platforms</SelectItem>
                  <SelectItem value="Line">Line</SelectItem>
                  <SelectItem value="Disc">Disc</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.breakFilter}
                onValueChange={(value) =>
                  updateFilter('breakFilter', value as ClubFilters['breakFilter'])
                }
              >
                <SelectTrigger className="w-full sm:w-[140px] h-10 bg-secondary/50 border-border/50 rounded-xl hover:bg-secondary/70 transition-colors">
                  <SelectValue placeholder="Break" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="All">All Breaks</SelectItem>
                  <SelectItem value="Has Break">Has Break</SelectItem>
                  <SelectItem value="No Break">No Break</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.ratingFilter}
                onValueChange={(value) =>
                  updateFilter('ratingFilter', value as ClubFilters['ratingFilter'])
                }
              >
                <SelectTrigger className="w-full sm:w-[140px] h-10 bg-secondary/50 border-border/50 rounded-xl hover:bg-secondary/70 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="All Clubs">All Ratings</SelectItem>
                  <SelectItem value="1+">1+</SelectItem>
                  <SelectItem value="2+">2+</SelectItem>
                  <SelectItem value="3+">3+</SelectItem>
                  <SelectItem value="4+">4+</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sfwFilter}
                onValueChange={(value) =>
                  updateFilter('sfwFilter', value as ClubFilters['sfwFilter'])
                }
              >
                <SelectTrigger className="w-full sm:w-[150px] h-10 bg-secondary/50 border-border/50 rounded-xl hover:bg-secondary/70 transition-colors">
                  <SelectValue placeholder="SFW Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="All Clubs">SFW Status</SelectItem>
                  <SelectItem value="Active SFW">Active SFW</SelectItem>
                  <SelectItem value="No Active SFW">No Active SFW</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sfwFriendlyFilter || 'All Clubs'}
                onValueChange={(value) =>
                  updateFilter('sfwFriendlyFilter', value as ClubFilters['sfwFriendlyFilter'])
                }
              >
                <SelectTrigger className="w-full sm:w-[160px] h-10 bg-secondary/50 border-border/50 rounded-xl hover:bg-secondary/70 transition-colors">
                  <SelectValue placeholder="SFW Friendly" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="All Clubs">SFW Friendly</SelectItem>
                  <SelectItem value="SFW Friendly">Friendly</SelectItem>
                  <SelectItem value="Not Friendly">Not Friendly</SelectItem>
                  <SelectItem value="Case by Case">Case By Case</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex items-center gap-2.5">
                <Switch
                  id="open-only"
                  checked={filters.openOnly}
                  onCheckedChange={(checked) => updateFilter('openOnly', checked)}
                  className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/20"
                />
                <Label htmlFor="open-only" className="text-sm cursor-pointer text-foreground/80 hover:text-foreground transition-colors">
                  Open Only
                </Label>
              </div>

              <div className="flex items-center gap-2.5">
                <Switch
                  id="parties-only"
                  checked={filters.invitePartiesOnly}
                  onCheckedChange={(checked) => updateFilter('invitePartiesOnly', checked)}
                  className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/20"
                />
                <Label htmlFor="parties-only" className="text-sm cursor-pointer text-foreground/80 hover:text-foreground transition-colors">
                  Invite Sessions
                </Label>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg ml-auto"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
