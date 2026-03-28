// Matchmaking Component
import React, { useState, useEffect } from 'react';

interface MatchmakingProps {
  onCancel: () => void;
}

export const Matchmaking: React.FC<MatchmakingProps> = ({ onCancel }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="card card-glow max-w-sm 2xl:max-w-md w-full mx-2 sm:mx-4 text-center animate-fadeIn">
        {/* Animated spinner */}
        <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-[var(--bg-secondary)]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--accent-purple)] animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[var(--accent-cyan)] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>

        {/* Text */}
        <h2 className="text-lg sm:text-xl font-semibold mb-2">Finding a random player</h2>

        <div className="flex items-center justify-center gap-1 text-[var(--text-muted)] mb-3 sm:mb-4 text-sm sm:text-base">
          <span>Searching</span>
          <span className="matchmaking-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>

        {/* Timer */}
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-4 sm:mb-6">
          Time elapsed: <span className="font-mono text-[var(--text-primary)]">{formatTime(elapsed)}</span>
        </p>

        <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mb-4 sm:mb-6">
          Waiting for another player to join...
        </p>

        {/* Cancel button */}
        <button onClick={onCancel} className="btn btn-secondary w-full text-sm sm:text-base">
          Cancel
        </button>
      </div>
    </div>
  );
};
