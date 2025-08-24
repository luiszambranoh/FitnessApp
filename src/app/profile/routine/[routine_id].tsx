import React, { useState, useRef, useCallback } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { layout, form, workout } from "../../../styles/theme";
import { Feather } from "@expo/vector-icons";
import {
  RoutineService,
  ExerciseService,
} from "../../../database/database";
import {
  RoutineExerciseRow,
  ExerciseRow,
  RoutineSetRow,
  NewRoutineSet,
  SetType,
  RoutineRow,
} from "../../../database/types/dbTypes";
import SetOptionsContent from "../../../components/SetOptionsContent";
import BottomSheetDialog from "../../../components/BottomSheetDialog";

// Debounce utility function
const debounce = (func: Function, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

interface FullRoutineExercise extends RoutineExerciseRow {
  exerciseDetails: ExerciseRow | null;
  sets: RoutineSetRow[];
}

export default function RoutineIdScreen() {
  const { routine_id } = useLocalSearchParams();
  const { t } = useTranslation();
  const [routine, setRoutine] = useState<RoutineRow | null>(null);
  const [routineExercises, setRoutineExercises] = useState<FullRoutineExercise[]>([]);
  const [selectedSet, setSelectedSet] = useState<RoutineSetRow | null>(null);
  const [groupedExercises, setGroupedExercises] = useState<{exercises: FullRoutineExercise[]}[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());
  const routineIdNum = Number(routine_id);

  const fetchRoutineDetails = useCallback(async () => {
    if (isNaN(routineIdNum)) return;
    try {
      const fetchedRoutine = await RoutineService.getById(routineIdNum);
      setRoutine(fetchedRoutine);

      const fetchedRoutineExercises = await RoutineService.getExercisesByRoutineId(routineIdNum);
      const fullRoutineExercises: FullRoutineExercise[] = await Promise.all(
        fetchedRoutineExercises.map(async (re) => {
          const exerciseDetails = await ExerciseService.getById(re.exercise_id);
          const sets = await RoutineService.getSetsByRoutineExerciseId(re.id);
          return { ...re, exerciseDetails, sets };
        })
      );
      setRoutineExercises(fullRoutineExercises);
      
      // Group exercises (for now just individual groups, can be enhanced for routine supersets later)
      const grouped = fullRoutineExercises.map(exercise => ({ exercises: [exercise] }));
      setGroupedExercises(grouped);
    } catch (error) {
      console.error("Error fetching routine details:", error);
      Alert.alert(t('general.error'), t('routines.loadFailed'));
    }
  }, [routineIdNum, t]);

  useFocusEffect(
    useCallback(() => {
      if (isNaN(routineIdNum)) {
        Alert.alert(t('general.error'), t('routines.invalidId'));
        return;
      }
      fetchRoutineDetails();
    }, [routineIdNum, fetchRoutineDetails, t])
  );

  const handleAddExercise = () => {
    router.navigate(`/profile/routine/${routine_id}/add-exercise`);
  };

  const handleAddSet = async (routineExerciseId: number) => {
    const newSet: NewRoutineSet = {
      routine_exercise_id: routineExerciseId,
      set_type: 'normal',
      rest: null,
      weight: null,
      reps: null,
      note: null,
    };
    try {
      const newSetId = await RoutineService.addSet(newSet);
      if (newSetId) {
        fetchRoutineDetails();
      } else {
        Alert.alert(t('general.error'), t('routines.addSetFailed'));
      }
    } catch (error) {
      console.error("Error adding set:", error);
      Alert.alert(t('general.error'), t('routines.addSetError'));
    }
  };

  const updateSetInDb = async (updatedSet: RoutineSetRow) => {
    try {
      await RoutineService.updateSet(updatedSet);
    } catch (error) {
      console.error("Error updating set:", error);
      Alert.alert(t('general.error'), t('routines.updateSetFailed'));
    }
  };

  const debouncedUpdateSetInDb = useRef(debounce(updateSetInDb, 500)).current;

  const handleSetChange = (setId: number, field: keyof RoutineSetRow, value: string | number | null) => {
    setRoutineExercises((prev) =>
      prev.map((re) => ({
        ...re,
        sets: re.sets.map((set) => {
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

  const handleRemoveSet = async (setId: number) => {
    try {
      await RoutineService.deleteSet(setId);
      fetchRoutineDetails();
      setSelectedSet(null); // Close the dialog
    } catch (error) {
      console.error("Error removing set:", error);
      Alert.alert(t('general.error'), t('routines.removeSetFailed'));
    }
  };

  const handleSetTypeChange = (newType: SetType) => {
    if (!selectedSet) return;

    const updatedSet = { ...selectedSet, set_type: newType };

    setRoutineExercises((prev) =>
      prev.map((re) => ({
        ...re,
        sets: re.sets.map((set) => (set.id === selectedSet.id ? updatedSet : set)),
      }))
    );

    updateSetInDb(updatedSet);
    setSelectedSet(null); // Close the dialog
  };

  const handleOpenSetOptions = (set: RoutineSetRow) => {
    setSelectedSet(set);
  };

  const handleDeleteExercise = async (routineExerciseId: number) => {
    Alert.alert(
      t('superset.deleteExercise'),
      t('superset.confirmDeleteExercise'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await RoutineService.removeExercise(routineExerciseId);
              fetchRoutineDetails();
            } catch (error) {
              console.error('Error deleting exercise:', error);
              Alert.alert(t('general.error'), 'Failed to delete exercise');
            }
          }
        }
      ]
    );
  };

  const renderExerciseBlock = (item: FullRoutineExercise) => {
    let normalSetCounter = 0;

    return (
      <View className={workout.exerciseBlockContainer}>
        <View className="flex-row justify-between items-center mb-2">
          <Text className={workout.exerciseName}>
            {item.exerciseDetails?.name || t('general.unknownExercise')}
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              className="bg-red-500 p-2 rounded"
              onPress={() => handleDeleteExercise(item.id)}
            >
              <Feather name="trash-2" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className={workout.tableHeaderContainer}>
          <Text className={workout.tableHeaderText}>{t('workout.set')}</Text>
          <Text className={workout.tableHeaderText}>{t('workout.reps')}</Text>
          <Text className={workout.tableHeaderText}>{t('workout.weight')}</Text>
          <Text className={workout.tableHeaderText}>{t('workout.actions')}</Text> 
        </View>

        {item.sets.map((setItem) => {
          let setLabel = '';
          if (setItem.set_type === 'normal') {
            normalSetCounter++;
            setLabel = `${normalSetCounter}`;
          } else {
            setLabel = setItem.set_type.charAt(0).toUpperCase(); // W for Warm-up, D for Dropset
          }

          return (
            <View key={setItem.id} className={workout.setRowContainer}>
              <TouchableOpacity
                className={workout.setTypeButton}
                onPress={() => handleOpenSetOptions(setItem)}
              >
                <Text className={workout.setTypeText}>{setLabel}</Text>
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
                className={workout.setCheckButton} // Re-using for options
                onPress={() => handleOpenSetOptions(setItem)}
              >
                <Feather name="more-vertical" size={24} color="gray" />
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity
          onPress={() => handleAddSet(item.id)}
          className={form.button}
        >
          <Text className={form.buttonText}>{t('workout.addSet')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGroupedExercises = ({ item }: { item: {exercises: FullRoutineExercise[]} }) => {
    return (
      <View className="mb-4">
        {renderExerciseBlock(item.exercises[0])}
      </View>
    );
  };

  return (
    <View className={layout.container}>
        <Text className={layout.title}>{routine?.name}</Text>
      <TouchableOpacity
        onPress={handleAddExercise}
        className={workout.addExerciseButton}
      >
        <Text className={form.buttonText}>{t('routines.addExercise')}</Text>
      </TouchableOpacity>

      <FlatList
        data={groupedExercises}
        keyExtractor={(item) => `exercise-${item.exercises[0].id}`}
        renderItem={renderGroupedExercises}
        ListEmptyComponent={
          <Text className={workout.noExercisesText}>
            {t('routines.noExercises')}
          </Text>
        }
      />

      {selectedSet && (
        <BottomSheetDialog
          isVisible={selectedSet !== null}
          onClose={() => setSelectedSet(null)}
        >
          <SetOptionsContent
            onClose={() => setSelectedSet(null)}
            onSetTypeChange={handleSetTypeChange}
            onDelete={() => handleRemoveSet(selectedSet.id)}
            currentType={selectedSet.set_type}
          />
        </BottomSheetDialog>
      )}
    </View>
  );
}
