import type {
  EquipmentType,
  DayClassification,
  WarmupSet,
  WorkoutPlan,
  WorkoutInput,
} from '@/types'

// ── Rounding ─────────────────────────────────────────────────────────────────

/** Round up to nearest whole number (ceil). */
export function roundUp(n: number): number {
  return Math.ceil(n)
}

// ── Load classification ───────────────────────────────────────────────────────

/**
 * Classify load based on target weight as % of 1RM.
 * Light: <65%  |  Moderate: 65–85%  |  Heavy: >85%
 */
export function classifyLoad(
  targetWeight: number,
  oneRepMax: number
): DayClassification {
  const pct = (targetWeight / oneRepMax) * 100
  if (pct > 85) return 'heavy'
  if (pct >= 65) return 'moderate'
  return 'light'
}

// ── Default warmup sets by equipment + load ───────────────────────────────────

const DEFAULT_WARMUP_SETS: Record<EquipmentType, Record<DayClassification, number>> = {
  barbell:  { light: 2, moderate: 3, heavy: 4 },
  dumbbell: { light: 1, moderate: 1, heavy: 2 },
  machine:  { light: 1, moderate: 2, heavy: 2 },
}

export function getDefaultWarmupSets(
  equipment: EquipmentType,
  classification: DayClassification
): number {
  return DEFAULT_WARMUP_SETS[equipment][classification]
}

// ── Warmup percentages by number of sets ─────────────────────────────────────

const WARMUP_PERCENTAGES: Record<number, number[]> = {
  1: [70],
  2: [60, 80],
  3: [50, 70, 85],
  4: [40, 60, 80, 90],
}

export function getWarmupPercentages(numSets: number): number[] {
  return WARMUP_PERCENTAGES[numSets] ?? WARMUP_PERCENTAGES[4]
}

// ── Rep calculation ───────────────────────────────────────────────────────────

/**
 * Calculate reps for each warmup set based on distance from working set.
 *
 *   distance 4 (set 1 of 4) → 100% of Y
 *   distance 3              → 75%  of Y
 *   distance 2              → 50%  of Y
 *   distance 1 (final)      → 1 rep fixed (only when numSets >= 3)
 *
 * Mapping by numSets:
 *   1 set  → [50% of Y]
 *   2 sets → [75% of Y,  50% of Y]
 *   3 sets → [75% of Y,  50% of Y, 1]
 *   4 sets → [100% of Y, 75% of Y, 50% of Y, 1]
 *
 * All values rounded up; minimum 1.
 */
export function getWarmupReps(numSets: number, targetReps: number): number[] {
  const ceil = (x: number) => Math.max(1, roundUp(x))
  switch (numSets) {
    case 1: return [ceil(targetReps * 0.5)]
    case 2: return [ceil(targetReps * 0.75), ceil(targetReps * 0.5)]
    case 3: return [ceil(targetReps * 0.75), ceil(targetReps * 0.5), 1]
    case 4: return [ceil(targetReps * 1.0),  ceil(targetReps * 0.75), ceil(targetReps * 0.5), 1]
    default: return [ceil(targetReps * 1.0), ceil(targetReps * 0.75), ceil(targetReps * 0.5), 1]
  }
}

// ── Main calculator ───────────────────────────────────────────────────────────

export function calculateWorkoutPlan(input: WorkoutInput): WorkoutPlan {
  const { equipment, oneRepMax, targetWeight, targetReps, targetSets, numWarmupSets } = input

  const classification = classifyLoad(targetWeight, oneRepMax)
  const defaultWarmupSets = getDefaultWarmupSets(equipment, classification)
  const percentages = getWarmupPercentages(numWarmupSets)
  const reps = getWarmupReps(numWarmupSets, targetReps)

  const warmupSets: WarmupSet[] = percentages.map((pct, i) => ({
    setNumber: i + 1,
    percentage: pct,
    weight: Math.max(1, roundUp((pct / 100) * targetWeight)),
    reps: reps[i],
  }))

  return {
    classification,
    defaultWarmupSets,
    warmupSets,
    workingSet: {
      sets: targetSets,
      reps: targetReps,
      weight: targetWeight,
    },
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

export function validateWorkoutInput(
  oneRepMax: number,
  targetWeight: number,
  targetReps: number,
  targetSets: number
): string | null {
  if (isNaN(oneRepMax) || oneRepMax <= 0)
    return 'Enter your 1RM'
  if (isNaN(targetWeight) || targetWeight <= 0)
    return 'Enter a target weight'
  if (targetWeight > oneRepMax)
    return 'Target weight cannot exceed your 1RM'
  if (isNaN(targetReps) || targetReps < 1 || targetReps > 100)
    return 'Target reps must be between 1 and 100'
  if (isNaN(targetSets) || targetSets < 1 || targetSets > 20)
    return 'Target sets must be between 1 and 20'
  return null
}
