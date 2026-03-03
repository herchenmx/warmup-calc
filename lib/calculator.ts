import type {
  WarmupSet,
  CalculatorInput,
  ExerciseType,
  ExerciseTypeConfig,
  Recommendation,
  DayClassification,
} from '@/types'

export function roundToNearest2_5(weight: number): number {
  return Math.round(weight / 2.5) * 2.5
}

export const EXERCISE_TYPE_CONFIGS: Record<ExerciseType, ExerciseTypeConfig> = {
  barbell: {
    label: 'Barbell',
    defaultSets: 2,
    setOptions: {
      2: { percentages: [60, 80],          reps: [6, 3] },
      3: { percentages: [40, 60, 80],      reps: [10, 6, 3] },
      4: { percentages: [40, 60, 80, 90],  reps: [10, 6, 3, 1] },
      5: { percentages: [40, 60, 75, 80, 90], reps: [10, 6, 5, 3, 1] },
    },
  },
  dumbbell: {
    label: 'Dumbbell',
    defaultSets: 2,
    setOptions: {
      1: { percentages: [70],          reps: [10] },
      2: { percentages: [50, 75],      reps: [10, 6] },
      3: { percentages: [40, 60, 75],  reps: [10, 8, 6] },
    },
  },
  machine: {
    label: 'Machine',
    defaultSets: 1,
    setOptions: {
      1: { percentages: [60],     reps: [10] },
      2: { percentages: [50, 75], reps: [10, 6] },
    },
  },
  bodyweight: {
    label: 'Bodyweight',
    defaultSets: 0,
    setOptions: {
      0: { percentages: [], reps: [] },
      1: { percentages: [50], reps: [10] },
    },
  },
}

export function getPercentagesForSets(
  exerciseType: ExerciseType,
  numSets: number
): number[] {
  return EXERCISE_TYPE_CONFIGS[exerciseType].setOptions[numSets]?.percentages ?? []
}

export function getRepsForSets(
  exerciseType: ExerciseType,
  numSets: number
): number[] {
  return EXERCISE_TYPE_CONFIGS[exerciseType].setOptions[numSets]?.reps ?? []
}

export function calculateWarmupSets(input: CalculatorInput): WarmupSet[] {
  const { workingWeight, numSets, percentages, reps, restSeconds } = input
  if (numSets === 0) return []

  const activePercentages = percentages.slice(0, numSets)
  const activeReps = reps.slice(0, numSets)

  return activePercentages.map((pct, i) => ({
    setNumber: i + 1,
    percentage: pct,
    weight: roundToNearest2_5((pct / 100) * workingWeight),
    reps: activeReps[i] ?? 5,
    restSeconds: restSeconds?.[i],
  }))
}

const TYPICAL_WORKING_WEIGHTS: Record<ExerciseType, number> = {
  barbell: 100,
  dumbbell: 30,
  machine: 80,
  bodyweight: 0,
}

export function classifyDay(
  workingWeight: number,
  exerciseType: ExerciseType
): DayClassification {
  const typical = TYPICAL_WORKING_WEIGHTS[exerciseType]
  if (typical === 0) return 'moderate'
  const ratio = workingWeight / typical
  if (ratio >= 1.1) return 'heavy'
  if (ratio >= 0.8) return 'moderate'
  return 'light'
}

export function getRecommendation(
  workingWeight: number,
  exerciseType: ExerciseType
): Recommendation {
  const config = EXERCISE_TYPE_CONFIGS[exerciseType]
  const setKeys = Object.keys(config.setOptions).map(Number).filter((n) => n > 0)
  const minSets = Math.min(...setKeys)
  const maxSets = Math.max(...setKeys)
  const classification = classifyDay(workingWeight, exerciseType)

  let suggestedSets: number
  let rationale: string

  switch (classification) {
    case 'heavy':
      suggestedSets = maxSets
      rationale = `Heavy session — ${maxSets} warmup sets recommended to peak activation.`
      break
    case 'moderate':
      suggestedSets = config.defaultSets
      rationale = `Moderate load — ${config.defaultSets} warmup sets is optimal.`
      break
    case 'light':
      suggestedSets = minSets
      rationale = `Light session — ${minSets} warmup set${minSets !== 1 ? 's' : ''} is sufficient.`
      break
  }

  return { suggestedSets, classification, rationale }
}

export function validateCalculatorInput(
  workingWeight: number,
  numSets: number,
  percentages: number[],
  reps: number[]
): string | null {
  if (isNaN(workingWeight) || workingWeight <= 0)
    return 'Enter a working weight greater than 0'
  if (workingWeight > 1000)
    return 'Working weight seems unrealistically high'
  if (numSets > 0 && percentages.some((p) => p <= 0 || p >= 100))
    return 'Percentages must be between 1 and 99'
  if (numSets > 0 && reps.some((r) => r <= 0 || r > 30))
    return 'Reps must be between 1 and 30'
  if (percentages.length < numSets || reps.length < numSets)
    return 'Not enough percentages/reps for the selected number of sets'
  return null
}
