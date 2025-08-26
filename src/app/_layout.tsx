import { Tabs, usePathname } from "expo-router";
import './global.css';
import '../i18n'; // Initialize i18next
import { ThemeProvider } from "../contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { initDB } from "../database/setup/init";

function TabLayout() {
  const { colorScheme } = useColorScheme();
  const {t} = useTranslation();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await initDB();
        setDbInitialized(true);
        console.log('✅ Database initialization completed in app layout');
      } catch (error) {
        console.error('❌ Database initialization failed in app layout:', error);
        setDbError(error instanceof Error ? error.message : 'Unknown database error');
      }
    };
    
    initializeDatabase();
  }, [])

  const retryInitialization = async () => {
    setDbError(null);
    setDbInitialized(false);
    const initializeDatabase = async () => {
      try {
        await initDB();
        setDbInitialized(true);
        console.log('✅ Database initialization retry completed');
      } catch (error) {
        console.error('❌ Database initialization retry failed:', error);
        setDbError(error instanceof Error ? error.message : 'Unknown database error');
      }
    };
    initializeDatabase();
  };

  // Show loading screen while database initializes
  if (!dbInitialized && !dbError) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <Feather name="database" size={48} color="#3b82f6" />
        <Text className="mt-4 text-lg text-gray-700 dark:text-gray-300">Initializing Database...</Text>
      </View>
    );
  }

  // Show error screen if database initialization failed
  if (dbError) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900 p-6">
        <Feather name="alert-triangle" size={48} color="#ef4444" />
        <Text className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Database Error</Text>
        <Text className="mt-2 text-center text-gray-600 dark:text-gray-400">{dbError}</Text>
        <TouchableOpacity
          onPress={retryInitialization}
          className="mt-6 px-6 py-3 bg-blue-500 rounded-lg"
        >
          <Text className="text-white font-semibold">{t('general.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

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