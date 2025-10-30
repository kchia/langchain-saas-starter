import { create } from "zustand";
import { persist } from "zustand/middleware";

type WorkflowType = "design-system" | "components" | "figma";

interface OnboardingState {
  hasSeenOnboarding: boolean;
  preferredWorkflow: WorkflowType | null;
  extractionCount: number;

  completeOnboarding: (workflow: WorkflowType) => void;
  skipOnboarding: () => void;
  incrementExtractionCount: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      preferredWorkflow: null,
      extractionCount: 0,

      completeOnboarding: (workflow) =>
        set({ hasSeenOnboarding: true, preferredWorkflow: workflow }),

      skipOnboarding: () => set({ hasSeenOnboarding: true }),

      incrementExtractionCount: () =>
        set((state) => ({ extractionCount: state.extractionCount + 1 })),

      resetOnboarding: () =>
        set({
          hasSeenOnboarding: false,
          preferredWorkflow: null,
          extractionCount: 0
        })
    }),
    {
      name: "componentforge-onboarding"
    }
  )
);
