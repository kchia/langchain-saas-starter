"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfidenceBadge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface SpacingEditorProps {
  /**
   * Label for the spacing input
   */
  label: string
  
  /**
   * Current spacing value (with unit, e.g., "16px")
   */
  value: string
  
  /**
   * Confidence score (0-1)
   */
  confidence: number
  
  /**
   * Callback when spacing changes
   */
  onChange?: (value: string) => void
  
  /**
   * Error message to display
   */
  error?: string
  
  /**
   * Optional className
   */
  className?: string
}

/**
 * Validates spacing value (must be multiple of 4px, minimum 4px)
 */
function isValidSpacing(value: string): boolean {
  const match = value.match(/^(\d+)px$/)
  if (!match) return false
  
  const num = parseInt(match[1])
  return num > 0 && num % 4 === 0
}

/**
 * SpacingEditor - Component for editing spacing tokens
 * 
 * @example
 * ```tsx
 * <SpacingEditor
 *   label="Padding"
 *   value="16px"
 *   confidence={0.85}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */
export function SpacingEditor({
  label,
  value,
  confidence,
  onChange,
  error,
  className,
}: SpacingEditorProps) {
  const [localValue, setLocalValue] = React.useState(value)
  const [isValid, setIsValid] = React.useState(true)

  // Sync with external value changes
  React.useEffect(() => {
    setLocalValue(value)
    setIsValid(isValidSpacing(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow typing numbers
    if (/^\d*$/.test(inputValue)) {
      const newValue = inputValue ? `${inputValue}px` : ""
      setLocalValue(inputValue)
      
      if (inputValue) {
        const valid = isValidSpacing(newValue)
        setIsValid(valid)
        
        if (valid && onChange) {
          onChange(newValue)
        }
      }
    }
  }

  // Parse current value to get just the number
  const numericValue = localValue.replace("px", "")

  return (
    <div className={cn("space-y-2", className)} data-testid="spacing-editor">
      <div className="flex items-center justify-between">
        <Label htmlFor={`spacing-${label}`} className="text-sm font-medium">
          {label}
        </Label>
        <ConfidenceBadge score={confidence} />
      </div>
      
      <div className="flex gap-3 items-center">
        {/* Spacing preview */}
        <div className="relative size-16 rounded-md border border-gray-300 bg-gray-50 shrink-0">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-sm"
            style={{
              width: isValid && numericValue ? `${Math.min(parseInt(numericValue), 56)}px` : '0px',
              height: isValid && numericValue ? `${Math.min(parseInt(numericValue), 56)}px` : '0px',
            }}
            aria-label={`Spacing preview: ${localValue || '0px'}`}
          />
        </div>
        
        {/* Input with unit */}
        <div className="flex-1 relative">
          <Input
            id={`spacing-${label}`}
            type="text"
            value={numericValue}
            onChange={handleChange}
            placeholder="0"
            variant={!isValid || error ? "error" : "default"}
            className="pr-10"
            aria-invalid={!isValid || !!error}
            aria-describedby={error ? `spacing-${label}-error` : undefined}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            px
          </span>
        </div>
      </div>
      
      {/* Error message or hint */}
      {error || (!isValid && numericValue) ? (
        <p
          id={`spacing-${label}-error`}
          className="text-sm text-red-600"
          role="alert"
        >
          {error || "Spacing must be a multiple of 4px (e.g., 4, 8, 16, 24)"}
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          Use multiples of 4px (4, 8, 12, 16, 24, etc.)
        </p>
      )}
    </div>
  )
}
