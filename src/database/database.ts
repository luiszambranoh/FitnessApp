import { SetRow } from "./types/db";
import { DatabaseHelper } from "./setup/queryRunner";

export const addSet = async (set: SetRow) => {
  const query = `INSERT INTO workout_set 
      (set_type, rest, weight, reps, completed, note, exercise_in_session_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`
  try {
    const data = [set.set_type, set.rest, set.weight, set.reps, set.completed, set.note, set.session_exercise_id]
    await DatabaseHelper.insert(query, data);
  }
  catch(e){
    console.error(`Error executing: ${e}`,);
  }
}

export const getSet = async (): Promise<SetRow[]> => {
  const query = `SELECT * FROM workout_set`;
  try {
    const result = await DatabaseHelper.query(query);
    return result;
  } catch (e) {
    console.error(`Error executing: ${query}`, e);
    return [];
  }
};