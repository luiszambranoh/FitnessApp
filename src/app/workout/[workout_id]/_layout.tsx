import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";

export default function StackLayout(){
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();

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
      <Stack.Screen name="add-exercise"
        options={{
          title: "no"
        }}
      />
      <Stack.Screen name="edit"
        options={{
          title: "editar"
        }}
      />
    </Stack>
  )
}