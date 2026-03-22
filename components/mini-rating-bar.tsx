'use client'

import { cn } from '@/lib/utils'

interface MiniRatingBarProps {
  label: string
  value: number
  maxValue?: number
  className?: string
}

export function MiniRatingBar({
  label,
  value,
  maxValue = 5,
  className,
}: MiniRatingBarProps) {
  const percentage = (value / maxValue) * 100

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-xs font-medium text-muted-foreground w-12">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-secondary/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground w-7 text-right tabular-nums">
        {value.toFixed(1)}
      </span>
    </div>
  )
}
