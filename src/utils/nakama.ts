// Nakama Client Setup
import { Client, Session } from '@heroiclabs/nakama-js';
import type { Socket } from '@heroiclabs/nakama-js';

// Environment configuration
const NAKAMA_HOST = import.meta.env.VITE_NAKAMA_HOST || 'localhost';
const NAKAMA_PORT = import.meta.env.VITE_NAKAMA_PORT || '7350';
const NAKAMA_USE_SSL = import.meta.env.VITE_NAKAMA_USE_SSL === 'true';
const NAKAMA_SERVER_KEY = import.meta.env.VITE_NAKAMA_SERVER_KEY || 'defaultkey';

// Create Nakama client
export const createClient = (): Client => {
  return new Client(
    NAKAMA_SERVER_KEY,
    NAKAMA_HOST,
    NAKAMA_PORT,
    NAKAMA_USE_SSL
  );
};

// Generate a deterministic device ID from display name
// This ensures the same display name (case-sensitive) always maps to the same account
const generateDeviceIdFromName = async (displayName: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(displayName);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Authenticate with display name (same name = same account)
export const authenticateDevice = async (
  client: Client,
  displayName: string
): Promise<Session> => {
  // Generate device ID from display name (deterministic)
  // Same display name (case-sensitive) = same device ID = same account
  const deviceId = await generateDeviceIdFromName(displayName);
  localStorage.setItem('deviceId', deviceId);

  // Authenticate (creates account if doesn't exist, or logs in if exists)
  const session = await client.authenticateDevice(deviceId, true);

  // Update account with display name (in case it's a new account)
  await client.updateAccount(session, {
    display_name: displayName
  });

  // Store session token
  localStorage.setItem('nakamaToken', session.token);
  localStorage.setItem('nakamaRefreshToken', session.refresh_token);
  localStorage.setItem('displayName', displayName);

  return session;
};

// Restore session from storage
export const restoreSession = async (client: Client): Promise<Session | null> => {
  const token = localStorage.getItem('nakamaToken');
  const refreshToken = localStorage.getItem('nakamaRefreshToken');

  if (!token || !refreshToken) {
    return null;
  }

  try {
    // Create session from token
    let session = Session.restore(token, refreshToken);

    // Check if session is expired
    if (session.isexpired(Date.now() / 1000)) {
      // Try to refresh
      session = await client.sessionRefresh(session);
      localStorage.setItem('nakamaToken', session.token);
      localStorage.setItem('nakamaRefreshToken', session.refresh_token);
    }

    return session;
  } catch {
    // Clear invalid tokens
    localStorage.removeItem('nakamaToken');
    localStorage.removeItem('nakamaRefreshToken');
    return null;
  }
};

// Create and connect socket
export const createSocket = (client: Client): Socket => {
  return client.createSocket(NAKAMA_USE_SSL, false);
};

// Connect socket
export const connectSocket = async (
  socket: Socket,
  session: Session
): Promise<void> => {
  await socket.connect(session, true);
};

// Get stored display name
export const getStoredDisplayName = (): string | null => {
  return localStorage.getItem('displayName');
};

// Clear all stored data (logout)
export const clearStoredData = (): void => {
  localStorage.removeItem('deviceId');
  localStorage.removeItem('nakamaToken');
  localStorage.removeItem('nakamaRefreshToken');
  localStorage.removeItem('displayName');
};

// Utility to decode match data
export const decodeMatchData = (data: Uint8Array): string => {
  const decoder = new TextDecoder();
  return decoder.decode(data);
};

// Utility to encode match data
export const encodeMatchData = (data: string): Uint8Array => {
  const encoder = new TextEncoder();
  return encoder.encode(data);
};
