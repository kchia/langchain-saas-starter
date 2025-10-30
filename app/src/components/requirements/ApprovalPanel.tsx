/**
 * ApprovalPanel component displays all proposed requirements
 * grouped by category with bulk actions and approval workflow.
 */

'use client';

import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { CategorySection } from './CategorySection';
import { RequirementCard } from './RequirementCard';
import {
  RequirementProposal,
  RequirementCategory,
  ComponentType,
} from '@/types/requirement.types';

interface ApprovalPanelProps {
  componentType: ComponentType;
  componentConfidence: number;
  proposals: {
    props: RequirementProposal[];
    events: RequirementProposal[];
    states: RequirementProposal[];
    accessibility: RequirementProposal[];
  };
  onAccept: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onAcceptAll: () => void;
  onReviewLowConfidence: () => void;
  onAddCustom: () => void;
}

export function ApprovalPanel({
  componentType,
  componentConfidence,
  proposals,
  onAccept,
  onEdit,
  onRemove,
  onAcceptAll,
  onReviewLowConfidence,
  onAddCustom,
}: ApprovalPanelProps) {
  // Calculate statistics
  const allProposals = [
    ...proposals.props,
    ...proposals.events,
    ...proposals.states,
    ...proposals.accessibility,
  ];

  const totalCount = allProposals.length;
  const approvedCount = allProposals.filter((p) => p.approved).length;
  const lowConfidenceCount = allProposals.filter((p) => p.confidence < 0.8).length;

  // Get component type badge variant
  const getComponentBadgeVariant = (confidence: number) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  };

  const componentBadgeVariant = getComponentBadgeVariant(componentConfidence);
  const hasLowConfidence = lowConfidenceCount > 0;

  return (
    <div className="space-y-6">
      {/* Analysis Summary Banner */}
      <Alert variant="info">
        <AlertTitle className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          AI Analysis Complete
        </AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Component Type:</span>
              <Badge variant={componentBadgeVariant} className="flex items-center gap-1">
                <span>{componentType}</span>
                <span className="text-xs">({componentConfidence.toFixed(2)})</span>
              </Badge>
            </div>
            <p className="text-sm">
              Analyzed {totalCount} requirements across {Object.keys(proposals).length} categories.
              Review and approve the proposals below.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Bulk Actions Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="success"
                onClick={onAcceptAll}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept All
              </Button>

              {hasLowConfidence && (
                <Button
                  variant="warning"
                  onClick={onReviewLowConfidence}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Review Low Confidence ({lowConfidenceCount})
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={onAddCustom}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Custom Requirement
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <span className="font-medium">{approvedCount}</span> of{' '}
              <span className="font-medium">{totalCount}</span> approved
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements by Category */}
      <div className="space-y-4">
        {/* Props Section */}
        {proposals.props.length > 0 && (
          <CategorySection
            category={RequirementCategory.PROPS}
            count={proposals.props.length}
          >
            {proposals.props.map((requirement) => (
              <RequirementCard
                key={requirement.id}
                requirement={requirement}
                onAccept={onAccept}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            ))}
          </CategorySection>
        )}

        {/* Events Section */}
        {proposals.events.length > 0 && (
          <CategorySection
            category={RequirementCategory.EVENTS}
            count={proposals.events.length}
          >
            {proposals.events.map((requirement) => (
              <RequirementCard
                key={requirement.id}
                requirement={requirement}
                onAccept={onAccept}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            ))}
          </CategorySection>
        )}

        {/* States Section */}
        {proposals.states.length > 0 && (
          <CategorySection
            category={RequirementCategory.STATES}
            count={proposals.states.length}
          >
            {proposals.states.map((requirement) => (
              <RequirementCard
                key={requirement.id}
                requirement={requirement}
                onAccept={onAccept}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            ))}
          </CategorySection>
        )}

        {/* Accessibility Section */}
        {proposals.accessibility.length > 0 && (
          <CategorySection
            category={RequirementCategory.ACCESSIBILITY}
            count={proposals.accessibility.length}
          >
            {proposals.accessibility.map((requirement) => (
              <RequirementCard
                key={requirement.id}
                requirement={requirement}
                onAccept={onAccept}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            ))}
          </CategorySection>
        )}
      </div>

      {/* Summary Footer */}
      <Card variant="outlined" className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">Summary</h4>
              <p className="text-sm text-gray-600 mt-1">
                Total: {totalCount} requirements
                {approvedCount > 0 && (
                  <span className="text-green-600 ml-2">
                    • {approvedCount} approved
                  </span>
                )}
                {hasLowConfidence && (
                  <span className="text-yellow-600 ml-2">
                    • {lowConfidenceCount} need review
                  </span>
                )}
              </p>
            </div>

            {approvedCount === totalCount && totalCount > 0 && (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                All Approved
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
