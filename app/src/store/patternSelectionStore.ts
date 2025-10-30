/**
 * Zustand store for pattern selection state management.
 * Tracks selected pattern and comparison patterns for Epic 3.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Pattern {
  pattern_id: string;
  name: string;
  confidence: number;
  source?: string;
  version?: string;
  code?: string;
  metadata?: {
    description?: string;
    props?: string[];
    variants?: string[];
    a11y?: string[];
  };
}

interface PatternSelectionStore {
  // State
  selectedPattern: Pattern | null;
  comparisonPatterns: Pattern[];

  // Actions
  selectPattern: (pattern: Pattern) => void;
  addToComparison: (pattern: Pattern) => void;
  removeFromComparison: (patternId: string) => void;
  clearSelection: () => void;
  clearComparison: () => void;
}

export const usePatternSelection = create<PatternSelectionStore>()(
  persist(
    (set, get) => ({
      selectedPattern: null,
      comparisonPatterns: [],

      selectPattern: (pattern) => set({ selectedPattern: pattern }),

      addToComparison: (pattern) => set((state) => {
        // Max 3 patterns for comparison
        if (state.comparisonPatterns.length >= 3) {
          return state;
        }
        // Don't add duplicates
        if (state.comparisonPatterns.some(p => p.pattern_id === pattern.pattern_id)) {
          return state;
        }
        return {
          comparisonPatterns: [...state.comparisonPatterns, pattern]
        };
      }),

      removeFromComparison: (patternId) => set((state) => ({
        comparisonPatterns: state.comparisonPatterns.filter(
          p => p.pattern_id !== patternId
        )
      })),

      clearSelection: () => set({ selectedPattern: null }),
      clearComparison: () => set({ comparisonPatterns: [] }),
    }),
    {
      name: 'pattern-selection-storage',
      // Only persist selected pattern, not comparison (comparison is session-only)
      partialize: (state) => ({
        selectedPattern: state.selectedPattern
      }),
      skipHydration: false,
    }
  )
);
