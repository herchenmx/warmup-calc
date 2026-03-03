'use client'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { EquipmentType } from '@/types'

const EQUIPMENT_OPTIONS: { value: EquipmentType; label: string; sub: string }[] = [
  { value: 'barbell',  label: 'Barbell',         sub: 'compounds' },
  { value: 'dumbbell', label: 'Dumbbell / KB',    sub: 'free weights' },
  { value: 'machine',  label: 'Machine',          sub: 'cable / pin' },
]

interface Props {
  value: EquipmentType
  onChange: (type: EquipmentType) => void
}

export function ExerciseSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-400">Equipment</Label>
      <div className="grid grid-cols-3 gap-2">
        {EQUIPMENT_OPTIONS.map((opt) => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex flex-col items-center rounded-xl border px-2 py-3 text-center transition-colors touch-manipulation',
                'min-h-[64px]',
                active
                  ? 'border-indigo-600 bg-indigo-950/60 text-indigo-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              )}
            >
              <span className="text-sm font-semibold leading-tight">{opt.label}</span>
              <span className="mt-0.5 text-xs opacity-60">{opt.sub}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
