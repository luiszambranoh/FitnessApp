import { type SQLiteDatabase } from 'expo-sqlite';
import { dbState } from './dbState';

export class DatabaseHelper {
  private static db: SQLiteDatabase;

  static initialize(database: SQLiteDatabase) {
    this.db = database;
  }

  private static async ensureInitialized(): Promise<void> {
    console.log('⚙️ DatabaseHelper.ensureInitialized() called');
    
    // Wait for database initialization to complete
    await dbState.waitForInitialization();
    console.log('✅ DatabaseState confirmed initialization complete');
    
    if (!this.db) {
      console.error('❌ Database instance is null after initialization!');
      throw new Error('Database not initialized. Call DatabaseHelper.initialize() first.');
    }
    
    // Try a simple test query to verify the database is actually working
    try {
      await this.db.getAllAsync('SELECT 1 as test');
      console.log('✅ Database instance validated with test query');
    } catch (error) {
      console.error('❌ Database instance test query failed:', error);
      throw new Error('Database instance is not functioning properly: ' + error);
    }
  }

  // Generic SELECT function
  static async query<T = any>(query: string, params: any[] = []): Promise<T[]> {
    console.log(`🔍 [SELECT] Starting query: ${query}`);
    try {
      console.log(`⏳ [SELECT] Waiting for database initialization...`);
      await this.ensureInitialized();
      console.log(`✅ [SELECT] Database ready, executing query...`);
      const results = await this.db.getAllAsync<T>(query, params);
      console.log(`✅ [SELECT] Query successful! Rows fetched: ${results.length} 📝`);
      return results;
    } catch (error) {
      console.error(`❌ [SELECT] Query failed: ${query} ❗`, error);
      return [];
    }
  }

  // Generic INSERT function
  static async insert(query: string, params: any[] = []): Promise<number | null> {
    console.log(`➕ [INSERT] Starting insert: ${query}`);
    try {
      console.log(`⏳ [INSERT] Waiting for database initialization...`);
      await this.ensureInitialized();
      console.log(`✅ [INSERT] Database ready, executing insert...`);
      const result = await this.db.runAsync(query, params);
      const id = result?.lastInsertRowId ?? null;
      console.log(`✅ [INSERT] Insert successful! Inserted ID: ${id} 🆕`);
      return id;
    } catch (error) {
      console.error(`❌ [INSERT] Insert failed: ${query} ❗`, error);
      return null;
    }
  }

  // Generic UPDATE function
  static async update(query: string, params: any[] = []): Promise<boolean> {
    try {
      await this.ensureInitialized();
      const result = await this.db.runAsync(query, params);
      console.log(`✅ [UPDATE] Update successful! Changes: ${result?.changes ?? 0} 🔄`);
      return true;
    } catch (error) {
      console.error(`❌ [UPDATE] Update failed: ${query} ❗`, error);
      return false;
    }
  }

  // Generic DELETE by id
  static async removeById(table: string, id: number): Promise<boolean> {
    const query = `DELETE FROM ${table} WHERE id = ?`;
    try {
      await this.ensureInitialized();
      const result = await this.db.runAsync(query, [id]);
      console.log(`✅ [DELETE] Row deleted from "${table}"! Changes: ${result?.changes ?? 0} 🗑️`);
      return true;
    } catch (error) {
      console.error(`❌ [DELETE] Delete failed: ${query} ❗`, error);
      return false;
    }
  }
}
