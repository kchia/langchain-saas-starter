"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ValidationError, ValidationResults } from "@/types"
import { AlertCircle, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ValidationErrorsDisplayProps {
  /** Validation results to display */
  validationResults: ValidationResults
  /** Additional CSS classes */
  className?: string
}

/**
 * ValidationErrorsDisplay - Shows detailed validation errors and warnings
 * 
 * Epic 4.5: Displays TypeScript and ESLint validation results with:
 * - Error count summary
 * - Line numbers and error messages
 * - Error codes (TypeScript) or rule IDs (ESLint)
 * - Suggestions for fixes
 * 
 * @example
 * ```tsx
 * <ValidationErrorsDisplay
 *   validationResults={validationResults}
 * />
 * ```
 */
export function ValidationErrorsDisplay({
  validationResults,
  className,
}: ValidationErrorsDisplayProps) {
  const hasErrors = 
    validationResults.typescript_errors.length > 0 || 
    validationResults.eslint_errors.length > 0

  const hasWarnings = validationResults.eslint_warnings.length > 0

  const totalErrors = 
    validationResults.typescript_errors.length + 
    validationResults.eslint_errors.length

  const totalWarnings = validationResults.eslint_warnings.length

  // Render individual error
  const renderError = (error: ValidationError, type: 'typescript' | 'eslint' | 'warning') => (
    <div 
      key={`${type}-${error.line}-${error.column}-${error.message}`}
      className="p-3 bg-muted rounded-md space-y-1"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {type === 'warning' ? (
            <AlertTriangle className="size-4 text-warning flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-mono">
            Line {error.line}:{error.column}
          </span>
        </div>
        {(error.code || error.ruleId) && (
          <Badge variant="neutral" className="text-xs">
            {error.code || error.ruleId}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground pl-6">
        {error.message}
      </p>
    </div>
  )

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Validation Results</span>
          <div className="flex items-center gap-2">
            {validationResults.final_status === 'passed' && (
              <Badge variant="success">
                <CheckCircle2 className="size-3 mr-1" />
                Passed
              </Badge>
            )}
            {validationResults.final_status === 'failed' && (
              <Badge variant="error">
                <AlertCircle className="size-3 mr-1" />
                Failed
              </Badge>
            )}
            {validationResults.attempts > 0 && (
              <Badge variant="warning">
                {validationResults.attempts} fix {validationResults.attempts === 1 ? 'attempt' : 'attempts'}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-muted rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">TypeScript</span>
              <Badge variant={validationResults.typescript_passed ? "success" : "error"}>
                {validationResults.typescript_passed ? "✓" : `✗ ${validationResults.typescript_errors.length}`}
              </Badge>
            </div>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ESLint</span>
              <Badge variant={validationResults.eslint_passed ? "success" : "warning"}>
                {validationResults.eslint_passed 
                  ? "✓" 
                  : `${validationResults.eslint_errors.length}E / ${validationResults.eslint_warnings.length}W`
                }
              </Badge>
            </div>
          </div>
        </div>

        {/* No errors message */}
        {!hasErrors && !hasWarnings && (
          <Alert>
            <CheckCircle2 className="size-4" />
            <AlertDescription>
              All validation checks passed! The generated code has no TypeScript or ESLint errors.
            </AlertDescription>
          </Alert>
        )}

        {/* TypeScript errors */}
        {validationResults.typescript_errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <XCircle className="size-4 text-destructive" />
              TypeScript Errors ({validationResults.typescript_errors.length})
            </h4>
            <div className="space-y-2">
              {validationResults.typescript_errors.map((error) => 
                renderError(error, 'typescript')
              )}
            </div>
          </div>
        )}

        {/* ESLint errors */}
        {validationResults.eslint_errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <XCircle className="size-4 text-destructive" />
              ESLint Errors ({validationResults.eslint_errors.length})
            </h4>
            <div className="space-y-2">
              {validationResults.eslint_errors.map((error) => 
                renderError(error, 'eslint')
              )}
            </div>
          </div>
        )}

        {/* ESLint warnings */}
        {validationResults.eslint_warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" />
              ESLint Warnings ({validationResults.eslint_warnings.length})
            </h4>
            <div className="space-y-2">
              {validationResults.eslint_warnings.map((error) => 
                renderError(error, 'warning')
              )}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {hasErrors && (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              {validationResults.attempts >= 2 
                ? "The LLM attempted to fix these issues but was unable to resolve them after 2 attempts. You may need to manually fix these errors or try regenerating."
                : "These errors were detected after validation. You can try regenerating the component for a different result."
              }
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
