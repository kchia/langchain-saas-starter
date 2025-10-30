"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CodeSanitizationResults, SecurityIssue } from "@/types"
import { ShieldAlert, ShieldCheck, AlertTriangle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SecurityIssuesPanelProps {
  /** Code sanitization results to display */
  sanitizationResults: CodeSanitizationResults
  /** Additional CSS classes */
  className?: string
}

/**
 * SecurityIssuesPanel - Displays detailed security violations found in generated code
 * 
 * Epic 003 - Story 3.2: Shows security issues by line number with:
 * - Pattern that was matched (e.g., "eval()", "dangerouslySetInnerHTML")
 * - Severity level (high, medium, low)
 * - Line number where violation occurs
 * - Explanation of each violation type
 * - Optional sanitized code version
 * 
 * @example
 * ```tsx
 * <SecurityIssuesPanel
 *   sanitizationResults={sanitizationResults}
 * />
 * ```
 */
export function SecurityIssuesPanel({
  sanitizationResults,
  className,
}: SecurityIssuesPanelProps) {
  const { is_safe, issues, sanitized_code } = sanitizationResults
  const issueCount = issues.length

  // Get human-readable explanation for security patterns
  const getPatternExplanation = (pattern: string): string => {
    const explanations: Record<string, string> = {
      'eval\\s*\\(': 'Use of eval() allows arbitrary code execution and is a major security risk',
      'dangerouslySetInnerHTML': 'Direct HTML injection can lead to XSS (Cross-Site Scripting) attacks',
      '__proto__': 'Prototype pollution can allow attackers to modify object prototypes',
      'document\\.write': 'document.write can enable XSS attacks and should be avoided',
      'innerHTML\\s*=': 'Setting innerHTML directly can introduce XSS vulnerabilities',
      'new\\s+Function\\s*\\(': 'Dynamic function creation is similar to eval() and poses security risks',
      '(password|api[_-]?key|secret)\\s*=\\s*["\'][^"\']+["\']': 'Hardcoded secrets should never be stored in code',
      'process\\.env\\.': 'Exposing environment variables in client-side code can leak sensitive data',
    }

    return explanations[pattern] || 'This pattern has been flagged as a potential security risk'
  }

  // Get severity color - returns Badge variant type
  const getSeverityVariant = (
    severity: SecurityIssue['severity']
  ): NonNullable<BadgeProps['variant']> => {
    switch (severity) {
      case 'critical': return 'error'  // Treat critical as error (red)
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'neutral'
      default: return 'warning'  // Fallback for unknown severities
    }
  }

  // Render individual security issue
  const renderIssue = (issue: SecurityIssue, index: number) => (
    <div 
      key={`security-issue-${index}-${issue.line}`}
      className="p-3 bg-muted rounded-md space-y-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <XCircle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
          <span className="text-sm font-mono">Line {issue.line}</span>
        </div>
        <Badge variant={getSeverityVariant(issue.severity)} className="text-xs">
          {issue.severity.toUpperCase()}
        </Badge>
      </div>
      
      {/* Pattern matched */}
      <div className="pl-6">
        <p className="text-sm font-medium text-foreground">
          Pattern: <code className="px-1.5 py-0.5 bg-background rounded text-xs">{issue.pattern}</code>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {issue.message || getPatternExplanation(issue.pattern)}
        </p>
      </div>
    </div>
  )

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Security Analysis</span>
          <div className="flex items-center gap-2">
            {is_safe ? (
              <Badge variant="success">
                <ShieldCheck className="size-3 mr-1" />
                Safe
              </Badge>
            ) : (
              <Badge variant="error">
                <ShieldAlert className="size-3 mr-1" />
                {issueCount} {issueCount === 1 ? 'Issue' : 'Issues'} Found
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* No issues - safe code */}
        {is_safe && (
          <Alert>
            <ShieldCheck className="size-4" />
            <AlertDescription>
              <strong>No security vulnerabilities detected!</strong>
              <p className="text-sm text-muted-foreground mt-2">
                The generated code was scanned for the following security risks:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-1.5 text-sm text-muted-foreground">
                <li><strong className="text-foreground">Code Injection</strong> - eval(), Function constructor</li>
                <li><strong className="text-foreground">XSS Vulnerabilities</strong> - dangerouslySetInnerHTML, innerHTML, document.write</li>
                <li><strong className="text-foreground">Prototype Pollution</strong> - __proto__, constructor.prototype manipulation</li>
                <li><strong className="text-foreground">Hardcoded Secrets</strong> - API keys, passwords, tokens</li>
                <li><strong className="text-foreground">SQL Injection</strong> - Unsafe query construction</li>
                <li><strong className="text-foreground">Environment Variable Exposure</strong> - Client-side process.env access</li>
                <li><strong className="text-foreground">Unsafe HTML</strong> - Direct outerHTML assignment</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Security issues found */}
        {!is_safe && (
          <>
            <Alert variant="error">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                Security violations detected in the generated code. Please review and fix before using in production.
              </AlertDescription>
            </Alert>

            {/* List of issues */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <XCircle className="size-4 text-destructive" />
                Security Violations ({issueCount})
              </h4>
              <div className="space-y-2">
                {issues.map((issue, index) => renderIssue(issue, index))}
              </div>
            </div>

            {/* Sanitized code available */}
            {sanitized_code && (
              <Alert>
                <AlertDescription>
                  <strong>Sanitized version available:</strong> The system has attempted to remove the security violations. 
                  Review the sanitized code carefully before use.
                </AlertDescription>
              </Alert>
            )}

            {/* Recommendations */}
            <Alert>
              <AlertDescription>
                <strong>Recommended actions:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Review each violation and understand the security risk</li>
                  <li>Regenerate the component with more specific requirements</li>
                  <li>Manually fix the issues in your code editor</li>
                  <li>Never deploy code with high-severity security violations</li>
                </ul>
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  )
}
