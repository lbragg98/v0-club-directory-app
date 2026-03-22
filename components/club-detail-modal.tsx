'use client'

import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Calendar,
  Clock,
  Zap,
  User,
  Copy,
  Check,
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

export function ClubDetailModal({
  club,
  open,
  onOpenChange,
}: ClubDetailModalProps) {
  const [copiedLink, setCopiedLink] = useState(false)

  async function handleCopyLink() {
    if (!club?.quickLink) return

    try {
      await navigator.clipboard.writeText(club.quickLink)
      setCopiedLink(true)

      setTimeout(() => {
        setCopiedLink(false)
      }, 1500)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  if (!club) return null

  const TypeIcon = typeIcons[club.type] || Users

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-border/50 bg-card">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-xl">{club.name}</DialogTitle>
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
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Overall Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={club.overallRating} size="lg" />
            <span className="text-2xl font-bold text-[var(--gold)]">
              {club.overallRating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">/ 5.0</span>
          </div>

          {/* Type / Platform badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 text-sm rounded-lg bg-secondary/50 border-border/50 text-secondary-foreground"
            >
              <TypeIcon className="h-4 w-4" />
              {club.type}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1.5 text-sm rounded-lg bg-secondary/50 border-border/50 text-secondary-foreground"
            >
              {club.platform === 'Line' && <MessageCircle className="h-4 w-4" />}
              {club.platform === 'Disc' && <Phone className="h-4 w-4" />}
              {club.platform}
            </Badge>
            {club.sfwActive && (
              <Badge
                variant="outline"
                className="gap-1.5 text-sm rounded-lg bg-primary/10 border-primary/20 text-primary"
              >
                <ShieldCheck className="h-4 w-4" />
                SFW Active
              </Badge>
            )}
            {club.break === 'yes' && (
              <Badge
                variant="outline"
                className="gap-1.5 text-sm rounded-lg bg-[var(--gold)]/10 border-[var(--gold)]/20 text-[var(--gold)]"
              >
                <Clock className="h-4 w-4" />
                Has Break
              </Badge>
            )}
            {club.break === 'no' && (
              <Badge
                variant="outline"
                className="gap-1.5 text-sm rounded-lg bg-muted/50 border-border/50 text-muted-foreground"
              >
                <Clock className="h-4 w-4" />
                No Break
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-foreground">Details</h4>
            <div className="grid grid-cols-2 gap-4 text-muted-foreground">
              <div className="space-y-1">
                <span className="font-medium text-foreground text-xs uppercase tracking-wide">SFW Friendly</span>
                <p>{club.sfwFriendly ? 'Yes' : 'No'}</p>
              </div>
              {club.breakTime && (
                <div className="space-y-1">
                  <span className="font-medium text-foreground text-xs uppercase tracking-wide flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Break Time
                  </span>
                  <p>{club.breakTime}</p>
                </div>
              )}
              {club.avgLbSpeed && (
                <div className="space-y-1">
                  <span className="font-medium text-foreground text-xs uppercase tracking-wide flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Avg LB Speed
                  </span>
                  <p>{club.avgLbSpeed}</p>
                </div>
              )}
              {club.quickLink && (
                <div className="space-y-1">
                  <span className="font-medium text-foreground text-xs uppercase tracking-wide flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Quick Link
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground break-all">{club.quickLink}</p>
                    <button
                      onClick={handleCopyLink}
                      className="shrink-0 flex items-center justify-center px-2 py-1 rounded-md bg-secondary/60 ring-1 ring-border/40 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedLink ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {club.notes && (
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-foreground">Comments</h4>
              <p className="text-muted-foreground leading-relaxed">{club.notes}</p>
            </div>
          )}

          {/* Rankings */}
          <div className="space-y-3 bg-secondary/30 rounded-xl p-4 ring-1 ring-border/30">
            <h4 className="text-sm font-semibold text-foreground">Rankings</h4>
            <MiniRatingBar label="Invites" value={club.invitesScore} />
            <MiniRatingBar label="Door" value={club.doorScore} />
            <MiniRatingBar label="Calls" value={club.callsScore} />
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border/40">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last updated: {new Date(club.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}