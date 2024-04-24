import {useState, useEffect, useRef, useCallback} from 'react';
import {AppState} from 'react-native';

export interface CountDownTimerProps {
  duration: number; // Time in seconds for the countdown
  startAt?: number; // Optional starting point (seconds) (default: 0)
  isPlaying?: boolean; // Control whether the timer should start or stop
  onUpdate?: (time: number) => void; // Callback to update state on each tick
  onComplete?: () => void; // Callback when timer reaches 0
}

export default function useCountDownTimer({
  duration,
  startAt = duration,
  isPlaying = true,
  onUpdate,
  onComplete,
}: CountDownTimerProps) {
  const [remainingTime, setRemainingTime] = useState(startAt);
  const [backgroundTime, setBackgroundTime] = useState(0);
  const [isInBackground, setIsInBackground] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const appStateStartTime = useRef(0);

  const handleAppStateChange = useCallback(
    (nextAppState: any) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App comes to the foreground
        const backgroundDuration = Date.now() - appStateStartTime.current;
        setBackgroundTime(prev => prev + backgroundDuration);
        setIsInBackground(false);
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App goes to the background
        appStateStartTime.current = Date.now();
        setIsInBackground(true);
      }
      appState.current = nextAppState;
    },
    [backgroundTime],
  );
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const tick = useCallback(() => {
    setRemainingTime(prevRemainingTime => {
      const newRemainingTime = prevRemainingTime - 1;
      onUpdate && onUpdate(newRemainingTime);
      if (newRemainingTime <= 0) {
        onComplete && onComplete();
        stop();
      }
      return newRemainingTime;
    });
  }, [onComplete, onUpdate]);

  const start = useCallback(() => {
    if (!intervalRef.current && remainingTime > 0) {
      intervalRef.current = setInterval(tick, 1000);
    }
  }, [remainingTime, tick]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      start();
    } else {
      stop();
    }

    return stop;
  }, [isPlaying, start, stop]);

  useEffect(() => {
    if (isInBackground) {
      const remainingBackgroundTime = Math.max(
        0,
        duration - Math.floor(backgroundTime / 1000),
      );
      setRemainingTime(remainingBackgroundTime);
    } else {
      setRemainingTime(startAt - Math.floor(backgroundTime / 1000));
    }
  }, [startAt, backgroundTime, isInBackground]);

  return {remainingTime, start, stop};
}
