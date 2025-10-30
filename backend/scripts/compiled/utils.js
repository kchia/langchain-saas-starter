"use strict";
/**
 * WCAG utility functions for accessibility validation
 * Implements WCAG 2.1 contrast ratio calculations and color utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseColor = parseColor;
exports.getRelativeLuminance = getRelativeLuminance;
exports.getContrastRatio = getContrastRatio;
exports.calculateContrastRatio = calculateContrastRatio;
exports.meetsWCAGAA = meetsWCAGAA;
exports.meetsWCAGAAA = meetsWCAGAAA;
exports.calculateDeltaE = calculateDeltaE;
exports.calculateDeltaEFromStrings = calculateDeltaEFromStrings;
exports.formatContrastRatio = formatContrastRatio;
exports.rgbToHex = rgbToHex;
exports.lightenColor = lightenColor;
exports.darkenColor = darkenColor;
exports.suggestAccessibleColors = suggestAccessibleColors;
/**
 * Parse CSS color string to RGB
 * Supports: hex (#fff, #ffffff), rgb(r, g, b), rgba(r, g, b, a)
 */
function parseColor(color) {
    // Remove whitespace
    const cleaned = color.trim().toLowerCase();
    // Hex format: #fff or #ffffff
    if (cleaned.charAt(0) === '#') {
        const hex = cleaned.substring(1);
        if (hex.length === 3) {
            // Short hex: #abc -> #aabbcc
            return {
                r: parseInt(hex[0] + hex[0], 16),
                g: parseInt(hex[1] + hex[1], 16),
                b: parseInt(hex[2] + hex[2], 16),
            };
        }
        else if (hex.length === 6) {
            // Full hex: #aabbcc
            return {
                r: parseInt(hex.substring(0, 2), 16),
                g: parseInt(hex.substring(2, 4), 16),
                b: parseInt(hex.substring(4, 6), 16),
            };
        }
    }
    // RGB/RGBA format: rgb(255, 255, 255) or rgba(255, 255, 255, 0.5)
    const rgbMatch = cleaned.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1], 10),
            g: parseInt(rgbMatch[2], 10),
            b: parseInt(rgbMatch[3], 10),
        };
    }
    // Named colors - common ones
    const namedColors = {
        white: { r: 255, g: 255, b: 255 },
        black: { r: 0, g: 0, b: 0 },
        red: { r: 255, g: 0, b: 0 },
        green: { r: 0, g: 128, b: 0 },
        blue: { r: 0, g: 0, b: 255 },
        gray: { r: 128, g: 128, b: 128 },
        silver: { r: 192, g: 192, b: 192 },
    };
    if (cleaned in namedColors) {
        return namedColors[cleaned];
    }
    return null;
}
/**
 * Calculate relative luminance according to WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(color) {
    // Convert 8-bit RGB values to 0-1 range
    const rsRGB = color.r / 255;
    const gsRGB = color.g / 255;
    const bsRGB = color.b / 255;
    // Apply gamma correction
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    // Calculate relative luminance using WCAG formula
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/**
 * Calculate contrast ratio between two colors according to WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 *
 * @returns Contrast ratio (1:1 to 21:1)
 */
function getContrastRatio(foreground, background) {
    const l1 = getRelativeLuminance(foreground);
    const l2 = getRelativeLuminance(background);
    // WCAG formula: (L1 + 0.05) / (L2 + 0.05)
    // where L1 is the lighter color and L2 is the darker color
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}
/**
 * Calculate contrast ratio from color strings
 * Convenience wrapper around getContrastRatio
 */
function calculateContrastRatio(foreground, background) {
    const fg = parseColor(foreground);
    const bg = parseColor(background);
    if (!fg || !bg) {
        return null;
    }
    return getContrastRatio(fg, bg);
}
/**
 * Check if contrast ratio meets WCAG AA standards
 */
function meetsWCAGAA(ratio, type) {
    switch (type) {
        case 'normal_text':
            return ratio >= 4.5;
        case 'large_text':
            // Large text is ≥18pt or ≥14pt bold
            return ratio >= 3.0;
        case 'ui_component':
            // UI components and graphical objects
            return ratio >= 3.0;
        default:
            return false;
    }
}
/**
 * Check if contrast ratio meets WCAG AAA standards
 */
function meetsWCAGAAA(ratio, type) {
    switch (type) {
        case 'normal_text':
            return ratio >= 7.0;
        case 'large_text':
            return ratio >= 4.5;
        case 'ui_component':
            // AAA doesn't have different requirements for UI components
            return ratio >= 3.0;
        default:
            return false;
    }
}
/**
 * Calculate Delta E (color difference) using CIE76 formula
 * Used for token adherence validation (Task F6)
 *
 * @returns Delta E value (0 = identical, >2 = noticeable difference)
 */
function calculateDeltaE(color1, color2) {
    // Convert RGB to LAB color space (simplified)
    // For production, consider using a proper color library
    // Simple RGB distance as approximation
    // For accurate Delta E, we'd need full RGB -> XYZ -> LAB conversion
    const deltaR = color1.r - color2.r;
    const deltaG = color1.g - color2.g;
    const deltaB = color1.b - color2.b;
    // Weighted Euclidean distance (approximation)
    const rmean = (color1.r + color2.r) / 2;
    const r = deltaR;
    const g = deltaG;
    const b = deltaB;
    const weightR = 2 + rmean / 256;
    const weightG = 4.0;
    const weightB = 2 + (255 - rmean) / 256;
    return Math.sqrt(weightR * r * r + weightG * g * g + weightB * b * b) / 255 * 100;
}
/**
 * Calculate Delta E from color strings
 */
function calculateDeltaEFromStrings(color1, color2) {
    const c1 = parseColor(color1);
    const c2 = parseColor(color2);
    if (!c1 || !c2) {
        return null;
    }
    return calculateDeltaE(c1, c2);
}
/**
 * Format contrast ratio for display
 */
function formatContrastRatio(ratio) {
    return `${ratio.toFixed(2)}:1`;
}
/**
 * Convert RGB to hex string
 */
function rgbToHex(color) {
    const toHex = (n) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}
/**
 * Lighten a color by a percentage (0-100)
 */
function lightenColor(color, percent) {
    const amount = percent / 100;
    return {
        r: Math.min(255, color.r + (255 - color.r) * amount),
        g: Math.min(255, color.g + (255 - color.g) * amount),
        b: Math.min(255, color.b + (255 - color.b) * amount),
    };
}
/**
 * Darken a color by a percentage (0-100)
 */
function darkenColor(color, percent) {
    const amount = percent / 100;
    return {
        r: Math.max(0, color.r * (1 - amount)),
        g: Math.max(0, color.g * (1 - amount)),
        b: Math.max(0, color.b * (1 - amount)),
    };
}
/**
 * Suggest alternative colors that meet WCAG AA contrast requirements
 */
function suggestAccessibleColors(foreground, background, targetRatio = 4.5) {
    const fg = parseColor(foreground);
    const bg = parseColor(background);
    if (!fg || !bg) {
        return [];
    }
    const suggestions = [];
    // Try darkening foreground
    for (let i = 10; i <= 90; i += 10) {
        const darkened = darkenColor(fg, i);
        const ratio = getContrastRatio(darkened, bg);
        if (ratio >= targetRatio) {
            suggestions.push({
                foreground: rgbToHex(darkened),
                ratio,
            });
            break;
        }
    }
    // Try lightening foreground
    for (let i = 10; i <= 90; i += 10) {
        const lightened = lightenColor(fg, i);
        const ratio = getContrastRatio(lightened, bg);
        if (ratio >= targetRatio) {
            suggestions.push({
                foreground: rgbToHex(lightened),
                ratio,
            });
            break;
        }
    }
    // Try darkening background
    for (let i = 10; i <= 90; i += 10) {
        const darkened = darkenColor(bg, i);
        const ratio = getContrastRatio(fg, darkened);
        if (ratio >= targetRatio) {
            suggestions.push({
                background: rgbToHex(darkened),
                ratio,
            });
            break;
        }
    }
    // Try lightening background
    for (let i = 10; i <= 90; i += 10) {
        const lightened = lightenColor(bg, i);
        const ratio = getContrastRatio(fg, lightened);
        if (ratio >= targetRatio) {
            suggestions.push({
                background: rgbToHex(lightened),
                ratio,
            });
            break;
        }
    }
    return suggestions.slice(0, 3); // Return top 3 suggestions
}
//# sourceMappingURL=utils.js.map