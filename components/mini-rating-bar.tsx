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
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs font-medium text-muted-foreground w-12">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-foreground w-6 text-right">
        {value.toFixed(1)}
      </span>
    </div>
  )
}
