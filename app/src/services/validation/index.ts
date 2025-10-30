/**
 * Epic 5: Extended Quality Validation & Accessibility Testing
 * Validation service exports
 */

// Export all types
export type {
  ValidationResult,
  A11yViolation,
  KeyboardIssue,
  FocusIssue,
  ContrastViolation,
  TokenViolation,
  DesignTokens,
  AutoFixResult,
  ValidationReport,
} from './types';

// Export WCAG utilities
export {
  parseColor,
  getRelativeLuminance,
  getContrastRatio,
  calculateContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  calculateDeltaE,
  calculateDeltaEFromStrings,
  formatContrastRatio,
  rgbToHex,
  lightenColor,
  darkenColor,
  suggestAccessibleColors,
} from './utils';

export type { RGBColor } from './utils';

// Export validators (Tasks F2-F6)
export { A11yValidator } from './a11y-validator';
export { KeyboardValidator } from './keyboard-validator';
export { FocusValidator } from './focus-validator';
export { ContrastValidator } from './contrast-validator';
export { TokenValidator } from './token-validator';

// Export auto-fixer (Task I1)
export { ExtendedAutoFixer } from './auto-fixer';

// Export performance utilities
export {
  getSharedBrowser,
  releaseSharedBrowser,
  closeSharedBrowser,
  runValidatorsInParallel,
} from './browser-pool';

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
export async function extractComputedStyles(
  componentCode: string,
  componentName: string
): Promise<Record<string, string>> {
  const { chromium } = await import('@playwright/test');
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
    if (!element) return {};

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
  return styles as Record<string, string>;
}
