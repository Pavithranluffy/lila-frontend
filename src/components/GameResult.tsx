// Game Result Component
import React, { useEffect, useState } from 'react';
import type { GameOverData, PlayerMark } from '../types/game';
import { useNakama } from '../contexts/NakamaContext';

interface GameResultProps {
  gameOver: GameOverData;
  myMark: PlayerMark | null;
  onPlayAgain: () => void;
  onLeave: () => void;
}

interface LeaderboardEntry {
  odId: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  rank: number;
}

export const GameResult: React.FC<GameResultProps> = ({
  gameOver,
  myMark,
  onPlayAgain,
  onLeave
}) => {
  const { getLeaderboard, userId } = useNakama();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const isWinner = gameOver.winner === myMark;
  const isDraw = gameOver.winner === 'draw';

  // Fetch leaderboard after a short delay to ensure backend has updated
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getLeaderboard(10) as { records?: LeaderboardEntry[] } | null;
      if (data?.records) {
        setLeaderboard(data.records);
      }
    };
    // Small delay to ensure leaderboard is updated on backend
    const timer = setTimeout(fetchLeaderboard, 500);
    return () => clearTimeout(timer);
  }, [getLeaderboard]);

  const getResultTitle = () => {
    if (isDraw) return 'DRAW';
    if (isWinner) return 'WINNER!';
    return 'DEFEAT';
  };

  const getResultColor = () => {
    if (isDraw) return 'text-yellow-400';
    if (isWinner) return 'text-green-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0f]/95 flex items-center justify-center z-50 animate-fadeIn p-2 sm:p-4">
      <div className="bg-[#1a1a2e] rounded-xl max-w-sm 2xl:max-w-lg w-full mx-2 sm:mx-4 p-4 sm:p-6 2xl:p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onLeave}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Winner Mark - Centered */}
        <div className="flex flex-col items-center justify-center mb-3 sm:mb-4">
          <div className={`text-5xl sm:text-7xl font-bold ${
            gameOver.winner === 'X' ? 'text-[var(--accent-cyan)]' :
            gameOver.winner === 'O' ? 'text-[var(--accent-pink)]' :
            'text-yellow-400'
          }`}>
            {isDraw ? '=' : gameOver.winner}
          </div>
        </div>

        {/* Result Title - Centered */}
        <div className="flex flex-col items-center justify-center mb-2">
          <h1 className={`text-xl sm:text-2xl font-bold ${getResultColor()}`}>
            {getResultTitle()}
          </h1>
          {isWinner && <span className="text-[var(--accent-cyan)] text-base sm:text-lg mt-1">+200 pts</span>}
        </div>

        {/* Leaderboard Section */}
        <div className="mt-4 sm:mt-6 text-left">
          <div className="flex items-center gap-2 mb-2 sm:mb-3 text-gray-400">
            <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C9.24 2 7 4.24 7 7v3H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3v3H9V7c0-1.65 1.35-3 3-3z"/>
            </svg>
            <span className="font-semibold text-sm sm:text-base">Leaderboard</span>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500 mb-2 px-1 sm:px-2">
            <div className="col-span-5 sm:col-span-5"></div>
            <div className="col-span-4 sm:col-span-4 text-center">W/L/D</div>
            <div className="col-span-3 sm:col-span-3 text-center">Streak</div>
          </div>

          {/* Leaderboard Entries */}
          <div className="space-y-1">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.odId}
                className={`grid grid-cols-12 gap-1 sm:gap-2 py-1.5 sm:py-2 px-1 sm:px-2 rounded text-xs sm:text-sm ${
                  entry.odId === userId ? 'bg-[var(--accent-purple)]/20' : ''
                }`}
              >
                <div className="col-span-5 sm:col-span-5 flex items-center gap-1 sm:gap-2 min-w-0">
                  <span className="text-gray-400 w-4 flex-shrink-0">{index + 1}.</span>
                  <span className="text-white truncate">
                    {entry.username}
                    {entry.odId === userId && (
                      <span className="text-gray-500 ml-1 text-[10px] sm:text-xs">(you)</span>
                    )}
                  </span>
                </div>
                <div className="col-span-4 sm:col-span-4 text-center text-[10px] sm:text-xs">
                  <span className="text-green-400">{entry.wins}</span>
                  <span className="text-gray-500">/</span>
                  <span className="text-red-400">{entry.losses}</span>
                  <span className="text-gray-500">/</span>
                  <span className="text-yellow-400">{entry.draws}</span>
                </div>
                <div className="col-span-3 sm:col-span-3 text-center text-[10px] sm:text-xs">
                  {entry.streak > 0 && (
                    <span className={`${entry.streak >= 3 ? 'text-orange-400' : 'text-gray-400'}`}>
                      {entry.streak >= 3 ? '🔥' : ''}{entry.streak}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onPlayAgain}
          className="mt-4 sm:mt-6 w-full py-2.5 sm:py-3 px-4 sm:px-6 border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors text-sm sm:text-base"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
