'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Zap,
  Coffee,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import type { Club } from '@/lib/types'

interface ClubDetailModalProps {
  club: Club | null
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function ClubDetailModal({
  club,
  open,
  onOpenChange,
}: ClubDetailModalProps) {
  if (!club) return null

  const TypeIcon = typeIcons[club.type] || Users

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-xl">{club.name}</DialogTitle>
            <Badge
              variant={club.status === 'Open' ? 'default' : 'secondary'}
              className={cn(
                club.status === 'Open'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {club.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Overall Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={club.overallRating} size="lg" />
            <span className="text-2xl font-bold text-foreground">
              {club.overallRating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">/ 5.0</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn('gap-1.5 text-sm', typeColors[club.type])}
            >
              <TypeIcon className="h-4 w-4" />
              {club.type}
            </Badge>
            <Badge
              variant="outline"
              className={cn('text-sm', platformColors[club.platform])}
            >
              {club.platform === 'Line' && (
                <MessageCircle className="h-4 w-4 mr-1.5" />
              )}
              {club.platform === 'Disc' && <Phone className="h-4 w-4 mr-1.5" />}
              {club.platform}
            </Badge>
            {club.sfwFriendly && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 gap-1.5 text-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                SFW Friendly
              </Badge>
            )}
            {club.sfwActive && (
              <Badge
                variant="outline"
                className="bg-cyan-50 text-cyan-700 border-cyan-200 gap-1.5 text-sm"
              >
                <Zap className="h-4 w-4" />
                Active SFW
              </Badge>
            )}
            {club.break && (
              <Badge
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200 gap-1.5 text-sm"
              >
                <Coffee className="h-4 w-4" />
                On Break
              </Badge>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-2 text-sm">
            <h4 className="font-medium text-foreground">Details</h4>
            <div className="space-y-1 text-muted-foreground">
              <p><span className="font-medium text-foreground">Club Type:</span> {club.type}</p>
              <p><span className="font-medium text-foreground">Platform:</span> {club.platform}</p>
              <p><span className="font-medium text-foreground">SFW Status:</span> {club.sfwFriendly ? 'SFW Friendly' : 'Not SFW'}</p>
              {club.break && (
                <p><span className="font-medium text-foreground">Break:</span> Yes{club.breakTime ? ` - ${club.breakTime}` : ''}</p>
              )}
              {club.notes && (
                <p><span className="font-medium text-foreground">Comments:</span> {club.notes}</p>
              )}
            </div>
          </div>

          {/* Rankings Section - Separate from description */}
          <div className="space-y-3 bg-muted/50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Rankings
            </h4>
            <MiniRatingBar label="Invites" value={club.invitesScore} />
            <MiniRatingBar label="Door" value={club.doorScore} />
            <MiniRatingBar label="Calls" value={club.callsScore} />
          </div>

          {/* Quick Link */}
          {club.quickLink && (
            <a
              href={club.quickLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Visit Club
            </a>
          )}

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last updated: {new Date(club.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
