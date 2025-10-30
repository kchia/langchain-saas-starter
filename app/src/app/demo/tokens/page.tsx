import React from 'react'
import { ColorPicker } from '@/components/tokens/ColorPicker'
import { TypographyEditor } from '@/components/tokens/TypographyEditor'
import { SpacingEditor } from '@/components/tokens/SpacingEditor'
import { TokenEditor, type TokenData } from '@/components/tokens/TokenEditor'
import { TokenExport } from '@/components/tokens/TokenExport'

const sampleTokens: TokenData = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    background: '#FFFFFF',
  },
  typography: {
    fontFamily: 'Inter',
    fontSizeBase: '16px',
    fontWeightNormal: 500,
  },
  spacing: {
    md: '16px',
    lg: '24px',
  },
  borderRadius: {
    md: '6px',
    lg: '8px',
  },
}

const confidenceScores = {
  'colors.primary': 0.92,
  'colors.secondary': 0.88,
  'colors.background': 0.95,
  'typography.fontFamily': 0.75,
  'typography.fontSizeBase': 0.90,
  'typography.fontWeightNormal': 0.85,
  'spacing.md': 0.85,
  'spacing.lg': 0.80,
  'borderRadius.md': 0.88,
  'borderRadius.lg': 0.90,
}

const metadata = {
  method: 'screenshot' as const,
  timestamp: '2024-01-01T12:00:00Z',
  averageConfidence: 0.87,
}

export default function TokenComponentsDemo() {
  return (
    <div className="container mx-auto p-8 space-y-8 max-w-4xl">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Token Components Demo</h1>
        <p className="text-gray-600">
          Demonstration of token editing and export components (Tasks 7 & 8)
        </p>
      </div>

      {/* Individual Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Individual Components</h2>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">ColorPicker</h3>
          <div className="max-w-md">
            <ColorPicker
              label="Primary Color"
              value="#3B82F6"
              confidence={0.92}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">TypographyEditor</h3>
          <div className="max-w-md">
            <TypographyEditor
              tokens={{
                fontFamily: 'Inter',
                fontSizeBase: '16px',
                fontWeightNormal: 500,
              }}
              confidence={{
                'typography.fontFamily': 0.75,
                'typography.fontSizeBase': 0.90,
                'typography.fontWeightNormal': 0.85,
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">SpacingEditor</h3>
          <div className="max-w-md">
            <SpacingEditor
              label="Padding"
              value="16px"
              confidence={0.85}
            />
          </div>
        </div>
      </section>

      {/* Token Editor */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">TokenEditor (Complete)</h2>
        <TokenEditor tokens={sampleTokens} confidence={confidenceScores} />
      </section>

      {/* Token Export */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">TokenExport</h2>
        <TokenExport tokens={sampleTokens} metadata={metadata} />
      </section>
    </div>
  )
}
