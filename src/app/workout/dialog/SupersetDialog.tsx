import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { form, layout } from '../../../styles/theme';
import { SupersetService } from '../../../database/database';
import { SupersetRow } from '../../../database/types/dbTypes';
import BottomSheetDialog from '../../../components/BottomSheetDialog';

interface SupersetDialogProps {
  isVisible: boolean;
  onClose: () => void;
  workoutId?: number;
  routineId?: number;
  sessionExerciseId: number;
  currentSupersetId?: number | null;
  onSupersetAssigned: (supersetId: number | null) => void;
}

export default function SupersetDialog({
  isVisible,
  onClose,
  workoutId,
  routineId,
  sessionExerciseId,
  currentSupersetId,
  onSupersetAssigned,
}: SupersetDialogProps) {
  const { t } = useTranslation();
  const [supersets, setSupersets] = useState<SupersetRow[]>([]);
  const [isCreatingSuperset, setIsCreatingSuperset] = useState(false);
  const [newSupersetName, setNewSupersetName] = useState('');

  const contextId = workoutId || routineId;
  const isWorkoutMode = !!workoutId;

  useEffect(() => {
    if (isVisible && contextId) {
      fetchSupersets();
    }
  }, [isVisible, contextId]);

  const fetchSupersets = async () => {
    if (!contextId) return;
    try {
      let fetchedSupersets: SupersetRow[] = [];
      if (isWorkoutMode) {
        fetchedSupersets = await SupersetService.getByWorkoutId(contextId);
      } else {
        // Assumes SupersetService.getByRoutineId exists
        fetchedSupersets = await (SupersetService as any).getByRoutineId(contextId);
      }
      setSupersets(fetchedSupersets);
    } catch (error) {
      console.error('Error fetching supersets:', error);
      Alert.alert(t('general.error'), t('superset.fetchError'));
    }
  };

  const handleCreateSuperset = async () => {
    if (!newSupersetName.trim() || !contextId) {
      Alert.alert(t('general.error'), t('superset.validation.nameRequired'));
      return;
    }

    try {
      let newSupersetId: number | null = null;
      if (isWorkoutMode) {
        newSupersetId = await SupersetService.createWithAutoNumber(contextId, newSupersetName.trim());
      } else {
        // Assumes SupersetService.createWithAutoNumberForRoutine exists
        newSupersetId = await (SupersetService as any).createWithAutoNumberForRoutine(contextId, newSupersetName.trim());
      }

      if (newSupersetId) {
        setNewSupersetName('');
        setIsCreatingSuperset(false);
        await fetchSupersets(); // Refresh the list
        onSupersetAssigned(newSupersetId);
        onClose();
      } else {
        Alert.alert(t('general.error'), t('superset.createError'));
      }
    } catch (error) {
      console.error('Error creating superset:', error);
      Alert.alert(t('general.error'), t('superset.createError'));
    }
  };

  const handleSelectSuperset = (supersetId: number) => {
    onSupersetAssigned(supersetId);
    onClose();
  };

  const handleRemoveFromSuperset = () => {
    onSupersetAssigned(null);
    onClose();
  };

  const renderSupersetItem = ({ item }: { item: SupersetRow }) => (
    <TouchableOpacity
      className={`${form.button} ${currentSupersetId === item.id ? 'bg-blue-600' : 'bg-gray-600'}`}
      onPress={() => handleSelectSuperset(item.id)}
    >
      <Text className={form.buttonText}>
        {t('superset.supersetNumber', { number: item.number })}: {item.note}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheetDialog isVisible={isVisible} onClose={onClose}>
      <View className="p-4">
        <Text className={layout.title}>{t('superset.manageTitle')}</Text>
        
        {currentSupersetId && (
          <View className="mb-4 p-3 bg-blue-100 rounded-lg">
            <Text className="text-blue-800 font-semibold">
              {t('superset.currentlyInSuperset')}
            </Text>
            <TouchableOpacity
              className="mt-2 bg-red-500 p-2 rounded"
              onPress={handleRemoveFromSuperset}
            >
              <Text className="text-white text-center">
                {t('superset.removeFromSuperset')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!isCreatingSuperset ? (
          <TouchableOpacity
            className={form.button}
            onPress={() => setIsCreatingSuperset(true)}
          >
            <Feather name="plus" size={20} color="white" />
            <Text className={form.buttonText}>{t('superset.createNewSuperset')}</Text>
          </TouchableOpacity>
        ) : (
          <View className="mb-4 p-3 bg-gray-100 rounded-lg">
            <TextInput
              className={form.textInput}
              placeholder={t('superset.supersetNamePlaceholder')}
              value={newSupersetName}
              onChangeText={setNewSupersetName}
              autoFocus
            />
            <View className="flex-row justify-between mt-2">
              <TouchableOpacity
                className="bg-gray-500 p-2 rounded flex-1 mr-2"
                onPress={() => {
                  setIsCreatingSuperset(false);
                  setNewSupersetName('');
                }}
              >
                <Text className="text-white text-center">{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-600 p-2 rounded flex-1 ml-2"
                onPress={handleCreateSuperset}
              >
                <Text className="text-white text-center">{t('superset.create')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {supersets.length > 0 && (
          <View className="mt-4">
            <Text className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
              {t('superset.existingSupersets')}
            </Text>
            <FlatList
              data={supersets}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderSupersetItem}
              style={{ maxHeight: 300 }}
            />
          </View>
        )}

        {supersets.length === 0 && !isCreatingSuperset && (
          <Text className="text-gray-500 text-center mt-4">
            {t('superset.noExistingSupersets')}
          </Text>
        )}
      </View>
    </BottomSheetDialog>
  );
}
