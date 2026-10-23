import { useState, useEffect } from 'react';

export const useCountdown = (targetDate) => {
  const calculateRemaining = () => {
    if (!targetDate) return { minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
    
    const expiryTime = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = expiryTime - now;

    if (difference <= 0) {
      return { minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
    }

    const totalSeconds = Math.floor(difference / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
      minutes,
      seconds,
      totalSeconds,
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);
      if (remaining.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};
