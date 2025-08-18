import React, { useState, useRef, useCallback } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { layout, form, workout } from "../../styles/theme";
import { Feather } from "@expo/vector-icons";
import {
  SessionExerciseService,
  ExerciseService,
  SetService,
} from "../../database/database";
import {
  SessionExerciseRow,
  ExerciseRow,
  SetRow,
  NewSet,
} from "../../database/types/dbTypes";

// Debounce utility function
const debounce = (func: Function, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

interface FullSessionExercise extends SessionExerciseRow {
  exerciseDetails: ExerciseRow | null;
  sets: SetRow[];
}

export default function WorkoutID() {
  const { workout_id } = useLocalSearchParams();
  const { t } = useTranslation();
  const [sessionExercises, setSessionExercises] = useState<FullSessionExercise[]>([]);
  const workoutIdNum = Number(workout_id);

  const fetchWorkoutDetails = useCallback(async () => {
    if (isNaN(workoutIdNum)) return;
    try {
      const fetchedSessionExercises = await SessionExerciseService.getBySessionId(workoutIdNum);
      const fullSessionExercises: FullSessionExercise[] = await Promise.all(
        fetchedSessionExercises.map(async (se) => {
          const exerciseDetails = await ExerciseService.getById(se.exercise_id);
          const sets = await SetService.getBySessionExerciseId(se.id);
          return { ...se, exerciseDetails, sets };
        })
      );
      setSessionExercises(fullSessionExercises);
    } catch (error) {
      console.error("Error fetching workout details:", error);
      Alert.alert(t('general.error'), t('workoutDetails.failedToLoad'));
    }
  }, [workoutIdNum, t]);

  useFocusEffect(
    useCallback(() => {
      if (isNaN(workoutIdNum)) {
        Alert.alert(t('general.error'), t('workoutDetails.invalidWorkoutId'));
        return;
      }
      fetchWorkoutDetails();
    }, [workoutIdNum, fetchWorkoutDetails, t])
  );

  const handleAddExercise = () => {
    router.navigate(`/workout/${workout_id}/add-exercise`);
  };

  const handleAddSet = async (sessionExerciseId: number) => {
    const newSet: NewSet = {
      session_exercise_id: sessionExerciseId,
      set_type: 'normal',
      rest: null,
      weight: null,
      reps: null,
      completed: 0,
      note: null,
    };
    try {
      const newSetId = await SetService.add(newSet);
      if (newSetId) {
        fetchWorkoutDetails();
      } else {
        Alert.alert(t('general.error'), t('workoutDetails.failedToAddSet'));
      }
    } catch (error) {
      console.error("Error adding set:", error);
      Alert.alert(t('general.error'), t('workoutDetails.errorAddingSet'));
    }
  };

  const updateSetInDb = async (updatedSet: SetRow) => {
    try {
      await SetService.update(updatedSet);
    } catch (error) {
      console.error("Error updating set:", error);
      Alert.alert(t('general.error'), t('workoutDetails.failedToUpdateSet'));
    }
  };

  const debouncedUpdateSetInDb = useRef(debounce(updateSetInDb, 500)).current;

  const handleSetChange = (setId: number, field: keyof SetRow, value: string | number | null) => {
    setSessionExercises((prev) =>
      prev.map((se) => ({
        ...se,
        sets: se.sets.map((set) => {
          if (set.id === setId) {
            const updatedSet = { ...set, [field]: value };
            debouncedUpdateSetInDb(updatedSet);
            return updatedSet;
          }
          return set;
        }),
      }))
    );
  };

  const handleCompleteSet = (setId: number) => {
    setSessionExercises((prev) =>
      prev.map((se) => ({
        ...se,
        sets: se.sets.map((set) => {
          if (set.id === setId) {
            const updatedSet = { ...set, completed: set.completed === 1 ? 0 : 1 };
            updateSetInDb(updatedSet);
            return updatedSet;
          }
          return set;
        }),
      }))
    );
  };

  const handleRemoveSet = async (setId: number) => {
    try {
      await SetService.delete(setId);
      fetchWorkoutDetails();
    } catch (error) {
      console.error("Error removing set:", error);
      Alert.alert(t('general.error'), t('workoutDetails.failedToRemoveSet'));
    }
  };

  const renderExerciseBlock = ({ item }: { item: FullSessionExercise }) => (
    <View className={workout.exerciseBlockContainer}>
      <Text className={workout.exerciseName}>
        {item.exerciseDetails?.name || t('general.unknownExercise')}
      </Text>

      <View className={workout.tableHeaderContainer}>
        <Text className={workout.tableHeaderText}>{t('workout.set')}</Text>
        <Text className={workout.tableHeaderText}>{t('workout.reps')}</Text>
        <Text className={workout.tableHeaderText}>{t('workout.weight')}</Text>
        <Text className={workout.tableHeaderText}>{t('workout.completed')}</Text>
      </View>

      {item.sets.map((setItem, index) => (
        <View key={setItem.id} className={workout.setRowContainer}>
          <TouchableOpacity className={workout.setTypeButton}>
            <Text className={workout.setTypeText}>{index + 1}</Text>
          </TouchableOpacity>

          <TextInput
            className={workout.setInput}
            keyboardType="numeric"
            value={setItem.reps?.toString() || ''}
            onChangeText={(text) => handleSetChange(setItem.id, 'reps', text ? Number(text) : null)}
          />

          <TextInput
            className={workout.setInput}
            keyboardType="numeric"
            value={setItem.weight?.toString() || ''}
            onChangeText={(text) => handleSetChange(setItem.id, 'weight', text ? Number(text) : null)}
          />

          <TouchableOpacity
            className={workout.setCheckButton}
            onPress={() => handleCompleteSet(setItem.id)}
          >
            <Feather
              name={setItem.completed === 1 ? "check-circle" : "circle"}
              size={24}
              color={setItem.completed === 1 ? "green" : "gray"}
            />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        onPress={() => handleAddSet(item.id)}
        className={form.button}
      >
        <Text className={form.buttonText}>{t('workout.addSet')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className={layout.container}>
      <TouchableOpacity
        onPress={handleAddExercise}
        className={workout.addExerciseButton}
      >
        <Text className={form.buttonText}>{t('workout.addExercise')}</Text>
      </TouchableOpacity>

      <FlatList
        data={sessionExercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExerciseBlock}
        ListEmptyComponent={
          <Text className={workout.noExercisesText}>
            {t('workout.noExercisesAdded')}
          </Text>
        }
      />
    </View>
  );
}
