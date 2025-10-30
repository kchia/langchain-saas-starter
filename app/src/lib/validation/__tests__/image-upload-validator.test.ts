/**
 * Unit tests for image upload validation utilities
 * Tests Epic 003 Story 3.1 - Input Safety validation
 */

import { describe, it, expect } from 'vitest';
import {
  validateImageUpload,
  validateSvgSecurity,
  formatFileSize,
  getFileExtension,
} from '../image-upload-validator';

describe('Image Upload Validator', () => {
  describe('validateImageUpload', () => {
    it('should reject files that are too large', async () => {
      // Create a mock file larger than 10MB
      const largeFile = new File(
        [new ArrayBuffer(11 * 1024 * 1024)],
        'large.png',
        { type: 'image/png' }
      );

      const result = await validateImageUpload(largeFile);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('exceeds maximum');
    });

    it('should reject invalid file types', async () => {
      const invalidFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });

      const result = await validateImageUpload(invalidFile);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid file type');
    });

    it('should accept valid PNG files', async () => {
      // Create a small valid PNG file (1x1 transparent pixel)
      const pngData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const blob = await fetch(`data:image/png;base64,${pngData}`).then(r => r.blob());
      const validFile = new File([blob], 'valid.png', { type: 'image/png' });

      const result = await validateImageUpload(validFile, {
        minWidth: 1,
        minHeight: 1,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateSvgSecurity', () => {
    it('should reject SVG with script tags', async () => {
      const maliciousSvg = new File(
        ['<svg><script>alert("xss")</script></svg>'],
        'malicious.svg',
        { type: 'image/svg+xml' }
      );

      const result = await validateSvgSecurity(maliciousSvg);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('<script>');
    });

    it('should reject SVG with javascript: protocol', async () => {
      const maliciousSvg = new File(
        ['<svg><a href="javascript:alert(1)">click</a></svg>'],
        'malicious.svg',
        { type: 'image/svg+xml' }
      );

      const result = await validateSvgSecurity(maliciousSvg);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('javascript:');
    });

    it('should reject SVG with event handlers', async () => {
      const maliciousSvg = new File(
        ['<svg><rect onclick="alert(1)" /></svg>'],
        'malicious.svg',
        { type: 'image/svg+xml' }
      );

      const result = await validateSvgSecurity(maliciousSvg);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('event handlers');
    });

    it('should accept safe SVG files', async () => {
      const safeSvg = new File(
        ['<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="blue" /></svg>'],
        'safe.svg',
        { type: 'image/svg+xml' }
      );

      const result = await validateSvgSecurity(safeSvg);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension correctly', () => {
      expect(getFileExtension('image.png')).toBe('png');
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('should handle files without extensions', () => {
      expect(getFileExtension('README')).toBe('');
    });

    it('should handle uppercase extensions', () => {
      expect(getFileExtension('IMAGE.PNG')).toBe('png');
    });
  });
});
