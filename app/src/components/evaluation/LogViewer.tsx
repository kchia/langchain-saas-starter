"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, FileJson, Calendar, Download } from "lucide-react";
import { EvaluationDashboard } from "./EvaluationDashboard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LogFile {
  filename: string;
  path: string;
  size_bytes: number;
  modified_at: string;
  timestamp: string;
}

interface LogViewerProps {
  className?: string;
}

export function LogViewer({ className }: LogViewerProps) {
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [selectedLog, setSelectedLog] = useState<string>("");
  const [logContent, setLogContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"dashboard" | "json">("dashboard");

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedLog) {
      fetchLogContent(selectedLog);
    } else {
      setLogContent(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLog]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/api/v1/evaluation/logs`;
      console.log("Fetching logs from:", url);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("Response status:", res.status, res.statusText);

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to fetch logs: ${res.status} ${res.statusText}. ${errorText}`
        );
      }

      const data = await res.json();

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format from API");
      }

      setLogs(data.logs || []);

      // Auto-select most recent log if available
      if (data.logs && data.logs.length > 0 && !selectedLog) {
        setSelectedLog(data.logs[0].filename);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Check if the backend server is running.");
      } else if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError")
      ) {
        setError(
          `Cannot connect to backend at ${API_BASE_URL}. Make sure the server is running.`
        );
      } else {
        setError(err.message || "Failed to load logs");
      }
      console.error("Error fetching logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogContent = async (filename: string) => {
    try {
      setIsLoadingContent(true);
      setError(null);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/evaluation/logs/${encodeURIComponent(filename)}`
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch log content: ${res.statusText}`);
      }
      const data = await res.json();
      setLogContent(data);
    } catch (err: any) {
      setError(err.message || "Failed to load log content");
      console.error("Error fetching log content:", err);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimestamp = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch {
      return isoString;
    }
  };

  const handleDownload = () => {
    if (!logContent) return;

    const blob = new Blob([JSON.stringify(logContent, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedLog;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading log files from {API_BASE_URL}...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && logs.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert variant="error">
            <AlertDescription>
              <strong>Failed to load logs</strong>
              <p className="mt-2">{error}</p>
              <p className="mt-2 text-sm">
                Backend URL: <code className="text-xs">{API_BASE_URL}</code>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLogs}
                className="mt-3"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Evaluation Logs
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {logs.length === 0 ? (
            <Alert>
              <AlertDescription>
                No evaluation logs found. Run an evaluation to generate logs.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Log Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Select Log File ({logs.length} available)
                </label>
                <Select value={selectedLog} onValueChange={setSelectedLog}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a log file..." />
                  </SelectTrigger>
                  <SelectContent>
                    {logs.map((log) => (
                      <SelectItem key={log.filename} value={log.filename}>
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="font-mono text-sm truncate">
                            {log.filename}
                          </span>
                          <Badge variant="outline" className="ml-auto shrink-0">
                            {formatFileSize(log.size_bytes)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLog && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {logs.find((l) => l.filename === selectedLog) &&
                        formatTimestamp(
                          logs.find((l) => l.filename === selectedLog)!
                            .modified_at
                        )}
                    </div>
                    <div>
                      {formatFileSize(
                        logs.find((l) => l.filename === selectedLog)
                          ?.size_bytes || 0
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Log Content */}
              {selectedLog && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Log Content</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={!logContent}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {isLoadingContent ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Loading log content...
                    </div>
                  ) : error ? (
                    <Alert variant="error">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : logContent ? (
                    <div className="space-y-4">
                      {/* Toggle between Dashboard and JSON view */}
                      <div className="flex gap-2 border-b pb-2">
                        <Button
                          variant={
                            viewMode === "dashboard" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setViewMode("dashboard")}
                        >
                          Dashboard View
                        </Button>
                        <Button
                          variant={viewMode === "json" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode("json")}
                        >
                          Raw JSON
                        </Button>
                      </div>
                      {viewMode === "dashboard" ? (
                        <EvaluationDashboard data={logContent} />
                      ) : (
                        <CodeBlock
                          code={JSON.stringify(logContent, null, 2)}
                          language="json"
                          maxHeight="600px"
                        />
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
