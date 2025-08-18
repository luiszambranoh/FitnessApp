import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { layout, form } from '../../styles/theme';
import { ExerciseService } from '../../database/database';
import { ExerciseRow } from '../../database/types/dbTypes';
import ExerciseCard from '../../components/ExerciseCard';

export default function ExercisesScreen() {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const fetchedExercises = await ExerciseService.getAll();
        setExercises(fetchedExercises);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        Alert.alert(t('general.error'), "Failed to load exercises.");
      }
    };
    fetchExercises();
  }, []);

  const renderExerciseItem = ({ item }: { item: ExerciseRow }) => (
    <ExerciseCard
    exercise={item}
    isSelected={false}
    onSelect={() => {}}
    />
  );

  return (
    <View className={layout.container}>
      <View className="mb-4">
        <Link href="/profile/create-exercise" asChild>
          <TouchableOpacity className={form.button}>
            <Text className={form.buttonText}>{t('exercises.createButton')}</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <Text className={layout.title}>{t('exercises.title')}</Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExerciseItem}
        ListEmptyComponent={<Text className="text-gray-500 text-center mt-10">{t('exercises.noExercises')}</Text>}
      />
    </View>
  );
}