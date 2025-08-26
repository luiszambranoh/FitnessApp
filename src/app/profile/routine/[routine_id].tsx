import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput, useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import { layout, form, workout } from "../../../styles/theme";
import { Feather } from "@expo/vector-icons";
import {
  RoutineService,
  ExerciseService,
  SupersetService,
} from "../../../database/database";
import {
  RoutineExerciseRow,
  ExerciseRow,
  RoutineSetRow,
  NewRoutineSet,
  SetType,
  RoutineRow,
  SupersetRow,
  NewRoutineExercise,
} from "../../../database/types/dbTypes";
import SetOptionsContent from "../../workout/dialog/SetOptionsContent";
import BottomSheetDialog from "../../../components/BottomSheetDialog";
import SupersetDialog from "../../workout/dialog/SupersetDialog";
import { getSupersetStyles } from "../../../utils/supersetColors";
import { useCrud } from "../../../hooks/useCrud";

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
  supersetDetails?: SupersetRow | null;
}

export default function RoutineIdScreen() {
  const { routine_id } = useLocalSearchParams();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [routine, setRoutine] = useState<RoutineRow | null>(null);
  const [fullRoutineExercises, setFullRoutineExercises] = useState<FullRoutineExercise[]>([]);
  const [selectedSet, setSelectedSet] = useState<RoutineSetRow | null>(null);
  const [selectedExerciseForSuperset, setSelectedExerciseForSuperset] = useState<FullRoutineExercise | null>(null);
  const [groupedExercises, setGroupedExercises] = useState<{superset?: SupersetRow; exercises: FullRoutineExercise[]}[]>([]);
  const [collapsedSupersets, setCollapsedSupersets] = useState<Set<number>>(new Set());
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const routineIdNum = Number(routine_id);

  const routineExerciseService = useMemo(() => ({
    getAll: () => RoutineService.getExercisesByRoutineId(routineIdNum),
    getById: async (id: number) => {
      // This service is for a list, getting a single item might need more context
      // or a dedicated method in RoutineService. Returning null as a placeholder.
      const exercises = await RoutineService.getExercisesByRoutineId(routineIdNum);
      return exercises.find(e => e.id === id) || null;
    },
    add: async (data: NewRoutineExercise) => RoutineService.addRoutineExercise(data),
    update: (item: RoutineExerciseRow) => RoutineService.updateExercise(item),
    delete: (id: number) => RoutineService.removeExercise(id),
  }), [routineIdNum]);

  const { 
    data: routineExercises, 
    isLoading: isLoadingExercises, 
    error: exercisesError, 
    updateItem: updateRoutineExercise, 
    deleteItem: deleteRoutineExercise,
    refetch: refetchRoutineExercises
  } = useCrud(routineExerciseService);

  const fetchRoutineDetails = useCallback(async () => {
    if (isNaN(routineIdNum)) return;
    try {
      const fetchedRoutine = await RoutineService.getById(routineIdNum);
      setRoutine(fetchedRoutine);
    } catch (error) {
      console.error("Error fetching routine details:", error);
      Alert.alert(t('general.error'), t('routines.loadFailed'));
    }
  }, [routineIdNum, t]);

  useEffect(() => {
    const enrichData = async () => {
      if (!routineExercises) return;
      try {
        const enriched = await Promise.all(
          routineExercises.map(async (re) => {
            const exerciseDetails = await ExerciseService.getById(re.exercise_id);
            const sets = await RoutineService.getSetsByRoutineExerciseId(re.id);
            const supersetDetails = re.superset_id ? await SupersetService.getById(re.superset_id) : null;
            return { ...re, exerciseDetails, sets, supersetDetails };
          })
        );
        setFullRoutineExercises(enriched);
      } catch (error) {
        console.error("Error enriching routine exercises:", error);
        Alert.alert(t('general.error'), 'Failed to load exercise details.');
      }
    };
    enrichData();
  }, [routineExercises, t]);

  useEffect(() => {
    const grouped = groupExercisesBySuperset(fullRoutineExercises);
    setGroupedExercises(grouped);
  }, [fullRoutineExercises]);

  useFocusEffect(
    useCallback(() => {
      if (isNaN(routineIdNum)) {
        Alert.alert(t('general.error'), t('routines.invalidId'));
        return;
      }
      fetchRoutineDetails();
      refetchRoutineExercises();
    }, [routineIdNum, fetchRoutineDetails, refetchRoutineExercises, t])
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
        refetchRoutineExercises();
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
      refetchRoutineExercises();
    } catch (error) {
      console.error("Error updating set:", error);
      Alert.alert(t('routines.updateSetFailed'));
    }
  };

  const debouncedUpdateSetInDb = useRef(debounce(updateSetInDb, 500)).current;

  const handleSetChange = (setId: number, field: keyof RoutineSetRow, value: string | number | null) => {
    setFullRoutineExercises((prev) =>
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
      refetchRoutineExercises();
      setSelectedSet(null); // Close the dialog
    } catch (error) {
      console.error("Error removing set:", error);
      Alert.alert(t('general.error'), t('routines.removeSetFailed'));
    }
  };

  const handleSetTypeChange = (newType: SetType) => {
    if (!selectedSet) return;
    const updatedSet = { ...selectedSet, set_type: newType };
    updateSetInDb(updatedSet);
    setSelectedSet(null); // Close the dialog
  };

  const handleOpenSetOptions = (set: RoutineSetRow) => {
    setSelectedSet(set);
  };

  const groupExercisesBySuperset = (exercises: FullRoutineExercise[]) => {
    const grouped: {superset?: SupersetRow; exercises: FullRoutineExercise[]}[] = [];
    const supersetMap = new Map<number, FullRoutineExercise[]>();
    const noSupersetExercises: FullRoutineExercise[] = [];

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
              await deleteRoutineExercise(routineExerciseId);
            } catch (error) {
              console.error('Error deleting exercise:', error);
              Alert.alert(t('general.error'), 'Failed to delete exercise');
            }
          }
        }
      ]
    );
  };

  const handleOpenSupersetDialog = (exercise: FullRoutineExercise) => {
    setSelectedExerciseForSuperset(exercise);
  };

  const handleSupersetAssigned = async (supersetId: number | null) => {
    if (!selectedExerciseForSuperset) return;
    try {
      const { sets, exerciseDetails, supersetDetails, ...exerciseToUpdate } = selectedExerciseForSuperset;
      const updatedExercise = { ...exerciseToUpdate, superset_id: supersetId };
      await updateRoutineExercise(updatedExercise);
      setSelectedExerciseForSuperset(null);
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

  const getInputKey = (setId: number, field: string) => `${setId}_${field}`;

  const getInputValue = (setId: number, field: keyof RoutineSetRow, dbValue: number | null) => {
    const inputKey = getInputKey(setId, field);
    if (inputValues.hasOwnProperty(inputKey)) {
      return inputValues[inputKey];
    }
    return dbValue?.toString() || '';
  };

  const renderExerciseBlock = (item: FullRoutineExercise, isInSuperset = false, supersetId?: number) => {
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
          <Text className={workout.tableHeaderText}>{t('workout.actions')}</Text> 
        </View>

        {item.sets.map((setItem) => {
          let setLabel = '';
          if (setItem.set_type === 'normal') {
            normalSetCounter++;
            setLabel = `${normalSetCounter}`;
          } else {
            setLabel = setItem.set_type.charAt(0).toUpperCase();
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
                onChangeText={(text) => handleSetChange(setItem.id, 'reps', text ? Number(text) : null)}
              />

              <TextInput
                className={workout.setInput}
                keyboardType="numeric"
                value={getInputValue(setItem.id, 'weight', setItem.weight)}
                onChangeText={(text) => handleSetChange(setItem.id, 'weight', text ? Number(text) : null)}
              />

              <TouchableOpacity
                className={workout.setCheckButton}
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

  const renderGroupedExercises = ({ item }: { item: { superset?: SupersetRow; exercises: FullRoutineExercise[] } }) => {
    const isSuperset = !!item.superset;
    const supersetId = item.superset?.id;
    const isCollapsed = supersetId ? collapsedSupersets.has(supersetId) : false;
    const supersetStyles = supersetId ? getSupersetStyles(supersetId, isDark) : null;

    if (isSuperset && !item.superset) return null;

    return (
      <View className="mb-4">
        {isSuperset && item.superset && (
          <TouchableOpacity
            onPress={() => toggleSupersetCollapse(item.superset!.id)}
            className="p-3 rounded-t-lg flex-row justify-between items-center"
            style={supersetStyles?.headerContainer}
          >
            <Text className="font-bold text-lg flex-1" style={supersetStyles?.headerText}>
              {t('superset.supersetNumber', { number: item.superset.number })}: {item.superset.note}
            </Text>
            <Feather 
              name={isCollapsed ? "chevron-down" : "chevron-up"} 
              size={20} 
              color={supersetStyles?.headerText.color} 
            />
          </TouchableOpacity>
        )}

        {!isCollapsed && (
          <View className={isSuperset ? `p-2 rounded-b-lg ${supersetStyles?.contentContainer}` : ''}>
            {item.exercises.map((exercise, index) => (
              <View key={exercise.id} className={isSuperset && index > 0 ? 'mt-2' : ''}>
                {renderExerciseBlock(exercise, isSuperset, supersetId)}
              </View>
            ))}
          </View>
        )}
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

      {isLoadingExercises && <Text>Loading exercises...</Text>}
      {exercisesError && <Text>Error: {exercisesError}</Text>}

      <FlatList
        data={groupedExercises}
        keyExtractor={(item) => `group-${item.superset?.id || item.exercises[0].id}`}
        renderItem={renderGroupedExercises}
        ListEmptyComponent={
          !isLoadingExercises ? (
            <Text className={workout.noExercisesText}>
              {t('routines.noExercises')}
            </Text>
          ) : null
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
          routineId={routineIdNum}
          sessionExerciseId={selectedExerciseForSuperset.id}
          currentSupersetId={selectedExerciseForSuperset.superset_id}
          onSupersetAssigned={handleSupersetAssigned}
        />
      )}
    </View>
  );
}
