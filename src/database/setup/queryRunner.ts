import { type SQLiteDatabase } from 'expo-sqlite';

export class DatabaseHelper {
  private static db: SQLiteDatabase;

  static initialize(database: SQLiteDatabase) {
    this.db = database;
  }

  // Generic SELECT function
  static async query<T = any>(query: string, params: any[] = []): Promise<T[]> {
    const db = this.db;
    try {
      const results = await db.getAllAsync<T>(query, params);
      console.log(`✅ [SELECT] Query successful! Rows fetched: ${results.length} 📝`);
      return results;
    } catch (error) {
      console.error(`❌ [SELECT] Query failed: ${query} ❗`, error);
      return [];
    }
  }

  // Generic INSERT function
  static async insert(query: string, params: any[] = []): Promise<number | null> {
    const db = this.db;
    try {
      const result = await db.runAsync(query, params);
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
    const db = this.db;
    try {
      const result = await db.runAsync(query, params);
      console.log(`✅ [UPDATE] Update successful! Changes: ${result?.changes ?? 0} 🔄`);
      return true;
    } catch (error) {
      console.error(`❌ [UPDATE] Update failed: ${query} ❗`, error);
      return false;
    }
  }

  // Generic DELETE by id
  static async removeById(table: string, id: number): Promise<boolean> {
    const db = this.db;
    const query = `DELETE FROM ${table} WHERE id = ?`;
    try {
      const result = await db.runAsync(query, [id]);
      console.log(`✅ [DELETE] Row deleted from "${table}"! Changes: ${result?.changes ?? 0} 🗑️`);
      return true;
    } catch (error) {
      console.error(`❌ [DELETE] Delete failed: ${query} ❗`, error);
      return false;
    }
  }
}
