/**
 * Requirement proposal API endpoints.
 */

import { apiClient, createLongTimeoutClient } from './client';
import {
  RequirementProposal,
  ComponentType,
  ComponentClassification,
} from '@/types/requirement.types';
import { DesignTokens } from '@/types/api.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : 'http://localhost:8000/api/v1';

/**
 * Requirement proposal request parameters.
 */
export interface RequirementProposalRequest {
  file: File;
  tokens?: Record<string, unknown> | DesignTokens;
  figmaData?: Record<string, unknown>;
}

/**
 * Requirement proposal API response.
 */
export interface RequirementProposalResponse {
  componentType: ComponentType;
  componentConfidence: number;
  proposals: {
    props: RequirementProposal[];
    events: RequirementProposal[];
    states: RequirementProposal[];
    accessibility: RequirementProposal[];
  };
  metadata: {
    latencySeconds: number;
    timestamp: string;
    source: 'screenshot' | 'figma';
    totalProposals: number;
    targetLatencyP50: number;
    meetsLatencyTarget: boolean;
  };
}

/**
 * Progress event data from SSE stream.
 */
export interface ProgressEvent {
  stage: 'starting' | 'classifying' | 'analyzing' | 'finalizing' | 'complete';
  progress: number;
  message: string;
}

/**
 * Propose requirements with real-time progress updates via SSE.
 *
 * @param request - File and optional tokens/Figma data
 * @param onProgress - Callback for progress updates (0-100)
 * @returns Promise with component type, proposals by category, metadata
 */
export async function proposeRequirementsWithProgress(
  request: RequirementProposalRequest,
  onProgress?: (progress: number, message: string) => void
): Promise<RequirementProposalResponse> {
  return new Promise(async (resolve, reject) => {
    const formData = new FormData();
    formData.append('file', request.file);

    if (request.tokens) {
      formData.append('tokens', JSON.stringify(request.tokens));
    }
    if (request.figmaData) {
      formData.append('figma_data', JSON.stringify(request.figmaData));
    }

    // Use fetch for SSE streaming
    const url = `${API_BASE_URL}/requirements/propose/stream`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let currentEvent = '';
      let shouldContinue = true;

      while (shouldContinue) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.substring(7).trim();
            continue;
          }

          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            try {
              const parsed = JSON.parse(data);

              // Handle error event
              if (currentEvent === 'error' || parsed.error) {
                await reader.cancel();
                reject(new Error(parsed.error));
                shouldContinue = false;
                break;
              }

              // Handle progress event
              if (currentEvent === 'progress' && parsed.progress !== undefined && onProgress) {
                onProgress(parsed.progress, parsed.message || '');
              }

              // Handle complete event with full response
              if (currentEvent === 'complete' && parsed.componentType) {
                await reader.cancel();
                resolve(parsed as RequirementProposalResponse);
                shouldContinue = false;
                break;
              }
            } catch (e) {
              // Ignore parse errors for non-JSON data
            }
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Propose functional requirements from screenshot/Figma frame.
 *
 * Analyzes uploaded image to propose:
 * - Props (variant, size, disabled, etc.)
 * - Events (onClick, onChange, onHover, etc.)
 * - States (hover, focus, disabled, loading, etc.)
 * - Accessibility (aria-label, semantic HTML, keyboard nav, etc.)
 *
 * Each proposal includes confidence score and rationale.
 * Target latency: p50 ≤15s
 *
 * @param request - File and optional tokens/Figma data
 * @returns Promise with component type, proposals by category, metadata
 */
export async function proposeRequirements(
  request: RequirementProposalRequest
): Promise<RequirementProposalResponse> {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', request.file);

    // Add optional data as JSON if provided
    if (request.tokens) {
      formData.append('tokens', JSON.stringify(request.tokens));
    }
    if (request.figmaData) {
      formData.append('figma_data', JSON.stringify(request.figmaData));
    }

    // Use long timeout client for AI processing (up to 60s)
    const client = createLongTimeoutClient();

    const response = await client.post<RequirementProposalResponse>(
      '/requirements/propose',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    // Error already transformed by interceptor
    throw error;
  }
}

/**
 * Export requirements request parameters.
 */
export interface ExportRequirementsRequest {
  componentType: ComponentType;
  componentConfidence: number;
  proposals: {
    props: RequirementProposal[];
    events: RequirementProposal[];
    states: RequirementProposal[];
    accessibility: RequirementProposal[];
  };
  sourceType?: string;
  sourceMetadata?: Record<string, unknown>;
  tokens?: Record<string, unknown> | DesignTokens;
  proposalLatencyMs?: number;
  approvalDurationMs?: number;
  proposedAt?: string;
  approvedAt?: string;
}

/**
 * Export requirements response.
 */
export interface ExportRequirementsResponse {
  exportId: string;
  exportData: {
    exportId: string;
    componentType: string;
    componentConfidence: number;
    requirements: {
      props: RequirementProposal[];
      events: RequirementProposal[];
      states: RequirementProposal[];
      accessibility: RequirementProposal[];
    };
    metadata: {
      exportedAt: string;
      source: Record<string, unknown>;
      tokens: Record<string, unknown>;
      totalRequirements: number;
      requirementsByCategory: Record<string, number>;
    };
  };
  summary: {
    exportId: string;
    componentType: string;
    totalRequirements: number;
    approvedCount: number;
    approvalRate: number;
    editedCount: number;
    editRate: number;
    customAddedCount: number;
    proposalLatencyMs?: number;
    meetsLatencyTarget: boolean;
    proposedAt?: string;
    approvedAt?: string;
    exportedAt: string;
  };
  status: string;
}

/**
 * Export preview response.
 */
export interface ExportPreviewResponse {
  componentType: string;
  componentConfidence: number;
  statistics: {
    totalProposed: number;
    totalApproved: number;
    approvalRate: number;
    editedCount: number;
    editRate: number;
    byCategory: Record<string, {
      approved: number;
      edited: number;
    }>;
  };
  preview: {
    props: RequirementProposal[];
    events: RequirementProposal[];
    states: RequirementProposal[];
    accessibility: RequirementProposal[];
  };
}

/**
 * Export approved requirements to JSON and store in database.
 *
 * This function:
 * - Exports only approved requirements
 * - Stores in PostgreSQL for audit trail
 * - Generates export JSON for Epic 3/4 integration
 * - Tracks approval workflow metrics
 * - Returns export ID for future reference
 *
 * @param request - Export request with approved requirements
 * @returns Promise with export ID, data, and summary
 */
export async function exportRequirements(
  request: ExportRequirementsRequest
): Promise<ExportRequirementsResponse> {
  try {
    const response = await apiClient.post<ExportRequirementsResponse>(
      '/requirements/export',
      request
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Generate a preview of what will be exported.
 *
 * This allows users to review export statistics and approved
 * requirements before committing to the export.
 *
 * @param componentType - Detected component type
 * @param componentConfidence - Classification confidence
 * @param proposals - All proposals grouped by category
 * @returns Promise with export preview
 */
export async function getExportPreview(
  componentType: ComponentType,
  componentConfidence: number,
  proposals: {
    props: RequirementProposal[];
    events: RequirementProposal[];
    states: RequirementProposal[];
    accessibility: RequirementProposal[];
  }
): Promise<ExportPreviewResponse> {
  try {
    const response = await apiClient.post<ExportPreviewResponse>(
      '/requirements/export/preview',
      {
        componentType,
        componentConfidence,
        proposals,
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieve an exported requirement set by ID.
 *
 * @param exportId - Unique export identifier
 * @returns Promise with export data
 */
export async function getExport(exportId: string): Promise<{
  export_id: string;
  component_type: string;
  component_confidence: number;
  requirements: Record<string, RequirementProposal[]>;
  source_metadata?: Record<string, unknown>;
  tokens?: Record<string, unknown>;
  summary: Record<string, unknown>;
}> {
  try {
    const response = await apiClient.get(`/requirements/exports/${exportId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * List recent requirement exports.
 *
 * @param limit - Maximum number of exports to return (default: 10)
 * @returns Promise with list of recent exports
 */
export async function listRecentExports(limit: number = 10): Promise<Array<Record<string, unknown>>> {
  try {
    const response = await apiClient.get('/requirements/exports', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get health status of requirements service.
 *
 * @returns Service health status
 */
export async function getRequirementsHealth(): Promise<{
  status: string;
  service: string;
  version: string;
}> {
  try {
    const response = await apiClient.get('/requirements/health');
    return response.data;
  } catch (error) {
    throw error;
  }
}
