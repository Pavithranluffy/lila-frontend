// Nickname Form Component
import React, { useState } from 'react';

interface NicknameFormProps {
  onSubmit: (nickname: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const NicknameForm: React.FC<NicknameFormProps> = ({
  onSubmit,
  isLoading,
  error
}) => {
  const [nickname, setNickname] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim().length >= 2) {
      await onSubmit(nickname.trim());
    }
  };

  const isValid = nickname.trim().length >= 2;

  return (
    <div className="card card-glow max-w-sm 2xl:max-w-md w-full animate-fadeIn mx-2 sm:mx-0">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold">Who are you?</h2>
        <button
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 sm:mb-6">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Nickname"
            className="input text-sm sm:text-base"
            maxLength={20}
            autoFocus
            disabled={isLoading}
          />
          {nickname.length > 0 && !isValid && (
            <p className="text-xs sm:text-sm text-[var(--accent-red)] mt-2">
              Nickname must be at least 2 characters
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-2 sm:p-3 bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/30 rounded-lg">
            <p className="text-xs sm:text-sm text-[var(--accent-red)]">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full text-sm sm:text-base"
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="spinner w-4 h-4 sm:w-5 sm:h-5 border-2"></div>
              Connecting...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </form>
    </div>
  );
};
