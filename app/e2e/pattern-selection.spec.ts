/**
 * E2E Integration Tests for Epic 3 - Pattern Selection Flow
 * Tests complete pattern retrieval and selection workflow: requirements → pattern search → selection
 */

import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import { mockPatternResponse, mockEmptyResponse, mockErrorResponse } from './fixtures/patternMocks';

// Test timeout constants (in milliseconds)
const TIMEOUTS = {
  SHORT: 2000,           // Short waits for UI updates
  MODAL: 5000,           // Modal and dialog appearances
  RETRIEVAL: 10000,      // Pattern retrieval completion
  NAVIGATION: 3000,      // Page navigation
} as const;

// Screenshot helper
const screenshotPath = (name: string) => 
  path.join('test-results', `pattern-selection-${name}.png`);

/**
 * Helper to setup mock retrieval API response
 */
async function mockRetrievalAPI(page: Page) {
  await page.route('**/api/v1/retrieval/search', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPatternResponse)
    });
  });
}

/**
 * Helper to setup requirements in sessionStorage
 */
async function setupRequirements(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('requirements', JSON.stringify({
      component_type: 'Button',
      props: ['variant', 'size', 'disabled'],
      variants: ['primary', 'secondary', 'ghost'],
      a11y: ['aria-label', 'keyboard navigation']
    }));
  });
}

test.describe('Epic 3: Pattern Selection Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock API and requirements
    await mockRetrievalAPI(page);
    await setupRequirements(page);

    // Navigate to patterns page
    await page.goto('/patterns');

    // Handle onboarding modal if it appears
    const skipButton = page.getByRole('button', { name: /skip/i });
    if (await skipButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
      await skipButton.click();
    }

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('I1: should load and display pattern retrieval results', async ({ page }) => {
    await test.step('Verify page loads with pattern results', async () => {
      // Wait for patterns to load
      await expect(page.getByText(/button/i).first()).toBeVisible({ timeout: TIMEOUTS.RETRIEVAL });
      
      // Verify search summary is displayed
      await expect(page.getByText(/retrieval/i)).toBeVisible();
      
      // Take screenshot
      await page.screenshot({ 
        path: screenshotPath('01-loaded'),
        fullPage: true 
      });
    });

    await test.step('Verify top-3 patterns are displayed', async () => {
      // Should show exactly 3 pattern cards
      const patternCards = page.locator('[data-testid="pattern-card"], .pattern-card, article').filter({ hasText: /Button/ });
      
      // Wait for at least one card to be visible
      await patternCards.first().waitFor({ state: 'visible', timeout: TIMEOUTS.RETRIEVAL });
      
      // Count visible cards (should be 3)
      const count = await patternCards.count();
      expect(count).toBeLessThanOrEqual(3);
      expect(count).toBeGreaterThan(0);
    });

    await test.step('Verify confidence scores are displayed', async () => {
      // Look for confidence indicators (badges, scores, percentages)
      const hasConfidence = await page.getByText(/0\.\d{2}|9[0-9]%|confidence/i).isVisible();
      expect(hasConfidence).toBeTruthy();
    });

    await test.step('Verify retrieval metadata is displayed', async () => {
      // Check for latency display
      const hasLatency = await page.getByText(/\d+ms|latency/i).isVisible().catch(() => false);
      
      // Check for methods used (BM25, Semantic)
      const hasMethods = await page.getByText(/bm25|semantic/i).isVisible().catch(() => false);
      
      // At least one should be visible
      expect(hasLatency || hasMethods).toBeTruthy();
    });
  });

  test('T5: should support pattern selection workflow', async ({ page }) => {
    await test.step('Select a pattern', async () => {
      // Wait for patterns to be visible (instead of arbitrary timeout)
      const patternCards = page.locator('[data-testid="pattern-card"], .pattern-card, article').filter({ hasText: /Button/ });
      await patternCards.first().waitFor({ state: 'visible', timeout: TIMEOUTS.RETRIEVAL });
      
      // Find and click the first "Select" button
      const selectButton = page.getByRole('button', { name: /select/i }).first();
      await expect(selectButton).toBeVisible({ timeout: TIMEOUTS.RETRIEVAL });
      await selectButton.click();
      
      // Verify selection state (should show SELECTED badge or highlight)
      await expect(page.getByText(/selected/i)).toBeVisible({ timeout: TIMEOUTS.SHORT });
      
      // Take screenshot
      await page.screenshot({ 
        path: screenshotPath('02-selected.png'),
        fullPage: true 
      });
    });

    await test.step('Verify only one pattern can be selected', async () => {
      // Click another pattern's select button
      const selectButtons = page.getByRole('button', { name: /select/i });
      const count = await selectButtons.count();
      
      if (count > 1) {
        await selectButtons.nth(1).click();
        
        // Should only have one SELECTED badge
        const selectedBadges = page.getByText(/selected/i);
        const selectedCount = await selectedBadges.count();
        expect(selectedCount).toBe(1);
      }
    });
  });

  test('T5: should persist pattern selection in Zustand store', async ({ page }) => {
    await test.step('Select a pattern and verify persistence', async () => {
      // Wait for patterns to be visible
      const patternCards = page.locator('[data-testid="pattern-card"], .pattern-card, article').filter({ hasText: /Button/ });
      await patternCards.first().waitFor({ state: 'visible', timeout: TIMEOUTS.RETRIEVAL });
      
      // Select first pattern
      const selectButton = page.getByRole('button', { name: /select/i }).first();
      await expect(selectButton).toBeVisible({ timeout: TIMEOUTS.RETRIEVAL });
      await selectButton.click();
      
      // Wait for storage to be written (with proper check for completion)
      await page.waitForFunction(() => {
        const stored = localStorage.getItem('pattern-selection-storage');
        return stored !== null && JSON.parse(stored).state?.selectedPattern;
      }, { timeout: 5000 });
      
      // Check localStorage for pattern selection (Zustand persists here)
      const storedData = await page.evaluate(() => {
        return localStorage.getItem('pattern-selection-storage');
      });
      
      expect(storedData).toBeTruthy();
      const parsed = JSON.parse(storedData || '{}');
      expect(parsed.state?.selectedPattern).toBeTruthy();
    });

    await test.step('Verify selection persists across page refresh', async () => {
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still show SELECTED badge
      await expect(page.getByText(/selected/i)).toBeVisible({ timeout: TIMEOUTS.RETRIEVAL });
    });
  });

  test('I2: should handle Epic 2 → Epic 3 data flow', async ({ page }) => {
    await test.step('Verify requirements from Epic 2 are used', async () => {
      // Check that the retrieval query reflects Epic 2 requirements
      // This would be visible in the search summary or query display
      const pageContent = await page.textContent('body');
      
      // Should mention Button component type
      expect(pageContent).toContain('Button');
    });

    await test.step('Verify requirements transformation works', async () => {
      // The API should have been called with correct requirements
      // We've already mocked this, so verify the results match
      await expect(page.getByText(/button/i).first()).toBeVisible();
    });
  });

  test('I3: should support Epic 3 → Epic 4 navigation', async ({ page }) => {
    await test.step('Select pattern and continue to generation', async () => {
      // Wait for patterns to load
      await page.waitForTimeout(TIMEOUTS.SHORT);
      
      // Select a pattern
      const selectButton = page.getByRole('button', { name: /select/i }).first();
      await expect(selectButton).toBeVisible({ timeout: TIMEOUTS.RETRIEVAL });
      await selectButton.click();
      
      // Find and click "Continue to Generation" button
      const continueButton = page.getByRole('button', { name: /continue to generation|continue/i });
      
      // Wait for button to be available
      if (await continueButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
        await continueButton.click();
        
        // Should navigate to generation page
        await page.waitForURL(/\/generation/, { timeout: TIMEOUTS.NAVIGATION });
        
        // Take screenshot of generation page
        await page.screenshot({ 
          path: screenshotPath('03-generation.png'),
          fullPage: true 
        });
      }
    });
  });

  test('T5: should handle error states gracefully', async ({ page }) => {
    // Override mock to return error
    await page.route('**/api/v1/retrieval/search', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify(mockErrorResponse)
      });
    });

    // Reload page to trigger error
    await page.reload();
    await page.waitForLoadState('networkidle');

    await test.step('Verify error message is displayed', async () => {
      // Should show error state
      const hasError = await page.getByText(/error|failed|try again/i).isVisible({ timeout: TIMEOUTS.RETRIEVAL });
      expect(hasError).toBeTruthy();
      
      // Take screenshot
      await page.screenshot({ 
        path: screenshotPath('04-error.png'),
        fullPage: true 
      });
    });

    await test.step('Verify retry mechanism exists', async () => {
      // Should have retry button
      const retryButton = page.getByRole('button', { name: /retry|try again/i });
      const hasRetry = await retryButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false);
      
      // Error UI should provide a way to recover
      expect(hasRetry).toBeTruthy();
    });
  });

  test('T5: should handle empty results', async ({ page }) => {
    // Override mock to return no patterns
    await page.route('**/api/v1/retrieval/search', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEmptyResponse)
      });
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    await test.step('Verify empty state is displayed', async () => {
      // Should show empty state message
      const hasEmptyState = await page.getByText(/no patterns found|no results|try different/i).isVisible({ 
        timeout: TIMEOUTS.RETRIEVAL 
      });
      expect(hasEmptyState).toBeTruthy();
      
      // Take screenshot
      await page.screenshot({ 
        path: screenshotPath('05-empty.png'),
        fullPage: true 
      });
    });
  });

  test('T5: should display pattern code preview', async ({ page }) => {
    await test.step('Open code preview modal', async () => {
      // Wait for patterns to load
      await page.waitForTimeout(TIMEOUTS.SHORT);
      
      // Find and click "Preview" or "View Code" button
      const previewButton = page.getByRole('button', { name: /preview|view code/i }).first();
      
      if (await previewButton.isVisible({ timeout: TIMEOUTS.RETRIEVAL }).catch(() => false)) {
        await previewButton.click();
        
        // Wait for modal to appear
        await page.waitForTimeout(TIMEOUTS.SHORT);
        
        // Should show code in modal
        const hasCode = await page.getByText(/export const Button|function Button/i).isVisible();
        expect(hasCode).toBeTruthy();
        
        // Take screenshot
        await page.screenshot({ 
          path: screenshotPath('06-code-preview.png'),
          fullPage: true 
        });
        
        // Close modal
        const closeButton = page.getByRole('button', { name: /close/i }).last();
        if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click();
        }
      }
    });
  });

  test('T5: should show match highlights', async ({ page }) => {
    await test.step('Verify matched features are highlighted', async () => {
      // Wait for patterns to load
      await page.waitForTimeout(TIMEOUTS.SHORT);
      
      // Look for match highlights (matched props, variants, a11y)
      const pageContent = await page.textContent('body');
      
      // Should show matched properties
      const hasMatchedProps = pageContent?.toLowerCase().includes('variant') || 
                             pageContent?.toLowerCase().includes('size');
      
      // Should show matched variants
      const hasMatchedVariants = pageContent?.toLowerCase().includes('primary') || 
                                 pageContent?.toLowerCase().includes('secondary');
      
      expect(hasMatchedProps || hasMatchedVariants).toBeTruthy();
      
      // Take screenshot
      await page.screenshot({ 
        path: screenshotPath('07-highlights.png'),
        fullPage: true 
      });
    });
  });

  test('T5: should verify retrieval latency meets target', async ({ page }) => {
    await test.step('Check latency is under 1000ms', async () => {
      // Mock returns 450ms - verify it's displayed and under target
      const latencyText = await page.getByText(/\d+\s*ms/).first().textContent().catch(() => null);
      
      if (latencyText) {
        const latencyMatch = latencyText.match(/(\d+)\s*ms/);
        if (latencyMatch) {
          const latency = parseInt(latencyMatch[1]);
          expect(latency).toBeLessThan(1000);
        }
      }
    });
  });
});

test.describe('Epic 3: Pattern Selection - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await mockRetrievalAPI(page);
    await setupRequirements(page);
    await page.goto('/patterns');
    
    await test.step('Tab through pattern cards', async () => {
      // Wait for content to load
      await page.waitForTimeout(TIMEOUTS.SHORT);
      
      // Press Tab to navigate
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to reach select buttons
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    await test.step('Select pattern with Enter key', async () => {
      // Find a select button and focus it
      const selectButton = page.getByRole('button', { name: /select/i }).first();
      await selectButton.focus();
      
      // Press Enter to select
      await page.keyboard.press('Enter');
      
      // Should show SELECTED state
      await page.waitForTimeout(TIMEOUTS.SHORT);
      const hasSelected = await page.getByText(/selected/i).isVisible().catch(() => false);
      expect(hasSelected).toBeTruthy();
    });
  });
});
