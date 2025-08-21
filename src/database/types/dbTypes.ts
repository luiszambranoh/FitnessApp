export type CountingType = 'reps' | 'time';
export type SetType = 'normal' | 'warm-up' | 'dropset';

export interface SupersetRow {
  id: number;
  number: number;
  note: string | null;
}

export interface WorkoutRow {
  id: number;
  date: string;
  time: string;
  note: string | null;
}

export interface ExerciseRow {
  id: number;
  name: string;
  couting_type: CountingType;
  note: string | null;
  active: number | null;
}

export interface SessionExerciseRow {
  id: number;
  note: string | null;
  session_id: number;
  exercise_id: number;
  superset_id: number | null;
}

export interface SetRow {
  id: number;
  set_type: SetType;
  rest: string | null;
  weight: number | null;
  reps: number | null;
  completed: number | null;
  note: string | null;
  session_exercise_id: number;
}

export type NewSuperset = Omit<SupersetRow, 'id'>;
export type NewWorkout = Omit<WorkoutRow, 'id'>;
export type NewExercise = Omit<ExerciseRow, 'id'>;
export type NewSessionExercise = Omit<SessionExerciseRow, 'id'>;
export type NewSet = Omit<SetRow, 'id'>;

export interface RoutineRow {
  id: number;
  name: string;
  note: string | null;
}

export interface RoutineExerciseRow {
  id: number;
  note: string | null;
  routine_id: number;
  exercise_id: number;
}

export interface RoutineSetRow {
  id: number;
  set_type: SetType;
  rest: string | null;
  weight: number | null;
  reps: number | null;
  note: string | null;
  routine_exercise_id: number;
}

export interface BodyMeasurementRow {
  id: number;
  date: string;
  weight: number | null;
  height: number | null;
  neck: number | null;
  shoulder: number | null;
  arm_left: number | null;
  arm_right: number | null;
  forearm_left: number | null;
  forearm_right: number | null;
  chest: number | null;
  waist: number | null;
  thigh_left: number | null;
  thigh_right: number | null;
  calf_left: number | null;
  calf_right: number | null;
}

export type NewRoutine = Omit<RoutineRow, 'id'>;
export type NewRoutineExercise = Omit<RoutineExerciseRow, 'id'>;
export type NewRoutineSet = Omit<RoutineSetRow, 'id'>;
export type NewBodyMeasurement = Omit<BodyMeasurementRow, 'id'>;