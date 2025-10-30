/**
 * MatchHighlights component displays matched props, variants, and a11y features
 * Shows what matched between requirements and pattern
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

export interface MatchHighlightsProps {
  matched_props?: string[];
  matched_variants?: string[];
  matched_a11y?: string[];
}

export function MatchHighlights({ 
  matched_props = [], 
  matched_variants = [], 
  matched_a11y = [] 
}: MatchHighlightsProps) {
  const hasMatches = matched_props.length > 0 || matched_variants.length > 0 || matched_a11y.length > 0;
  
  if (!hasMatches) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Match Highlights</span>
      </div>
      
      <div className="space-y-2">
        {/* Matched Props */}
        {matched_props.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-muted-foreground min-w-[60px]">Props:</span>
            {matched_props.map((prop, idx) => (
              <Badge key={idx} variant="success" size="sm">
                {prop}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Matched Variants */}
        {matched_variants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-muted-foreground min-w-[60px]">Variants:</span>
            {matched_variants.map((variant, idx) => (
              <Badge key={idx} variant="success" size="sm">
                {variant}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Matched A11y */}
        {matched_a11y.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-muted-foreground min-w-[60px]">A11y:</span>
            {matched_a11y.map((feature, idx) => (
              <Badge key={idx} variant="success" size="sm">
                {feature}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
