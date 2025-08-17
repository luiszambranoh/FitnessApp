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
  const translateX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: indicatorWidth.value,
    };
  });

  React.useEffect(() => {
    if (isSelected) {
      translateX.value = withTiming(20, { duration: 200 }); // Move card right
      indicatorWidth.value = withTiming(20, { duration: 200 }); // Show indicator
    } else {
      translateX.value = withTiming(0, { duration: 200 }); // Move card back
      indicatorWidth.value = withTiming(0, { duration: 200 }); // Hide indicator
    }
  }, [isSelected]);

  return (
    <Pressable onPress={() => onSelect(exercise.id)} className="mb-2">
      <View className="flex-row items-center">
        <Animated.View
          className="h-full bg-blue-500 absolute left-0 rounded-full"
          style={indicatorAnimatedStyle}
        />
        <Animated.View
          className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full"
          style={cardAnimatedStyle}
        >
          <Image
            source={{ uri: 'https://via.placeholder.com/50' }} // Placeholder image
            className="w-12 h-12 rounded-full mr-4"
          />
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 flex-1">
            {exercise.name}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
};

export default ExerciseCard;
