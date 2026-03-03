import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/SettingsForm'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirectTo=/settings')

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-indigo-400" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <SettingsForm email={user.email ?? ''} />
    </div>
  )
}
