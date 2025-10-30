/**
 * Token extraction API endpoints.
 */

import { apiClient } from './client';
import { TokenExtractionResponse, DesignTokens } from '@/types';

/**
 * Extract design tokens from an uploaded screenshot.
 * 
 * @param file - The image file to upload
 * @returns Promise with extracted tokens and metadata
 */
export async function extractTokensFromScreenshot(
  file: File
): Promise<TokenExtractionResponse> {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    // Upload and extract tokens
    const response = await apiClient.post<TokenExtractionResponse>(
      '/tokens/extract/screenshot',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60s for vision API processing
      }
    );

    return response.data;
  } catch (error) {
    // Error already transformed by interceptor
    throw error;
  }
}

/**
 * Get default shadcn/ui tokens as fallback.
 * This is a client-side function that returns hardcoded defaults.
 * 
 * @returns Default design tokens
 */
export function getDefaultTokens(): DesignTokens {
  return {
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      foreground: '#0f172a',
      accent: '#f59e0b',
      muted: '#f1f5f9',
      border: '#e2e8f0',
      destructive: '#ef4444',
    },
    typography: {
      fontFamily: {
        sans: 'Inter, system-ui, sans-serif',
        mono: 'Fira Code, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
  };
}
