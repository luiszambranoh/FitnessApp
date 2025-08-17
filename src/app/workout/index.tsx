import { router } from "expo-router";
import { Button, View, Text, FlatList, Pressable } from "react-native";
import { ExerciseService, SessionExerciseService, WorkoutService } from '../../database/database';
import { useEffect, useState } from "react";
import { initDB } from "../../database/setup/init";
import { WorkoutRow } from "../../database/types/dbTypes";

export default function WorkoutScreen() {
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [onWorkoutPage, setOnWorkoutPage] = useState<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        const s = await WorkoutService.getAll();
        setWorkouts(s);
        console.log(s);
        console.log(await WorkoutService.getAll());
        console.log(await ExerciseService.getAll());
      } catch (e) {
        console.error("Layout DB Init Error:", e);
      }
    };

    initialize();
  }, [onWorkoutPage]);
  
  const handlePress = async () => {
    try {
      const newId = await WorkoutService.add();

      if (newId) {
        router.navigate(`/workout/${newId}`);
      } else {
        console.error("Failed to create a new workout: ID was not returned.");
      }
    } catch (error) {
      console.error("An error occurred while creating the workout:", error);
    }
  };

  const renderItem = ({ item }: { item: WorkoutRow }) => (
    <Pressable
      className="flex-row p-4 border-b border-gray-200"
      onPress={() => {
        router.navigate(`/workout/${item.id}`)
        setOnWorkoutPage(true);
      }}
    >
      <Text className="flex-1">{new Date(item.date).toLocaleDateString()}</Text>
      <Text className="flex-1">{item.time}</Text>
      <Text className="flex-1">{item.note}</Text>
    </Pressable>
  );

  return (
    <View className="flex-1">
      <Button title="New Workout" onPress={handlePress} />
      <View className="flex-row p-4 bg-gray-100">
        <Text className="flex-1 font-bold">Date</Text>
        <Text className="flex-1 font-bold">Time</Text>
        <Text className="flex-1 font-bold">Note</Text>
      </View>
      <FlatList
        data={workouts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}