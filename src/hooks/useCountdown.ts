import { useState, useEffect } from 'react';

interface CountdownResult {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  formattedTime: string; // Format: "MM:SS"
  formattedTimePersian: string; // Format: "MM:SS دقیقه"
}

/**
 * Custom hook for countdown timer
 * @param targetTimestamp - Unix timestamp (ms) to count down to
 * @param onExpire - Optional callback when countdown reaches zero
 * @returns CountdownResult with time remaining and formatted strings
 */
export function useCountdown(
  targetTimestamp: number | null,
  onExpire?: () => void
): CountdownResult {
  const calculateTimeLeft = (): CountdownResult => {
    if (!targetTimestamp) {
      return {
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
        formattedTime: '00:00',
        formattedTimePersian: '00:00 دقیقه',
      };
    }

    const now = Date.now();
    const difference = targetTimestamp - now;

    if (difference <= 0) {
      return {
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
        formattedTime: '00:00',
        formattedTimePersian: '00:00 دقیقه',
      };
    }

    const totalSeconds = Math.floor(difference / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const formattedTimePersian = minutes > 0
      ? `${minutes} دقیقه و ${seconds} ثانیه`
      : `${seconds} ثانیه`;

    return {
      minutes,
      seconds,
      totalSeconds,
      isExpired: false,
      formattedTime,
      formattedTimePersian,
    };
  };

  const [timeLeft, setTimeLeft] = useState<CountdownResult>(calculateTimeLeft());

  useEffect(() => {
    if (!targetTimestamp) {
      return;
    }

    // Update immediately on mount
    const newTimeLeft = calculateTimeLeft();
    setTimeLeft(newTimeLeft);

    // Set up interval to update every second
    const timer = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft();
      setTimeLeft(updatedTimeLeft);

      // Call onExpire callback when countdown reaches zero
      if (updatedTimeLeft.isExpired && !timeLeft.isExpired && onExpire) {
        console.log('[useCountdown] Countdown expired, calling onExpire callback');
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTimestamp, onExpire]);

  return timeLeft;
}
