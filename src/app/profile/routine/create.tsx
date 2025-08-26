import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Input from '../../../components/Input';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { layout, form } from '../../../styles/theme';
import { RoutineService } from '../../../database/database';

export default function CreateRoutineScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(t('general.error'), t('routines.validation.nameRequired'));
      return;
    }

    try {
      const newRoutineId = await RoutineService.add({ name, note });
      if (newRoutineId) {
        Alert.alert(t('general.success'), t('routines.createSuccess'));
        router.replace(`/profile/routine/${newRoutineId}`);
      } else {
        Alert.alert(t('general.error'), t('routines.createFail'));
      }
    } catch (error) {
      console.error('Error creating routine:', error);
      Alert.alert(t('general.error'), t('routines.createFail'));
    }
  };

  return (
    <View className={layout.container}>
      <Text className={layout.title}>{t('routines.createTitle')}</Text>

      <Input
        className={form.textInput}
        placeholder={t('routines.namePlaceholder')}
        value={name}
        onChangeText={setName}
      />

      <Input
        className={form.textInput}
        placeholder={t('routines.notePlaceholder')}
        value={note}
        onChangeText={setNote}
        multiline
      />

      <TouchableOpacity className={form.button} onPress={handleCreate}>
        <Text className={form.buttonText}>{t('routines.createButton')}</Text>
      </TouchableOpacity>
    </View>
  );
}