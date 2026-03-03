import { createClient } from '@/lib/supabase/server'
import { Calculator } from '@/components/Calculator'

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <Calculator userId={user?.id ?? null} />
}
