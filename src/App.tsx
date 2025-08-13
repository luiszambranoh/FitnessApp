import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { initDB } from './database/setup/init';
import { addSet, getSet } from './database/database';
import { SetRow } from './database/types/db';

export default function App() {
  const [yes, setYes] = useState(1);

  const exampleSet: SetRow = {
    set_type: 1,
    rest: "90s",
    weight: 25,
    reps: 8,
    completed: 1,
    note: "Warm-up set",
    exercise_in_session_id: 3
  };
  useEffect(
      () => {
          const setup = async () => {
            await initDB();
            addSet(exampleSet);
            await getSet();
          }
          setup();
      }
    , [yes])

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="EL PEPE" onPress={() => setYes(0)} />
        <Button title="no" onPress={() => setYes(1)} />
      {yes !== null && <Text>Value of yes: {yes}</Text>}
    </SafeAreaView>
  );
}