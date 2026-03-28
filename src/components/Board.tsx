// Game Board Component
import React from 'react';
import { Cell } from './Cell';
import type { CellValue } from '../types/game';

interface BoardProps {
  board: CellValue[];
  winningCells: number[];
  isMyTurn: boolean;
  isGameOver: boolean;
  onCellClick: (index: number) => void;
}

// Get the line style based on winning pattern
const getWinningLineStyle = (winningCells: number[]): React.CSSProperties | null => {
  if (winningCells.length !== 3) return null;

  const pattern = winningCells.sort((a, b) => a - b).join(',');

  // Line positions and rotations for each winning pattern
  const lineStyles: { [key: string]: React.CSSProperties } = {
    // Horizontal rows
    '0,1,2': { top: '16.67%', left: '5%', width: '90%', transform: 'translateY(-50%)' },
    '3,4,5': { top: '50%', left: '5%', width: '90%', transform: 'translateY(-50%)' },
    '6,7,8': { top: '83.33%', left: '5%', width: '90%', transform: 'translateY(-50%)' },
    // Vertical columns
    '0,3,6': { top: '5%', left: '16.67%', height: '90%', width: '4px', transform: 'translateX(-50%)' },
    '1,4,7': { top: '5%', left: '50%', height: '90%', width: '4px', transform: 'translateX(-50%)' },
    '2,5,8': { top: '5%', left: '83.33%', height: '90%', width: '4px', transform: 'translateX(-50%)' },
    // Diagonals
    '0,4,8': { top: '50%', left: '50%', width: '120%', transform: 'translate(-50%, -50%) rotate(45deg)' },
    '2,4,6': { top: '50%', left: '50%', width: '120%', transform: 'translate(-50%, -50%) rotate(-45deg)' },
  };

  return lineStyles[pattern] || null;
};

export const Board: React.FC<BoardProps> = ({
  board,
  winningCells,
  isMyTurn,
  isGameOver,
  onCellClick
}) => {
  const lineStyle = getWinningLineStyle(winningCells);
  const winner = winningCells.length > 0 ? board[winningCells[0]] : null;

  // Line color based on winner
  const lineColor = winner === 'X' ? 'var(--accent-cyan)' : 'var(--accent-pink)';

  return (
    <div className="game-board animate-fadeIn relative">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          index={index}
          isWinning={winningCells.includes(index)}
          isDisabled={!isMyTurn || isGameOver}
          onClick={onCellClick}
        />
      ))}

      {/* Winning Line */}
      {lineStyle && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            ...lineStyle,
            height: lineStyle.height || '4px',
            backgroundColor: lineColor,
            borderRadius: '2px',
            boxShadow: `0 0 10px ${lineColor}, 0 0 20px ${lineColor}`,
          }}
        />
      )}
    </div>
  );
};
