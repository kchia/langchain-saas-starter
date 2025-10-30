/**
 * ComparisonTable component for comparing E2E vs retrieval-only metrics.
 *
 * Displays side-by-side comparison of:
 * - MRR (Mean Reciprocal Rank)
 * - Hit@3 (Context Recall)
 * - Precision@1 (Top-1 Accuracy)
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RetrievalMetrics } from "@/types/evaluation";

export interface ComparisonTableProps {
  e2eMetrics: RetrievalMetrics;
  retrievalOnlyMetrics: RetrievalMetrics;
}

export function ComparisonTable({
  e2eMetrics,
  retrievalOnlyMetrics,
}: ComparisonTableProps) {
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatMRR = (value: number): string => {
    return value.toFixed(3);
  };

  const getStatusBadge = (value: number, target: number): JSX.Element => {
    const meetsTarget = value >= target;
    return (
      <Badge variant={meetsTarget ? "success" : "warning"}>
        {meetsTarget ? "✓" : "!"}
      </Badge>
    );
  };

  const rows = [
    {
      metric: "MRR (Context Precision)",
      e2eValue: formatMRR(e2eMetrics.mrr),
      retrievalValue: formatMRR(retrievalOnlyMetrics.mrr),
      target: 0.7,
      description: "Mean reciprocal rank of correct pattern",
    },
    {
      metric: "Hit@3 (Context Recall)",
      e2eValue: formatPercentage(e2eMetrics.hit_at_3),
      retrievalValue: formatPercentage(retrievalOnlyMetrics.hit_at_3),
      target: 0.8,
      description: "% with correct pattern in top-3",
    },
    {
      metric: "Precision@1 (Answer Relevancy)",
      e2eValue: formatPercentage(e2eMetrics.precision_at_1),
      retrievalValue: formatPercentage(retrievalOnlyMetrics.precision_at_1),
      target: 0.7,
      description: "% with correct pattern as top result",
    },
  ];

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Metric</TableHead>
            <TableHead className="text-center">E2E Pipeline</TableHead>
            <TableHead className="text-center">Retrieval-Only</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <div>
                  <div className="font-medium">{row.metric}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {row.description}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center font-mono">
                {row.e2eValue}
              </TableCell>
              <TableCell className="text-center font-mono">
                {row.retrievalValue}
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(
                  row.metric.includes("MRR")
                    ? retrievalOnlyMetrics.mrr
                    : row.metric.includes("Hit@3")
                    ? retrievalOnlyMetrics.hit_at_3
                    : retrievalOnlyMetrics.precision_at_1,
                  row.target
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
