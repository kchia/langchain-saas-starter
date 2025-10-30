/**
 * Epic 5 Task F2: axe-core Accessibility Validator
 * Uses Playwright to render components and run axe-core accessibility audits
 */
import type { ValidationResult } from './types';
/**
 * A11yValidator validates component accessibility using axe-core
 *
 * WCAG Compliance:
 * - Critical violations: Block component delivery (0 allowed)
 * - Serious violations: Block component delivery (0 allowed)
 * - Moderate violations: Warn only
 * - Minor violations: Warn only
 */
export declare class A11yValidator {
    private browser;
    /**
     * Validate component accessibility
     *
     * @param componentCode - React component code to validate
     * @param componentName - Name of the component (e.g., 'Button')
     * @param variants - Array of variant names to test (e.g., ['default', 'primary', 'secondary'])
     * @returns ValidationResult with accessibility violations
     */
    validate(componentCode: string, componentName: string, variants?: string[]): Promise<ValidationResult>;
    /**
     * Create HTML test page with React component
     */
    private createTestPage;
    /**
     * Process axe-core results and format into ValidationResult
     */
    private processResults;
    /**
     * Clean up browser resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=a11y-validator.d.ts.map