/**
 * Epic 5 Task F4: Focus Indicator Validator
 * Validates focus indicators are visible and meet WCAG contrast requirements
 */
import type { ValidationResult } from './types';
/**
 * FocusValidator validates focus indicator visibility and contrast
 *
 * Requirements:
 * - Focus indicator must be visible
 * - Focus indicator contrast ≥3:1 against adjacent colors (WCAG 2.1 AA)
 * - Focus indicator not removed with outline: none (without replacement)
 * - Custom focus styles must meet WCAG standards
 */
export declare class FocusValidator {
    private browser;
    /**
     * Validate component focus indicators
     *
     * @param componentCode - React component code to validate
     * @param componentName - Name of the component
     * @returns ValidationResult with focus issues
     */
    validate(componentCode: string, componentName: string): Promise<ValidationResult>;
    /**
     * Check focus indicator contrast ratio
     */
    private checkFocusContrast;
    /**
     * Extract color from box-shadow CSS value
     */
    private extractShadowColor;
    /**
     * Create HTML test page with React component
     */
    private createTestPage;
    /**
     * Clean up browser resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=focus-validator.d.ts.map