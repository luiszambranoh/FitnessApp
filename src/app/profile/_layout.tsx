import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";

export default function StackLayout(){
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#111827' : '#FFFFFF',
        },
        headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#111827',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="index"
        options={{
          title: t('settings.title')
        }}
      />
      <Stack.Screen name="exercises"
        options={{
          title: t('exercises.title')
        }}
      />
      <Stack.Screen name="exercises/[exercise_id]"
        options={{
          title: t('exercise.detailsTitle')
        }}
      />
      <Stack.Screen name="exercises/create-exercise"
        options={{
          title: t('createExercise.title')
        }}
      />
      <Stack.Screen name="routine" // Changed from "routine/index"
        options={{
          title: t('settings.routine')
        }}
      />
      <Stack.Screen name="routine/[routine_id]"
        options={{
          title: t('routine.detailsTitle')
        }}
      />
      <Stack.Screen name="routine/[routine_id]/add-exercise"
        options={{
          title: t('routine.addExerciseTitle')
        }}
      />
      <Stack.Screen name="routine/create"
        options={{
          title: t('routines.createTitle')
        }}
      />
      <Stack.Screen name="theme"
        options={{
          title: t('settings.theme')
        }}
      />
      <Stack.Screen name="language"
        options={{
          title: t('settings.language')
        }}
      />
      <Stack.Screen name="body-data"
        options={{
          title: t('settings.bodyData')
        }}
      />
    </Stack>
  )
}