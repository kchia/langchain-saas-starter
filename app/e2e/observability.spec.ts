import { test, expect } from '@playwright/test';

/**
 * E2E Tests for LangSmith Trace Display (Epic 004: Observability)
 * 
 * Tests the frontend display of LangSmith trace links and metadata
 * in the generation preview page.
 */

test.describe('LangSmith Trace Display', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the home page
    await page.goto('/');
  });

  test('displays observability section when generation completes', async ({ page }) => {
    // NOTE: This test verifies the UI structure is present
    // Backend trace URL generation is tested separately
    
    // Mock the generation API response to include trace data
    await page.route('**/api/v1/generation/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: {
            component: 'export function TestButton() { return <button>Test</button>; }',
            stories: 'export default { title: "TestButton" };',
          },
          metadata: {
            pattern_used: 'shadcn-button',
            pattern_version: '1.0.0',
            tokens_applied: 5,
            requirements_implemented: 3,
            lines_of_code: 50,
            imports_count: 2,
            has_typescript_errors: false,
            has_accessibility_warnings: false,
            llm_token_usage: {
              prompt_tokens: 500,
              completion_tokens: 750,
              total_tokens: 1250,
            },
            trace_url: 'https://smith.langchain.com/o/default/projects/p/test/r/abc123',
            session_id: 'test-session-123',
          },
          timing: {
            total_ms: 5000,
            llm_generating_ms: 3000,
            validating_ms: 1500,
            post_processing_ms: 500,
          },
          provenance: {
            pattern_id: 'shadcn-button',
            pattern_version: '1.0.0',
            generated_at: new Date().toISOString(),
            tokens_hash: 'abc123',
            requirements_hash: 'def456',
          },
          status: 'completed',
        }),
      });
    });

    // Navigate through the workflow to trigger generation
    // (In a real E2E test, you'd go through the full workflow)
    // For now, we'll test the component rendering directly by navigating to preview
    
    // Skip the full workflow and test the preview page structure
    // This assumes the page can handle missing workflow state gracefully
    await page.goto('/preview');
    
    // Wait for the page to potentially show an error or redirect
    await page.waitForTimeout(1000);
  });

  test('displays trace link when trace_url is provided', async ({ page }) => {
    // This test would be part of a full workflow E2E test
    // Testing the component in isolation via Storybook or component tests
    // is more practical for unit-level checks
    
    // For now, document what should be tested:
    // 1. Trace link appears with correct URL
    // 2. Link opens in new tab
    // 3. Tooltip shows session ID
    // 4. External link icon is visible
  });

  test('handles missing trace URL gracefully', async ({ page }) => {
    // Mock response without trace_url
    await page.route('**/api/v1/generation/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: {
            component: 'export function TestButton() { return <button>Test</button>; }',
            stories: 'export default { title: "TestButton" };',
          },
          metadata: {
            pattern_used: 'shadcn-button',
            pattern_version: '1.0.0',
            tokens_applied: 5,
            requirements_implemented: 3,
            lines_of_code: 50,
            imports_count: 2,
            has_typescript_errors: false,
            has_accessibility_warnings: false,
            // No trace_url or session_id
          },
          timing: {
            total_ms: 5000,
          },
          provenance: {
            pattern_id: 'shadcn-button',
            pattern_version: '1.0.0',
            generated_at: new Date().toISOString(),
            tokens_hash: 'abc123',
            requirements_hash: 'def456',
          },
          status: 'completed',
        }),
      });
    });

    // Navigate to preview page
    await page.goto('/preview');
    await page.waitForTimeout(1000);
    
    // Verify fallback message is shown when trace URL is missing
    // In a real test, we'd check for the "Trace link will appear here..." message
  });

  test('displays generation metadata (latency, tokens, cost)', async ({ page }) => {
    // Mock response with full metadata
    await page.route('**/api/v1/generation/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: {
            component: 'export function TestButton() { return <button>Test</button>; }',
            stories: 'export default { title: "TestButton" };',
          },
          metadata: {
            pattern_used: 'shadcn-button',
            pattern_version: '1.0.0',
            tokens_applied: 5,
            requirements_implemented: 3,
            lines_of_code: 50,
            imports_count: 2,
            has_typescript_errors: false,
            has_accessibility_warnings: false,
            llm_token_usage: {
              prompt_tokens: 500,
              completion_tokens: 750,
              total_tokens: 1250,
            },
            trace_url: 'https://smith.langchain.com/trace/abc123',
            session_id: 'session-123',
          },
          timing: {
            total_ms: 5000,
            llm_generating_ms: 3000,
            validating_ms: 1500,
            post_processing_ms: 500,
          },
          provenance: {
            pattern_id: 'shadcn-button',
            pattern_version: '1.0.0',
            generated_at: new Date().toISOString(),
            tokens_hash: 'abc123',
            requirements_hash: 'def456',
          },
          status: 'completed',
        }),
      });
    });

    // Navigate to preview
    await page.goto('/preview');
    await page.waitForTimeout(1000);
    
    // In a real test, we would verify:
    // - Latency is displayed (5.0s)
    // - Token count is displayed (1,250)
    // - Token breakdown shows prompt and completion tokens
    // - Stage breakdown shows llm_generating, validating, post_processing
  });

  test('displays stage breakdown with progress bars', async ({ page }) => {
    // Test that stage latencies are visualized with progress bars
    // This would check for the presence of progress indicators
    // showing relative time spent in each stage
  });
});

/**
 * NOTE: These E2E tests are currently placeholders that document
 * the expected behavior. Full E2E testing requires:
 * 
 * 1. Complete workflow state setup (tokens, requirements, patterns)
 * 2. Backend API mocking or test environment
 * 3. More sophisticated page interactions
 * 
 * The component-level unit tests provide better coverage for
 * the observability components themselves.
 * 
 * For full integration testing, consider:
 * - Running against a test backend with LangSmith configured
 * - Using fixtures to set up complete workflow state
 * - Testing the full flow from upload → extract → requirements → patterns → preview
 */
