import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Input from "../../../components/Input";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ExerciseService } from "../../../database/database";
import { NewExercise, ExerciseRow } from "../../../database/types/dbTypes";
import { form, layout } from "../../../styles/theme";
import { useCrud, CrudService } from "../../../hooks/useCrud";

export default function CreateExercise() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const exerciseCrudService = useMemo(() => ({
    getAll: async () => { return []; },
    getById: async (id: number) => { return null; },
    add: (data: NewExercise) => ExerciseService.add(data),
    update: (item: ExerciseRow) => ExerciseService.update(item),
    delete: (id: number) => ExerciseService.delete(id),
  }), []);

  const { addItem: addExerciseCrud } = useCrud(exerciseCrudService);

  const handleCreate = async () => {
    if (!name.trim()) {
      setNameError(t('createExercise.validation.nameRequired'));
      return;
    } else {
      setNameError(null);
    }

    try {
      const exerciseData: NewExercise = {
        name: name,
        couting_type: "reps",
        note: note || null,
        active: 1,
      };

      const result = await addExerciseCrud(exerciseData);
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
      <Text className={layout.title}>{t('createExercise.button')}</Text>

      <Input
        className={form.textInput}
        placeholder={t('createExercise.namePlaceholder')}
        onChangeText={setName}
        value={name}
      />
      {nameError && <Text className={form.errorText}>{nameError}</Text>}

      <Input
        className={form.textInput}
        placeholder={t('createExercise.notePlaceholder')}
        onChangeText={setNote}
        value={note}
      />

      <TouchableOpacity onPress={handleCreate} className={form.button}>
        <Text className={form.buttonText}>{t('createExercise.button')}</Text>
      </TouchableOpacity>
    </View>
  );
}
