"use client";

import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import Image from "next/image";

interface UploadGuidanceProps {
  mode: "screenshot" | "figma";
}

export function UploadGuidance({ mode }: UploadGuidanceProps) {
  if (mode === "screenshot") {
    return (
      <Card className="p-6 mb-6 bg-muted/30">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">What to Upload</h3>
              <p className="text-sm text-muted-foreground">
                For best results, upload screenshots that clearly show your
                design tokens
              </p>
            </div>
          </div>

          {/* Image Quality Requirements */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">📸 Image Requirements</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>
                  Minimum resolution: <strong>1024px width</strong>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Formats: PNG, JPG, WebP, or SVG</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Maximum file size: 10MB</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Clear, unobstructed view of design elements</span>
              </li>
            </ul>
          </div>

          {/* Good Examples */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Good Examples
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Image
                  src="/examples/good-color-palette.png"
                  alt="Good example: Color palette with labels"
                  width={400}
                  height={300}
                  className="rounded-lg border"
                />
                <p className="text-xs text-muted-foreground">
                  ✅ Color palette with semantic labels (Primary, Secondary,
                  etc.)
                </p>
              </div>
              <div className="space-y-2">
                <Image
                  src="/examples/good-typography-scale.png"
                  alt="Good example: Typography scale"
                  width={400}
                  height={300}
                  className="rounded-lg border"
                />
                <p className="text-xs text-muted-foreground">
                  ✅ Typography scale showing font sizes and weights
                </p>
              </div>
            </div>
          </div>

          {/* Bad Examples */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Avoid These
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Image
                  src="/examples/bad-full-app.png"
                  alt="Bad example: Full app screenshot"
                  width={400}
                  height={300}
                  className="rounded-lg border opacity-60"
                />
                <p className="text-xs text-muted-foreground">
                  ❌ Full app screenshot (too much visual noise)
                </p>
              </div>
              <div className="space-y-2">
                <Image
                  src="/examples/bad-low-res.png"
                  alt="Bad example: Low resolution"
                  width={400}
                  height={300}
                  className="rounded-lg border opacity-60"
                />
                <p className="text-xs text-muted-foreground">
                  ❌ Low resolution or blurry image
                </p>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <Alert>
            <Info className="h-4 w-4" />
            <div className="ml-2">
              <p className="font-medium">Pro Tips</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>
                  • Export design system frames from Figma as high-res PNGs
                </li>
                <li>
                  • Include semantic labels in your design ("Primary Color",
                  "Heading XL")
                </li>
                <li>
                  • Group related tokens together (all colors, all typography,
                  etc.)
                </li>
                <li>
                  • Use consistent naming conventions for better semantic
                  mapping
                </li>
              </ul>
            </div>
          </Alert>
        </div>
      </Card>
    );
  }

  return null; // Figma guidance in separate component
}
