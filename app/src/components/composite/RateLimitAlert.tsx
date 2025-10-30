/**
 * Rate Limit Alert Component
 * Epic 003 Story 3.3: Rate Limiting
 * 
 * Displays a warning when rate limit is exceeded with countdown timer
 */

import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export interface RateLimitAlertProps {
  retryAfter: number; // seconds remaining
  message?: string;
  endpoint?: string;
  onDismiss?: () => void;
}

export function RateLimitAlert({
  retryAfter,
  message = 'You have exceeded the rate limit.',
  endpoint,
  onDismiss,
}: RateLimitAlertProps) {
  // Format time remaining
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Alert 
      variant="warning" 
      dismissible={!!onDismiss}
      onDismiss={onDismiss}
      className="animate-in fade-in-50 slide-in-from-top-2 duration-300"
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        Rate Limit Exceeded
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{message}</p>
        {endpoint && (
          <p className="text-xs opacity-75">
            Endpoint: <code className="font-mono">{endpoint}</code>
          </p>
        )}
        <div className="flex items-center gap-2 mt-3 p-2 rounded bg-yellow-100 dark:bg-yellow-900/20">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">
            Please wait {formatTime(retryAfter)} before trying again
          </span>
        </div>
        <p className="text-xs mt-2 opacity-75">
          This page will automatically retry when the waiting period is over.
        </p>
      </AlertDescription>
    </Alert>
  );
}
