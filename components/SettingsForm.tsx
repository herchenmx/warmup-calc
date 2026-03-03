'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LogOut } from 'lucide-react'

interface Props {
  email: string
}

export function SettingsForm({ email }: Props) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Account info */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Signed in as</p>
        <p className="text-slate-200 font-medium">{email}</p>
      </div>

      <Separator className="bg-slate-800" />

      <Button
        variant="outline"
        onClick={handleSignOut}
        className="w-full border-red-900/50 text-red-400 hover:text-red-300 hover:border-red-800 py-5"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  )
}
