export interface SetRow {
  id?: number;
  set_type: number;
  rest: string;
  weight: number;
  reps: number;
  completed: number;
  note: string;
  exercise_in_session_id: number;
}

export interface ExerciseRow {
  id?: number;
  couting_type: number;
  note: string;
  active: number;
  muscle_group: number;
}

export interface SessionRow {
  id?: number;
  date: number;
  time: string;
  note: string;
}

export interface ExerciseInSessionRow {
  id?: number;
  note: string;
  workout_session: number;
  exercise_id: number;
  superset: number;
}

export interface SupersetRow {
  id?: number;
  number: number;
  note: string;
}
