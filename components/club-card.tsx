'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/star-rating'
import { MiniRatingBar } from '@/components/mini-rating-bar'
import { Cat, Dog, MessageCircle, Phone, Users, ShieldCheck, PartyPopper } from 'lucide-react'
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

const typeColors = {
  Cat: 'bg-pink-100 text-pink-700 border-pink-200',
  Dog: 'bg-blue-100 text-blue-700 border-blue-200',
  Hybrid: 'bg-purple-100 text-purple-700 border-purple-200',
}

const platformColors = {
  Line: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Disc: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Both: 'bg-amber-100 text-amber-700 border-amber-200',
}

export function ClubCard({ club, onClick, className }: ClubCardProps) {
  const TypeIcon = typeIcons[club.type]

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden cursor-pointer transition-all duration-300',
        'hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1',
        'border-border/50 hover:border-primary/20',
        className
      )}
    >
      {/* Gradient accent line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate text-foreground group-hover:text-primary transition-colors">
              {club.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <StarRating rating={club.overallRating} size="sm" />
              <span className="text-sm font-medium text-muted-foreground">
                {club.overallRating.toFixed(1)}
              </span>
            </div>
          </div>
          
          <Badge
            variant={club.status === 'Open' ? 'default' : 'secondary'}
            className={cn(
              'shrink-0',
              club.status === 'Open'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {club.status}
          </Badge>
        </div>

        {/* Type & Platform Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <Badge variant="outline" className={cn('gap-1', typeColors[club.type])}>
            <TypeIcon className="h-3 w-3" />
            {club.type}
          </Badge>
          <Badge variant="outline" className={cn(platformColors[club.platform])}>
            {club.platform === 'Line' && <MessageCircle className="h-3 w-3 mr-1" />}
            {club.platform === 'Disc' && <Phone className="h-3 w-3 mr-1" />}
            {club.platform}
          </Badge>
          {club.sfwFriendly && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
              <ShieldCheck className="h-3 w-3" />
              SFW
            </Badge>
          )}
          {club.inviteParties && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1">
              <PartyPopper className="h-3 w-3" />
              Parties
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Mini Rating Bars */}
        <div className="space-y-2">
          <MiniRatingBar label="Invites" value={club.invitesScore} />
          <MiniRatingBar label="Door" value={club.doorScore} />
          <MiniRatingBar label="Calls" value={club.callsScore} />
        </div>

        {/* Notes preview */}
        {club.notes && (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
            {club.notes}
          </p>
        )}
      </CardContent>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  )
}
