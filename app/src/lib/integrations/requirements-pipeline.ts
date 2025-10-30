/**
 * Integration utilities for requirement pipeline (Epic 2 → Epic 3 → Epic 4).
 *
 * This module provides utilities to integrate exported requirements with:
 * - Epic 3: Pattern Retrieval (use requirements as retrieval context)
 * - Epic 4: Code Generation (use requirements for implementation)
 */

import type {
  ExportRequirementsRequest,
  ExportRequirementsResponse,
} from '@/lib/api/requirements.api';
import { exportRequirements } from '@/lib/api/requirements.api';
import type { ComponentType } from '@/types/requirement.types';

/**
 * Build navigation URL for pattern matching with requirements context.
 *
 * This creates a URL to the pattern matching page (Epic 3) with
 * requirements data passed as query parameters or state.
 *
 * @param exportId - Export identifier
 * @param componentType - Component type for filtering patterns
 * @returns URL to pattern matching page with context
 */
export function buildPatternMatchingUrl(
  exportId: string,
  componentType: ComponentType
): string {
  const params = new URLSearchParams({
    exportId,
    componentType,
  });

  return `/patterns?${params.toString()}`;
}

/**
 * Build navigation URL for code generation with requirements.
 *
 * This creates a URL to the code generation page (Epic 4) with
 * requirements and pattern data.
 *
 * @param exportId - Export identifier
 * @param componentType - Component type for code generation
 * @param patternIds - Optional pattern IDs from Epic 3
 * @returns URL to code generation page with context
 */
export function buildCodeGenerationUrl(
  exportId: string,
  componentType: ComponentType,
  patternIds?: string[]
): string {
  const params = new URLSearchParams({
    exportId,
    componentType,
  });

  if (patternIds && patternIds.length > 0) {
    params.append('patterns', patternIds.join(','));
  }

  return `/generate?${params.toString()}`;
}

/**
 * Export requirements and prepare for pipeline integration.
 *
 * This function:
 * 1. Exports approved requirements to database
 * 2. Returns export data and navigation URLs for Epic 3/4
 * 3. Tracks export metadata for analytics
 *
 * @param request - Export request with approved requirements
 * @returns Export result with integration URLs
 */
export async function exportAndPrepareForPipeline(
  request: ExportRequirementsRequest
): Promise<{
  export: ExportRequirementsResponse;
  patternMatchingUrl: string;
  codeGenerationUrl: string;
}> {
  // Export requirements
  const exportResult = await exportRequirements(request);

  // Build integration URLs
  const patternMatchingUrl = buildPatternMatchingUrl(
    exportResult.exportId,
    request.componentType
  );

  const codeGenerationUrl = buildCodeGenerationUrl(
    exportResult.exportId,
    request.componentType
  );

  return {
    export: exportResult,
    patternMatchingUrl,
    codeGenerationUrl,
  };
}

/**
 * Download requirements as JSON file.
 *
 * This triggers a browser download of the requirements.json file
 * that can be used externally or imported into other tools.
 *
 * @param exportData - Export data from API
 * @param filename - Optional filename (default: requirements-{exportId}.json)
 */
export function downloadRequirementsJson(
  exportData: ExportRequirementsResponse['exportData'],
  filename?: string
): void {
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `requirements-${exportData.exportId}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Get requirements export summary for display.
 *
 * @param exportResponse - Export response from API
 * @returns Formatted summary for UI display
 */
export function getExportSummary(exportResponse: ExportRequirementsResponse): {
  exportId: string;
  componentType: string;
  totalRequirements: number;
  approvedCount: number;
  approvalRate: string;
  editRate: string;
  meetsLatencyTarget: boolean;
  exportedAt: string;
} {
  const { summary } = exportResponse;

  return {
    exportId: summary.exportId,
    componentType: summary.componentType,
    totalRequirements: summary.totalRequirements,
    approvedCount: summary.approvedCount,
    approvalRate: `${(summary.approvalRate * 100).toFixed(0)}%`,
    editRate: `${(summary.editRate * 100).toFixed(0)}%`,
    meetsLatencyTarget: summary.meetsLatencyTarget,
    exportedAt: summary.exportedAt,
  };
}

/**
 * Calculate success metrics for evaluation.
 *
 * These metrics align with Epic 2 success criteria:
 * - Precision: ≥80%
 * - Recall: ≥70%
 * - User edit rate: <30%
 * - Latency: p50 ≤15s
 *
 * @param exportResponse - Export response from API
 * @returns Success metrics evaluation
 */
export function calculateSuccessMetrics(exportResponse: ExportRequirementsResponse): {
  meetsApprovalTarget: boolean; // ≥80% approval rate
  meetsEditTarget: boolean; // <30% edit rate
  meetsLatencyTarget: boolean; // ≤15s
  overallSuccess: boolean; // All targets met
} {
  const { summary } = exportResponse;

  const meetsApprovalTarget = summary.approvalRate >= 0.8;
  const meetsEditTarget = summary.editRate < 0.3;
  const meetsLatencyTarget = summary.meetsLatencyTarget;

  return {
    meetsApprovalTarget,
    meetsEditTarget,
    meetsLatencyTarget,
    overallSuccess:
      meetsApprovalTarget && meetsEditTarget && meetsLatencyTarget,
  };
}
