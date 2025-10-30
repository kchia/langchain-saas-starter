/**
 * Tests for useRateLimitHandler hook
 * Epic 003 Story 3.3: Rate Limiting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRateLimitHandler } from '../useRateLimitHandler';
import { RateLimitError } from '@/types';

describe('useRateLimitHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should start with no rate limit active', () => {
      const { result } = renderHook(() => useRateLimitHandler());

      expect(result.current.rateLimitState.isRateLimited).toBe(false);
      expect(result.current.rateLimitState.retryAfter).toBe(0);
      expect(result.current.rateLimitState.message).toBe('');
    });
  });

  describe('handleRateLimitError', () => {
    it('should activate rate limit state when error is handled', () => {
      const { result } = renderHook(() => useRateLimitHandler());
      const error = new RateLimitError('Rate limit exceeded', 60, '/api/v1/extract');

      act(() => {
        result.current.handleRateLimitError(error);
      });

      expect(result.current.rateLimitState.isRateLimited).toBe(true);
      expect(result.current.rateLimitState.retryAfter).toBe(60);
      expect(result.current.rateLimitState.message).toBe('Rate limit exceeded');
      expect(result.current.rateLimitState.endpoint).toBe('/api/v1/extract');
    });
  });

  describe('Countdown Timer', () => {
    it('should countdown from retryAfter value', async () => {
      const { result } = renderHook(() => useRateLimitHandler());
      const error = new RateLimitError('Rate limit exceeded', 5, '/api/v1/generate');

      act(() => {
        result.current.handleRateLimitError(error);
      });

      expect(result.current.rateLimitState.retryAfter).toBe(5);

      // Advance timer by 1 second
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.rateLimitState.retryAfter).toBe(4);

      // Advance timer by 2 more seconds
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.rateLimitState.retryAfter).toBe(2);
    });

    it('should clear rate limit when countdown reaches zero', async () => {
      const { result } = renderHook(() => useRateLimitHandler());
      const error = new RateLimitError('Rate limit exceeded', 2);

      act(() => {
        result.current.handleRateLimitError(error);
      });

      expect(result.current.rateLimitState.isRateLimited).toBe(true);

      // Advance timer to complete countdown
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.rateLimitState.isRateLimited).toBe(false);
      expect(result.current.rateLimitState.retryAfter).toBe(0);
    });

    it('should not go below zero', async () => {
      const { result } = renderHook(() => useRateLimitHandler());
      const error = new RateLimitError('Rate limit exceeded', 1);

      act(() => {
        result.current.handleRateLimitError(error);
      });

      // Advance timer beyond retryAfter
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.rateLimitState.retryAfter).toBe(0);
      expect(result.current.rateLimitState.isRateLimited).toBe(false);
    });
  });

  describe('clearRateLimit', () => {
    it('should clear rate limit state', () => {
      const { result } = renderHook(() => useRateLimitHandler());
      const error = new RateLimitError('Rate limit exceeded', 60);

      act(() => {
        result.current.handleRateLimitError(error);
      });

      expect(result.current.rateLimitState.isRateLimited).toBe(true);

      act(() => {
        result.current.clearRateLimit();
      });

      expect(result.current.rateLimitState.isRateLimited).toBe(false);
      expect(result.current.rateLimitState.retryAfter).toBe(0);
      expect(result.current.rateLimitState.message).toBe('');
      expect(result.current.rateLimitState.endpoint).toBeUndefined();
    });
  });

  describe('isRateLimitError', () => {
    it('should identify RateLimitError instances', () => {
      const { result } = renderHook(() => useRateLimitHandler());
      const error = new RateLimitError('Rate limit exceeded', 60);

      expect(result.current.isRateLimitError(error)).toBe(true);
    });

    it('should reject non-RateLimitError instances', () => {
      const { result } = renderHook(() => useRateLimitHandler());
      const error = new Error('Regular error');

      expect(result.current.isRateLimitError(error)).toBe(false);
    });

    it('should handle null and undefined', () => {
      const { result } = renderHook(() => useRateLimitHandler());

      expect(result.current.isRateLimitError(null)).toBe(false);
      expect(result.current.isRateLimitError(undefined)).toBe(false);
    });
  });

  describe('Multiple Rate Limit Errors', () => {
    it('should update state with new error details', () => {
      const { result } = renderHook(() => useRateLimitHandler());
      const error1 = new RateLimitError('First error', 30, '/api/v1/extract');
      const error2 = new RateLimitError('Second error', 60, '/api/v1/generate');

      act(() => {
        result.current.handleRateLimitError(error1);
      });

      expect(result.current.rateLimitState.retryAfter).toBe(30);
      expect(result.current.rateLimitState.endpoint).toBe('/api/v1/extract');

      act(() => {
        result.current.handleRateLimitError(error2);
      });

      expect(result.current.rateLimitState.retryAfter).toBe(60);
      expect(result.current.rateLimitState.message).toBe('Second error');
      expect(result.current.rateLimitState.endpoint).toBe('/api/v1/generate');
    });
  });
});
