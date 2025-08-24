import * as SQLite from 'expo-sqlite';
import { schemaStatements } from './schema';
import { preferencesService } from '../../services/preferencesService';
import { seedDefaultExercises } from './seeder';
import { DatabaseHelper } from './queryRunner';

export let db: SQLite.SQLiteDatabase;

export const initDB = async () => {
  
  try {
    db = await SQLite.openDatabaseAsync('fitness.db');
    DatabaseHelper.initialize(db);
    let preferences = (await preferencesService.read());
    for (const sql of schemaStatements) {
      await db.execAsync(sql);
    }
    if (!preferences.exercisesAdded){
      seedDefaultExercises();
      preferencesService.write({...preferences, exercisesAdded: true});
      console.log("Initial exercises added")
    }
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize DB:', error);
    throw error;
  }
};