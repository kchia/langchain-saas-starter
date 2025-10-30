"use strict";
/**
 * Epic 5 Task F3: Keyboard Navigation Validator
 * Tests keyboard accessibility including Tab, Enter, Space, Escape, and Arrow keys
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardValidator = void 0;
const test_1 = require("@playwright/test");
/**
 * KeyboardValidator tests component keyboard navigation
 *
 * Tests:
 * - Tab navigation through interactive elements
 * - Correct tab order
 * - Enter/Space activation for buttons
 * - Escape key for dismissible components
 * - Arrow keys for navigation (tabs, select, etc.)
 * - Focus trap detection
 * - Keyboard trap detection
 */
class KeyboardValidator {
    constructor() {
        this.browser = null;
    }
    /**
     * Validate component keyboard navigation
     *
     * @param componentCode - React component code to validate
     * @param componentName - Name of the component
     * @param componentType - Type of component (button, input, modal, etc.)
     * @returns ValidationResult with keyboard issues
     */
    async validate(componentCode, componentName, componentType = 'general') {
        try {
            this.browser = await test_1.chromium.launch({ headless: true });
            const page = await this.browser.newPage();
            const html = this.createTestPage(componentCode, componentName);
            await page.setContent(html);
            await page.waitForSelector('#root > *', { timeout: 5000 });
            const issues = [];
            // Test Tab navigation
            const tabIssues = await this.testTabNavigation(page, componentType);
            issues.push(...tabIssues);
            // Test activation keys (Enter/Space) for buttons and links
            if (['button', 'link'].includes(componentType)) {
                const activationIssues = await this.testActivation(page);
                issues.push(...activationIssues);
            }
            // Test Escape for dismissible components
            if (['modal', 'dialog', 'dropdown'].includes(componentType)) {
                const escapeIssues = await this.testEscapeKey(page);
                issues.push(...escapeIssues);
            }
            // Test Arrow keys for navigation components
            if (['tabs', 'select', 'dropdown'].includes(componentType)) {
                const arrowIssues = await this.testArrowKeys(page, componentType);
                issues.push(...arrowIssues);
            }
            await this.browser.close();
            this.browser = null;
            // Categorize issues
            const errors = issues
                .filter((i) => i.severity === 'critical')
                .map((i) => `${i.type}: ${i.message}`);
            const warnings = issues
                .filter((i) => i.severity === 'serious' || i.severity === 'moderate')
                .map((i) => `${i.type}: ${i.message}`);
            return {
                valid: errors.length === 0,
                errors,
                warnings,
                details: {
                    issues,
                    totalIssues: issues.length,
                    issuesByType: {
                        tab_navigation: issues.filter((i) => i.type === 'tab_navigation').length,
                        keyboard_activation: issues.filter((i) => i.type === 'keyboard_activation').length,
                        escape_key: issues.filter((i) => i.type === 'escape_key').length,
                        keyboard_trap: issues.filter((i) => i.type === 'keyboard_trap').length,
                        tab_order: issues.filter((i) => i.type === 'tab_order').length,
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
     * Test Tab key navigation
     */
    async testTabNavigation(page, componentType) {
        const issues = [];
        // Get all focusable elements before tabbing
        const focusableCount = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
            return elements.length;
        });
        if (focusableCount === 0) {
            // No focusable elements found
            if (['button', 'input', 'link'].includes(componentType)) {
                issues.push({
                    type: 'tab_navigation',
                    message: `No focusable elements found in ${componentType} component`,
                    severity: 'critical',
                });
            }
            return issues;
        }
        // Press Tab to focus first element
        await page.keyboard.press('Tab');
        // Check if an element received focus
        const focusedElement = await page.evaluate(() => {
            const el = document.activeElement;
            return {
                tagName: el?.tagName,
                type: el?.getAttribute('type'),
                role: el?.getAttribute('role'),
                tabIndex: el?.getAttribute('tabindex'),
            };
        });
        // Validate focus behavior based on component type
        if (componentType === 'button' && focusedElement.tagName !== 'BUTTON') {
            if (focusedElement.role !== 'button') {
                issues.push({
                    type: 'tab_navigation',
                    message: 'Button component not focusable with Tab key',
                    severity: 'critical',
                    expected: 'BUTTON element or role="button"',
                    actual: focusedElement.tagName || 'none',
                });
            }
        }
        // Test tab order if multiple focusable elements
        if (focusableCount > 1) {
            const tabOrderIssues = await this.testTabOrder(page, focusableCount);
            issues.push(...tabOrderIssues);
        }
        return issues;
    }
    /**
     * Test correct tab order
     */
    async testTabOrder(page, focusableCount) {
        const issues = [];
        const focusedElements = [];
        // Tab through all focusable elements
        for (let i = 0; i < focusableCount; i++) {
            const focused = await page.evaluate(() => {
                const el = document.activeElement;
                return el?.outerHTML?.substring(0, 100) || '';
            });
            focusedElements.push(focused);
            if (i < focusableCount - 1) {
                await page.keyboard.press('Tab');
            }
        }
        // Check for keyboard trap (focus cycles properly)
        await page.keyboard.press('Tab');
        const afterLastTab = await page.evaluate(() => {
            return document.activeElement?.tagName;
        });
        // If still focused on last element, might be a trap
        if (afterLastTab === focusedElements[focusedElements.length - 1]) {
            issues.push({
                type: 'keyboard_trap',
                message: 'Potential keyboard trap detected - focus does not move beyond last element',
                severity: 'serious',
            });
        }
        return issues;
    }
    /**
     * Test Enter and Space key activation
     */
    async testActivation(page) {
        const issues = [];
        // Setup click listener
        await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.clickCount = 0;
            const buttons = document.querySelectorAll('button, [role="button"], a');
            buttons.forEach((el) => {
                el.addEventListener('click', () => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    window.clickCount++;
                });
            });
        });
        // Focus first interactive element
        await page.keyboard.press('Tab');
        // Test Enter key
        await page.keyboard.press('Enter');
        const enterClicked = await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return window.clickCount > 0;
        });
        if (!enterClicked) {
            issues.push({
                type: 'keyboard_activation',
                message: 'Element not activated by Enter key',
                severity: 'serious',
                expected: 'Click event on Enter',
                actual: 'No click event',
            });
        }
        // Reset and test Space key (for buttons, not links)
        await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.clickCount = 0;
        });
        const isButton = await page.evaluate(() => {
            const el = document.activeElement;
            return el?.tagName === 'BUTTON' || el?.getAttribute('role') === 'button';
        });
        if (isButton) {
            await page.keyboard.press('Space');
            const spaceClicked = await page.evaluate(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return window.clickCount > 0;
            });
            if (!spaceClicked) {
                issues.push({
                    type: 'keyboard_activation',
                    message: 'Button not activated by Space key',
                    severity: 'serious',
                    expected: 'Click event on Space',
                    actual: 'No click event',
                });
            }
        }
        return issues;
    }
    /**
     * Test Escape key for dismissible components
     */
    async testEscapeKey(page) {
        const issues = [];
        // Check if component has dismissible UI (dialog, modal, dropdown)
        const hasDismissible = await page.evaluate(() => {
            return !!document.querySelector('[role="dialog"], [role="alertdialog"], [aria-modal="true"]');
        });
        if (!hasDismissible) {
            // Not applicable if no dismissible UI
            return issues;
        }
        // Check initial visibility
        const initiallyVisible = await page.evaluate(() => {
            const dialog = document.querySelector('[role="dialog"], [role="alertdialog"]');
            return dialog?.getAttribute('aria-hidden') !== 'true';
        });
        if (initiallyVisible) {
            // Press Escape
            await page.keyboard.press('Escape');
            // Check if dismissed
            const afterEscape = await page.evaluate(() => {
                const dialog = document.querySelector('[role="dialog"], [role="alertdialog"]');
                return dialog?.getAttribute('aria-hidden') === 'true' || !document.body.contains(dialog);
            });
            if (!afterEscape) {
                issues.push({
                    type: 'escape_key',
                    message: 'Dismissible component not closed by Escape key',
                    severity: 'serious',
                    expected: 'Component dismissed on Escape',
                    actual: 'Component still visible',
                });
            }
        }
        return issues;
    }
    /**
     * Test Arrow key navigation for tabs, selects, etc.
     */
    async testArrowKeys(page, componentType) {
        const issues = [];
        // Focus first element
        await page.keyboard.press('Tab');
        // Test arrow navigation (Right/Down and Left/Up)
        if (componentType === 'tabs') {
            // Test Right Arrow
            await page.keyboard.press('ArrowRight');
            const afterRight = await page.evaluate(() => {
                const el = document.activeElement;
                return {
                    focused: !!el,
                    selected: el?.getAttribute('aria-selected') === 'true',
                };
            });
            if (!afterRight.focused) {
                issues.push({
                    type: 'tab_navigation',
                    message: 'Arrow key navigation not working for tabs',
                    severity: 'moderate',
                    expected: 'Focus moves on ArrowRight',
                    actual: 'Focus unchanged',
                });
            }
        }
        return issues;
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
  <title>Keyboard Test - ${componentName}</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <style>
    body {
      margin: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
exports.KeyboardValidator = KeyboardValidator;
//# sourceMappingURL=keyboard-validator.js.map