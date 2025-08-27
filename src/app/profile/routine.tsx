import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import Input from '../../components/Input';
import { Link, router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { layout, form, list } from '../../styles/theme';
import { RoutineService } from '../../database/database';
import { RoutineRow } from '../../database/types/dbTypes';
import { FontAwesome } from '@expo/vector-icons';
import { useCrud } from '../../hooks/useCrud';

export default function RoutinesScreen() {
  const { t } = useTranslation();
  const { data: routines, updateItem, deleteItem, refetch } = useCrud(RoutineService);
  const [editingRoutineId, setEditingRoutineId] = useState<number | null>(null);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineNote, setNewRoutineNote] = useState<string | null>('');

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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
            const success = await updateItem({ ...routineToUpdate, name: newRoutineName, note: newRoutineNote });
            if (success) {
                Alert.alert(t('general.success'), t('routines.updateSuccess'));
                handleCancel();
                refetch();
            } else {
                Alert.alert(t('general.error'), t('routines.updateFail'));
            }
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
              const deleted = await deleteItem(id);
              if (deleted) {
                Alert.alert(t('general.success'), t('routines.deleteSuccess'));
                refetch();
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
                <Input
                    value={newRoutineName}
                    onChangeText={setNewRoutineName}
                    className={form.textInput}
                    autoFocus
                />
                <Input
                    value={newRoutineNote || ''}
                    onChangeText={setNewRoutineNote}
                    className={form.textInput}
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