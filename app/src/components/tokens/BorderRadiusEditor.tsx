"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BorderRadiusTokens } from "@/types/api.types"
import { cn } from "@/lib/utils"

export interface BorderRadiusEditorProps {
  /**
   * Border radius tokens with optional values
   */
  tokens?: BorderRadiusTokens
  
  /**
   * Confidence scores for each token (flattened keys like "borderRadius.sm")
   */
  confidence?: Record<string, number>
  
  /**
   * Callback when tokens change
   */
  onChange?: (tokens: BorderRadiusTokens) => void
  
  /**
   * Optional className
   */
  className?: string
}

/**
 * Get confidence badge variant based on score
 */
function getConfidenceBadge(confidence: number) {
  if (confidence >= 0.9) return { variant: "success" as const, label: "High" }
  if (confidence >= 0.7) return { variant: "warning" as const, label: "Medium" }
  return { variant: "error" as const, label: "Low" }
}

/**
 * Validates border radius value (must be px or full)
 */
function isValidRadius(value: string): boolean {
  if (value === "9999px" || value === "50%") return true
  const match = value.match(/^(\d+)px$/)
  return !!match && parseInt(match[1]) >= 0
}

/**
 * BorderRadiusEditor - Component for editing border radius tokens
 * 
 * Displays visual previews of rounded corners with confidence badges
 * 
 * @example
 * ```tsx
 * <BorderRadiusEditor
 *   tokens={{ sm: "2px", md: "6px", lg: "8px" }}
 *   confidence={{ "borderRadius.sm": 0.95 }}
 *   onChange={(tokens) => console.log(tokens)}
 * />
 * ```
 */
export function BorderRadiusEditor({
  tokens = {},
  confidence = {},
  onChange,
  className,
}: BorderRadiusEditorProps) {
  const radiusKeys: Array<keyof BorderRadiusTokens> = [
    "sm",
    "md",
    "lg",
    "xl",
    "full"
  ]

  const [localTokens, setLocalTokens] = React.useState<BorderRadiusTokens>(tokens)
  const [validationErrors, setValidationErrors] = React.useState<Record<string, boolean>>({})

  // Sync with external token changes
  React.useEffect(() => {
    setLocalTokens(tokens)
  }, [tokens])

  const handleChange = (key: keyof BorderRadiusTokens, value: string) => {
    const newTokens = { ...localTokens, [key]: value }
    setLocalTokens(newTokens)
    
    // Validate input
    const isValid = value === "" || isValidRadius(value)
    setValidationErrors((prev) => ({ ...prev, [key]: !isValid }))
    
    if (isValid && onChange) {
      onChange(newTokens)
    }
  }

  // Parse numeric value from px string for input
  const parseValue = (value?: string) => {
    if (!value) return ""
    if (value === "9999px" || value === "50%") return value
    return value.replace("px", "")
  }

  return (
    <div className={cn("space-y-4", className)} data-testid="border-radius-editor">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {radiusKeys.map((key) => {
          const conf = confidence[`borderRadius.${key}`] || 0
          const badge = getConfidenceBadge(conf)
          const value = localTokens[key] || ""
          const hasError = validationErrors[key]
          const numericValue = parseValue(value)

          return (
            <Card key={key} className="p-4" variant="outlined">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor={`radius-${key}`} className="text-sm font-medium capitalize">
                  {key}
                </Label>
                {conf > 0 && (
                  <Badge variant={badge.variant} size="sm">
                    {badge.label} ({Math.round(conf * 100)}%)
                  </Badge>
                )}
              </div>

              <div className="relative mb-3">
                <Input
                  id={`radius-${key}`}
                  type="text"
                  value={numericValue}
                  onChange={(e) => {
                    const inputValue = e.target.value
                    if (key === "full" && (inputValue === "9999px" || inputValue === "50%")) {
                      handleChange(key, inputValue)
                    } else if (/^\d*$/.test(inputValue)) {
                      handleChange(key, inputValue ? `${inputValue}px` : "")
                    }
                  }}
                  placeholder={key === "full" ? "9999px or 50%" : "e.g., 8"}
                  variant={hasError ? "error" : "default"}
                  className={cn(key !== "full" && "pr-10")}
                  aria-invalid={hasError}
                />
                {key !== "full" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    px
                  </span>
                )}
              </div>

              {/* Visual Preview */}
              <div className="flex items-center justify-center h-20 bg-muted rounded">
                <div
                  className="w-16 h-16 bg-primary transition-all"
                  style={{ borderRadius: value || "0px" }}
                  aria-label={`Border radius preview: ${value || "0px"}`}
                />
              </div>

              {hasError && (
                <p className="text-xs text-red-600 mt-2" role="alert">
                  {key === "full" 
                    ? "Use 9999px or 50% for full rounding"
                    : "Enter a valid number in px"}
                </p>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
