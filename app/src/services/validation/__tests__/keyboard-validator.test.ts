/**
 * Tests for KeyboardValidator (Task F3)
 */

import { describe, it, expect } from '@jest/globals';
import { KeyboardValidator } from '../keyboard-validator';

describe('KeyboardValidator', () => {
  let validator: KeyboardValidator;

  beforeAll(() => {
    validator = new KeyboardValidator();
  });

  describe('validate()', () => {
    it('should pass for keyboard accessible button', async () => {
      const code = `
import React from 'react';

export const Button = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};`;

      const result = await validator.validate(code, 'Button', 'button');

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    }, 10000);

    it('should detect non-interactive div used as button', async () => {
      const code = `
import React from 'react';

export const FakeButton = ({ onClick }) => {
  return <div onClick={onClick}>Click me</div>;
};`;

      const result = await validator.validate(code, 'FakeButton', 'button');

      // Should detect keyboard accessibility issues
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }, 10000);

    it('should validate Enter and Space key activation', async () => {
      const code = `
import React from 'react';

export const Button = ({ children, onClick }) => {
  return (
    <button onClick={onClick} type="button">
      {children}
    </button>
  );
};`;

      const result = await validator.validate(code, 'Button', 'button');

      expect(result.valid).toBe(true);
    }, 10000);

    it('should complete within 2s performance target', async () => {
      const code = `
import React from 'react';

export const Button = ({ children }) => {
  return <button>{children}</button>;
};`;

      const start = Date.now();
      await validator.validate(code, 'Button', 'button');
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(2000);
    }, 10000);
  });
});
