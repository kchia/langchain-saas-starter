import * as React from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge, ConfidenceBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export interface RequirementCardProps {
  /** Unique identifier for the requirement (e.g., "req-001") */
  id: string
  /** Name/title of the requirement */
  name: string
  /** Type of the requirement (e.g., "Boolean", "String", "Number") */
  type: string
  /** Confidence score from 0 to 1 */
  confidence: number
  /** Rationale explaining why this requirement was identified */
  rationale: string
  /** Possible values for this requirement (e.g., ["true", "false"]) */
  values?: string[]
  /** Category of the requirement (e.g., "Props", "Events", "States", "Accessibility") */
  category: string
  /** Optional callback when Accept button is clicked */
  onAccept?: () => void
  /** Optional callback when Edit button is clicked */
  onEdit?: () => void
  /** Optional callback when Remove button is clicked */
  onRemove?: () => void
  /** Optional className for custom styling */
  className?: string
}

export const RequirementCard = React.forwardRef<HTMLDivElement, RequirementCardProps>(
  (
    {
      id,
      name,
      type,
      confidence,
      rationale,
      values,
      category,
      onAccept,
      onEdit,
      onRemove,
      className,
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant="outlined"
        className={cn("hover:border-gray-300 transition-colors", className)}
      >
        <CardHeader padding="md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="neutral" size="sm" className="font-mono">
                  {id}
                </Badge>
                <Badge variant="info" size="sm">
                  {category}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold">{name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Type:</span>
                <code className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                  {type}
                </code>
              </div>
              {values && values.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">Values:</span>
                  <code className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                    {values.join(", ")}
                  </code>
                </div>
              )}
            </div>
            <div className="flex items-start gap-2">
              <ConfidenceBadge score={confidence} />
            </div>
          </div>
        </CardHeader>

        <CardContent padding="md">
          <div className="space-y-3">
            {/* Rationale in collapsible accordion */}
            <Accordion type="single" collapsible className="border-0">
              <AccordionItem value="rationale" className="border-0">
                <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                  View Rationale
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {rationale}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              {onAccept && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={onAccept}
                  aria-label={`Accept requirement ${id}`}
                >
                  ✓ Accept
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  aria-label={`Edit requirement ${id}`}
                >
                  ✎ Edit
                </Button>
              )}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  aria-label={`Remove requirement ${id}`}
                >
                  ✗ Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

RequirementCard.displayName = "RequirementCard"
