import { Link, router, useLocalSearchParams } from "expo-router"
import { Button, View, Text } from "react-native"
import { useTranslation } from "react-i18next";
import { layout, form } from "../../styles/theme";

export default function WorkoutID(){
  const { workout_id } = useLocalSearchParams();
  const { t } = useTranslation();

  return (
    <View className={layout.container}>
      <Text className={layout.title}>{t('workout.something')} {workout_id}</Text>
      <Button title={t('workout.addExerciseButton')} onPress={() => router.navigate(`/workout/${workout_id}/add-exercise`)}/>
    </View>
  )
}