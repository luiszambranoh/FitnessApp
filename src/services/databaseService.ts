
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { shareAsync } from 'expo-sharing';

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
