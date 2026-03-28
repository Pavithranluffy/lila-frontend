// Nakama Context Provider
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Client, Session } from '@heroiclabs/nakama-js';
import type { Socket, Match, MatchData as NakamaMatchData } from '@heroiclabs/nakama-js';
import {
  createClient,
  authenticateDevice,
  restoreSession,
  createSocket,
  connectSocket,
  decodeMatchData,
  encodeMatchData,
  getStoredDisplayName,
  clearStoredData
} from '../utils/nakama';
import type { GameState, GameOverData, PlayerMark, GameMode } from '../types/game';
import { OpCode } from '../types/game';

interface NakamaContextType {
  // Connection state
  isConnected: boolean;
  isAuthenticated: boolean;
  error: string | null;
  wasKicked: boolean;

  // User info
  userId: string | null;
  displayName: string | null;

  // Authentication
  login: (displayName: string) => Promise<void>;
  logout: () => void;

  // Matchmaking
  isSearching: boolean;
  findMatch: (gameMode: GameMode) => Promise<void>;
  cancelMatchmaking: () => Promise<void>;

  // Match state
  currentMatch: Match | null;
  gameState: GameState | null;
  gameOver: GameOverData | null;
  myMark: PlayerMark | null;

  // Game actions
  makeMove: (cellIndex: number) => void;
  leaveMatch: () => Promise<void>;

  // Leaderboard
  getLeaderboard: (limit?: number) => Promise<unknown>;
  getPlayerStats: () => Promise<unknown>;
}

const NakamaContext = createContext<NakamaContextType | null>(null);

export const useNakama = () => {
  const context = useContext(NakamaContext);
  if (!context) {
    throw new Error('useNakama must be used within a NakamaProvider');
  }
  return context;
};

interface Props {
  children: React.ReactNode;
}

export const NakamaProvider: React.FC<Props> = ({ children }) => {
  // Client and session
  const clientRef = useRef<Client | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const sessionRef = useRef<Session | null>(null);

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(getStoredDisplayName());
  const [wasKicked, setWasKicked] = useState(false);

  // Matchmaking state
  const [isSearching, setIsSearching] = useState(false);
  const matchmakerTicketRef = useRef<string | null>(null);

  // Match state
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameOver, setGameOver] = useState<GameOverData | null>(null);
  const [myMark, setMyMark] = useState<PlayerMark | null>(null);

  // Initialize client
  useEffect(() => {
    clientRef.current = createClient();

    // Try to restore session
    const tryRestoreSession = async () => {
      if (!clientRef.current) return;

      try {
        const session = await restoreSession(clientRef.current);
        if (session) {
          sessionRef.current = session;
          setUserId(session.user_id ?? null);
          setIsAuthenticated(true);

          // Connect socket
          await setupSocket(session);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      }
    };

    tryRestoreSession();

    return () => {
      socketRef.current?.disconnect(false);
    };
  }, []);

  // Setup socket with event handlers
  const setupSocket = async (session: Session) => {
    if (!clientRef.current) return;

    const socket = createSocket(clientRef.current);
    socketRef.current = socket;

    // Socket event handlers
    socket.ondisconnect = (evt) => {
      setIsConnected(false);

      // Check if disconnected due to login from another location (code 4001)
      // The disconnect event may contain close code info
      if (evt && typeof evt === 'object') {
        const closeEvent = evt as { code?: number; reason?: string };
        if (closeEvent.code === 4001 || closeEvent.reason?.includes('another location')) {
          setWasKicked(true);
          setError('You have been logged out because you logged in from another location.');
          setIsAuthenticated(false);
          clearStoredData();
        }
      }
    };

    socket.onerror = (evt) => {
      console.error('Socket error:', evt);
      if (!wasKicked) {
        setError('Connection error');
      }
    };

    // Matchmaker matched
    socket.onmatchmakermatched = async (matched) => {
      setIsSearching(false);
      matchmakerTicketRef.current = null;

      try {
        // Join the match
        const match = await socket.joinMatch(matched.match_id, matched.token);
        setCurrentMatch(match);
        // myMark will be set when we receive the first STATE_UPDATE from server
      } catch (err) {
        console.error('Failed to join match:', err);
        setError('Failed to join match');
      }
    };

    // Match data handler
    socket.onmatchdata = (matchData: NakamaMatchData) => {
      const data = decodeMatchData(matchData.data);

      switch (matchData.op_code) {
        case OpCode.STATE_UPDATE:
          try {
            const state = JSON.parse(data) as GameState;
            setGameState(state);
            setGameOver(null);

            // Determine myMark from game state based on userId
            const currentUserId = sessionRef.current?.user_id;
            if (currentUserId) {
              if (state.players.x.odId === currentUserId) {
                setMyMark('X');
              } else if (state.players.od.odId === currentUserId) {
                setMyMark('O');
              }
            }
          } catch (e) {
            console.error('Failed to parse state update:', e);
          }
          break;

        case OpCode.GAME_OVER:
          try {
            const gameOverData = JSON.parse(data) as GameOverData;
            setGameOver(gameOverData);
          } catch (e) {
            console.error('Failed to parse game over:', e);
          }
          break;

        case OpCode.PLAYER_LEFT:
          try {
            const leftData = JSON.parse(data);
            if (leftData.playerLeft) {
              setGameOver({
                winner: leftData.winner,
                winningCells: [],
                board: gameState?.board || Array(9).fill(null),
                players: gameState?.players || { x: { name: '', odId: '' }, od: { name: '', odId: '' } }
              });
            }
          } catch (e) {
            console.error('Failed to parse player left:', e);
          }
          break;
      }
    };

    // Match presence handler
    socket.onmatchpresence = (presenceEvent) => {
      // Handle player join/leave during match
      if (presenceEvent.leaves && presenceEvent.leaves.length > 0) {
        // Opponent left - will receive PLAYER_LEFT message from server
      }
    };

    // Connect and set connected state
    await connectSocket(socket, session);
    setIsConnected(true);
    setError(null);
  };

  // Login
  const login = useCallback(async (name: string) => {
    if (!clientRef.current) {
      setError('Client not initialized');
      return;
    }

    try {
      setError(null);
      setWasKicked(false);
      const session = await authenticateDevice(clientRef.current, name);
      sessionRef.current = session;
      setUserId(session.user_id ?? null);
      setDisplayName(name);
      setIsAuthenticated(true);

      await setupSocket(session);
    } catch (err: unknown) {
      console.error('Login failed:', err);
      // Extract error message from Nakama error response
      let errorMessage = 'Login failed. Please try again.';
      if (err && typeof err === 'object' && 'message' in err) {
        const msg = (err as { message: string }).message;
        if (msg.includes('Username is already in use')) {
          errorMessage = 'This username is taken. Please choose another.';
        } else {
          errorMessage = msg;
        }
      }
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    socketRef.current?.disconnect(false);
    clearStoredData();
    setIsAuthenticated(false);
    setIsConnected(false);
    setUserId(null);
    setDisplayName(null);
    setCurrentMatch(null);
    setGameState(null);
    setGameOver(null);
    setMyMark(null);
  }, []);

  // Find match
  const findMatch = useCallback(async (gameMode: GameMode) => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected');
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      setGameOver(null);
      setGameState(null);

      // Query to only match players with the same game mode
      const query = `+properties.gameMode:${gameMode}`;

      const ticket = await socketRef.current.addMatchmaker(
        query, // query - match only same game mode
        2, // min count
        2, // max count
        { gameMode }, // string properties
        {} // numeric properties
      );

      matchmakerTicketRef.current = ticket.ticket;
    } catch (err) {
      console.error('Failed to find match:', err);
      setError('Failed to find match');
      setIsSearching(false);
    }
  }, [isConnected]);

  // Cancel matchmaking
  const cancelMatchmaking = useCallback(async () => {
    if (!socketRef.current || !matchmakerTicketRef.current) return;

    try {
      await socketRef.current.removeMatchmaker(matchmakerTicketRef.current);
      matchmakerTicketRef.current = null;
      setIsSearching(false);
    } catch (err) {
      console.error('Failed to cancel matchmaking:', err);
    }
  }, []);

  // Make move
  const makeMove = useCallback((cellIndex: number) => {
    if (!socketRef.current || !currentMatch) return;

    const moveData = JSON.stringify({ cellIndex });
    socketRef.current.sendMatchState(
      currentMatch.match_id,
      OpCode.MOVE,
      encodeMatchData(moveData)
    );
  }, [currentMatch]);

  // Leave match
  const leaveMatch = useCallback(async () => {
    if (!socketRef.current || !currentMatch) return;

    try {
      await socketRef.current.leaveMatch(currentMatch.match_id);
      setCurrentMatch(null);
      setGameState(null);
      setGameOver(null);
      setMyMark(null);
    } catch (err) {
      console.error('Failed to leave match:', err);
    }
  }, [currentMatch]);

  // Get leaderboard
  const getLeaderboard = useCallback(async (limit: number = 10): Promise<unknown> => {
    if (!clientRef.current || !sessionRef.current) {
      return null;
    }

    try {
      const result = await clientRef.current.rpc(
        sessionRef.current,
        'get_leaderboard',
        JSON.stringify({ limit }) as unknown as object
      );
      // Payload may already be parsed or be a string
      if (!result.payload) return null;
      if (typeof result.payload === 'string') {
        return JSON.parse(result.payload);
      }
      return result.payload;
    } catch (err) {
      console.error('Failed to get leaderboard:', err);
      return null;
    }
  }, []);

  // Get player stats
  const getPlayerStats = useCallback(async (): Promise<unknown> => {
    if (!clientRef.current || !sessionRef.current) return null;

    try {
      const result = await clientRef.current.rpc(
        sessionRef.current,
        'get_player_stats',
        '{}' as unknown as object
      );
      // Payload may already be parsed or be a string
      if (!result.payload) return null;
      if (typeof result.payload === 'string') {
        return JSON.parse(result.payload);
      }
      return result.payload;
    } catch (err) {
      console.error('Failed to get player stats:', err);
      return null;
    }
  }, []);

  const value: NakamaContextType = {
    isConnected,
    isAuthenticated,
    error,
    wasKicked,
    userId,
    displayName,
    login,
    logout,
    isSearching,
    findMatch,
    cancelMatchmaking,
    currentMatch,
    gameState,
    gameOver,
    myMark,
    makeMove,
    leaveMatch,
    getLeaderboard,
    getPlayerStats
  };

  return (
    <NakamaContext.Provider value={value}>
      {children}
    </NakamaContext.Provider>
  );
};
