"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkflowStore } from "@/stores/useWorkflowStore";
import { useTokenStore } from "@/stores/useTokenStore";
import { WorkflowStep } from "@/types";
import { useRequirementProposal } from "@/lib/query/hooks/useRequirementProposal";
import { ApprovalPanelContainer } from "@/components/requirements/ApprovalPanelContainer";
import { ExportPreview } from "@/components/requirements/ExportPreview";
import { WorkflowBreadcrumb } from "@/components/composite/WorkflowBreadcrumb";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import {
  exportRequirements,
  getExportPreview,
  type ExportPreviewResponse
} from "@/lib/api/requirements.api";

export default function RequirementsPage() {
  const router = useRouter();
  const uploadedFile = useWorkflowStore((state) => state.uploadedFile);
  const tokens = useTokenStore((state) => state.tokens);
  const componentType = useWorkflowStore((state) => state.componentType);
  const componentConfidence = useWorkflowStore(
    (state) => state.componentConfidence
  );
  const proposals = useWorkflowStore((state) => state.proposals);
  const exportId = useWorkflowStore((state) => state.exportId);
  const setExportInfo = useWorkflowStore((state) => state.setExportInfo);
  const completeStep = useWorkflowStore((state) => state.completeStep);
  const completedSteps = useWorkflowStore((state) => state.completedSteps);

  const {
    mutate: proposeRequirements,
    isPending,
    error,
    progress,
    progressMessage
  } = useRequirementProposal();
  const hasTriggeredProposal = useRef(false);

  // Route guard: redirect if extract not completed
  useEffect(() => {
    if (!completedSteps.includes(WorkflowStep.EXTRACT)) {
      router.push("/extract");
    }
  }, [completedSteps, router]);

  // Export preview state
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportPreview, setExportPreview] =
    useState<ExportPreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Auto-trigger requirement proposal on mount if file exists
  useEffect(() => {
    if (uploadedFile && !componentType && !hasTriggeredProposal.current) {
      hasTriggeredProposal.current = true;
      proposeRequirements({
        file: uploadedFile,
        tokens: tokens || undefined
      });
    }
    // Reset flag when component type is cleared
    if (!uploadedFile || componentType) {
      hasTriggeredProposal.current = false;
    }
    // Only trigger when file or componentType changes, not tokens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFile, componentType]);

  // Handle export preview
  const handleShowExportPreview = async () => {
    if (!componentType || componentConfidence === undefined) return;

    setIsLoadingPreview(true);
    setExportError(null);

    try {
      const preview = await getExportPreview(
        componentType,
        componentConfidence,
        proposals
      );
      setExportPreview(preview);
      setShowExportPreview(true);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Failed to generate export preview"
      );
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Handle export confirmation
  const handleExport = async () => {
    if (!componentType || componentConfidence === undefined) return;

    setIsExporting(true);
    setExportError(null);

    try {
      const result = await exportRequirements({
        componentType,
        componentConfidence,
        proposals,
        tokens: tokens || undefined
      });

      // Store export info in workflow store
      setExportInfo(result.exportId, result.summary.exportedAt);

      // Mark requirements step as completed
      completeStep(WorkflowStep.REQUIREMENTS);

      setShowExportPreview(false);

      // Navigate to patterns page
      router.push(`/patterns?exportId=${result.exportId}`);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Failed to export requirements"
      );
    } finally {
      setIsExporting(false);
    }
  };

  // If no file, redirect to extract
  if (!uploadedFile) {
    return (
      <main className="container mx-auto p-8">
        <Alert variant="warning">
          <p className="font-medium mb-2">No screenshot found</p>
          <p className="text-sm mb-4">
            Please upload a screenshot first to generate requirements.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/extract">← Back to Extraction</Link>
          </Button>
        </Alert>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:p-8 space-y-6">
      {/* Workflow Breadcrumb */}
      <WorkflowBreadcrumb />

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Review Requirements
        </h1>
        <p className="text-muted-foreground">
          AI-generated component requirements based on your screenshot
        </p>
      </div>

      {/* Loading State */}
      {isPending && (
        <div className="space-y-4">
          <Alert variant="info">
            <p className="font-medium">
              🤖 {progressMessage || "Analyzing your component..."}
            </p>
            <p className="text-sm mt-1">This typically takes 10-15 seconds.</p>
          </Alert>
          {progress > 0 ? (
            <Progress value={progress} className="h-2" />
          ) : (
            <Progress indeterminate className="h-2" />
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="error">
          <p className="font-medium">Analysis Failed</p>
          <p className="text-sm mt-1">{error.message}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              if (uploadedFile) {
                proposeRequirements({
                  file: uploadedFile,
                  tokens: tokens || undefined
                });
              }
            }}
          >
            Try Again
          </Button>
        </Alert>
      )}

      {/* No Requirements Yet (shown when file exists but no analysis done) */}
      {uploadedFile && !componentType && !isPending && !error && (
        <Alert variant="info">
          <p className="font-medium">Ready to analyze your component</p>
          <p className="text-sm mt-1">
            Click the button below to generate AI-powered requirements from your
            screenshot.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              if (uploadedFile) {
                proposeRequirements({
                  file: uploadedFile,
                  tokens: tokens || undefined
                });
              }
            }}
          >
            Analyze Screenshot
          </Button>
        </Alert>
      )}

      {/* Approval Panel (shown after analysis completes) */}
      {componentType && !isPending && (
        <>
          <ApprovalPanelContainer />

          {/* Export Error */}
          {exportError && (
            <Alert variant="error">
              <p className="font-medium">Export Failed</p>
              <p className="text-sm mt-1">{exportError}</p>
            </Alert>
          )}

          {/* Export Preview Modal */}
          {showExportPreview && exportPreview && (
            <Card className="p-6">
              <ExportPreview
                preview={exportPreview}
                onExport={handleExport}
                onCancel={() => setShowExportPreview(false)}
                isExporting={isExporting}
              />
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/extract">← Back to Extraction</Link>
            </Button>

            {!exportId ? (
              <Button
                onClick={handleShowExportPreview}
                size="lg"
                disabled={isLoadingPreview}
              >
                {isLoadingPreview
                  ? "Loading Preview..."
                  : "Export Requirements"}
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href={`/patterns?exportId=${exportId}`}>
                  Continue to Patterns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </>
      )}
    </main>
  );
}
