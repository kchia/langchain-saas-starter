"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { QualityScores } from "@/types"
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export interface QualityScoresDisplayProps {
  /** Quality scores to display */
  qualityScores: QualityScores
  /** Additional CSS classes */
  className?: string
}

/**
 * QualityScoresDisplay - Shows detailed quality metrics
 * 
 * Epic 4.5: Displays quality scores with:
 * - Overall quality score (0-100)
 * - Type safety score (0-100)
 * - Linting score (0-100)
 * - Compilation status (boolean)
 * - Visual progress bars and badges
 * 
 * Score ranges:
 * - 90-100: Excellent (green)
 * - 80-89: Good (green)
 * - 60-79: Fair (yellow)
 * - 0-59: Poor (red)
 * 
 * @example
 * ```tsx
 * <QualityScoresDisplay
 *   qualityScores={{
 *     overall: 92,
 *     type_safety: 95,
 *     linting: 88,
 *     compilation: true
 *   }}
 * />
 * ```
 */
export function QualityScoresDisplay({
  qualityScores,
  className,
}: QualityScoresDisplayProps) {
  // Determine quality level based on score
  const getQualityLevel = (score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (score >= 90) return 'excellent'
    if (score >= 80) return 'good'
    if (score >= 60) return 'fair'
    return 'poor'
  }

  // Get badge variant based on score
  const getScoreBadgeVariant = (score: number): "success" | "warning" | "error" => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  // Get progress variant based on score
  const getProgressVariant = (score: number): "success" | "warning" | "error" | "default" => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const overallLevel = getQualityLevel(qualityScores.overall)
  const overallMessage = {
    excellent: 'Excellent code quality! Your component meets all best practices.',
    good: 'Good code quality. Minor improvements possible.',
    fair: 'Fair code quality. Some issues should be addressed.',
    poor: 'Code quality needs improvement. Consider regenerating.',
  }[overallLevel]

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quality Scores</span>
          <Badge 
            variant={getScoreBadgeVariant(qualityScores.overall)}
            className="text-base px-3 py-1"
          >
            {qualityScores.overall}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall score with message */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Quality</span>
            <span className="text-sm text-muted-foreground capitalize">
              {overallLevel}
            </span>
          </div>
          <Progress 
            value={qualityScores.overall} 
            variant={getProgressVariant(qualityScores.overall)}
            className="h-3"
          />
          <p className="text-xs text-muted-foreground">
            {overallMessage}
          </p>
        </div>

        {/* Individual metrics */}
        <div className="space-y-4">
          {/* Type Safety */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Type Safety</span>
              <Badge variant={getScoreBadgeVariant(qualityScores.type_safety)}>
                {qualityScores.type_safety}/100
              </Badge>
            </div>
            <Progress 
              value={qualityScores.type_safety} 
              variant={getProgressVariant(qualityScores.type_safety)}
            />
            <p className="text-xs text-muted-foreground">
              {qualityScores.type_safety >= 90 
                ? 'Excellent type coverage with strict TypeScript mode.'
                : qualityScores.type_safety >= 80
                ? 'Good type coverage. A few improvements possible.'
                : 'Type safety could be improved with stricter types.'
              }
            </p>
          </div>

          {/* Linting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Code Quality (Linting)</span>
              <Badge variant={getScoreBadgeVariant(qualityScores.linting)}>
                {qualityScores.linting}/100
              </Badge>
            </div>
            <Progress 
              value={qualityScores.linting} 
              variant={getProgressVariant(qualityScores.linting)}
            />
            <p className="text-xs text-muted-foreground">
              {qualityScores.linting >= 90 
                ? 'Code follows all linting rules and best practices.'
                : qualityScores.linting >= 80
                ? 'Minor linting issues or warnings detected.'
                : 'Several linting issues detected. Review warnings above.'
              }
            </p>
          </div>

          {/* Compilation */}
          <div className="p-3 bg-muted rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {qualityScores.compilation ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <AlertCircle className="size-4 text-destructive" />
                )}
                <span className="text-sm font-medium">TypeScript Compilation</span>
              </div>
              <Badge variant={qualityScores.compilation ? "success" : "error"}>
                {qualityScores.compilation ? "✓ Passed" : "✗ Failed"}
              </Badge>
            </div>
            {!qualityScores.compilation && (
              <p className="text-xs text-muted-foreground mt-2">
                Code has TypeScript compilation errors. Check validation results for details.
              </p>
            )}
          </div>
        </div>

        {/* Quality improvement tip */}
        {qualityScores.overall < 90 && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md">
            <TrendingUp className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Improvement Tip
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {qualityScores.type_safety < 90 
                  ? "Add more explicit type annotations to improve type safety."
                  : qualityScores.linting < 90
                  ? "Review ESLint warnings and apply recommended fixes."
                  : "Try regenerating to see if quality improves."
                }
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
