import * as SQLite from 'expo-sqlite';

export interface WorkoutSession {
  exercises: any;
  id: number;
  date: string;
  time: string;
  name: string;
  notes: string;
}

export interface WorkoutExercise {
  id: number;
  session_id: number;
  name: string;
  notes: string;
}

export interface WorkoutSet {
  id: number;
  exercise_id: number;
  reps: number;
  weight: number;
  resting: number;
}

let db: SQLite.SQLiteDatabase;
import * as FileSystem from 'expo-file-system';
export const initDB = async () => {
  try {
    
    db = await SQLite.openDatabaseAsync('fitness.db');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercise_session (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        time TEXT,
        name TEXT,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS exercise (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER REFERENCES exercise_session(id),
        name TEXT,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS setdata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER REFERENCES exercise(id),
        reps INTEGER,
        weight REAL,
        resting INTEGER
      );
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

export const startSession = async (name: string, notes: string = ''): Promise<number> => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();

    const result = await db.runAsync(
      'INSERT INTO exercise_session (date, time, name, notes) VALUES (?, ?, ?, ?)',
      [date, time, name, notes]
    );

    console.log(`✅ Session "${name}" started`);
    return result.lastInsertRowId ?? 0;
  } catch (error) {
    console.error('❌ Failed to start session:', error);
    throw error;
  }
};

export const addExerciseToSession = async (sessionId: number, exerciseName: string, notes: string = ''): Promise<number> => {
  try {
    const result = await db.runAsync(
      'INSERT INTO exercise (session_id, name, notes) VALUES (?, ?, ?)',
      [sessionId, exerciseName, notes]
    );

    console.log(`✅ Exercise "${exerciseName}" added to session ${sessionId}`);
    return result.lastInsertRowId ?? 0;
  } catch (error) {
    console.error('❌ Failed to add exercise:', error);
    throw error;
  }
};

export const addSetToExercise = async (exerciseId: number, reps: number, weight: number, resting: number = 60) => {
  try {
    await db.runAsync(
      'INSERT INTO setdata (exercise_id, reps, weight, resting) VALUES (?, ?, ?, ?)',
      [exerciseId, reps, weight, resting]
    );

    console.log(`✅ Set added to exercise ${exerciseId}`);
  } catch (error) {
    console.error('❌ Failed to add set:', error);
    throw error;
  }
};

export const getFullWorkoutHistory = async () => {
  try {
    const sessions = await db.getAllAsync<WorkoutSession>('SELECT * FROM exercise_session ORDER BY date DESC');

    for (const session of sessions) {
      const exercises = await db.getAllAsync<WorkoutExercise>(
        'SELECT * FROM exercise WHERE session_id = ?',
        [session.id]
      );

      for (const exercise of exercises) {
        const sets = await db.getAllAsync<WorkoutSet>(
          'SELECT * FROM setdata WHERE exercise_id = ?',
          [exercise.id]
        );
        (exercise as any).sets = sets;
      }

      (session as any).exercises = exercises;
    }

    console.log('✅ Full workout history retrieved');
    return sessions;
  } catch (error) {
    console.error('❌ Failed to fetch workout history:', error);
    throw error;
  }
};
