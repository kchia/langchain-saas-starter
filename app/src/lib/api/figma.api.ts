/**
 * Figma integration API endpoints.
 */

import { apiClient } from './client';
import {
  FigmaAuthRequest,
  FigmaAuthResponse,
  FigmaExtractRequest,
  FigmaExtractResponse,
} from '@/types';

/**
 * Authenticate Figma Personal Access Token.
 * 
 * @param personalAccessToken - Figma PAT to validate
 * @returns Promise with authentication result
 */
export async function authenticateFigma(
  personalAccessToken: string
): Promise<FigmaAuthResponse> {
  try {
    const request: FigmaAuthRequest = {
      personal_access_token: personalAccessToken,
    };

    const response = await apiClient.post<FigmaAuthResponse>(
      '/tokens/figma/auth',
      request
    );

    return response.data;
  } catch (error) {
    // Error already transformed by interceptor
    throw error;
  }
}

/**
 * Extract design tokens from a Figma file.
 * 
 * @param figmaUrl - Figma file URL
 * @param personalAccessToken - Optional PAT (uses env var if not provided)
 * @returns Promise with extracted tokens from Figma
 */
export async function extractTokensFromFigma(
  figmaUrl: string,
  personalAccessToken?: string
): Promise<FigmaExtractResponse> {
  try {
    const request: FigmaExtractRequest = {
      figma_url: figmaUrl,
      personal_access_token: personalAccessToken,
    };

    const response = await apiClient.post<FigmaExtractResponse>(
      '/tokens/extract/figma',
      request,
      {
        timeout: 30000, // 30s for Figma API + processing
      }
    );

    return response.data;
  } catch (error) {
    // Error already transformed by interceptor
    throw error;
  }
}

/**
 * Invalidate Figma cache for a specific file.
 * This is a helper function to force fresh data fetch.
 * 
 * Note: Backend handles caching automatically. This is for future use
 * if we add an explicit cache invalidation endpoint.
 * 
 * @param fileKey - Figma file key to invalidate
 */
export async function invalidateFigmaCache(fileKey: string): Promise<void> {
  // TODO: Implement when backend adds cache invalidation endpoint
  // For now, this is a placeholder
  console.log(`[Figma] Would invalidate cache for file: ${fileKey}`);
}
