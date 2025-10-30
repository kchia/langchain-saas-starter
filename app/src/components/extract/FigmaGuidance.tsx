"use client";

import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";

export function FigmaGuidance() {
  return (
    <Card className="p-6 mb-6 bg-muted/30">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg">
              Optimal Figma File Structure
            </h3>
            <p className="text-sm text-muted-foreground">
              We extract tokens from your Figma styles using semantic naming
              conventions
            </p>
          </div>
        </div>

        {/* Required: Published Styles */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">✅ Requirements</h4>
          <ul className="space-y-2 text-sm">
            <li>
              • File must have <strong>published local styles</strong> (colors
              and text)
            </li>
            <li>
              • You need a <strong>Personal Access Token</strong> with file read
              permissions
            </li>
            <li>
              • File must be accessible with your token (team files require
              appropriate permissions)
            </li>
          </ul>
        </div>

        {/* Naming Conventions */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">
            🏷️ Naming Conventions for Best Results
          </h4>

          <div className="space-y-4">
            {/* Color Styles */}
            <div>
              <p className="text-sm font-medium mb-2">Color Styles:</p>
              <div className="bg-background rounded-lg p-3 font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-success">✓ Primary/Blue</span>
                  <span className="text-muted-foreground">
                    → colors.primary
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Secondary/Gray</span>
                  <span className="text-muted-foreground">
                    → colors.secondary
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Accent/Teal</span>
                  <span className="text-muted-foreground">→ colors.accent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Error/Red</span>
                  <span className="text-muted-foreground">
                    → colors.destructive
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Background/White</span>
                  <span className="text-muted-foreground">
                    → colors.background
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Text/Black</span>
                  <span className="text-muted-foreground">
                    → colors.foreground
                  </span>
                </div>
              </div>
            </div>

            {/* Typography Styles */}
            <div>
              <p className="text-sm font-medium mb-2">Text Styles:</p>
              <div className="bg-background rounded-lg p-3 font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-success">✓ Heading/XL</span>
                  <span className="text-muted-foreground">
                    → typography.fontSize4xl
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Heading/Large</span>
                  <span className="text-muted-foreground">
                    → typography.fontSize2xl
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Body/Base</span>
                  <span className="text-muted-foreground">
                    → typography.fontSizeBase
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Body/Small</span>
                  <span className="text-muted-foreground">
                    → typography.fontSizeSm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keyword Matching */}
        <Alert>
          <Info className="h-4 w-4" />
          <div className="ml-2">
            <p className="font-medium text-sm">How Keyword Matching Works</p>
            <p className="text-xs mt-1 text-muted-foreground">
              We search style names for keywords like "primary", "heading",
              "error", "brand", etc. Styles with these keywords get mapped to
              semantic tokens automatically.
            </p>
            <p className="text-xs mt-2 text-muted-foreground">
              <strong>Example:</strong> A color style named "Brand/Primary/500"
              will match "primary" and map to{" "}
              <code className="bg-muted px-1 py-0.5 rounded">
                colors.primary
              </code>
            </p>
          </div>
        </Alert>

        {/* Get Token Link */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">
            🔑 How to Get a Figma Access Token
          </h4>
          <ol className="text-sm space-y-1 ml-4 list-decimal">
            <li>Go to Figma → Settings → Personal Access Tokens</li>
            <li>Click "Generate new token"</li>
            <li>Give it a descriptive name (e.g., "ComponentForge")</li>
            <li>Copy the token and paste it below</li>
          </ol>
          <a
            href="https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
          >
            View Figma Documentation
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </Card>
  );
}
