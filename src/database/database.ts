import { DatabaseHelper } from "./setup/queryRunner";
import {
  WorkoutRow,
  ExerciseRow, NewExercise,
  SessionExerciseRow, NewSessionExercise,
  SetRow, NewSet,
  SupersetRow, NewSuperset,
  RoutineRow, NewRoutine,
  RoutineExerciseRow, NewRoutineExercise,
  RoutineSetRow, NewRoutineSet
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
    const query = `INSERT INTO exercises (name, counting_type, note, active) VALUES (?, ?, ?, ?)`;
    const params = [exercise.name, exercise.couting_type, exercise.note, exercise.active];
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
    const query = `UPDATE exercises SET name = ?, counting_type = ?, note = ?, active = ? WHERE id = ?`;
    const params = [exercise.name, exercise.couting_type, exercise.note, exercise.active, exercise.id];
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

export class RoutineService {
  // Routine-level methods
  static async add(routine: NewRoutine): Promise<number | null> {
    const query = `INSERT INTO routines (name, note) VALUES (?, ?)`;
    const params = [routine.name, routine.note];
    return DatabaseHelper.insert(query, params);
  }

  static async getById(id: number): Promise<RoutineRow | null> {
    const results = await DatabaseHelper.query<RoutineRow>(`SELECT * FROM routines WHERE id = ?`, [id]);
    return results[0] ?? null;
  }

  static async getAll(): Promise<RoutineRow[]> {
    return DatabaseHelper.query<RoutineRow>(`SELECT * FROM routines ORDER BY name`);
  }

  static async update(routine: RoutineRow): Promise<boolean> {
    if (!routine.id) return false;
    const query = `UPDATE routines SET name = ?, note = ? WHERE id = ?`;
    const params = [routine.name, routine.note, routine.id];
    return DatabaseHelper.update(query, params);
  }

  static async delete(id: number): Promise<boolean> {
    return DatabaseHelper.removeById('routines', id);
  }

  // Routine-exercise level methods
  static async addExercise(re: NewRoutineExercise): Promise<number | null> {
    const query = `INSERT INTO routine_exercises (note, routine_id, exercise_id) VALUES (?, ?, ?)`;
    const params = [re.note, re.routine_id, re.exercise_id];
    return DatabaseHelper.insert(query, params);
  }

  static async getExercisesByRoutineId(routineId: number): Promise<RoutineExerciseRow[]> {
    const query = `SELECT * FROM routine_exercises WHERE routine_id = ?`;
    return DatabaseHelper.query<RoutineExerciseRow>(query, [routineId]);
  }

  static async removeExercise(id: number): Promise<boolean> {
    return DatabaseHelper.removeById('routine_exercises', id);
  }

  // Routine-set level methods
  static async addSet(set: NewRoutineSet): Promise<number | null> {
    const query = `INSERT INTO routine_sets (set_type, rest, weight, reps, note, routine_exercise_id) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [set.set_type, set.rest, set.weight, set.reps, set.note, set.routine_exercise_id];
    return DatabaseHelper.insert(query, params);
  }

  static async getSetsByRoutineExerciseId(routineExerciseId: number): Promise<RoutineSetRow[]> {
    const query = `SELECT * FROM routine_sets WHERE routine_exercise_id = ?`;
    return DatabaseHelper.query<RoutineSetRow>(query, [routineExerciseId]);
  }

  static async updateSet(set: RoutineSetRow): Promise<boolean> {
    if (!set.id) return false;
    const query = `UPDATE routine_sets SET set_type = ?, rest = ?, weight = ?, reps = ?, note = ? WHERE id = ?`;
    const params = [set.set_type, set.rest, set.weight, set.reps, set.note, set.id];
    return DatabaseHelper.update(query, params);
  }

  static async deleteSet(id: number): Promise<boolean> {
    return DatabaseHelper.removeById('routine_sets', id);
  }

  // Complex operations
  static async createWorkoutFromRoutine(routineId: number): Promise<number | null> {
    // 1. Create a new workout
    const newWorkoutId = await WorkoutService.add({ note: 'Workout from routine' });
    if (!newWorkoutId) {
      return null;
    }

    // 2. Get all exercises for the routine
    const routineExercises = await this.getExercisesByRoutineId(routineId);

    // 3. Loop through each routine exercise, create a session exercise, and copy the sets
    for (const rExercise of routineExercises) {
      const newSessionExercise: NewSessionExercise = {
        session_id: newWorkoutId,
        exercise_id: rExercise.exercise_id,
        note: rExercise.note,
        superset_id: null // Superset functionality can be added later if needed
      };
      const newSessionExerciseId = await SessionExerciseService.add(newSessionExercise);

      if (newSessionExerciseId) {
        // 4. Get all sets for the routine exercise
        const routineSets = await this.getSetsByRoutineExerciseId(rExercise.id);
        for (const rSet of routineSets) {
          const newSet: NewSet = {
            session_exercise_id: newSessionExerciseId,
            set_type: rSet.set_type,
            weight: rSet.weight,
            reps: rSet.reps,
            rest: rSet.rest,
            note: rSet.note,
            completed: 0 // Sets in a new workout are not completed
          };
          await SetService.add(newSet);
        }
      }
    }

    return newWorkoutId;
  }
}