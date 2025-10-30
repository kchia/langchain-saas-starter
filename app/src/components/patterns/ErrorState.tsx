/**
 * ErrorState component displays retrieval failure errors
 * Shows user-friendly error messages with retry functionality
 */

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorStateProps {
  error?: Error | null;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  // Determine error message
  const errorMessage = error?.message || 'An unexpected error occurred while retrieving patterns.';
  
  // Check if it's a network error
  const isNetworkError = errorMessage.toLowerCase().includes('network') || 
                         errorMessage.toLowerCase().includes('connect');
  
  return (
    <Alert variant="error">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Patterns</AlertTitle>
      <AlertDescription>
        <div className="space-y-3">
          <p className="text-sm">{errorMessage}</p>
          
          {isNetworkError && (
            <p className="text-sm text-muted-foreground">
              Please check your internet connection and try again.
            </p>
          )}
          
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
