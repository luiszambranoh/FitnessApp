import { db } from './init';

const exercisesData = require('../../../data/exercises.json');

const defaultSpanishRoutines = [
  { name: "Rutina de Fuerza", note: "Enfocada en levantamiento de pesas pesadas y pocas repeticiones." },
  { name: "Rutina de Hipertrofia", note: "Para crecimiento muscular, con repeticiones moderadas y volumen alto." },
  { name: "Rutina de Resistencia", note: "Entrenamiento de alta repetición y bajo peso para mejorar la resistencia." },
  { name: "Rutina Full Body", note: "Entrenamiento de cuerpo completo, ideal para principiantes o para mantener." },
  { name: "Rutina de Cardio Intenso", note: "Sesión de cardio de alta intensidad para quemar calorías." },
];

export const seedDefaultExercises = async () => {
  try {
    console.log('🌱 Starting to seed default exercises...');
    console.log('📋 Exercises data:', exercisesData);
    
    if (!db) {
      throw new Error('Database not available for seeding');
    }
    
    for (const exercise of exercisesData) {
      console.log(`➕ Adding exercise: ${exercise.name}`);
      const query = `INSERT INTO exercises (name, counting_type, note, active) VALUES (?, ?, ?, ?)`;
      const params = [exercise.name, exercise.counting_type, exercise.note, exercise.active];
      const result = await db.runAsync(query, params);
      console.log(`✅ Added exercise with ID: ${result.lastInsertRowId}`);
    }
    console.log('✅ Default exercises seeded successfully.');
  } catch (error) {
    console.error('❌ Failed to seed default exercises:', error);
    throw error;
  }
};

export const seedDefaultRoutines = async () => {
  try {
    console.log('🌱 Starting to seed default routines...');
    
    if (!db) {
      throw new Error('Database not available for seeding');
    }
    
    for (const routine of defaultSpanishRoutines) {
      console.log(`➕ Adding routine: ${routine.name}`);
      const query = `INSERT INTO routines (name, note) VALUES (?, ?)`;
      const params = [routine.name, routine.note];
      const result = await db.runAsync(query, params);
      console.log(`✅ Added routine with ID: ${result.lastInsertRowId}`);
    }
    console.log('✅ Default routines seeded successfully.');
  } catch (error) {
    console.error('❌ Failed to seed default routines:', error);
    throw error;
  }
};
