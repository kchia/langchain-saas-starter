"use client";

import * as React from "react";
import { Clock, Coins, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface GenerationMetadataDisplayProps {
  /** Metadata from generation response */
  metadata: {
    /** Total latency in milliseconds */
    latency_ms?: number;
    /** Latency breakdown by stage */
    stage_latencies?: Record<string, number>;
    /** Total tokens used */
    token_count?: number;
    /** Estimated cost in USD */
    estimated_cost?: number;
    /** LLM token usage details */
    llm_token_usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * GenerationMetadataDisplay - Shows AI operation metadata and performance metrics
 *
 * Epic 004: Observability - Display trace metadata
 *
 * Displays key metrics from AI operations:
 * - Latency (total and per-stage breakdown)
 * - Token usage (prompt, completion, total)
 * - Estimated cost
 *
 * Features:
 * - Visual progress bars for stage breakdown
 * - Cost estimation
 * - Token usage tracking
 * - Performance metrics
 *
 * @example
 * ```tsx
 * <GenerationMetadataDisplay
 *   metadata={{
 *     latency_ms: 3500,
 *     token_count: 1250,
 *     estimated_cost: 0.0125,
 *     stage_latencies: {
 *       parsing: 500,
 *       generating: 2500,
 *       assembling: 500
 *     }
 *   }}
 * />
 * ```
 */
export function GenerationMetadataDisplay({
  metadata,
  className
}: GenerationMetadataDisplayProps) {
  const {
    latency_ms,
    stage_latencies,
    token_count,
    estimated_cost,
    llm_token_usage
  } = metadata;

  // Calculate total tokens from llm_token_usage if available, otherwise use token_count
  const totalTokens = llm_token_usage?.total_tokens ?? token_count;

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Generation Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key metrics grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Latency */}
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Latency</p>
              <p className="text-sm font-medium">
                {latency_ms ? `${(latency_ms / 1000).toFixed(1)}s` : "N/A"}
              </p>
            </div>
          </div>

          {/* Tokens */}
          <div className="flex items-start gap-2">
            <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Tokens</p>
              <p className="text-sm font-medium">
                {totalTokens?.toLocaleString() ?? "N/A"}
              </p>
            </div>
          </div>

          {/* Cost */}
          <div className="flex items-start gap-2">
            <Coins className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Est. Cost</p>
              <p className="text-sm font-medium">
                {estimated_cost !== undefined ? `$${estimated_cost.toFixed(4)}` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* LLM Token breakdown */}
        {llm_token_usage && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground">Token Breakdown</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span className="text-muted-foreground">Prompt:</span>
                <Badge variant="neutral" className="text-xs">
                  {llm_token_usage.prompt_tokens.toLocaleString()}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span className="text-muted-foreground">Completion:</span>
                <Badge variant="neutral" className="text-xs">
                  {llm_token_usage.completion_tokens.toLocaleString()}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Stage breakdown */}
        {stage_latencies && latency_ms && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground">Stage Breakdown</p>
            {Object.entries(stage_latencies).map(([stage, latency]) => {
              const percentage = (latency / latency_ms) * 100;
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize text-muted-foreground">
                      {stage.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium">{(latency / 1000).toFixed(2)}s</span>
                  </div>
                  <Progress
                    value={percentage}
                    variant="default"
                    className="h-1"
                    aria-label={`${stage} progress: ${percentage.toFixed(0)}%`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
