-- ============================================================
-- Migration 001: Add target reps/sets/1RM to workout_sessions
-- Run this in the Supabase SQL editor
-- ============================================================

alter table public.workout_sessions
  add column if not exists one_rep_max_kg  numeric(6,2),
  add column if not exists target_reps     integer,
  add column if not exists target_sets     integer;

-- Back-fill existing rows with nulls (already the default, just explicit)
-- No data loss — existing rows keep their working_weight_kg and warmup_sets.

comment on column public.workout_sessions.working_weight_kg is 'Target weight Z (kg)';
comment on column public.workout_sessions.one_rep_max_kg    is '1RM used at time of session (kg)';
comment on column public.workout_sessions.target_reps       is 'Target reps Y per working set';
comment on column public.workout_sessions.target_sets       is 'Target number of working sets X';
