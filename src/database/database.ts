import { DatabaseHelper } from "./setup/queryRunner";
import {
  WorkoutRow,
  ExerciseRow, NewExercise,
  SessionExerciseRow, NewSessionExercise,
  SetRow, NewSet,
  SupersetRow, NewSuperset
} from "./types/dbTypes";
import { getCurrentDateTime } from "./utils/datetime";

export class WorkoutService {
  static async add(workout?: { note: string | null }): Promise<number | null> {
    const { date, time } = getCurrentDateTime();
    const query = `INSERT INTO workouts (date, time, note) VALUES (?, ?, ?)`;
    const params = [date, time, workout?.note ?? null];
    return DatabaseHelper.insert(query, params);
  }

  static async getById(id: number): Promise<WorkoutRow | null> {
    const results = await DatabaseHelper.query<WorkoutRow>(`SELECT * FROM workouts WHERE id = ?`, [id]);
    return results[0] ?? null;
  }

  static async getAll(): Promise<WorkoutRow[]> {
    const query = `SELECT * FROM workouts ORDER BY date DESC, time DESC`;
    return DatabaseHelper.query<WorkoutRow>(query);
  }

  static async update(workout: WorkoutRow): Promise<boolean> {
    if (!workout.id) return false;
    const query = `UPDATE workouts SET date = ?, time = ?, note = ? WHERE id = ?`;
    const params = [workout.date, workout.time, workout.note, workout.id];
    return DatabaseHelper.update(query, params);
  }

  static async delete(id: number): Promise<boolean> {
    return DatabaseHelper.removeById('workouts', id);
  }
}

export class ExerciseService {
  static async add(exercise: NewExercise): Promise<number | null> {
    const query = `INSERT INTO exercises (couting_type, note, active, muscle_group) VALUES (?, ?, ?, ?)`;
    const params = [exercise.couting_type, exercise.note, exercise.active, exercise.muscle_group];
    return DatabaseHelper.insert(query, params);
  }

  static async getById(id: number): Promise<ExerciseRow | null> {
    const results = await DatabaseHelper.query<ExerciseRow>(`SELECT * FROM exercises WHERE id = ?`, [id]);
    return results[0] ?? null;
  }

  static async getAll(): Promise<ExerciseRow[]> {
    return DatabaseHelper.query<ExerciseRow>(`SELECT * FROM exercises`);
  }

  static async update(exercise: ExerciseRow): Promise<boolean> {
    if (!exercise.id) return false;
    const query = `UPDATE exercises SET couting_type = ?, note = ?, active = ?, muscle_group = ? WHERE id = ?`;
    const params = [exercise.couting_type, exercise.note, exercise.active, exercise.muscle_group, exercise.id];
    return DatabaseHelper.update(query, params);
  }

  static async delete(id: number): Promise<boolean> {
    return DatabaseHelper.removeById('exercises', id);
  }
}

export class SessionExerciseService {
  static async add(se: NewSessionExercise): Promise<number | null> {
    const query = `INSERT INTO session_exercises (note, session_id, exercise_id, superset_id) VALUES (?, ?, ?, ?)`;
    const params = [se.note, se.session_id, se.exercise_id, se.superset_id];
    return DatabaseHelper.insert(query, params);
  }

  static async getById(id: number): Promise<SessionExerciseRow | null> {
    const results = await DatabaseHelper.query<SessionExerciseRow>(`SELECT * FROM session_exercises WHERE id = ?`, [id]);
    return results[0] ?? null;
  }

  static async getBySessionId(sessionId: number): Promise<SessionExerciseRow[]> {
    const query = `SELECT * FROM session_exercises WHERE session_id = ?`;
    return DatabaseHelper.query<SessionExerciseRow>(query, [sessionId]);
  }

  static async update(se: SessionExerciseRow): Promise<boolean> {
    if (!se.id) return false;
    const query = `UPDATE session_exercises SET note = ?, session_id = ?, exercise_id = ?, superset_id = ? WHERE id = ?`;
    const params = [se.note, se.session_id, se.exercise_id, se.superset_id, se.id];
    return DatabaseHelper.update(query, params);
  }

  static async delete(id: number): Promise<boolean> {
    return DatabaseHelper.removeById('session_exercises', id);
  }
}

export class SetService {
  static async add(set: NewSet): Promise<number | null> {
    const query = `INSERT INTO sets (set_type, rest, weight, reps, completed, note, session_exercise_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [set.set_type, set.rest, set.weight, set.reps, set.completed, set.note, set.session_exercise_id];
    return DatabaseHelper.insert(query, params);
  }

  static async getById(id: number): Promise<SetRow | null> {
    const results = await DatabaseHelper.query<SetRow>(`SELECT * FROM sets WHERE id = ?`, [id]);
    return results[0] ?? null;
  }
  
  static async getBySessionExerciseId(sessionExerciseId: number): Promise<SetRow[]> {
    const query = `SELECT * FROM sets WHERE session_exercise_id = ?`;
    return DatabaseHelper.query<SetRow>(query, [sessionExerciseId]);
  }

  static async update(set: SetRow): Promise<boolean> {
    if (!set.id) return false;
    const query = `UPDATE sets SET set_type = ?, rest = ?, weight = ?, reps = ?, completed = ?, note = ? WHERE id = ?`;
    const params = [set.set_type, set.rest, set.weight, set.reps, set.completed, set.note, set.id];
    return DatabaseHelper.update(query, params);
  }

  static async delete(id: number): Promise<boolean> {
    return DatabaseHelper.removeById('sets', id);
  }
}

export class SupersetService {
  static async add(superset: NewSuperset): Promise<number | null> {
    const query = `INSERT INTO supersets (number, note) VALUES (?, ?)`;
    const params = [superset.number, superset.note];
    return DatabaseHelper.insert(query, params);
  }

  static async getById(id: number): Promise<SupersetRow | null> {
    const results = await DatabaseHelper.query<SupersetRow>(`SELECT * FROM supersets WHERE id = ?`, [id]);
    return results[0] ?? null;
  }
  
  static async getAll(): Promise<SupersetRow[]> {
    return DatabaseHelper.query<SupersetRow>(`SELECT * FROM supersets`);
  }

  static async update(superset: SupersetRow): Promise<boolean> {
    if (!superset.id) return false;
    const query = `UPDATE supersets SET number = ?, note = ? WHERE id = ?`;
    const params = [superset.number, superset.note, superset.id];
    return DatabaseHelper.update(query, params);
  }

  static async delete(id: number): Promise<boolean> {
    return DatabaseHelper.removeById('supersets', id);
  }
}