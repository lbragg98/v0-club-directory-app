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
} from 'lucide-react'
import type { Club } from '@/lib/types'

interface ClubCardProps {
  club: Club
  onClick?: () => void
}

const typeIcons = {
  Cat: Cat,
  Dog: Dog,
  Hybrid: Users,
}

export function ClubCard({ club, onClick }: ClubCardProps) {
  const TypeIcon = typeIcons[club.type] || Users

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl border p-5 transition-all duration-200',
        'bg-card backdrop-blur-sm',
        'border-border hover:border-primary/40',
        'hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5'
      )}
    >
      <div className="space-y-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {club.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {club.type} Club on {club.platform}
            </p>
          </div>

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

          <Badge
            variant="outline"
            className={cn(
              'rounded-lg border',
              club.sfwFriendly
                ? 'bg-secondary/70 border-border text-secondary-foreground'
                : 'bg-muted/70 border-border text-muted-foreground'
            )}
          >
            SFW Friendly
          </Badge>

          {club.sfwActive && (
            <Badge
              variant="outline"
              className="gap-1.5 rounded-lg bg-primary/10 border-primary/20 text-primary"
            >
              <ShieldCheck className="h-3 w-3" />
              Active SFW
            </Badge>
          )}

          {club.break === 'yes' && (
            <Badge
              variant="outline"
              className="gap-1.5 rounded-lg bg-secondary/70 border-border text-secondary-foreground"
            >
              <Clock className="h-3 w-3" />
              Break
            </Badge>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-3 text-muted-foreground">
            <div>
              <span className="text-xs uppercase tracking-wide text-foreground font-medium">
                Break
              </span>
              <p>{club.break === 'yes' ? 'Yes' : 'No'}</p>
            </div>

            {club.breakTime && (
              <div>
                <span className="text-xs uppercase tracking-wide text-foreground font-medium">
                  Break Time
                </span>
                <p>{club.breakTime}</p>
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
              <p>{club.sfwFriendly ? 'Friendly' : 'Not Friendly'}</p>
            </div>
          </div>

          {club.notes && (
            <div className="pt-1">
              <span className="text-xs uppercase tracking-wide text-foreground font-medium">
                Comments
              </span>
              <p className="text-xs text-foreground/80 leading-relaxed mt-1 line-clamp-3">
                {club.notes}
              </p>
            </div>
          )}
        </div>

        {/* Rankings */}
        <div className="space-y-2.5 pt-4 mt-4 border-t border-border/50 bg-secondary/20 rounded-lg px-3 pb-3">
          <h4 className="text-sm font-semibold text-foreground pt-3">
            Rankings
          </h4>
          <MiniRatingBar label="Invites" value={club.invitesScore} />
          <MiniRatingBar label="Door" value={club.doorScore} />
          <MiniRatingBar label="Calls" value={club.callsScore} />
        </div>
      </div>
    </button>
  )
}
