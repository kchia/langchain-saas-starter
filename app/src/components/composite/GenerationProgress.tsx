"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  GenerationStage,
  GenerationStatus,
  ValidationResults,
  QualityScores,
  getStageDisplayName,
  getStageProgress,
  getFixAttemptsMessage,
  formatTiming
} from "@/types";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle,
  CheckCheck
} from "lucide-react";

export interface GenerationProgressProps {
  /** Current generation stage */
  currentStage: GenerationStage;
  /** Current generation status */
  status: GenerationStatus;
  /** Elapsed time in milliseconds */
  elapsedMs?: number;
  /** Error message if generation failed */
  error?: string;
  /** Validation results (Epic 4.5) */
  validationResults?: ValidationResults;
  /** Quality scores (Epic 4.5) */
  qualityScores?: QualityScores;
  /** Additional CSS classes */
  className?: string;
}

/**
 * GenerationProgress - Shows real-time progress during code generation
 *
 * Epic 4.5: Updated for LLM-first 3-stage pipeline
 *
 * Displays the current stage of the generation pipeline with:
 * - Progress bar showing completion percentage
 * - Stage-by-stage indicators (✓ completed, ⏳ pending, 🔄 current)
 * - Elapsed time counter
 * - Validation results (TypeScript + ESLint)
 * - Quality scores display
 * - Fix attempts indicator
 * - Error message if generation fails
 *
 * Stages (Epic 4.5):
 * 1. Generating with LLM (50%)  - ~15-20s
 * 2. Validating Code (80%)      - ~3-5s
 * 3. Post-Processing (95%)      - ~2-3s
 * 4. Complete (100%)
 *
 * @example
 * ```tsx
 * <GenerationProgress
 *   currentStage={GenerationStage.VALIDATING}
 *   status={GenerationStatus.IN_PROGRESS}
 *   elapsedMs={15000}
 *   validationResults={validationResults}
 *   qualityScores={qualityScores}
 * />
 * ```
 */
export function GenerationProgress({
  currentStage,
  status,
  elapsedMs = 0,
  error,
  validationResults,
  qualityScores,
  className
}: GenerationProgressProps) {
  const progress = getStageProgress(currentStage);
  const isComplete = status === GenerationStatus.COMPLETED;
  const isFailed = status === GenerationStatus.FAILED;
  const isInProgress =
    status === GenerationStatus.IN_PROGRESS ||
    status === GenerationStatus.PENDING;

  // Get all stages in order (Epic 4.5: 3 stages)
  const stages = [
    GenerationStage.LLM_GENERATING,
    GenerationStage.VALIDATING,
    GenerationStage.POST_PROCESSING
  ];

  // Determine variant based on status
  const variant = isFailed ? "error" : isComplete ? "success" : "default";

  // Calculate fix attempts from validation results
  const fixAttempts = validationResults?.attempts ?? 0;

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {isComplete && "Generation Complete"}
            {isFailed && "Generation Failed"}
            {isInProgress && "Generating Component..."}
          </span>
          {elapsedMs > 0 && (
            <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
              <Clock className="size-4" />
              {formatTiming(elapsedMs)}
              {isInProgress && " / 60s target"}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <Progress
          value={isComplete ? 100 : progress}
          variant={variant}
          aria-label={`Generation progress: ${progress}%`}
        />

        {/* Stage list */}
        <div
          className="space-y-2 text-sm"
          role="list"
          aria-label="Generation stages"
        >
          {stages.map((stage) => {
            const stageProgress = getStageProgress(stage);
            const isStageComplete = progress > stageProgress || isComplete;
            const isStageCurrent = stage === currentStage && isInProgress;
            const isStagePending = progress < stageProgress && !isComplete;

            return (
              <div
                key={stage}
                className="flex items-center gap-2"
                role="listitem"
                aria-current={isStageCurrent ? "step" : undefined}
              >
                {/* Status icon */}
                {isStageComplete && (
                  <CheckCircle2
                    className="size-4 text-success flex-shrink-0"
                    aria-label="Completed"
                  />
                )}
                {isStageCurrent && (
                  <Loader2
                    className="size-4 animate-spin flex-shrink-0"
                    aria-label="In progress"
                  />
                )}
                {isStagePending && (
                  <Clock
                    className="size-4 text-muted-foreground flex-shrink-0"
                    aria-label="Pending"
                  />
                )}

                {/* Stage name */}
                <span
                  className={cn(
                    "flex-1",
                    isStageComplete && "text-foreground",
                    isStageCurrent && "text-foreground font-medium",
                    isStagePending && "text-muted-foreground"
                  )}
                >
                  {getStageDisplayName(stage)}
                </span>

                {/* Progress percentage */}
                <span className="text-xs text-muted-foreground">
                  {stageProgress}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {isFailed && error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Generation Error
              </p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success message with fix attempts */}
        {isComplete && !error && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-md">
              <CheckCircle2 className="size-4 text-success flex-shrink-0" />
              <p className="text-sm text-success font-medium">
                Component generated successfully in {formatTiming(elapsedMs)}
              </p>
            </div>

            {/* Fix attempts indicator */}
            {validationResults && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                {fixAttempts === 0 ? (
                  <CheckCheck className="size-4 text-success flex-shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 text-warning flex-shrink-0" />
                )}
                <p className="text-sm text-muted-foreground">
                  {getFixAttemptsMessage(fixAttempts)}
                </p>
              </div>
            )}

            {/* Validation results summary */}
            {validationResults && isComplete && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <span className="text-muted-foreground">TypeScript:</span>
                  <Badge
                    variant={
                      validationResults.typescript_passed ? "success" : "error"
                    }
                  >
                    {validationResults.typescript_passed
                      ? "✓ Passed"
                      : `✗ ${validationResults.typescript_errors.length} errors`}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <span className="text-muted-foreground">ESLint:</span>
                  <Badge
                    variant={
                      validationResults.eslint_passed ? "success" : "warning"
                    }
                  >
                    {validationResults.eslint_passed
                      ? "✓ Passed"
                      : `⚠ ${validationResults.eslint_errors.length} errors, ${validationResults.eslint_warnings.length} warnings`}
                  </Badge>
                </div>
              </div>
            )}

            {/* Quality scores */}
            {qualityScores && isComplete && (
              <div className="p-3 bg-muted rounded-md space-y-2">
                <p className="text-sm font-medium">Quality Scores</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Overall:</span>
                    <Badge
                      variant={
                        qualityScores.overall >= 80
                          ? "success"
                          : qualityScores.overall >= 60
                          ? "warning"
                          : "error"
                      }
                    >
                      {qualityScores.overall}/100
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Type Safety:</span>
                    <Badge
                      variant={
                        qualityScores.type_safety >= 90 ? "success" : "warning"
                      }
                    >
                      {qualityScores.type_safety}/100
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Compilation:</span>
                    <Badge
                      variant={qualityScores.compilation ? "success" : "error"}
                    >
                      {qualityScores.compilation ? "✓" : "✗"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Linting:</span>
                    <Badge
                      variant={
                        qualityScores.linting >= 90 ? "success" : "warning"
                      }
                    >
                      {qualityScores.linting}/100
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance note */}
        {isInProgress && elapsedMs > 60000 && (
          <p className="text-xs text-warning">
            Generation taking longer than expected (target: 60s)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
