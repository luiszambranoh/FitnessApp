import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import {
  initDB,
  startSession,
  addExerciseToSession,
  addSetToExercise,
  getFullWorkoutHistory,
} from './database/database';

interface DisplayRow {
  id: number;
  date: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

export default function App() {
  const [exercise, setExercise] = useState('pepe');
  const [reps, setReps] = useState('10');
  const [sets, setSets] = useState('11');
  const [weight, setWeight] = useState('12');
  const [workouts, setWorkouts] = useState<DisplayRow[]>([]);

  const sessionIdRef = useRef<number | null>(null);

  const setup = async () => {
    try {
      await initDB();
      if (!sessionIdRef.current) {
        sessionIdRef.current = await startSession('Default Session');
      }
      const history = await getFullWorkoutHistory();
      const rows: DisplayRow[] = [];
      history.forEach(session => {
        session.exercises.forEach((ex: any) => {
          const totalSets = ex.sets.length;
          const firstSet = ex.sets[0] || { reps: 0, weight: 0 };
          rows.push({
            id: ex.id,
            date: session.date,
            exercise: ex.name,
            sets: totalSets,
            reps: firstSet.reps,
            weight: firstSet.weight,
          });
        });
      });
      setWorkouts(rows);
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  useEffect(() => {
    setup();
  }, []);

  const handleAddWorkout = async () => {
    if (!exercise || !reps || !sets || !weight) return;
    try {
      if (!sessionIdRef.current) {
        sessionIdRef.current = await startSession('Default Session');
      }
      const exerciseId = await addExerciseToSession(sessionIdRef.current, exercise);
      for (let i = 0; i < parseInt(sets); i++) {
        await addSetToExercise(exerciseId, parseInt(reps), parseFloat(weight));
      }
      await setup();
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Tracker</Text>
      <TextInput
        style={styles.input}
        placeholder="Exercise"
        value={exercise}
        onChangeText={setExercise}
      />
      <TextInput
        style={styles.input}
        placeholder="Reps"
        keyboardType="numeric"
        value={reps}
        onChangeText={setReps}
      />
      <TextInput
        style={styles.input}
        placeholder="Sets"
        keyboardType="numeric"
        value={sets}
        onChangeText={setSets}
      />
      <TextInput
        style={styles.input}
        placeholder="Weight"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />
      <Button title="Add Workout" onPress={handleAddWorkout} />

      <FlatList
        data={workouts}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={() => (
          <View style={styles.tableRow}>
            <Text style={styles.cell}>Date</Text>
            <Text style={styles.cell}>Exercise</Text>
            <Text style={styles.cell}>Sets</Text>
            <Text style={styles.cell}>Reps</Text>
            <Text style={styles.cell}>Weight</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.cell}>{item.date}</Text>
            <Text style={styles.cell}>{item.exercise}</Text>
            <Text style={styles.cell}>{item.sets}</Text>
            <Text style={styles.cell}>{item.reps}</Text>
            <Text style={styles.cell}>{item.weight}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, padding: 8, marginVertical: 5, borderRadius: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 4 },
  cell: { flex: 1, textAlign: 'center' },
});
