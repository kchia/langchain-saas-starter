import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The title/label of the metric
   */
  title: string
  /**
   * The main value to display (can be a number or string)
   */
  value: string | number
  /**
   * Optional subtitle or additional context
   */
  subtitle?: string
  /**
   * Optional trend indicator (e.g., "+25%", "-12%")
   */
  trend?: string
  /**
   * Optional icon component from lucide-react
   */
  icon?: LucideIcon
}

/**
 * MetricCard - A composite component for displaying dashboard metrics
 * 
 * Composition: Card (elevated variant) + number display + trend indicator + icon
 * 
 * @example
 * ```tsx
 * import { MetricCard } from "@/components/composite/MetricCard"
 * import { Users } from "lucide-react"
 * 
 * <MetricCard
 *   title="Components"
 *   value={12}
 *   subtitle="+3 this week"
 *   trend="+25%"
 *   icon={Users}
 * />
 * ```
 */
export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, subtitle, trend, icon: Icon, ...props }, ref) => {
    // Determine trend color based on the value
    const trendColor = trend?.startsWith('+') 
      ? 'text-success' 
      : trend?.startsWith('-') 
      ? 'text-destructive' 
      : 'text-muted-foreground'

    return (
      <Card
        ref={ref}
        variant="elevated"
        className={cn("hover:shadow-md transition-shadow", className)}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">{title}</p>
              <p className="text-3xl font-bold mb-2" aria-label={`${title}: ${value}`}>
                {value}
              </p>
              {trend && (
                <p className={cn("text-sm font-medium", trendColor)} aria-label={`Trend: ${trend}`}>
                  {trend}
                </p>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            {Icon && (
              <Icon 
                className="h-5 w-5 text-muted-foreground flex-shrink-0" 
                aria-hidden="true"
              />
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)

MetricCard.displayName = "MetricCard"
