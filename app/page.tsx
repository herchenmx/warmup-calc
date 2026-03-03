import { createClient } from '@/lib/supabase/server'
import { Calculator } from '@/components/Calculator'
import type { UserPreferences } from '@/types'

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let preferences: UserPreferences | null = null
  if (user) {
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()
    preferences = data
  }

  return <Calculator initialPreferences={preferences} userId={user?.id ?? null} />
}
