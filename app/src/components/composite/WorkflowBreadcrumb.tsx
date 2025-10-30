"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/stores/useWorkflowStore";
import { WorkflowStep } from "@/types";
import { CheckCircle, Lock, Loader2, ChevronRight } from "lucide-react";

interface WorkflowBreadcrumbProps {
  className?: string;
}

export function WorkflowBreadcrumb({ className }: WorkflowBreadcrumbProps) {
  const currentStep = useWorkflowStore((state) => state.currentStep);
  const completedSteps = useWorkflowStore((state) => state.completedSteps);
  const canAccessStep = useWorkflowStore((state) => state.canAccessStep);

  const steps = [
    { label: "Extract", step: WorkflowStep.EXTRACT, href: "/extract" },
    { label: "Requirements", step: WorkflowStep.REQUIREMENTS, href: "/requirements" },
    { label: "Patterns", step: WorkflowStep.PATTERNS, href: "/patterns" },
    { label: "Preview", step: WorkflowStep.PREVIEW, href: "/preview" },
  ];

  return (
    <nav 
      className={cn("flex flex-wrap items-center gap-2", className)} 
      aria-label="Workflow progress"
    >
      {steps.map((item, index) => {
        const isCompleted = completedSteps.includes(item.step);
        const isCurrent = currentStep === item.step;
        const isAccessible = canAccessStep(item.step);

        return (
          <React.Fragment key={item.step}>
            {index > 0 && (
              <ChevronRight 
                className="h-4 w-4 text-muted-foreground" 
                aria-hidden="true"
              />
            )}

            {isAccessible ? (
              <Link href={item.href}>
                <Button
                  variant={isCurrent ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted && !isCurrent && (
                    <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                  )}
                  {isCurrent && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {item.label}
                </Button>
              </Link>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                disabled 
                className="gap-2"
                aria-disabled="true"
                aria-label={`${item.label} (locked)`}
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
