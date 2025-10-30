/**
 * TanStack Query hook for Pattern Retrieval (Epic 3)
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { retrievalApi } from '@/lib/api/retrieval';
import type { RetrievalRequest, RetrievalResponse } from '@/types/retrieval';

export interface UsePatternRetrievalOptions {
  requirements: RetrievalRequest['requirements'];
  enabled?: boolean;
}

/**
 * Hook to fetch patterns based on requirements
 * Uses TanStack Query for caching, loading states, and error handling
 */
export function usePatternRetrieval({
  requirements,
  enabled = true,
}: UsePatternRetrievalOptions): UseQueryResult<RetrievalResponse, Error> {
  return useQuery({
    queryKey: ['patterns', requirements],
    queryFn: () => retrievalApi.search({ requirements }),
    enabled: enabled && !!requirements.component_type,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
