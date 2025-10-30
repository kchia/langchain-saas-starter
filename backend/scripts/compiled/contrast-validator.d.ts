/**
 * Epic 5 Task F5: Color Contrast Validator
 * Validates color contrast meets WCAG AA standards
 */
import type { ValidationResult } from './types';
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
export declare class ContrastValidator {
    private browser;
    /**
     * Validate component color contrast
     *
     * @param componentCode - React component code to validate
     * @param componentName - Name of the component
     * @returns ValidationResult with contrast violations
     */
    validate(componentCode: string, componentName: string): Promise<ValidationResult>;
    /**
     * Test element contrast in a specific state
     */
    private testElementContrast;
    /**
     * Create HTML test page with React component
     */
    private createTestPage;
    /**
     * Clean up browser resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=contrast-validator.d.ts.map