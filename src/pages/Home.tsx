// Home Page - Login/Nickname selection
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNakama } from '../contexts/NakamaContext';
import { NicknameForm } from '../components/NicknameForm';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error, wasKicked } = useNakama();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/lobby');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (nickname: string) => {
    setIsLoading(true);
    try {
      await login(nickname);
      navigate('/lobby');
    } catch {
      // Error is handled by context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4">
      {/* Kicked Alert */}
      {wasKicked && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-[var(--accent-red)]/20 border border-[var(--accent-red)]/50 rounded-lg max-w-sm w-full mx-2 animate-fadeIn">
          <p className="text-[var(--accent-red)] text-sm sm:text-base text-center font-medium">
            You were logged out because you logged in from another location.
          </p>
        </div>
      )}

      {/* Logo */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          <span className="text-gradient">LILA</span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm sm:text-base">Multiplayer Tic-Tac-Toe</p>
      </div>

      {/* Login Form */}
      <NicknameForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={wasKicked ? null : error}
      />

      {/* Footer */}
      <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-[var(--text-muted)] text-center px-4">
        Server-authoritative multiplayer game
      </p>
    </div>
  );
};
