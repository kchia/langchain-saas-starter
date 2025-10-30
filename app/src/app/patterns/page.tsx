"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { useWorkflowStore } from "@/stores/useWorkflowStore";
import { WorkflowStep } from "@/types";
import { WorkflowBreadcrumb } from "@/components/composite/WorkflowBreadcrumb";
import { usePatternSelection } from "@/store/patternSelectionStore";
import { usePatternRetrieval } from "@/hooks/usePatternRetrieval";
import { useLibraryStats } from "@/hooks/useLibraryStats";
import { SearchSummary } from "@/components/patterns/SearchSummary";
import { PatternList } from "@/components/patterns/PatternList";
import { PatternLibraryInfo } from "@/components/patterns/PatternLibraryInfo";
import { PatternSkeletonList } from "@/components/patterns/PatternSkeleton";
import { ErrorState } from "@/components/patterns/ErrorState";
import { EmptyState } from "@/components/patterns/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import type { PatternMatch } from "@/types/retrieval";
import type { Pattern } from "@/store/patternSelectionStore";
import type { RequirementProposal } from "@/types/requirement.types";

export default function PatternsPage() {
  const [previewPattern, setPreviewPattern] = useState<PatternMatch | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Get workflow state (requirements from Epic 2)
  const { componentType, proposals, completedSteps, completeStep } = useWorkflowStore();

  // Route guard: redirect if requirements not completed
  useEffect(() => {
    if (!completedSteps.includes(WorkflowStep.REQUIREMENTS)) {
      router.push('/requirements');
    }
  }, [completedSteps, router]);

  // Validate requirements from Epic 2
  useEffect(() => {
    if (!componentType || !proposals) {
      router.push('/requirements');
    }
  }, [componentType, proposals, router]);

  // Get pattern selection state
  const { selectedPattern, selectPattern } = usePatternSelection();

  // Handle hydration for persisted store
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Build requirements for retrieval (memoized to prevent unnecessary refetches)
  const requirements = useMemo(() => ({
    component_type: componentType || '',
    props: proposals.props.filter((p: RequirementProposal) => p.approved).map((p: RequirementProposal) => p.name),
    variants: proposals.states.filter((p: RequirementProposal) => p.approved).map((p: RequirementProposal) => p.name),
    events: proposals.events.filter((p: RequirementProposal) => p.approved).map((p: RequirementProposal) => p.name),
    states: proposals.states.filter((p: RequirementProposal) => p.approved).map((p: RequirementProposal) => p.name),
    a11y: proposals.accessibility.filter((p: RequirementProposal) => p.approved).map((p: RequirementProposal) => p.name),
  }), [componentType, proposals]);
  
  // Fetch patterns using TanStack Query
  const { data, isLoading, isError, error, refetch } = usePatternRetrieval({
    requirements,
    enabled: !!componentType,
  });

  // Fetch library statistics
  const {
    data: libraryStats,
    isLoading: statsLoading,
    isError: statsError
  } = useLibraryStats();
  
  const handleSelectPattern = (pattern: PatternMatch) => {
    // Convert PatternMatch to Pattern for store
    // Note: API returns 'id' but we use 'pattern_id' internally
    const patternForStore: Pattern = {
      pattern_id: pattern.pattern_id || (pattern as any).id,
      name: pattern.name,
      confidence: pattern.confidence,
      source: pattern.source,
      version: pattern.version,
      code: pattern.code,
      metadata: pattern.metadata,
    };
    selectPattern(patternForStore);

    // Mark patterns step as completed
    completeStep(WorkflowStep.PATTERNS);
  };
  
  const handlePreviewPattern = (pattern: PatternMatch) => {
    setPreviewPattern(pattern);
  };

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Workflow Breadcrumb */}
        <WorkflowBreadcrumb />

        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Pattern Match Results
          </h1>
          <p className="text-muted-foreground">
            Top matching patterns for your {componentType || 'component'} requirements
          </p>
        </div>

        {/* Search Summary */}
        {data?.retrieval_metadata && (
          <SearchSummary metadata={data.retrieval_metadata} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Pattern List */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading && <PatternSkeletonList count={3} />}
            
            {isError && (
              <ErrorState error={error} onRetry={() => refetch()} />
            )}
            
            {data && data.patterns.length === 0 && <EmptyState />}
            
            {data && data.patterns.length > 0 && mounted && (
              <PatternList
                key={selectedPattern?.pattern_id || 'none'}
                patterns={data.patterns}
                selectedPatternId={selectedPattern?.pattern_id}
                onSelectPattern={handleSelectPattern}
                onPreviewPattern={handlePreviewPattern}
              />
            )}
          </div>

          {/* Sidebar - Library Info */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              {statsLoading ? (
                <Card variant="outlined">
                  <CardContent className="py-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="animate-pulse flex space-x-2">
                        <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                      </div>
                      <p className="text-sm text-muted-foreground">Loading library stats...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : statsError ? (
                <Card variant="outlined">
                  <CardContent className="py-8">
                    <p className="text-sm text-muted-foreground text-center">
                      Unable to load library statistics
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <PatternLibraryInfo
                  totalPatterns={libraryStats?.total_patterns}
                  componentTypes={libraryStats?.component_types}
                  metrics={libraryStats?.metrics}
                />
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button asChild variant="outline">
            <Link href="/requirements">← Back to Requirements</Link>
          </Button>
          {selectedPattern ? (
            <Button asChild size="lg">
              <Link href="/preview">
                Continue to Preview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" disabled>
              Continue to Preview
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Pattern Preview Dialog */}
        <Dialog open={!!previewPattern} onOpenChange={() => setPreviewPattern(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {previewPattern?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {previewPattern && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {previewPattern.source} · v{previewPattern.version}
                  </div>
                  {previewPattern.metadata.description && (
                    <p className="text-sm">{previewPattern.metadata.description}</p>
                  )}
                  {previewPattern.code && (
                    <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                      <pre className="text-xs">
                        <code>{previewPattern.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
