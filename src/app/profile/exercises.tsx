import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { layout, form } from '../../styles/theme';

export default function ExercisesScreen() {
  const { t } = useTranslation();
  return (
    <View className={`${layout.container} justify-center`}>
      <Link href="/profile/create-exercise" className={form.button}>
        <Text className={form.buttonText}>{t('exercises.createButton')}</Text>
      </Link>
      
      {/* You can add a list of existing exercises here in the future */}
    </View>
  );
}