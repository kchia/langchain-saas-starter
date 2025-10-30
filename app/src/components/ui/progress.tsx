"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva(
  "h-full w-full flex-1 transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        error: "bg-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const progressRootVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressRootVariants> {
  indeterminate?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", size = "md", indeterminate = false, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressRootVariants({ size }), className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        progressVariants({ variant }),
        indeterminate && "animate-indeterminate"
      )}
      style={
        indeterminate
          ? { width: '40%' }
          : { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

// Simple Spinner component for ProgressWithStages
const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
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

// Progress with stages subcomponent
export interface ProgressWithStagesProps {
  stages: string[]
  currentStage: number
  variant?: "default" | "success" | "warning" | "error"
  size?: "sm" | "md" | "lg"
}

export function ProgressWithStages({
  stages,
  currentStage,
  variant = "default",
  size = "md",
}: ProgressWithStagesProps) {
  const progress = ((currentStage + 1) / stages.length) * 100

  return (
    <div className="space-y-2">
      <Progress value={progress} variant={variant} size={size} />
      <div className="space-y-1 text-sm">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center gap-2">
            {index < currentStage && <span className="text-success">✅</span>}
            {index === currentStage && <Spinner className="w-4 h-4" />}
            {index > currentStage && <span className="text-muted-foreground">⏳</span>}
            <span className={index <= currentStage ? "" : "text-muted-foreground"}>
              {stage}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { Progress }
