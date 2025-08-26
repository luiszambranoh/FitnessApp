import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ExerciseService } from '../../../database/database';
import { ExerciseRow, SetRow } from '../../../database/types/dbTypes';
import { layout, text, table } from '../../../styles/theme';

const screenWidth = Dimensions.get("window").width;

export default function ExerciseDetailsScreen() {
  const { exercise_id } = useLocalSearchParams();
  const { t } = useTranslation();
  const [exercise, setExercise] = useState<ExerciseRow | null>(null);
  const [pr, setPr] = useState<number | null>(null);
  const [avgStats, setAvgStats] = useState<{ averageSets: number, averageWeight: number } | null>(null);
  const [bestSets, setBestSets] = useState<SetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!exercise_id) return;

      try {
        const id = Number(exercise_id);
        const fetchedExercise = await ExerciseService.getById(id);
        setExercise(fetchedExercise);

        const fetchedPr = await ExerciseService.getExercisePR(id);
        setPr(fetchedPr);

        const fetchedAvgStats = await ExerciseService.getExerciseAverageSetsAndWeight(id);
        setAvgStats(fetchedAvgStats);

        const fetchedBestSets = await ExerciseService.getBestSets(id);
        setBestSets(fetchedBestSets);

      } catch (error) {
        console.error("Error fetching exercise details:", error);
        Alert.alert(t('general.error'), t('exerciseDetails.loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [exercise_id, t]);

  if (loading) {
    return (
      <View className={layout.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View className={layout.container}>
        <Text>{t('exerciseDetails.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className={layout.container}>
      <Stack.Screen options={{ title: exercise.name }} />
      <Text className={layout.title}>{exercise.name} (ID: {exercise.id})</Text>

      <View className={layout.sectionContainer}>
        <Text className={text.sectionTitle}>{t('exerciseDetails.allTimePR')}: {pr ?? t('general.noData')}</Text>
        <Text className={text.sectionTitle}>{t('exerciseDetails.averageSets')}: {avgStats?.averageSets.toFixed(2) ?? t('general.noData')}</Text>
        <Text className={text.sectionTitle}>{t('exerciseDetails.averageWeight')}: {avgStats?.averageWeight.toFixed(2) ?? t('general.noData')}</Text>
      </View>

      <View className={layout.sectionContainer}>
        <Text className={text.sectionTitle}>{t('exerciseDetails.bestSets')}</Text>
        {bestSets.length > 0 ? (
          <View className="mt-2">
            <View className={table.headerContainer}>
              <Text className={`${table.headerText} flex-1`}>Reps</Text>
              <Text className={`${table.headerText} flex-1`}>Weight (kg)</Text>
              <Text className={`${table.headerText} flex-1`}>{t('common.date')}</Text>
            </View>
            {bestSets.map((set, index) => (
              <View key={index} className={table.rowContainer}>
                <Text className={`${table.rowText} flex-1`}>{set.reps}</Text>
                <Text className={`${table.rowText} flex-1`}>{set.weight}</Text>
                <Text className={`${table.rowText} flex-1`}>{set.date}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text>{t('exerciseDetails.noBestSets')}</Text>
        )}
      </View>
    </ScrollView>
  );
}