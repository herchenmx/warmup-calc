import type { WarmupSet } from '@/types'
import { Badge } from '@/components/ui/badge'

interface Props {
  set: WarmupSet
  isLast: boolean
}

export function WarmupSetCard({ set, isLast }: Props) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">
          Set {set.setNumber}
        </span>
        <Badge
          variant="outline"
          className="border-indigo-800 bg-indigo-950/50 text-indigo-300"
        >
          {set.percentage}%
        </Badge>
      </div>

      <p className="mt-2 text-4xl font-bold tracking-tight">
        {set.weight}
        <span className="ml-1 text-lg font-normal text-slate-400">kg</span>
      </p>

      <p className="mt-1 text-slate-400">
        {set.reps} {set.reps === 1 ? 'rep' : 'reps'}
      </p>

      {!isLast && set.restSeconds && (
        <p className="mt-2 text-xs text-slate-500">
          Rest {set.restSeconds}s before next set
        </p>
      )}
    </div>
  )
}
