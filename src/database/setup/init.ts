import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { schemaStatements } from './schema';

export let db: SQLite.SQLiteDatabase;

const deleteOldDB = async () => {
  const sqliteDir = FileSystem.documentDirectory + 'SQLite';
  await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
  await FileSystem.deleteAsync(`${sqliteDir}/fitness.db`, { idempotent: true });
};

export const initDB = async () => {
  try {
    /* await deleteOldDB(); */
    db = await SQLite.openDatabaseAsync('fitness.db');
    for (const sql of schemaStatements) {
      await db.execAsync(sql);
    }
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize DB:', error);
    throw error;
  }
};

export const getDB = (): SQLite.SQLiteDatabase => {
  if (!db) throw new Error('Database not initialized');
  return db;
};