import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg bg-white/[0.06]" />
          <Skeleton className="h-4 w-72 rounded bg-white/[0.04]" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg bg-white/[0.06]" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-white/[0.08] bg-white/[0.02]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg bg-white/[0.06]" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-16 bg-white/[0.04]" />
                  <Skeleton className="h-5 w-24 bg-white/[0.06]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <Card className="border-white/[0.08] bg-white/[0.02]">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <Skeleton className="h-5 w-36 bg-white/[0.06]" />
            <Skeleton className="h-8 w-24 rounded bg-white/[0.04]" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-10 w-10 rounded-full bg-white/[0.05]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3 bg-white/[0.06]" />
                  <Skeleton className="h-3 w-1/4 bg-white/[0.04]" />
                </div>
                <Skeleton className="h-7 w-20 rounded-md bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
