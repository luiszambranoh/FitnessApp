import { db } from './init';

const exercisesData = require('../../../data/exercises.json');

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
