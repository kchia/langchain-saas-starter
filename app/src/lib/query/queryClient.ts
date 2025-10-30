/**
 * TanStack Query client configuration.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create and configure a QueryClient instance.
 * 
 * Configuration:
 * - staleTime: 5 minutes (matches Figma cache TTL)
 * - cacheTime: 10 minutes
 * - retry: 3 attempts with exponential backoff
 * - refetchOnWindowFocus: true (refresh data when user returns)
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1, // Only retry mutations once
      },
    },
  });
}

// Singleton instance for the app
export const queryClient = createQueryClient();
