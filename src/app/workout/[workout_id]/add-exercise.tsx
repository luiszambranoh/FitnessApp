import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import { View, Text, TouchableOpacity, Alert, FlatList } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SessionExerciseService, ExerciseService } from "../../../database/database";
import { NewSessionExercise, ExerciseRow, SessionExerciseRow } from "../../../database/types/dbTypes"; // Added SessionExerciseRow
import { useTranslation } from "react-i18next";
import { layout, form, fixed } from "../../../styles/theme";
import ExerciseCard from "../../../components/ExerciseCard";
import SearchableDropdown from "../../../components/SearchableDropdown";
import { useCrud, CrudService } from "../../../hooks/useCrud"; // Import useCrud and CrudService

export default function AddExercise() {
  const { workout_id } = useLocalSearchParams();
  const [allExercises, setAllExercises] = useState<ExerciseRow[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();
  const workoutIdNum = Number(workout_id);

  // Define the CrudService for SessionExercise
  const sessionExerciseCrudService = useMemo(() => {
    return {
      getAll: async () => {
        // This component doesn't need to fetch all session exercises via useCrud's getAll
        // It fetches them directly in useEffect for filtering purposes.
        return [];
      },
      getById: async (id: number) => SessionExerciseService.getById(id),
      add: async (data: NewSessionExercise) => SessionExerciseService.add(data),
      update: async (item: SessionExerciseRow) => SessionExerciseService.update(item),
      delete: async (id: number) => SessionExerciseService.delete(id),
    } as CrudService<SessionExerciseRow, NewSessionExercise>;
  }, []);

  const { addItem: addSessionExerciseCrud } = useCrud(sessionExerciseCrudService);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const fetchedExercises = await ExerciseService.getAll();
        if (workout_id) {
          const sessionExercises = await SessionExerciseService.getBySessionId(workoutIdNum);
          const addedExerciseIds = new Set(sessionExercises.map(se => se.exercise_id));
          const availableExercises = fetchedExercises.filter(ex => !addedExerciseIds.has(ex.id));
          setAllExercises(availableExercises);
        } else {
          setAllExercises(fetchedExercises);
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
        Alert.alert(t('general.error'), "Failed to load exercises.");
      }
    };
    fetchExercises();
  }, [workout_id, workoutIdNum]); // Added workoutIdNum to dependencies

  const toggleExerciseSelection = (exerciseId: number) => {
    setSelectedExerciseIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(exerciseId)) {
        return prevSelectedIds.filter((id) => id !== exerciseId);
      } else {
        return [...prevSelectedIds, exerciseId];
      }
    });
  };

  const handleAddExercises = async () => {
    if (isNaN(workoutIdNum)) { // Use workoutIdNum directly
      Alert.alert(t('general.error'), t('addExercise.missingWorkoutId'));
      return;
    }
    if (selectedExerciseIds.length === 0) {
      Alert.alert(t('general.error'), t('addExercise.selectExercise'));
      return;
    }

    try {
      for (const exerciseId of selectedExerciseIds) {
        const newSessionExercise: NewSessionExercise = {
          session_id: workoutIdNum, // Use workoutIdNum
          exercise_id: exerciseId,
          note: null,
          superset_id: null,
        };
        await addSessionExerciseCrud(newSessionExercise); // Use useCrud's addItem
      }
      Alert.alert(t('general.success'), t('addExercise.success'));
      router.back();
    } catch (error) {
      console.error("Error adding session exercises:", error);
      Alert.alert(t('general.error'), t('addExercise.error'));
    }
  };

  const filteredExercises = allExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedExercises = [...filteredExercises].sort((a, b) => {
    const aIsSelected = selectedExerciseIds.includes(a.id);
    const bIsSelected = selectedExerciseIds.includes(b.id);
    if (aIsSelected === bIsSelected) {
      return a.name.localeCompare(b.name);
    }
    return aIsSelected ? -1 : 1;
  });

  const renderExerciseCard = ({ item }: { item: ExerciseRow }) => (
    <ExerciseCard
      exercise={item}
      isSelected={selectedExerciseIds.includes(item.id)}
      onSelect={toggleExerciseSelection}
    />
  );

  return (
    <View className={`${layout.container} pb-20`}>
      <SearchableDropdown
        onSearch={setSearchQuery}
        placeholder={t('general.search')}
      />
      <FlatList
        data={sortedExercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExerciseCard}
      />

      {selectedExerciseIds.length > 0 && (
        <View className={fixed.bottomButtonContainer}>
          <TouchableOpacity
            onPress={handleAddExercises}
            className={form.button}
          >
            <Text className={form.buttonText}>
              {t('addExercise.addExercisesButton_other', { count: selectedExerciseIds.length })}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
