/**
 * Epic 5 Task T3: End-to-End Quality Reporting Tests
 * Tests quality report generation and display
 */

import { test, expect } from '@playwright/test';

test.describe('Quality Reporting E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preview/button');
    await page.waitForLoadState('networkidle');
  });

  test('should generate and display quality report', async ({ page }) => {
    // Wait for component generation
    await page.waitForSelector('[data-testid="component-preview"]', { timeout: 30000 });

    // Run validation
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]', { timeout: 15000 });

    // Open quality report
    await page.click('button:has-text("View Report")');
    
    // Report modal/page should be visible
    const report = page.locator('[data-testid="quality-report"]');
    await expect(report).toBeVisible();

    // Should show overall status
    const status = page.locator('[data-testid="overall-status"]');
    await expect(status).toBeVisible();
    await expect(status).toHaveText(/PASS|FAIL/);
  });

  test('should display all validation categories in report', async ({ page }) => {
    await page.goto('/preview/button');
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');
    await page.click('button:has-text("View Report")');

    const report = page.locator('[data-testid="quality-report"]');

    // Check all categories are present
    await expect(report.locator('text=TypeScript')).toBeVisible();
    await expect(report.locator('text=ESLint')).toBeVisible();
    await expect(report.locator('text=Accessibility')).toBeVisible();
    await expect(report.locator('text=Keyboard')).toBeVisible();
    await expect(report.locator('text=Focus')).toBeVisible();
    await expect(report.locator('text=Contrast')).toBeVisible();
    await expect(report.locator('text=Token Adherence')).toBeVisible();
  });

  test('should show token adherence score and percentage', async ({ page }) => {
    await page.goto('/preview/button');
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');
    await page.click('button:has-text("View Report")');

    // Token adherence section
    const tokenSection = page.locator('[data-testid="token-adherence"]');
    await expect(tokenSection).toBeVisible();

    // Should show percentage
    const adherenceScore = await tokenSection.locator('[data-testid="adherence-score"]').textContent();
    expect(adherenceScore).toMatch(/\d+%/);

    // Should have breakdown by category
    await expect(tokenSection.locator('text=Colors')).toBeVisible();
    await expect(tokenSection.locator('text=Typography')).toBeVisible();
    await expect(tokenSection.locator('text=Spacing')).toBeVisible();
  });

  test('should display auto-fix summary in report', async ({ page }) => {
    await page.goto('/preview/icon-button?accessible=false');
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');

    // Apply auto-fixes
    await page.click('button:has-text("Apply Auto-Fix")');
    await page.waitForSelector('[data-testid="auto-fix-success"]');

    // View report
    await page.click('button:has-text("View Report")');

    // Auto-fix section should show what was fixed
    const autoFixSection = page.locator('[data-testid="auto-fix-summary"]');
    await expect(autoFixSection).toBeVisible();
    
    const fixCount = await autoFixSection.locator('[data-testid="fixes-applied"]').textContent();
    expect(fixCount).toMatch(/\d+ issues? fixed/);
  });

  test('should allow downloading report as HTML', async ({ page }) => {
    await page.goto('/preview/button');
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');
    await page.click('button:has-text("View Report")');

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    
    // Click download HTML button
    await page.click('button:has-text("Download HTML")');
    
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/quality-report.*\.html/);
  });

  test('should allow downloading report as JSON', async ({ page }) => {
    await page.goto('/preview/button');
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');
    await page.click('button:has-text("View Report")');

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    
    // Click download JSON button
    await page.click('button:has-text("Download JSON")');
    
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/quality-report.*\.json/);
  });

  test('should show recommendations when validations fail', async ({ page }) => {
    await page.goto('/preview/broken-button');
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');
    await page.click('button:has-text("View Report")');

    // Recommendations section should be visible
    const recommendations = page.locator('[data-testid="recommendations"]');
    await expect(recommendations).toBeVisible();

    // Should have actionable suggestions
    const suggestionCount = await recommendations.locator('.recommendation-item').count();
    expect(suggestionCount).toBeGreaterThan(0);
  });

  test('should display error and warning counts in summary', async ({ page }) => {
    await page.goto('/preview/button');
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');
    await page.click('button:has-text("View Report")');

    // Summary cards
    const summary = page.locator('[data-testid="report-summary"]');
    await expect(summary).toBeVisible();

    // Should show counts
    await expect(summary.locator('[data-testid="error-count"]')).toBeVisible();
    await expect(summary.locator('[data-testid="warning-count"]')).toBeVisible();
  });

  test('should show validation timestamp', async ({ page }) => {
    await page.goto('/preview/button');
    await page.click('button:has-text("Validate")');
    await page.waitForSelector('[data-testid="validation-results"]');
    await page.click('button:has-text("View Report")');

    // Timestamp should be present
    const timestamp = page.locator('[data-testid="report-timestamp"]');
    await expect(timestamp).toBeVisible();
    
    // Should be a valid date format
    const timestampText = await timestamp.textContent();
    expect(timestampText).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
