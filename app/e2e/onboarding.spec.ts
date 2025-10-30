/**
 * E2E Integration Tests for Epic 11 - Task 13
 * Tests onboarding modal functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Onboarding Modal - TASK 13.4 & 13.5', () => {
  test.beforeEach(async ({ context }) => {
    // Clear localStorage to simulate first-time user
    await context.clearCookies();
  });

  test('TASK 13.4: should show onboarding modal on first visit', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for the onboarding modal to appear
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Check modal content
    await expect(page.getByText('Welcome to ComponentForge!')).toBeVisible();
    await expect(page.getByText('Choose how you\'d like to start extracting design tokens')).toBeVisible();

    // Verify all three workflow cards are present
    await expect(page.getByText('Design System Screenshot')).toBeVisible();
    await expect(page.getByText('Component Mockups')).toBeVisible();
    await expect(page.getByText('Figma File')).toBeVisible();

    // Verify skip button is present
    await expect(page.getByRole('button', { name: /skip for now/i })).toBeVisible();
  });

  test('TASK 13.4: should NOT show onboarding modal on subsequent visits', async ({ page, context }) => {
    // First visit - complete onboarding by skipping
    await page.goto('/');
    
    const skipButton = page.getByRole('button', { name: /skip for now/i });
    await skipButton.click();

    // Wait for modal to close
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();

    // Refresh the page
    await page.reload();

    // Modal should not appear - wait with condition instead of arbitrary timeout
    await page.waitForLoadState('networkidle');
    await expect(modal).not.toBeVisible({ timeout: 2000 });
  });

  test('TASK 13.5: should save workflow preference and navigate on selection - Design System', async ({ page }) => {
    await page.goto('/');

    // Click on Design System workflow card - using getByRole for better stability
    const designSystemCard = page.getByRole('heading', { name: 'Design System Screenshot' }).locator('..');
    await designSystemCard.click();

    // Should navigate to /extract page
    await expect(page).toHaveURL(/.*\/extract/);

    // Modal should be closed
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();

    // Check that preference is saved by reloading and verifying modal doesn't show
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(modal).not.toBeVisible({ timeout: 2000 });
  });

  test('TASK 13.5: should save workflow preference and navigate on selection - Components', async ({ page }) => {
    await page.goto('/');

    // Click on Component Mockups workflow card - using getByRole for better stability
    const componentsCard = page.getByRole('heading', { name: 'Component Mockups' }).locator('..');
    await componentsCard.click();

    // Should navigate to /extract page
    await expect(page).toHaveURL(/.*\/extract/);

    // Modal should be closed
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();
  });

  test('TASK 13.5: should save workflow preference and navigate on selection - Figma', async ({ page }) => {
    await page.goto('/');

    // Click on Figma workflow card - using getByRole for better stability
    const figmaCard = page.getByRole('heading', { name: 'Figma File' }).locator('..');
    await figmaCard.click();

    // Should navigate to /extract page
    await expect(page).toHaveURL(/.*\/extract/);

    // Modal should be closed
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();
  });

  test('should allow skipping onboarding', async ({ page }) => {
    await page.goto('/');

    // Click skip button
    const skipButton = page.getByRole('button', { name: /skip for now/i });
    await skipButton.click();

    // Modal should close
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();

    // Should stay on current page (homepage)
    await expect(page).toHaveURL(/.*\//);
  });

  test('should display workflow descriptions and examples', async ({ page }) => {
    await page.goto('/');

    // Check Design System card content
    await expect(page.getByText('Upload a screenshot of your design palette or style guide')).toBeVisible();
    await expect(page.getByText(/Perfect for:.*Color palettes, typography scales, spacing systems/i)).toBeVisible();

    // Check Components card content
    await expect(page.getByText('Upload screenshots of UI components to extract their design tokens')).toBeVisible();
    await expect(page.getByText(/Perfect for:.*Buttons, cards, forms, navigation elements/i)).toBeVisible();

    // Check Figma card content
    await expect(page.getByText('Connect your Figma file to automatically extract styles')).toBeVisible();
    await expect(page.getByText(/Perfect for:.*Complete design systems with defined styles/i)).toBeVisible();
  });

  test('should show help text about accessing guide from Help menu', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('You can always access this guide from the Help menu')).toBeVisible();
  });
});
