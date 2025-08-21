import { router } from "expo-router";
import { Button, View, Text, FlatList, Pressable, Alert, TouchableOpacity } from "react-native";
import { RoutineService, WorkoutService } from '../../database/database';
import { useEffect, useState, useCallback } from "react";
import { initDB } from "../../database/setup/init";
import { WorkoutRow, RoutineRow } from "../../database/types/dbTypes";
import { useTranslation } from "react-i18next";
import { layout, form, list, table } from "../../styles/theme";
import DropdownMenu from '../../components/DropdownMenu';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FontAwesome } from '@expo/vector-icons';

export default function WorkoutScreen() {
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [routines, setRoutines] = useState<RoutineRow[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { t } = useTranslation();

  const fetchData = useCallback(async () => {
    try {
      await initDB();
      const fetchedWorkouts = await WorkoutService.getAll();
      setWorkouts(fetchedWorkouts);
      const fetchedRoutines = await RoutineService.getAll();
      setRoutines(fetchedRoutines);
    } catch (e) {
      console.error("Layout DB Init Error:", e);
    }
  }, []);

  useEffect(() => {
    fetchData();

  }, []);
  
  const handlePress = async () => {
    try {
      const newId = await WorkoutService.add();

      if (newId) {
        router.navigate(`/workout/${newId}`);
        setRefreshKey(prev => prev + 1);
      } else {
        console.error(t('workoutList.createWorkoutFailed'));
      }
    } catch (error) {
      console.error(t('workoutList.createWorkoutError'), error);
    }
  };

  const handleCreateWorkoutFromRoutine = async (routineId: number) => {
    try {
      const newWorkoutId = await RoutineService.createWorkoutFromRoutine(routineId);
      if (newWorkoutId) {
        router.navigate(`/workout/${newWorkoutId}`);
      } else {
        Alert.alert(t('general.error'), t('workoutList.createWorkoutFromRoutineError'));
      }
    } catch (error) {
      console.error("Error creating workout from routine:", error);
      Alert.alert(t('general.error'), t('workoutList.createWorkoutFromRoutineError'));
    }
  };

  const handleDeleteWorkout = async (id: number) => {
    setOpenDropdownId(null); // Close dropdown
    Alert.alert(
      t('workoutList.confirmDeleteTitle'),
      t('workoutList.confirmDeleteMessage'),
      [
        {
          text: t('workoutList.no'),
          style: 'cancel',
        },
        {
          text: t('workoutList.yes'),
          onPress: async () => {
            try {
              const success = await WorkoutService.delete(id);
              if (success) {
                Alert.alert("Success", t('workoutList.deleteSuccess'));
                setRefreshKey(prev => prev + 1); // Refresh the list
              } else {
                Alert.alert("Error", t('workoutList.deleteFail'));
              }
            } catch (error) {
              console.error("Error deleting workout:", error);
              Alert.alert("Error", t('workoutList.deleteFail'));
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditWorkout = (id: number) => {
    setOpenDropdownId(null); // Close dropdown
    router.navigate(`/workout/${id}/edit`);
  };

  const renderWorkoutItem = ({ item }: { item: WorkoutRow }) => {
    const dropdownOptions = [
      { label: t('workoutList.edit'), onPress: () => handleEditWorkout(item.id) },
      { label: t('workoutList.remove'), onPress: () => handleDeleteWorkout(item.id) },
    ];

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
        <View>
          {openDropdownId === item.id && dropdownAnchor && (
            <DropdownMenu
              isVisible={true}
              onClose={() => setOpenDropdownId(null)}
              options={dropdownOptions}
              anchorPosition={{ top: dropdownAnchor.y + dropdownAnchor.height, left: dropdownAnchor.x + dropdownAnchor.width - 150 }} // Assuming dropdown width is 150
            />
          )}
        </View>
      </View>
    );
  };

  const renderRoutineItem = ({ item }: { item: RoutineRow }) => (
    <View className={`${list.itemContainer} justify-between`}>
        <Text className={list.itemText}>{item.name}</Text>
        <TouchableOpacity onPress={() => handleCreateWorkoutFromRoutine(item.id)} className="p-2">
            <FontAwesome name="plus" size={24} color="green" />
        </TouchableOpacity>
    </View>
  );

  return (
    <View className={layout.container}>
      <Button title={t('workoutList.newWorkoutButton')} onPress={handlePress} />
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

      <View className="mt-5">
        <Text className={layout.title}>{t('workoutList.routinesHeader')}</Text>
        <FlatList
          data={routines}
          renderItem={renderRoutineItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text className="text-gray-500 text-center mt-2">{t('routines.noRoutines')}</Text>}
        />
      </View>
    </View>
  );
}