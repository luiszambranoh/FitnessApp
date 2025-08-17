import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SessionExerciseService } from "../../../database/database";
import { NewSessionExercise } from "../../../database/types/dbTypes";

export default function AddExercise() {
  const { workout_id } = useLocalSearchParams();
  const [exerciseId, setExerciseId] = useState<string>(''); // For simplicity, using string for now
  const [note, setNote] = useState<string>('');

  const handleAddExercise = async () => {
    if (!workout_id) {
      Alert.alert("Error", "Workout ID is missing.");
      return;
    }
    if (!exerciseId) {
      Alert.alert("Error", "Exercise ID is required.");
      return;
    }

    const newSessionExercise: NewSessionExercise = {
      session_id: Number(workout_id),
      exercise_id: Number(exerciseId),
      note: note || null,
      superset_id: null, // Assuming no superset for now
    };

    try {
      const result = await SessionExerciseService.add(newSessionExercise);
      if (result) {
        Alert.alert("Success", "Exercise added to workout!");
        router.back(); // Go back to the workout details page
      } else {
        Alert.alert("Error", "Failed to add exercise.");
      }
    } catch (error) {
      console.error("Error adding session exercise:", error);
      Alert.alert("Error", "An error occurred while adding the exercise.");
    }
  };

  return (
    <View className="flex-1 p-5 bg-gray-100">
      <Text className="text-xl mb-5 text-center font-bold">Add Exercise for Workout ID: {workout_id}</Text>

      <TextInput
        className="border border-gray-300 p-3 mb-4 rounded-lg bg-white"
        placeholder="Exercise ID (e.g., 1)"
        keyboardType="numeric"
        value={exerciseId}
        onChangeText={setExerciseId}
      />

      <TextInput
        className="border border-gray-300 p-3 mb-6 rounded-lg bg-white"
        placeholder="Note (optional)"
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity
        onPress={handleAddExercise}
        className="bg-blue-500 p-4 rounded-lg items-center"
      >
        <Text className="text-white font-bold">Add Exercise to Workout</Text>
      </TouchableOpacity>
    </View>
  );
}
