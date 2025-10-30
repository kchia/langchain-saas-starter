/**
 * MetricCard component for displaying evaluation metrics.
 *
 * Displays a single metric with:
 * - Label and description
 * - Value (formatted as percentage, number, or time)
 * - Target threshold indicator
 * - Visual status (success/warning/error)
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface MetricCardProps {
  label: string;
  value: number;
  target?: number;
  format?: "percentage" | "number" | "seconds" | "milliseconds";
  description?: string;
  inverted?: boolean; // For metrics where lower is better (e.g., latency)
}

export function MetricCard({
  label,
  value,
  target,
  format = "number",
  description,
  inverted = false,
}: MetricCardProps) {
  // Format value based on type
  const formatValue = (val: number, fmt: string): string => {
    switch (fmt) {
      case "percentage":
        return `${(val * 100).toFixed(1)}%`;
      case "seconds":
        return `${val.toFixed(1)}s`;
      case "milliseconds":
        return `${val.toFixed(0)}ms`;
      case "number":
      default:
        return val.toFixed(0);
    }
  };

  // Determine status based on target
  const getStatus = (): "success" | "warning" | "neutral" => {
    if (target === undefined) return "neutral";

    const meetsTarget = inverted ? value < target : value >= target;
    return meetsTarget ? "success" : "warning";
  };

  const status = getStatus();
  const formattedValue = formatValue(value, format);
  const formattedTarget = target !== undefined ? formatValue(target, format) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-2">{formattedValue}</div>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {description}
          </p>
        )}
        {formattedTarget && (
          <Badge variant={status}>
            Target: {inverted ? "< " : "≥ "}
            {formattedTarget}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
