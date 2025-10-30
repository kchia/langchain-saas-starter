"use strict";
/**
 * Epic 5 Task F4: Focus Indicator Validator
 * Validates focus indicators are visible and meet WCAG contrast requirements
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusValidator = void 0;
const test_1 = require("@playwright/test");
const utils_1 = require("./utils");
/**
 * FocusValidator validates focus indicator visibility and contrast
 *
 * Requirements:
 * - Focus indicator must be visible
 * - Focus indicator contrast ≥3:1 against adjacent colors (WCAG 2.1 AA)
 * - Focus indicator not removed with outline: none (without replacement)
 * - Custom focus styles must meet WCAG standards
 */
class FocusValidator {
    constructor() {
        this.browser = null;
    }
    /**
     * Validate component focus indicators
     *
     * @param componentCode - React component code to validate
     * @param componentName - Name of the component
     * @returns ValidationResult with focus issues
     */
    async validate(componentCode, componentName) {
        try {
            this.browser = await test_1.chromium.launch({ headless: true });
            const page = await this.browser.newPage();
            const html = this.createTestPage(componentCode, componentName);
            await page.setContent(html);
            await page.waitForSelector('#root > *', { timeout: 5000 });
            const issues = [];
            // Find all focusable elements
            const focusableElements = await page.evaluate(() => {
                const elements = document.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                return Array.from(elements).map((el) => ({
                    tagName: el.tagName,
                    index: Array.from(el.parentElement?.children || []).indexOf(el),
                }));
            });
            if (focusableElements.length === 0) {
                // No focusable elements - not necessarily an issue
                return {
                    valid: true,
                    errors: [],
                    warnings: [],
                    details: {
                        message: 'No focusable elements found',
                    },
                };
            }
            // Test each focusable element
            for (let i = 0; i < focusableElements.length; i++) {
                // Focus element using Tab
                await page.keyboard.press('Tab');
                // Get computed styles when focused
                const focusStyles = await page.evaluate(() => {
                    const el = document.activeElement;
                    if (!el)
                        return null;
                    const computed = window.getComputedStyle(el);
                    const parent = el.parentElement;
                    const parentComputed = parent ? window.getComputedStyle(parent) : null;
                    return {
                        // Focus indicator styles
                        outline: computed.outline,
                        outlineWidth: computed.outlineWidth,
                        outlineStyle: computed.outlineStyle,
                        outlineColor: computed.outlineColor,
                        outlineOffset: computed.outlineOffset,
                        // Box shadow (commonly used for custom focus)
                        boxShadow: computed.boxShadow,
                        // Border (sometimes used for focus)
                        border: computed.border,
                        borderColor: computed.borderColor,
                        borderWidth: computed.borderWidth,
                        // Colors for contrast calculation
                        backgroundColor: computed.backgroundColor,
                        color: computed.color,
                        // Parent background for contrast
                        parentBackgroundColor: parentComputed?.backgroundColor || 'white',
                        // Element info
                        tagName: el.tagName,
                    };
                });
                if (!focusStyles) {
                    issues.push({
                        type: 'focus_failure',
                        message: `Failed to focus element ${i + 1}`,
                        severity: 'critical',
                    });
                    continue;
                }
                // Check for focus indicator
                const hasOutline = focusStyles.outlineWidth !== '0px' && focusStyles.outlineStyle !== 'none';
                const hasBoxShadow = focusStyles.boxShadow !== 'none';
                const hasBorder = focusStyles.borderWidth !== '0px';
                const hasVisibleIndicator = hasOutline || hasBoxShadow || hasBorder;
                if (!hasVisibleIndicator) {
                    issues.push({
                        type: 'missing_focus_indicator',
                        message: `No visible focus indicator on ${focusStyles.tagName.toLowerCase()} element`,
                        severity: 'critical',
                        styles: {
                            outline: focusStyles.outline,
                            boxShadow: focusStyles.boxShadow,
                            border: focusStyles.border,
                        },
                    });
                    continue;
                }
                // Check contrast if indicator present
                const contrastIssues = this.checkFocusContrast(focusStyles);
                issues.push(...contrastIssues);
            }
            await this.browser.close();
            this.browser = null;
            const errors = issues
                .filter((i) => i.severity === 'critical')
                .map((i) => `${i.type}: ${i.message}`);
            const warnings = issues
                .filter((i) => i.severity === 'serious')
                .map((i) => `${i.type}: ${i.message}`);
            return {
                valid: errors.length === 0,
                errors,
                warnings,
                details: {
                    issues,
                    totalIssues: issues.length,
                    focusableElementsCount: focusableElements.length,
                    issuesByType: {
                        missing_focus_indicator: issues.filter((i) => i.type === 'missing_focus_indicator').length,
                        insufficient_focus_contrast: issues.filter((i) => i.type === 'insufficient_focus_contrast').length,
                        outline_removed: issues.filter((i) => i.type === 'outline_removed').length,
                    },
                },
            };
        }
        catch (error) {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
            throw error;
        }
    }
    /**
     * Check focus indicator contrast ratio
     */
    checkFocusContrast(styles) {
        const issues = [];
        // Extract indicator color (outline or box-shadow)
        let indicatorColor = null;
        if (styles.outlineColor && styles.outlineWidth !== '0px') {
            indicatorColor = styles.outlineColor;
        }
        else if (styles.boxShadow !== 'none') {
            // Extract color from box-shadow
            indicatorColor = this.extractShadowColor(styles.boxShadow);
        }
        else if (styles.borderColor && styles.borderWidth !== '0px') {
            indicatorColor = styles.borderColor;
        }
        if (!indicatorColor) {
            // Could not determine indicator color
            return issues;
        }
        // Calculate contrast against background
        const backgroundColor = styles.backgroundColor || styles.parentBackgroundColor;
        const contrastRatio = (0, utils_1.calculateContrastRatio)(indicatorColor, backgroundColor);
        if (contrastRatio !== null && contrastRatio < 3.0) {
            issues.push({
                type: 'insufficient_focus_contrast',
                message: `Focus indicator contrast ${contrastRatio.toFixed(2)}:1 is below 3:1 minimum (WCAG 2.1 AA)`,
                severity: 'serious',
                actual: contrastRatio,
                required: 3.0,
                styles: {
                    indicatorColor,
                    backgroundColor,
                },
            });
        }
        return issues;
    }
    /**
     * Extract color from box-shadow CSS value
     */
    extractShadowColor(boxShadow) {
        // box-shadow format: "0 0 0 3px rgb(59, 130, 246)"
        // or "rgb(59, 130, 246) 0px 0px 0px 3px"
        const rgbMatch = boxShadow.match(/rgba?\([^)]+\)/);
        if (rgbMatch) {
            return rgbMatch[0];
        }
        // Try hex format
        const hexMatch = boxShadow.match(/#[0-9a-fA-F]{3,6}/);
        if (hexMatch) {
            return hexMatch[0];
        }
        return null;
    }
    /**
     * Create HTML test page with React component
     */
    createTestPage(componentCode, componentName) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Focus Test - ${componentName}</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <style>
    body {
      margin: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: white;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${componentCode}

    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(${componentName}, { children: 'Test Content' }));
  </script>
</body>
</html>
    `;
    }
    /**
     * Clean up browser resources
     */
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
exports.FocusValidator = FocusValidator;
//# sourceMappingURL=focus-validator.js.map