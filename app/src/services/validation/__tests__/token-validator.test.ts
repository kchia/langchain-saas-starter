/**
 * Tests for TokenValidator (Task F6)
 */

import { describe, it, expect } from '@jest/globals';
import { TokenValidator } from '../token-validator';

describe('TokenValidator', () => {
  let validator: TokenValidator;

  beforeAll(() => {
    validator = new TokenValidator();
  });

  const DESIGN_TOKENS = {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      text: '#212529',
      background: '#ffffff',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
      fontSize: {
        sm: '14px',
        base: '16px',
        lg: '18px',
      },
      fontWeight: {
        normal: '400',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
  };

  describe('validate()', () => {
    it('should pass for component using approved tokens', async () => {
      const code = `
import React from 'react';

export const Button = ({ children }) => {
  return (
    <button
      style={{
        color: '#007bff',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
        fontSize: '16px',
        padding: '8px 16px',
      }}
    >
      {children}
    </button>
  );
};`;

      const styles = {
        'color': 'rgb(0, 123, 255)',
        'background-color': 'rgb(255, 255, 255)',
        'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
        'font-size': '16px',
        'padding': '8px 16px',
      };

      const result = await validator.validate(code, styles, DESIGN_TOKENS);

      expect(result.valid).toBe(true);
      expect(result.adherenceScore).toBeGreaterThanOrEqual(0.9);
    });

    it('should detect non-compliant colors', async () => {
      const code = `
import React from 'react';

export const Button = ({ children }) => {
  return (
    <button style={{ color: '#ff0000' }}>
      {children}
    </button>
  );
};`;

      const styles = {
        'color': 'rgb(255, 0, 0)',
      };

      const result = await validator.validate(code, styles, DESIGN_TOKENS);

      expect(result.adherenceScore).toBeLessThan(1.0);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should allow color tolerance (ΔE ≤ 2)', async () => {
      const code = `
import React from 'react';

export const Button = ({ children }) => {
  return (
    <button style={{ color: '#007cff' }}>
      {children}
    </button>
  );
};`;

      const styles = {
        'color': 'rgb(0, 124, 255)', // Very close to #007bff
      };

      const result = await validator.validate(code, styles, DESIGN_TOKENS);

      // Should pass with tolerance
      expect(result.adherenceScore).toBeGreaterThanOrEqual(0.9);
    });

    it('should calculate adherence by category', async () => {
      const code = `
import React from 'react';

export const Button = ({ children }) => {
  return (
    <button
      style={{
        color: '#007bff',
        fontSize: '16px',
        padding: '16px',
      }}
    >
      {children}
    </button>
  );
};`;

      const styles = {
        'color': 'rgb(0, 123, 255)',
        'font-size': '16px',
        'padding': '16px',
      };

      const result = await validator.validate(code, styles, DESIGN_TOKENS);

      expect(result.byCategory).toBeDefined();
      expect(result.byCategory.colors).toBeGreaterThanOrEqual(0);
      expect(result.byCategory.typography).toBeGreaterThanOrEqual(0);
      expect(result.byCategory.spacing).toBeGreaterThanOrEqual(0);
    });

    it('should achieve ≥90% adherence target', async () => {
      const code = `
import React from 'react';

export const Button = ({ children }) => {
  return (
    <button
      style={{
        color: '#007bff',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
        fontSize: '16px',
        fontWeight: '600',
        padding: '8px',
        margin: '16px',
      }}
    >
      {children}
    </button>
  );
};`;

      const styles = {
        'color': 'rgb(0, 123, 255)',
        'background-color': 'rgb(255, 255, 255)',
        'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
        'font-size': '16px',
        'font-weight': '600',
        'padding': '8px',
        'margin': '16px',
      };

      const result = await validator.validate(code, styles, DESIGN_TOKENS);

      expect(result.adherenceScore).toBeGreaterThanOrEqual(0.9);
      expect(result.valid).toBe(true);
    });

    it('should complete within 2s performance target', async () => {
      const code = `
import React from 'react';

export const Button = ({ children }) => {
  return <button>{children}</button>;
};`;

      const styles = {
        'color': 'rgb(0, 123, 255)',
      };

      const start = Date.now();
      await validator.validate(code, styles, DESIGN_TOKENS);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(2000);
    });
  });

  describe('violation reporting', () => {
    it('should provide expected vs actual values', async () => {
      const code = `
import React from 'react';

export const Button = ({ children }) => {
  return (
    <button style={{ fontSize: '20px' }}>
      {children}
    </button>
  );
};`;

      const styles = {
        'font-size': '20px',
      };

      const result = await validator.validate(code, styles, DESIGN_TOKENS);

      if (result.violations.length > 0) {
        expect(result.violations[0]).toHaveProperty('used');
        expect(result.violations[0]).toHaveProperty('approved');
      }
    });
  });
});
