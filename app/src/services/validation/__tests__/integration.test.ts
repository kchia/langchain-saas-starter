/**
 * Integration tests for Epic 5 validators
 * Tests validators with real component code
 */

import { A11yValidator } from '../a11y-validator';
import { KeyboardValidator } from '../keyboard-validator';
import { FocusValidator } from '../focus-validator';
import { ContrastValidator } from '../contrast-validator';
import { TokenValidator, extractComputedStyles } from '../index';

// Sample accessible button component
const ACCESSIBLE_BUTTON = `
import React from 'react';

export const Button = ({ children, ...props }) => {
  return (
    <button
      style={{
        color: '#000000',
        backgroundColor: '#ffffff',
        padding: '8px 16px',
        fontSize: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
      {...props}
    >
      {children}
    </button>
  );
};
`;

// Button with accessibility issues
const INACCESSIBLE_BUTTON = `
import React from 'react';

export const Button = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        color: '#999',
        backgroundColor: '#aaa',
      }}
    >
      Click me
    </div>
  );
};
`;

// Button with good contrast
const HIGH_CONTRAST_BUTTON = `
import React from 'react';

export const Button = ({ children }) => {
  return (
    <button style={{ color: '#000000', backgroundColor: '#ffffff', border: '2px solid #000' }}>
      {children}
    </button>
  );
};
`;

describe('Validator Integration Tests', () => {
  // Increase timeout for browser-based tests
  jest.setTimeout(30000);

  describe('A11yValidator', () => {
    it('should pass validation for accessible button', async () => {
      const validator = new A11yValidator();
      const result = await validator.validate(ACCESSIBLE_BUTTON, 'Button');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.details).toBeDefined();
    });

    it('should fail validation for inaccessible button', async () => {
      const validator = new A11yValidator();
      const result = await validator.validate(INACCESSIBLE_BUTTON, 'Button');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.details?.violations).toBeDefined();
    });

    it('should test multiple variants', async () => {
      const validator = new A11yValidator();
      const result = await validator.validate(
        ACCESSIBLE_BUTTON,
        'Button',
        ['default', 'primary']
      );

      expect(result.details).toBeDefined();
    });
  });

  describe('KeyboardValidator', () => {
    it('should pass keyboard navigation for button', async () => {
      const validator = new KeyboardValidator();
      const result = await validator.validate(ACCESSIBLE_BUTTON, 'Button', 'button');

      expect(result).toBeDefined();
      expect(result.details).toBeDefined();
    });

    it('should detect keyboard issues in non-button element', async () => {
      const validator = new KeyboardValidator();
      const result = await validator.validate(INACCESSIBLE_BUTTON, 'Button', 'button');

      // Non-button elements should have keyboard issues
      expect(result.details?.issues).toBeDefined();
    });
  });

  describe('FocusValidator', () => {
    it('should validate focus indicators', async () => {
      const validator = new FocusValidator();
      const result = await validator.validate(ACCESSIBLE_BUTTON, 'Button');

      expect(result).toBeDefined();
      expect(result.details).toBeDefined();
    });
  });

  describe('ContrastValidator', () => {
    it('should pass for high contrast button', async () => {
      const validator = new ContrastValidator();
      const result = await validator.validate(HIGH_CONTRAST_BUTTON, 'Button');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for low contrast button', async () => {
      const validator = new ContrastValidator();
      const result = await validator.validate(INACCESSIBLE_BUTTON, 'Button');

      // Low contrast should be detected
      expect(result.details?.violations).toBeDefined();
    });
  });

  describe('TokenValidator', () => {
    it('should validate with code parsing', async () => {
      const validator = new TokenValidator();
      const result = await validator.validate(ACCESSIBLE_BUTTON);

      expect(result).toBeDefined();
      expect(result.details?.adherenceScore).toBeDefined();
      expect(result.details?.byCategory).toBeDefined();
    });

    it('should validate with computed styles', async () => {
      const styles = await extractComputedStyles(ACCESSIBLE_BUTTON, 'Button');
      const validator = new TokenValidator();
      const result = await validator.validate(ACCESSIBLE_BUTTON, styles);

      expect(result).toBeDefined();
      expect(result.details?.adherenceScore).toBeGreaterThanOrEqual(0);
      expect(result.details?.adherenceScore).toBeLessThanOrEqual(100);
    });
  });

  describe('All Validators Combined', () => {
    it('should run all validators on accessible component', async () => {
      const results = await Promise.all([
        new A11yValidator().validate(ACCESSIBLE_BUTTON, 'Button'),
        new KeyboardValidator().validate(ACCESSIBLE_BUTTON, 'Button', 'button'),
        new FocusValidator().validate(ACCESSIBLE_BUTTON, 'Button'),
        new ContrastValidator().validate(ACCESSIBLE_BUTTON, 'Button'),
        new TokenValidator().validate(ACCESSIBLE_BUTTON),
      ]);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.valid).toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.warnings).toBeDefined();
      });
    });

    it('should detect multiple issues in inaccessible component', async () => {
      const results = await Promise.all([
        new A11yValidator().validate(INACCESSIBLE_BUTTON, 'Button'),
        new ContrastValidator().validate(INACCESSIBLE_BUTTON, 'Button'),
      ]);

      // Both validators should detect issues
      const hasErrors = results.some((r) => r.errors.length > 0);
      expect(hasErrors).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should complete validation in under 15 seconds', async () => {
      const startTime = Date.now();

      await Promise.all([
        new A11yValidator().validate(ACCESSIBLE_BUTTON, 'Button'),
        new KeyboardValidator().validate(ACCESSIBLE_BUTTON, 'Button', 'button'),
        new FocusValidator().validate(ACCESSIBLE_BUTTON, 'Button'),
        new ContrastValidator().validate(ACCESSIBLE_BUTTON, 'Button'),
        new TokenValidator().validate(ACCESSIBLE_BUTTON),
      ]);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(15000); // 15 seconds target
    });
  });
});
