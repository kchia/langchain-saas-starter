/**
 * TanStack Query hook for requirement proposal from screenshots/Figma.
 */

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  proposeRequirements,
  proposeRequirementsWithProgress,
  RequirementProposalRequest,
  RequirementProposalResponse,
} from '@/lib/api/requirements.api';
import { useWorkflowStore } from '@/stores/useWorkflowStore';

/**
 * Hook for proposing requirements with real-time progress updates.
 *
 * Calls POST /requirements/propose/stream with SSE for progress updates.
 * Updates useWorkflowStore with component type and proposals on success.
 *
 * Usage:
 * ```tsx
 * const { mutate, isPending, error, progress, progressMessage } = useRequirementProposal();
 *
 * mutate({
 *   file: imageFile,
 *   tokens: extractedTokens, // optional
 *   figmaData: figmaMetadata, // optional
 * });
 * ```
 *
 * @returns TanStack Query mutation with progress tracking
 */
export function useRequirementProposal() {
  const setRequirements = useWorkflowStore((state: any) => state.setRequirements);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const mutation = useMutation<
    RequirementProposalResponse,
    Error,
    RequirementProposalRequest
  >({
    mutationFn: (request) => {
      setIsAnalyzing(true);
      setProgress(0);
      setProgressMessage('Starting analysis...');

      return proposeRequirementsWithProgress(request, (newProgress, message) => {
        setProgress(newProgress);
        setProgressMessage(message);
      });
    },
    onSuccess: (data) => {
      setProgress(100);
      setProgressMessage('Analysis complete!');

      // Update Zustand store with component type and proposals
      setRequirements(
        data.componentType,
        data.componentConfidence,
        data.proposals
      );

      // Mark as no longer analyzing
      setIsAnalyzing(false);
    },
    onError: (error) => {
      console.error('[useRequirementProposal] Error:', error.message);
      setProgress(0);
      setProgressMessage('');
      setIsAnalyzing(false);
    },
  });

  return {
    ...mutation,
    progress,
    progressMessage,
    isPending: isAnalyzing, // Override isPending with our own state
  };
}

/**
 * Hook for proposing requirements from uploaded image (non-streaming).
 *
 * Calls POST /requirements/propose with file and optional tokens/Figma data.
 * Updates useWorkflowStore with component type and proposals on success.
 *
 * @returns TanStack Query mutation for requirement proposal
 */
export function useRequirementProposalLegacy() {
  const setRequirements = useWorkflowStore((state: any) => state.setRequirements);

  return useMutation<
    RequirementProposalResponse,
    Error,
    RequirementProposalRequest
  >({
    mutationFn: proposeRequirements,
    onSuccess: (data) => {
      // Update Zustand store with component type and proposals
      setRequirements(
        data.componentType,
        data.componentConfidence,
        data.proposals
      );

      // Log metadata in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[useRequirementProposal] Success:', {
          componentType: data.componentType,
          confidence: data.componentConfidence,
          totalProposals: data.metadata.totalProposals,
        });
      }
    },
    onError: (error) => {
      console.error('[useRequirementProposal] Error:', error.message);
    },
  });
}
