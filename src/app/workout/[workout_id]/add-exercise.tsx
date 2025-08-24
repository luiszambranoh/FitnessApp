import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SessionExerciseService, ExerciseService } from "../../../database/database";
import { NewSessionExercise, ExerciseRow } from "../../../database/types/dbTypes";
import { useTranslation } from "react-i18next";
import { layout, form, fixed } from "../../../styles/theme";
import ExerciseCard from "../../../components/ExerciseCard";

export default function AddExercise() {
  const { workout_id } = useLocalSearchParams();
  const [allExercises, setAllExercises] = useState<ExerciseRow[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<number[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const fetchedExercises = await ExerciseService.getAll();
        setAllExercises(fetchedExercises);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        Alert.alert(t('general.error'), "Failed to load exercises.");
      }
    };
    fetchExercises();
  }, []);

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
    if (!workout_id) {
      Alert.alert(t('general.error'), t('addExercise.missingWorkoutId'));
      return;
    }
    if (selectedExerciseIds.length === 0) {
      Alert.alert(t('general.error'), t('addExercise.selectExercise')); // Using new translation key
      return;
    }

    try {
      for (const exerciseId of selectedExerciseIds) {
        const newSessionExercise: NewSessionExercise = {
          session_id: Number(workout_id),
          exercise_id: exerciseId,
          note: null,
          superset_id: null,
        };
        await SessionExerciseService.add(newSessionExercise);
      }
      Alert.alert(t('general.success'), t('addExercise.success')); // Using general.success
      router.back();
    } catch (error) {
      console.error("Error adding session exercises:", error);
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
      <Text className={layout.title}>{t('addExercise.title')} {workout_id}</Text>

      {selectedExercises.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('addExercise.selectedExercisesTitle')}</Text>
          <FlatList
            data={selectedExercises}
            keyExtractor={(item) => `selected-${item.id.toString()}`}
            renderItem={({ item }) => (
              <View style={{ width: 250, marginRight: 10 }}>
                <ExerciseCard
                  exercise={item}
                  isSelected={selectedExerciseIds.includes(item.id)}
                  onSelect={toggleExerciseSelection}
                />
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={true}
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
