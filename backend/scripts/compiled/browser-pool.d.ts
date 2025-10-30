/**
 * Browser pool for reusing Playwright browser instances
 * Addresses performance optimization recommendation
 */
import { Browser } from '@playwright/test';
/**
 * Get shared browser instance
 * Use this instead of launching new browsers in validators for better performance
 *
 * @example
 * ```typescript
 * const browser = await getSharedBrowser();
 * try {
 *   const page = await browser.newPage();
 *   // ... use page
 *   await page.close();
 * } finally {
 *   await releaseSharedBrowser();
 * }
 * ```
 */
export declare function getSharedBrowser(): Promise<Browser>;
/**
 * Release shared browser instance
 * Browser is only closed when all references are released
 */
export declare function releaseSharedBrowser(): Promise<void>;
/**
 * Force close shared browser
 * Use this for cleanup in tests or when shutting down
 */
export declare function closeSharedBrowser(): Promise<void>;
/**
 * Run validators in parallel with shared browser
 * This is more efficient than running them sequentially
 *
 * @param validators - Array of validator functions to run
 * @returns Array of validation results
 *
 * @example
 * ```typescript
 * import { runValidatorsInParallel } from '@/services/validation/browser-pool';
 *
 * const results = await runValidatorsInParallel([
 *   () => new A11yValidator().validate(code, 'Button'),
 *   () => new KeyboardValidator().validate(code, 'Button', 'button'),
 *   () => new FocusValidator().validate(code, 'Button'),
 *   () => new ContrastValidator().validate(code, 'Button'),
 * ]);
 * ```
 */
export declare function runValidatorsInParallel<T>(validators: Array<() => Promise<T>>): Promise<T[]>;
//# sourceMappingURL=browser-pool.d.ts.map