// Equipment used in the new calculator
export type EquipmentType = 'barbell' | 'dumbbell' | 'machine'

// Legacy — kept for existing DB rows / UserPreferences shape
export type ExerciseType = 'barbell' | 'dumbbell' | 'machine' | 'bodyweight'

export type DayClassification = 'light' | 'moderate' | 'heavy'

export interface WarmupSet {
  setNumber: number
  percentage: number
  weight: number   // rounded up to nearest whole number
  reps: number     // rounded up to nearest whole number
}

export interface WorkingSet {
  sets: number
  reps: number
  weight: number
}

export interface WorkoutPlan {
  classification: DayClassification
  defaultWarmupSets: number
  warmupSets: WarmupSet[]
  workingSet: WorkingSet
}

export interface WorkoutInput {
  exerciseName: string
  equipment: EquipmentType
  oneRepMax: number     // kg
  targetWeight: number  // Z kg
  targetReps: number    // Y
  targetSets: number    // X
  numWarmupSets: number // 1–4, user-selected
}

// ── DB shapes ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  default_sets: number
  percentages: number[]
  reps: number[]
  exercise_type: ExerciseType
}

export interface WorkoutSession {
  id: string
  user_id: string
  exercise_name: string
  exercise_type: ExerciseType
  working_weight_kg: number
  warmup_sets: WarmupSet[]
  created_at: string
}

// ── Legacy calculator types (kept for settings page compatibility) ────────────

export interface SetOption {
  percentages: number[]
  reps: number[]
}

export interface ExerciseTypeConfig {
  label: string
  defaultSets: number
  setOptions: Record<number, SetOption>
}
