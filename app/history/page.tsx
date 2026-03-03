import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { WorkoutSession } from '@/types'
import Link from 'next/link'
import { History, ArrowRight } from 'lucide-react'

const EXERCISE_TYPE_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
}

export default async function HistoryPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!sessions || sessions.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <History className="h-6 w-6 text-indigo-400" />
          <h1 className="text-2xl font-bold">History</h1>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-10 text-center space-y-3">
          <p className="text-slate-400">No workouts saved yet.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:underline"
          >
            Calculate your first warmup
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <History className="h-6 w-6 text-indigo-400" />
        <h1 className="text-2xl font-bold">History</h1>
        <span className="ml-auto text-sm text-slate-500">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {(sessions as WorkoutSession[]).map((session) => (
          <div
            key={session.id}
            className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3"
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
              <div className="text-right shrink-0">
                <p className="text-xl font-bold">{session.working_weight_kg}</p>
                <p className="text-xs text-slate-500">kg working</p>
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
        ))}
      </div>
    </div>
  )
}
