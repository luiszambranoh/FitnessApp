import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, FlatList } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { RoutineService, ExerciseService } from "../../../../database/database";
import { NewRoutineExercise, ExerciseRow } from "../../../../database/types/dbTypes";
import { useTranslation } from "react-i18next";
import { layout, form, fixed } from "../../../../styles/theme";
import ExerciseCard from "../../../../components/ExerciseCard";
import SearchableDropdown from "../../../../components/SearchableDropdown";

export default function AddExercise() {
  const { routine_id } = useLocalSearchParams();
  const [allExercises, setAllExercises] = useState<ExerciseRow[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const fetchedExercises = await ExerciseService.getAll();
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
      Alert.alert(t('general.error'), t('addExercise.missingRoutineId'));
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
          superset_id: null,
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
      <Text className={layout.title}>{t('addExercise.title')}</Text>
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