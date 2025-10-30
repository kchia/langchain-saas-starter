"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { Download, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TokenData } from "./TokenEditor"

export interface TokenExportProps {
  /**
   * Token data to export
   */
  tokens: TokenData
  
  /**
   * Metadata about the extraction
   */
  metadata?: {
    method?: "screenshot" | "figma"
    timestamp?: string
    averageConfidence?: number
  }
  
  /**
   * Optional className
   */
  className?: string
}

interface TokenExportOutput {
  colors: Record<string, string>
  typography: Record<string, string>
  spacing: Record<string, string>
  _metadata?: {
    extractionMethod: string
    extractedAt: string
    averageConfidence?: number
  }
}

/**
 * Generates JSON export format
 */
function generateJSON(tokens: TokenData, metadata?: TokenExportProps['metadata']): string {
  const output: TokenExportOutput = {
    colors: {},
    typography: {},
    spacing: {},
  }

  // Add colors - handle both flat structure and nested .value structure
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([key, data]) => {
      output.colors[key] = typeof data === 'string' ? data : (data as any)?.value
    })
  }

  // Add typography - handle both flat and nested structures
  if (tokens.typography) {
    Object.entries(tokens.typography).forEach(([key, data]) => {
      output.typography[key] = typeof data === 'string' || typeof data === 'number' ? data : (data as any)?.value
    })
  }

  // Add spacing - handle both flat structure and nested .value structure
  if (tokens.spacing) {
    Object.entries(tokens.spacing).forEach(([key, data]) => {
      output.spacing[key] = typeof data === 'string' ? data : (data as any)?.value
    })
  }

  // Add borderRadius if present
  if (tokens.borderRadius) {
    (output as any).borderRadius = {}
    Object.entries(tokens.borderRadius).forEach(([key, data]) => {
      (output as any).borderRadius[key] = typeof data === 'string' ? data : (data as any)?.value
    })
  }

  // Add metadata if provided
  if (metadata) {
    output._metadata = {
      extractionMethod: metadata.method,
      extractedAt: metadata.timestamp || new Date().toISOString(),
      averageConfidence: metadata.averageConfidence,
    }
  }

  return JSON.stringify(output, null, 2)
}

/**
 * Generates CSS custom properties format
 */
function generateCSS(tokens: TokenData, metadata?: TokenExportProps['metadata']): string {
  const lines: string[] = []

  // Add header comment
  lines.push("/**")
  lines.push(" * Design Tokens")
  if (metadata) {
    lines.push(` * Extracted via: ${metadata.method || 'unknown'}`)
    lines.push(` * Generated at: ${metadata.timestamp || new Date().toISOString()}`)
    if (metadata.averageConfidence) {
      lines.push(` * Average confidence: ${(metadata.averageConfidence * 100).toFixed(0)}%`)
    }
  }
  lines.push(" */")
  lines.push("")
  lines.push(":root {")

  // Add colors - handle both flat and nested structures
  if (tokens.colors) {
    lines.push("  /* Colors */")
    Object.entries(tokens.colors).forEach(([key, data]) => {
      const value = typeof data === 'string' ? data : (data as any)?.value
      if (value) {
        lines.push(`  --color-${key}: ${value};`)
      }
    })
    lines.push("")
  }

  // Add typography - handle both flat and nested structures
  if (tokens.typography) {
    lines.push("  /* Typography */")
    Object.entries(tokens.typography).forEach(([key, data]) => {
      const value = typeof data === 'string' || typeof data === 'number' ? data : (data as any)?.value
      if (value !== undefined) {
        lines.push(`  --${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
      }
    })
    lines.push("")
  }

  // Add spacing - handle both flat and nested structures
  if (tokens.spacing) {
    lines.push("  /* Spacing */")
    Object.entries(tokens.spacing).forEach(([key, data]) => {
      const value = typeof data === 'string' ? data : (data as any)?.value
      if (value) {
        lines.push(`  --spacing-${key}: ${value};`)
      }
    })
    lines.push("")
  }

  // Add borderRadius if present
  if (tokens.borderRadius) {
    lines.push("  /* Border Radius */")
    Object.entries(tokens.borderRadius).forEach(([key, data]) => {
      const value = typeof data === 'string' ? data : (data as any)?.value
      if (value) {
        lines.push(`  --border-radius-${key}: ${value};`)
      }
    })
  }

  lines.push("}")

  return lines.join("\n")
}

/**
 * TokenExport - Component for exporting tokens as JSON or CSS
 * 
 * @example
 * ```tsx
 * <TokenExport
 *   tokens={{
 *     colors: {
 *       primary: { value: "#3B82F6", confidence: 0.92 }
 *     }
 *   }}
 *   metadata={{
 *     method: "screenshot",
 *     timestamp: "2024-01-01T00:00:00Z",
 *     averageConfidence: 0.87
 *   }}
 * />
 * ```
 */
export function TokenExport({
  tokens,
  metadata,
  className,
}: TokenExportProps) {
  const [format, setFormat] = React.useState<"json" | "css">("json")
  const [copied, setCopied] = React.useState(false)

  const exportCode = format === "json" 
    ? generateJSON(tokens, metadata)
    : generateCSS(tokens, metadata)

  const handleDownload = () => {
    const blob = new Blob([exportCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tokens.${format === "json" ? "json" : "css"}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card variant="outlined" className={cn("", className)} data-testid="token-export">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Export Tokens</h3>
          
          {/* Format toggle */}
          <div className="flex gap-2">
            <Button
              variant={format === "json" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFormat("json")}
            >
              JSON
            </Button>
            <Button
              variant={format === "css" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFormat("css")}
            >
              CSS
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Code preview */}
        <CodeBlock
          code={exportCode}
          language={format === "json" ? "json" : "css"}
          maxHeight="400px"
        />
        
        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="size-4 mr-2" />
            Download {format.toUpperCase()}
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleCopy}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="size-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="size-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
