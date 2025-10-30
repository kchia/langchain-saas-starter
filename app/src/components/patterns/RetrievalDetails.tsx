/**
 * RetrievalDetails component displays expandable ranking breakdown
 * Shows BM25, semantic scores, and match explanation
 */

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { PatternMatch } from '@/types/retrieval';

export interface RetrievalDetailsProps {
  pattern: PatternMatch;
}

export function RetrievalDetails({ pattern }: RetrievalDetailsProps) {
  const { scores, explanation } = pattern;

  // Return null if scores or explanation are missing
  if (!scores || !explanation) {
    return null;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="details">
        <AccordionTrigger className="text-sm font-medium">
          Retrieval Details
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 pt-2">
            {/* Scores Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="sm">BM25</Badge>
                  <span className="text-muted-foreground">
                    Score: {scores.bm25_score?.toFixed(3) ?? 'N/A'} • Rank: #{scores.bm25_rank ?? 'N/A'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Weight: {explanation.weight_breakdown?.bm25_weight ? (explanation.weight_breakdown.bm25_weight * 100).toFixed(0) : 'N/A'}%
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="info" size="sm">Semantic</Badge>
                  <span className="text-muted-foreground">
                    Score: {scores.semantic_score?.toFixed(3) ?? 'N/A'} • Rank: #{scores.semantic_rank ?? 'N/A'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Weight: {explanation.weight_breakdown?.semantic_weight ? (explanation.weight_breakdown.semantic_weight * 100).toFixed(0) : 'N/A'}%
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-medium pt-1 border-t">
                <span>Weighted Score:</span>
                <span>{scores.weighted_score?.toFixed(3) ?? 'N/A'}</span>
              </div>
            </div>

            {/* Match Reason */}
            {explanation.match_reason && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Match Reason:</span>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {explanation.match_reason}
                </p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
