import type { WarmupSet, WorkingSet } from '@/types'
import { Badge } from '@/components/ui/badge'

interface WarmupProps {
  set: WarmupSet
}

export function WarmupSetCard({ set }: WarmupProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">
          Warmup {set.setNumber}
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
    </div>
  )
}

interface WorkingProps {
  workingSet: WorkingSet
}

export function WorkingSetCard({ workingSet }: WorkingProps) {
  return (
    <div className="rounded-xl border border-indigo-700 bg-indigo-950/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-indigo-300">
          Working {workingSet.sets > 1 ? `(${workingSet.sets} sets)` : 'set'}
        </span>
        <Badge className="bg-indigo-600 text-white border-transparent">
          Target
        </Badge>
      </div>
      <p className="mt-2 text-4xl font-bold tracking-tight">
        {workingSet.weight}
        <span className="ml-1 text-lg font-normal text-indigo-300">kg</span>
      </p>
      <p className="mt-1 text-indigo-300">
        {workingSet.sets} × {workingSet.reps} {workingSet.reps === 1 ? 'rep' : 'reps'}
      </p>
    </div>
  )
}
