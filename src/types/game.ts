// Game Types for LILA Tic-Tac-Toe

export type PlayerMark = 'X' | 'O';
export type CellValue = PlayerMark | null;
export type GameMode = 'classic' | 'timed';
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface PlayerInfo {
  name: string;
  odId: string;
}

export interface GameState {
  board: CellValue[];
  currentTurn: PlayerMark;
  status: GameStatus;
  players: {
    x: PlayerInfo;
    od: PlayerInfo;
  };
  gameMode: GameMode;
  turnTimeLimit: number;
  turnStartTime: number;
}

export interface GameOverData {
  winner: PlayerMark | 'draw' | null;
  winningCells: number[];
  board: CellValue[];
  players: {
    x: PlayerInfo;
    od: PlayerInfo;
  };
}

export interface MoveMessage {
  cellIndex: number;
}

// Op Codes matching backend (using const object instead of enum)
export const OpCode = {
  MOVE: 1,
  STATE_UPDATE: 2,
  GAME_OVER: 3,
  TIMER_SYNC: 4,
  PLAYER_LEFT: 5,
  READY: 6
} as const;

export type OpCodeType = typeof OpCode[keyof typeof OpCode];

export interface LeaderboardRecord {
  odId: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  rank: number;
}

export interface PlayerStats {
  odId: string;
  wins: number;
  bestStreak: number;
  weeklyWins: number;
}

export interface MatchmakerTicket {
  ticket: string;
}

export interface MatchData {
  matchId: string;
  token?: string;
  self?: {
    odId: string;
    sessionId: string;
  };
  opponents?: Array<{
    odId: string;
    username: string;
  }>;
}

// UI State types
export interface AppState {
  isConnected: boolean;
  isAuthenticated: boolean;
  isInMatch: boolean;
  isSearching: boolean;
  currentMatchId: string | null;
  myMark: PlayerMark | null;
  error: string | null;
}
