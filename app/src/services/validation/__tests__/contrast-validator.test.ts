/**
 * Tests for ContrastValidator (Task F5)
 */

import { describe, it, expect } from '@jest/globals';
import { ContrastValidator } from '../contrast-validator';

describe('ContrastValidator', () => {
  let validator: ContrastValidator;

  beforeAll(() => {
    validator = new ContrastValidator();
  });

  describe('validate()', () => {
    it('should pass for text with sufficient contrast', async () => {
      const code = `
import React from 'react';

export const Text = () => {
  return (
    <p style={{ color: '#000000', backgroundColor: '#ffffff' }}>
      Black text on white background (21:1 ratio)
    </p>
  );
};`;

      const result = await validator.validate(code, 'Text');

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    }, 10000);

    it('should detect insufficient contrast', async () => {
      const code = `
import React from 'react';

export const Text = () => {
  return (
    <p style={{ color: '#999999', backgroundColor: '#aaaaaa' }}>
      Low contrast text
    </p>
  );
};`;

      const result = await validator.validate(code, 'Text');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }, 10000);

    it('should validate WCAG AA standards (4.5:1 for normal text)', async () => {
      const code = `
import React from 'react';

export const Text = () => {
  return (
    <p style={{ color: '#767676', backgroundColor: '#ffffff' }}>
      Text with exactly 4.5:1 contrast
    </p>
  );
};`;

      const result = await validator.validate(code, 'Text');

      // Should pass WCAG AA (4.5:1 for normal text)
      expect(result.valid).toBe(true);
    }, 10000);

    it('should validate large text standard (3:1)', async () => {
      const code = `
import React from 'react';

export const LargeText = () => {
  return (
    <h1 style={{ fontSize: '24px', color: '#949494', backgroundColor: '#ffffff' }}>
      Large heading with 3:1 contrast
    </h1>
  );
};`;

      const result = await validator.validate(code, 'LargeText');

      // Should pass WCAG AA for large text (3:1)
      expect(result.valid).toBe(true);
    }, 10000);

    it('should complete within 2s performance target', async () => {
      const code = `
import React from 'react';

export const Text = () => {
  return <p style={{ color: '#000', backgroundColor: '#fff' }}>Text</p>;
};`;

      const start = Date.now();
      await validator.validate(code, 'Text');
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(2000);
    }, 10000);
  });
});
