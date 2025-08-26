import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { useColorScheme } from 'nativewind';
import { colors } from '../styles/theme';

interface InputProps extends TextInputProps {
  // Add any custom props here if needed
}

const Input: React.FC<InputProps> = ({ style, ...props }) => {
  const { colorScheme } = useColorScheme();
  const placeholderColor = colorScheme === 'dark' ? colors.placeholder.dark : colors.placeholder.light;

  return (
    <TextInput
      style={style}
      placeholderTextColor={placeholderColor}
      {...props}
    />
  );
};

export default Input;
