"use strict";
/**
 * Epic 5: Extended Quality Validation & Accessibility Testing
 * Validation service exports
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runValidatorsInParallel = exports.closeSharedBrowser = exports.releaseSharedBrowser = exports.getSharedBrowser = exports.ExtendedAutoFixer = exports.TokenValidator = exports.ContrastValidator = exports.FocusValidator = exports.KeyboardValidator = exports.A11yValidator = exports.suggestAccessibleColors = exports.darkenColor = exports.lightenColor = exports.rgbToHex = exports.formatContrastRatio = exports.calculateDeltaEFromStrings = exports.calculateDeltaE = exports.meetsWCAGAAA = exports.meetsWCAGAA = exports.calculateContrastRatio = exports.getContrastRatio = exports.getRelativeLuminance = exports.parseColor = void 0;
exports.extractComputedStyles = extractComputedStyles;
// Export WCAG utilities
var utils_1 = require("./utils");
Object.defineProperty(exports, "parseColor", { enumerable: true, get: function () { return utils_1.parseColor; } });
Object.defineProperty(exports, "getRelativeLuminance", { enumerable: true, get: function () { return utils_1.getRelativeLuminance; } });
Object.defineProperty(exports, "getContrastRatio", { enumerable: true, get: function () { return utils_1.getContrastRatio; } });
Object.defineProperty(exports, "calculateContrastRatio", { enumerable: true, get: function () { return utils_1.calculateContrastRatio; } });
Object.defineProperty(exports, "meetsWCAGAA", { enumerable: true, get: function () { return utils_1.meetsWCAGAA; } });
Object.defineProperty(exports, "meetsWCAGAAA", { enumerable: true, get: function () { return utils_1.meetsWCAGAAA; } });
Object.defineProperty(exports, "calculateDeltaE", { enumerable: true, get: function () { return utils_1.calculateDeltaE; } });
Object.defineProperty(exports, "calculateDeltaEFromStrings", { enumerable: true, get: function () { return utils_1.calculateDeltaEFromStrings; } });
Object.defineProperty(exports, "formatContrastRatio", { enumerable: true, get: function () { return utils_1.formatContrastRatio; } });
Object.defineProperty(exports, "rgbToHex", { enumerable: true, get: function () { return utils_1.rgbToHex; } });
Object.defineProperty(exports, "lightenColor", { enumerable: true, get: function () { return utils_1.lightenColor; } });
Object.defineProperty(exports, "darkenColor", { enumerable: true, get: function () { return utils_1.darkenColor; } });
Object.defineProperty(exports, "suggestAccessibleColors", { enumerable: true, get: function () { return utils_1.suggestAccessibleColors; } });
// Export validators (Tasks F2-F6)
var a11y_validator_1 = require("./a11y-validator");
Object.defineProperty(exports, "A11yValidator", { enumerable: true, get: function () { return a11y_validator_1.A11yValidator; } });
var keyboard_validator_1 = require("./keyboard-validator");
Object.defineProperty(exports, "KeyboardValidator", { enumerable: true, get: function () { return keyboard_validator_1.KeyboardValidator; } });
var focus_validator_1 = require("./focus-validator");
Object.defineProperty(exports, "FocusValidator", { enumerable: true, get: function () { return focus_validator_1.FocusValidator; } });
var contrast_validator_1 = require("./contrast-validator");
Object.defineProperty(exports, "ContrastValidator", { enumerable: true, get: function () { return contrast_validator_1.ContrastValidator; } });
var token_validator_1 = require("./token-validator");
Object.defineProperty(exports, "TokenValidator", { enumerable: true, get: function () { return token_validator_1.TokenValidator; } });
// Export auto-fixer (Task I1)
var auto_fixer_1 = require("./auto-fixer");
Object.defineProperty(exports, "ExtendedAutoFixer", { enumerable: true, get: function () { return auto_fixer_1.ExtendedAutoFixer; } });
// Export performance utilities
var browser_pool_1 = require("./browser-pool");
Object.defineProperty(exports, "getSharedBrowser", { enumerable: true, get: function () { return browser_pool_1.getSharedBrowser; } });
Object.defineProperty(exports, "releaseSharedBrowser", { enumerable: true, get: function () { return browser_pool_1.releaseSharedBrowser; } });
Object.defineProperty(exports, "closeSharedBrowser", { enumerable: true, get: function () { return browser_pool_1.closeSharedBrowser; } });
Object.defineProperty(exports, "runValidatorsInParallel", { enumerable: true, get: function () { return browser_pool_1.runValidatorsInParallel; } });
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
async function extractComputedStyles(componentCode, componentName) {
    const { chromium } = await Promise.resolve().then(() => __importStar(require('@playwright/test')));
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const html = `
<!DOCTYPE html>
<html>
<head>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${componentCode}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(${componentName}, { children: 'Test' }));
  </script>
</body>
</html>
  `;
    await page.setContent(html);
    await page.waitForSelector('#root > *', { timeout: 5000 });
    const styles = await page.evaluate(() => {
        const element = document.querySelector('#root > *');
        if (!element)
            return {};
        const computed = window.getComputedStyle(element);
        return {
            'color': computed.color || '',
            'background-color': computed.backgroundColor || '',
            'border-color': computed.borderColor || '',
            'font-family': computed.fontFamily || '',
            'font-size': computed.fontSize || '',
            'font-weight': computed.fontWeight || '',
            'line-height': computed.lineHeight || '',
            'padding': computed.padding || '',
            'margin': computed.margin || '',
            'padding-top': computed.paddingTop || '',
            'padding-bottom': computed.paddingBottom || '',
            'padding-left': computed.paddingLeft || '',
            'padding-right': computed.paddingRight || '',
            'margin-top': computed.marginTop || '',
            'margin-bottom': computed.marginBottom || '',
            'margin-left': computed.marginLeft || '',
            'margin-right': computed.marginRight || '',
            'gap': computed.gap || '',
        };
    });
    await browser.close();
    return styles;
}
//# sourceMappingURL=index.js.map