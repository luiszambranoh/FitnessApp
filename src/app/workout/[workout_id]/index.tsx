import React, { useState, useRef, useCallback, useMemo, useEffect } from "react"; // Added useMemo, useEffect
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput, useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import { layout, form, workout } from "../../../styles/theme";
import { Feather } from "@expo/vector-icons";
import {
  SessionExerciseService,
  ExerciseService,
  SetService,
  SupersetService,
} from "../../../database/database";
import {
  SessionExerciseRow,
  ExerciseRow,
  SetRow,
  NewSet,
  SetType,
  SupersetRow,
} from "../../../database/types/dbTypes";
import SetOptionsContent from "../dialog/SetOptionsContent";
import BottomSheetDialog from "../../../components/BottomSheetDialog";
import SupersetDialog from "../dialog/SupersetDialog";
import { getSupersetStyles } from "../../../utils/supersetColors";
import { useCrud, CrudService } from "../../../hooks/useCrud"; // Import useCrud and CrudService

// Debounce utility function
const debounce = (func: Function, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;
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
  // const [sessionExercises, setSessionExercises] = useState<FullSessionExercise[]>([]); // To be replaced by useCrud
  const [selectedSet, setSelectedSet] = useState<SetRow | null>(null);
  const [selectedExerciseForSuperset, setSelectedExerciseForSuperset] = useState<FullSessionExercise | null>(null);
  const [groupedExercises, setGroupedExercises] = useState<{superset?: SupersetRow; exercises: FullSessionExercise[]}[]>([]);
  const [collapsedSupersets, setCollapsedSupersets] = useState<Set<number>>(new Set());
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const workoutIdNum = Number(workout_id);

  // Define the custom service for FullSessionExercise
  const sessionExerciseCrudService = useMemo(() => {
    return {
      getAll: async () => {
        if (isNaN(workoutIdNum)) return [];
        const fetchedSessionExercises = await SessionExerciseService.getBySessionId(workoutIdNum);
        const fullSessionExercises: FullSessionExercise[] = await Promise.all(
          fetchedSessionExercises.map(async (se) => {
            const exerciseDetails = await ExerciseService.getById(se.exercise_id);
            const sets = await SetService.getBySessionExerciseId(se.id);
            const supersetDetails = se.superset_id ? await SupersetService.getById(se.superset_id) : null;
            return { ...se, exerciseDetails, sets, supersetDetails };
          })
        );
        return fullSessionExercises;
      },
      getById: async (id: number) => {
        const se = await SessionExerciseService.getById(id);
        if (!se) return null;
        const exerciseDetails = await ExerciseService.getById(se.exercise_id);
        const sets = await SetService.getBySessionExerciseId(se.id);
        const supersetDetails = se.superset_id ? await SupersetService.getById(se.superset_id) : null;
        return { ...se, exerciseDetails, sets, supersetDetails };
      },
      add: async (data: SessionExerciseRow) => {
        return SessionExerciseService.add(data);
      },
      update: async (item: FullSessionExercise) => {
        const { exerciseDetails, sets, supersetDetails, ...sessionExerciseRow } = item;
        return SessionExerciseService.update(sessionExerciseRow);
      },
      delete: async (id: number) => {
        return SessionExerciseService.delete(id);
      },
    } as CrudService<FullSessionExercise, SessionExerciseRow>;
  }, [workoutIdNum]);

  // Define the service for SetRow
  const setCrudService = useMemo(() => {
    return {
      getAll: async () => { /* Not used directly here */ return []; },
      getById: async (id: number) => SetService.getById(id),
      add: async (data: NewSet) => SetService.add(data),
      update: async (item: SetRow) => SetService.update(item),
      delete: async (id: number) => SetService.delete(id),
    } as CrudService<SetRow, NewSet>;
  }, []);

  const {
    data: sessionExercises,
    isLoading: isLoadingSessionExercises,
    error: sessionExercisesError,
    refetch: refetchSessionExercises,
    addItem: addSessionExercise, // Not directly used here, but good to have
    updateItem: updateSessionExercise,
    deleteItem: deleteSessionExercise,
  } = useCrud(sessionExerciseCrudService);

  const {
    data: sets, // This will not be used directly as sets are nested within sessionExercises
    isLoading: isLoadingSets,
    error: setsError,
    refetch: refetchSets, // This will be called after set operations
    addItem: addSetCrud,
    updateItem: updateSetCrud,
    deleteItem: deleteSetCrud,
  } = useCrud(setCrudService);

  // Use useFocusEffect to refetch session exercises when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isNaN(workoutIdNum)) {
        Alert.alert(t('general.error'), t('workoutDetails.invalidWorkoutId'));
        return;
      }
      refetchSessionExercises();
      setInputValues({}); // Clear input values on refetch
    }, [workoutIdNum, refetchSessionExercises, t])
  );

  // Update grouped exercises whenever sessionExercises changes
  useEffect(() => {
    setGroupedExercises(groupExercisesBySuperset(sessionExercises));
  }, [sessionExercises]);

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
      date: undefined
    };
    try {
      const newSetId = await addSetCrud(newSet); // Use useCrud's addItem
      if (newSetId) {
        refetchSessionExercises(); // Refetch all session exercises to get updated sets
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
      await updateSetCrud(updatedSet); // Use useCrud's updateItem
      // No need to refetch here, as handleSetChange will update local state
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

    // Update the sessionExercises state directly for immediate UI update
    const numericValue = value === '' ? null : Number(value) || null;
    const updatedSessionExercises = sessionExercises.map((se) => ({
      ...se,
      sets: se.sets.map((set) => {
        if (set.id === setId) {
          return { ...set, [field]: numericValue };
        }
        return set;
      }),
    }));

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

  const handleCompleteSet = async (setId: number) => {
    try {
      const currentSessionExercise = sessionExercises.find(se => se.sets.some(s => s.id === setId));
      const currentSet = currentSessionExercise?.sets.find(s => s.id === setId);

      if (!currentSet) return;

      const newCompletedStatus = currentSet.completed === 1 ? 0 : 1;
      const updatedSet = { ...currentSet, completed: newCompletedStatus };

      await updateSetCrud(updatedSet); // Use useCrud's updateItem
      refetchSessionExercises(); // Refetch to update the main state
    } catch (error) {
      console.error("Error updating set:", error);
      Alert.alert(t('general.error'), t('workoutDetails.failedToUpdateSet'));
    }
  };

  const handleRemoveSet = async (setId: number) => {
    try {
      await deleteSetCrud(setId); // Use useCrud's deleteItem
      refetchSessionExercises(); // Refetch to update the main state
      setSelectedSet(null); // Close the dialog
    } catch (error) {
      console.error("Error removing set:", error);
      Alert.alert(t('general.error'), t('workoutDetails.failedToRemoveSet'));
    }
  };

  const handleSetTypeChange = async (newType: SetType) => {
    if (!selectedSet) return;

    const updatedSet = { ...selectedSet, set_type: newType };

    try {
      await updateSetCrud(updatedSet); // Use useCrud's updateItem
      refetchSessionExercises(); // Refetch to update the main state
      setSelectedSet(null); // Close the dialog
    } catch (error) {
      console.error("Error updating set type:", error);
      Alert.alert(t('general.error'), t('workoutDetails.failedToUpdateSet'));
    }
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

    const sortedSupersets = Array.from(supersetMap.entries()).sort(
      (a, b) => (a[1][0]?.supersetDetails?.number || 0) - (b[1][0]?.supersetDetails?.number || 0)
    );

    sortedSupersets.forEach(([supersetId, exercises]) => {
      grouped.push({
        superset: exercises[0].supersetDetails!,
        exercises: exercises.sort((a, b) => a.id - b.id)
      });
    });

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
              await deleteSessionExercise(sessionExerciseId); // Use useCrud's deleteItem
              refetchSessionExercises(); // Refetch to update the main state
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
      await updateSessionExercise(updatedExercise); // Use useCrud's updateItem
      setSelectedExerciseForSuperset(null);
      refetchSessionExercises(); // Refetch to update the main state
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
        <View className="flex-row items-center mb-2">
          <View className="flex-1 pr-2">
            <Text className={workout.exerciseName}>
              {item.exerciseDetails?.name || t('general.unknownExercise')}
            </Text>
          </View>
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
