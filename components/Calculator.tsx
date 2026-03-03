'use client'

import { useState, useCallback, useEffect } from 'react'
import { Save, Dumbbell } from 'lucide-react'
import { ExerciseSelector } from './ExerciseSelector'
import { WarmupSetCard, WorkingSetCard } from './WarmupSetCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import {
  calculateWorkoutPlan,
  validateWorkoutInput,
  classifyLoad,
  getDefaultWarmupSets,
} from '@/lib/calculator'
import { createClient } from '@/lib/supabase/client'
import type { EquipmentType, WorkoutPlan } from '@/types'
import { cn } from '@/lib/utils'

const DAY_STYLES = {
  heavy:    'bg-red-950/60 text-red-300 border-red-900',
  moderate: 'bg-amber-950/60 text-amber-300 border-amber-900',
  light:    'bg-green-950/60 text-green-300 border-green-900',
}

const DAY_LABELS = {
  heavy:    'Heavy',
  moderate: 'Moderate',
  light:    'Light',
}

const LOAD_PCT_LABEL = {
  heavy:    '>85% of 1RM',
  moderate: '65–85% of 1RM',
  light:    '<65% of 1RM',
}

interface Props {
  userId?: string | null
}

export function Calculator({ userId }: Props) {
  const { toast } = useToast()

  // ── Inputs ─────────────────────────────────────────────────────────────────
  const [exerciseName, setExerciseName]   = useState('')
  const [equipment, setEquipment]         = useState<EquipmentType>('barbell')
  const [oneRepMax, setOneRepMax]         = useState('')
  const [targetWeight, setTargetWeight]   = useState('')
  const [targetReps, setTargetReps]       = useState('')
  const [targetSets, setTargetSets]       = useState('')
  const [numWarmupSets, setNumWarmupSets] = useState<number>(2)

  // ── Output ─────────────────────────────────────────────────────────────────
  const [plan, setPlan]     = useState<WorkoutPlan | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Derive live load classification whenever 1RM + target weight are both valid
  const orm = parseFloat(oneRepMax)
  const tw  = parseFloat(targetWeight)
  const liveClassification =
    !isNaN(orm) && orm > 0 && !isNaN(tw) && tw > 0 && tw <= orm
      ? classifyLoad(tw, orm)
      : null

  // Auto-update warmup set default when equipment or live classification changes
  useEffect(() => {
    if (liveClassification) {
      setNumWarmupSets(getDefaultWarmupSets(equipment, liveClassification))
    }
    setPlan(null)
    setError(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipment, oneRepMax, targetWeight])

  const handleCalculate = useCallback(() => {
    const ormVal = parseFloat(oneRepMax)
    const twVal  = parseFloat(targetWeight)
    const trVal  = parseInt(targetReps, 10)
    const tsVal  = parseInt(targetSets, 10)

    const err = validateWorkoutInput(ormVal, twVal, trVal, tsVal)
    if (err) {
      setError(err)
      setPlan(null)
      return
    }
    setError(null)
    setPlan(
      calculateWorkoutPlan({
        exerciseName: exerciseName.trim() || 'Exercise',
        equipment,
        oneRepMax: ormVal,
        targetWeight: twVal,
        targetReps: trVal,
        targetSets: tsVal,
        numWarmupSets,
      })
    )
  }, [exerciseName, equipment, oneRepMax, targetWeight, targetReps, targetSets, numWarmupSets])

  const handleSave = async () => {
    if (!userId) {
      toast({ title: 'Sign in to save workouts', variant: 'destructive' })
      return
    }
    if (!plan) return

    setSaving(true)
    const supabase = createClient()
    const { error: dbError } = await supabase.from('workout_sessions').insert({
      user_id: userId,
      exercise_name: exerciseName.trim() || 'Unnamed exercise',
      exercise_type: equipment,
      working_weight_kg: plan.workingSet.weight,
      one_rep_max_kg: parseFloat(oneRepMax),
      target_reps: plan.workingSet.reps,
      target_sets: plan.workingSet.sets,
      warmup_sets: plan.warmupSets,
    })
    setSaving(false)

    if (dbError) {
      toast({ title: 'Failed to save', description: dbError.message, variant: 'destructive' })
    } else {
      toast({ title: 'Workout saved to history!' })
    }
  }

  const loadPct =
    !isNaN(orm) && orm > 0 && !isNaN(tw) && tw > 0
      ? Math.round((tw / orm) * 100)
      : null

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Dumbbell className="h-6 w-6 text-indigo-400" />
        <h1 className="text-2xl font-bold">Warmup Calculator</h1>
      </div>

      {/* Equipment */}
      <ExerciseSelector value={equipment} onChange={setEquipment} />

      {/* Exercise name */}
      <div className="space-y-1.5">
        <Label htmlFor="exerciseName" className="text-slate-400">
          Exercise name <span className="text-slate-600">(optional)</span>
        </Label>
        <Input
          id="exerciseName"
          placeholder="e.g. Back Squat"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          className="bg-slate-900 border-slate-700 placeholder:text-slate-600"
        />
      </div>

      {/* 1RM */}
      <div className="space-y-1.5">
        <Label htmlFor="orm" className="text-slate-400">1RM (kg)</Label>
        <Input
          id="orm"
          type="number"
          inputMode="decimal"
          placeholder="e.g. 120"
          value={oneRepMax}
          onChange={(e) => setOneRepMax(e.target.value)}
          className="bg-slate-900 border-slate-700 h-12 text-lg"
        />
      </div>

      {/* Target weight / reps / sets — 3-col grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="tw" className="text-slate-400">Weight (kg)</Label>
          <Input
            id="tw"
            type="number"
            inputMode="decimal"
            placeholder="100"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            className="bg-slate-900 border-slate-700 h-12 text-lg"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tr" className="text-slate-400">Reps</Label>
          <Input
            id="tr"
            type="number"
            inputMode="numeric"
            placeholder="5"
            value={targetReps}
            onChange={(e) => setTargetReps(e.target.value)}
            className="bg-slate-900 border-slate-700 h-12 text-lg"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ts" className="text-slate-400">Sets</Label>
          <Input
            id="ts"
            type="number"
            inputMode="numeric"
            placeholder="3"
            value={targetSets}
            onChange={(e) => setTargetSets(e.target.value)}
            className="bg-slate-900 border-slate-700 h-12 text-lg"
          />
        </div>
      </div>

      {/* Live load classification banner */}
      {liveClassification && loadPct !== null && (
        <div className={cn('rounded-xl border px-4 py-3 text-sm', DAY_STYLES[liveClassification])}>
          <span className="font-semibold">{DAY_LABELS[liveClassification]} load</span>
          {' — '}
          {loadPct}% of 1RM &middot; {LOAD_PCT_LABEL[liveClassification]}
        </div>
      )}

      {/* Warmup sets chip selector */}
      <div className="space-y-2">
        <Label className="text-slate-400">
          Warmup sets
          {liveClassification && (
            <span className="ml-1.5 text-slate-600 font-normal text-xs">
              (suggested {getDefaultWarmupSets(equipment, liveClassification)} for {DAY_LABELS[liveClassification].toLowerCase()} load)
            </span>
          )}
        </Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => { setNumWarmupSets(n); setPlan(null) }}
              className={cn(
                'flex-1 rounded-xl border py-3 text-sm font-semibold transition-colors touch-manipulation min-h-[48px]',
                numWarmupSets === n
                  ? 'border-indigo-600 bg-indigo-950/60 text-indigo-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Calculate */}
      <Button
        onClick={handleCalculate}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 text-base font-semibold"
        disabled={!oneRepMax || !targetWeight || !targetReps || !targetSets}
      >
        Calculate
      </Button>

      {/* Error */}
      {error && (
        <p className="rounded-xl bg-red-950/60 border border-red-900 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* Results */}
      {plan && (
        <>
          <Separator className="bg-slate-800" />

          {/* Session header */}
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-200">
              {exerciseName.trim() || 'Your session'}
            </p>
            <span className={cn(
              'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
              DAY_STYLES[plan.classification]
            )}>
              {DAY_LABELS[plan.classification]}
            </span>
          </div>

          {/* Warmup sets */}
          <div className="space-y-3">
            {plan.warmupSets.map((set) => (
              <WarmupSetCard key={set.setNumber} set={set} />
            ))}
          </div>

          {/* Working set */}
          <WorkingSetCard workingSet={plan.workingSet} />

          {/* Save */}
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving}
            className="w-full border-slate-700 py-5 text-slate-300 hover:text-white hover:border-slate-600"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : userId ? 'Save to history' : 'Sign in to save'}
          </Button>
        </>
      )}
    </div>
  )
}
