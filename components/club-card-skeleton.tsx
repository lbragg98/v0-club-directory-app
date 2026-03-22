'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ClubCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl bg-card/80 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4 bg-secondary" />
            <Skeleton className="h-4 w-24 bg-secondary" />
          </div>
          <Skeleton className="h-6 w-14 rounded-lg bg-secondary" />
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-6 w-16 rounded-lg bg-secondary" />
          <Skeleton className="h-6 w-14 rounded-lg bg-secondary" />
          <Skeleton className="h-6 w-12 rounded-lg bg-secondary" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-8 w-full mb-4 bg-secondary" />
        <div className="space-y-2.5 pt-4 border-t border-border/40">
          <Skeleton className="h-3 w-16 bg-secondary" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-12 bg-secondary" />
            <Skeleton className="h-1.5 flex-1 rounded-full bg-secondary" />
            <Skeleton className="h-3 w-7 bg-secondary" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-12 bg-secondary" />
            <Skeleton className="h-1.5 flex-1 rounded-full bg-secondary" />
            <Skeleton className="h-3 w-7 bg-secondary" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-12 bg-secondary" />
            <Skeleton className="h-1.5 flex-1 rounded-full bg-secondary" />
            <Skeleton className="h-3 w-7 bg-secondary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
