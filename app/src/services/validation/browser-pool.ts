/**
 * Browser pool for reusing Playwright browser instances
 * Addresses performance optimization recommendation
 */

import { chromium, Browser } from '@playwright/test';

/**
 * Simple browser pool to reuse browser instances across validators
 * This reduces the overhead of launching new browsers for each validation
 */
class BrowserPool {
  private browser: Browser | null = null;
  private refCount = 0;

  /**
   * Get a browser instance (creates if needed, reuses if available)
   */
  async acquire(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    this.refCount++;
    return this.browser;
  }

  /**
   * Release a browser instance (closes only when all references are released)
   */
  async release(): Promise<void> {
    this.refCount--;
    if (this.refCount <= 0 && this.browser) {
      await this.browser.close();
      this.browser = null;
      this.refCount = 0;
    }
  }

  /**
   * Force close the browser regardless of reference count
   */
  async forceClose(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.refCount = 0;
    }
  }

  /**
   * Get current reference count
   */
  getRefCount(): number {
    return this.refCount;
  }
}

// Singleton instance
const browserPool = new BrowserPool();

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
export async function getSharedBrowser(): Promise<Browser> {
  return browserPool.acquire();
}

/**
 * Release shared browser instance
 * Browser is only closed when all references are released
 */
export async function releaseSharedBrowser(): Promise<void> {
  return browserPool.release();
}

/**
 * Force close shared browser
 * Use this for cleanup in tests or when shutting down
 */
export async function closeSharedBrowser(): Promise<void> {
  return browserPool.forceClose();
}

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
export async function runValidatorsInParallel<T>(
  validators: Array<() => Promise<T>>
): Promise<T[]> {
  try {
    const results = await Promise.all(validators.map((fn) => fn()));
    return results;
  } finally {
    // Ensure cleanup even if validators throw
    await closeSharedBrowser();
  }
}
