import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Input from '../../components/Input';
import { useTranslation } from 'react-i18next';
import { BodyMeasurementService } from '../../database/database';
import { BodyMeasurementRow, NewBodyMeasurement } from '../../database/types/dbTypes';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { getCurrentDateTime } from '../../database/utils/datetime';

const initialFormState: NewBodyMeasurement = {
    date: getCurrentDateTime().date,
    weight: null,
    height: null,
    neck: null,
    shoulder: null,
    arm_left: null,
    arm_right: null,
    forearm_left: null,
    forearm_right: null,
    chest: null,
    waist: null,
    thigh_left: null,
    thigh_right: null,
    calf_left: null,
    calf_right: null,
};

// A helper component for form inputs to reduce repetition
const FormInput = ({ label, value, onChangeText, unit, keyboardType = 'numeric' }: any) => {

    return (
        <View className="mb-4">
            <Text className="text-base text-gray-600 dark:text-gray-300 mb-2">{label}</Text>
            <View className="flex-row items-center">
                <Input
                    className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                    placeholder={label}
                    keyboardType={keyboardType}
                    value={value ? value.toString() : ''}
                    onChangeText={onChangeText}
                />
                {unit && <Text className="ml-2 text-lg text-gray-500 dark:text-gray-400">{unit}</Text>}
            </View>
        </View>
    );
};

export default function BodyDataScreen() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const [measurements, setMeasurements] = useState<BodyMeasurementRow[]>([]);
  const [formState, setFormState] = useState<NewBodyMeasurement>(initialFormState);

  const fetchMeasurements = useCallback(async () => {
    try {
      const fetchedMeasurements = await BodyMeasurementService.getAll();
      setMeasurements(fetchedMeasurements);
    } catch (error) {
      console.error("Error fetching measurements:", error);
      Alert.alert(t('general.error'), t('bodyData.loadFail'));
    }
  }, [t]);

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  const handleInputChange = (field: keyof NewBodyMeasurement, value: string) => {
    setFormState(prevState => ({
      ...prevState,
      [field]: value ? parseFloat(value) : null,
    }));
  };

  const handleAddMeasurement = async () => {
    try {
      await BodyMeasurementService.add(formState);
      Alert.alert(t('general.success'), t('bodyData.addSuccess'));
      setFormState(initialFormState);
      fetchMeasurements();
    } catch (error) {
      console.error("Error adding measurement:", error);
      Alert.alert(t('general.error'), t('bodyData.addFail'));
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      t('bodyData.confirmDeleteTitle'),
      t('bodyData.confirmDeleteMessage'),
      [
        { text: t('workoutList.no'), style: 'cancel' },
        {
          text: t('workoutList.yes'),
          onPress: async () => {
            try {
              const deleted = await BodyMeasurementService.delete(id);
              if (deleted) {
                Alert.alert(t('general.success'), t('bodyData.deleteSuccess'));
                fetchMeasurements();
              } else {
                Alert.alert(t('general.error'), t('bodyData.deleteFail'));
              }
            } catch (error) {
              console.error('Error deleting measurement:', error);
              Alert.alert(t('general.error'), t('bodyData.deleteFail'));
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View className="flex-row bg-gray-100 dark:bg-gray-800 p-3 rounded-t-lg">
        <Text className="w-24 text-left font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.date')}</Text>
        <Text className="w-20 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.weight')}</Text>
        <Text className="w-20 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.height')}</Text>
        <Text className="w-20 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.neck')}</Text>
        <Text className="w-24 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.shoulder')}</Text>
        <Text className="w-24 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.arm_left')}</Text>
        <Text className="w-24 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.arm_right')}</Text>
        <Text className="w-28 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.forearm_left')}</Text>
        <Text className="w-28 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.forearm_right')}</Text>
        <Text className="w-20 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.chest')}</Text>
        <Text className="w-20 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.waist')}</Text>
        <Text className="w-24 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.thigh_left')}</Text>
        <Text className="w-24 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.thigh_right')}</Text>
        <Text className="w-24 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.calf_left')}</Text>
        <Text className="w-24 text-center font-semibold text-gray-700 dark:text-gray-200">{t('bodyData.calf_right')}</Text>
        <Text className="w-12"></Text>
    </View>
  );

  const renderMeasurementItem = ({ item, index }: { item: BodyMeasurementRow, index: number }) => (
    <View className={`flex-row p-3 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
        <Text className="w-24 text-left text-gray-800 dark:text-gray-200">{new Date(item.date).toLocaleDateString()}</Text>
        <Text className="w-20 text-center text-gray-800 dark:text-gray-200">{item.weight}</Text>
        <Text className="w-20 text-center text-gray-800 dark:text-gray-200">{item.height}</Text>
        <Text className="w-20 text-center text-gray-800 dark:text-gray-200">{item.neck}</Text>
        <Text className="w-24 text-center text-gray-800 dark:text-gray-200">{item.shoulder}</Text>
        <Text className="w-24 text-center text-gray-800 dark:text-gray-200">{item.arm_left}</Text>
        <Text className="w-24 text-center text-gray-800 dark:text-gray-200">{item.arm_right}</Text>
        <Text className="w-28 text-center text-gray-800 dark:text-gray-200">{item.forearm_left}</Text>
        <Text className="w-28 text-center text-gray-800 dark:text-gray-200">{item.forearm_right}</Text>
        <Text className="w-20 text-center text-gray-800 dark:text-gray-200">{item.chest}</Text>
        <Text className="w-20 text-center text-gray-800 dark:text-gray-200">{item.waist}</Text>
        <Text className="w-24 text-center text-gray-800 dark:text-gray-200">{item.thigh_left}</Text>
        <Text className="w-24 text-center text-gray-800 dark:text-gray-200">{item.thigh_right}</Text>
        <Text className="w-24 text-center text-gray-800 dark:text-gray-200">{item.calf_left}</Text>
        <Text className="w-24 text-center text-gray-800 dark:text-gray-200">{item.calf_right}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)} className="w-12 items-center">
            <FontAwesome name="trash-o" size={20} color="#EF4444" />
        </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black p-4">
        {/* Form Card */}
        <View className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-8">
            <View className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6">
                <FormInput label={t('bodyData.weight')} value={formState.weight} onChangeText={(v: string) => handleInputChange('weight', v)} unit="kg" />
                <FormInput label={t('bodyData.height')} value={formState.height} onChangeText={(v: string) => handleInputChange('height', v)} unit="cm" />
                <FormInput label={t('bodyData.neck')} value={formState.neck} onChangeText={(v: string) => handleInputChange('neck', v)} unit="cm" />
                <FormInput label={t('bodyData.shoulder')} value={formState.shoulder} onChangeText={(v: string) => handleInputChange('shoulder', v)} unit="cm" />
                <FormInput label={t('bodyData.chest')} value={formState.chest} onChangeText={(v: string) => handleInputChange('chest', v)} unit="cm" />
                <FormInput label={t('bodyData.waist')} value={formState.waist} onChangeText={(v: string) => handleInputChange('waist', v)} unit="cm" />
                <FormInput label={t('bodyData.arm_left')} value={formState.arm_left} onChangeText={(v: string) => handleInputChange('arm_left', v)} unit="cm" />
                <FormInput label={t('bodyData.arm_right')} value={formState.arm_right} onChangeText={(v: string) => handleInputChange('arm_right', v)} unit="cm" />
                <FormInput label={t('bodyData.forearm_left')} value={formState.forearm_left} onChangeText={(v: string) => handleInputChange('forearm_left', v)} unit="cm" />
                <FormInput label={t('bodyData.forearm_right')} value={formState.forearm_right} onChangeText={(v: string) => handleInputChange('forearm_right', v)} unit="cm" />
                <FormInput label={t('bodyData.thigh_left')} value={formState.thigh_left} onChangeText={(v: string) => handleInputChange('thigh_left', v)} unit="cm" />
                <FormInput label={t('bodyData.thigh_right')} value={formState.thigh_right} onChangeText={(v: string) => handleInputChange('thigh_right', v)} unit="cm" />
                <FormInput label={t('bodyData.calf_left')} value={formState.calf_left} onChangeText={(v: string) => handleInputChange('calf_left', v)} unit="cm" />
                <FormInput label={t('bodyData.calf_right')} value={formState.calf_right} onChangeText={(v: string) => handleInputChange('calf_right', v)} unit="cm" />
            </View>

            <TouchableOpacity 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-4 items-center shadow-md"
                onPress={handleAddMeasurement}
            >
                <Text className="text-white text-lg font-semibold">{t('bodyData.addButton')}</Text>
            </TouchableOpacity>
        </View>

        {/* History Card */}
        <View className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <Text className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t('bodyData.historyTitle')}</Text>
            <ScrollView horizontal>
                <View>
                    <FlatList
                        data={measurements}
                        keyExtractor={(item) => item.id.toString()}
                        ListHeaderComponent={renderHeader}
                        renderItem={renderMeasurementItem}
                        ListEmptyComponent={<Text className="text-gray-500 dark:text-gray-400 text-center mt-10">{t('bodyData.noData')}</Text>}
                        scrollEnabled={false} // Disable FlatList's own scroll
                    />
                </View>
            </ScrollView>
        </View>
    </ScrollView>
  );
}
