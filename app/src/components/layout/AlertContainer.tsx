"use client";

import { useUIStore } from "@/stores/useUIStore";
import { Alert } from "@/components/ui/alert";
import { X } from "lucide-react";

export function AlertContainer() {
  const alerts = useUIStore((state) => state.alerts);
  const dismissAlert = useUIStore((state) => state.dismissAlert);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.type}
          dismissible
          onDismiss={() => dismissAlert(alert.id)}
        >
          {alert.message}
        </Alert>
      ))}
    </div>
  );
}
