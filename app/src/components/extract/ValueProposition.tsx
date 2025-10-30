"use client";

import { Card } from "@/components/ui/card";
import { FileCode2, Palette, Zap, Package } from "lucide-react";

export function ValueProposition() {
  const benefits = [
    {
      icon: Palette,
      title: "Semantic Design Tokens",
      description:
        "AI extracts colors, typography, spacing, and border radius with semantic naming (primary, secondary, accent, etc.)"
    },
    {
      icon: FileCode2,
      title: "Production-Ready Config",
      description:
        "Export Tailwind config, CSS variables, and JSON tokens ready to import into your project"
    },
    {
      icon: Zap,
      title: "Confidence-Based Editing",
      description:
        "Review AI confidence scores (🟢🟡🔴) and adjust values with visual previews"
    },
    {
      icon: Package,
      title: "Component Generation (Coming Soon)",
      description:
        "Auto-generate shadcn/ui components (Button, Card, Input, etc.) styled with your design system"
    }
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Transform Design to Production Code
        </h2>
        <p className="text-muted-foreground">
          Upload your design system and get instant, production-ready design
          tokens
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((benefit, idx) => {
          const Icon = benefit.icon;
          return (
            <Card key={idx} className="p-6">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
