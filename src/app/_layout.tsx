import { Tabs } from "expo-router";
import './global.css'

export default function TabLayout(){
  return (
    <Tabs
      screenOptions={{
          headerShown: false, // This hides the header for the Tabs navigator
        }}
    >
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout'
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile'
        }}
      />
    </Tabs>
  )
}