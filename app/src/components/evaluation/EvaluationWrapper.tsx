"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  MetricCard,
  ComparisonTable,
  ExportButton,
  LogViewer
} from "@/components/evaluation";
import type { EvaluationMetrics } from "@/types/evaluation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface EvaluationWrapperProps {
  initialMetrics: EvaluationMetrics | null;
}

export function EvaluationWrapper({ initialMetrics }: EvaluationWrapperProps) {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(
    initialMetrics
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [systemStatus, setSystemStatus] = useState<any>(null);

  // Load system status (lightweight check, doesn't run evaluation)
  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/evaluation/status`);
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (err) {
      // Silently fail - status is optional
      console.error("Failed to fetch system status:", err);
    }
  };

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setStatus("Starting evaluation...");

      // First, check if evaluation is ready
      const statusRes = await fetch(`${API_BASE_URL}/api/v1/evaluation/status`);
      const statusData = await statusRes.json();

      if (!statusData.ready) {
        setError("Evaluation system is not ready. Please check configuration.");
        setIsLoading(false);
        return;
      }

      setStatus(
        `Running evaluation on ${statusData.golden_dataset.size} samples...`
      );

      // Start the evaluation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes

      const res = await fetch(`${API_BASE_URL}/api/v1/evaluation/metrics`, {
        cache: "no-store",
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch: ${errorText}`);
      }

      const data = await res.json();
      setMetrics(data);
      setStatus("Complete");
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError(
          "Evaluation timed out after 10 minutes. The dataset is too large for this operation."
        );
      } else {
        setError(err.message || "Failed to load evaluation metrics");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!metrics && !isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Evaluation Metrics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Run evaluation to view pipeline metrics
            </p>
          </div>
          <Button onClick={fetchMetrics} disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              "Run Evaluation"
            )}
          </Button>
        </div>

        {/* System Status */}
        {systemStatus && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    API Key Configured:
                  </span>
                  <Badge
                    variant={
                      systemStatus.api_key_configured ? "success" : "warning"
                    }
                  >
                    {systemStatus.api_key_configured ? "✓" : "✗"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Golden Dataset:
                  </span>
                  <Badge
                    variant={
                      systemStatus.golden_dataset?.loaded
                        ? "success"
                        : "warning"
                    }
                  >
                    {systemStatus.golden_dataset?.loaded
                      ? `✓ ${systemStatus.golden_dataset.size} samples`
                      : "✗ Not loaded"}
                  </Badge>
                </div>
                {systemStatus.message && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {systemStatus.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="error" className="mb-6">
            <AlertDescription>
              <strong>Failed to run evaluation</strong>
              {error && <p className="mt-2">{error}</p>}
            </AlertDescription>
          </Alert>
        )}

        {/* Info about evaluation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>About Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Running evaluation will process all screenshots in the golden
              dataset through the complete pipeline. This may take several
              minutes.
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Tests token extraction accuracy</li>
              <li>Validates pattern retrieval performance</li>
              <li>Checks code generation quality</li>
              <li>Measures end-to-end pipeline success</li>
            </ul>
          </CardContent>
        </Card>

        {/* Log Viewer - Always visible */}
        <LogViewer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Evaluation Metrics</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div>
                <p className="font-medium">
                  {status || "Running evaluation..."}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This may take several minutes for large datasets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { overall, per_screenshot, retrieval_only, dataset_size, timestamp } =
    metrics;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Evaluation Metrics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Last updated: {timestamp}
          </p>
        </div>
        <ExportButton metrics={metrics} />
      </div>

      {/* Overall Pipeline Metrics */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Overall Pipeline Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Pipeline Success Rate"
            value={overall.pipeline_success_rate}
            target={0.8}
            format="percentage"
            description="% of screenshots producing valid code end-to-end"
          />
          <MetricCard
            label="Average Latency"
            value={overall.avg_latency_ms / 1000}
            target={20}
            format="seconds"
            description="Time from screenshot to valid code"
            inverted
          />
          <MetricCard
            label="Dataset Size"
            value={dataset_size}
            format="number"
            description="Number of test screenshots"
          />
        </div>
      </section>

      {/* Stage-by-Stage Performance */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Stage-by-Stage Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Token Extraction */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Token Extraction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {(overall.token_extraction.avg_accuracy * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Average accuracy
              </p>
              <Badge
                variant={
                  overall.token_extraction.avg_accuracy >= 0.85
                    ? "success"
                    : "warning"
                }
              >
                Target: ≥ 85%
              </Badge>
            </CardContent>
          </Card>

          {/* Pattern Retrieval */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pattern Retrieval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {(overall.retrieval.mrr * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                MRR (Context Precision)
              </p>
              <Badge
                variant={overall.retrieval.mrr >= 0.9 ? "success" : "warning"}
              >
                Target: ≥ 90%
              </Badge>
              <div className="mt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Hit@3:
                  </span>
                  <span className="font-mono">
                    {(overall.retrieval.hit_at_3 * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Precision@1:
                  </span>
                  <span className="font-mono">
                    {(overall.retrieval.precision_at_1 * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Code Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {(overall.generation.compilation_rate * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Compilation rate
              </p>
              <Badge
                variant={
                  overall.generation.compilation_rate >= 0.9
                    ? "success"
                    : "warning"
                }
              >
                Target: ≥ 90%
              </Badge>
              <div className="mt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Quality Score:
                  </span>
                  <span className="font-mono">
                    {overall.generation.avg_quality_score.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Success Rate:
                  </span>
                  <span className="font-mono">
                    {(overall.generation.success_rate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Retrieval Comparison */}
      {retrieval_only && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Retrieval Comparison</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comparing retrieval performance in E2E pipeline vs isolated testing
            ({retrieval_only.test_queries} test queries)
          </p>
          <ComparisonTable
            e2eMetrics={overall.retrieval}
            retrievalOnlyMetrics={retrieval_only}
          />
        </section>
      )}

      {/* Stage Failures */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Failure Analysis</h2>
        <Card>
          <CardContent className="pt-6">
            {Object.values(overall.stage_failures).reduce(
              (a, b) => a + b,
              0
            ) === 0 ? (
              <div className="text-center py-4">
                <Badge variant="success" className="text-lg">
                  ✓ No failures detected
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Token Extraction Failures:
                  </span>
                  <Badge
                    variant={
                      overall.stage_failures.token_extraction === 0
                        ? "success"
                        : "warning"
                    }
                  >
                    {overall.stage_failures.token_extraction}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Retrieval Failures:</span>
                  <Badge
                    variant={
                      overall.stage_failures.retrieval === 0
                        ? "success"
                        : "warning"
                    }
                  >
                    {overall.stage_failures.retrieval}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Generation Failures:</span>
                  <Badge
                    variant={
                      overall.stage_failures.generation === 0
                        ? "success"
                        : "warning"
                    }
                  >
                    {overall.stage_failures.generation}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Per-Screenshot Results */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Per-Screenshot Results</h2>
        <div className="space-y-4">
          {per_screenshot.map((result) => (
            <Card key={result.screenshot_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {result.screenshot_id}
                  </CardTitle>
                  <Badge
                    variant={result.pipeline_success ? "success" : "warning"}
                  >
                    {result.pipeline_success ? "✓ Success" : "✗ Failed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Token Accuracy:
                    </span>
                    <div className="font-mono font-medium">
                      {(result.token_extraction.accuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Retrieval:
                    </span>
                    <div className="font-mono font-medium">
                      {result.retrieval.correct ? "✓" : "✗"}{" "}
                      {result.retrieval.retrieved || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Generation:
                    </span>
                    <div className="font-mono font-medium">
                      {result.generation.code_compiles ? "✓" : "✗"} Quality:{" "}
                      {result.generation.quality_score.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Latency:
                    </span>
                    <div className="font-mono font-medium">
                      {(result.total_latency_ms / 1000).toFixed(1)}s
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Log Viewer */}
      <section className="mb-8">
        <LogViewer />
      </section>
    </div>
  );
}
