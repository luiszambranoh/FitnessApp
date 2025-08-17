import { router } from "expo-router";
import { Button, View, Text, FlatList, Pressable, Alert } from "react-native";
import { ExerciseService, SessionExerciseService, WorkoutService } from '../../database/database';
import { useEffect, useState, useCallback } from "react";
import { initDB } from "../../database/setup/init";
import { WorkoutRow } from "../../database/types/dbTypes";
import { useTranslation } from "react-i18next";
import { layout, form, list, table } from "../../styles/theme";
import DropdownMenu from '../../components/DropdownMenu';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function WorkoutScreen() {
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { t } = useTranslation();

  const fetchWorkouts = useCallback(async () => {
    try {
      await initDB();
      const s = await WorkoutService.getAll();
      setWorkouts(s);
    } catch (e) {
      console.error("Layout DB Init Error:", e);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts, refreshKey]);
  
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

  const renderItem = ({ item }: { item: WorkoutRow }) => {
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
          <Pressable
            onPress={(event) => {
              event.target.measure((x, y, width, height, pageX, pageY) => {
                setDropdownAnchor({ x: pageX, y: pageY, width, height });
              });
              setOpenDropdownId(openDropdownId === item.id ? null : item.id);
            }}
            className="p-2 rounded-full"
          >
            <MaterialCommunityIcons name="dots-vertical" size={24} color="gray" />
          </Pressable>
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
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}