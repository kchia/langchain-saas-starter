/**
 * ExportPreview component - Display export statistics and approved requirements
 * before committing to the export.
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Download, ArrowRight } from 'lucide-react';
import type { ExportPreviewResponse } from '@/lib/api/requirements.api';

export interface ExportPreviewProps {
  preview: ExportPreviewResponse;
  onExport: () => void;
  onCancel: () => void;
  isExporting?: boolean;
}

/**
 * ExportPreview displays a summary of approved requirements
 * before the final export action.
 */
export function ExportPreview({
  preview,
  onExport,
  onCancel,
  isExporting = false,
}: ExportPreviewProps) {
  const { componentType, componentConfidence, statistics } = preview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Export Preview</h2>
        <p className="text-muted-foreground">
          Review the requirements that will be exported for {componentType}
        </p>
      </div>

      {/* Component Info Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">{componentType} Component</h3>
            <p className="text-sm text-muted-foreground">
              Detected with {(componentConfidence * 100).toFixed(0)}% confidence
            </p>
          </div>
          <Badge variant={componentConfidence >= 0.9 ? 'success' : 'default'}>
            {componentConfidence >= 0.9 ? 'High Confidence' : 'Medium Confidence'}
          </Badge>
        </div>

        {/* Confidence Progress Bar */}
        <Progress value={componentConfidence * 100} className="h-2" />
      </Card>

      {/* Export Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Export Statistics</h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Approval Summary */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Proposed</span>
              <span className="font-medium">{statistics.totalProposed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Approved</span>
              <span className="font-medium text-green-600">{statistics.totalApproved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Approval Rate</span>
              <span className="font-medium">
                {(statistics.approvalRate * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Edit Summary */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Edited Requirements</span>
              <span className="font-medium">{statistics.editedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Edit Rate</span>
              <span className="font-medium">
                {(statistics.editRate * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar for Approval Rate */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Approval Progress</span>
            <span className="font-medium">
              {statistics.totalApproved} / {statistics.totalProposed}
            </span>
          </div>
          <Progress value={statistics.approvalRate * 100} className="h-2" />
        </div>
      </Card>

      {/* Requirements by Category */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Requirements by Category</h3>

        <div className="space-y-3">
          {Object.entries(statistics.byCategory).map(([category, stats]) => (
            <div key={category} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="capitalize font-medium">{category}</span>
                <Badge variant="outline">
                  {stats.approved} approved
                </Badge>
                {stats.edited > 0 && (
                  <Badge variant="secondary">
                    {stats.edited} edited
                  </Badge>
                )}
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          ))}
        </div>
      </Card>

      {/* Success Metrics */}
      {(statistics.approvalRate >= 0.8 || statistics.editRate < 0.3) && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {statistics.approvalRate >= 0.8 && (
              <p>✓ High approval rate ({(statistics.approvalRate * 100).toFixed(0)}%) - Requirements are well-aligned</p>
            )}
            {statistics.editRate < 0.3 && (
              <p>✓ Low edit rate ({(statistics.editRate * 100).toFixed(0)}%) - AI proposals are accurate</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isExporting}
        >
          Cancel
        </Button>
        <Button
          onClick={onExport}
          disabled={isExporting || statistics.totalApproved === 0}
        >
          {isExporting ? (
            <>Exporting...</>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export & Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
