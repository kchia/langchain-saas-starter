/**
 * Tests for generation API client.
 * 
 * Epic 4: Code Generation & Adaptation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  generateComponent,
  downloadGeneratedCode,
  isGenerationInProgress,
  isGenerationFailed,
  isGenerationSuccessful,
} from '../generation';
import {
  GenerationRequest,
  GenerationResponse,
  GenerationStatus,
  GenerationStage,
} from '@/types';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('generation API', () => {
  describe('generateComponent', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('calls POST /generation/generate with correct payload', async () => {
      const mockRequest: GenerationRequest = {
        pattern_id: 'button-001',
        tokens: {
          colors: {
            primary: '#3b82f6',
          },
          typography: {},
          spacing: {},
          borderRadius: {},
        },
        requirements: [],
      };

      const mockResponse: GenerationResponse = {
        code: {
          component: 'export const Button = () => {}',
          stories: 'export default { title: "Button" }',
        },
        metadata: {
          pattern_used: 'button',
          pattern_version: '1.0.0',
          tokens_applied: 5,
          requirements_implemented: 3,
          lines_of_code: 50,
          imports_count: 3,
          has_typescript_errors: false,
          has_accessibility_warnings: false,
        },
        timing: {
          total_ms: 45000,
          parsing_ms: 5000,
          injection_ms: 10000,
          generation_ms: 15000,
          assembly_ms: 10000,
          formatting_ms: 5000,
        },
        provenance: {
          pattern_id: 'button-001',
          pattern_version: '1.0.0',
          generated_at: '2025-01-01T00:00:00Z',
          tokens_hash: 'abc123',
          requirements_hash: 'def456',
        },
        status: GenerationStatus.COMPLETED,
      };

      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue({ data: mockResponse }),
      });

      const result = await generateComponent(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(result.status).toBe(GenerationStatus.COMPLETED);
      expect(result.code.component).toContain('Button');
    });

    it('handles generation errors gracefully', async () => {
      const mockRequest: GenerationRequest = {
        pattern_id: 'invalid',
        tokens: {
          colors: {},
          typography: {},
          spacing: {},
          borderRadius: {},
        },
        requirements: [],
      };

      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockRejectedValue(new Error('Pattern not found')),
      });

      await expect(generateComponent(mockRequest)).rejects.toThrow();
    });

    it('uses correct timeout for long-running generation', async () => {
      const mockRequest: GenerationRequest = {
        pattern_id: 'button-001',
        tokens: {
          colors: {},
          typography: {},
          spacing: {},
          borderRadius: {},
        },
        requirements: [],
      };

      const mockPost = vi.fn().mockResolvedValue({
        data: {
          status: GenerationStatus.COMPLETED,
          code: { component: '', stories: '' },
          metadata: {} as any,
          timing: {} as any,
          provenance: {} as any,
        },
      });

      mockedAxios.create.mockReturnValue({
        post: mockPost,
      });

      await generateComponent(mockRequest);

      // Verify timeout is set to 90s
      expect(mockPost).toHaveBeenCalledWith(
        '/generation/generate',
        mockRequest,
        expect.objectContaining({
          timeout: 90000,
        })
      );
    });
  });

  describe('status helper functions', () => {
    it('correctly identifies in-progress status', () => {
      expect(isGenerationInProgress(GenerationStatus.PENDING)).toBe(true);
      expect(isGenerationInProgress(GenerationStatus.IN_PROGRESS)).toBe(true);
      expect(isGenerationInProgress(GenerationStatus.COMPLETED)).toBe(false);
      expect(isGenerationInProgress(GenerationStatus.FAILED)).toBe(false);
    });

    it('correctly identifies failed status', () => {
      expect(isGenerationFailed(GenerationStatus.FAILED)).toBe(true);
      expect(isGenerationFailed(GenerationStatus.COMPLETED)).toBe(false);
      expect(isGenerationFailed(GenerationStatus.PENDING)).toBe(false);
    });

    it('correctly identifies successful status', () => {
      expect(isGenerationSuccessful(GenerationStatus.COMPLETED)).toBe(true);
      expect(isGenerationSuccessful(GenerationStatus.FAILED)).toBe(false);
      expect(isGenerationSuccessful(GenerationStatus.PENDING)).toBe(false);
    });
  });

  describe('downloadGeneratedCode', () => {
    it('creates download links for component files', () => {
      // Mock DOM methods
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL');
      const mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
      const mockAppendChild = vi.spyOn(document.body, 'appendChild');
      const mockRemoveChild = vi.spyOn(document.body, 'removeChild');

      const mockClick = vi.fn();
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      } as any;

      mockCreateElement.mockReturnValue(mockAnchor);
      mockCreateObjectURL.mockReturnValue('blob:mock-url');

      const code = {
        component: 'export const Button = () => {}',
        stories: 'export default { title: "Button" }',
        tokens_json: '{"colors":{}}',
        requirements_json: '{"requirements":[]}',
      };

      downloadGeneratedCode(code, 'Button');

      // Should create downloads for all 4 files
      expect(mockCreateElement).toHaveBeenCalledTimes(4);
      expect(mockClick).toHaveBeenCalledTimes(4);
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(4);
      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(4);

      // Cleanup
      mockCreateElement.mockRestore();
      mockCreateObjectURL.mockRestore();
      mockRevokeObjectURL.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });
  });
});
