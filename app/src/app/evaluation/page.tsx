/**
 * Evaluation Metrics Dashboard
 *
 * Displays comprehensive metrics for the screenshot-to-code pipeline:
 * - Overall pipeline success rate
 * - Stage-by-stage performance (token extraction, retrieval, generation)
 * - Retrieval comparison (E2E vs retrieval-only)
 * - Per-screenshot results
 */

import { EvaluationWrapper } from "@/components/evaluation";

export default async function EvaluationPage() {
  // Always pass null on initial server render to show loading state
  // The EvaluationWrapper will handle fetching and displaying the data
  return <EvaluationWrapper initialMetrics={null} />;
}
