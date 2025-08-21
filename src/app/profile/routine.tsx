import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, TextInput } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { layout, form, list } from '../../styles/theme';
import { RoutineService } from '../../database/database';
import { RoutineRow } from '../../database/types/dbTypes';
import { FontAwesome } from '@expo/vector-icons';

export default function RoutinesScreen() {
  const { t } = useTranslation();
  const [routines, setRoutines] = useState<RoutineRow[]>([]);
  const [editingRoutineId, setEditingRoutineId] = useState<number | null>(null);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineNote, setNewRoutineNote] = useState<string | null>('');

  const fetchRoutines = async () => {
    try {
      const fetchedRoutines = await RoutineService.getAll();
      setRoutines(fetchedRoutines);
    } catch (error) {
      console.error("Error fetching routines:", error);
      Alert.alert(t('general.error'), "Failed to load routines.");
    }
  };

  useEffect(() => {

    fetchRoutines();
  }, []);

  const handleEdit = (routine: RoutineRow) => {
    setEditingRoutineId(routine.id);
    setNewRoutineName(routine.name);
    setNewRoutineNote(routine.note);
  };

  const handleCancel = () => {
    setEditingRoutineId(null);
    setNewRoutineName('');
    setNewRoutineNote('');
  };

  const handleUpdate = async () => {
    if (!editingRoutineId) return;

    const routineToUpdate = routines.find(r => r.id === editingRoutineId);
    if (routineToUpdate) {
        try {
            await RoutineService.update({ ...routineToUpdate, name: newRoutineName, note: newRoutineNote });
            Alert.alert(t('general.success'), t('routines.updateSuccess'));
            fetchRoutines();
            handleCancel();
        } catch (error) {
            console.error('Error updating routine:', error);
            Alert.alert(t('general.error'), t('routines.updateFail'));
        }
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      t('routines.confirmDeleteTitle'),
      t('routines.confirmDeleteMessage'),
      [
        {
          text: t('workoutList.no'),
          style: 'cancel',
        },
        {
          text: t('workoutList.yes'),
          onPress: async () => {
            try {
              const deleted = await RoutineService.delete(id);
              if (deleted) {
                Alert.alert(t('general.success'), t('routines.deleteSuccess'));
                fetchRoutines();
              } else {
                Alert.alert(t('general.error'), t('routines.deleteFail'));
              }
            } catch (error) {
              console.error('Error deleting routine:', error);
              Alert.alert(t('general.error'), t('routines.deleteFail'));
            }
          },
        },
      ]
    );
  };

  const renderRoutineItem = ({ item }: { item: RoutineRow }) => {
    if (editingRoutineId === item.id) {
      return (
        <View className={`${list.itemContainer} justify-between`}>
            <View className="flex-1">
                <TextInput
                    value={newRoutineName}
                    onChangeText={setNewRoutineName}
                    className={form.textInput}
                    autoFocus
                />
                <TextInput
                    value={newRoutineNote || ''}
                    onChangeText={setNewRoutineNote}
                    className={`${form.textInput} dark:placeholder:bg-white`}
                    placeholder={t('routines.notePlaceholder')}
                />
            </View>
          <TouchableOpacity onPress={handleUpdate} className="p-2">
            <FontAwesome name="check" size={24} color="green" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCancel} className="p-2">
            <FontAwesome name="times" size={24} color="red" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className={`${list.itemContainer} justify-between`}>
        <TouchableOpacity onPress={() => router.push(`/profile/routine/${item.id}`)} style={{ flex: 1 }}>
            <Text className={list.itemText}>{item.name}</Text>
            {item.note && <Text className="text-gray-500">{item.note}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit(item)} className="p-2">
            <FontAwesome name="pencil" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2">
            <FontAwesome name="trash-o" size={24} color="red" />
        </TouchableOpacity>
    </View>
    )
  };

  return (
    <View className={layout.container}>
      <View className="mb-4">
        <Link href="/profile/routine/create" asChild>
          <TouchableOpacity className={form.button}>
            <Text className={form.buttonText}>{t('routines.createButton')}</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <Text className={layout.title}>{t('routines.title')}</Text>

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRoutineItem}
        ListEmptyComponent={<Text className="text-gray-500 text-center mt-10">{t('routines.noRoutines')}</Text>}
      />
    </View>
  );
}

// 