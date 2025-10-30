"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Simple Spinner component for ProgressStages
const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

export interface ProgressStagesProps {
  /** Array of stage names to display */
  stages: string[]
  /** Current stage index (0-based) */
  currentStage: number
  /** Visual variant for the progress bar */
  variant?: "default" | "success" | "warning" | "error"
  /** Size of the progress bar */
  size?: "sm" | "md" | "lg"
  /** Additional CSS classes */
  className?: string
  /** ARIA label for the progress bar */
  ariaLabel?: string
}

/**
 * ProgressStages - Composite component that combines a Progress bar with a stage list
 * 
 * Displays a progress bar with a list of stages below it, showing:
 * - Completed stages with a checkmark (✅)
 * - Current stage with a spinner
 * - Pending stages with a hourglass (⏳)
 * 
 * @example
 * ```tsx
 * <ProgressStages
 *   stages={['Upload Screenshot', 'Extract Tokens', 'Generate Component']}
 *   currentStage={1}
 *   variant="default"
 * />
 * ```
 */
export function ProgressStages({
  stages,
  currentStage,
  variant = "default",
  size = "md",
  className,
  ariaLabel,
}: ProgressStagesProps) {
  const progress = ((currentStage + 1) / stages.length) * 100
  const completedStages = currentStage
  const totalStages = stages.length

  return (
    <div className={cn("space-y-2", className)} role="group" aria-label={ariaLabel || "Progress stages"}>
      <Progress 
        value={progress} 
        variant={variant} 
        size={size}
        aria-label={ariaLabel || `Progress: ${completedStages + 1} of ${totalStages} stages complete`}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      <div className="space-y-1 text-sm" role="list" aria-label="Stage list">
        {stages.map((stage, index) => {
          const isCompleted = index < currentStage
          const isCurrent = index === currentStage
          const isPending = index > currentStage
          
          return (
            <div 
              key={index} 
              className="flex items-center gap-2"
              role="listitem"
              aria-current={isCurrent ? "step" : undefined}
            >
              {isCompleted && (
                <span className="text-success" aria-label="Completed">
                  ✅
                </span>
              )}
              {isCurrent && (
                <Spinner className="w-4 h-4" aria-label="In progress" />
              )}
              {isPending && (
                <span className="text-muted-foreground" aria-label="Pending">
                  ⏳
                </span>
              )}
              <span 
                className={cn(
                  index <= currentStage ? "" : "text-muted-foreground"
                )}
              >
                {stage}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
