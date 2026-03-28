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
  const percentage = Math.min((value / maxValue) * 100, 100)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-xs font-medium text-muted-foreground w-12 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: 'rgba(255,255,255,0.9)',
            boxShadow: '0 0 6px 1px rgba(255,255,255,0.5), 0 0 12px 2px rgba(255,255,255,0.2)',
          }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground/90 w-7 text-right tabular-nums shrink-0">
        {value.toFixed(1)}
      </span>
    </div>
  )
}
