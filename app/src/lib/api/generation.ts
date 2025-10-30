/**
 * Code generation API endpoints.
 * 
 * Epic 4: Code Generation & Adaptation
 */

import { apiClient, createLongTimeoutClient } from './client';
import {
  GenerationRequest,
  GenerationResponse,
  GenerationProgress,
  GenerationStatus,
} from '@/types';

/**
 * Generate a component from pattern, tokens, and requirements.
 * Uses long timeout (60s) to accommodate generation pipeline.
 * 
 * @param request - Generation request with pattern_id, tokens, and requirements
 * @returns Promise with generated code and metadata
 */
export async function generateComponent(
  request: GenerationRequest
): Promise<GenerationResponse> {
  try {
    // Use long timeout client for generation (target: ≤60s)
    const client = createLongTimeoutClient();
    
    const response = await client.post<GenerationResponse>(
      '/generation/generate',
      request,
      {
        timeout: 150000, // 150s (2.5min) to accommodate validation retries
      }
    );

    return response.data;
  } catch (error) {
    // Error already transformed by interceptor
    throw error;
  }
}

/**
 * Get generation progress/status (for polling).
 * This endpoint is optional and may not be implemented in MVP.
 * 
 * @param generationId - The ID of the generation task
 * @returns Promise with current generation progress
 */
export async function getGenerationProgress(
  generationId: string
): Promise<GenerationProgress> {
  try {
    const response = await apiClient.get<GenerationProgress>(
      `/generation/status/${generationId}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Download generated component as ZIP file.
 * This creates a ZIP containing component.tsx, stories.tsx, and tokens.json.
 * 
 * @param code - The generated code object
 * @param componentName - Name for the component files
 */
export function downloadGeneratedCode(
  code: GenerationResponse['code'],
  componentName: string = 'Component'
): void {
  // Create a simple download by creating text files
  // In production, backend would provide a ZIP endpoint
  
  // Download component file
  downloadTextFile(
    code.component,
    `${componentName}.tsx`,
    'text/typescript'
  );
  
  // Download stories file
  downloadTextFile(
    code.stories,
    `${componentName}.stories.tsx`,
    'text/typescript'
  );
  
  // Download tokens if available
  if (code.tokens_json) {
    downloadTextFile(
      code.tokens_json,
      'tokens.json',
      'application/json'
    );
  }
  
  // Download requirements if available
  if (code.requirements_json) {
    downloadTextFile(
      code.requirements_json,
      'requirements.json',
      'application/json'
    );
  }
}

/**
 * Helper to download text content as a file.
 * 
 * @param content - The text content to download
 * @param filename - The filename for the download
 * @param mimeType - The MIME type of the content
 */
function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Helper to check if generation is still in progress.
 * 
 * @param status - Generation status
 * @returns True if generation is still running
 */
export function isGenerationInProgress(status: GenerationStatus): boolean {
  return status === GenerationStatus.PENDING || status === GenerationStatus.IN_PROGRESS;
}

/**
 * Helper to check if generation has failed.
 * 
 * @param status - Generation status
 * @returns True if generation failed
 */
export function isGenerationFailed(status: GenerationStatus): boolean {
  return status === GenerationStatus.FAILED;
}

/**
 * Helper to check if generation succeeded.
 * 
 * @param status - Generation status
 * @returns True if generation completed successfully
 */
export function isGenerationSuccessful(status: GenerationStatus): boolean {
  return status === GenerationStatus.COMPLETED;
}
