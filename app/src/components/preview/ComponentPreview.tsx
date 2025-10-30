"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ComponentPreviewProps {
  code: string;
  componentName: string;
}

/**
 * Simple iframe-based component preview
 * Renders the component code in an isolated iframe with basic styling
 *
 * Limitations:
 * - Cannot handle complex external dependencies (Radix UI, etc.)
 * - Basic styling only (no full Tailwind CSS)
 * - Use StackBlitz for full testing with all features
 */
export function ComponentPreview({ code, componentName }: ComponentPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      // Create a sandboxed HTML page with the component
      const html = createPreviewHTML(code, componentName);

      // Write to iframe
      const doc = iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
        setError(null);

        // Listen for errors from the iframe
        iframe.contentWindow?.addEventListener('error', (event) => {
          setError(event.message || 'Error rendering component');
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render preview');
    }
  }, [code, componentName]);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <div className="ml-2">
            <p className="font-medium">Preview Error</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">
              Use the &quot;Open in StackBlitz&quot; button for full testing with all dependencies.
            </p>
          </div>
        </Alert>
      )}

      <div className="relative border rounded-lg overflow-hidden bg-white">
        <iframe
          ref={iframeRef}
          title="Component Preview"
          sandbox="allow-scripts"
          className="w-full h-96 border-0"
          style={{ minHeight: '384px' }}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        ⚡ Quick preview - Limited functionality. Use StackBlitz for full interactive testing.
      </p>
    </div>
  );
}

/**
 * Creates HTML for the preview iframe
 * Uses CDN links for React and basic inline styles
 */
function createPreviewHTML(code: string, componentName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName} Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      padding: 2rem;
      background: #ffffff;
      color: #000000;
    }

    #root {
      max-width: 100%;
    }

    /* Basic utility classes that match common patterns */
    .rounded { border-radius: 0.375rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .border { border: 1px solid #e5e7eb; }
    .p-2 { padding: 0.5rem; }
    .p-4 { padding: 1rem; }
    .p-8 { padding: 2rem; }
    .m-2 { margin: 0.5rem; }
    .m-4 { margin: 1rem; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .text-sm { font-size: 0.875rem; }
    .text-base { font-size: 1rem; }
    .text-lg { font-size: 1.125rem; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }

    /* Component-specific styles */
    button {
      cursor: pointer;
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      border: 1px solid transparent;
      background: #000000;
      color: #ffffff;
      transition: all 0.2s;
    }

    button:hover {
      opacity: 0.9;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-message {
      background: #fee;
      border: 1px solid #fcc;
      color: #c00;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-top: 1rem;
    }
  </style>

  <!-- React 19 from CDN -->
  <script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
</head>
<body>
  <div id="root"></div>

  <script>
    (function() {
      try {
        // Make React available globally
        const { createElement: h, forwardRef, useState, useEffect } = React;
        const { createRoot } = ReactDOM;

        // Mock common utilities that might be imported
        const cn = (...args) => args.filter(Boolean).join(' ');

        // Mock class-variance-authority
        const cva = (base, config) => {
          return ({ variant, size, className, ...props }) => {
            let classes = base;
            if (variant && config?.variants?.variant?.[variant]) {
              classes += ' ' + config.variants.variant[variant];
            }
            if (size && config?.variants?.size?.[size]) {
              classes += ' ' + config.variants.size[size];
            }
            if (className) {
              classes += ' ' + className;
            }
            return classes;
          };
        };

        // Parse and execute the component code
        // Remove imports as we're providing everything globally
        let componentCode = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

        // Remove import statements
        componentCode = componentCode.replace(/import\\s+.*?from\\s+['"].*?['"];?\\s*/g, '');

        // Try to execute the component code
        eval(componentCode);

        // Try to render the component
        const container = document.getElementById('root');
        const root = createRoot(container);

        // Render the component with some default props
        root.render(
          h('div', { style: { padding: '1rem' } },
            h('div', { style: { marginBottom: '1rem', fontSize: '0.875rem', color: '#666' } },
              h('strong', null, '${componentName} Preview'),
              ' - Basic rendering only'
            ),
            h(${componentName}, {
              children: 'Example Content',
              variant: 'default'
            })
          )
        );
      } catch (err) {
        console.error('Preview error:', err);
        document.getElementById('root').innerHTML = \`
          <div class="error-message">
            <strong>Preview Error</strong><br/>
            <small>\${err.message || 'Failed to render component'}</small><br/><br/>
            <small>This preview has limitations. Use "Open in StackBlitz" for full testing with all dependencies.</small>
          </div>
        \`;
      }
    })();
  </script>
</body>
</html>
  `;
}
