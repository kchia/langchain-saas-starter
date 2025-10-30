/**
 * DetailedPatternCard component extends PatternCard with retrieval details
 * Shows pattern ranking, match highlights, and retrieval breakdown
 */

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { PatternMatch } from '@/types/retrieval';
import { MatchHighlights } from './MatchHighlights';
import { RetrievalDetails } from './RetrievalDetails';

export interface DetailedPatternCardProps {
  pattern: PatternMatch;
  rank: number;
  selected?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
  className?: string;
}

export function DetailedPatternCard({
  pattern,
  rank,
  selected = false,
  onSelect,
  onPreview,
  className,
}: DetailedPatternCardProps) {
  const { name, source, version, confidence, metadata, explanation } = pattern;
  
  // Determine badge variant based on confidence
  const scoreVariant = confidence >= 0.9 ? 'success' : confidence >= 0.7 ? 'warning' : 'error';
  const scorePercentage = Math.round(confidence * 100);
  
  // Rank emoji mapping
  const rankEmoji = rank === 1 ? '1️⃣' : rank === 2 ? '2️⃣' : rank === 3 ? '3️⃣' : `${rank}`;

  return (
    <Card
      variant={selected ? 'interactive' : 'outlined'}
      className={cn(
        'transition-all',
        selected && 'border-primary bg-blue-50/30 dark:bg-blue-950/20',
        className
      )}
      aria-label={`Pattern ${name}, rank ${rank}, match score ${scorePercentage}%${selected ? ', selected' : ''}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" aria-label={`Rank ${rank}`}>{rankEmoji}</span>
              <h3 className="text-lg font-semibold leading-none tracking-tight truncate">
                {name}
              </h3>
              {selected && (
                <Badge variant="info" aria-label="Selected pattern">
                  SELECTED
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {source} · v{version}
            </p>
          </div>
          <Badge variant={scoreVariant} size="lg" aria-label={`Match score ${scorePercentage}%`}>
            {scorePercentage}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match score visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confidence Score</span>
            <span className="font-medium">{confidence.toFixed(2)}</span>
          </div>
          <Progress 
            value={scorePercentage} 
            variant={scoreVariant}
            aria-label={`Match score progress: ${scorePercentage}%`}
          />
        </div>

        {/* Description */}
        {metadata.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {metadata.description}
          </p>
        )}

        {/* Match Highlights */}
        <MatchHighlights
          matched_props={explanation.matched_props}
          matched_variants={explanation.matched_variants}
          matched_a11y={explanation.matched_a11y}
        />

        {/* Retrieval Details Accordion */}
        <RetrievalDetails pattern={pattern} />
      </CardContent>

      <CardFooter className="gap-2">
        {onPreview && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onPreview}
            aria-label={`Preview code for ${name}`}
          >
            👁️ Preview Code
          </Button>
        )}
        {onSelect && (
          <Button
            type="button"
            variant={selected ? 'outline' : 'default'}
            size="sm"
            onClick={onSelect}
            aria-label={selected ? `Deselect ${name}` : `Select ${name}`}
            aria-pressed={selected}
          >
            {selected ? 'Selected' : '✓ Select This Pattern'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
