export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS superset (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      number INTEGER,
      note TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS workout_session (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      note TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      couting_type INTEGER,
      note TEXT,
      active INTEGER,
      muscle_group INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS exercise_in_session (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      note TEXT,
      session INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      superset INTEGER,
      FOREIGN KEY(session) REFERENCES workout_session(id),
      FOREIGN KEY(exercise_id) REFERENCES exercises(id),
      FOREIGN KEY(superset) REFERENCES superset(id)
  )`,
  `CREATE TABLE IF NOT EXISTS workout_set (
      id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
      set_type INTEGER,
      rest TEXT,
      weight REAL,
      reps INTEGER,
      completed INTEGER,
      note TEXT,
      exercise_in_session_id INTEGER NOT NULL,
      FOREIGN KEY(exercise_in_session_id) REFERENCES exercise_in_session(id)
  )`
];
