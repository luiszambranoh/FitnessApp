import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { layout } from '../../styles/theme';
import { Theme } from '../../services/preferencesService';

export default function ThemeScreen() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const themeOptions: { tKey: string; value: Theme }[] = [
    { tKey: 'theme.light', value: 'light' },
    { tKey: 'theme.dark', value: 'dark' },
    { tKey: 'theme.system', value: 'system' },
  ];

  return (
    <View className={layout.container}>
      <Text className="text-lg text-center text-gray-600 dark:text-gray-400 mb-5">
        {t('theme.prompt')}
      </Text>
      {themeOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => setTheme(option.value)}
          className={`p-4 mb-2 rounded-lg ${
            theme === option.value
              ? 'bg-blue-600'
              : 'bg-white dark:bg-gray-800'
          }`}>
          <Text className={`text-lg ${
            theme === option.value
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