import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useColorScheme } from "nativewind";

// By moving the hook call into its own component, we ensure it's only called
// when the component is rendered, safely within the ThemeProvider.
const ThemeToggleButton = () => {
  const { setTheme } = useTheme();
  const { colorScheme } = useColorScheme();

  const toggleTheme = () => {
    setTheme(colorScheme === 'light' ? 'dark' : 'light');
  }

  return (
    <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
      <Feather 
        name={colorScheme === 'light' ? 'moon' : 'sun'} 
        size={24} 
        color={colorScheme === 'dark' ? '#FFFFFF' : '#111827'} 
      />
    </TouchableOpacity>
  );
}

export default function StackLayout(){
  const { colorScheme } = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#111827' : '#FFFFFF',
        },
        headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#111827',
        headerRight: () => <ThemeToggleButton />,
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