import {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {AppState} from 'react-native';

const useCountDownTimer = (
  initialTimeInMillis: number,
  isCountDownStart: boolean,
  onCompletion?: () => void,
) => {
  const [timeLeftInMillis, setTimeLeftInMillis] = useState(initialTimeInMillis);
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [remainingTimeInMillis, setRemainingTimeInMillis] = useState(
    initialTimeInMillis,
  );
  const [lastTimeInBackground, setLastTimeInBackground] = useState(Date.now());
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const appStateSubscription = useRef<any | null>(null);
  const removeListeners = useCallback(() => {
    if (intervalId.current) clearInterval(intervalId.current);
    if (appStateSubscription.current) appStateSubscription.current.remove();
  }, [intervalId, appStateSubscription]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: any) => {
      if (nextAppState === 'active') {
        const timeSpentInBackground = Date.now() - lastTimeInBackground;
        const newRemainingTimeInMillis =
          remainingTimeInMillis - timeSpentInBackground;
        setRemainingTimeInMillis(Math.max(newRemainingTimeInMillis, 0));
        setTimeLeftInMillis(Math.max(newRemainingTimeInMillis, 0));
      } else {
        setLastTimeInBackground(Date.now());
      }
    };

    if (isCountDownStart) {
      setTimerIsRunning(true);
    } else {
      setTimerIsRunning(false);
    }

    if (isCountDownStart && remainingTimeInMillis > 0) {
      intervalId.current = setInterval(() => {
        setRemainingTimeInMillis(prev => Math.max(prev - 1000, 0));
        setTimeLeftInMillis(prev => Math.max(prev - 1000, 0));
      }, 1000);
    }

    appStateSubscription.current = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => removeListeners();
  }, [isCountDownStart, remainingTimeInMillis, lastTimeInBackground]);

  useEffect(() => {
    if (remainingTimeInMillis === 0 && timerIsRunning && onCompletion) {
      onCompletion();
    }
  }, [remainingTimeInMillis, timerIsRunning, onCompletion]);

  const stopTimer = useCallback(() => {
    setTimerIsRunning(false);
    removeListeners();
    console.log('Timer Stopped');
  }, []);

  const resetTimer = useCallback(() => {
    setTimerIsRunning(false);
    setTimeLeftInMillis(initialTimeInMillis);
    setRemainingTimeInMillis(initialTimeInMillis);
    setLastTimeInBackground(Date.now());
    console.log('Timer Reset');
  }, [initialTimeInMillis]);

  const formattedRemainingTime = useMemo(() => {
    const minutes = Math.floor(timeLeftInMillis / 1000 / 60);
    const seconds = Math.floor((timeLeftInMillis / 1000) % 60);

    return `${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeftInMillis]);

  return {
    formattedRemainingTime,
    stopTimer,
    resetTimer,
  };
};

export default useCountDownTimer;
