import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/SettingsForm'
import type { UserPreferences } from '@/types'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirectTo=/settings')

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fallback defaults if trigger hasn't created prefs yet
  const preferences: UserPreferences = prefs ?? {
    id: '',
    user_id: user.id,
    default_sets: 4,
    percentages: [40, 60, 80, 90],
    reps: [10, 6, 3, 1],
    exercise_type: 'barbell',
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-indigo-400" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <SettingsForm
        preferences={preferences}
        userId={user.id}
        email={user.email ?? ''}
      />
    </div>
  )
}
