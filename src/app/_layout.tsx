import { Tabs, usePathname } from "expo-router";
import './global.css';
import '../i18n'; // Initialize i18next
import { ThemeProvider } from "../contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";

function TabLayout() {
  const { colorScheme } = useColorScheme();
  const {t} = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#111827' : '#FFFFFF',
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB',
        }, 
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen
        name="workout"
        options={{
          title: t('tabs.workout'),
          tabBarIcon: ({ color, size }) => <Feather name="activity" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabLayout />
    </ThemeProvider>
  );
}