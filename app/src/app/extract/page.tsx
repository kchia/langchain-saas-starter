"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react";
import { useTokenExtraction } from "@/lib/query/hooks/useTokenExtraction";
import { useFigmaAuth } from "@/lib/query/hooks/useFigmaAuth";
import { useFigmaExtraction } from "@/lib/query/hooks/useFigmaExtraction";
import { useTokenStore } from "@/stores/useTokenStore";
import { useUIStore } from "@/stores/useUIStore";
import { useWorkflowStore } from "@/stores/useWorkflowStore";
import { WorkflowStep } from "@/types";
import type { TokenData } from "@/components/tokens/TokenEditor";
import { useRateLimitHandler } from "@/hooks/useRateLimitHandler";
import { RateLimitAlert } from "@/components/composite/RateLimitAlert";

// New components for EPIC 12
import { CompactTips } from "@/components/extract/CompactTips";
import { FigmaGuidance } from "@/components/extract/FigmaGuidance";
import { WorkflowBreadcrumb } from "@/components/composite/WorkflowBreadcrumb";
import { FileUploadValidator } from "@/components/extract/FileUploadValidator";

// Dynamic imports to avoid SSR issues with prismjs in CodeBlock
const TokenEditor = dynamic(
  () => import("@/components/tokens/TokenEditor").then(mod => ({ default: mod.TokenEditor })), 
  { 
    ssr: false,
    loading: () => <div className="p-4 text-sm text-muted-foreground">Loading editor...</div>
  }
);
const TokenExport = dynamic(
  () => import("@/components/tokens/TokenExport").then(mod => ({ default: mod.TokenExport })), 
  { 
    ssr: false,
    loading: () => <div className="p-4 text-sm text-muted-foreground">Loading export...</div>
  }
);

export default function TokenExtractionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam === "figma" ? "figma" : "screenshot");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Update active tab when URL param changes
  useEffect(() => {
    if (tabParam === "figma" || tabParam === "screenshot") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Figma state
  const [figmaPat, setFigmaPat] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [isPatValid, setIsPatValid] = useState(false);
  
  const { mutate: extractTokens, isPending, isError, error } = useTokenExtraction();
  const { mutate: authFigma, isPending: isAuthPending } = useFigmaAuth();
  const { mutate: extractFromFigma, isPending: isFigmaPending } = useFigmaExtraction();
  const tokens = useTokenStore((state) => state.tokens);
  const metadata = useTokenStore((state) => state.metadata);
  const showAlert = useUIStore((state) => state.showAlert);
  const setUploadedFile = useWorkflowStore((state) => state.setUploadedFile);
  const completeStep = useWorkflowStore((state) => state.completeStep);
  
  // Rate limit handling (Epic 003 Story 3.3)
  const { rateLimitState, handleRateLimitError, clearRateLimit, isRateLimitError } = useRateLimitHandler();

  // Convert tokens to TokenEditor format with actual confidence scores from backend
  const getEditorTokens = (): TokenData | null => {
    if (!tokens) return null;

    return {
      colors: tokens.colors || {},
      typography: tokens.typography || {},
      spacing: tokens.spacing || {},
      borderRadius: tokens.borderRadius || {},
    };
  };

  // Check if tokens are actually empty (all categories are empty objects)
  const hasTokens = (): boolean => {
    if (!tokens) return false;
    const tokenCount =
      Object.keys(tokens.colors || {}).length +
      Object.keys(tokens.typography || {}).length +
      Object.keys(tokens.spacing || {}).length +
      Object.keys(tokens.borderRadius || {}).length;
    return tokenCount > 0;
  };

  // Get confidence scores from metadata
  const getConfidenceScores = (): Record<string, number> => {
    return (metadata as { confidence?: Record<string, number> })?.confidence || {};
  };

  // Handle upload with success tracking
  const handleUpload = () => {
    if (selectedFile) {
      // Store file in workflow store for requirements page
      setUploadedFile(selectedFile);
      
      extractTokens(selectedFile, {
        onSuccess: () => {
          // Mark extract step as completed
          completeStep(WorkflowStep.EXTRACT);

          // Show success toast
          showAlert('success', '✓ Tokens extracted successfully! Scroll down to review and edit.');

          // Auto-scroll to TokenEditor after short delay
          setTimeout(() => {
            document.getElementById("token-editor")?.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }, 500);
        },
        onError: (error) => {
          // Handle rate limit errors (Epic 003 Story 3.3)
          if (isRateLimitError(error)) {
            handleRateLimitError(error);
          }
          // Other errors are handled by the error state below
        }
      });
    }
  };

  // Handle Figma PAT validation
  const handleValidatePat = () => {
    if (figmaPat.trim()) {
      authFigma(figmaPat, {
        onSuccess: (data) => {
          if (data.valid) {
            setIsPatValid(true);
          } else {
            showAlert('error', data.message);
          }
        },
      });
    }
  };

  // Handle Figma extraction
  const handleFigmaExtract = () => {
    if (figmaUrl.trim() && figmaPat.trim()) {
      extractFromFigma({
        figmaUrl,
        personalAccessToken: figmaPat,
      }, {
        onSuccess: () => {
          // Mark extract step as completed
          completeStep(WorkflowStep.EXTRACT);
          
          // Show success toast
          showAlert('success', '✓ Tokens extracted from Figma successfully!');
        },
        onError: (error) => {
          // Handle rate limit errors (Epic 003 Story 3.3)
          if (isRateLimitError(error)) {
            handleRateLimitError(error);
          }
          // Other errors are handled by the error state below
        }
      });
    }
  };

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/extract?tab=${value}`);
  };

  return (
    <main className="container mx-auto p-4 sm:p-8 space-y-6">
      {/* Workflow Breadcrumb */}
      <WorkflowBreadcrumb />

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Extract Design Tokens
        </h1>
        <p className="text-muted-foreground">
          Upload a screenshot or connect to Figma to extract design tokens
        </p>
      </div>

      {/* Tabs for Screenshot vs Figma */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
          <TabsTrigger value="figma">Figma</TabsTrigger>
        </TabsList>

        {/* Screenshot Tab */}
        <TabsContent value="screenshot" className="space-y-4">
          {/* Compact Tips */}
          <CompactTips mode="screenshot" />

          <Card>
            <CardHeader>
              <CardTitle>Upload Screenshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload with Validation */}
              {!tokens && (
                <FileUploadValidator
                  onFileSelected={(file) => {
                    setSelectedFile(file);
                    setUploadedFile(file);
                  }}
                  onFileRemoved={() => {
                    setSelectedFile(null);
                  }}
                  acceptedFileTypes="image/png,image/jpeg,image/jpg,image/svg+xml"
                  maxFileSizeMB={10}
                  disabled={isPending}
                />
              )}

              {/* Extract Button */}
              {selectedFile && !tokens && (
                <div className="flex justify-end">
                  <Button onClick={handleUpload} disabled={isPending} size="lg">
                    {isPending ? "Extracting..." : "Extract Tokens"}
                    {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              )}

              {/* Progress */}
              {isPending && (
                <div className="space-y-2">
                  <Progress indeterminate className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Analyzing screenshot with GPT-4V...
                  </p>
                </div>
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

              {/* Error */}
              {isError && !rateLimitState.isRateLimited && (
                <Alert variant="error">
                  <p className="font-medium">Extraction Failed</p>
                  <p className="text-sm">{error?.message}</p>
                </Alert>
              )}

              {/* Extracted Tokens Preview */}
              {tokens && metadata && hasTokens() && (
                <div className="space-y-4">
                  <Alert variant="success">
                    <div>
                      <p className="font-medium">✓ Tokens Extracted Successfully!</p>
                      <p className="text-sm mt-1">
                        From: {metadata.filename || 'Unknown file'}
                      </p>
                    </div>
                  </Alert>
                </div>
              )}

              {/* No tokens extracted warning */}
              {tokens && metadata && !hasTokens() && (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="ml-2">
                    <p className="font-medium">No Design Tokens Extracted</p>
                    <p className="text-sm">
                      We couldn&apos;t identify any design tokens in this image. Try uploading a screenshot that clearly shows colors, typography, or spacing information.
                    </p>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Token Editor */}
          {tokens && getEditorTokens() && hasTokens() && (
            <Card id="token-editor">
              <CardHeader>
                <CardTitle>Edit Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <TokenEditor
                  tokens={getEditorTokens()!}
                  confidence={getConfidenceScores()}
                />
              </CardContent>
            </Card>
          )}

          {/* Token Export */}
          {tokens && getEditorTokens() && hasTokens() && (
            <Card>
              <CardHeader>
                <CardTitle>Export Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <TokenExport
                  tokens={getEditorTokens()!}
                  metadata={{
                    method: "screenshot",
                    timestamp: new Date().toISOString(),
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          {tokens && hasTokens() && (
            <div className="flex justify-end">
              <Button asChild size="lg">
                <Link href="/requirements">
                  Continue to Requirements
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Figma Tab */}
        <TabsContent value="figma" className="space-y-4">
          {/* Compact Tips */}
          <CompactTips mode="figma" />

          <Card>
            <CardHeader>
              <CardTitle>Figma Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PAT Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="figma-pat">
                  Figma Personal Access Token
                </label>
                <div className="flex gap-2">
                  <input
                    id="figma-pat"
                    type="password"
                    value={figmaPat}
                    onChange={(e) => {
                      setFigmaPat(e.target.value);
                      setIsPatValid(false);
                    }}
                    placeholder="figd_..."
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    disabled={isPatValid}
                  />
                  {!isPatValid ? (
                    <Button
                      onClick={handleValidatePat}
                      disabled={!figmaPat.trim() || isAuthPending}
                    >
                      {isAuthPending ? "Validating..." : "Validate"}
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Valid
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your token from{" "}
                  <a
                    href="https://www.figma.com/developers/api#access-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Figma Settings
                  </a>
                </p>
              </div>

              {/* Figma URL Input */}
              {isPatValid && (
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="figma-url">
                    Figma File URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="figma-url"
                      type="url"
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                      placeholder="https://www.figma.com/file/..."
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                    <Button
                      onClick={handleFigmaExtract}
                      disabled={!figmaUrl.trim() || isFigmaPending}
                    >
                      {isFigmaPending ? "Extracting..." : "Extract"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste the full URL of your Figma file
                  </p>
                </div>
              )}

              {/* Progress */}
              {isFigmaPending && (
                <div className="space-y-2">
                  <Progress indeterminate className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Fetching file from Figma API...
                  </p>
                </div>
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

              {/* Cache Indicator */}
              {metadata?.cached && metadata?.extractionMethod === 'figma' && (
                <Alert>
                  <p className="text-sm">
                    ⚡ Results from cache (5 min TTL)
                  </p>
                </Alert>
              )}

              {/* Extracted Tokens Preview */}
              {tokens && metadata?.extractionMethod === 'figma' && hasTokens() && (
                <div className="space-y-4">
                  <Alert variant="success">
                    <p className="font-medium">Tokens Extracted Successfully!</p>
                    <p className="text-sm">
                      From: {metadata.filename || 'Figma file'}
                    </p>
                  </Alert>
                </div>
              )}

              {/* No tokens extracted warning for Figma */}
              {tokens && metadata?.extractionMethod === 'figma' && !hasTokens() && (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="ml-2">
                    <p className="font-medium">No Design Tokens Extracted</p>
                    <p className="text-sm">
                      No published styles found in this Figma file. Make sure your design system has published color and text styles.
                    </p>
                  </div>
                </Alert>
              )}

              {/* Optional Detailed Guidance */}
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="figma-help">
                  <AccordionTrigger className="text-sm">
                    📚 Naming Conventions & Best Practices
                  </AccordionTrigger>
                  <AccordionContent>
                    <FigmaGuidance />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Token Editor (shared for Figma) */}
          {tokens && metadata?.extractionMethod === 'figma' && getEditorTokens() && hasTokens() && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <TokenEditor
                  tokens={getEditorTokens()!}
                  confidence={getConfidenceScores()}
                />
              </CardContent>
            </Card>
          )}

          {/* Token Export (shared for Figma) */}
          {tokens && metadata?.extractionMethod === 'figma' && getEditorTokens() && hasTokens() && (
            <Card>
              <CardHeader>
                <CardTitle>Export Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <TokenExport
                  tokens={getEditorTokens()!}
                  metadata={{
                    method: "figma",
                    timestamp: new Date().toISOString(),
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation (shared for Figma) */}
          {tokens && metadata?.extractionMethod === 'figma' && hasTokens() && (
            <div className="flex justify-end">
              <Button asChild size="lg">
                <Link href="/requirements">
                  Continue to Requirements
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
