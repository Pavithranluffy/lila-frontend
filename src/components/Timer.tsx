// Turn Timer Component
import React, { useEffect, useState } from 'react';

interface TimerProps {
  startTime: number;
  duration: number; // in seconds
  isActive: boolean;
}

export const Timer: React.FC<TimerProps> = ({ startTime, duration, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive || duration === 0) {
      setTimeLeft(duration);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, duration, isActive]);

  if (duration === 0) {
    return null; // Classic mode - no timer
  }

  const getTimerClass = () => {
    const classes = ['timer'];

    if (timeLeft <= 5) {
      classes.push('danger');
    } else if (timeLeft <= 10) {
      classes.push('warning');
    }

    return classes.join(' ');
  };

  const progress = (timeLeft / duration) * 100;

  return (
    <div className={getTimerClass()}>
      <div className="timer-ring"></div>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 80 80"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="var(--bg-secondary)"
          strokeWidth="4"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke={timeLeft <= 5 ? 'var(--accent-red)' : timeLeft <= 10 ? 'var(--accent-yellow)' : 'var(--accent-cyan)'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 36}`}
          strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <span className="relative z-10">{timeLeft}s</span>
    </div>
  );
};
