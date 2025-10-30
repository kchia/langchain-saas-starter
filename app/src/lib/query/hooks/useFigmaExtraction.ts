/**
 * TanStack Query hook for Figma file token extraction.
 */

import { useMutation } from '@tanstack/react-query';
import { extractTokensFromFigma } from '@/lib/api/figma.api';
import { useTokenStore } from '@/stores/useTokenStore';
import { FigmaExtractResponse } from '@/types';

interface FigmaExtractionParams {
  figmaUrl: string;
  personalAccessToken?: string;
}

export function useFigmaExtraction() {
  const setTokens = useTokenStore((state) => state.setTokens);
  
  return useMutation<FigmaExtractResponse, Error, FigmaExtractionParams>({
    mutationFn: ({ figmaUrl, personalAccessToken }) =>
      extractTokensFromFigma(figmaUrl, personalAccessToken),
    onSuccess: (data) => {
      // Update Zustand store with extracted tokens and confidence metadata
      setTokens(data.tokens, {
        filename: data.file_name,
        extractionMethod: 'figma',
        cached: data.cached,
        confidence: data.confidence,
        fallbacks_used: data.fallbacks_used,
        review_needed: data.review_needed,
      });
    },
    onError: (error) => {
      console.error('[useFigmaExtraction] Error:', error.message);
    },
  });
}
