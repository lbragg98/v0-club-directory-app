'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/star-rating'
import { MiniRatingBar } from '@/components/mini-rating-bar'
import { Cat, Dog, MessageCircle, Phone, Users, ShieldCheck, Clock } from 'lucide-react'
import type { Club } from '@/lib/types'

interface ClubCardProps {
  club: Club
  onClick?: () => void
  className?: string
}

const typeIcons = {
  Cat: Cat,
  Dog: Dog,
  Hybrid: Users,
}

export function ClubCard({ club, onClick, className }: ClubCardProps) {
  const TypeIcon = typeIcons[club.type] || Users

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden cursor-pointer',
        'bg-card/80 backdrop-blur-sm',
        'border-border/50 hover:border-primary/30',
        'rounded-2xl',
        'shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/5',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1',
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3 relative">
        {/* Club Name and Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate text-foreground group-hover:text-primary transition-colors duration-200">
              {club.name || 'Unnamed Club'}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <StarRating rating={club.overallRating} size="sm" />
              <span className="text-sm font-medium text-[var(--gold)]">
                {club.overallRating.toFixed(1)}
              </span>
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge
            className={cn(
              'shrink-0 font-medium px-2.5 py-0.5 rounded-lg border-0',
              club.status === 'Open'
                ? 'bg-success/15 text-success'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {club.status}
          </Badge>
        </div>

        {/* Type & Platform Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4">
          <Badge 
            variant="outline" 
            className={cn(
              'gap-1.5 rounded-lg bg-secondary/50 border-border/50 text-secondary-foreground',
              'hover:bg-secondary/70 transition-colors'
            )}
          >
            <TypeIcon className="h-3 w-3" />
            {club.type}
          </Badge>
          <Badge 
            variant="outline" 
            className="gap-1.5 rounded-lg bg-secondary/50 border-border/50 text-secondary-foreground hover:bg-secondary/70 transition-colors"
          >
            {club.platform === 'Line' && <MessageCircle className="h-3 w-3" />}
            {club.platform === 'Disc' && <Phone className="h-3 w-3" />}
            {club.platform}
          </Badge>
          {club.sfwActive && (
            <Badge 
              variant="outline" 
              className="gap-1.5 rounded-lg bg-primary/10 border-primary/20 text-primary hover:bg-primary/15 transition-colors"
            >
              <ShieldCheck className="h-3 w-3" />
              SFW
            </Badge>
          )}
          {club.break === 'yes' && (
            <Badge 
              variant="outline" 
              className="gap-1.5 rounded-lg bg-[var(--gold)]/10 border-[var(--gold)]/20 text-[var(--gold)] hover:bg-[var(--gold)]/15 transition-colors"
            >
              <Clock className="h-3 w-3" />
              Break
            </Badge>
          )}
          {club.break === 'no' && (
            <Badge 
              variant="outline" 
              className="gap-1.5 rounded-lg bg-muted/50 border-border/50 text-muted-foreground"
            >
              <Clock className="h-3 w-3" />
              No Break
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 relative">
        {/* Notes */}
        {club.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {club.notes}
          </p>
        )}

        {/* Rankings */}
        <div className="space-y-2.5 pt-4 border-t border-border/40">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Rankings
          </p>
          <MiniRatingBar label="Invites" value={club.invitesScore} />
          <MiniRatingBar label="Door" value={club.doorScore} />
          <MiniRatingBar label="Calls" value={club.callsScore} />
        </div>
      </CardContent>
    </Card>
  )
}
