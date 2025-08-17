import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { layout } from '../../styles/theme';

export default function RoutinesScreen() {
  const { t } = useTranslation();
  return (
    <View className={`${layout.container} justify-center items-center`}>
      <Text className={layout.title}>{t('general.developing')}</Text>
    </View>
  );
}
