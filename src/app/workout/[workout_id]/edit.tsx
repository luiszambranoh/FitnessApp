import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, Platform, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { WorkoutService } from "../../../database/database";
import { WorkoutRow } from "../../../database/types/dbTypes";
import { useTranslation } from "react-i18next";
import { layout, form } from "../../../styles/theme";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditWorkoutScreen() {
  const { workout_id } = useLocalSearchParams();
  const [workout, setWorkout] = useState<WorkoutRow | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { t } = useTranslation();

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchWorkout = async () => {
      if (workout_id) {
        const fetchedWorkout = await WorkoutService.getById(Number(workout_id));
        if (fetchedWorkout) {
          setWorkout(fetchedWorkout);
          setDate(fetchedWorkout.date);
          setTime(fetchedWorkout.time);
          setNote(fetchedWorkout.note || '');
        } else {
          Alert.alert(t('general.error'), t('editWorkout.workoutNotFound'));
          router.back();
        }
      }
    };
    fetchWorkout();
  }, [workout_id]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setDate(formatDate(currentDate));
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || new Date();
    setShowTimePicker(Platform.OS === 'ios');
    setTime(formatTime(currentTime));
  };

  const handleUpdateWorkout = async () => {
    if (!workout) {
      Alert.alert(t('general.error'), t('editWorkout.workoutDataNotLoaded'));
      return;
    }

    const updatedWorkout: WorkoutRow = {
      ...workout,
      date,
      time,
      note,
    };

    try {
      const success = await WorkoutService.update(updatedWorkout);
      if (success) {
        Alert.alert(t('general.success'), t('editWorkout.updateSuccess'));
        router.replace('/workout');
      } else {
        Alert.alert(t('general.error'), t('editWorkout.updateFail'));
      }
    } catch (error) {
      console.error("Error updating workout:", error);
      Alert.alert(t('general.error'), t('editWorkout.updateError'));
    }
  };

  if (!workout) {
    return (
      <View className={layout.container}>
        <Text className={layout.title}>{t('editWorkout.loading')}</Text>
      </View>
    );
  }

  return (
    <View className={layout.container}>
      <Text className={layout.title}>{t('workout.editWorkoutTitle')}</Text>

      <Pressable onPress={() => setShowDatePicker(true)} className={form.textInput}>
        <Text>{date || t('workout.selectDate')}</Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={new Date(date || new Date())}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Pressable onPress={() => setShowTimePicker(true)} className={form.textInput}>
        <Text>{time || t('workout.selectTime')}</Text>
      </Pressable>
      {showTimePicker && (
        <DateTimePicker
          testID="timePicker"
          value={new Date(`2000-01-01T${time || '00:00'}:00`) || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}

      <TextInput
        className={form.textInput}
        placeholder={t('workoutList.noteHeader')}
        value={note}
        onChangeText={setNote}
      />

      <Button title={t('workout.updateWorkoutButton')} onPress={handleUpdateWorkout} />
    </View>
  );
}
