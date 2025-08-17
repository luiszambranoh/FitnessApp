import { Link, router, useLocalSearchParams } from "expo-router"
import { Button, View, Text } from "react-native"

export default function WorkoutID(){
  const { workout_id } = useLocalSearchParams();

  return (
    <View>
      <Text>something: {workout_id}</Text>
      <Button title="Add Exercise" onPress={() => router.navigate(`/workout/${workout_id}/add-exercise`)}/>
    </View>
  )
}