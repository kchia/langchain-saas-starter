"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("[Error Boundary]", error);
  }, [error]);

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Something went wrong!
          </h1>
          <p className="text-muted-foreground">
            An error occurred while loading this page.
          </p>
        </div>

        <Alert variant="error">
          <div className="space-y-2">
            <p className="font-medium">Error Details</p>
            <p className="text-sm">{error.message || "An unexpected error occurred"}</p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </Alert>

        <Card>
          <CardContent className="py-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              This error has been logged. You can try the following:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Click &quot;Try Again&quot; to reload the page</li>
              <li>Go back to the previous page</li>
              <li>Return to the dashboard and try again</li>
              <li>Clear your browser cache and cookies</li>
            </ul>
            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={reset} size="lg">
                Try Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => (window.location.href = "/")}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
