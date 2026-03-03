export type ExerciseType = 'barbell' | 'dumbbell' | 'machine' | 'bodyweight'

export interface WarmupSet {
  setNumber: number
  percentage: number
  weight: number
  reps: number
  restSeconds?: number
}

export interface CalculatorInput {
  workingWeight: number
  numSets: number
  percentages: number[]
  reps: number[]
  restSeconds?: number[]
}

export type DayClassification = 'light' | 'moderate' | 'heavy'

export interface Recommendation {
  suggestedSets: number
  classification: DayClassification
  rationale: string
}

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

export interface ExerciseTypeConfig {
  label: string
  defaultSets: number
  minSets: number
  maxSets: number
  defaultPercentages: number[]
  defaultReps: number[]
}
