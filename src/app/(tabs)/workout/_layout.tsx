import { Stack } from "expo-router";

export default function StackLayout(){
  return (
    <Stack>
      <Stack.Screen name="index"
      options={{
        title: "Workout"
      }}
      />
      <Stack.Screen name="/workoutid/[workout_id]"/>
    </Stack>
  )
}