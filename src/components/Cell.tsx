// Game Cell Component
import React from 'react';
import type { CellValue } from '../types/game';

interface CellProps {
  value: CellValue;
  index: number;
  isWinning: boolean;
  isDisabled: boolean;
  onClick: (index: number) => void;
}

export const Cell: React.FC<CellProps> = ({
  value,
  index,
  isWinning,
  isDisabled,
  onClick
}) => {
  const handleClick = () => {
    if (!isDisabled && value === null) {
      onClick(index);
    }
  };

  const getCellClass = () => {
    const classes = ['game-cell'];

    if (value === 'X') classes.push('x');
    if (value === 'O') classes.push('o');
    if (isWinning) classes.push('winning');
    if (isDisabled || value !== null) classes.push('disabled');

    return classes.join(' ');
  };

  return (
    <button
      className={getCellClass()}
      onClick={handleClick}
      disabled={isDisabled || value !== null}
      aria-label={`Cell ${index + 1}, ${value || 'empty'}`}
    >
      {value}
    </button>
  );
};
