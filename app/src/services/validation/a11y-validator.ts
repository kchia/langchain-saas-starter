/**
 * Epic 5 Task F2: axe-core Accessibility Validator
 * Uses Playwright to render components and run axe-core accessibility audits
 */

import { chromium, Browser } from '@playwright/test';
import type { ValidationResult, A11yViolation } from './types';

/**
 * axe-core result types
 * Based on axe-core v4.x Result interface
 */
interface AxeResult {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary?: string;
  }>;
}

interface AxeResults {
  violations: AxeResult[];
  incomplete: AxeResult[];
  passes: AxeResult[];
}

/**
 * A11yValidator validates component accessibility using axe-core
 * 
 * WCAG Compliance:
 * - Critical violations: Block component delivery (0 allowed)
 * - Serious violations: Block component delivery (0 allowed)
 * - Moderate violations: Warn only
 * - Minor violations: Warn only
 */
export class A11yValidator {
  private browser: Browser | null = null;

  /**
   * Validate component accessibility
   * 
   * @param componentCode - React component code to validate
   * @param componentName - Name of the component (e.g., 'Button')
   * @param variants - Array of variant names to test (e.g., ['default', 'primary', 'secondary'])
   * @returns ValidationResult with accessibility violations
   */
  async validate(
    componentCode: string,
    componentName: string,
    variants: string[] = ['default']
  ): Promise<ValidationResult> {
    try {
      // Launch headless browser
      this.browser = await chromium.launch({ headless: true });
      const page = await this.browser.newPage();

      // Create test page with component
      const html = this.createTestPage(componentCode, componentName, variants);
      await page.setContent(html);

      // Wait for React to render
      await page.waitForSelector('#root > *', { timeout: 5000 });

      // Inject axe-core library
      await page.addScriptTag({
        url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.0/axe.min.js',
      });

      // Run axe accessibility tests
      const results = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (window as any).axe.run();
      }) as AxeResults;

      await this.browser.close();
      this.browser = null;

      return this.processResults(results);
    } catch (error) {
      // Clean up on error
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      throw error;
    }
  }

  /**
   * Create HTML test page with React component
   */
  private createTestPage(
    componentCode: string,
    componentName: string,
    variants: string[]
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A11y Test - ${componentName}</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <style>
    body {
      margin: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    .test-variant {
      margin: 20px 0;
      padding: 10px;
      border: 1px solid #e0e0e0;
    }
    .variant-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${componentCode}

    // Render component variants for testing
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);

    const variantElements = ${JSON.stringify(variants)}.map((variant) => {
      return React.createElement(
        'div',
        { key: variant, className: 'test-variant' },
        [
          React.createElement('div', { className: 'variant-label' }, \`Variant: \${variant}\`),
          React.createElement(${componentName}, {
            variant: variant,
            children: 'Test Content',
          })
        ]
      );
    });

    root.render(
      React.createElement('div', null, variantElements)
    );
  </script>
</body>
</html>
    `;
  }

  /**
   * Process axe-core results and format into ValidationResult
   */
  private processResults(results: AxeResults): ValidationResult {
    const violations: A11yViolation[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Process violations
    for (const violation of results.violations) {
      // Convert each node in the violation to a separate A11yViolation
      for (const node of violation.nodes) {
        const a11yViolation: A11yViolation = {
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          target: node.target,
          help: violation.help,
          helpUrl: violation.helpUrl,
          html: node.html,
        };

        violations.push(a11yViolation);

        // Categorize by severity
        if (violation.impact === 'critical' || violation.impact === 'serious') {
          // Critical and serious violations block component delivery
          errors.push(
            `[${violation.impact.toUpperCase()}] ${violation.id}: ${violation.help} (${node.target.join(', ')})`
          );
        } else {
          // Moderate and minor violations are warnings
          warnings.push(
            `[${violation.impact.toUpperCase()}] ${violation.id}: ${violation.help} (${node.target.join(', ')})`
          );
        }
      }
    }

    // Component is valid only if there are no critical or serious violations
    const valid = errors.length === 0;

    return {
      valid,
      errors,
      warnings,
      details: {
        violations,
        totalViolations: violations.length,
        violationsBySeverity: {
          critical: violations.filter((v) => v.impact === 'critical').length,
          serious: violations.filter((v) => v.impact === 'serious').length,
          moderate: violations.filter((v) => v.impact === 'moderate').length,
          minor: violations.filter((v) => v.impact === 'minor').length,
        },
        // Include incomplete results for debugging
        incomplete: results.incomplete.map((r) => ({
          id: r.id,
          description: r.description,
          help: r.help,
        })),
      },
    };
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
