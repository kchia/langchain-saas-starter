/**
 * Epic 5: Extended Quality Validation & Accessibility Testing
 * Validation service exports
 */
export type { ValidationResult, A11yViolation, KeyboardIssue, FocusIssue, ContrastViolation, TokenViolation, DesignTokens, AutoFixResult, ValidationReport, } from './types';
export { parseColor, getRelativeLuminance, getContrastRatio, calculateContrastRatio, meetsWCAGAA, meetsWCAGAAA, calculateDeltaE, calculateDeltaEFromStrings, formatContrastRatio, rgbToHex, lightenColor, darkenColor, suggestAccessibleColors, } from './utils';
export type { RGBColor } from './utils';
export { A11yValidator } from './a11y-validator';
export { KeyboardValidator } from './keyboard-validator';
export { FocusValidator } from './focus-validator';
export { ContrastValidator } from './contrast-validator';
export { TokenValidator } from './token-validator';
export { ExtendedAutoFixer } from './auto-fixer';
export { getSharedBrowser, releaseSharedBrowser, closeSharedBrowser, runValidatorsInParallel, } from './browser-pool';
/**
 * Helper function to extract computed styles from a component using Playwright
 * This provides more accurate style extraction than regex parsing
 *
 * @param componentCode - React component code
 * @param componentName - Component name
 * @returns Computed styles object suitable for TokenValidator
 *
 * @example
 * ```typescript
 * import { extractComputedStyles, TokenValidator } from '@/services/validation';
 *
 * const styles = await extractComputedStyles(componentCode, 'Button');
 * const validator = new TokenValidator();
 * const result = await validator.validate(componentCode, styles);
 * ```
 */
export declare function extractComputedStyles(componentCode: string, componentName: string): Promise<Record<string, string>>;
//# sourceMappingURL=index.d.ts.map