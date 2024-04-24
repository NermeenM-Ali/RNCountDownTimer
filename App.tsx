import {useState, useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import useCountDownTimer from './src/hooks/useCountDownTimer';

const App = () => {
  const [isCounting, setIsCounting] = useState(true);
  const {remainingTime, start, stop} = useCountDownTimer({
    isPlaying: isCounting,
    duration: 120, // 2 mins
    onComplete: () => {
      console.log('Timer finished!');
      stop();
    },
    onUpdate: time => console.log(`Time remaining: ${time / 1000} seconds`),
  });

  const formatTime = useMemo(() => {
    const minutes = Math.floor(120 / 60);
    const seconds = remainingTime % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, [remainingTime]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{formatTime}</Text>
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
