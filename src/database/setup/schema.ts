export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS supersets (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      number INTEGER,
      note TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      note TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      name TEXT NOT NULL,
      counting_type TEXT NOT NULL,
      note TEXT,
      active INTEGER DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS session_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      note TEXT,
      session_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      superset_id INTEGER,
      FOREIGN KEY(session_id) REFERENCES workouts(id),
      FOREIGN KEY(exercise_id) REFERENCES exercises(id),
      FOREIGN KEY(superset_id) REFERENCES supersets(id)
  )`,
  `CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      set_type INTEGER,
      rest TEXT,
      weight REAL,
      reps INTEGER,
      completed INTEGER,
      note TEXT,
      session_exercise_id INTEGER NOT NULL,
      FOREIGN KEY(session_exercise_id) REFERENCES session_exercises(id)
  )`,
  `CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      name TEXT NOT NULL,
      note TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS routine_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      note TEXT,
      routine_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      FOREIGN KEY(routine_id) REFERENCES routines(id) ON DELETE CASCADE,
      FOREIGN KEY(exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS routine_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      set_type INTEGER,
      rest TEXT,
      weight REAL,
      reps INTEGER,
      note TEXT,
      routine_exercise_id INTEGER NOT NULL,
      FOREIGN KEY(routine_exercise_id) REFERENCES routine_exercises(id) ON DELETE CASCADE
  )`
];