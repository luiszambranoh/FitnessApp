import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { layout } from '../../styles/theme';
import { preferencesService, Language } from '../../services/preferencesService';

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();

  const languageOptions: { tKey: string; value: Language }[] = [
    { tKey: 'language.english', value: 'en' },
    { tKey: 'language.spanish', value: 'es' },
  ];

  const changeLanguage = async (lang: Language) => {
    try {
      await i18n.changeLanguage(lang);
      const prefs = await preferencesService.read();
      await preferencesService.write({ ...prefs, language: lang });
    } catch (error) {
      console.error("Failed to change language", error);
    }
  };

  return (
    <View className={layout.container}>
      <Text className="text-lg text-center text-gray-600 dark:text-gray-400 mb-5">
        {t('language.prompt')}
      </Text>
      {languageOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => changeLanguage(option.value)}
          className={`p-4 mb-2 rounded-lg ${
            i18n.language === option.value
              ? 'bg-blue-600'
              : 'bg-white dark:bg-gray-800'
          }`}>
          <Text className={`text-lg ${
            i18n.language === option.value
              ? 'text-white'
              : 'text-gray-900 dark:text-gray-200'
          }`}>
            {t(option.tKey)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
