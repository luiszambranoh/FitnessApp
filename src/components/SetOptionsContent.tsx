import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SetType } from '../database/types/dbTypes';
import { form } from '../styles/theme';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <View className="bg-white dark:bg-gray-800 rounded-t-xl p-4 w-full">
      <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('setOptions.title')}</Text>

      <TouchableOpacity
        className={`${form.button} mb-2 ${currentType === 'normal' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
        onPress={() => onSetTypeChange('normal')}
      >
        <Text className={form.buttonText}>{t('setOptions.normalSet')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`${form.button} mb-2 ${currentType === 'warm-up' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
        onPress={() => onSetTypeChange('warm-up')}
      >
        <Text className={form.buttonText}>{t('setOptions.warmUpSet')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`${form.button} mb-4 ${currentType === 'dropset' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
        onPress={() => onSetTypeChange('dropset')}
      >
        <Text className={form.buttonText}>{t('setOptions.dropSet')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`${form.button} bg-red-500 mb-4`}
        onPress={() => {
          onDelete();
          onClose();
        }}
      >
        <Text className={form.buttonText}>{t('setOptions.deleteSet')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`${form.button} bg-gray-400 dark:bg-gray-600`}
        onPress={onClose}
      >
        <Text className={form.buttonText}>{t('setOptions.cancel')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SetOptionsContent;
