import React, { useState, useRef, useCallback } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput, useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import { layout, form, workout } from "../../styles/theme";
import { Feather } from "@expo/vector-icons";
import {
  SessionExerciseService,
  ExerciseService,
  SetService,
  SupersetService,
} from "../../database/database";
import {
  SessionExerciseRow,
  ExerciseRow,
  SetRow,
  NewSet,
  SetType,
  SupersetRow,
} from "../../database/types/dbTypes";
import SetOptionsContent from "../../components/SetOptionsContent";
import BottomSheetDialog from "../../components/BottomSheetDialog";
import SupersetDialog from "../../components/SupersetDialog";
import { getSupersetStyles } from "../../utils/supersetColors";

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
  supersetDetails?: SupersetRow | null;
}

export default function WorkoutID() {
  const { workout_id } = useLocalSearchParams();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [sessionExercises, setSessionExercises] = useState<FullSessionExercise[]>([]);
  const [selectedSet, setSelectedSet] = useState<SetRow | null>(null);
  const [selectedExerciseForSuperset, setSelectedExerciseForSuperset] = useState<FullSessionExercise | null>(null);
  const [groupedExercises, setGroupedExercises] = useState<{superset?: SupersetRow; exercises: FullSessionExercise[]}[]>([]);
  const [collapsedSupersets, setCollapsedSupersets] = useState<Set<number>>(new Set());
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const workoutIdNum = Number(workout_id);

  const fetchWorkoutDetails = useCallback(async () => {
    if (isNaN(workoutIdNum)) return;
    try {
      const fetchedSessionExercises = await SessionExerciseService.getBySessionId(workoutIdNum);
      const fullSessionExercises: FullSessionExercise[] = await Promise.all(
        fetchedSessionExercises.map(async (se) => {
          const exerciseDetails = await ExerciseService.getById(se.exercise_id);
          const sets = await SetService.getBySessionExerciseId(se.id);
          const supersetDetails = se.superset_id ? await SupersetService.getById(se.superset_id) : null;
          return { ...se, exerciseDetails, sets, supersetDetails };
        })
      );
      setSessionExercises(fullSessionExercises);
      
      // Group exercises by superset
      const grouped = groupExercisesBySuperset(fullSessionExercises);
      setGroupedExercises(grouped);
      
      // Clear input values when data is refreshed from server
      setInputValues({});
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

  const getInputKey = (setId: number, field: string) => `${setId}_${field}`;

  const handleSetChange = (setId: number, field: keyof SetRow, value: string) => {
    const inputKey = getInputKey(setId, field);
    
    // Update local input state immediately for UI responsiveness
    setInputValues(prev => ({
      ...prev,
      [inputKey]: value
    }));
    
    // Update the database value separately
    const numericValue = value === '' ? null : Number(value) || null;
    
    setSessionExercises((prev) =>
      prev.map((se) => ({
        ...se,
        sets: se.sets.map((set) => {
          if (set.id === setId) {
            return { ...set, [field]: numericValue };
          }
          return set;
        }),
      }))
    );
    
    // Debounced database update
    debouncedUpdateSetInDb({
      id: setId,
      [field]: numericValue
    } as any);
  };

  const getInputValue = (setId: number, field: keyof SetRow, dbValue: number | null) => {
    const inputKey = getInputKey(setId, field);
    // Use local input value if it exists, otherwise use database value
    if (inputValues.hasOwnProperty(inputKey)) {
      return inputValues[inputKey];
    }
    return dbValue?.toString() || '';
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
      setSelectedSet(null); // Close the dialog
    } catch (error) {
      console.error("Error removing set:", error);
      Alert.alert(t('general.error'), t('workoutDetails.failedToRemoveSet'));
    }
  };

  const handleSetTypeChange = (newType: SetType) => {
    if (!selectedSet) return;

    const updatedSet = { ...selectedSet, set_type: newType };

    setSessionExercises((prev) =>
      prev.map((se) => ({
        ...se,
        sets: se.sets.map((set) => (set.id === selectedSet.id ? updatedSet : set)),
      }))
    );

    updateSetInDb(updatedSet);
    fetchWorkoutDetails();
    setSelectedSet(null); // Close the dialog
  };

  const handleOpenSetOptions = (set: SetRow) => {
    setSelectedSet(set);
  };

  const groupExercisesBySuperset = (exercises: FullSessionExercise[]) => {
    const grouped: {superset?: SupersetRow; exercises: FullSessionExercise[]}[] = [];
    const supersetMap = new Map<number, FullSessionExercise[]>();
    const noSupersetExercises: FullSessionExercise[] = [];

    exercises.forEach(exercise => {
      if (exercise.superset_id && exercise.supersetDetails) {
        if (!supersetMap.has(exercise.superset_id)) {
          supersetMap.set(exercise.superset_id, []);
        }
        supersetMap.get(exercise.superset_id)!.push(exercise);
      } else {
        noSupersetExercises.push(exercise);
      }
    });

    // Add superset groups (sorted by superset number)
    const sortedSupersets = Array.from(supersetMap.entries()).sort(
      (a, b) => (a[1][0]?.supersetDetails?.number || 0) - (b[1][0]?.supersetDetails?.number || 0)
    );

    sortedSupersets.forEach(([supersetId, exercises]) => {
      grouped.push({
        superset: exercises[0].supersetDetails!,
        exercises: exercises.sort((a, b) => a.id - b.id) // Sort exercises within superset by creation order
      });
    });

    // Add non-superset exercises
    noSupersetExercises.forEach(exercise => {
      grouped.push({ exercises: [exercise] });
    });

    return grouped;
  };

  const handleDeleteExercise = async (sessionExerciseId: number) => {
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
              await SessionExerciseService.delete(sessionExerciseId);
              fetchWorkoutDetails();
            } catch (error) {
              console.error('Error deleting exercise:', error);
              Alert.alert(t('general.error'), 'Failed to delete exercise');
            }
          }
        }
      ]
    );
  };

  const handleOpenSupersetDialog = (exercise: FullSessionExercise) => {
    setSelectedExerciseForSuperset(exercise);
  };

  const handleSupersetAssigned = async (supersetId: number | null) => {
    if (!selectedExerciseForSuperset) return;

    try {
      const updatedExercise = { ...selectedExerciseForSuperset, superset_id: supersetId };
      await SessionExerciseService.update(updatedExercise);
      setSelectedExerciseForSuperset(null);
      fetchWorkoutDetails();
    } catch (error) {
      console.error('Error updating superset:', error);
      Alert.alert(t('general.error'), 'Failed to update superset');
    }
  };

  const toggleSupersetCollapse = (supersetId: number) => {
    setCollapsedSupersets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(supersetId)) {
        newSet.delete(supersetId);
      } else {
        newSet.add(supersetId);
      }
      return newSet;
    });
  };

  const renderExerciseBlock = (item: FullSessionExercise, isInSuperset = false, supersetId?: number) => {
    let normalSetCounter = 0;
    const supersetStyles = supersetId ? getSupersetStyles(supersetId, isDark) : null;

    return (
      <View 
        className={`${workout.exerciseBlockContainer} ${isInSuperset ? 'ml-4' : ''}`}
        style={isInSuperset && supersetStyles ? supersetStyles.leftBorder : undefined}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className={workout.exerciseName}>
            {item.exerciseDetails?.name || t('general.unknownExercise')}
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              className="bg-blue-500 p-2 rounded mr-2"
              onPress={() => handleOpenSupersetDialog(item)}
            >
              <Feather name="link" size={16} color="white" />
            </TouchableOpacity>
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
          <Text className={workout.tableHeaderText}>{t('workout.completed')}</Text>
        </View>

        {item.sets.map((setItem) => {
          let setLabel = '';
          if (setItem.set_type === 'normal') {
            normalSetCounter++;
            setLabel = `${normalSetCounter}`;
          } else if (setItem.set_type) {
            setLabel = setItem.set_type.charAt(0).toUpperCase(); // W for Warm-up, D for Dropset
          } else {
            setLabel = '?'; // Fallback for null/undefined set_type
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
                value={getInputValue(setItem.id, 'reps', setItem.reps)}
                onChangeText={(text) => handleSetChange(setItem.id, 'reps', text)}
              />

              <TextInput
                className={workout.setInput}
                keyboardType="numeric"
                value={getInputValue(setItem.id, 'weight', setItem.weight)}
                onChangeText={(text) => handleSetChange(setItem.id, 'weight', text)}
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

  const renderGroupedExercises = ({ item }: { item: {superset?: SupersetRow; exercises: FullSessionExercise[]} }) => {
    if (item.superset) {
      const isCollapsed = collapsedSupersets.has(item.superset.id);
      const supersetStyles = getSupersetStyles(item.superset.id, isDark);
      
      return (
        <View className="mb-4">
          <TouchableOpacity 
            className="p-3 rounded-t-lg flex-row justify-between items-center"
            style={supersetStyles.headerContainer}
            onPress={() => toggleSupersetCollapse(item.superset!.id)}
          >
            <Text 
              className="font-bold text-lg flex-1"
              style={supersetStyles.headerText}
            >
              {t('superset.supersetNumber', { number: item.superset.number })}: {item.superset.note}
            </Text>
            <View className="flex-row items-center">
              <Text 
                className="text-sm mr-2"
                style={[supersetStyles.headerText, { opacity: 0.8 }]}
              >
                {item.exercises.length} {item.exercises.length === 1 ? 'exercise' : 'exercises'}
              </Text>
              <Feather 
                name={isCollapsed ? "chevron-down" : "chevron-up"} 
                size={20} 
                color={supersetStyles.headerText.color} 
              />
            </View>
          </TouchableOpacity>
          
          {!isCollapsed && (
            <View 
              className="p-2 rounded-b-lg"
              style={supersetStyles.contentContainer}
            >
              {item.exercises.map((exercise, index) => (
                <View key={exercise.id}>
                  {renderExerciseBlock(exercise, true, item.superset!.id)}
                  {index < item.exercises.length - 1 && <View className="h-2" />}
                </View>
              ))}
            </View>
          )}
          
          {/* Rounded bottom when collapsed */}
          {isCollapsed && (
            <View 
              className="h-1 rounded-b-lg" 
              style={{ backgroundColor: supersetStyles.headerContainer.backgroundColor }}
            />
          )}
        </View>
      );
    } else {
      return (
        <View className="mb-4">
          {renderExerciseBlock(item.exercises[0])}
        </View>
      );
    }
  };

  return (
    <View className={layout.container}>
      <TouchableOpacity
        onPress={handleAddExercise}
        className={workout.addExerciseButton}
      >
        <Text className={form.buttonText}>{t('workout.addExercise')}</Text>
      </TouchableOpacity>

      <FlatList
        data={groupedExercises}
        keyExtractor={(item) => item.superset ? `superset-${item.superset.id}` : `exercise-${item.exercises[0].id}`}
        renderItem={renderGroupedExercises}
        ListEmptyComponent={
          <Text className={workout.noExercisesText}>
            {t('workout.noExercisesAdded')}
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
      
      {selectedExerciseForSuperset && (
        <SupersetDialog
          isVisible={selectedExerciseForSuperset !== null}
          onClose={() => setSelectedExerciseForSuperset(null)}
          workoutId={workoutIdNum}
          sessionExerciseId={selectedExerciseForSuperset.id}
          currentSupersetId={selectedExerciseForSuperset.superset_id}
          onSupersetAssigned={handleSupersetAssigned}
        />
      )}
    </View>
  );
}
