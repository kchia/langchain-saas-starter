"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExampleComparison } from "./ExampleComparison";

interface ExamplesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExamplesModal({ open, onOpenChange }: ExamplesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📸 Screenshot Examples: Good vs. Bad</DialogTitle>
        </DialogHeader>
        <ExampleComparison />
      </DialogContent>
    </Dialog>
  );
}
