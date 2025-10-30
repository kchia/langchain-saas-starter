/**
 * Extended Auto-Fixer for Epic 5 validation issues
 * Extends Epic 4.5 auto-fix with accessibility and token fixes
 */
import type { AutoFixResult, A11yViolation } from './types';
export declare class ExtendedAutoFixer {
    /**
     * Attempt to automatically fix validation issues
     */
    fix(code: string, violations: {
        a11y?: A11yViolation[];
        keyboard?: any[];
        focus?: any[];
        contrast?: any[];
        tokens?: any[];
    }): Promise<AutoFixResult>;
    /**
     * Fix accessibility violations
     */
    private fixA11y;
    /**
     * Fix button-name violation by adding aria-label
     *
     * Note: This uses a simplified regex approach. For production use, consider
     * using a proper JSX/TSX parser like @babel/parser or typescript compiler API
     * to avoid edge cases with arrow functions and complex JSX expressions.
     */
    private fixButtonName;
    /**
     * Fix link-name violation by adding aria-label
     *
     * Note: Uses simplified regex. For production, use a proper JSX parser.
     */
    private fixLinkName;
    /**
     * Fix image-alt violation by adding alt attribute
     *
     * Note: Uses simplified regex. For production, use a proper JSX parser.
     */
    private fixImageAlt;
    /**
     * Generate a simple diff between original and fixed code
     */
    private generateDiff;
    /**
     * Calculate auto-fix success rate
     */
    calculateSuccessRate(result: AutoFixResult): number;
}
//# sourceMappingURL=auto-fixer.d.ts.map