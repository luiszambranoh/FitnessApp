import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { preferencesService } from './services/preferencesService';

// Import your translation files
import en from './locales/en.json';
import es from './locales/es.json';

export const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
} as const;

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    compatibilityJSON: 'v3', // For React Native
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false, // Recommended for React Native
    }
  });

// Load the saved language preference
const loadLanguage = async () => {
  try {
    const prefs = await preferencesService.read();
    if (prefs.language) {
      i18n.changeLanguage(prefs.language);
    }
  } catch (error) {
    console.error("Failed to load language from preferences", error);
  }
};

loadLanguage();

export default i18n;
