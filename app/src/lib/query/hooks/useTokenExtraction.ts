/**
 * TanStack Query hook for token extraction from screenshots.
 */

import { useMutation } from '@tanstack/react-query';
import { extractTokensFromScreenshot } from '@/lib/api/tokens.api';
import { useTokenStore } from '@/stores/useTokenStore';
import { TokenExtractionResponse } from '@/types';

export function useTokenExtraction() {
  const setTokens = useTokenStore((state) => state.setTokens);

  return useMutation<TokenExtractionResponse, Error, File>({
    mutationFn: extractTokensFromScreenshot,
    onSuccess: (data) => {
      // Update Zustand store with extracted tokens and full metadata including confidence
      setTokens(data.tokens, {
        ...data.metadata,
        extractionMethod: 'screenshot', // Add explicit extraction method
        confidence: data.confidence,
        fallbacks_used: data.fallbacks_used,
        review_needed: data.review_needed,
      });
    },
    onError: (error) => {
      console.error('[useTokenExtraction] Error:', error.message);
    },
  });
}
