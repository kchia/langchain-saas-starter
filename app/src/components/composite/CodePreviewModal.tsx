"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/ui/code-block"
import { Button } from "@/components/ui/button"

export interface Pattern {
  id: string
  name: string
  version: string
  code: string
  language?: string
  metadata?: {
    description?: string
    author?: string
    license?: string
    repository?: string
    dependencies?: string[]
    [key: string]: unknown
  }
  visualPreview?: string
}

export interface CodePreviewModalProps {
  pattern: Pattern
  onSelect: (pattern: Pattern) => void
  onClose: () => void
  open?: boolean
}

export function CodePreviewModal({
  pattern,
  onSelect,
  onClose,
  open = true,
}: CodePreviewModalProps) {
  const [activeTab, setActiveTab] = useState("code")

  const handleSelect = () => {
    onSelect(pattern)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Pattern Preview: {pattern.name} {pattern.version}
          </DialogTitle>
          <DialogDescription>
            View the code, visual preview, and metadata for this pattern
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col"
        >
          <TabsList variant="underline" className="w-full justify-start">
            <TabsTrigger variant="underline" value="code">
              Code
            </TabsTrigger>
            <TabsTrigger variant="underline" value="visual">
              Visual Preview
            </TabsTrigger>
            <TabsTrigger variant="underline" value="metadata">
              Metadata
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="flex-1 overflow-y-auto">
            <CodeBlock
              code={pattern.code}
              language={pattern.language || "typescript"}
              showLineNumbers={true}
              maxHeight="60vh"
            />
          </TabsContent>

          <TabsContent value="visual" className="flex-1 overflow-y-auto">
            <div className="border rounded-lg p-8 bg-muted min-h-[300px]">
              {pattern.visualPreview ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: pattern.visualPreview }}
                />
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>No visual preview available for this pattern</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="flex-1 overflow-y-auto">
            <div className="border rounded-lg p-6 bg-muted space-y-4">
              {pattern.metadata?.description && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {pattern.metadata.description}
                  </p>
                </div>
              )}

              {pattern.metadata?.author && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Author</h4>
                  <p className="text-sm text-muted-foreground">
                    {pattern.metadata.author}
                  </p>
                </div>
              )}

              {pattern.metadata?.license && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">License</h4>
                  <p className="text-sm text-muted-foreground">
                    {pattern.metadata.license}
                  </p>
                </div>
              )}

              {pattern.metadata?.repository && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Repository</h4>
                  <a
                    href={pattern.metadata.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {pattern.metadata.repository}
                  </a>
                </div>
              )}

              {pattern.metadata?.dependencies &&
                pattern.metadata.dependencies.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Dependencies</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {pattern.metadata.dependencies.map((dep, index) => (
                        <li key={index}>{dep}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {!pattern.metadata && (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  <p>No metadata available for this pattern</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect}>Select Pattern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
