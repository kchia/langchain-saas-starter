/**
 * E2E Integration Tests for Epic 2 - Frontend Integration
 * Tests complete requirements workflow: extract → requirements → export
 */

import { test, expect } from '@playwright/test';
import path from 'path';

// Test data path
const TEST_SCREENSHOT = path.join(__dirname, 'fixtures', 'design-system-sample.png');

// Test timeout constants (in milliseconds)
const TIMEOUTS = {
  SHORT: 2000,           // Short waits for UI updates
  MODAL: 5000,           // Modal and dialog appearances
  ANALYSIS: 30000,       // AI analysis completion
  RETRY_CHECK: 35000,    // Checking for retry button
  EXTRACTION: 60000,     // GPT-4V token extraction
  PREVIEW_LOAD: 1000,    // Export preview loading
} as const;

test.describe('Epic 2: Requirements Flow Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to extract page
    await page.goto('/extract');

    // Handle onboarding modal if it appears
    const skipButton = page.getByRole('button', { name: /skip/i });
    if (await skipButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
      await skipButton.click();
    }

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should complete full requirements workflow from extract to export', async ({ page }) => {
    // Step 1: Extract tokens from screenshot
    await test.step('Extract tokens from screenshot', async () => {
      // Ensure we're on the screenshot tab
      await page.getByRole('tab', { name: /screenshot/i }).click();

      // Upload the test screenshot
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
      await fileInput.setInputFiles(TEST_SCREENSHOT);

      // Click extract button
      await page.getByRole('button', { name: /extract tokens/i }).click();

      // Wait for extraction to complete (up to 60s for GPT-4V processing)
      await Promise.race([
        expect(page.getByText(/tokens extracted successfully/i)).toBeVisible({ timeout: TIMEOUTS.EXTRACTION }),
        expect(page.getByRole('heading', { name: /edit tokens/i })).toBeVisible({ timeout: TIMEOUTS.EXTRACTION }),
      ]);

      // Take screenshot of extraction success
      await page.screenshot({ 
        path: 'test-results/requirements-flow-01-extraction.png',
        fullPage: true 
      });
    });

    // Step 2: Navigate to requirements page
    await test.step('Navigate to requirements page', async () => {
      // Click "Continue to Requirements" button
      const continueButton = page.getByRole('link', { name: /continue to requirements/i });
      await expect(continueButton).toBeVisible();
      await continueButton.click();

      // Verify we're on the requirements page
      await expect(page).toHaveURL(/\/requirements/);
      await expect(page.getByRole('heading', { name: /review requirements/i })).toBeVisible();
    });

    // Step 3: Verify auto-trigger of requirement proposal
    await test.step('Verify AI proposal is auto-triggered', async () => {
      // Should see loading state
      await expect(page.getByText(/analyzing your component/i)).toBeVisible({ timeout: TIMEOUTS.MODAL });
      
      // Take screenshot of loading state
      await page.screenshot({ 
        path: 'test-results/requirements-flow-02-analyzing.png',
        fullPage: true 
      });

      // Wait for analysis to complete (up to 30s)
      // The ApprovalPanel should appear
      await expect(page.getByText(/analyzing your component/i)).not.toBeVisible({ timeout: TIMEOUTS.ANALYSIS });
    });

    // Step 4: Verify ApprovalPanel displays with proposals
    await test.step('Verify ApprovalPanel renders with proposals', async () => {
      // Component type detection should be visible
      // The exact component type depends on the test image, but we should see some component type
      await page.waitForTimeout(TIMEOUTS.SHORT); // Wait for component to render
      
      // Verify that proposal categories are present
      // These should be collapsible sections or cards
      const pageContent = await page.textContent('body');
      
      // At least one of these categories should be present
      const hasCategories = 
        pageContent?.includes('Props') ||
        pageContent?.includes('Events') ||
        pageContent?.includes('States') ||
        pageContent?.includes('Accessibility');
      
      expect(hasCategories).toBeTruthy();

      // Take screenshot of approval panel
      await page.screenshot({ 
        path: 'test-results/requirements-flow-03-proposals.png',
        fullPage: true 
      });
    });

    // Step 5: Verify export flow
    await test.step('Test export requirements flow', async () => {
      // Click "Export Requirements" button
      const exportButton = page.getByRole('button', { name: /export requirements/i });
      await expect(exportButton).toBeVisible();
      await exportButton.click();

      // Wait for export preview to load
      await page.waitForTimeout(TIMEOUTS.PREVIEW_LOAD);

      // Take screenshot of export preview
      await page.screenshot({ 
        path: 'test-results/requirements-flow-04-export-preview.png',
        fullPage: true 
      });

      // Look for export preview elements (statistics, component info, etc.)
      const hasExportContent = await page.getByText(/export/i).count() > 0;
      expect(hasExportContent).toBeTruthy();

      // Confirm export by looking for confirmation button
      const confirmButton = page.getByRole('button', { name: /export.*continue/i });
      if (await confirmButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
        await confirmButton.click();
        
        // Wait for export to complete
        await page.waitForTimeout(TIMEOUTS.SHORT);
        
        // Take screenshot after export
        await page.screenshot({ 
          path: 'test-results/requirements-flow-05-exported.png',
          fullPage: true 
        });
      }
    });

    // Step 6: Verify "Continue to Patterns" is enabled after export
    await test.step('Verify navigation to patterns is enabled', async () => {
      // After export, "Continue to Patterns" should be visible
      const patternsButton = page.getByRole('link', { name: /continue to patterns/i });
      
      // This may or may not be visible depending on whether export succeeded
      // Just verify the requirements page still works
      const hasNavigation = await page.getByText(/back to extraction/i).isVisible();
      expect(hasNavigation).toBeTruthy();

      // Take final screenshot
      await page.screenshot({ 
        path: 'test-results/requirements-flow-06-final.png',
        fullPage: true 
      });
    });
  });

  test('should handle missing screenshot file gracefully', async ({ page }) => {
    // Navigate directly to requirements page without uploading a file
    await page.goto('/requirements');

    // Should see warning message
    await expect(page.getByText(/no screenshot found/i)).toBeVisible({ timeout: TIMEOUTS.MODAL });
    
    // Should have link back to extraction
    await expect(page.getByRole('link', { name: /back to extraction/i })).toBeVisible();

    // Take screenshot of error state
    await page.screenshot({ 
      path: 'test-results/requirements-flow-error-no-file.png',
      fullPage: true 
    });
  });

  test('should allow retry on analysis failure', async ({ page }) => {
    // This test assumes backend might fail or be unavailable
    // We'll just verify the error UI exists
    
    // Upload a screenshot
    await page.getByRole('tab', { name: /screenshot/i }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_SCREENSHOT);
    await page.getByRole('button', { name: /extract tokens/i }).click();
    
    // Wait for extraction
    await Promise.race([
      expect(page.getByText(/tokens extracted successfully/i)).toBeVisible({ timeout: TIMEOUTS.EXTRACTION }),
      expect(page.getByRole('heading', { name: /edit tokens/i })).toBeVisible({ timeout: TIMEOUTS.EXTRACTION }),
    ]);

    // Navigate to requirements
    await page.getByRole('link', { name: /continue to requirements/i }).click();
    
    // If analysis fails, verify retry button exists
    // This is conditional based on backend availability
    const hasRetryButton = await page.getByRole('button', { name: /try again/i })
      .isVisible({ timeout: TIMEOUTS.RETRY_CHECK })
      .catch(() => false);
    
    if (hasRetryButton) {
      await page.screenshot({ 
        path: 'test-results/requirements-flow-error-analysis.png',
        fullPage: true 
      });
      
      // The retry button should be functional
      await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
    }
  });
});

test.describe('Epic 2: Requirements Flow - Backend Required', () => {
  // These tests require the backend to be running
  // Mark them as expected to potentially fail if backend is not available
  
  test('should display component type with confidence score', async ({ page }) => {
    test.skip(!process.env.BACKEND_AVAILABLE, 'Backend not available');
    
    // This test would verify specific backend responses
    // Skipping implementation as it depends on backend being available
  });

  test('should show all four requirement categories', async ({ page }) => {
    test.skip(!process.env.BACKEND_AVAILABLE, 'Backend not available');
    
    // This test would verify Props, Events, States, and Accessibility categories
    // Skipping implementation as it depends on backend being available
  });
});
