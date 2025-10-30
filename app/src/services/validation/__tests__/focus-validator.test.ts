/**
 * Tests for FocusValidator (Task F4)
 */

import { describe, it, expect } from '@jest/globals';
import { FocusValidator } from '../focus-validator';

describe('FocusValidator', () => {
  let validator: FocusValidator;

  beforeAll(() => {
    validator = new FocusValidator();
  });

  describe('validate()', () => {
    it('should pass for button with visible focus indicator', async () => {
      const code = `
import React from 'react';

export const Button = ({ children }) => {
  return (
    <button
      style={{
        outline: '2px solid #0066cc',
        outlineOffset: '2px',
      }}
    >
      {children}
    </button>
  );
};`;

      const result = await validator.validate(code, 'Button');

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    }, 10000);

    it('should detect missing focus indicator', async () => {
      const code = `
import React from 'react';

export const Button = ({ children }) => {
  return (
    <button style={{ outline: 'none' }}>
      {children}
    </button>
  );
};`;

      const result = await validator.validate(code, 'Button');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }, 10000);

    it('should detect insufficient focus contrast', async () => {
      const code = `
import React from 'react';

export const Button = ({ children }) => {
  return (
    <button
      style={{
        backgroundColor: '#f0f0f0',
        outline: '1px solid #f0f0f0',
      }}
    >
      {children}
    </button>
  );
};`;

      const result = await validator.validate(code, 'Button');

      // Should detect insufficient contrast (< 3:1)
      expect(result.valid).toBe(false);
    }, 10000);

    it('should complete within 2s performance target', async () => {
      const code = `
import React from 'react';

export const Button = ({ children }) => {
  return <button>{children}</button>;
};`;

      const start = Date.now();
      await validator.validate(code, 'Button');
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(2000);
    }, 10000);
  });
});
