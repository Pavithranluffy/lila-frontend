// Lobby Page - Mode selection and matchmaking
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNakama } from '../contexts/NakamaContext';
import { Matchmaking } from '../components/Matchmaking';
import { Leaderboard } from '../components/Leaderboard';

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    displayName,
    logout,
    isSearching,
    findMatch,
    cancelMatchmaking,
    currentMatch,
    isConnected
  } = useNakama();

  // Track leaderboard refresh key - increments when returning from a game
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const wasInMatch = useRef(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Redirect when match is found, and refresh leaderboard when returning
  useEffect(() => {
    if (currentMatch) {
      wasInMatch.current = true;
      navigate('/game');
    } else if (wasInMatch.current) {
      // Just returned from a match - refresh leaderboard
      wasInMatch.current = false;
      setLeaderboardKey(prev => prev + 1);
    }
  }, [currentMatch, navigate]);

  const handlePlayClassic = () => {
    findMatch('classic');
  };

  const handlePlayTimed = () => {
    findMatch('timed');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-3 sm:p-4 border-b border-[var(--accent-purple)]/20">
        <div className="max-w-4xl 2xl:max-w-6xl mx-auto">
          {/* Mobile: Stack layout, Desktop: Row layout */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold text-gradient">LILA</h1>

            {/* Desktop header items */}
            <div className="hidden sm:flex items-center gap-4 text-sm">
              {/* Connection status */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-[var(--accent-green)]' : 'bg-[var(--accent-red)]'
                  }`}
                ></div>
                <span className="text-[var(--text-muted)]">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <span className="text-[var(--text-muted)]">|</span>
              <span>
                Hello, <span className="text-[var(--accent-purple)] font-medium">{displayName}</span>
              </span>
              <span className="text-[var(--text-muted)]">|</span>
              <button
                onClick={handleLogout}
                className="text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Mobile header items */}
            <div className="flex sm:hidden items-center gap-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isConnected ? 'bg-[var(--accent-green)]' : 'bg-[var(--accent-red)]'
                }`}
              ></div>
              <span className="text-[var(--accent-purple)] font-medium truncate max-w-[80px]">
                {displayName}
              </span>
              <button
                onClick={handleLogout}
                className="text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors flex-shrink-0"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4">
        <div className="max-w-4xl 2xl:max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-8">
            {/* Game Modes */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Choose Game Mode</h2>

              {/* Classic Mode */}
              <button
                onClick={handlePlayClassic}
                disabled={!isConnected}
                className="w-full card card-glow hover:border-[var(--accent-purple)] transition-all group text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-[var(--accent-purple)]/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                    #
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold">Classic Mode</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                      No time limit. Take your time to think.
                    </p>
                  </div>
                </div>
              </button>

              {/* Timed Mode */}
              <button
                onClick={handlePlayTimed}
                disabled={!isConnected}
                className="w-full card card-glow hover:border-[var(--accent-cyan)] transition-all group text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-[var(--accent-cyan)]/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold">Timed Mode</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                      30 seconds per turn. Fast-paced action!
                    </p>
                  </div>
                </div>
              </button>

              {/* How to play */}
              <div className="card mt-4 sm:mt-6">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">How to Play</h3>
                <ul className="text-xs sm:text-sm text-[var(--text-muted)] space-y-1">
                  <li>Get 3 marks in a row to win</li>
                  <li>In timed mode, run out of time and you lose</li>
                  <li>First player is X (cyan), second is O (pink)</li>
                </ul>
              </div>
            </div>

            {/* Leaderboard */}
            <div>
              <Leaderboard limit={10} refreshKey={leaderboardKey} />
            </div>
          </div>
        </div>
      </main>

      {/* Matchmaking Modal */}
      {isSearching && <Matchmaking onCancel={cancelMatchmaking} />}
    </div>
  );
};
