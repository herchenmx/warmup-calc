'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EXERCISE_TYPE_CONFIGS } from '@/lib/calculator'
import type { ExerciseType } from '@/types'

interface Props {
  value: ExerciseType
  onChange: (type: ExerciseType) => void
}

const TYPE_LABELS: Record<ExerciseType, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
}

export function ExerciseSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-400">
        Exercise type
      </label>
      <Tabs value={value} onValueChange={(v) => onChange(v as ExerciseType)}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-900 p-1">
          {(Object.keys(EXERCISE_TYPE_CONFIGS) as ExerciseType[]).map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              {TYPE_LABELS[key]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
