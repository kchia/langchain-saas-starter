/**
 * E2E tests for evaluation dashboard page.
 */

import { test, expect } from "@playwright/test";

test.describe("Evaluation Dashboard", () => {
  test("should load and display evaluation page", async ({ page }) => {
    // Navigate to evaluation page
    await page.goto("/evaluation");

    // Check for main heading
    await expect(page.locator("h1")).toContainText("Evaluation Metrics");
  });

  test("should display overall metrics section", async ({ page }) => {
    await page.goto("/evaluation");

    // Check for Overall Pipeline Metrics section
    await expect(
      page.locator("h2", { hasText: "Overall Pipeline Metrics" })
    ).toBeVisible();

    // Check for metric cards (success rate, latency, dataset size)
    await expect(page.getByText("Pipeline Success Rate")).toBeVisible();
    await expect(page.getByText("Average Latency")).toBeVisible();
    await expect(page.getByText("Dataset Size")).toBeVisible();
  });

  test("should display stage-by-stage performance", async ({ page }) => {
    await page.goto("/evaluation");

    // Check for Stage-by-Stage Performance section
    await expect(
      page.locator("h2", { hasText: "Stage-by-Stage Performance" })
    ).toBeVisible();

    // Check for stage cards
    await expect(page.getByText("Token Extraction")).toBeVisible();
    await expect(page.getByText("Pattern Retrieval")).toBeVisible();
    await expect(page.getByText("Code Generation")).toBeVisible();
  });

  test("should display per-screenshot results", async ({ page }) => {
    await page.goto("/evaluation");

    // Check for Per-Screenshot Results section
    await expect(
      page.locator("h2", { hasText: "Per-Screenshot Results" })
    ).toBeVisible();
  });

  test("should have export JSON button", async ({ page }) => {
    await page.goto("/evaluation");

    // Check for Export JSON button
    await expect(page.getByRole("button", { name: /Export JSON/i })).toBeVisible();
  });

  test("should display retrieval comparison if available", async ({ page }) => {
    await page.goto("/evaluation");

    // Check if Retrieval Comparison section exists
    const comparisonSection = page.locator("h2", {
      hasText: "Retrieval Comparison",
    });

    // If present, verify table is displayed
    if (await comparisonSection.isVisible()) {
      await expect(
        page.locator("table").filter({ hasText: "MRR" })
      ).toBeVisible();
    }
  });

  test("should display failure analysis", async ({ page }) => {
    await page.goto("/evaluation");

    // Check for Failure Analysis section
    await expect(
      page.locator("h2", { hasText: "Failure Analysis" })
    ).toBeVisible();
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Intercept API call and return error
    await page.route("**/api/v1/evaluation/metrics", (route) => {
      route.abort();
    });

    await page.goto("/evaluation");

    // Should display error message
    await expect(page.getByText(/Failed to load evaluation metrics/i)).toBeVisible();
  });
});
