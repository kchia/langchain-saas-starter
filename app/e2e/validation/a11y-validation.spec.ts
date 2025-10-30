/**
 * Epic 5 Task T3: End-to-End Accessibility Validation Tests
 * Tests complete validation flow for accessibility
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility Validation E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to component preview page
    await page.goto('/preview/button');
    await page.waitForLoadState('networkidle');
  });

  test('should run accessibility validation on generated component', async ({ page }) => {
    // Wait for component generation to complete
    await page.waitForSelector('[data-testid="component-preview"]', { timeout: 30000 });

    // Trigger validation
    const validateButton = page.locator('button:has-text("Validate")');
    await validateButton.click();

    // Wait for validation to complete
    await page.waitForSelector('[data-testid="validation-results"]', { timeout: 15000 });

    // Check that a11y results are displayed
    const a11yResults = page.locator('[data-testid="a11y-results"]');
    await expect(a11yResults).toBeVisible();

    // Verify validation status
    const status = await page.locator('[data-testid="validation-status"]').textContent();
    expect(status).toMatch(/PASS|FAIL/);
  });

  test('should display critical accessibility violations', async ({ page }) => {
    // Generate a component with known a11y issues
    await page.goto('/preview/icon-button?accessible=false');
    await page.waitForSelector('[data-testid="component-preview"]');

    // Run validation
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');

    // Check for critical violations display
    const violations = page.locator('[data-testid="a11y-violations"]');
    await expect(violations).toBeVisible();

    // Verify violation details are shown
    const violationCount = await violations.locator('.violation-item').count();
    expect(violationCount).toBeGreaterThan(0);
  });

  test('should block component delivery on critical violations', async ({ page }) => {
    // Generate component with critical a11y issues
    await page.goto('/preview/broken-button');
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');

    // Export button should be disabled
    const exportButton = page.locator('button:has-text("Export")');
    await expect(exportButton).toBeDisabled();

    // Warning message should be displayed
    const warning = page.locator('[data-testid="critical-warning"]');
    await expect(warning).toBeVisible();
    await expect(warning).toContainText('critical');
  });

  test('should allow export when all validations pass', async ({ page }) => {
    // Generate accessible component
    await page.goto('/preview/button?accessible=true');
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');

    // Wait for PASS status
    await expect(page.locator('[data-testid="validation-status"]')).toHaveText('PASS');

    // Export button should be enabled
    const exportButton = page.locator('button:has-text("Export")');
    await expect(exportButton).toBeEnabled();
  });

  test('should display auto-fix suggestions', async ({ page }) => {
    await page.goto('/preview/icon-button?accessible=false');
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');

    // Auto-fix section should be visible
    const autoFixSection = page.locator('[data-testid="auto-fix-section"]');
    await expect(autoFixSection).toBeVisible();

    // Should show fixable issues
    const fixableIssues = page.locator('[data-testid="fixable-issues"]');
    await expect(fixableIssues).toBeVisible();
  });

  test('should apply auto-fixes when requested', async ({ page }) => {
    await page.goto('/preview/icon-button?accessible=false');
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');

    // Click auto-fix button
    const autoFixButton = page.locator('button:has-text("Apply Auto-Fix")');
    await autoFixButton.click();

    // Wait for re-validation
    await page.waitForSelector('[data-testid="validation-results"]', { state: 'hidden' });
    await page.waitForSelector('[data-testid="validation-results"]', { state: 'visible' });

    // Check that issues were fixed
    const successMessage = page.locator('[data-testid="auto-fix-success"]');
    await expect(successMessage).toBeVisible();
  });

  test('should complete validation within 15s performance target', async ({ page }) => {
    await page.goto('/preview/button');
    
    const start = Date.now();
    
    // Run validation
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]', { timeout: 15000 });
    
    const elapsed = Date.now() - start;
    
    // Should complete within 15s (Epic 4.5: ~5s + Epic 5: ~10s)
    expect(elapsed).toBeLessThan(15000);
  });
});
