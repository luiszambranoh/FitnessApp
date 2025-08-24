
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';
import { exportDatabase, importDatabase } from '../../services/databaseService';
import { layout, form } from '../../styles/theme';

const DatabaseManagementScreen = () => {
  const { t } = useTranslation();

  const handleExport = async () => {
    try {
      await exportDatabase();
      Alert.alert(t('database.exportSuccessTitle'), t('database.exportSuccessMessage'));
    } catch (error) {
      Alert.alert(t('database.exportErrorTitle'), t('database.exportErrorMessage'));
    }
  };

  const handleImport = async () => {
    try {
      await importDatabase();
      Alert.alert(t('database.importSuccessTitle'), t('database.importSuccessMessage'));
    } catch (error) {
      Alert.alert(t('database.importErrorTitle'), t('database.importErrorMessage'));
    }
  };

  return (
    <View className={layout.container}>
      <Stack.Screen options={{ title: t('settings.databaseTitle') }} />
      <TouchableOpacity className={form.button} onPress={handleExport}>
        <Text className={form.buttonText}>{t('database.exportButton')}</Text>
      </TouchableOpacity>
      <TouchableOpacity className={form.button} onPress={handleImport}>
        <Text className={form.buttonText}>{t('database.importButton')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DatabaseManagementScreen;
