/**
 * PatternLibraryInfo component displays library metadata and quality metrics
 * Shows total patterns, component types, and retrieval quality metrics
 */

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, TrendingUp, Target } from 'lucide-react';

export interface PatternLibraryInfoProps {
  totalPatterns?: number;
  componentTypes?: string[];
  metrics?: {
    mrr?: number;
    hit_at_3?: number;
  };
}

export function PatternLibraryInfo({
  totalPatterns,
  componentTypes,
  metrics
}: PatternLibraryInfoProps) {
  // Return null if no data
  if (!totalPatterns && !componentTypes) {
    return null;
  }

  return (
    <Card variant="outlined">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Pattern Library</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Patterns */}
        {totalPatterns !== undefined && (
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Patterns</div>
            <div className="text-2xl font-bold">{totalPatterns}</div>
          </div>
        )}

        {/* Supported Components */}
        {componentTypes && componentTypes.length > 0 && (
          <div>
            <div className="text-sm text-muted-foreground mb-2">Supported Components</div>
            <div className="flex flex-wrap gap-1.5">
              {componentTypes.slice(0, 6).map((type, idx) => (
                <Badge key={idx} variant="neutral" size="sm">
                  {type}
                </Badge>
              ))}
              {componentTypes.length > 6 && (
                <Badge variant="neutral" size="sm">
                  +{componentTypes.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Quality Metrics - Only show if available */}
        {metrics && (metrics.mrr !== undefined || metrics.hit_at_3 !== undefined) && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="font-medium">Quality Metrics</span>
            </div>

            {/* Only show MRR if it exists */}
            {metrics.mrr !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">MRR (Mean Reciprocal Rank)</span>
                <Badge
                  variant={metrics.mrr >= 0.75 ? 'success' : 'warning'}
                  size="sm"
                >
                  {(metrics.mrr * 100).toFixed(0)}%
                </Badge>
              </div>
            )}

            {/* Only show Hit@3 if it exists */}
            {metrics.hit_at_3 !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hit@3</span>
                <Badge
                  variant={metrics.hit_at_3 >= 0.85 ? 'success' : 'warning'}
                  size="sm"
                >
                  {(metrics.hit_at_3 * 100).toFixed(0)}%
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
