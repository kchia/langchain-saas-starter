"use client";

import { useEffect, useState } from "react";

interface DynamicCodeBlockProps {
  language: string;
  code: string;
  maxHeight?: string;
  showLineNumbers?: boolean;
}

export function DynamicCodeBlock({ language, code, maxHeight, showLineNumbers }: DynamicCodeBlockProps) {
  const [CodeBlock, setCodeBlock] = useState<any>(null);

  useEffect(() => {
    // Dynamically import CodeBlock only when needed
    import("@/components/ui/code-block").then((mod) => {
      setCodeBlock(() => mod.CodeBlock);
    });
  }, []);

  if (!CodeBlock) {
    return (
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">Loading code...</p>
      </div>
    );
  }

  return <CodeBlock language={language} code={code} maxHeight={maxHeight} showLineNumbers={showLineNumbers} />;
}
