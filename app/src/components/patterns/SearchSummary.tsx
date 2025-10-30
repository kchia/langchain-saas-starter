/**
 * SearchSummary component displays retrieval metadata and performance
 * Shows query construction, methods used, and latency information
 */

import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Clock, Search, Database } from 'lucide-react';
import type { RetrievalMetadata } from '@/types/retrieval';

export interface SearchSummaryProps {
  metadata: RetrievalMetadata;
}

export function SearchSummary({ metadata }: SearchSummaryProps) {
  const { latency_ms, methods_used, total_patterns_searched, query_construction } = metadata;
  
  // Determine latency badge variant (target: ≤1000ms)
  const latencyVariant = latency_ms <= 1000 ? 'success' : latency_ms <= 2000 ? 'warning' : 'error';
  
  return (
    <Alert>
      <Search className="h-4 w-4" />
      <AlertTitle>Search Analysis Summary</AlertTitle>
      <AlertDescription>
        <div className="space-y-3 mt-2">
          {/* Query Construction */}
          {query_construction && (
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium">Query:</span>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="neutral">{query_construction.component_type}</Badge>
                {query_construction.keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Retrieval Methods */}
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium">Methods:</span>
            <div className="flex flex-wrap gap-1.5">
              {methods_used.map((method, idx) => (
                <Badge 
                  key={idx} 
                  variant={method.toLowerCase().includes('semantic') ? 'info' : 'neutral'}
                >
                  {method}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Statistics */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Searched:</span>
              <span className="font-medium">{total_patterns_searched} patterns</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Latency:</span>
              <Badge variant={latencyVariant} size="sm">
                {latency_ms}ms
              </Badge>
              {latency_ms <= 1000 && (
                <span className="text-xs text-muted-foreground">(Target: ≤1000ms)</span>
              )}
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
