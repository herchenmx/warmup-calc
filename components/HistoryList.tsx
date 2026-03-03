'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { deleteSession } from '@/app/history/actions'
import { formatDate, cn } from '@/lib/utils'
import type { WorkoutSession } from '@/types'

const EXERCISE_TYPE_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
}

interface Props {
  sessions: WorkoutSession[]
}

export function HistoryList({ sessions: initial }: Props) {
  const { toast } = useToast()
  const [sessions, setSessions] = useState(initial)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    // Optimistic removal
    setSessions((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(id)

    try {
      await deleteSession(id)
    } catch {
      // Rollback on failure
      setSessions(initial)
      toast({
        title: 'Could not delete session',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (sessions.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        No sessions left.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const isDeleting = deletingId === session.id
        return (
          <div
            key={session.id}
            className={cn(
              'rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3 transition-opacity',
              isDeleting && 'opacity-40 pointer-events-none'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{session.exercise_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="border-slate-700 text-slate-400 text-xs"
                  >
                    {EXERCISE_TYPE_LABELS[session.exercise_type] ?? session.exercise_type}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {formatDate(session.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-xl font-bold">{session.working_weight_kg}</p>
                  <p className="text-xs text-slate-500">kg working</p>
                </div>
                <button
                  onClick={() => handleDelete(session.id)}
                  aria-label="Delete session"
                  className="mt-0.5 rounded-lg p-2 text-slate-600 hover:bg-red-950/60 hover:text-red-400 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {session.warmup_sets.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {session.warmup_sets.map((s) => (
                  <span
                    key={s.setNumber}
                    className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
                  >
                    {s.weight} kg × {s.reps}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
