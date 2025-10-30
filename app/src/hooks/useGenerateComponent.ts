/**
 * TanStack Query hook for Code Generation (Epic 4)
 */

import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { generateComponent } from '@/lib/api';
import {
  GenerationRequest,
  GenerationResponse,
  GenerationStatus,
} from '@/types';

export interface UseGenerateComponentOptions {
  onSuccess?: (data: GenerationResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to generate a component from pattern, tokens, and requirements.
 * Uses TanStack Query mutation for loading states and error handling.
 * 
 * @example
 * ```tsx
 * const { mutate, isPending, data, error } = useGenerateComponent({
 *   onSuccess: (data) => {
 *     console.log('Generated!', data);
 *   },
 * });
 * 
 * // Trigger generation
 * mutate({
 *   pattern_id: 'button-001',
 *   tokens: extractedTokens,
 *   requirements: approvedRequirements,
 * });
 * ```
 */
export function useGenerateComponent(
  options?: UseGenerateComponentOptions
): UseMutationResult<GenerationResponse, Error, GenerationRequest> {
  return useMutation({
    mutationFn: (request: GenerationRequest) => generateComponent(request),
    onSuccess: (data) => {
      // Call user-provided onSuccess callback
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[Generation Error]', error);
      }
      
      // Call user-provided onError callback
      if (options?.onError) {
        options.onError(error);
      }
    },
    retry: false, // Don't retry generation - it's expensive
  });
}

/**
 * Helper hook to get generation status from mutation state.
 * Returns the current generation status based on mutation state.
 */
export function useGenerationStatus(
  mutation: UseMutationResult<GenerationResponse, Error, GenerationRequest>
): GenerationStatus {
  if (mutation.isPending) {
    return GenerationStatus.IN_PROGRESS;
  }
  
  if (mutation.isError) {
    return GenerationStatus.FAILED;
  }
  
  if (mutation.isSuccess && mutation.data) {
    return mutation.data.status;
  }
  
  return GenerationStatus.PENDING;
}

/**
 * Helper hook to check if generation is complete.
 * Returns true if generation succeeded or failed (terminal state).
 */
export function useIsGenerationComplete(
  mutation: UseMutationResult<GenerationResponse, Error, GenerationRequest>
): boolean {
  const status = useGenerationStatus(mutation);
  return (
    status === GenerationStatus.COMPLETED ||
    status === GenerationStatus.FAILED
  );
}
