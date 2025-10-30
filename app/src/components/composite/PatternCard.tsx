import * as React from "react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export interface PatternCardProps {
  /** Unique identifier for the pattern */
  patternId: string
  /** Name of the pattern */
  name: string
  /** Version of the pattern */
  version: string
  /** Match score (0-1) indicating how well the pattern matches */
  matchScore: number
  /** Additional metadata about the pattern */
  metadata?: {
    description?: string
    author?: string
    tags?: string[]
  }
  /** Whether this pattern is currently selected */
  selected?: boolean
  /** Callback when the pattern is selected */
  onSelect?: () => void
  /** Callback when preview is requested */
  onPreview?: () => void
  /** Additional CSS classes */
  className?: string
}

export function PatternCard({
  patternId,
  name,
  version,
  matchScore,
  metadata,
  selected = false,
  onSelect,
  onPreview,
  className,
}: PatternCardProps) {
  // Determine badge variant based on match score
  const scoreVariant = matchScore >= 0.9 ? "success" : matchScore >= 0.7 ? "warning" : "error"
  
  // Format match score as percentage
  const scorePercentage = Math.round(matchScore * 100)

  return (
    <Card
      variant={selected ? "interactive" : "outlined"}
      className={cn(
        "transition-all",
        selected && "border-primary bg-blue-50/30 dark:bg-blue-950/20",
        className
      )}
      aria-label={`Pattern ${name}, match score ${scorePercentage}%${selected ? ', selected' : ''}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold leading-none tracking-tight truncate">
                {name}
              </h3>
              {selected && (
                <Badge variant="info" aria-label="Selected pattern">
                  SELECTED
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              v{version} · {patternId}
            </p>
          </div>
          <Badge variant={scoreVariant} size="lg" aria-label={`Match score ${scorePercentage}%`}>
            {scorePercentage}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Match score visualization */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Match Score</span>
            <span className="font-medium">{matchScore.toFixed(2)}</span>
          </div>
          <Progress 
            value={scorePercentage} 
            variant={scoreVariant}
            aria-label={`Match score progress: ${scorePercentage}%`}
          />
        </div>

        {/* Metadata */}
        {metadata?.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {metadata.description}
          </p>
        )}

        {metadata?.author && (
          <p className="text-xs text-muted-foreground mb-2">
            By {metadata.author}
          </p>
        )}

        {metadata?.tags && metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Pattern tags">
            {metadata.tags.map((tag, index) => (
              <Badge key={index} variant="neutral" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        {onPreview && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onPreview}
            aria-label={`Preview code for ${name}`}
          >
            👁️ Preview Code
          </Button>
        )}
        {onSelect && (
          <Button
            variant={selected ? "outline" : "default"}
            size="sm"
            onClick={onSelect}
            aria-label={selected ? `Deselect ${name}` : `Select ${name}`}
            aria-pressed={selected}
          >
            {selected ? "Selected" : "✓ Select This Pattern"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
