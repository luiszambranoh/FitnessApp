import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button} from 'react-native';
import { initDB } from './database/setup/init';
import { addSet, getSet } from './database/database';
import { SetRow } from './database/types/db';

const exampleSet: SetRow = {
    set_type: 1,
    rest: "90s",
    weight: 25,
    reps: 8,
    completed: 1,
    note: "Warm-up set",
    session_exercise_id: 3,
  };

export default function App() {

  return (
    <SafeAreaView className=''>
        
    </SafeAreaView>
  );
}