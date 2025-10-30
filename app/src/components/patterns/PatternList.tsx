/**
 * PatternList component orchestrates pattern cards display
 * Maps over patterns and handles selection state
 */

import { DetailedPatternCard } from './DetailedPatternCard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import type { PatternMatch } from '@/types/retrieval';

export interface PatternListProps {
  patterns: PatternMatch[];
  selectedPatternId?: string | null;
  onSelectPattern?: (pattern: PatternMatch) => void;
  onPreviewPattern?: (pattern: PatternMatch) => void;
}

export function PatternList({ 
  patterns, 
  selectedPatternId,
  onSelectPattern,
  onPreviewPattern 
}: PatternListProps) {
  // Empty state
  if (patterns.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold mb-2">No Patterns Found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No matching patterns were found for your requirements. 
            Try adjusting your requirements or check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {patterns.map((pattern, index) => {
        const patternId = pattern.pattern_id || (pattern as any).id;
        return (
          <DetailedPatternCard
            key={patternId}
            pattern={pattern}
            rank={index + 1}
            selected={!!selectedPatternId && selectedPatternId === patternId}
            onSelect={() => onSelectPattern?.(pattern)}
            onPreview={() => onPreviewPattern?.(pattern)}
          />
        );
      })}
    </div>
  );
}
