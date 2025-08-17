import React from 'react';
import { View, Text } from 'react-native';
import { containerClassName, titleClassName } from '../../styles/theme';

export default function RoutinesScreen() {
  return (
    <View className={`${containerClassName} justify-center items-center`}>
      <Text className={titleClassName}>Developing</Text>
    </View>
  );
}
