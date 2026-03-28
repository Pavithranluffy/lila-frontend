// Game Page - Active game
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNakama } from '../contexts/NakamaContext';
import { Board } from '../components/Board';
import { Timer } from '../components/Timer';
import { GameResult } from '../components/GameResult';

export const Game: React.FC = () => {
  const navigate = useNavigate();
  const [showResult, setShowResult] = useState(false);
  const {
    isAuthenticated,
    currentMatch,
    gameState,
    gameOver,
    myMark,
    makeMove,
    leaveMatch,
    findMatch
  } = useNakama();

  // Redirect if not authenticated or no match
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (!currentMatch) {
      navigate('/lobby');
    }
  }, [isAuthenticated, currentMatch, navigate]);

  // Delay showing result popup by 2 seconds
  useEffect(() => {
    if (gameOver) {
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
    }
  }, [gameOver]);

  const handleCellClick = (index: number) => {
    if (!gameState || gameOver) return;

    const isMyTurn = gameState.currentTurn === myMark;
    if (!isMyTurn) return;

    makeMove(index);
  };

  const handleLeave = async () => {
    await leaveMatch();
    navigate('/lobby');
  };

  const handlePlayAgain = async () => {
    await leaveMatch();
    if (gameState?.gameMode) {
      findMatch(gameState.gameMode);
    } else {
      navigate('/lobby');
    }
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Waiting for game to start...</p>
        </div>
      </div>
    );
  }

  const isMyTurn = gameState.currentTurn === myMark;
  const xPlayer = gameState.players?.x;
  const odPlayer = gameState.players?.od;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-3 sm:p-4 border-b border-[var(--accent-purple)]/20">
        <div className="max-w-md 2xl:max-w-xl mx-auto flex items-center justify-between px-2">
          {/* X Player */}
          <div className={`text-center flex-1 ${gameState.currentTurn === 'X' ? 'opacity-100' : 'opacity-50'}`}>
            <p className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase">
              {myMark === 'X' ? '(you)' : '(opp)'}
            </p>
            <p className="font-semibold text-[var(--accent-cyan)] truncate text-sm sm:text-base max-w-[70px] sm:max-w-[100px] 2xl:max-w-[150px] mx-auto">
              {xPlayer?.name || 'Player X'}
            </p>
          </div>

          {/* Turn indicator */}
          <div className="flex flex-col items-center px-2 sm:px-4">
            <span className={`text-xl sm:text-2xl font-bold ${
              gameState.currentTurn === 'X' ? 'text-[var(--accent-cyan)]' : 'text-[var(--accent-pink)]'
            }`}>
              {gameState.currentTurn}
            </span>
            <span className="text-[10px] sm:text-xs text-[var(--text-muted)]">Turn</span>
          </div>

          {/* O Player */}
          <div className={`text-center flex-1 ${gameState.currentTurn === 'O' ? 'opacity-100' : 'opacity-50'}`}>
            <p className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase">
              {myMark === 'O' ? '(you)' : '(opp)'}
            </p>
            <p className="font-semibold text-[var(--accent-pink)] truncate text-sm sm:text-base max-w-[70px] sm:max-w-[100px] 2xl:max-w-[150px] mx-auto">
              {odPlayer?.name || 'Player O'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Timer (for timed mode) */}
        {gameState.turnTimeLimit > 0 && (
          <div className="mb-6">
            <Timer
              startTime={gameState.turnStartTime}
              duration={gameState.turnTimeLimit}
              isActive={gameState.status === 'playing' && isMyTurn}
            />
          </div>
        )}

        {/* Game status */}
        <div className="mb-6 text-center">
          {gameState.status === 'waiting' && (
            <p className="text-[var(--text-muted)]">Waiting for opponent...</p>
          )}
          {gameState.status === 'playing' && (
            <p className={`font-semibold ${isMyTurn ? 'text-[var(--accent-green)]' : 'text-[var(--text-muted)]'}`}>
              {isMyTurn ? 'Your turn!' : "Opponent's turn..."}
            </p>
          )}
        </div>

        {/* Game Board - use gameOver.board when available for final state */}
        <Board
          board={gameOver?.board || gameState.board}
          winningCells={gameOver?.winningCells || []}
          isMyTurn={isMyTurn}
          isGameOver={!!gameOver}
          onCellClick={handleCellClick}
        />

        {/* Leave button */}
        <button
          onClick={handleLeave}
          className="mt-8 text-sm text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors"
        >
          Leave room
        </button>
      </main>

      {/* Game Over Modal - shows after 2 second delay */}
      {gameOver && showResult && (
        <GameResult
          gameOver={gameOver}
          myMark={myMark}
          onPlayAgain={handlePlayAgain}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
};
