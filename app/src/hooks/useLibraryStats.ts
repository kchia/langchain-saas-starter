/**
 * React Query hook for fetching library statistics
 */

import { useQuery } from '@tanstack/react-query';
import { retrievalApi } from '@/lib/api/retrieval';
import type { LibraryStatsResponse } from '@/types/retrieval';

export function useLibraryStats() {
  return useQuery<LibraryStatsResponse, Error>({
    queryKey: ['library-stats'],
    queryFn: () => retrievalApi.getLibraryStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes - stats don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}
