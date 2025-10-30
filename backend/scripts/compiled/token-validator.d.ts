/**
 * Epic 5 Task F6: Token Adherence Validator
 * Validates component uses approved design tokens
 */
import type { ValidationResult, DesignTokens } from './types';
/**
 * TokenValidator validates component adherence to design tokens
 *
 * Checks:
 * - Colors match approved tokens (with ΔE ≤2 tolerance)
 * - Typography uses approved fonts, sizes, and weights
 * - Spacing uses approved values
 *
 * Target: ≥90% adherence overall
 */
export declare class TokenValidator {
    private tokens;
    /**
     * Validate component token adherence
     *
     * @param componentCode - React component code to validate
     * @param componentStyles - Optional: Computed styles from Playwright browser context.
     *                          If provided, uses these instead of parsing code.
     *                          Recommended for accurate style extraction.
     * @param designTokens - Optional: Design tokens to validate against.
     *                       If not provided, uses default fallback tokens.
     *                       In production, pass extracted tokens from Figma/screenshots.
     * @returns ValidationResult with token violations
     */
    validate(componentCode: string, componentStyles?: Record<string, string>, designTokens?: DesignTokens): Promise<ValidationResult>;
    /**
     * Extract styles from component code using regex patterns
     *
     * NOTE: This is a fallback method with limitations:
     * - Only handles inline styles and Tailwind arbitrary values
     * - Does not handle CSS modules, styled-components, or CSS-in-JS
     * - May miss styles from className props or external stylesheets
     *
     * RECOMMENDED: Pass computed styles from Playwright browser context
     * for accurate style extraction instead of relying on this method.
     *
     * @see https://playwright.dev/docs/api/class-page#page-eval-on-selector
     */
    private extractStylesFromCode;
    /**
     * Check color adherence to design tokens
     */
    private checkColorAdherence;
    /**
     * Find matching color token with Delta E calculation
     */
    private findMatchingColorToken;
    /**
     * Check typography adherence
     */
    private checkTypographyAdherence;
    /**
     * Check spacing adherence
     */
    private checkSpacingAdherence;
    /**
     * Calculate adherence scores by category
     */
    private calculateAdherenceScores;
}
//# sourceMappingURL=token-validator.d.ts.map