"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { Palette, FileImage, Figma } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function OnboardingModal() {
  const router = useRouter();
  const { hasSeenOnboarding, completeOnboarding, skipOnboarding } =
    useOnboardingStore();
  const [open, setOpen] = useState(false);

  // Sync with store state
  useEffect(() => {
    setOpen(!hasSeenOnboarding);
  }, [hasSeenOnboarding]);

  const workflows = [
    {
      id: "design-system" as const,
      title: "Design System Screenshot",
      description: "Upload your color palette, typography scale, or style guide",
      icon: Palette,
      workflow: [
        "1. Upload design system screenshot",
        "2. AI extracts semantic tokens with confidence scores",
        "3. Review & edit tokens with visual previews",
        "4. Export Tailwind config + CSS variables",
        "5. (Coming soon) Generate styled components"
      ],
      bestFor: "Teams with documented design systems",
      outcome: "Production-ready design tokens + configuration files"
    },
    {
      id: "components" as const,
      title: "Component Mockups",
      description: "Extract tokens from UI component screenshots",
      icon: FileImage,
      workflow: [
        "1. Upload component screenshots (buttons, cards, etc.)",
        "2. AI identifies colors, spacing, typography, border radius",
        "3. Review extracted tokens",
        "4. Export to Tailwind or CSS",
        "5. (Coming soon) Auto-generate React components"
      ],
      bestFor: "Converting designs to code",
      outcome: "Component-specific design tokens"
    },
    {
      id: "figma" as const,
      title: "Figma File",
      description: "Connect directly to your Figma design system",
      icon: Figma,
      workflow: [
        "1. Connect Figma file with access token",
        "2. We extract all published styles",
        "3. Automatic semantic mapping (keyword-based)",
        "4. Export tokens & configuration",
        "5. (Coming soon) Sync updates from Figma"
      ],
      bestFor: "Complete design systems in Figma",
      outcome: "Always up-to-date design tokens"
    }
  ];

  const handleWorkflowSelect = (
    workflowId: (typeof workflows)[number]["id"]
  ) => {
    completeOnboarding(workflowId);
    setOpen(false);
    // Navigate to extract page with the workflow type as a query param
    const tab = workflowId === "figma" ? "figma" : "screenshot";
    router.push(`/extract?tab=${tab}`);
  };

  const handleSkip = () => {
    skipOnboarding();
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // When dialog is closed, mark onboarding as seen
    if (!isOpen) {
      skipOnboarding();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Welcome to ComponentForge!
          </DialogTitle>
          <p className="text-muted-foreground">
            Choose how you'd like to start extracting design tokens
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {workflows.map((workflow) => {
            const Icon = workflow.icon;
            return (
              <Card
                key={workflow.id}
                className="p-6 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleWorkflowSelect(workflow.id)}
              >
                <Icon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">{workflow.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {workflow.description}
                </p>

                {/* NEW: Workflow Steps */}
                <div className="mb-4">
                  <p className="text-xs font-medium mb-2">How it works:</p>
                  <ol className="text-xs space-y-1 text-muted-foreground">
                    {workflow.workflow.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* NEW: Outcome */}
                <div className="pt-3 border-t">
                  <p className="text-xs font-medium">You&apos;ll get:</p>
                  <p className="text-xs text-primary">{workflow.outcome}</p>
                </div>

                {/* NEW: Best For Badge */}
                <Badge variant="neutral" className="mt-3 text-xs">
                  {workflow.bestFor}
                </Badge>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            You can always access this guide from the Help menu
          </p>
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
