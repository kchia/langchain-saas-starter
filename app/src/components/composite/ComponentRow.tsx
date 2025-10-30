import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ComponentRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Name of the component
   */
  name: string
  
  /**
   * Timestamp of when the component was generated
   */
  timestamp: string
  
  /**
   * Token adherence percentage (0-100)
   */
  tokenAdherence: number
  
  /**
   * Number of critical accessibility issues
   */
  a11yScore: number
  
  /**
   * Generation latency in seconds
   */
  latency: number
  
  /**
   * Pattern used for generation
   */
  pattern: string
  
  /**
   * Callback when View button is clicked
   */
  onView?: () => void
}

/**
 * ComponentRow - A composite component for displaying component generation results
 * 
 * Combines Card-like styling with Badge components for metrics and a View button.
 * Used on the Dashboard page to show recent components.
 */
export const ComponentRow = React.forwardRef<HTMLDivElement, ComponentRowProps>(
  (
    {
      name,
      timestamp,
      tokenAdherence,
      a11yScore,
      latency,
      pattern,
      onView,
      className,
      ...props
    },
    ref
  ) => {
    // Determine badge variants based on values
    const tokenVariant = tokenAdherence >= 90 ? "success" : tokenAdherence >= 70 ? "warning" : "error"
    const a11yVariant = a11yScore === 0 ? "success" : a11yScore <= 2 ? "warning" : "error"
    const tokenIcon = tokenAdherence >= 90 ? "✅" : tokenAdherence >= 70 ? "⚠️" : "❌"
    const a11yIcon = a11yScore === 0 ? "✅" : a11yScore <= 2 ? "⚠️" : "❌"

    return (
      <div
        ref={ref}
        className={cn(
          "px-6 py-4 flex items-center justify-between transition-colors border-b border-gray-200 last:border-b-0 hover:bg-gray-50",
          className
        )}
        {...props}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium text-gray-900">{name}</h3>
            <span className="text-sm text-gray-500">{timestamp}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm mb-1">
            <span className="flex items-center gap-1">
              <Badge variant={tokenVariant} className="flex items-center gap-1">
                <span>{tokenIcon}</span>
                <span>{tokenAdherence}% tokens</span>
              </Badge>
            </span>
            
            <span className="flex items-center gap-1">
              <Badge variant={a11yVariant} className="flex items-center gap-1">
                <span>{a11yIcon}</span>
                <span>{a11yScore} critical a11y</span>
              </Badge>
            </span>
            
            <span className="text-gray-600">{latency}s</span>
          </div>
          
          <p className="text-sm text-gray-600">Pattern: {pattern}</p>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onView}
          aria-label={`View ${name} component details`}
        >
          View
        </Button>
      </div>
    )
  }
)

ComponentRow.displayName = "ComponentRow"
