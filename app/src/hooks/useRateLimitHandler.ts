/**
 * Custom hook for handling rate limit errors with countdown timer
 * Epic 003 Story 3.3: Rate Limiting
 */

import { useState, useEffect, useCallback } from 'react';
import { RateLimitError } from '@/types';

export interface RateLimitState {
  isRateLimited: boolean;
  retryAfter: number; // seconds remaining
  message: string;
  endpoint?: string;
}

export function useRateLimitHandler() {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    isRateLimited: false,
    retryAfter: 0,
    message: '',
  });

  // Countdown effect
  useEffect(() => {
    if (!rateLimitState.isRateLimited || rateLimitState.retryAfter <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRateLimitState((prev) => {
        const newRetryAfter = prev.retryAfter - 1;
        
        if (newRetryAfter <= 0) {
          // Rate limit period has expired
          return {
            isRateLimited: false,
            retryAfter: 0,
            message: '',
          };
        }
        
        return {
          ...prev,
          retryAfter: newRetryAfter,
        };
      });
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [rateLimitState.isRateLimited, rateLimitState.retryAfter]);

  // Handle rate limit error
  const handleRateLimitError = useCallback((error: RateLimitError) => {
    setRateLimitState({
      isRateLimited: true,
      retryAfter: error.retryAfter,
      message: error.message,
      endpoint: error.endpoint,
    });
  }, []);

  // Clear rate limit state
  const clearRateLimit = useCallback(() => {
    setRateLimitState({
      isRateLimited: false,
      retryAfter: 0,
      message: '',
    });
  }, []);

  // Check if error is a rate limit error
  const isRateLimitError = useCallback((error: unknown): error is RateLimitError => {
    return error instanceof RateLimitError;
  }, []);

  return {
    rateLimitState,
    handleRateLimitError,
    clearRateLimit,
    isRateLimitError,
  };
}
