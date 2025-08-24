import { ExerciseService } from '../../database/database';

const exercisesData = require('../../../data/exercises.json');

export const seedDefaultExercises = async () => {
  try {
    console.log(exercisesData);
    for (const exercise of exercisesData) {
      await ExerciseService.add(exercise);
    }
    console.log('Default exercises seeded successfully.');
  } catch (error) {
    console.error('Failed to seed default exercises:', error);
  }
};
