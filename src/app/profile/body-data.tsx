import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { layout, form, table } from '../../styles/theme';
import { BodyMeasurementService } from '../../database/database';
import { BodyMeasurementRow, NewBodyMeasurement } from '../../database/types/dbTypes';
import { FontAwesome } from '@expo/vector-icons';
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

export default function BodyDataScreen() {
  const { t } = useTranslation();
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
  }, []);

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
        {
          text: t('workoutList.no'),
          style: 'cancel',
        },
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
    <View className={table.headerContainer}>
        <Text className={`${table.headerText} w-24`}>{t('bodyData.date')}</Text>
        <Text className={`${table.headerText} w-20`}>{t('bodyData.weight')}</Text>
        <Text className={`${table.headerText} w-20`}>{t('bodyData.height')}</Text>
        <Text className={`${table.headerText} w-20`}>{t('bodyData.neck')}</Text>
        <Text className={`${table.headerText} w-24`}>{t('bodyData.shoulder')}</Text>
        <Text className={`${table.headerText} w-24`}>{t('bodyData.arm_left')}</Text>
        <Text className={`${table.headerText} w-24`}>{t('bodyData.arm_right')}</Text>
        <Text className={`${table.headerText} w-28`}>{t('bodyData.forearm_left')}</Text>
        <Text className={`${table.headerText} w-28`}>{t('bodyData.forearm_right')}</Text>
        <Text className={`${table.headerText} w-20`}>{t('bodyData.chest')}</Text>
        <Text className={`${table.headerText} w-20`}>{t('bodyData.waist')}</Text>
        <Text className={`${table.headerText} w-24`}>{t('bodyData.thigh_left')}</Text>
        <Text className={`${table.headerText} w-24`}>{t('bodyData.thigh_right')}</Text>
        <Text className={`${table.headerText} w-24`}>{t('bodyData.calf_left')}</Text>
        <Text className={`${table.headerText} w-24`}>{t('bodyData.calf_right')}</Text>
        <Text className={`${table.headerText} w-12`}></Text>
    </View>
  );

  const renderMeasurementItem = ({ item }: { item: BodyMeasurementRow }) => (
    <View className={table.rowContainer}>
        <Text className={`${table.rowText} w-24`}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text className={`${table.rowText} w-20`}>{item.weight}</Text>
        <Text className={`${table.rowText} w-20`}>{item.height}</Text>
        <Text className={`${table.rowText} w-20`}>{item.neck}</Text>
        <Text className={`${table.rowText} w-24`}>{item.shoulder}</Text>
        <Text className={`${table.rowText} w-24`}>{item.arm_left}</Text>
        <Text className={`${table.rowText} w-24`}>{item.arm_right}</Text>
        <Text className={`${table.rowText} w-28`}>{item.forearm_left}</Text>
        <Text className={`${table.rowText} w-28`}>{item.forearm_right}</Text>
        <Text className={`${table.rowText} w-20`}>{item.chest}</Text>
        <Text className={`${table.rowText} w-20`}>{item.waist}</Text>
        <Text className={`${table.rowText} w-24`}>{item.thigh_left}</Text>
        <Text className={`${table.rowText} w-24`}>{item.thigh_right}</Text>
        <Text className={`${table.rowText} w-24`}>{item.calf_left}</Text>
        <Text className={`${table.rowText} w-24`}>{item.calf_right}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)} className="w-12 items-center">
            <FontAwesome name="trash-o" size={24} color="red" />
        </TouchableOpacity>
    </View>
  );

  return (
    <View className={layout.container}>
        <Text className={layout.title}>{t('bodyData.title')}</Text>
        <View className="mb-4">
            <View className="flex-row flex-wrap">
                {Object.keys(initialFormState).map((key) => {
                    if (key === 'date') return null;
                    return (
                        <TextInput
                            key={key}
                            className={`${form.textInput} w-1/2 pr-2`}
                            placeholder={t(`bodyData.${key}`)}
                            keyboardType="numeric"
                            value={formState[key as keyof NewBodyMeasurement] ? formState[key as keyof NewBodyMeasurement]!.toString() : ''}
                            onChangeText={(value) => handleInputChange(key as keyof NewBodyMeasurement, value)}
                        />
                    )
                })}
            </View>
            <TouchableOpacity className={form.button} onPress={handleAddMeasurement}>
                <Text className={form.buttonText}>{t('bodyData.addButton')}</Text>
            </TouchableOpacity>
        </View>

        <ScrollView horizontal>
            <FlatList
                data={measurements}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                renderItem={renderMeasurementItem}
                ListEmptyComponent={<Text className="text-gray-500 text-center mt-10">{t('bodyData.noData')}</Text>}
            />
        </ScrollView>
    </View>
  );
}