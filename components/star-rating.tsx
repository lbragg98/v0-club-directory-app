'use client'

import { Star, StarHalf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className={cn(
            sizeClasses[size],
            'fill-white text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]'
          )}
        />
      ))}

      {hasHalfStar && (
        <div className="relative">
          <Star className={cn(sizeClasses[size], 'text-border')} />
          <StarHalf
            className={cn(
              sizeClasses[size],
              'absolute left-0 top-0 fill-white text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]'
            )}
          />
        </div>
      )}

      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn(sizeClasses[size], 'text-border')}
        />
      ))}

      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-[var(--gold)]">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
