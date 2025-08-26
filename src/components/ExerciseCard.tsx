import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ExerciseRow } from '../database/types/dbTypes';
import { Checkbox } from 'expo-checkbox';
import { list } from '../styles/theme';

interface ExerciseCardProps {
  exercise: ExerciseRow;
  isSelected: boolean;
  onSelect: (exerciseId: number) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isSelected,
  onSelect,
}) => {
  return (
    <Pressable onPress={() => onSelect(exercise.id)} className={list.itemContainer}>
      <View className="flex-row justify-between items-center flex-1">
        <Text className={list.itemText}>{exercise.name}</Text>
        <Checkbox
          value={isSelected}
          onValueChange={() => onSelect(exercise.id)}
        />
      </View>
    </Pressable>
  );
};

export default ExerciseCard;
