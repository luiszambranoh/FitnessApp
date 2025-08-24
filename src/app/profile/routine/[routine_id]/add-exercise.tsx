import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { RoutineService, ExerciseService } from "../../../../database/database";
import { NewRoutineExercise, ExerciseRow } from "../../../../database/types/dbTypes";
import { useTranslation } from "react-i18next";
import { layout, form, fixed } from "../../../../styles/theme";
import ExerciseCard from "../../../../components/ExerciseCard";

export default function AddExerciseToRoutine() {
  const { routine_id } = useLocalSearchParams();
  const [allExercises, setAllExercises] = useState<ExerciseRow[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<number[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const fetchedExercises = await ExerciseService.getAll();
        
        // Get already added exercises to filter them out
        if (routine_id) {
          const routineExercises = await RoutineService.getExercisesByRoutineId(Number(routine_id));
          const addedExerciseIds = new Set(routineExercises.map(re => re.exercise_id));
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
  }, [routine_id]);

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
    if (!routine_id) {
      Alert.alert(t('general.error'), t('routines.invalidId'));
      return;
    }
    if (selectedExerciseIds.length === 0) {
      Alert.alert(t('general.error'), t('addExercise.selectExercise'));
      return;
    }

    try {
      for (const exerciseId of selectedExerciseIds) {
        const newRoutineExercise: NewRoutineExercise = {
          routine_id: Number(routine_id),
          exercise_id: exerciseId,
          note: null,
        };
        await RoutineService.addExercise(newRoutineExercise);
      }
      Alert.alert(t('general.success'), t('addExercise.success'));
      router.back();
    } catch (error) {
      console.error("Error adding routine exercises:", error);
      Alert.alert(t('general.error'), t('addExercise.error'));
    }
  };

  const selectedExercises = allExercises.filter((exercise) =>
    selectedExerciseIds.includes(exercise.id)
  );
  const availableExercises = allExercises;

  const renderExerciseCard = ({ item }: { item: ExerciseRow }) => (
    <ExerciseCard
      exercise={item}
      isSelected={selectedExerciseIds.includes(item.id)}
      onSelect={toggleExerciseSelection}
    />
  );

  return (
    <View className={`${layout.container} pb-20`}>
      <Text className={layout.title}>{t('addExercise.titleRoutine')} {routine_id}</Text>

      {selectedExercises.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('addExercise.selectedExercisesTitle')}</Text>
          <FlatList
            data={selectedExercises}
            keyExtractor={(item) => `selected-${item.id.toString()}`}
            renderItem={renderExerciseCard}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{t('addExercise.allExercisesTitle')}</Text>
        <FlatList
          data={availableExercises}
          keyExtractor={(item) => `all-${item.id.toString()}`}
          renderItem={renderExerciseCard}
        />
      </View>

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

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333', // Adjust based on theme
  },
});
