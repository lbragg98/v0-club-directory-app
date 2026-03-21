'use client'

import { Search } from 'lucide-react'
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
      openOnly: false,
      sfwOnly: false,
      invitePartiesOnly: false,
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.type !== 'All' ||
    filters.platform !== 'All' ||
    filters.openOnly ||
    filters.sfwOnly ||
    filters.invitePartiesOnly

  return (
    <div
      className={cn(
        'bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm',
        className
      )}
    >
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clubs..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-3">
          <Select
            value={filters.type}
            onValueChange={(value) =>
              updateFilter('type', value as ClubFilters['type'])
            }
          >
            <SelectTrigger className="w-[130px] bg-background">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Cat">Cat</SelectItem>
              <SelectItem value="Dog">Dog</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.platform}
            onValueChange={(value) =>
              updateFilter('platform', value as ClubFilters['platform'])
            }
          >
            <SelectTrigger className="w-[130px] bg-background">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Platforms</SelectItem>
              <SelectItem value="Line">Line</SelectItem>
              <SelectItem value="Disc">Disc</SelectItem>
              <SelectItem value="Both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Toggle Switches */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="open-only"
              checked={filters.openOnly}
              onCheckedChange={(checked) => updateFilter('openOnly', checked)}
            />
            <Label htmlFor="open-only" className="text-sm cursor-pointer">
              Open Only
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="sfw-only"
              checked={filters.sfwOnly}
              onCheckedChange={(checked) => updateFilter('sfwOnly', checked)}
            />
            <Label htmlFor="sfw-only" className="text-sm cursor-pointer">
              SFW Friendly
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="parties-only"
              checked={filters.invitePartiesOnly}
              onCheckedChange={(checked) =>
                updateFilter('invitePartiesOnly', checked)
              }
            />
            <Label htmlFor="parties-only" className="text-sm cursor-pointer">
              Invite Parties
            </Label>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
