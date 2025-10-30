/**
 * Tests for A11yValidator (Task F2)
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { A11yValidator } from '../a11y-validator';

describe('A11yValidator', () => {
  let validator: A11yValidator;

  beforeAll(() => {
    validator = new A11yValidator();
  });

  describe('validate()', () => {
    it('should pass for accessible button component', async () => {
      const code = `
import React from 'react';

export const Button = ({ children, ...props }) => {
  return (
    <button
      style={{
        color: '#000000',
        backgroundColor: '#ffffff',
        padding: '8px 16px',
        fontSize: '16px',
      }}
      {...props}
    >
      {children}
    </button>
  );
};`;

      const result = await validator.validate(code, 'Button');

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    }, 10000); // 10s timeout for browser operations

    it('should detect button-name violations', async () => {
      const code = `
import React from 'react';

export const IconButton = ({ onClick }) => {
  return (
    <button onClick={onClick}>
      <svg><path d="M10 10" /></svg>
    </button>
  );
};`;

      const result = await validator.validate(code, 'IconButton');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const hasButtonNameError = result.errors.some((e: string) =>
        e.includes('button') || e.includes('name') || e.includes('accessible')
      );
      expect(hasButtonNameError).toBe(true);
    }, 10000);

    it('should detect image-alt violations', async () => {
      const code = `
import React from 'react';

export const Logo = () => {
  return <img src="/logo.png" width="100" height="100" />;
};`;

      const result = await validator.validate(code, 'Logo');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const hasImageAltError = result.errors.some((e: string) =>
        e.includes('image') || e.includes('alt')
      );
      expect(hasImageAltError).toBe(true);
    }, 10000);

    it('should validate multiple variants', async () => {
      const code = `
import React from 'react';

export const Button = ({ variant = 'primary', children }) => {
  return (
    <button
      style={{
        backgroundColor: variant === 'primary' ? '#007bff' : '#6c757d',
        color: '#ffffff',
        padding: '8px 16px',
      }}
    >
      {children}
    </button>
  );
};`;

      const result = await validator.validate(code, 'Button', ['primary', 'secondary']);

      expect(result.valid).toBe(true);
    }, 10000);

    it('should handle component errors gracefully', async () => {
      const invalidCode = `
import React from 'react';

export const Broken = () => {
  // Missing return statement
};`;

      const result = await validator.validate(invalidCode, 'Broken');

      // Should not crash, should return validation errors
      expect(result).toBeDefined();
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

      // Should complete well under 2s (2000ms)
      expect(elapsed).toBeLessThan(2000);
    }, 10000);
  });

  describe('error categorization', () => {
    it('should categorize violations by severity', async () => {
      const code = `
import React from 'react';

export const Card = () => {
  return (
    <div>
      <h1>Title</h1>
      <button><svg /></button>
      <span style={{ color: '#ccc', backgroundColor: '#ddd' }}>Low contrast text</span>
    </div>
  );
};`;

      const result = await validator.validate(code, 'Card');

      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    }, 10000);
  });
});
