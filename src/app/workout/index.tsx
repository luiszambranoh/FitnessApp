import { router } from "expo-router";
import { View, Text, FlatList, Pressable, Alert, TouchableOpacity } from "react-native";
import { RoutineService, WorkoutService } from '../../database/database';
import { useState } from "react";
import { WorkoutRow, RoutineRow } from "../../database/types/dbTypes";
import { useTranslation } from "react-i18next";
import { layout, form, list, table } from "../../styles/theme";
import DropdownMenu from '../../components/DropdownMenu';
import { FontAwesome } from '@expo/vector-icons';
import { useCrud } from "../../hooks/useCrud";

export default function WorkoutScreen() {
  const { data: workouts, addItem: addWorkout, deleteItem: deleteWorkout, refetch } = useCrud(WorkoutService);
  const { data: routines } = useCrud(RoutineService);
  const { t } = useTranslation();

  const handleCreateNewWorkout = async () => {
    try {
      const newId = await addWorkout({note: ""});
      if (newId) {
        router.navigate(`/workout/${newId}`);
        refetch()
      } else {
        console.error(t('workoutList.createWorkoutFailed'));
      }
    } catch (error) {
      console.error(t('workoutList.createWorkoutError'), error);
    }
  };

  const handleCreateWorkoutFromRoutine = async (routineId: number) => {
    try {
      // This is a custom method not part of the standard CRUD service
      const newWorkoutId = await RoutineService.createWorkoutFromRoutine(routineId);
      if (newWorkoutId) {
        router.navigate(`/workout/${newWorkoutId}`);
        refetch();
      } else {
        Alert.alert(t('general.error'), t('workoutList.createWorkoutFromRoutineError'));
      }
    } catch (error) {
      console.error(t('workoutList.createWorkoutFromRoutineError'), error);
      Alert.alert(t('general.error'), t('workoutList.createWorkoutFromRoutineError'));
    }
  };

  const handleDeleteWorkout = async (id: number) => {
    Alert.alert(
      t('workoutList.confirmDeleteTitle'),
      t('workoutList.confirmDeleteMessage'),
      [
        { text: t('workoutList.no'), style: 'cancel' },
        {
          text: t('workoutList.yes'),
          onPress: async () => {
            try {
              await deleteWorkout(id);
              refetch();
            } catch (error) {
              console.error(t('workoutList.deleteFail'), error);
              Alert.alert(t('general.error'), t('workoutList.deleteFail'));
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderWorkoutItem = ({ item }: { item: WorkoutRow }) => {

    return (
      <View className={table.rowContainer}>
        <Pressable
          className="flex-1 flex-row items-center"
          onPress={() => {
            router.navigate(`/workout/${item.id}`)
          }}
        >
          <Text className={table.rowText}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text className={table.rowText}>{item.time}</Text>
        </Pressable>
        <TouchableOpacity onPress={() => handleDeleteWorkout(item.id)} className="p-2">
          <FontAwesome name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderRoutineItem = ({ item }: { item: RoutineRow }) => (
    <TouchableOpacity onPress={() => handleCreateWorkoutFromRoutine(item.id)}>
      <View className={`${list.itemContainer} justify-between`}>
          <Text className={list.itemText}>{item.name}</Text>
          <FontAwesome name="plus" size={24} color="green" />
    </View>
    </TouchableOpacity>
  );

  return (
    <View className={layout.container}>
      <TouchableOpacity className={form.button} onPress={handleCreateNewWorkout}>
        <Text className={form.buttonText}>{t('workoutList.newWorkoutButton')}</Text>
      </TouchableOpacity>
      <View className="mt-4 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden h-1/3">
        <View className={table.headerContainer}>
          <Text className={table.headerText}>{t('workoutList.dateHeader')}</Text>
          <Text className={table.headerText}>{t('workoutList.timeHeader')}</Text>
          <Text className={table.headerText}></Text>
        </View>
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      <View className="mt-5">
        <Text className={layout.title}>{t('workoutList.routinesHeader')}</Text>
        <View className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden h-80">
            <FlatList
              data={routines}
              renderItem={renderRoutineItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={<Text className="text-gray-500 text-center mt-2">{t('routines.noRoutines')}</Text>}
            />
        </View>
      </View>
    </View>
  );
}