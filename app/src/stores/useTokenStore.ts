/**
 * Zustand store for extracted design tokens.
 * Manages token state across the application.
 */

import { create } from 'zustand';
import { DesignTokens } from '@/types';

interface TokenStore {
  // State
  tokens: DesignTokens | null;
  metadata: {
    filename?: string;
    extractionMethod?: string;
    cached?: boolean;
    confidence?: Record<string, number>;
    fallbacks_used?: string[];
    review_needed?: string[];
  } | null;
  
  // Actions
  setTokens: (tokens: DesignTokens, metadata?: any) => void;
  updateToken: (category: keyof DesignTokens, name: string, value: any) => void;
  clearTokens: () => void;
}

export const useTokenStore = create<TokenStore>((set) => ({
  // Initial state
  tokens: null,
  metadata: null,
  
  // Actions
  setTokens: (tokens, metadata) =>
    set({
      tokens,
      metadata: metadata || null,
    }),
  
  updateToken: (category, name, value) =>
    set((state) => {
      if (!state.tokens) return state;
      
      return {
        tokens: {
          ...state.tokens,
          [category]: {
            ...state.tokens[category],
            [name]: value,
          },
        },
      };
    }),
  
  clearTokens: () =>
    set({
      tokens: null,
      metadata: null,
    }),
}));
