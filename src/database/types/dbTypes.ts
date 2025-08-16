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
  couting_type: number | null;
  note: string | null;
  active: number | null;
  muscle_group: number | null;
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
  set_type: number | null;
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