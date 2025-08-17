import React from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ExerciseService } from "../../database/database";
import { NewExercise } from "../../database/types/dbTypes";
import { form, layout } from "../../styles/theme";

export default function CreateExercise() {
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useForm<NewExercise>({
    defaultValues: {
      name: "",
      couting_type: "reps",
      note: null,
      active: 1,
    },
  });

  const onSubmit = async (data: NewExercise) => {
    try {
      const exerciseData: NewExercise = {
        ...data,
        active: data.active ? Number(data.active) : 1,
      };

      const result = await ExerciseService.add(exerciseData);
      if (result) {
        Alert.alert(t('createExercise.success'), t('createExercise.success'));
        router.back();
      } else {
        Alert.alert(t('createExercise.fail'), t('createExercise.fail'));
      }
    } catch (error) {
      console.error("Error creating exercise:", error);
      Alert.alert(t('createExercise.error'), t('createExercise.error'));
    }
  };

  return (
    <View className={layout.container}>
      <Text className={layout.title}>{t('createExercise.title')}</Text>

      <Controller
        control={control}
        rules={{ required: t('createExercise.validation.nameRequired') }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={form.textInput}
            placeholder={t('createExercise.namePlaceholder')}
            placeholderTextColor="#9CA3AF"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="name"
      />
      {errors.name && <Text className={form.errorText}>{errors.name.message}</Text>}

      <Controller
        control={control}
        rules={{
          required: t('createExercise.validation.countingTypeRequired'),
          validate: value => 
            ["reps", "time"].includes(value) || t('createExercise.validation.countingTypeInvalid')
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={form.textInput}
            placeholder={t('createExercise.countingTypePlaceholder')}
            placeholderTextColor="#9CA3AF"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
          />
        )}
        name="couting_type"
      />
      {errors.couting_type && <Text className={form.errorText}>{errors.couting_type.message}</Text>}

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={form.textInput}
            placeholder={t('createExercise.notePlaceholder')}
            placeholderTextColor="#9CA3AF"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value || ""}
          />
        )}
        name="note"
      />

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={form.textInput}
            placeholder={t('createExercise.activePlaceholder')}
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            onBlur={onBlur}
            onChangeText={onChange}
            value={String(value)}
          />
        )}
        name="active"
      />

      <TouchableOpacity onPress={handleSubmit(onSubmit)} className={form.button}>
        <Text className={form.buttonText}>{t('createExercise.button')}</Text>
      </TouchableOpacity>
    </View>
  );
}
