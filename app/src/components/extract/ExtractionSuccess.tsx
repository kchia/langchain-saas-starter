"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Eye, Sparkles, ArrowDown } from "lucide-react";
import type { DesignTokens } from "@/types/api.types";

interface ExtractionSuccessProps {
  tokens: DesignTokens;
  onContinue: () => void;
}

export function ExtractionSuccess({
  tokens,
  onContinue
}: ExtractionSuccessProps) {
  // Count extracted tokens
  const colorCount = tokens.colors ? Object.values(tokens.colors).filter(Boolean).length : 0;
  const typographyCount = tokens.typography ? Object.values(tokens.typography).filter(Boolean).length : 0;
  const spacingCount = tokens.spacing ? Object.values(tokens.spacing).filter(Boolean).length : 0;
  const borderRadiusCount = tokens.borderRadius ? Object.values(tokens.borderRadius).filter(Boolean).length : 0;
  const totalCount =
    colorCount + typographyCount + spacingCount + borderRadiusCount;

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 mb-8">
      <div className="text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-success/10 p-4">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Tokens Extracted Successfully! 🎉
          </h2>
          <p className="text-muted-foreground">
            We&apos;ve extracted {totalCount} design tokens from your upload
          </p>
        </div>

        {/* Token Breakdown */}
        <div className="flex justify-center gap-3 flex-wrap">
          {colorCount > 0 && (
            <Badge variant="secondary" className="px-4 py-2">
              {colorCount} Colors
            </Badge>
          )}
          {typographyCount > 0 && (
            <Badge variant="secondary" className="px-4 py-2">
              {typographyCount} Typography
            </Badge>
          )}
          {spacingCount > 0 && (
            <Badge variant="secondary" className="px-4 py-2">
              {spacingCount} Spacing
            </Badge>
          )}
          {borderRadiusCount > 0 && (
            <Badge variant="secondary" className="px-4 py-2">
              {borderRadiusCount} Border Radius
            </Badge>
          )}
        </div>

        {/* What's Next */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">What&apos;s Next?</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Step 1: Review */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">1. Review & Edit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Check confidence scores (🟢🟡🔴) and adjust values using visual
                previews
              </p>
            </div>

            {/* Step 2: Export */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">2. Export</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Download tailwind.config.js, CSS variables, and
                design-tokens.json
              </p>
            </div>

            {/* Step 3: Generate (Coming Soon) */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">3. Generate (Soon)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Auto-generate shadcn/ui components styled with your tokens
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Button size="lg" onClick={onContinue} className="gap-2">
            Continue to Review Tokens
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
