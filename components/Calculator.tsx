'use client'

import { useState, useCallback, useEffect } from 'react'
import { Save, Dumbbell } from 'lucide-react'
import { ExerciseSelector } from './ExerciseSelector'
import { WarmupSetCard } from './WarmupSetCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import {
  calculateWarmupSets,
  getRecommendation,
  validateCalculatorInput,
  EXERCISE_TYPE_CONFIGS,
  getPercentagesForSets,
  getRepsForSets,
} from '@/lib/calculator'
import { createClient } from '@/lib/supabase/client'
import type { ExerciseType, WarmupSet, UserPreferences } from '@/types'
import { cn } from '@/lib/utils'

const DAY_STYLES = {
  heavy: 'bg-red-950/60 text-red-300 border-red-900',
  moderate: 'bg-amber-950/60 text-amber-300 border-amber-900',
  light: 'bg-green-950/60 text-green-300 border-green-900',
}

interface Props {
  initialPreferences?: UserPreferences | null
  userId?: string | null
}

export function Calculator({ initialPreferences, userId }: Props) {
  const { toast } = useToast()

  const [exerciseName, setExerciseName] = useState('')
  const [exerciseType, setExerciseType] = useState<ExerciseType>(
    initialPreferences?.exercise_type ?? 'barbell'
  )
  const [workingWeight, setWorkingWeight] = useState('')
  const [numSets, setNumSets] = useState(
    initialPreferences?.default_sets ?? EXERCISE_TYPE_CONFIGS['barbell'].defaultSets
  )
  const [percentages, setPercentages] = useState<number[]>(
    initialPreferences?.percentages ??
      getPercentagesForSets('barbell', EXERCISE_TYPE_CONFIGS['barbell'].defaultSets)
  )
  const [reps, setReps] = useState<number[]>(
    initialPreferences?.reps ??
      getRepsForSets('barbell', EXERCISE_TYPE_CONFIGS['barbell'].defaultSets)
  )
  const [warmupSets, setWarmupSets] = useState<WarmupSet[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // When exercise type changes, reset to that type's defaults
  useEffect(() => {
    const config = EXERCISE_TYPE_CONFIGS[exerciseType]
    const sets = config.defaultSets
    setNumSets(sets)
    setPercentages(getPercentagesForSets(exerciseType, sets))
    setReps(getRepsForSets(exerciseType, sets))
    setWarmupSets([])
    setError(null)
  }, [exerciseType])

  // When numSets changes, resize percentages/reps arrays
  const handleNumSetsChange = useCallback(
    (n: number) => {
      setNumSets(n)
      setPercentages(getPercentagesForSets(exerciseType, n))
      setReps(getRepsForSets(exerciseType, n))
      setWarmupSets([])
    },
    [exerciseType]
  )

  const handleCalculate = useCallback(() => {
    const weight = parseFloat(workingWeight)
    const err = validateCalculatorInput(weight, numSets, percentages, reps)
    if (err) {
      setError(err)
      setWarmupSets([])
      return
    }
    setError(null)
    setWarmupSets(
      calculateWarmupSets({ workingWeight: weight, numSets, percentages, reps })
    )
  }, [workingWeight, numSets, percentages, reps])

  // Allow Enter key to trigger calculation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCalculate()
  }

  const weight = parseFloat(workingWeight)
  const recommendation =
    !isNaN(weight) && weight > 0
      ? getRecommendation(weight, exerciseType)
      : null

  const handleSave = async () => {
    if (!userId) {
      toast({ title: 'Sign in to save workouts', variant: 'destructive' })
      return
    }
    if (warmupSets.length === 0) return

    setSaving(true)
    const supabase = createClient()
    const { error: dbError } = await supabase.from('workout_sessions').insert({
      user_id: userId,
      exercise_name: exerciseName.trim() || 'Unnamed exercise',
      exercise_type: exerciseType,
      working_weight_kg: parseFloat(workingWeight),
      warmup_sets: warmupSets,
    })
    setSaving(false)

    if (dbError) {
      toast({
        title: 'Failed to save',
        description: dbError.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Workout saved to history!' })
    }
  }

  const config = EXERCISE_TYPE_CONFIGS[exerciseType]
  const setSizeOptions = Object.keys(config.setOptions).map(Number).sort((a, b) => a - b)

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Dumbbell className="h-6 w-6 text-indigo-400" />
        <h1 className="text-2xl font-bold">Warmup Calculator</h1>
      </div>

      {/* Exercise type */}
      <ExerciseSelector value={exerciseType} onChange={setExerciseType} />

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

      {/* Working weight */}
      <div className="space-y-1.5">
        <Label htmlFor="weight" className="text-slate-400">
          Working weight (kg)
        </Label>
        <Input
          id="weight"
          type="number"
          inputMode="decimal"
          placeholder="100"
          value={workingWeight}
          onChange={(e) => {
            setWorkingWeight(e.target.value)
            setWarmupSets([])
          }}
          onKeyDown={handleKeyDown}
          className="bg-slate-900 border-slate-700 text-xl h-12"
        />
      </div>

      {/* Recommendation banner */}
      {recommendation && (
        <div
          className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            DAY_STYLES[recommendation.classification]
          )}
        >
          <span className="font-semibold capitalize">
            {recommendation.classification} day
          </span>
          {' — '}
          {recommendation.rationale}
        </div>
      )}

      {/* Number of warmup sets (only show if more than one positive option exists) */}
      {setSizeOptions.filter((n) => n > 0).length > 1 && (
        <div className="space-y-2">
          <Label className="text-slate-400">
            Warmup sets:{' '}
            <span className="text-slate-200 font-semibold">{numSets}</span>
          </Label>
          <div className="flex gap-2">
            {setSizeOptions.filter((n) => n > 0).map((n) => (
              <Button
                key={n}
                variant={numSets === n ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleNumSetsChange(n)}
                className={cn(
                  'min-w-[44px] min-h-[44px]',
                  numSets === n
                    ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-600'
                    : 'border-slate-700 text-slate-300'
                )}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Set preview chips */}
      {numSets > 0 && (
        <div className="flex flex-wrap gap-2">
          {percentages.slice(0, numSets).map((pct, i) => (
            <span
              key={i}
              className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400"
            >
              {pct}% × {reps[i] ?? '?'}
            </span>
          ))}
        </div>
      )}

      {/* Calculate button */}
      <Button
        onClick={handleCalculate}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 text-base font-semibold"
        disabled={!workingWeight}
      >
        Calculate Warmup Sets
      </Button>

      {/* Error */}
      {error && (
        <p className="rounded-xl bg-red-950/60 border border-red-900 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* Results */}
      {warmupSets.length > 0 && (
        <>
          <Separator className="bg-slate-800" />

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-400">
                Working weight:{' '}
                <span className="text-slate-200 font-bold">
                  {workingWeight} kg
                </span>
              </p>
              <p className="text-sm text-slate-500">
                {warmupSets.length} warmup{' '}
                {warmupSets.length === 1 ? 'set' : 'sets'}
              </p>
            </div>

            <div className="space-y-3">
              {warmupSets.map((set, i) => (
                <WarmupSetCard
                  key={set.setNumber}
                  set={set}
                  isLast={i === warmupSets.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Working set reminder */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Working set</p>
            <p className="text-2xl font-bold mt-1">
              {workingWeight}
              <span className="ml-1 text-base font-normal text-slate-400">kg</span>
            </p>
          </div>

          {/* Save to history */}
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

      {/* Empty state when bodyweight selected */}
      {exerciseType === 'bodyweight' && numSets === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-slate-500 text-sm">
          Bodyweight movements need minimal warmup — just do some easy reps of the movement itself.
        </div>
      )}
    </div>
  )
}
