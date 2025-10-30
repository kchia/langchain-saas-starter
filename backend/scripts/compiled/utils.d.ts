/**
 * WCAG utility functions for accessibility validation
 * Implements WCAG 2.1 contrast ratio calculations and color utilities
 */
/**
 * RGB color representation
 */
export interface RGBColor {
    r: number;
    g: number;
    b: number;
}
/**
 * Parse CSS color string to RGB
 * Supports: hex (#fff, #ffffff), rgb(r, g, b), rgba(r, g, b, a)
 */
export declare function parseColor(color: string): RGBColor | null;
/**
 * Calculate relative luminance according to WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export declare function getRelativeLuminance(color: RGBColor): number;
/**
 * Calculate contrast ratio between two colors according to WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 *
 * @returns Contrast ratio (1:1 to 21:1)
 */
export declare function getContrastRatio(foreground: RGBColor, background: RGBColor): number;
/**
 * Calculate contrast ratio from color strings
 * Convenience wrapper around getContrastRatio
 */
export declare function calculateContrastRatio(foreground: string, background: string): number | null;
/**
 * Check if contrast ratio meets WCAG AA standards
 */
export declare function meetsWCAGAA(ratio: number, type: 'normal_text' | 'large_text' | 'ui_component'): boolean;
/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export declare function meetsWCAGAAA(ratio: number, type: 'normal_text' | 'large_text' | 'ui_component'): boolean;
/**
 * Calculate Delta E (color difference) using CIE76 formula
 * Used for token adherence validation (Task F6)
 *
 * @returns Delta E value (0 = identical, >2 = noticeable difference)
 */
export declare function calculateDeltaE(color1: RGBColor, color2: RGBColor): number;
/**
 * Calculate Delta E from color strings
 */
export declare function calculateDeltaEFromStrings(color1: string, color2: string): number | null;
/**
 * Format contrast ratio for display
 */
export declare function formatContrastRatio(ratio: number): string;
/**
 * Convert RGB to hex string
 */
export declare function rgbToHex(color: RGBColor): string;
/**
 * Lighten a color by a percentage (0-100)
 */
export declare function lightenColor(color: RGBColor, percent: number): RGBColor;
/**
 * Darken a color by a percentage (0-100)
 */
export declare function darkenColor(color: RGBColor, percent: number): RGBColor;
/**
 * Suggest alternative colors that meet WCAG AA contrast requirements
 */
export declare function suggestAccessibleColors(foreground: string, background: string, targetRatio?: number): Array<{
    foreground?: string;
    background?: string;
    ratio: number;
}>;
//# sourceMappingURL=utils.d.ts.map