"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MetricCard } from "@/components/composite/MetricCard";
import { DynamicCodeBlock } from "@/components/ui/DynamicCodeBlock";
import { WorkflowBreadcrumb } from "@/components/composite/WorkflowBreadcrumb";
import { GenerationProgress } from "@/components/composite/GenerationProgress";
import { ValidationErrorsDisplay } from "@/components/preview/ValidationErrorsDisplay";
import { QualityScoresDisplay } from "@/components/preview/QualityScoresDisplay";
import { SecurityIssuesPanel } from "@/components/preview/SecurityIssuesPanel";
import { LangSmithTraceLink } from "@/components/observability/LangSmithTraceLink";
import { GenerationMetadataDisplay } from "@/components/observability/GenerationMetadataDisplay";
import { useWorkflowStore } from "@/stores/useWorkflowStore";
import { useTokenStore } from "@/stores/useTokenStore";
import { usePatternSelection } from "@/store/patternSelectionStore";
import {
  useGenerateComponent,
  useGenerationStatus
} from "@/hooks/useGenerateComponent";
import { downloadGeneratedCode } from "@/lib/api";
import { copyToClipboard, openInCodeSandbox } from "@/lib/utils";
import { WorkflowStep, GenerationStage, GenerationResponse } from "@/types";
import { useRateLimitHandler } from "@/hooks/useRateLimitHandler";
import { RateLimitAlert } from "@/components/composite/RateLimitAlert";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  Check,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";

export default function PreviewPage() {
  const router = useRouter();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const hasTriggeredRef = useRef(false);

  // Store state
  const completedSteps = useWorkflowStore((state) => state.completedSteps);
  const completeStep = useWorkflowStore((state) => state.completeStep);
  const componentType = useWorkflowStore((state) => state.componentType);
  const getApprovedProposals = useWorkflowStore(
    (state) => state.getApprovedProposals
  );
  const hasHydrated = useWorkflowStore((state) => state._hasHydrated);
  const resetWorkflow = useWorkflowStore((state) => state.resetWorkflow);
  const tokens = useTokenStore((state) => state.tokens);
  const clearTokens = useTokenStore((state) => state.clearTokens);
  const selectedPattern = usePatternSelection((state) => state.selectedPattern);
  const clearSelection = usePatternSelection((state) => state.clearSelection);
  const clearComparison = usePatternSelection((state) => state.clearComparison);

  // Rate limit handling (Epic 003 Story 3.3)
  const { rateLimitState, handleRateLimitError, clearRateLimit, isRateLimitError } = useRateLimitHandler();

  // Local state to persist generated code across re-renders
  const [generatedCode, setGeneratedCode] = useState<GenerationResponse | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const [codeKey, setCodeKey] = useState(Date.now());

  // Generation mutation
  const generation = useGenerateComponent({
    onSuccess: (data) => {
      // Persist the generated code in local state
      setGeneratedCode(data);
      // Force code block to remount with new key
      setCodeKey(Date.now());

      // Mark preview step as completed on successful generation
      completeStep(WorkflowStep.PREVIEW);
      // Stop timer
      setStartTime(null);
    },
    onError: (error) => {
      console.error("[Preview] Generation FAILED:", error);
      // Handle rate limit errors (Epic 003 Story 3.3)
      if (isRateLimitError(error)) {
        handleRateLimitError(error);
      }
      // Stop timer
      setStartTime(null);
    }
  });

  const generationStatus = useGenerationStatus(generation);
  const isGenerating = generation.isPending;
  const isComplete = generation.isSuccess || !!generatedCode; // Use local state as fallback
  const hasFailed = generation.isError;

  // Route guard: redirect if patterns not completed or no pattern selected
  // Wait for hydration before checking route guard to avoid false redirects
  useEffect(() => {
    // Skip route guard check until store is hydrated
    if (!hasHydrated) {
      return;
    }

    if (!completedSteps.includes(WorkflowStep.PATTERNS)) {
      router.push("/patterns");
    }

    // Ensure a pattern was selected
    if (!selectedPattern) {
      router.push("/patterns");
    }
  }, [completedSteps, router, hasHydrated, selectedPattern]);

  // Trigger generation on page load (only once)
  useEffect(() => {
    // Only generate if we have required data and haven't generated yet
    if (
      selectedPattern &&
      tokens &&
      !hasTriggeredRef.current &&
      !generation.data &&
      !isGenerating &&
      !hasFailed
    ) {
      hasTriggeredRef.current = true;
      const approvedRequirements = getApprovedProposals();
      const allRequirements = [
        ...approvedRequirements.props,
        ...approvedRequirements.events,
        ...approvedRequirements.states,
        ...approvedRequirements.accessibility
      ];

      // Use actual pattern_id from pattern selection page
      const patternId = selectedPattern.pattern_id;

      // Start generation
      setStartTime(Date.now());
      generation.mutate({
        pattern_id: patternId,
        component_name: componentType,
        tokens,
        requirements: allRequirements
      });
    }
  }, [selectedPattern, tokens, generation.data, isGenerating, hasFailed]); // Removed getApprovedProposals to prevent unnecessary re-renders

  // Update elapsed time while generating
  useEffect(() => {
    if (!startTime || !isGenerating) return;

    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 100); // Update every 100ms for smooth counter

    return () => clearInterval(interval);
  }, [startTime, isGenerating]);

  // TODO: Replace with real-time stage updates from backend (WebSocket or polling)
  // Current implementation uses mock timing for MVP demo purposes
  const currentStage = useMemo(() => {
    if (!isGenerating) {
      return isComplete
        ? GenerationStage.COMPLETE
        : GenerationStage.LLM_GENERATING;
    }

    // Mock stage progression (temporary until backend integration)
    // Progress percentage of 60s target (Epic 4.5: 3-stage pipeline)
    const progress = (elapsedMs / 60000) * 100;
    if (progress < 50) return GenerationStage.LLM_GENERATING;
    if (progress < 80) return GenerationStage.VALIDATING;
    return GenerationStage.POST_PROCESSING;
  }, [isGenerating, isComplete, elapsedMs]);

  // Handle download action
  const handleDownload = () => {
    const codeToDownload = generation.data?.code || generatedCode?.code;
    if (codeToDownload) {
      const componentName = componentType || "Component";
      downloadGeneratedCode(codeToDownload, componentName);
    }
  };

  // Handle retry action
  const handleRetry = () => {
    if (!selectedPattern) {
      console.error("Cannot retry: no pattern selected");
      return;
    }

    setElapsedMs(0);
    setStartTime(Date.now());
    hasTriggeredRef.current = false; // Reset trigger flag for retry
    generation.reset();

    // Retry generation
    const approvedRequirements = getApprovedProposals();
    const allRequirements = [
      ...approvedRequirements.props,
      ...approvedRequirements.events,
      ...approvedRequirements.states,
      ...approvedRequirements.accessibility
    ];
    // Use actual pattern_id from pattern selection page
    const patternId = selectedPattern.pattern_id;

    generation.mutate({
      pattern_id: patternId,
      component_name: componentType,
      tokens: tokens!,
      requirements: allRequirements
    });
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    const codeToDownload = generation.data?.code || generatedCode?.code;
    if (codeToDownload?.component) {
      const success = await copyToClipboard(codeToDownload.component);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      }
    }
  };

  // Handle open in CodeSandbox
  const handleOpenInCodeSandbox = () => {
    const codeToDownload = generation.data?.code || generatedCode?.code;
    if (codeToDownload?.component) {
      const componentName = componentType || "Component";
      openInCodeSandbox(
        codeToDownload.component,
        componentName,
        codeToDownload.stories,
        codeToDownload.showcase,
        codeToDownload.app
      );
    }
  };

  // Handle start over - reset all workflow state
  const handleStartOver = () => {
    // Clear all stores
    resetWorkflow();
    clearTokens();
    clearSelection();
    clearComparison();
    // Redirect to dashboard
    router.push("/");
  };

  // Get generated code or placeholders (use local state as fallback)
  const actualData = generation.data || generatedCode;
  const componentCode = actualData?.code.component || "";
  const storiesCode = actualData?.code.stories || "";
  const metadata = actualData?.metadata;
  const timing = actualData?.timing;

  // Epic 4.5: Extract validation results and quality scores
  const validationResults = metadata?.validation_results;
  const qualityScores = metadata?.quality_scores;
  
  // Epic 003 - Story 3.2: Extract security sanitization results
  const securityResults = validationResults?.security_sanitization;

  return (
    <main className="container mx-auto p-4 sm:p-8 space-y-6">
      {/* Workflow Breadcrumb */}
      <WorkflowBreadcrumb />

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Component Preview</h1>
        <p className="text-muted-foreground">
          {isGenerating && "Generating your component..."}
          {isComplete && "Review and download your generated component"}
          {hasFailed && "Generation failed - please try again"}
        </p>
      </div>

      {/* Generation Progress (show when generating) */}
      {isGenerating && !isComplete && (
        <GenerationProgress
          currentStage={currentStage}
          status={generationStatus}
          elapsedMs={elapsedMs}
          validationResults={validationResults}
          qualityScores={qualityScores}
        />
      )}

      {/* Rate Limit Alert (Epic 003 Story 3.3) */}
      {rateLimitState.isRateLimited && (
        <RateLimitAlert
          retryAfter={rateLimitState.retryAfter}
          message={rateLimitState.message}
          endpoint={rateLimitState.endpoint}
          onDismiss={clearRateLimit}
        />
      )}

      {/* Error State */}
      {hasFailed && !rateLimitState.isRateLimited && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertTriangle className="size-12 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">Generation Failed</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {generation.error?.message ||
                    "An error occurred during code generation."}
                </p>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleRetry} variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Generation
                </Button>
                <Button asChild variant="outline">
                  <Link href="/patterns">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Patterns
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Metrics (show when complete) */}
      {isComplete && metadata && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <MetricCard
                    title="Security"
                    value={
                      securityResults
                        ? (securityResults.is_safe ? "✓ Safe" : `${securityResults.issues.length} Issues`)
                        : "Not Checked"
                    }
                    icon={
                      securityResults
                        ? (securityResults.is_safe ? ShieldCheck : ShieldAlert)
                        : Shield
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-xs">
                  Scans for code injection, XSS, prototype pollution,<br />
                  hardcoded secrets, SQL injection, and unsafe HTML
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <MetricCard
            title="Accessibility"
            value={metadata.has_accessibility_warnings ? "Warnings" : "✓ Pass"}
            icon={
              metadata.has_accessibility_warnings ? AlertTriangle : CheckCircle2
            }
          />
          <MetricCard
            title="Type Safety"
            value={metadata.has_typescript_errors ? "Errors" : "✓ Pass"}
            icon={metadata.has_typescript_errors ? AlertTriangle : CheckCircle2}
          />
          <MetricCard
            title="Lines of Code"
            value={metadata.lines_of_code.toString()}
            icon={Clock}
          />
          <MetricCard
            title="Generation Time"
            value={timing ? `${(timing.total_ms / 1000).toFixed(1)}s` : "N/A"}
            icon={Clock}
          />
        </div>
      )}

      {/* Observability Section - Trace Link & Metadata (Epic 004) */}
      {isComplete && metadata && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* LangSmith Trace Link */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">AI Observability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                View detailed AI operation logs and metrics in LangSmith
              </p>
              <LangSmithTraceLink
                traceUrl={metadata.trace_url}
                sessionId={metadata.session_id}
                variant="outline"
                size="default"
                className="w-full"
              />
              {!metadata.trace_url && (
                <p className="text-xs text-muted-foreground italic">
                  Trace link will appear here when LangSmith is configured
                </p>
              )}
            </CardContent>
          </Card>

          {/* Generation Metadata Display */}
          <div className="lg:col-span-2">
            <GenerationMetadataDisplay
              metadata={{
                latency_ms: timing?.total_ms,
                stage_latencies: timing?.llm_generating_ms && timing?.validating_ms && timing?.post_processing_ms 
                  ? {
                      llm_generating: timing.llm_generating_ms,
                      validating: timing.validating_ms,
                      post_processing: timing.post_processing_ms,
                    }
                  : undefined,
                token_count: metadata.llm_token_usage?.total_tokens,
                llm_token_usage: metadata.llm_token_usage,
                estimated_cost: undefined, // Backend will provide this in future
              }}
            />
          </div>
        </div>
      )}

      {/* Component Tabs (show when complete) */}
      {isComplete && componentCode && (
        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="preview">Test</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="storybook">Storybook</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
          </TabsList>

          {/* Test Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Test Your Component</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Testing Options */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleOpenInCodeSandbox}
                      variant="default"
                      className="flex-1"
                      size="lg"
                    >
                      <ExternalLink className="mr-2 h-5 w-5" />
                      Open in StackBlitz
                    </Button>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-5 w-5" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Why use StackBlitz?</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Full React + TypeScript + Tailwind environment</li>
                      <li>Interactive testing with hot reload</li>
                      <li>Test all component variants and props</li>
                      <li>Console debugging and error messages</li>
                      <li>Share with team members</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Generated Code</CardTitle>
                <Button onClick={handleCopy} variant="outline" size="sm">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <DynamicCodeBlock
                  key={codeKey}
                  language="tsx"
                  code={componentCode}
                  maxHeight="600px"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storybook Tab */}
          <TabsContent value="storybook">
            <Card>
              <CardHeader>
                <CardTitle>Storybook Stories</CardTitle>
              </CardHeader>
              <CardContent>
                {storiesCode ? (
                  <DynamicCodeBlock
                    key={`stories-${codeKey}`}
                    language="tsx"
                    code={storiesCode}
                    maxHeight="600px"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Storybook stories not available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality">
            <div className="space-y-6">
              {/* Epic 4.5: Quality Scores Display */}
              {qualityScores && (
                <QualityScoresDisplay qualityScores={qualityScores} />
              )}

              {/* Epic 003 - Story 3.2: Security Issues Display */}
              {securityResults && (
                <SecurityIssuesPanel sanitizationResults={securityResults} />
              )}

              {/* Epic 4.5: Validation Errors Display */}
              {validationResults && (
                <ValidationErrorsDisplay
                  validationResults={validationResults}
                />
              )}

              {/* Legacy quality info (keep for backwards compatibility) */}
              {!qualityScores && metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Generation Metrics</h3>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="text-muted-foreground">
                            Pattern used:
                          </span>{" "}
                          {metadata?.pattern_used} v{metadata?.pattern_version}
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Tokens applied:
                          </span>{" "}
                          {metadata?.tokens_applied}
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Requirements implemented:
                          </span>{" "}
                          {metadata?.requirements_implemented}
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Imports:
                          </span>{" "}
                          {metadata?.imports_count}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Code Quality</h3>
                      <div className="text-sm space-y-1">
                        <p
                          className={
                            metadata?.has_typescript_errors
                              ? "text-destructive"
                              : "text-success"
                          }
                        >
                          {metadata?.has_typescript_errors ? "✗" : "✓"}{" "}
                          TypeScript compilation
                        </p>
                        <p
                          className={
                            metadata?.has_accessibility_warnings
                              ? "text-warning"
                              : "text-success"
                          }
                        >
                          {metadata?.has_accessibility_warnings ? "⚠" : "✓"}{" "}
                          Accessibility
                        </p>
                      </div>
                    </div>

                    {timing && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Performance</h3>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="text-muted-foreground">
                              Total:
                            </span>{" "}
                            {(timing.total_ms / 1000).toFixed(2)}s
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {timing.parsing_ms &&
                              `Parsing: ${(timing.parsing_ms / 1000).toFixed(
                                2
                              )}s • `}
                            {timing.injection_ms &&
                              `Injection: ${(
                                timing.injection_ms / 1000
                              ).toFixed(2)}s • `}
                            {timing.generation_ms &&
                              `Generation: ${(
                                timing.generation_ms / 1000
                              ).toFixed(2)}s • `}
                            {timing.assembly_ms &&
                              `Assembly: ${(timing.assembly_ms / 1000).toFixed(
                                2
                              )}s`}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Generation Metadata */}
              {metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generation Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Pattern:</span>
                        <p className="font-mono">
                          {metadata.pattern_used} v{metadata.pattern_version}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Lines of Code:
                        </span>
                        <p className="font-mono">{metadata.lines_of_code}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Tokens Applied:
                        </span>
                        <p className="font-mono">{metadata.tokens_applied}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Requirements:
                        </span>
                        <p className="font-mono">
                          {metadata.requirements_implemented}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Imports:</span>
                        <p className="font-mono">{metadata.imports_count}</p>
                      </div>
                      {metadata.fix_attempts !== undefined && (
                        <div>
                          <span className="text-muted-foreground">
                            Fix Attempts:
                          </span>
                          <p className="font-mono">{metadata.fix_attempts}</p>
                        </div>
                      )}
                    </div>

                    {timing && (
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">
                          Performance Timing
                        </h4>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="text-muted-foreground">
                              Total:
                            </span>{" "}
                            <span className="font-mono">
                              {(timing.total_ms / 1000).toFixed(2)}s
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Loading placeholder */}
      {isGenerating && !isComplete && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Generating your component... This typically takes less than 60
              seconds.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/patterns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patterns
            </Link>
          </Button>
          <Button variant="outline" onClick={handleStartOver}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </div>
        {isComplete && (
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Files
            </Button>
            <Button onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
