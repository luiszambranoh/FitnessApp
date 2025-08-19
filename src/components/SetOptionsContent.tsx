import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SetType } from '../database/types/dbTypes';
import { form } from '../styles/theme';

interface SetOptionsContentProps {
  onClose: () => void;
  onSetTypeChange: (newType: SetType) => void;
  onDelete: () => void;
  currentType: SetType;
}

const SetOptionsContent: React.FC<SetOptionsContentProps> = ({
  onClose,
  onSetTypeChange,
  onDelete,
  currentType,
}) => {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-t-xl p-4 w-full">
      <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Set Options</Text>

      <TouchableOpacity
        className={`${form.button} mb-2 ${currentType === 'normal' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
        onPress={() => onSetTypeChange('normal')}
      >
        <Text className={form.buttonText}>Normal Set</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`${form.button} mb-2 ${currentType === 'warm-up' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
        onPress={() => onSetTypeChange('warm-up')}
      >
        <Text className={form.buttonText}>Warm-up Set</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`${form.button} mb-4 ${currentType === 'dropset' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
        onPress={() => onSetTypeChange('dropset')}
      >
        <Text className={form.buttonText}>Dropset</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`${form.button} bg-red-500 mb-4`}
        onPress={() => {
          onDelete();
          onClose();
        }}
      >
        <Text className={form.buttonText}>Delete Set</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`${form.button} bg-gray-400 dark:bg-gray-600`}
        onPress={onClose}
      >
        <Text className={form.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SetOptionsContent;
