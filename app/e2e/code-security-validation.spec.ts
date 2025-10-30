/**
 * End-to-End Tests for Code Security Validation (Epic 003 - Story 3.2)
 * 
 * Tests security validation features in the code generation workflow:
 * - Security metric card displays correct status
 * - Security issues panel shows violations
 * - Security badge indicators work correctly
 * - Safe code shows success state
 * - Unsafe code shows error state with details
 */

import { test, expect } from '@playwright/test';

test.describe('Code Security Validation', () => {
  test.describe('Security Metric Card', () => {
    test('displays security check status when code is generated', async ({ page }) => {
      // Navigate to preview page (assuming generation is complete)
      // Note: In a real test, we would complete the full workflow
      await page.goto('/preview');
      
      // Wait for metrics to load
      await page.waitForSelector('[data-testid="metric-card"], .grid', { timeout: 10000 });
      
      // Security metric should be visible
      // It may show "Safe", "X Issues", or "Not Checked"
      const securityMetric = page.getByText(/Security|Safe|Issues|Not Checked/);
      await expect(securityMetric).toBeVisible({ timeout: 5000 });
    });

    test('shows safe status for secure code', async ({ page }) => {
      // Mock the generation response with safe code
      await page.route('**/api/v1/generation/generate', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: {
              component: 'const Button = () => <button>Click</button>;',
              stories: 'export default { title: "Button" };',
            },
            metadata: {
              pattern_used: 'button',
              pattern_version: '1.0.0',
              tokens_applied: 10,
              requirements_implemented: 5,
              lines_of_code: 50,
              imports_count: 3,
              has_typescript_errors: false,
              has_accessibility_warnings: false,
              validation_results: {
                attempts: 0,
                final_status: 'passed',
                typescript_passed: true,
                typescript_errors: [],
                eslint_passed: true,
                eslint_errors: [],
                eslint_warnings: [],
                security_sanitization: {
                  is_safe: true,
                  issues: [],
                },
              },
            },
            timing: {
              total_ms: 5000,
            },
            provenance: {
              pattern_id: 'button',
              pattern_version: '1.0.0',
              generated_at: new Date().toISOString(),
              tokens_hash: 'abc123',
              requirements_hash: 'def456',
            },
            status: 'completed',
          }),
        });
      });

      await page.goto('/preview');
      await page.waitForTimeout(2000);

      // Security metric should show "Safe"
      const securityMetric = page.getByText('✓ Safe');
      await expect(securityMetric).toBeVisible({ timeout: 5000 });
    });

    test('shows issue count for unsafe code', async ({ page }) => {
      // Mock the generation response with security issues
      await page.route('**/api/v1/generation/generate', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: {
              component: 'const dangerous = eval("1 + 1");',
              stories: 'export default { title: "Unsafe" };',
            },
            metadata: {
              pattern_used: 'button',
              pattern_version: '1.0.0',
              tokens_applied: 10,
              requirements_implemented: 5,
              lines_of_code: 50,
              imports_count: 3,
              has_typescript_errors: false,
              has_accessibility_warnings: false,
              validation_results: {
                attempts: 0,
                final_status: 'passed',
                typescript_passed: true,
                typescript_errors: [],
                eslint_passed: true,
                eslint_errors: [],
                eslint_warnings: [],
                security_sanitization: {
                  is_safe: false,
                  issues: [
                    {
                      type: 'security_violation',
                      pattern: 'eval\\s*\\(',
                      line: 10,
                      severity: 'high',
                    },
                    {
                      type: 'security_violation',
                      pattern: 'dangerouslySetInnerHTML',
                      line: 25,
                      severity: 'high',
                    },
                  ],
                },
              },
            },
            timing: {
              total_ms: 5000,
            },
            provenance: {
              pattern_id: 'button',
              pattern_version: '1.0.0',
              generated_at: new Date().toISOString(),
              tokens_hash: 'abc123',
              requirements_hash: 'def456',
            },
            status: 'completed',
          }),
        });
      });

      await page.goto('/preview');
      await page.waitForTimeout(2000);

      // Security metric should show issue count
      const securityMetric = page.getByText('2 Issues');
      await expect(securityMetric).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Security Issues Panel in Quality Tab', () => {
    test('displays security analysis panel in Quality tab', async ({ page }) => {
      // Mock the generation response with security issues
      await page.route('**/api/v1/generation/generate', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: {
              component: 'const dangerous = eval("1 + 1");',
              stories: 'export default { title: "Unsafe" };',
            },
            metadata: {
              pattern_used: 'button',
              pattern_version: '1.0.0',
              tokens_applied: 10,
              requirements_implemented: 5,
              lines_of_code: 50,
              imports_count: 3,
              has_typescript_errors: false,
              has_accessibility_warnings: false,
              validation_results: {
                attempts: 0,
                final_status: 'passed',
                typescript_passed: true,
                typescript_errors: [],
                eslint_passed: true,
                eslint_errors: [],
                eslint_warnings: [],
                security_sanitization: {
                  is_safe: false,
                  issues: [
                    {
                      type: 'security_violation',
                      pattern: 'eval\\s*\\(',
                      line: 10,
                      severity: 'high',
                    },
                  ],
                },
              },
            },
            timing: {
              total_ms: 5000,
            },
            provenance: {
              pattern_id: 'button',
              pattern_version: '1.0.0',
              generated_at: new Date().toISOString(),
              tokens_hash: 'abc123',
              requirements_hash: 'def456',
            },
            status: 'completed',
          }),
        });
      });

      await page.goto('/preview');
      await page.waitForTimeout(2000);

      // Click on Quality tab
      const qualityTab = page.getByRole('tab', { name: /Quality/i });
      await qualityTab.click();

      // Security Analysis panel should be visible
      const securityPanel = page.getByText('Security Analysis');
      await expect(securityPanel).toBeVisible({ timeout: 5000 });
    });

    test('displays security violations with line numbers', async ({ page }) => {
      // Mock the generation response with security issues
      await page.route('**/api/v1/generation/generate', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: {
              component: 'const dangerous = eval("1 + 1");',
              stories: 'export default { title: "Unsafe" };',
            },
            metadata: {
              pattern_used: 'button',
              pattern_version: '1.0.0',
              tokens_applied: 10,
              requirements_implemented: 5,
              lines_of_code: 50,
              imports_count: 3,
              has_typescript_errors: false,
              has_accessibility_warnings: false,
              validation_results: {
                attempts: 0,
                final_status: 'passed',
                typescript_passed: true,
                typescript_errors: [],
                eslint_passed: true,
                eslint_errors: [],
                eslint_warnings: [],
                security_sanitization: {
                  is_safe: false,
                  issues: [
                    {
                      type: 'security_violation',
                      pattern: 'eval\\s*\\(',
                      line: 10,
                      severity: 'high',
                    },
                  ],
                },
              },
            },
            timing: {
              total_ms: 5000,
            },
            provenance: {
              pattern_id: 'button',
              pattern_version: '1.0.0',
              generated_at: new Date().toISOString(),
              tokens_hash: 'abc123',
              requirements_hash: 'def456',
            },
            status: 'completed',
          }),
        });
      });

      await page.goto('/preview');
      await page.waitForTimeout(2000);

      // Click on Quality tab
      const qualityTab = page.getByRole('tab', { name: /Quality/i });
      await qualityTab.click();

      // Line number should be visible
      const lineNumber = page.getByText('Line 10');
      await expect(lineNumber).toBeVisible({ timeout: 5000 });

      // Severity badge should be visible
      const severityBadge = page.getByText('HIGH');
      await expect(severityBadge).toBeVisible({ timeout: 5000 });

      // Pattern should be visible
      const pattern = page.getByText('eval\\s*\\(');
      await expect(pattern).toBeVisible({ timeout: 5000 });
    });

    test('shows success state for safe code', async ({ page }) => {
      // Mock the generation response with safe code
      await page.route('**/api/v1/generation/generate', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: {
              component: 'const Button = () => <button>Click</button>;',
              stories: 'export default { title: "Button" };',
            },
            metadata: {
              pattern_used: 'button',
              pattern_version: '1.0.0',
              tokens_applied: 10,
              requirements_implemented: 5,
              lines_of_code: 50,
              imports_count: 3,
              has_typescript_errors: false,
              has_accessibility_warnings: false,
              validation_results: {
                attempts: 0,
                final_status: 'passed',
                typescript_passed: true,
                typescript_errors: [],
                eslint_passed: true,
                eslint_errors: [],
                eslint_warnings: [],
                security_sanitization: {
                  is_safe: true,
                  issues: [],
                },
              },
            },
            timing: {
              total_ms: 5000,
            },
            provenance: {
              pattern_id: 'button',
              pattern_version: '1.0.0',
              generated_at: new Date().toISOString(),
              tokens_hash: 'abc123',
              requirements_hash: 'def456',
            },
            status: 'completed',
          }),
        });
      });

      await page.goto('/preview');
      await page.waitForTimeout(2000);

      // Click on Quality tab
      const qualityTab = page.getByRole('tab', { name: /Quality/i });
      await qualityTab.click();

      // Success message should be visible
      const successMessage = page.getByText(/No security vulnerabilities detected/i);
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    });

    test('displays recommendations for unsafe code', async ({ page }) => {
      // Mock the generation response with security issues
      await page.route('**/api/v1/generation/generate', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: {
              component: 'const dangerous = eval("1 + 1");',
              stories: 'export default { title: "Unsafe" };',
            },
            metadata: {
              pattern_used: 'button',
              pattern_version: '1.0.0',
              tokens_applied: 10,
              requirements_implemented: 5,
              lines_of_code: 50,
              imports_count: 3,
              has_typescript_errors: false,
              has_accessibility_warnings: false,
              validation_results: {
                attempts: 0,
                final_status: 'passed',
                typescript_passed: true,
                typescript_errors: [],
                eslint_passed: true,
                eslint_errors: [],
                eslint_warnings: [],
                security_sanitization: {
                  is_safe: false,
                  issues: [
                    {
                      type: 'security_violation',
                      pattern: 'eval\\s*\\(',
                      line: 10,
                      severity: 'high',
                    },
                  ],
                },
              },
            },
            timing: {
              total_ms: 5000,
            },
            provenance: {
              pattern_id: 'button',
              pattern_version: '1.0.0',
              generated_at: new Date().toISOString(),
              tokens_hash: 'abc123',
              requirements_hash: 'def456',
            },
            status: 'completed',
          }),
        });
      });

      await page.goto('/preview');
      await page.waitForTimeout(2000);

      // Click on Quality tab
      const qualityTab = page.getByRole('tab', { name: /Quality/i });
      await qualityTab.click();

      // Recommendations section should be visible
      const recommendations = page.getByText(/Recommended actions:/i);
      await expect(recommendations).toBeVisible({ timeout: 5000 });

      // Should have recommendation about reviewing violations
      const reviewRec = page.getByText(/Review each violation/i);
      await expect(reviewRec).toBeVisible({ timeout: 5000 });
    });
  });
});
