"use client";

import { Button } from "@/components/ui/button";
import type { EvaluationMetrics } from "@/types/evaluation";

interface ExportButtonProps {
  metrics: EvaluationMetrics;
}

export function ExportButton({ metrics }: ExportButtonProps) {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(metrics, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation_metrics_${metrics.timestamp.replace(
      /[: ]/g,
      "_"
    )}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return <Button onClick={handleExport}>Export JSON</Button>;
}
