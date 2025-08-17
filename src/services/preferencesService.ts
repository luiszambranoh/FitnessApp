import * as FileSystem from 'expo-file-system';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es';

export interface Preferences {
  theme: Theme;
  language: Language;
}

const PREFERENCES_FILE_URI = `${FileSystem.documentDirectory}preferences.json`;

const defaultPreferences: Preferences = {
  theme: 'dark', // Defaulting to dark as per our design
  language: 'en', // Default to English
};

export const preferencesService = {
  async read(): Promise<Preferences> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(PREFERENCES_FILE_URI);
      if (!fileInfo.exists) {
        await this.write(defaultPreferences);
        return defaultPreferences;
      }

      const content = await FileSystem.readAsStringAsync(PREFERENCES_FILE_URI);
      // Ensure that loaded preferences have all keys from default preferences
      const loadedPrefs = JSON.parse(content);
      return { ...defaultPreferences, ...loadedPrefs };
    } catch (error) {
      console.error("Failed to read preferences, returning default:", error);
      return defaultPreferences;
    }
  },

  async write(preferences: Preferences): Promise<void> {
    try {
      const content = JSON.stringify(preferences);
      await FileSystem.writeAsStringAsync(PREFERENCES_FILE_URI, content);
    } catch (error) {
      console.error("Failed to write preferences:", error);
    }
  },
};