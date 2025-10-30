"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  Code,
  Search
} from "lucide-react";

interface EvaluationData {
  overall: {
    pipeline_success_rate: number;
    avg_latency_ms: number;
    stage_failures: {
      token_extraction: number;
      retrieval: number;
      generation: number;
    };
    token_extraction: {
      avg_accuracy: number;
    };
    retrieval: {
      mrr: number;
      hit_at_3: number;
      precision_at_1: number;
    };
    generation: {
      compilation_rate: number;
      avg_quality_score: number;
      success_rate: number;
      avg_generation_time_ms: number;
    };
  };
  per_screenshot: Array<{
    screenshot_id: string;
    pipeline_success: boolean;
    total_latency_ms: number;
    token_extraction: {
      accuracy: number;
      missing_tokens: string[];
      incorrect_tokens: string[];
    };
    retrieval: {
      correct: boolean;
      expected: string;
      retrieved: string;
      rank: number;
      confidence: number;
    };
    generation: {
      code_generated: boolean;
      code_compiles: boolean;
      quality_score: number;
      validation_errors: string[];
      generation_time_ms: number;
      security_issues_count: number;
      security_severity: string | null;
      is_code_safe: boolean;
    };
  }>;
  dataset_size: number;
  timestamp?: string;
}

interface EvaluationDashboardProps {
  data: EvaluationData;
}

export function EvaluationDashboard({ data }: EvaluationDashboardProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (screenshotId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(screenshotId)) {
      newExpanded.delete(screenshotId);
    } else {
      newExpanded.add(screenshotId);
    }
    setExpandedRows(newExpanded);
  };

  const formatLatency = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const { overall, per_screenshot } = data;

  const successCount = per_screenshot.filter((s) => s.pipeline_success).length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pipeline Success Rate */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Pipeline Success
              </span>
              <Badge
                variant={
                  overall.pipeline_success_rate >= 0.8
                    ? "success"
                    : overall.pipeline_success_rate >= 0.5
                    ? "warning"
                    : "error"
                }
              >
                {formatPercentage(overall.pipeline_success_rate)}
              </Badge>
            </div>
            <p className="text-3xl font-bold mb-2">
              {successCount} / {per_screenshot.length}
            </p>
            <Progress
              value={overall.pipeline_success_rate * 100}
              variant={
                overall.pipeline_success_rate >= 0.8
                  ? "success"
                  : overall.pipeline_success_rate >= 0.5
                  ? "warning"
                  : "error"
              }
            />
          </CardContent>
        </Card>

        {/* Token Extraction Accuracy */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Token Extraction
              </span>
              <Badge
                variant={
                  overall.token_extraction.avg_accuracy >= 0.7
                    ? "success"
                    : overall.token_extraction.avg_accuracy >= 0.4
                    ? "warning"
                    : "error"
                }
              >
                {formatPercentage(overall.token_extraction.avg_accuracy)}
              </Badge>
            </div>
            <p className="text-3xl font-bold mb-2">
              {overall.stage_failures.token_extraction}
            </p>
            <p className="text-xs text-muted-foreground">failures</p>
          </CardContent>
        </Card>

        {/* Retrieval Performance */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Search className="h-4 w-4" />
                Pattern Retrieval
              </span>
              <Badge variant="success">
                {formatPercentage(overall.retrieval.precision_at_1)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">
                MRR: {overall.retrieval.mrr.toFixed(3)}
              </p>
              <p className="text-xs text-muted-foreground">
                Hit@3: {formatPercentage(overall.retrieval.hit_at_3)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Code Generation */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Code className="h-4 w-4" />
                Code Generation
              </span>
              <Badge
                variant={
                  overall.generation.compilation_rate >= 0.8
                    ? "success"
                    : overall.generation.compilation_rate >= 0.5
                    ? "warning"
                    : "error"
                }
              >
                {formatPercentage(overall.generation.compilation_rate)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">
                Quality: {overall.generation.avg_quality_score.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {overall.stage_failures.generation} failures
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Stage Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Token Extraction</span>
                <span className="text-xs text-muted-foreground">
                  {overall.stage_failures.token_extraction} failures
                </span>
              </div>
              <Progress
                value={
                  (1 -
                    overall.stage_failures.token_extraction /
                      per_screenshot.length) *
                  100
                }
                variant={
                  overall.stage_failures.token_extraction === 0
                    ? "success"
                    : overall.stage_failures.token_extraction <
                      per_screenshot.length / 2
                    ? "warning"
                    : "error"
                }
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Retrieval</span>
                <span className="text-xs text-muted-foreground">
                  {overall.stage_failures.retrieval} failures
                </span>
              </div>
              <Progress
                value={
                  (1 -
                    overall.stage_failures.retrieval / per_screenshot.length) *
                  100
                }
                variant="success"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Generation</span>
                <span className="text-xs text-muted-foreground">
                  {overall.stage_failures.generation} failures
                </span>
              </div>
              <Progress
                value={
                  (1 -
                    overall.stage_failures.generation / per_screenshot.length) *
                  100
                }
                variant={
                  overall.stage_failures.generation === 0
                    ? "success"
                    : overall.stage_failures.generation <
                      per_screenshot.length / 2
                    ? "warning"
                    : "error"
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Screenshot Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Per-Screenshot Results</CardTitle>
            <Badge variant="neutral" size="sm">
              {per_screenshot.length} screenshots
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Screenshot ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Token Accuracy</TableHead>
                <TableHead>Retrieval</TableHead>
                <TableHead>Generation</TableHead>
                <TableHead className="text-right">Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {per_screenshot.map((screenshot) => {
                const isExpanded = expandedRows.has(screenshot.screenshot_id);
                const hasIssues =
                  screenshot.token_extraction.accuracy < 0.8 ||
                  !screenshot.retrieval.correct ||
                  !screenshot.generation.code_compiles ||
                  screenshot.generation.validation_errors.length > 0;

                return (
                  <>
                    <TableRow
                      key={screenshot.screenshot_id}
                      className="cursor-pointer"
                      onClick={() => toggleRow(screenshot.screenshot_id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {screenshot.screenshot_id}
                      </TableCell>
                      <TableCell>
                        {screenshot.pipeline_success ? (
                          <Badge
                            variant="success"
                            className="flex items-center gap-1 w-fit"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Success
                          </Badge>
                        ) : (
                          <Badge
                            variant="error"
                            className="flex items-center gap-1 w-fit"
                          >
                            <XCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              screenshot.token_extraction.accuracy >= 0.7
                                ? "success"
                                : screenshot.token_extraction.accuracy >= 0.4
                                ? "warning"
                                : "error"
                            }
                            size="sm"
                          >
                            {formatPercentage(
                              screenshot.token_extraction.accuracy
                            )}
                          </Badge>
                          {screenshot.token_extraction.missing_tokens.length >
                            0 && (
                            <span className="text-xs text-muted-foreground">
                              (-
                              {
                                screenshot.token_extraction.missing_tokens
                                  .length
                              }
                              )
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {screenshot.retrieval.correct ? (
                          <Badge
                            variant="success"
                            size="sm"
                            className="flex items-center gap-1 w-fit"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {screenshot.retrieval.retrieved}
                          </Badge>
                        ) : (
                          <Badge
                            variant="error"
                            size="sm"
                            className="flex items-center gap-1 w-fit"
                          >
                            <XCircle className="h-3 w-3" />
                            {screenshot.retrieval.retrieved || "N/A"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {screenshot.generation.code_compiles ? (
                          <Badge
                            variant="success"
                            size="sm"
                            className="flex items-center gap-1 w-fit"
                          >
                            <CheckCircle2 className="h-3 w-3" />✓
                          </Badge>
                        ) : (
                          <Badge
                            variant="error"
                            size="sm"
                            className="flex items-center gap-1 w-fit"
                          >
                            <AlertCircle className="h-3 w-3" />✗
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatLatency(screenshot.total_latency_ms)}
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="bg-gray-50/50 dark:bg-gray-900/50"
                        >
                          <div className="p-4 space-y-4">
                            {/* Token Extraction Details */}
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                Token Extraction Details
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p>
                                  Accuracy:{" "}
                                  <Badge
                                    variant={
                                      screenshot.token_extraction.accuracy >=
                                      0.7
                                        ? "success"
                                        : screenshot.token_extraction
                                            .accuracy >= 0.4
                                        ? "warning"
                                        : "error"
                                    }
                                    size="sm"
                                  >
                                    {formatPercentage(
                                      screenshot.token_extraction.accuracy
                                    )}
                                  </Badge>
                                </p>
                                {screenshot.token_extraction.missing_tokens
                                  .length > 0 && (
                                  <div>
                                    <p className="text-muted-foreground mb-1">
                                      Missing Tokens (
                                      {
                                        screenshot.token_extraction
                                          .missing_tokens.length
                                      }
                                      ):
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {screenshot.token_extraction.missing_tokens
                                        .slice(0, 10)
                                        .map((token) => (
                                          <Badge
                                            key={token}
                                            variant="warning"
                                            size="sm"
                                          >
                                            {token}
                                          </Badge>
                                        ))}
                                      {screenshot.token_extraction
                                        .missing_tokens.length > 10 && (
                                        <Badge variant="neutral" size="sm">
                                          +
                                          {screenshot.token_extraction
                                            .missing_tokens.length - 10}{" "}
                                          more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {screenshot.token_extraction.incorrect_tokens
                                  .length > 0 && (
                                  <div>
                                    <p className="text-muted-foreground mb-1">
                                      Incorrect Tokens (
                                      {
                                        screenshot.token_extraction
                                          .incorrect_tokens.length
                                      }
                                      ):
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {screenshot.token_extraction.incorrect_tokens.map(
                                        (token) => (
                                          <Badge
                                            key={token}
                                            variant="error"
                                            size="sm"
                                          >
                                            {token}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Retrieval Details */}
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Retrieval Details
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Expected:{" "}
                                  </span>
                                  <Badge variant="info" size="sm">
                                    {screenshot.retrieval.expected}
                                  </Badge>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Retrieved:{" "}
                                  </span>
                                  <Badge
                                    variant={
                                      screenshot.retrieval.correct
                                        ? "success"
                                        : "error"
                                    }
                                    size="sm"
                                  >
                                    {screenshot.retrieval.retrieved}
                                  </Badge>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Rank:{" "}
                                  </span>
                                  <span className="font-semibold">
                                    #{screenshot.retrieval.rank}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Confidence:{" "}
                                  </span>
                                  <span className="font-semibold">
                                    {formatPercentage(
                                      screenshot.retrieval.confidence
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Generation Details */}
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Code className="h-4 w-4" />
                                Generation Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Quality Score:{" "}
                                    </span>
                                    <Badge
                                      variant={
                                        screenshot.generation.quality_score >=
                                        0.9
                                          ? "success"
                                          : screenshot.generation
                                              .quality_score >= 0.7
                                          ? "warning"
                                          : "error"
                                      }
                                      size="sm"
                                    >
                                      {screenshot.generation.quality_score.toFixed(
                                        2
                                      )}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Generation Time:{" "}
                                    </span>
                                    <span className="font-semibold">
                                      {formatLatency(
                                        screenshot.generation.generation_time_ms
                                      )}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Compiles:{" "}
                                    </span>
                                    {screenshot.generation.code_compiles ? (
                                      <Badge variant="success" size="sm">
                                        ✓ Yes
                                      </Badge>
                                    ) : (
                                      <Badge variant="error" size="sm">
                                        ✗ No
                                      </Badge>
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Security:{" "}
                                    </span>
                                    {screenshot.generation.is_code_safe ? (
                                      <Badge variant="success" size="sm">
                                        ✓ Safe
                                      </Badge>
                                    ) : (
                                      <Badge variant="error" size="sm">
                                        ✗{" "}
                                        {
                                          screenshot.generation
                                            .security_issues_count
                                        }{" "}
                                        issues
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {screenshot.generation.validation_errors
                                  .length > 0 && (
                                  <div>
                                    <p className="text-muted-foreground mb-1">
                                      Validation Errors (
                                      {
                                        screenshot.generation.validation_errors
                                          .length
                                      }
                                      ):
                                    </p>
                                    <Alert variant="error">
                                      <AlertDescription>
                                        <pre className="text-xs whitespace-pre-wrap">
                                          {screenshot.generation.validation_errors.join(
                                            "\n"
                                          )}
                                        </pre>
                                      </AlertDescription>
                                    </Alert>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Average Latency</p>
              <p className="text-2xl font-bold">
                {formatLatency(overall.avg_latency_ms)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Generation Time</p>
              <p className="text-2xl font-bold">
                {formatLatency(overall.generation.avg_generation_time_ms)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Screenshots</p>
              <p className="text-2xl font-bold">{per_screenshot.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dataset Size</p>
              <p className="text-2xl font-bold">{data.dataset_size}</p>
            </div>
          </div>
          {data.timestamp && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Evaluation run at: {new Date(data.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
