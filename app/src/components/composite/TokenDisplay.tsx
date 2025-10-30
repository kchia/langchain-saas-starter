"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge, ConfidenceBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/ui/code-block"
import { Edit } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TokenDisplayProps {
  /**
   * Type of token being displayed (color, typography, or spacing)
   */
  tokenType: "color" | "typography" | "spacing"
  
  /**
   * The value of the token (e.g., "#3B82F6", "16px", "Inter")
   */
  value: string
  
  /**
   * Confidence score from 0 to 1
   */
  confidence: number
  
  /**
   * Whether the token is editable (shows Edit button)
   */
  editable?: boolean
  
  /**
   * Optional callback when edit button is clicked
   */
  onEdit?: () => void
  
  /**
   * Optional token name/label
   */
  name?: string
  
  /**
   * Optional className for customization
   */
  className?: string
}

/**
 * Renders a color swatch preview
 */
function ColorSwatch({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="size-12 rounded-md border border-gray-200 shadow-sm"
        style={{ backgroundColor: color }}
        aria-label={`Color swatch: ${color}`}
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{color}</span>
        <span className="text-xs text-gray-500">Color Token</span>
      </div>
    </div>
  )
}

/**
 * Renders a typography preview
 */
function TypographyPreview({ value }: { value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="text-2xl font-medium text-gray-900"
        style={{ fontFamily: value.includes("px") ? undefined : value }}
      >
        Aa
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{value}</span>
        <span className="text-xs text-gray-500">Typography Token</span>
      </div>
    </div>
  )
}

/**
 * Renders a spacing preview
 */
function SpacingPreview({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 border border-gray-300 rounded-md bg-gray-50">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-sm"
          style={{ width: value, height: value }}
          aria-label={`Spacing preview: ${value}`}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{value}</span>
        <span className="text-xs text-gray-500">Spacing Token</span>
      </div>
    </div>
  )
}

/**
 * TokenDisplay - Composite component for displaying design tokens
 * 
 * Composes: Card + color swatch/preview + Badge (confidence) + Button (Edit) + code display
 * 
 * @example
 * ```tsx
 * <TokenDisplay
 *   tokenType="color"
 *   value="#3B82F6"
 *   confidence={0.94}
 *   editable
 *   onEdit={() => console.log('Edit clicked')}
 * />
 * ```
 */
export function TokenDisplay({
  tokenType,
  value,
  confidence,
  editable = false,
  onEdit,
  name,
  className,
}: TokenDisplayProps) {
  const [showCode, setShowCode] = React.useState(false)

  // Generate code representation based on token type
  const generateCode = () => {
    const tokenName = name || `${tokenType}Token`
    switch (tokenType) {
      case "color":
        return `// CSS Variable\n--${tokenName}: ${value};\n\n// Tailwind Config\ncolors: {\n  ${tokenName}: "${value}",\n}`
      case "typography":
        return `// CSS Variable\n--font-${tokenName}: ${value};\n\n// Tailwind Config\nfontFamily: {\n  ${tokenName}: ["${value}", "sans-serif"],\n}`
      case "spacing":
        return `// CSS Variable\n--spacing-${tokenName}: ${value};\n\n// Tailwind Config\nspacing: {\n  ${tokenName}: "${value}",\n}`
    }
  }

  return (
    <Card
      variant="outlined"
      className={cn("w-full", className)}
      data-testid="token-display"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="uppercase text-[10px]">
              {tokenType}
            </Badge>
            <ConfidenceBadge score={confidence} />
          </div>
          {editable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              aria-label="Edit token"
              className="h-7"
            >
              <Edit className="size-3.5" />
              <span className="text-xs">Edit</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Token Preview */}
        <div className="rounded-md border border-gray-100 bg-gray-50/50 p-4">
          {tokenType === "color" && <ColorSwatch color={value} />}
          {tokenType === "typography" && <TypographyPreview value={value} />}
          {tokenType === "spacing" && <SpacingPreview value={value} />}
        </div>

        {/* Code Display Toggle */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
            className="w-full text-xs"
            aria-expanded={showCode}
            aria-label={showCode ? "Hide code" : "Show code"}
          >
            {showCode ? "Hide" : "Show"} Code
          </Button>

          {showCode && (
            <CodeBlock
              code={generateCode()}
              language="css"
              maxHeight="200px"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
