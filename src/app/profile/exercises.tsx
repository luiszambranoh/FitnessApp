import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { layout, form } from '../../styles/theme';
import { ExerciseService } from '../../database/database';
import { ExerciseRow } from '../../database/types/dbTypes';
import ExerciseCard from '../../components/ExerciseCard';
import { useCrud } from '../../hooks/useCrud';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function ExercisesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: exercises } = useCrud(ExerciseService);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectExercise = (exerciseId: number) => {
    router.push(`/profile/exercises/${exerciseId}`);
  };
  const renderExerciseItem = ({ item }: { item: ExerciseRow }) => (
    <ExerciseCard
      exercise={item}
      isSelected={false}
      onSelect={() => handleSelectExercise(item.id)}
    />
  );

  return (
    <View className={layout.container}>
      <View className="mb-4">
        <Link href="/profile/exercises/create-exercise" asChild>
          <TouchableOpacity className={form.button}>
            <Text className={form.buttonText}>{t('exercises.createButton')}</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <SearchableDropdown
        onSearch={setSearchQuery}
        placeholder={t('general.search')}
      />

      <Text className={layout.title}>{t('exercises.title')}</Text>

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExerciseItem}
        ListEmptyComponent={<Text className="text-gray-500 text-center mt-10">{t('exercises.noExercises')}</Text>}
      />
    </View>
  );
}