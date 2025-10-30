"use strict";
/**
 * Epic 5 Task F6: Token Adherence Validator
 * Validates component uses approved design tokens
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenValidator = void 0;
const utils_1 = require("./utils");
/**
 * Default design tokens used as fallback when no tokens are provided
 * In production, design tokens are extracted from Figma/screenshots per-request
 * and passed to the validate() method
 */
const DESIGN_TOKENS = {
    colors: {
        // Primary colors
        'primary': '#3b82f6',
        'primary-hover': '#2563eb',
        'primary-focus': '#1d4ed8',
        // Secondary colors
        'secondary': '#64748b',
        'secondary-hover': '#475569',
        // Text colors
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
        'text-muted': '#94a3b8',
        // Background colors
        'bg-primary': '#ffffff',
        'bg-secondary': '#f8fafc',
        'bg-tertiary': '#f1f5f9',
        // Border colors
        'border-default': '#e2e8f0',
        'border-muted': '#f1f5f9',
        // Status colors
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
    },
    typography: {
        // Font families
        'font-sans': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        'font-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        // Font sizes
        'text-xs': '12px',
        'text-sm': '14px',
        'text-base': '16px',
        'text-lg': '18px',
        'text-xl': '20px',
        'text-2xl': '24px',
        // Font weights
        'font-normal': '400',
        'font-medium': '500',
        'font-semibold': '600',
        'font-bold': '700',
        // Line heights
        'leading-tight': '1.25',
        'leading-normal': '1.5',
        'leading-relaxed': '1.75',
    },
    spacing: {
        // Padding/Margin
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        // Gap
        'gap-1': '4px',
        'gap-2': '8px',
        'gap-3': '12px',
        'gap-4': '16px',
    },
};
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
class TokenValidator {
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
    async validate(componentCode, componentStyles, designTokens) {
        // Use provided tokens or fall back to defaults
        this.tokens = designTokens || DESIGN_TOKENS;
        const violations = [];
        // Prefer provided computed styles over code parsing
        // Computed styles from browser are more accurate than regex parsing
        const styles = componentStyles || this.extractStylesFromCode(componentCode);
        // Check color adherence
        const colorViolations = this.checkColorAdherence(styles);
        violations.push(...colorViolations);
        // Check typography adherence
        const typographyViolations = this.checkTypographyAdherence(styles);
        violations.push(...typographyViolations);
        // Check spacing adherence
        const spacingViolations = this.checkSpacingAdherence(styles);
        violations.push(...spacingViolations);
        // Calculate adherence scores
        const adherenceScores = this.calculateAdherenceScores(violations, styles);
        const errors = [];
        const warnings = [];
        // Overall adherence must be ≥90%
        if (adherenceScores.overall < 90) {
            errors.push(`Token adherence ${adherenceScores.overall.toFixed(1)}% is below 90% target`);
        }
        // Warn for categories below 90%
        if (adherenceScores.byCategory.colors < 90) {
            warnings.push(`Color adherence ${adherenceScores.byCategory.colors.toFixed(1)}% is below target`);
        }
        if (adherenceScores.byCategory.typography < 90) {
            warnings.push(`Typography adherence ${adherenceScores.byCategory.typography.toFixed(1)}% is below target`);
        }
        if (adherenceScores.byCategory.spacing < 90) {
            warnings.push(`Spacing adherence ${adherenceScores.byCategory.spacing.toFixed(1)}% is below target`);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            details: {
                violations,
                adherenceScore: adherenceScores.overall,
                byCategory: adherenceScores.byCategory,
                totalChecks: adherenceScores.totalChecks,
                passedChecks: adherenceScores.passedChecks,
            },
        };
    }
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
    extractStylesFromCode(componentCode) {
        const styles = {};
        // Extract inline styles from style={{ }}
        const styleMatches = componentCode.matchAll(/style=\{\{([^}]+)\}\}/g);
        for (const match of styleMatches) {
            const styleContent = match[1];
            const properties = styleContent.split(',');
            for (const prop of properties) {
                const [key, value] = prop.split(':').map((s) => s.trim());
                if (key && value) {
                    // Convert camelCase to kebab-case
                    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                    styles[cssKey] = value.replace(/['"]/g, '');
                }
            }
        }
        // Extract Tailwind-style colors from className
        const colorClasses = componentCode.matchAll(/(?:bg|text|border)-\[([^\]]+)\]/g);
        for (const match of colorClasses) {
            const color = match[1];
            if (match[0].startsWith('bg-')) {
                styles['background-color'] = color;
            }
            else if (match[0].startsWith('text-')) {
                styles['color'] = color;
            }
            else if (match[0].startsWith('border-')) {
                styles['border-color'] = color;
            }
        }
        return styles;
    }
    /**
     * Check color adherence to design tokens
     */
    checkColorAdherence(styles) {
        const violations = [];
        const colorProperties = ['color', 'background-color', 'border-color'];
        for (const prop of colorProperties) {
            const value = styles[prop];
            if (!value)
                continue;
            // Check if color matches any token (with Delta E tolerance)
            const matchedToken = this.findMatchingColorToken(value);
            if (!matchedToken) {
                violations.push({
                    category: 'color',
                    property: prop,
                    expected: 'Design token color',
                    actual: value,
                    target: prop,
                    withinTolerance: false,
                });
            }
            else if (matchedToken.deltaE > 2.0) {
                // Within tolerance if ΔE ≤ 2.0
                violations.push({
                    category: 'color',
                    property: prop,
                    expected: matchedToken.tokenValue,
                    actual: value,
                    target: prop,
                    deltaE: matchedToken.deltaE,
                    withinTolerance: false,
                });
            }
        }
        return violations;
    }
    /**
     * Find matching color token with Delta E calculation
     */
    findMatchingColorToken(color) {
        let bestMatch = null;
        let lowestDeltaE = Infinity;
        for (const [tokenName, tokenValue] of Object.entries(this.tokens.colors)) {
            const deltaE = (0, utils_1.calculateDeltaEFromStrings)(color, tokenValue);
            if (deltaE === null)
                continue;
            if (deltaE < lowestDeltaE) {
                lowestDeltaE = deltaE;
                bestMatch = { tokenName, tokenValue, deltaE };
            }
            // Exact match (or very close)
            if (deltaE <= 0.1) {
                return bestMatch;
            }
        }
        return bestMatch;
    }
    /**
     * Check typography adherence
     */
    checkTypographyAdherence(styles) {
        const violations = [];
        // Check font family
        if (styles['font-family']) {
            const matched = Object.values(this.tokens.typography)
                .filter((v) => v.includes(','))
                .some((tokenValue) => styles['font-family'] === tokenValue);
            if (!matched) {
                violations.push({
                    category: 'typography',
                    property: 'font-family',
                    expected: this.tokens.typography['font-sans'] || 'system-ui, sans-serif',
                    actual: styles['font-family'],
                    target: 'font-family',
                    withinTolerance: false,
                });
            }
        }
        // Check font size
        if (styles['font-size']) {
            const matched = Object.values(this.tokens.typography)
                .filter((v) => v.includes('px'))
                .includes(styles['font-size']);
            if (!matched) {
                violations.push({
                    category: 'typography',
                    property: 'font-size',
                    expected: 'Design token font size',
                    actual: styles['font-size'],
                    target: 'font-size',
                    withinTolerance: false,
                });
            }
        }
        // Check font weight
        if (styles['font-weight']) {
            const matched = Object.values(this.tokens.typography).includes(styles['font-weight']);
            if (!matched) {
                violations.push({
                    category: 'typography',
                    property: 'font-weight',
                    expected: 'Design token font weight',
                    actual: styles['font-weight'],
                    target: 'font-weight',
                    withinTolerance: false,
                });
            }
        }
        return violations;
    }
    /**
     * Check spacing adherence
     */
    checkSpacingAdherence(styles) {
        const violations = [];
        const spacingProperties = ['padding', 'margin', 'gap', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right'];
        for (const prop of spacingProperties) {
            const value = styles[prop];
            if (!value)
                continue;
            const matched = Object.values(this.tokens.spacing).includes(value);
            if (!matched) {
                violations.push({
                    category: 'spacing',
                    property: prop,
                    expected: 'Design token spacing value',
                    actual: value,
                    target: prop,
                    withinTolerance: false,
                });
            }
        }
        return violations;
    }
    /**
     * Calculate adherence scores by category
     */
    calculateAdherenceScores(violations, styles) {
        const totalProps = Object.keys(styles).length;
        const totalViolations = violations.filter((v) => !v.withinTolerance).length;
        const totalChecks = Math.max(totalProps, 1);
        const passedChecks = totalChecks - totalViolations;
        const colorChecks = Object.keys(styles).filter((k) => k.includes('color') || k === 'background').length;
        const colorViolations = violations.filter((v) => v.category === 'color' && !v.withinTolerance).length;
        const colorScore = colorChecks > 0 ? ((colorChecks - colorViolations) / colorChecks) * 100 : 100;
        const typographyChecks = Object.keys(styles).filter((k) => k.includes('font') || k.includes('text') || k.includes('leading')).length;
        const typographyViolations = violations.filter((v) => v.category === 'typography' && !v.withinTolerance).length;
        const typographyScore = typographyChecks > 0
            ? ((typographyChecks - typographyViolations) / typographyChecks) * 100
            : 100;
        const spacingChecks = Object.keys(styles).filter((k) => k.includes('padding') || k.includes('margin') || k.includes('gap')).length;
        const spacingViolations = violations.filter((v) => v.category === 'spacing' && !v.withinTolerance).length;
        const spacingScore = spacingChecks > 0
            ? ((spacingChecks - spacingViolations) / spacingChecks) * 100
            : 100;
        const overall = (passedChecks / totalChecks) * 100;
        return {
            overall,
            byCategory: {
                colors: colorScore,
                typography: typographyScore,
                spacing: spacingScore,
            },
            totalChecks,
            passedChecks,
        };
    }
}
exports.TokenValidator = TokenValidator;
//# sourceMappingURL=token-validator.js.map