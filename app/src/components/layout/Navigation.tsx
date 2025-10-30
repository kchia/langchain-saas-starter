"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useWorkflowStore } from "@/stores/useWorkflowStore";
import { useTokenStore } from "@/stores/useTokenStore";
import { usePatternSelection } from "@/store/patternSelectionStore";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { WorkflowStep } from "@/types";
import {
  Home,
  Upload,
  Menu,
  X,
  HelpCircle,
  RotateCcw,
  BarChart3
} from "lucide-react";
import { useState } from "react";

const allNavItems = [
  { href: "/", label: "Dashboard", icon: Home, step: WorkflowStep.DASHBOARD },
  {
    href: "/extract",
    label: "Extract",
    icon: Upload,
    step: WorkflowStep.EXTRACT
  }
];

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const progress = useWorkflowStore((state) => state.progress);
  const getAvailableSteps = useWorkflowStore(
    (state) => state.getAvailableSteps
  );
  const resetWorkflow = useWorkflowStore((state) => state.resetWorkflow);
  const availableSteps = getAvailableSteps();
  const clearTokens = useTokenStore((state) => state.clearTokens);
  const clearSelection = usePatternSelection((state) => state.clearSelection);
  const clearComparison = usePatternSelection((state) => state.clearComparison);
  const { resetOnboarding } = useOnboardingStore();

  // Filter navigation items to only show available steps
  const navItems = allNavItems.filter((item) =>
    availableSteps.includes(item.step)
  );

  // Check if admin features are enabled (via environment variable)
  const isAdminModeEnabled = process.env.NEXT_PUBLIC_ENABLE_ADMIN === "true";

  // Handle start over - reset all workflow state
  const handleStartOver = () => {
    // Clear all stores
    resetWorkflow();
    clearTokens();
    clearSelection();
    clearComparison();
    // Close dialog and mobile menu
    setResetDialogOpen(false);
    setMobileMenuOpen(false);
    // Redirect to dashboard
    router.push("/");
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                CF
              </span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">
              ComponentForge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Help Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resetOnboarding()}
              className="gap-2"
              aria-label="Show help and onboarding"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>

            {/* Evaluation Button (Admin Only) */}
            {isAdminModeEnabled && (
              <Link href="/evaluation">
                <Button
                  variant={pathname === "/evaluation" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    pathname === "/evaluation" &&
                      "bg-primary text-primary-foreground"
                  )}
                  aria-label="Evaluation metrics dashboard"
                >
                  <BarChart3 className="h-4 w-4" />
                  Evaluation
                </Button>
              </Link>
            )}

            {/* Start Over Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResetDialogOpen(true)}
              className="gap-2"
              aria-label="Reset workflow and start over"
            >
              <RotateCcw className="h-4 w-4" />
              Start Over
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Workflow Progress */}
        {progress > 0 && (
          <div className="pb-2 px-4">
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-1" />
              <span className="text-xs text-muted-foreground min-w-[3ch]">
                {progress}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-full justify-start gap-2",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Help Button in Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetOnboarding();
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-2"
              aria-label="Show help and onboarding"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>

            {/* Evaluation Button in Mobile Menu (Admin Only) */}
            {isAdminModeEnabled && (
              <Link href="/evaluation" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={pathname === "/evaluation" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-2",
                    pathname === "/evaluation" &&
                      "bg-primary text-primary-foreground"
                  )}
                  aria-label="Evaluation metrics dashboard"
                >
                  <BarChart3 className="h-4 w-4" />
                  Evaluation
                </Button>
              </Link>
            )}

            {/* Start Over Button in Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResetDialogOpen(true)}
              className="w-full justify-start gap-2"
              aria-label="Reset workflow and start over"
            >
              <RotateCcw className="h-4 w-4" />
              Start Over
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Over?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all your progress including extracted tokens,
              requirements, and patterns. You'll be redirected to the dashboard
              to begin a new component.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartOver}>
              Yes, Start Over
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}
