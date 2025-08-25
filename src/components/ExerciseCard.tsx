import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ExerciseRow } from '../database/types/dbTypes';
import { layout, form, list } from '../styles/theme';

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
    <Pressable onPress={() => onSelect(exercise.id)} className="mb-2">
      <View className="flex-row items-center">
        <Animated.View
          className="h-full bg-blue-500 absolute left-0 rounded-full"
        />
        <Animated.View
          className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full"
        >
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 flex-1">
            {exercise.name}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
};

export default ExerciseCard;