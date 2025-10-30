import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "bg-muted dark:bg-muted/50",
  {
    variants: {
      variant: {
        text: "h-4 w-full rounded",
        circle: "rounded-full aspect-square",
        rectangle: "rounded-md w-full",
      },
      animation: {
        pulse: "animate-pulse",
        wave: "animate-wave bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
        none: "",
      },
    },
    defaultVariants: {
      variant: "rectangle",
      animation: "pulse",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, animation, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-live="polite"
        className={cn(skeletonVariants({ variant, animation, className }))}
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)
Skeleton.displayName = "Skeleton"

// Preset skeletons for common use cases
export function TokenSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton variant="rectangle" className="h-12 w-full" />
      <Skeleton variant="rectangle" className="h-12 w-full" />
      <Skeleton variant="rectangle" className="h-12 w-full" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="border border-border rounded-lg p-6 space-y-4">
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
      <Skeleton variant="rectangle" className="h-8 w-full" />
    </div>
  )
}

export { Skeleton, skeletonVariants }
