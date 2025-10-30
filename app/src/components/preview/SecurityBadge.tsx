"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { CodeSanitizationResults } from "@/types"
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SecurityBadgeProps {
  /** Code sanitization results to display */
  sanitizationResults?: CodeSanitizationResults
  /** Additional CSS classes */
  className?: string
  /** Whether to show the badge in compact mode (icon only) */
  compact?: boolean
  /** Click handler for viewing details */
  onClick?: () => void
}

/**
 * SecurityBadge - Displays security validation status for generated code
 * 
 * Epic 003 - Story 3.2: Shows visual indicator of code security status
 * - Green checkmark: No security violations found
 * - Red alert: Security violations detected
 * - Gray: Security check not run or skipped
 * 
 * @example
 * ```tsx
 * <SecurityBadge
 *   sanitizationResults={sanitizationResults}
 *   onClick={() => setShowDetails(true)}
 * />
 * ```
 */
export function SecurityBadge({
  sanitizationResults,
  className,
  compact = false,
  onClick,
}: SecurityBadgeProps) {
  // Determine security status
  const hasSecurityCheck = sanitizationResults !== undefined
  const isSafe = sanitizationResults?.is_safe ?? false
  const issueCount = sanitizationResults?.issues?.length ?? 0

  // Get appropriate icon
  const getIcon = () => {
    if (!hasSecurityCheck) {
      return <Shield className="size-3" />
    }
    if (isSafe) {
      return <ShieldCheck className="size-3" />
    }
    return <ShieldAlert className="size-3" />
  }

  // Get appropriate variant
  const getVariant = (): "success" | "error" | "neutral" => {
    if (!hasSecurityCheck) return "neutral"
    if (isSafe) return "success"
    return "error"
  }

  // Get label text
  const getLabel = () => {
    if (!hasSecurityCheck) return "Security Check Skipped"
    if (isSafe) return "Security Verified"
    return issueCount === 1 ? "1 Security Issue" : `${issueCount} Security Issues`
  }

  return (
    <Badge
      variant={getVariant()}
      className={cn(
        "cursor-pointer transition-opacity hover:opacity-80",
        className
      )}
      onClick={onClick}
    >
      {getIcon()}
      {!compact && <span className="ml-1.5">{getLabel()}</span>}
    </Badge>
  )
}
