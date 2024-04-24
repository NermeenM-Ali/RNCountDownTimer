import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import useCountDownTimer from './src/hooks/useCountDownTimer';

const App = () => {
  const [isStart, setIsStart] = useState(true);
  // 2mis = 120000
  //25 mins = 1500000
  const duration = 1500000;
  const {formattedRemainingTime, stopTimer, resetTimer} = useCountDownTimer(
    duration,
    true,
    () => {
      stopTimer();
    },
  );

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>{formattedRemainingTime}</Text>
      <TouchableOpacity onPress={resetTimer}>
        <Text>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default App;
