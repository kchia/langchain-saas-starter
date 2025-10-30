"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "./ColorPicker"
import { TypographyEditor } from "./TypographyEditor"
import { SpacingEditor } from "./SpacingEditor"
import { BorderRadiusEditor } from "./BorderRadiusEditor"
import { ColorTokens, TypographyTokens, SpacingTokens, BorderRadiusTokens } from "@/types/api.types"
import { cn } from "@/lib/utils"

export interface TokenData {
  colors?: ColorTokens
  typography?: TypographyTokens
  spacing?: SpacingTokens
  borderRadius?: BorderRadiusTokens
}

export interface TokenEditorProps {
  /**
   * Token data to edit
   */
  tokens: TokenData
  
  /**
   * Confidence scores (flattened keys like "colors.primary", "borderRadius.md")
   */
  confidence?: Record<string, number>
  
  /**
   * Callback when tokens are saved
   */
  onSave?: (tokens: TokenData) => void
  
  /**
   * Callback when reset is requested
   */
  onReset?: () => void
  
  /**
   * Whether the editor is in a loading state
   */
  loading?: boolean
  
  /**
   * Optional className
   */
  className?: string
}

/**
 * TokenEditor - Main container for editing all design tokens
 * 
 * Composes ColorPicker, TypographyEditor, SpacingEditor, and BorderRadiusEditor components.
 * 
 * @example
 * ```tsx
 * <TokenEditor
 *   tokens={{
 *     colors: { primary: "#3B82F6", background: "#FFFFFF" },
 *     typography: { fontFamily: "Inter", fontSize: "16px" },
 *     spacing: { md: "16px" },
 *     borderRadius: { md: "6px" }
 *   }}
 *   confidence={{
 *     "colors.primary": 0.92,
 *     "typography.fontSize": 0.90
 *   }}
 *   onSave={(tokens) => console.log('Saved:', tokens)}
 *   onReset={() => console.log('Reset clicked')}
 * />
 * ```
 */
export function TokenEditor({
  tokens,
  confidence = {},
  onSave,
  onReset,
  loading = false,
  className,
}: TokenEditorProps) {
  const [editedTokens, setEditedTokens] = React.useState<TokenData>(tokens)
  const [hasChanges, setHasChanges] = React.useState(false)

  // Sync with external tokens changes
  React.useEffect(() => {
    setEditedTokens(tokens)
    setHasChanges(false)
  }, [tokens])

  const handleColorChange = (key: string, value: string) => {
    setEditedTokens((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleTypographyChange = (updatedTypography: TypographyTokens) => {
    setEditedTokens((prev) => ({
      ...prev,
      typography: updatedTypography,
    }))
    setHasChanges(true)
  }

  const handleSpacingChange = (key: string, value: string) => {
    setEditedTokens((prev) => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleBorderRadiusChange = (updatedBorderRadius: BorderRadiusTokens) => {
    setEditedTokens((prev) => ({
      ...prev,
      borderRadius: updatedBorderRadius,
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(editedTokens)
    }
    setHasChanges(false)
  }

  const handleReset = () => {
    setEditedTokens(tokens)
    setHasChanges(false)
    if (onReset) {
      onReset()
    }
  }

  return (
    <div className={cn("space-y-6", className)} data-testid="token-editor">
      {/* Colors Section */}
      {editedTokens.colors && Object.keys(editedTokens.colors).length > 0 && (
        <Card variant="outlined">
          <CardHeader>
            <h3 className="text-lg font-semibold">
              Colors ({Object.keys(editedTokens.colors).length})
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(editedTokens.colors).map(([key, value]) => {
              if (!value) return null
              return (
                <ColorPicker
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={value}
                  confidence={confidence[`colors.${key}`] || 0}
                  onChange={(newValue) => handleColorChange(key, newValue)}
                />
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Typography Section */}
      {editedTokens.typography && (
        <Card variant="outlined">
          <CardHeader>
            <h3 className="text-lg font-semibold">Typography</h3>
          </CardHeader>
          <CardContent>
            <TypographyEditor
              tokens={editedTokens.typography}
              confidence={confidence}
              onChange={handleTypographyChange}
            />
          </CardContent>
        </Card>
      )}

      {/* Spacing Section */}
      {editedTokens.spacing && Object.keys(editedTokens.spacing).length > 0 && (
        <Card variant="outlined">
          <CardHeader>
            <h3 className="text-lg font-semibold">
              Spacing ({Object.keys(editedTokens.spacing).length})
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(editedTokens.spacing).map(([key, value]) => {
              if (!value) return null
              return (
                <SpacingEditor
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={value}
                  confidence={confidence[`spacing.${key}`] || 0}
                  onChange={(newValue) => handleSpacingChange(key, newValue)}
                />
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Border Radius Section */}
      {editedTokens.borderRadius && (
        <Card variant="outlined">
          <CardHeader>
            <h3 className="text-lg font-semibold">Border Radius</h3>
          </CardHeader>
          <CardContent>
            <BorderRadiusEditor
              tokens={editedTokens.borderRadius}
              confidence={confidence}
              onChange={handleBorderRadiusChange}
            />
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="secondary"
          onClick={handleReset}
          disabled={!hasChanges || loading}
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || loading}
          aria-label="Save changes"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
