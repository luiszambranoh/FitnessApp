import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Input from '../../../components/Input';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { layout, form } from '../../../styles/theme';
import { RoutineService } from '../../../database/database';
import { useCrud, CrudService } from '../../../hooks/useCrud';
import { RoutineRow, NewRoutine } from '../../../database/types/dbTypes';

export default function CreateRoutineScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const routineCrudService = useMemo(() => ({
    getAll: async () => { return []; },
    getById: async (id: number) => { return null; },
    add: (data: NewRoutine) => RoutineService.add(data),
    update: (item: RoutineRow) => RoutineService.update(item),
    delete: (id: number) => RoutineService.delete(id),
  }), []);

  const { addItem: addRoutineCrud } = useCrud(routineCrudService);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(t('general.error'), t('routines.validation.nameRequired'));
      return;
    }

    try {
      const newRoutineId = await addRoutineCrud({ name, note });
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