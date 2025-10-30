"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface Example {
  image: string;
  title: string;
  description: string;
  highlights: string[];
}

const examples: Example[] = [
  {
    image: "/examples/good-color-palette.png",
    title: "Design System Tokens",
    description: "Color palette, typography scale, and spacing documented in a style guide",
    highlights: [
      "Colors labeled with semantic names (Primary, Secondary, etc.)",
      "Font sizes, weights, and line heights clearly shown",
      "Spacing scale with visual examples",
      "High contrast, easy to read"
    ]
  },
  {
    image: "/examples/good-button-variants.png",
    title: "Button Component Variants",
    description: "Different button states and styles (primary, secondary, outlined, ghost)",
    highlights: [
      "Multiple variants shown side by side",
      "Different states (default, hover, disabled)",
      "Sizing options clearly labeled",
      "Spacing and padding visible"
    ]
  },
  {
    image: "/examples/good-card-components.png",
    title: "Card Components",
    description: "Card layouts showing borders, shadows, padding, and content structure",
    highlights: [
      "Border radius and shadow styles visible",
      "Internal spacing and padding clear",
      "Typography hierarchy demonstrated",
      "Component structure well-organized"
    ]
  },
  {
    image: "/examples/good-form-inputs.png",
    title: "Form Input Components",
    description: "Input fields, labels, validation states, and spacing patterns",
    highlights: [
      "Input states (default, focus, error, disabled)",
      "Label positioning and typography",
      "Validation message styling",
      "Consistent spacing between elements"
    ]
  }
];

export function ExampleComparison() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="h-6 w-6 text-success" />
        <h3 className="text-xl font-semibold">What Makes a Good Screenshot?</h3>
        <Badge variant="success">High Confidence Extraction</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Upload screenshots of <strong>design tokens</strong> (colors, typography, spacing) OR <strong>component mockups</strong> (buttons, cards, forms).
        Both help extract the styles needed to build your UI library.
      </p>

      {/* Examples Grid - 2 columns for better visibility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {examples.map((example, idx) => (
          <Card key={idx} className="overflow-hidden">
            {/* Larger image area - 4:3 aspect ratio */}
            <div className="aspect-[4/3] relative bg-muted border-b">
              <Image
                src={example.image}
                alt={example.title}
                fill
                className="object-contain p-2"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Content */}
            <div className="p-5">
              <h4 className="font-semibold text-base mb-2">{example.title}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {example.description}
              </p>

              {/* Highlights */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Why this works:
                </p>
                <ul className="space-y-2">
                  {example.highlights.map((highlight, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tips callout */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm mb-2">Two Workflows for Best Results:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-sm font-medium mb-2">1️⃣ Design Tokens First</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Upload style guide or design system page</li>
                  <li>• Extract colors, typography, spacing scales</li>
                  <li>• Use these as foundation for components</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">2️⃣ Component Mockups</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Upload button, card, or form screenshots</li>
                  <li>• Extract component-specific patterns</li>
                  <li>• Generate code based on visual structure</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
              💡 <strong>Tip:</strong> Export Figma frames at 2x-3x scale for best OCR accuracy. Include labels like "Primary Button" or "Card Elevated".
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
