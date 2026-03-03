'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { ExerciseSelector } from './ExerciseSelector'
import type { ExerciseType, UserPreferences } from '@/types'
import { LogOut, Save } from 'lucide-react'

interface Props {
  preferences: UserPreferences
  userId: string
  email: string
}

export function SettingsForm({ preferences, userId, email }: Props) {
  const { toast } = useToast()
  const router = useRouter()

  const [exerciseType, setExerciseType] = useState<ExerciseType>(
    preferences.exercise_type
  )
  const [defaultSets, setDefaultSets] = useState(
    preferences.default_sets.toString()
  )
  const [percentages, setPercentages] = useState(
    preferences.percentages.join(', ')
  )
  const [reps, setReps] = useState(preferences.reps.join(', '))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const parsedSets = parseInt(defaultSets, 10)
    const parsedPercentages = percentages
      .split(',')
      .map((p) => parseInt(p.trim(), 10))
      .filter((n) => !isNaN(n))
    const parsedReps = reps
      .split(',')
      .map((r) => parseInt(r.trim(), 10))
      .filter((n) => !isNaN(n))

    if (
      isNaN(parsedSets) ||
      parsedPercentages.length === 0 ||
      parsedReps.length === 0
    ) {
      toast({
        title: 'Invalid settings',
        description: 'Check your percentages and reps values.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('user_preferences').upsert({
      user_id: userId,
      exercise_type: exerciseType,
      default_sets: parsedSets,
      percentages: parsedPercentages,
      reps: parsedReps,
    })
    setSaving(false)

    if (error) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Preferences saved!' })
      router.refresh()
    }
  }

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

      <h2 className="text-base font-semibold text-slate-300">Default preferences</h2>
      <p className="text-sm text-slate-500 -mt-4">
        Applied when you open the calculator. Override anytime.
      </p>

      {/* Default exercise type */}
      <ExerciseSelector value={exerciseType} onChange={setExerciseType} />

      {/* Default sets */}
      <div className="space-y-1.5">
        <Label htmlFor="defaultSets" className="text-slate-400">
          Default warmup sets
        </Label>
        <Input
          id="defaultSets"
          type="number"
          inputMode="numeric"
          value={defaultSets}
          onChange={(e) => setDefaultSets(e.target.value)}
          min={0}
          max={5}
          className="bg-slate-900 border-slate-700"
        />
      </div>

      {/* Percentages */}
      <div className="space-y-1.5">
        <Label htmlFor="percentages" className="text-slate-400">
          Percentages (comma-separated)
        </Label>
        <Input
          id="percentages"
          value={percentages}
          onChange={(e) => setPercentages(e.target.value)}
          placeholder="40, 60, 80, 90"
          className="bg-slate-900 border-slate-700"
        />
        <p className="text-xs text-slate-600">e.g. 40, 60, 80, 90</p>
      </div>

      {/* Reps */}
      <div className="space-y-1.5">
        <Label htmlFor="reps" className="text-slate-400">
          Reps per set (comma-separated)
        </Label>
        <Input
          id="reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="10, 6, 3, 1"
          className="bg-slate-900 border-slate-700"
        />
        <p className="text-xs text-slate-600">e.g. 10, 6, 3, 1</p>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 text-base font-semibold"
      >
        <Save className="mr-2 h-4 w-4" />
        {saving ? 'Saving...' : 'Save preferences'}
      </Button>

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
