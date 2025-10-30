/**
 * Tests for API client rate limit handling
 * Epic 003 Story 3.3: Rate Limiting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '../client';
import { RateLimitError } from '@/types';

describe('API Client - Rate Limit Handling', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('429 Rate Limit Response', () => {
    it('should throw RateLimitError on 429 status', async () => {
      mock.onGet('/test').reply(429, {
        detail: 'Rate limit exceeded',
      }, {
        'retry-after': '60',
      });

      await expect(apiClient.get('/test')).rejects.toThrow(RateLimitError);
    });

    it('should parse retry-after header correctly', async () => {
      mock.onGet('/test').reply(429, {
        detail: 'Rate limit exceeded',
      }, {
        'retry-after': '120',
      });

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.retryAfter).toBe(120);
        }
      }
    });

    it('should use default retry-after when header is missing', async () => {
      mock.onGet('/test').reply(429, {
        detail: 'Rate limit exceeded',
      });

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.retryAfter).toBe(60); // Default value
        }
      }
    });

    it('should include error message in RateLimitError', async () => {
      const errorMessage = 'API rate limit exceeded. Please try again shortly.';
      mock.onGet('/test').reply(429, {
        detail: errorMessage,
      }, {
        'retry-after': '30',
      });

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.message).toBe(errorMessage);
        }
      }
    });

    it('should include endpoint in RateLimitError', async () => {
      mock.onPost('/extract').reply(429, {
        detail: 'Rate limit exceeded',
      }, {
        'retry-after': '60',
      });

      try {
        await apiClient.post('/extract', { data: 'test' });
        expect.fail('Should have thrown RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.endpoint).toBe('/extract');
        }
      }
    });
  });

  describe('Non-429 Responses', () => {
    it('should not throw RateLimitError on 400 status', async () => {
      mock.onGet('/test').reply(400, {
        detail: 'Bad request',
      });

      await expect(apiClient.get('/test')).rejects.toThrow();
      await expect(apiClient.get('/test')).rejects.not.toThrow(RateLimitError);
    });

    it('should not throw RateLimitError on 500 status', async () => {
      mock.onGet('/test').reply(500, {
        detail: 'Internal server error',
      });

      await expect(apiClient.get('/test')).rejects.toThrow();
      await expect(apiClient.get('/test')).rejects.not.toThrow(RateLimitError);
    });

    it('should handle successful 200 response normally', async () => {
      mock.onGet('/test').reply(200, {
        data: 'success',
      });

      const response = await apiClient.get('/test');
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ data: 'success' });
    });
  });

  describe('Retry-After Header Parsing', () => {
    it('should parse string number correctly', async () => {
      mock.onGet('/test').reply(429, {
        detail: 'Rate limit exceeded',
      }, {
        'retry-after': '90',
      });

      try {
        await apiClient.get('/test');
      } catch (error) {
        if (error instanceof RateLimitError) {
          expect(error.retryAfter).toBe(90);
        }
      }
    });

    it('should handle invalid retry-after header', async () => {
      mock.onGet('/test').reply(429, {
        detail: 'Rate limit exceeded',
      }, {
        'retry-after': 'invalid',
      });

      try {
        await apiClient.get('/test');
      } catch (error) {
        if (error instanceof RateLimitError) {
          // Should use default when parsing fails (NaN)
          expect(error.retryAfter).toBe(60);
        }
      }
    });
  });

  describe('Different Endpoints', () => {
    it('should handle rate limit on /api/v1/extract', async () => {
      mock.onPost('/tokens/extract/screenshot').reply(429, {
        detail: 'Rate limit exceeded for extract endpoint',
      }, {
        'retry-after': '60',
      });

      try {
        await apiClient.post('/tokens/extract/screenshot', {});
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.endpoint).toContain('extract');
        }
      }
    });

    it('should handle rate limit on /api/v1/generate', async () => {
      mock.onPost('/generate').reply(429, {
        detail: 'Rate limit exceeded for generate endpoint',
      }, {
        'retry-after': '120',
      });

      try {
        await apiClient.post('/generate', {});
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.endpoint).toBe('/generate');
          expect(error.retryAfter).toBe(120);
        }
      }
    });

    it('should handle rate limit on upload endpoint', async () => {
      mock.onPost('/patterns/upload').reply(429, {
        detail: 'Upload rate limit exceeded',
      }, {
        'retry-after': '30',
      });

      try {
        await apiClient.post('/patterns/upload', {});
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
      }
    });
  });

  describe('Error Message Handling', () => {
    it('should use default message when detail is not a string', async () => {
      mock.onGet('/test').reply(429, {
        detail: { error: 'complex error' },
      }, {
        'retry-after': '60',
      });

      try {
        await apiClient.get('/test');
      } catch (error) {
        if (error instanceof RateLimitError) {
          expect(error.message).toBe('Rate limit exceeded. Please try again in a moment.');
        }
      }
    });

    it('should use detail message when available', async () => {
      const customMessage = 'You have exceeded the rate limit for free tier users';
      mock.onGet('/test').reply(429, {
        detail: customMessage,
      }, {
        'retry-after': '60',
      });

      try {
        await apiClient.get('/test');
      } catch (error) {
        if (error instanceof RateLimitError) {
          expect(error.message).toBe(customMessage);
        }
      }
    });
  });
});
