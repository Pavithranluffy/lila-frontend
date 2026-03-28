// Leaderboard Component
import React, { useEffect, useState, useCallback } from 'react';
import { useNakama } from '../contexts/NakamaContext';
import type { LeaderboardRecord } from '../types/game';

interface LeaderboardProps {
  limit?: number;
  showTitle?: boolean;
  refreshKey?: number; // Optional key to force refresh
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  limit = 10,
  showTitle = true,
  refreshKey = 0
}) => {
  const { getLeaderboard, userId } = useNakama();
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(limit) as { records?: LeaderboardRecord[] } | null;
      if (data?.records) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    }
    setLoading(false);
  }, [getLeaderboard, limit]);

  // Fetch on mount and when refreshKey changes
  useEffect(() => {
    // Add delay when refreshKey > 0 (returning from game) to ensure backend has updated
    if (refreshKey > 0) {
      const timer = setTimeout(fetchLeaderboard, 500);
      return () => clearTimeout(timer);
    } else {
      fetchLeaderboard();
    }
  }, [fetchLeaderboard, refreshKey]);

  // Also refresh when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      fetchLeaderboard();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchLeaderboard]);

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  if (loading) {
    return (
      <div className="card card-glow">
        {showTitle && <h2 className="text-xl mb-4">Leaderboard</h2>}
        <div className="flex justify-center py-8">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-glow animate-fadeIn">
      {showTitle && (
        <h2 className="text-lg sm:text-xl mb-3 sm:mb-4 flex items-center gap-2">
          <span>Leaderboard</span>
        </h2>
      )}

      {records.length === 0 ? (
        <p className="text-center py-4 text-[var(--text-muted)] text-sm sm:text-base">
          No records yet. Be the first to play!
        </p>
      ) : (
        <>
          {/* Header row */}
          <div className="flex items-center text-[10px] sm:text-xs text-gray-500 mb-2 px-2 sm:px-4">
            <span className="w-8 sm:w-10"></span>
            <span className="flex-1 ml-2 sm:ml-3"></span>
            <span className="w-16 sm:w-20 text-center">W/L/D</span>
            <span className="w-10 sm:w-12 text-center">Streak</span>
          </div>
          <div className="space-y-1 sm:space-y-2">
            {records.map((record) => (
              <div
                key={record.odId}
                className={`leaderboard-row ${record.odId === userId ? 'current-player' : ''}`}
              >
                <span className={`leaderboard-rank ${getRankClass(record.rank)} text-xs sm:text-sm`}>
                  {getRankEmoji(record.rank)}
                </span>
                <span className="flex-1 ml-2 sm:ml-3 text-left truncate text-sm sm:text-base">
                  {record.username}
                  {record.odId === userId && (
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-[var(--accent-purple)]">(you)</span>
                  )}
                </span>
                <span className="font-mono text-xs sm:text-sm w-16 sm:w-20 text-center">
                  <span className="text-green-400">{record.wins}</span>
                  <span className="text-gray-500">/</span>
                  <span className="text-red-400">{record.losses}</span>
                  <span className="text-gray-500">/</span>
                  <span className="text-yellow-400">{record.draws}</span>
                </span>
                <span className="w-10 sm:w-12 text-center text-xs sm:text-sm">
                  {record.streak > 0 && (
                    <span className={`${record.streak >= 3 ? 'text-orange-400' : 'text-gray-400'}`}>
                      {record.streak >= 3 ? '🔥' : ''}{record.streak}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
