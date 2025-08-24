import * as SQLite from 'expo-sqlite';
import { schemaStatements } from './schema';
import { preferencesService } from '../../services/preferencesService';
import { seedDefaultExercises } from './seeder';
import { DatabaseHelper } from './queryRunner';
import { dbState } from './dbState';

export let db: SQLite.SQLiteDatabase;
let initializationPromise: Promise<void> | null = null;

export const initDB = async (): Promise<void> => {
  // If already initializing or initialized, return the existing promise or resolve immediately
  if (dbState.getInitializationStatus()) {
    console.log('✅ Database already initialized, skipping...');
    return Promise.resolve();
  }
  
  if (initializationPromise) {
    console.log('⏳ Database initialization already in progress, waiting...');
    return initializationPromise;
  }
  
  console.log('🚀 Starting database initialization...');
  
  initializationPromise = (async () => {
    try {
      console.log('📏 Opening database...');
      db = await SQLite.openDatabaseAsync('fitness.db');
      console.log('✅ Database opened successfully');
      
      console.log('⚙️ Initializing DatabaseHelper...');
      DatabaseHelper.initialize(db);
      console.log('✅ DatabaseHelper initialized');
      
      console.log('📋 Reading preferences...');
      let preferences = (await preferencesService.read());
      console.log('✅ Preferences loaded');
      
      console.log('🛠️ Executing schema statements...');
      for (const sql of schemaStatements) {
        await db.execAsync(sql);
      }
      console.log('✅ Schema created/updated');
      
      if (!preferences.exercisesAdded){
        console.log('🌱 Seeding default exercises...');
        await seedDefaultExercises();
        preferencesService.write({...preferences, exercisesAdded: true});
        console.log('✅ Initial exercises added')
      }
      
      console.log('🏁 Marking database as initialized...');
      dbState.setInitialized();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize DB:', error);
      dbState.reset();
      initializationPromise = null; // Reset so we can try again
      throw error;
    }
  })();
  
  return initializationPromise;
};
