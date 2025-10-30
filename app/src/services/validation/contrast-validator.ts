/**
 * Epic 5 Task F5: Color Contrast Validator
 * Validates color contrast meets WCAG AA standards
 */

import { chromium, Browser } from '@playwright/test';
import type { ValidationResult, ContrastViolation } from './types';
import { calculateContrastRatio, suggestAccessibleColors } from './utils';

/**
 * ContrastValidator validates color contrast compliance with WCAG AA
 * 
 * WCAG AA Requirements:
 * - Normal text: ≥4.5:1
 * - Large text (≥18pt or ≥14pt bold): ≥3:1
 * - UI components and graphical objects: ≥3:1
 * 
 * Tests all states: default, hover, focus, disabled
 */
export class ContrastValidator {
  private browser: Browser | null = null;

  /**
   * Validate component color contrast
   * 
   * @param componentCode - React component code to validate
   * @param componentName - Name of the component
   * @returns ValidationResult with contrast violations
   */
  async validate(
    componentCode: string,
    componentName: string
  ): Promise<ValidationResult> {
    try {
      this.browser = await chromium.launch({ headless: true });
      const page = await this.browser.newPage();

      const html = this.createTestPage(componentCode, componentName);
      await page.setContent(html);
      await page.waitForSelector('#root > *', { timeout: 5000 });

      const violations: ContrastViolation[] = [];

      // Test default state
      const defaultViolations = await this.testElementContrast(page, 'default');
      violations.push(...defaultViolations);

      // Find interactive elements for state testing
      const hasInteractive = await page.evaluate(() => {
        return !!document.querySelector('button, a, input, [role="button"]');
      });

      if (hasInteractive) {
        // Test hover state
        const hoverViolations = await this.testElementContrast(page, 'hover');
        violations.push(...hoverViolations);

        // Test focus state
        const focusViolations = await this.testElementContrast(page, 'focus');
        violations.push(...focusViolations);

        // Test disabled state
        const disabledViolations = await this.testElementContrast(page, 'disabled');
        violations.push(...disabledViolations);
      }

      await this.browser.close();
      this.browser = null;

      const errors = violations
        .filter((v) => v.actualRatio < v.requiredRatio)
        .map((v) => 
          `${v.type} contrast ${v.actualRatio.toFixed(2)}:1 < ${v.requiredRatio}:1 required (${v.state} state)`
        );

      const warnings = violations
        .filter((v) => v.actualRatio >= v.requiredRatio && v.actualRatio < v.requiredRatio * 1.2)
        .map((v) =>
          `${v.type} contrast ${v.actualRatio.toFixed(2)}:1 is barely passing (${v.state} state)`
        );

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        details: {
          violations,
          totalViolations: violations.length,
          violationsByState: {
            default: violations.filter((v) => v.state === 'default').length,
            hover: violations.filter((v) => v.state === 'hover').length,
            focus: violations.filter((v) => v.state === 'focus').length,
            disabled: violations.filter((v) => v.state === 'disabled').length,
          },
        },
      };
    } catch (error) {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      throw error;
    }
  }

  /**
   * Test element contrast in a specific state
   */
  private async testElementContrast(
    page: import('@playwright/test').Page,
    state: 'default' | 'hover' | 'focus' | 'disabled' | 'active'
  ): Promise<ContrastViolation[]> {
    const violations: ContrastViolation[] = [];

    // Apply state to elements
    if (state === 'hover') {
      await page.evaluate(() => {
        const interactive = document.querySelectorAll('button, a, [role="button"]');
        interactive.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
          }
        });
      });
      // Wait for hover styles to apply
      await page.waitForTimeout(100);
    } else if (state === 'focus') {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    } else if (state === 'disabled') {
      await page.evaluate(() => {
        const interactive = document.querySelectorAll('button, input, select, textarea');
        interactive.forEach((el) => {
          if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) {
            el.disabled = true;
          }
        });
      });
      await page.waitForTimeout(100);
    }

    // Extract text elements and their colors
    const textElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const results: Array<{
        selector: string;
        text: string;
        color: string;
        backgroundColor: string;
        fontSize: string;
        fontWeight: string;
      }> = [];

      elements.forEach((el) => {
        const text = el.textContent?.trim();
        if (!text || text.length === 0) return;

        // Only check text-containing elements
        if (el.children.length === 0 || el.childNodes.length === 1) {
          const computed = window.getComputedStyle(el);
          const color = computed.color;
          const backgroundColor = computed.backgroundColor;

          // Get background from parent if transparent
          let bgColor = backgroundColor;
          if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
            let parent = el.parentElement;
            while (parent && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
              const parentComputed = window.getComputedStyle(parent);
              bgColor = parentComputed.backgroundColor;
              parent = parent.parentElement;
            }
            if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
              bgColor = 'rgb(255, 255, 255)'; // Default to white
            }
          }

          results.push({
            selector: el.tagName.toLowerCase(),
            text: text.substring(0, 50),
            color,
            backgroundColor: bgColor,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
          });
        }
      });

      return results;
    });

    // Check contrast for each text element
    for (const element of textElements) {
      const ratio = calculateContrastRatio(element.color, element.backgroundColor);
      
      if (ratio === null) continue;

      // Determine if text is large
      const fontSize = parseFloat(element.fontSize);
      const fontWeight = parseInt(element.fontWeight);
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);

      const type = isLargeText ? 'large_text' : 'text';
      const requiredRatio = isLargeText ? 3.0 : 4.5;

      if (ratio < requiredRatio) {
        const suggestions = suggestAccessibleColors(
          element.color,
          element.backgroundColor,
          requiredRatio
        );

        violations.push({
          type,
          foreground: element.color,
          background: element.backgroundColor,
          actualRatio: ratio,
          requiredRatio,
          target: element.selector,
          state,
          suggestions,
        });
      }
    }

    // Check UI component contrast (buttons, inputs, etc.)
    const uiElements = await page.evaluate(() => {
      const interactive = document.querySelectorAll('button, input, select, [role="button"]');
      const results: Array<{
        selector: string;
        borderColor: string;
        backgroundColor: string;
        parentBackgroundColor: string;
      }> = [];

      interactive.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const parent = el.parentElement;
        const parentComputed = parent ? window.getComputedStyle(parent) : null;

        results.push({
          selector: el.tagName.toLowerCase(),
          borderColor: computed.borderColor,
          backgroundColor: computed.backgroundColor,
          parentBackgroundColor: parentComputed?.backgroundColor || 'rgb(255, 255, 255)',
        });
      });

      return results;
    });

    // Check UI component contrast (border against background)
    for (const element of uiElements) {
      const ratio = calculateContrastRatio(element.borderColor, element.parentBackgroundColor);

      if (ratio === null) continue;

      const requiredRatio = 3.0; // WCAG AA for UI components

      if (ratio < requiredRatio) {
        violations.push({
          type: 'ui_component',
          foreground: element.borderColor,
          background: element.parentBackgroundColor,
          actualRatio: ratio,
          requiredRatio,
          target: element.selector,
          state,
        });
      }
    }

    return violations;
  }

  /**
   * Create HTML test page with React component
   */
  private createTestPage(componentCode: string, componentName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrast Test - ${componentName}</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <style>
    body {
      margin: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: white;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${componentCode}

    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(${componentName}, { children: 'Test Content' }));
  </script>
</body>
</html>
    `;
  }

  /**
   * Clean up browser resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
