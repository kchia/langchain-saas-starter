/**
 * RequirementCard component displays a single requirement proposal
 * with confidence indicator, rationale, and action buttons.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Edit, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  RequirementProposal,
  getRequirementConfidenceLevel,
  RequirementConfidenceLevel,
} from '@/types/requirement.types';

interface RequirementCardProps {
  requirement: RequirementProposal;
  onAccept: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

export function RequirementCard({
  requirement,
  onAccept,
  onEdit,
  onRemove,
}: RequirementCardProps) {
  const [showRationale, setShowRationale] = React.useState(false);
  const confidenceLevel = getRequirementConfidenceLevel(requirement.confidence);

  // Get confidence badge variant
  const getConfidenceBadgeVariant = (level: RequirementConfidenceLevel) => {
    switch (level) {
      case RequirementConfidenceLevel.HIGH:
        return 'success';
      case RequirementConfidenceLevel.MEDIUM:
        return 'warning';
      case RequirementConfidenceLevel.LOW:
        return 'error';
      default:
        return 'neutral';
    }
  };

  // Get confidence icon
  const getConfidenceIcon = (level: RequirementConfidenceLevel) => {
    switch (level) {
      case RequirementConfidenceLevel.HIGH:
        return '✅';
      case RequirementConfidenceLevel.MEDIUM:
        return '⚠️';
      case RequirementConfidenceLevel.LOW:
        return '❌';
      default:
        return '?';
    }
  };

  const badgeVariant = getConfidenceBadgeVariant(confidenceLevel);
  const confidenceIcon = getConfidenceIcon(confidenceLevel);
  const shouldFlagForReview = requirement.confidence < 0.8;

  return (
    <Card
      variant={shouldFlagForReview ? 'outlined' : 'default'}
      className={shouldFlagForReview ? 'border-yellow-300 bg-yellow-50' : ''}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-base">{requirement.name}</h4>
              <Badge variant="neutral" className="text-xs">
                {requirement.id}
              </Badge>
            </div>

            {/* Values for props */}
            {requirement.values && requirement.values.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {requirement.values.map((value, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {value}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description for states/a11y */}
            {requirement.description && (
              <p className="text-sm text-gray-600 mt-2">
                {requirement.description}
              </p>
            )}

            {/* Required indicator for events/a11y */}
            {requirement.required !== undefined && (
              <Badge variant={requirement.required ? 'info' : 'neutral'} className="mt-2">
                {requirement.required ? 'Required' : 'Optional'}
              </Badge>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={badgeVariant} className="flex items-center gap-1">
              <span>{confidenceIcon}</span>
              <span>{requirement.confidence.toFixed(2)}</span>
            </Badge>

            {shouldFlagForReview && (
              <Badge variant="warning" className="text-xs">
                Review Needed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Rationale section */}
        <div className="border-t border-gray-200 pt-3">
          <button
            onClick={() => setShowRationale(!showRationale)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-full"
          >
            <span className="font-medium">Rationale</span>
            {showRationale ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showRationale && (
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
              {requirement.rationale}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            variant={requirement.approved ? 'success' : 'outline'}
            onClick={() => onAccept(requirement.id)}
            className="flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            {requirement.approved ? 'Accepted' : 'Accept'}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(requirement.id)}
            className="flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(requirement.id)}
            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
            Remove
          </Button>
        </div>

        {requirement.edited && (
          <p className="text-xs text-gray-500 mt-2 italic">
            ✏️ Modified by user
          </p>
        )}
      </CardContent>
    </Card>
  );
}
