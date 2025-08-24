
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { shareAsync } from 'expo-sharing';
import { preferencesService } from './preferencesService';

const dbName = "fitness.db";
const dbUri = FileSystem.documentDirectory + `SQLite/${dbName}`;

export const exportDatabase = async () => {
  try {
    await shareAsync(dbUri, { dialogTitle: 'Export database' });
  } catch (error) {
    console.error("Error exporting database:", error);
    throw error;
  }
};

export const importDatabase = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/octet-stream',
    });

    if (result.canceled) return;
    
    const { assets: [{ uri }] } = result;

    await FileSystem.copyAsync({
      from: uri,
      to: dbUri,
    });
    
  } catch (error) {
    console.error("Error importing database:", error);
    throw error;
  }
};

export const deleteDatabase = async () => {
  try {
    // Check if database file exists
    const dbInfo = await FileSystem.getInfoAsync(dbUri);
    if (dbInfo.exists) {
      // Delete the database file
      await FileSystem.deleteAsync(dbUri);
      console.log('Database file deleted successfully');
    }
    
    // Reset the exercisesAdded preference to false so default exercises will be seeded again
    const preferences = await preferencesService.read();
    await preferencesService.write({ ...preferences, exercisesAdded: false });
    console.log('Preferences reset - default exercises will be added on next startup');
    
  } catch (error) {
    console.error("Error deleting database:", error);
    throw error;
  }
};
