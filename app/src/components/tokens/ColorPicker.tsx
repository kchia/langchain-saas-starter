"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfidenceBadge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ColorPickerProps {
  /**
   * Label for the color picker
   */
  label: string
  
  /**
   * Current hex color value
   */
  value: string
  
  /**
   * Confidence score (0-1)
   */
  confidence: number
  
  /**
   * Callback when color changes
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
 * Validates hex color format
 */
function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

/**
 * ColorPicker - Component for selecting and editing hex colors
 * 
 * @example
 * ```tsx
 * <ColorPicker
 *   label="Primary"
 *   value="#3B82F6"
 *   confidence={0.92}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */
export function ColorPicker({
  label,
  value,
  confidence,
  onChange,
  error,
  className,
}: ColorPickerProps) {
  const [localValue, setLocalValue] = React.useState(value)
  const [isValid, setIsValid] = React.useState(true)

  // Sync with external value changes
  React.useEffect(() => {
    setLocalValue(value)
    setIsValid(isValidHex(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase()
    setLocalValue(newValue)
    
    const valid = isValidHex(newValue)
    setIsValid(valid)
    
    if (valid && onChange) {
      onChange(newValue)
    }
  }

  return (
    <div className={cn("space-y-2", className)} data-testid="color-picker">
      <div className="flex items-center justify-between">
        <Label htmlFor={`color-${label}`} className="text-sm font-medium">
          {label}
        </Label>
        <ConfidenceBadge score={confidence} />
      </div>
      
      <div className="flex gap-3 items-center">
        {/* Color swatch preview */}
        <div
          className="size-10 rounded-md border border-gray-200 shadow-sm shrink-0"
          style={{ backgroundColor: isValid ? localValue : '#cccccc' }}
          aria-label={`Color preview: ${localValue}`}
        />
        
        {/* Hex input */}
        <Input
          id={`color-${label}`}
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder="#RRGGBB"
          variant={!isValid || error ? "error" : "default"}
          className="font-mono uppercase"
          maxLength={7}
          aria-invalid={!isValid || !!error}
          aria-describedby={error ? `color-${label}-error` : undefined}
        />
        
        {/* Native color picker */}
        <input
          type="color"
          value={isValid ? localValue : '#cccccc'}
          onChange={(e) => {
            const newValue = e.target.value.toUpperCase()
            setLocalValue(newValue)
            setIsValid(true)
            if (onChange) {
              onChange(newValue)
            }
          }}
          className="size-10 rounded-md border border-gray-200 cursor-pointer shrink-0"
          aria-label={`Color picker for ${label}`}
        />
      </div>
      
      {/* Error message */}
      {(error || (!isValid && localValue)) && (
        <p
          id={`color-${label}-error`}
          className="text-sm text-red-600"
          role="alert"
        >
          {error || "Invalid hex color. Use format #RRGGBB"}
        </p>
      )}
    </div>
  )
}
