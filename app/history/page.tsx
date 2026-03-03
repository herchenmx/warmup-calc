import { createClient } from '@/lib/supabase/server'
import { HistoryList } from '@/components/HistoryList'
import type { WorkoutSession } from '@/types'
import Link from 'next/link'
import { History, ArrowRight } from 'lucide-react'

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

      <HistoryList sessions={sessions as WorkoutSession[]} />
    </div>
  )
}
