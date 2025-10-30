"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import type { DesignTokens } from "@/types/api.types";

interface ComponentPreviewProps {
  tokens: DesignTokens;
}

export function ComponentPreview({ tokens }: ComponentPreviewProps) {
  // Generate CSS variables from tokens
  const cssVars = {
    "--primary": tokens.colors?.primary || "#3B82F6",
    "--secondary": tokens.colors?.secondary || "#64748B",
    "--background": tokens.colors?.background || "#FFFFFF",
    "--foreground": tokens.colors?.foreground || "#0F172A",
    "--border-radius-md": tokens.borderRadius?.md || "8px"
  };

  return (
    <Card className="p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Component Preview</h3>
          <p className="text-sm text-muted-foreground">
            See how your tokens will look in actual components
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Lock className="h-3 w-3" />
          Coming Soon
        </Badge>
      </div>

      {/* Live Preview with user's tokens */}
      <div
        className="space-y-4 p-6 bg-muted rounded-lg"
        style={cssVars as React.CSSProperties}
      >
        {/* Button Preview */}
        <div>
          <p className="text-xs font-medium mb-2 text-muted-foreground">
            Button
          </p>
          <div
            className="inline-flex items-center px-4 py-2 font-medium text-white"
            style={{
              backgroundColor: "var(--primary)",
              borderRadius: "var(--border-radius-md)"
            }}
          >
            Primary Button
          </div>
        </div>

        {/* Card Preview */}
        <div>
          <p className="text-xs font-medium mb-2 text-muted-foreground">Card</p>
          <div
            className="p-4"
            style={{
              backgroundColor: "var(--background)",
              borderRadius: "var(--border-radius-md)",
              border: "1px solid var(--secondary)",
              color: "var(--foreground)"
            }}
          >
            <h4 className="font-semibold mb-2">Card Title</h4>
            <p className="text-sm opacity-70">
              This card is styled with your extracted design tokens.
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Message */}
      <Alert className="mt-4">
        <Lock className="h-4 w-4" />
        <div className="ml-2">
          <p className="font-medium text-sm">
            Component Generation Coming in Phase 3
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            We&apos;ll automatically generate shadcn/ui components (Button, Card,
            Input, Badge, etc.) fully styled with your design tokens. Download
            working React/TypeScript code.
          </p>
        </div>
      </Alert>
    </Card>
  );
}
