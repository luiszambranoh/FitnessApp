import { router } from "expo-router"
import { Button, View, Text } from "react-native"

export default function Workout(){
  return (
    <View>
      <Text>something</Text>
      <Button title="Workout" onPress={() => router.navigate("/workout/123")}></Button>
    </View>
  )
}