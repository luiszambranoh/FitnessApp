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
      <Stack.Screen name="exercise/create-exercise"
        options={{
          title: t('createExercise.title')
        }}
      />
      <Stack.Screen name="exercises"
        options={{
          title: t('exercises.title')
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
      <Stack.Screen name="routine"
        options={{
          title: t('settings.routine')
        }}
      />
    </Stack>
  )
}
