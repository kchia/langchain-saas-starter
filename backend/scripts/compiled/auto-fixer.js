"use strict";
/**
 * Extended Auto-Fixer for Epic 5 validation issues
 * Extends Epic 4.5 auto-fix with accessibility and token fixes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedAutoFixer = void 0;
class ExtendedAutoFixer {
    /**
     * Attempt to automatically fix validation issues
     */
    async fix(code, violations) {
        let fixedCode = code;
        const fixed = [];
        const unfixed = [];
        // Fix accessibility issues
        if (violations.a11y && violations.a11y.length > 0) {
            const { code: a11yFixed, fixes, unfixable } = await this.fixA11y(fixedCode, violations.a11y);
            fixedCode = a11yFixed;
            fixed.push(...fixes);
            unfixed.push(...unfixable);
        }
        // Generate diff (simplified)
        const diff = this.generateDiff(code, fixedCode);
        return {
            success: fixed.length > 0,
            code: fixedCode,
            fixed,
            unfixed,
            diff,
        };
    }
    /**
     * Fix accessibility violations
     */
    async fixA11y(code, violations) {
        let fixedCode = code;
        const fixes = [];
        const unfixable = [];
        for (const violation of violations) {
            if (violation.id === 'button-name') {
                // Fix missing button text/aria-label
                const result = this.fixButtonName(fixedCode);
                if (result.fixed) {
                    fixedCode = result.code;
                    fixes.push({
                        type: 'accessibility',
                        description: 'Added aria-label to button without accessible name',
                    });
                }
                else {
                    unfixable.push({
                        type: 'accessibility',
                        description: 'Button missing accessible name',
                        suggestion: 'Add text content or aria-label attribute to the button',
                    });
                }
            }
            else if (violation.id === 'link-name') {
                // Fix missing link text/aria-label
                const result = this.fixLinkName(fixedCode);
                if (result.fixed) {
                    fixedCode = result.code;
                    fixes.push({
                        type: 'accessibility',
                        description: 'Added aria-label to link without accessible name',
                    });
                }
                else {
                    unfixable.push({
                        type: 'accessibility',
                        description: 'Link missing accessible name',
                        suggestion: 'Add text content or aria-label attribute to the link',
                    });
                }
            }
            else if (violation.id === 'image-alt') {
                // Fix missing alt text on images
                const result = this.fixImageAlt(fixedCode);
                if (result.fixed) {
                    fixedCode = result.code;
                    fixes.push({
                        type: 'accessibility',
                        description: 'Added alt attribute to image',
                    });
                }
                else {
                    unfixable.push({
                        type: 'accessibility',
                        description: 'Image missing alt text',
                        suggestion: 'Add descriptive alt attribute to the image element',
                    });
                }
            }
            else {
                // Other violations we can't auto-fix
                unfixable.push({
                    type: 'accessibility',
                    description: violation.description,
                    suggestion: violation.help,
                });
            }
        }
        return { code: fixedCode, fixes, unfixable };
    }
    /**
     * Fix button-name violation by adding aria-label
     *
     * Note: This uses a simplified regex approach. For production use, consider
     * using a proper JSX/TSX parser like @babel/parser or typescript compiler API
     * to avoid edge cases with arrow functions and complex JSX expressions.
     */
    fixButtonName(code) {
        // Match <button> opening tags
        // Known limitation: May incorrectly match > inside arrow functions in attributes
        const buttonPattern = /<button\s+([^>]*?)>/gi;
        let fixed = false;
        const fixedCode = code.replace(buttonPattern, (match, attributes) => {
            // Only add aria-label if not already present
            if (!attributes.includes('aria-label')) {
                fixed = true;
                // Ensure proper spacing before the new attribute
                const trimmedAttrs = attributes.trim();
                const space = trimmedAttrs ? ' ' : '';
                return `<button ${trimmedAttrs}${space}aria-label="Button">`;
            }
            return match;
        });
        return { fixed, code: fixedCode };
    }
    /**
     * Fix link-name violation by adding aria-label
     *
     * Note: Uses simplified regex. For production, use a proper JSX parser.
     */
    fixLinkName(code) {
        // Match <a> opening tags
        const linkPattern = /<a\s+([^>]*?)>/gi;
        let fixed = false;
        const fixedCode = code.replace(linkPattern, (match, attributes) => {
            // Only add aria-label if not already present and no children prop
            if (!attributes.includes('aria-label') && !attributes.includes('children')) {
                fixed = true;
                const trimmedAttrs = attributes.trim();
                const space = trimmedAttrs ? ' ' : '';
                return `<a ${trimmedAttrs}${space}aria-label="Link">`;
            }
            return match;
        });
        return { fixed, code: fixedCode };
    }
    /**
     * Fix image-alt violation by adding alt attribute
     *
     * Note: Uses simplified regex. For production, use a proper JSX parser.
     */
    fixImageAlt(code) {
        // Match <img> tags
        const imgPattern = /<img\s+([^>]*?)>/gi;
        let fixed = false;
        const fixedCode = code.replace(imgPattern, (match, attributes) => {
            // Only add alt if not already present
            if (!attributes.includes('alt')) {
                fixed = true;
                // Extract src if available for better alt text
                const srcMatch = attributes.match(/src=["']([^"']+)["']/);
                const altText = srcMatch ? `Image: ${srcMatch[1].split('/').pop()}` : 'Image';
                const trimmedAttrs = attributes.trim();
                const space = trimmedAttrs ? ' ' : '';
                return `<img ${trimmedAttrs}${space}alt="${altText}">`;
            }
            return match;
        });
        return { fixed, code: fixedCode };
    }
    /**
     * Generate a simple diff between original and fixed code
     */
    generateDiff(original, fixed) {
        if (original === fixed) {
            return 'No changes';
        }
        const originalLines = original.split('\n');
        const fixedLines = fixed.split('\n');
        const diff = [];
        const maxLines = Math.max(originalLines.length, fixedLines.length);
        for (let i = 0; i < maxLines; i++) {
            const origLine = originalLines[i] || '';
            const fixedLine = fixedLines[i] || '';
            if (origLine !== fixedLine) {
                if (origLine) {
                    diff.push(`- ${origLine}`);
                }
                if (fixedLine) {
                    diff.push(`+ ${fixedLine}`);
                }
            }
        }
        return diff.join('\n');
    }
    /**
     * Calculate auto-fix success rate
     */
    calculateSuccessRate(result) {
        const totalIssues = result.fixed.length + result.unfixed.length;
        if (totalIssues === 0)
            return 1.0;
        return result.fixed.length / totalIssues;
    }
}
exports.ExtendedAutoFixer = ExtendedAutoFixer;
//# sourceMappingURL=auto-fixer.js.map