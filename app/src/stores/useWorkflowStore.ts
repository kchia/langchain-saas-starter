/**
 * Zustand store for workflow progress tracking.
 * Manages multi-step workflow state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkflowStep } from '@/types';
import type { RequirementProposal, ComponentType } from '@/types/requirement.types';

interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface WorkflowStore {
  // State
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  progress: number; // 0-100
  _hasHydrated: boolean; // Track hydration status

  // Screenshot file state
  uploadedFile: File | null;
  fileInfo: FileInfo | null;

  // Requirements state
  componentType?: ComponentType;
  componentConfidence?: number;
  proposals: {
    props: RequirementProposal[];
    events: RequirementProposal[];
    states: RequirementProposal[];
    accessibility: RequirementProposal[];
  };

  // Export state
  exportId?: string;
  exportedAt?: string;

  // Actions
  setStep: (step: WorkflowStep) => void;
  completeStep: (step: WorkflowStep) => void;
  updateProgress: (progress: number) => void;
  setUploadedFile: (file: File) => void;
  setRequirements: (
    componentType: ComponentType,
    componentConfidence: number,
    proposals: {
      props: RequirementProposal[];
      events: RequirementProposal[];
      states: RequirementProposal[];
      accessibility: RequirementProposal[];
    }
  ) => void;
  updateProposal: (id: string, updates: Partial<RequirementProposal>) => void;
  removeProposal: (id: string) => void;
  addProposal: (proposal: RequirementProposal) => void;
  acceptAllProposals: () => void;
  setExportInfo: (exportId: string, exportedAt: string) => void;
  getApprovedProposals: () => {
    props: RequirementProposal[];
    events: RequirementProposal[];
    states: RequirementProposal[];
    accessibility: RequirementProposal[];
  };
  resetWorkflow: () => void;
  
  // Navigation helpers
  canAccessStep: (step: WorkflowStep) => boolean;
  getAvailableSteps: () => WorkflowStep[];
}

// Calculate progress percentage based on completed steps
function calculateProgress(completedSteps: WorkflowStep[]): number {
  const totalSteps = 4; // Extract, Requirements, Patterns, Preview
  // Filter out DASHBOARD step from progress calculation
  const completed = completedSteps.filter(step => step !== WorkflowStep.DASHBOARD).length;
  return Math.round((completed / totalSteps) * 100);
}

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: WorkflowStep.DASHBOARD,
      completedSteps: [],
      progress: 0,
      _hasHydrated: false,
      uploadedFile: null,
      fileInfo: null,
      proposals: {
        props: [],
        events: [],
        states: [],
        accessibility: [],
      },

  // Actions
  setStep: (step) =>
    set({
      currentStep: step,
    }),

  setUploadedFile: (file) =>
    set({
      uploadedFile: file,
      fileInfo: file ? {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      } : null,
    }),

  completeStep: (step) =>
    set((state) => {
      const completedSteps = state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step];

      return {
        completedSteps,
        progress: calculateProgress(completedSteps),
      };
    }),

  updateProgress: (progress) =>
    set({
      progress: Math.min(Math.max(progress, 0), 100), // Clamp 0-100
    }),

  setRequirements: (componentType, componentConfidence, proposals) =>
    set({
      componentType,
      componentConfidence,
      proposals,
    }),

  updateProposal: (id, updates) =>
    set((state) => {
      // Find and update the proposal in the correct category
      const updateCategory = (proposals: RequirementProposal[]) =>
        proposals.map((p) => (p.id === id ? { ...p, ...updates } : p));

      return {
        proposals: {
          props: updateCategory(state.proposals.props),
          events: updateCategory(state.proposals.events),
          states: updateCategory(state.proposals.states),
          accessibility: updateCategory(state.proposals.accessibility),
        },
      };
    }),

  removeProposal: (id) =>
    set((state) => {
      // Remove the proposal from the correct category
      const removeFromCategory = (proposals: RequirementProposal[]) =>
        proposals.filter((p) => p.id !== id);

      return {
        proposals: {
          props: removeFromCategory(state.proposals.props),
          events: removeFromCategory(state.proposals.events),
          states: removeFromCategory(state.proposals.states),
          accessibility: removeFromCategory(state.proposals.accessibility),
        },
      };
    }),

  addProposal: (proposal) =>
    set((state) => {
      // Add the proposal to the correct category
      const category = proposal.category;
      return {
        proposals: {
          ...state.proposals,
          [category]: [...state.proposals[category], proposal],
        },
      };
    }),

  acceptAllProposals: () =>
    set((state) => {
      // Mark all proposals as approved
      const acceptCategory = (proposals: RequirementProposal[]) =>
        proposals.map((p) => ({ ...p, approved: true }));

      return {
        proposals: {
          props: acceptCategory(state.proposals.props),
          events: acceptCategory(state.proposals.events),
          states: acceptCategory(state.proposals.states),
          accessibility: acceptCategory(state.proposals.accessibility),
        },
      };
    }),

  setExportInfo: (exportId, exportedAt) =>
    set({
      exportId,
      exportedAt,
    }),

  getApprovedProposals: () => {
    const state = get();
    const filterApproved = (proposals: RequirementProposal[]) =>
      proposals.filter((p) => p.approved);

    return {
      props: filterApproved(state.proposals.props),
      events: filterApproved(state.proposals.events),
      states: filterApproved(state.proposals.states),
      accessibility: filterApproved(state.proposals.accessibility),
    };
  },

  resetWorkflow: () =>
    set({
      currentStep: WorkflowStep.DASHBOARD,
      completedSteps: [],
      progress: 0,
      uploadedFile: null,
      componentType: undefined,
      componentConfidence: undefined,
      proposals: {
        props: [],
        events: [],
        states: [],
        accessibility: [],
      },
      exportId: undefined,
      exportedAt: undefined,
    }),

  // Check if a step is accessible based on completed steps
  canAccessStep: (step) => {
    const state = get();

    // Dashboard and Extract always accessible
    if (step === WorkflowStep.DASHBOARD || step === WorkflowStep.EXTRACT) {
      return true;
    }

    // Check prerequisite completion
    const prerequisites: Partial<Record<WorkflowStep, WorkflowStep>> = {
      [WorkflowStep.REQUIREMENTS]: WorkflowStep.EXTRACT,
      [WorkflowStep.PATTERNS]: WorkflowStep.REQUIREMENTS,
      [WorkflowStep.PREVIEW]: WorkflowStep.PATTERNS,
    };

    const prereq = prerequisites[step];
    return prereq ? state.completedSteps.includes(prereq) : true;
  },

  // Get array of steps user can currently access
  getAvailableSteps: () => {
    const state = get();
    const allSteps = [
      WorkflowStep.DASHBOARD,
      WorkflowStep.EXTRACT,
      WorkflowStep.REQUIREMENTS,
      WorkflowStep.PATTERNS,
      WorkflowStep.PREVIEW,
    ];

    return allSteps.filter(step => state.canAccessStep(step));
  },
    }),
    {
      name: 'workflow-storage',
      // Don't persist file objects (not serializable), only persist workflow state
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        progress: state.progress,
        componentType: state.componentType,
        componentConfidence: state.componentConfidence,
        proposals: state.proposals,
        exportId: state.exportId,
        exportedAt: state.exportedAt,
      }),
      onRehydrateStorage: () => () => {
        // Set hydration flag when rehydration completes
        useWorkflowStore.setState({ _hasHydrated: true });
      },
    }
  )
);
