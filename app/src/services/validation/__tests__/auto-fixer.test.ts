/**
 * Tests for ExtendedAutoFixer (Task I1)
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { ExtendedAutoFixer } from '../auto-fixer';
import type { A11yViolation } from '../types';

describe('ExtendedAutoFixer', () => {
  let fixer: ExtendedAutoFixer;

  beforeAll(() => {
    fixer = new ExtendedAutoFixer();
  });

  describe('fix()', () => {
    it('should return success false when no violations', async () => {
      const result = await fixer.fix('const Button = () => <button>Click</button>;', {});

      expect(result.success).toBe(false);
      expect(result.fixed.length).toBe(0);
      expect(result.unfixed.length).toBe(0);
    });

    it('should fix button-name violations', async () => {
      const code = `
const IconButton = () => (
  <button onClick={() => {}}>
    <svg><path d="..." /></svg>
  </button>
);`;

      const violations: A11yViolation[] = [
        {
          id: 'button-name',
          impact: 'critical',
          description: 'Buttons must have discernible text',
          target: ['button'],
          help: 'Add text content or aria-label',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/button-name',
        },
      ];

      const result = await fixer.fix(code, { a11y: violations });

      expect(result.success).toBe(true);
      expect(result.fixed.length).toBeGreaterThan(0);
      expect(result.fixed[0].type).toBe('accessibility');
      expect(result.fixed[0].description).toContain('aria-label');
      expect(result.code).toContain('aria-label="Button"');
    });

    it('should fix link-name violations', async () => {
      const code = `
const IconLink = () => (
  <a href="/home">
    <svg><path d="..." /></svg>
  </a>
);`;

      const violations: A11yViolation[] = [
        {
          id: 'link-name',
          impact: 'critical',
          description: 'Links must have discernible text',
          target: ['a'],
          help: 'Add text content or aria-label',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/link-name',
        },
      ];

      const result = await fixer.fix(code, { a11y: violations });

      expect(result.success).toBe(true);
      expect(result.fixed.length).toBeGreaterThan(0);
      expect(result.code).toContain('aria-label="Link"');
    });

    it('should fix image-alt violations', async () => {
      const code = `
const Logo = () => (
  <img src="/logo.png" />
);`;

      const violations: A11yViolation[] = [
        {
          id: 'image-alt',
          impact: 'critical',
          description: 'Images must have alternate text',
          target: ['img'],
          help: 'Add alt attribute',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/image-alt',
        },
      ];

      const result = await fixer.fix(code, { a11y: violations });

      expect(result.success).toBe(true);
      expect(result.fixed.length).toBeGreaterThan(0);
      expect(result.code).toContain('alt=');
      expect(result.code).toMatch(/alt="[^"]+"/);
    });

    it('should handle unfixable violations', async () => {
      const code = `const Component = () => <div>Test</div>;`;

      const violations: A11yViolation[] = [
        {
          id: 'color-contrast',
          impact: 'serious',
          description: 'Text color contrast is insufficient',
          target: ['div'],
          help: 'Ensure text has sufficient contrast',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/color-contrast',
        },
      ];

      const result = await fixer.fix(code, { a11y: violations });

      expect(result.unfixed.length).toBeGreaterThan(0);
      expect(result.unfixed[0].type).toBe('accessibility');
      expect(result.unfixed[0].suggestion).toBeTruthy();
    });

    it('should generate diff when code changes', async () => {
      const code = '<button>Test</button>';
      const violations: A11yViolation[] = [
        {
          id: 'button-name',
          impact: 'critical',
          description: 'Buttons must have discernible text',
          target: ['button'],
          help: 'Add text content or aria-label',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/button-name',
        },
      ];

      const result = await fixer.fix(code, { a11y: violations });

      expect(result.diff).toBeTruthy();
      expect(result.diff).not.toBe('No changes');
      expect(result.diff).toContain('+');
      expect(result.diff).toContain('aria-label');
    });

    it('should return "No changes" diff when code unchanged', async () => {
      const code = `const Component = () => <div>Test</div>;`;
      
      const result = await fixer.fix(code, {});

      expect(result.diff).toBe('No changes');
    });
  });

  describe('calculateSuccessRate()', () => {
    it('should return 1.0 when all issues fixed', () => {
      const result = {
        success: true,
        fixed: [
          { type: 'a11y', description: 'Fixed button-name' },
          { type: 'a11y', description: 'Fixed link-name' },
        ],
        unfixed: [],
        diff: '',
      };

      const rate = fixer.calculateSuccessRate(result);
      expect(rate).toBe(1.0);
    });

    it('should return 0.0 when no issues fixed', () => {
      const result = {
        success: false,
        fixed: [],
        unfixed: [
          { type: 'a11y', description: 'Unfixable', suggestion: 'Manual fix' },
        ],
        diff: '',
      };

      const rate = fixer.calculateSuccessRate(result);
      expect(rate).toBe(0.0);
    });

    it('should return 0.5 when half fixed', () => {
      const result = {
        success: true,
        fixed: [{ type: 'a11y', description: 'Fixed' }],
        unfixed: [{ type: 'a11y', description: 'Unfixable', suggestion: 'Fix manually' }],
        diff: '',
      };

      const rate = fixer.calculateSuccessRate(result);
      expect(rate).toBe(0.5);
    });

    it('should return 1.0 when no issues at all', () => {
      const result = {
        success: true,
        fixed: [],
        unfixed: [],
        diff: '',
      };

      const rate = fixer.calculateSuccessRate(result);
      expect(rate).toBe(1.0);
    });

    it('should calculate 80% success rate correctly', () => {
      const result = {
        success: true,
        fixed: [
          { type: 'a11y', description: 'Fix 1' },
          { type: 'a11y', description: 'Fix 2' },
          { type: 'a11y', description: 'Fix 3' },
          { type: 'a11y', description: 'Fix 4' },
        ],
        unfixed: [{ type: 'a11y', description: 'Unfixable', suggestion: 'Manual' }],
        diff: '',
      };

      const rate = fixer.calculateSuccessRate(result);
      expect(rate).toBe(0.8);
    });
  });

  describe('integration with multiple violation types', () => {
    it('should fix multiple accessibility violations', async () => {
      const code = `
const Component = () => (
  <div>
    <button><svg /></button>
    <a href="/test"><svg /></a>
    <img src="/test.png" />
  </div>
);`;

      const violations: A11yViolation[] = [
        {
          id: 'button-name',
          impact: 'critical',
          description: 'Button needs name',
          target: ['button'],
          help: 'Add aria-label',
          helpUrl: 'https://example.com',
        },
        {
          id: 'link-name',
          impact: 'critical',
          description: 'Link needs name',
          target: ['a'],
          help: 'Add aria-label',
          helpUrl: 'https://example.com',
        },
        {
          id: 'image-alt',
          impact: 'critical',
          description: 'Image needs alt',
          target: ['img'],
          help: 'Add alt',
          helpUrl: 'https://example.com',
        },
      ];

      const result = await fixer.fix(code, { a11y: violations });

      expect(result.success).toBe(true);
      expect(result.fixed.length).toBe(3);
      expect(result.code).toContain('aria-label="Button"');
      expect(result.code).toContain('aria-label="Link"');
      expect(result.code).toMatch(/alt="[^"]+"/);
    });

    it('should meet 80%+ auto-fix success rate target', async () => {
      const violations: A11yViolation[] = [
        // Fixable violations (80%)
        { id: 'button-name', impact: 'critical', description: '', target: [''], help: '', helpUrl: '' },
        { id: 'link-name', impact: 'critical', description: '', target: [''], help: '', helpUrl: '' },
        { id: 'image-alt', impact: 'critical', description: '', target: [''], help: '', helpUrl: '' },
        { id: 'button-name', impact: 'critical', description: '', target: [''], help: '', helpUrl: '' },
        // Unfixable violations (20%)
        { id: 'color-contrast', impact: 'serious', description: '', target: [''], help: '', helpUrl: '' },
      ];

      const result = await fixer.fix('<div />', { a11y: violations });

      const successRate = fixer.calculateSuccessRate(result);
      expect(successRate).toBeGreaterThanOrEqual(0.8);
    });
  });
});
