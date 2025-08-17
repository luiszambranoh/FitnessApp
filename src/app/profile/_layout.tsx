import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

export default function StackLayout(){
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
      <Stack.Screen name="index"
        options={{
          title: "Settings"
        }}
      />
      <Stack.Screen name="create-exercise"
        options={{
          title: "Create Exercise"
        }}
      />
      <Stack.Screen name="exercises"
        options={{
          title: "Exercises"
        }}
      />
      <Stack.Screen name="theme"
        options={{
          title: "Theme"
        }}
      />
      <Stack.Screen name="language"
        options={{
          title: "Language"
        }}
      />
      <Stack.Screen name="body-data"
        options={{
          title: "Body Data"
        }}
      />
      <Stack.Screen name="routine"
        options={{
          title: "Routine"
        }}
      />
    </Stack>
  )
}
