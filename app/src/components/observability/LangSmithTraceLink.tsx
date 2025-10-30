"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface LangSmithTraceLinkProps {
  /** LangSmith trace URL */
  traceUrl?: string;
  /** Session ID for this trace */
  sessionId?: string;
  /** Button size variant */
  size?: "sm" | "default" | "lg";
  /** Button style variant */
  variant?: "default" | "secondary" | "ghost" | "outline";
  /** Additional CSS classes */
  className?: string;
}

/**
 * LangSmithTraceLink - Displays a link to view AI execution trace in LangSmith
 *
 * Epic 004: Observability - LangSmith Integration
 *
 * Shows a button/link that opens the LangSmith trace viewer in a new tab.
 * Includes a tooltip with session information and explanation.
 *
 * Features:
 * - Opens LangSmith trace in new tab
 * - Shows session ID in tooltip
 * - Gracefully handles missing trace URL (returns null)
 * - Keyboard accessible
 * - Supports different button sizes and variants
 *
 * @example
 * ```tsx
 * <LangSmithTraceLink
 *   traceUrl="https://smith.langchain.com/o/default/projects/p/component-forge/r/abc123"
 *   sessionId="session-xyz-789"
 *   variant="ghost"
 *   size="sm"
 * />
 * ```
 */
export function LangSmithTraceLink({
  traceUrl,
  sessionId,
  size = "sm",
  variant = "ghost",
  className
}: LangSmithTraceLinkProps) {
  // Don't render if no trace URL
  if (!traceUrl) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            asChild
            className={cn("gap-2", className)}
          >
            <a
              href={traceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              View Trace
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">View AI Execution Trace</p>
            <p className="text-xs text-muted-foreground">
              See detailed AI operation logs, token usage, and performance metrics in LangSmith
            </p>
            {sessionId && (
              <p className="text-xs text-muted-foreground mt-2">
                Session: <code className="bg-muted px-1 rounded">{sessionId.slice(0, 8)}</code>
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
