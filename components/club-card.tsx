'use client'

import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/star-rating'
import { MiniRatingBar } from '@/components/mini-rating-bar'
import { cn } from '@/lib/utils'
import {
  Cat,
  Dog,
  Users,
  MessageCircle,
  Phone,
  ShieldCheck,
  Clock,
  Heart,
} from 'lucide-react'
import type { Club } from '@/lib/types'

interface ClubCardProps {
  club: Club
  onClick?: () => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

const typeIcons = {
  Cat: Cat,
  Dog: Dog,
  Hybrid: Users,
}

export function ClubCard({ club, onClick, isFavorite, onToggleFavorite }: ClubCardProps) {
  const TypeIcon = typeIcons[club.type] || Users

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl border p-5 transition-all duration-200',
        'bg-[#2f3136] sm:bg-card backdrop-blur-sm',
        'border-border hover:border-primary/40',
        'hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5'
      )}
    >
      <div className="space-y-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 min-h-[56px]">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {club.name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite?.()
              }}
              className="shrink-0 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={cn(
                  'h-4 w-4',
                  isFavorite ? 'fill-white text-white' : 'text-muted-foreground'
                )}
              />
            </button>

            <Badge
              className={cn(
                'shrink-0 rounded-lg px-2.5 py-0.5 border-0 font-medium',
                club.status === 'Open'
                  ? 'bg-green-500/15 text-green-400'
                  : 'bg-muted/70 text-muted-foreground'
              )}
            >
              {club.status}
            </Badge>
          </div>
        </div>

        {/* Overall rating */}
        <div className="flex items-center gap-3">
          <StarRating rating={club.overallRating} size="md" />
          <span className="text-lg font-bold text-[var(--gold)]">
            {club.overallRating.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">/ 5.0</span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 rounded-lg bg-secondary/70 border-border text-secondary-foreground"
          >
            <TypeIcon className="h-3 w-3" />
            {club.type}
          </Badge>

          <Badge
            variant="outline"
            className="gap-1.5 rounded-lg bg-secondary/70 border-border text-secondary-foreground"
          >
            {club.platform === 'Line' && <MessageCircle className="h-3 w-3" />}
            {club.platform === 'Disc' && <Phone className="h-3 w-3" />}
            {club.platform}
          </Badge>

          {club.sfwFriendly === 'yes' && (
            <Badge
              variant="outline"
              className="rounded-lg border bg-secondary/70 border-border text-secondary-foreground"
            >
              SFW Friendly
            </Badge>
          )}

          {club.sfwActive && (
            <Badge
              variant="outline"
              className="gap-1.5 rounded-lg bg-primary/10 border-primary/20 text-primary"
            >
              <ShieldCheck className="h-3 w-3" />
              Active SFW
            </Badge>
          )}

          <Badge
            variant="outline"
            className={cn(
              'gap-1.5 rounded-lg border',
              club.break === 'yes'
                ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                : 'bg-secondary/70 border-border text-muted-foreground'
            )}
          >
            <Clock className="h-3 w-3" />
            {club.break === 'yes' ? 'Break' : 'No Break'}
          </Badge>

          <Badge
            variant="outline"
            className="rounded-lg border bg-secondary/70 border-border text-secondary-foreground"
          >
            Age: {club.clubAge || 'NA'}
          </Badge>
        </div>

        {/* Description */}
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-3 text-muted-foreground">
            {club.breakTime && (
              <div>
                <span className="text-xs uppercase tracking-wide text-foreground font-medium">
                  Break Time
                </span>
                <p>{['na', 'n/a'].includes(club.breakTime.trim().toLowerCase()) ? 'N/A' : club.breakTime}</p>
              </div>
            )}

            <div>
              <span className="text-xs uppercase tracking-wide text-foreground font-medium">
                Club Type
              </span>
              <p>{club.type}</p>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wide text-foreground font-medium">
                LBGC
              </span>
              <p>{club.platform}</p>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wide text-foreground font-medium">
                SFW
              </span>
              <p>{club.sfwFriendly === 'yes' ? 'Friendly' : club.sfwFriendly === 'cbc' ? 'Case By Case' : 'Not Friendly'}</p>
            </div>
          </div>
          <div className="pt-1">
            <span className="text-xs uppercase tracking-wide text-foreground font-medium">
              Click To See More
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
