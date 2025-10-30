# EPIC 12: Upload Guidance & Post-Extraction Value

**Status**: Planning
**Priority**: Critical
**Dependencies**: None

---

## 📋 Overview

**Problem**: Users don't understand what to upload or why they're using ComponentForge.

**Current Pain Points**:

- ❌ No guidance on what makes a "good" screenshot
- ❌ No examples of optimal Figma file structure
- ❌ Confusion about image quality requirements
- ❌ Unclear value proposition ("I uploaded my palette... now what?")
- ❌ Missing post-extraction guidance

**Solution**: Comprehensive upload guidance + clear value communication

**Success Criteria**:

- ✅ Users see inline examples before uploading
- ✅ Clear image quality requirements (resolution, format, composition)
- ✅ Figma file structure and naming conventions explained
- ✅ Good vs. bad upload examples with annotations
- ✅ Post-extraction success flow shows next steps
- ✅ Value proposition visible throughout journey

---

## 🎯 Upload Guidance & Examples

### TASK 13.1: Create UploadGuidance Component

**Goal**: Inline guidance for screenshot uploads

**File to create**: `app/src/components/extract/UploadGuidance.tsx`

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import Image from "next/image";

interface UploadGuidanceProps {
  mode: "screenshot" | "figma";
}

export function UploadGuidance({ mode }: UploadGuidanceProps) {
  if (mode === "screenshot") {
    return (
      <Card className="p-6 mb-6 bg-muted/30">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">What to Upload</h3>
              <p className="text-sm text-muted-foreground">
                For best results, upload screenshots that clearly show your
                design tokens
              </p>
            </div>
          </div>

          {/* Image Quality Requirements */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">📸 Image Requirements</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>
                  Minimum resolution: <strong>1024px width</strong>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Formats: PNG, JPG, or WebP</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Maximum file size: 10MB</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Clear, unobstructed view of design elements</span>
              </li>
            </ul>
          </div>

          {/* Good Examples */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Good Examples
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Image
                  src="/examples/good-color-palette.png"
                  alt="Good example: Color palette with labels"
                  width={400}
                  height={300}
                  className="rounded-lg border"
                />
                <p className="text-xs text-muted-foreground">
                  ✅ Color palette with semantic labels (Primary, Secondary,
                  etc.)
                </p>
              </div>
              <div className="space-y-2">
                <Image
                  src="/examples/good-typography-scale.png"
                  alt="Good example: Typography scale"
                  width={400}
                  height={300}
                  className="rounded-lg border"
                />
                <p className="text-xs text-muted-foreground">
                  ✅ Typography scale showing font sizes and weights
                </p>
              </div>
            </div>
          </div>

          {/* Bad Examples */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Avoid These
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Image
                  src="/examples/bad-full-app.png"
                  alt="Bad example: Full app screenshot"
                  width={400}
                  height={300}
                  className="rounded-lg border opacity-60"
                />
                <p className="text-xs text-muted-foreground">
                  ❌ Full app screenshot (too much visual noise)
                </p>
              </div>
              <div className="space-y-2">
                <Image
                  src="/examples/bad-low-res.png"
                  alt="Bad example: Low resolution"
                  width={400}
                  height={300}
                  className="rounded-lg border opacity-60"
                />
                <p className="text-xs text-muted-foreground">
                  ❌ Low resolution or blurry image
                </p>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <Alert>
            <Info className="h-4 w-4" />
            <div className="ml-2">
              <p className="font-medium">Pro Tips</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>
                  • Export design system frames from Figma as high-res PNGs
                </li>
                <li>
                  • Include semantic labels in your design ("Primary Color",
                  "Heading XL")
                </li>
                <li>
                  • Group related tokens together (all colors, all typography,
                  etc.)
                </li>
                <li>
                  • Use consistent naming conventions for better semantic
                  mapping
                </li>
              </ul>
            </div>
          </Alert>
        </div>
      </Card>
    );
  }

  return null; // Figma guidance in TASK 13.3
}
```

---

### TASK 13.2: Add Image Quality Validation

**Goal**: Validate uploads before sending to backend

**File to update**: `app/src/app/extract/page.tsx`

**Add validation function**:

```typescript
interface ImageValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

async function validateImageUpload(file: File): Promise<ImageValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    errors.push("File size exceeds 10MB. Please compress your image.");
  }

  // Check file type
  const validTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!validTypes.includes(file.type)) {
    errors.push("Invalid file format. Please upload PNG, JPG, or WebP.");
  }

  // Check image dimensions
  return new Promise<ImageValidation>((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Check minimum width
      if (img.width < 1024) {
        warnings.push(
          `Image width is ${img.width}px. For best results, use images at least 1024px wide.`
        );
      }

      // Check if image is too small
      if (img.width < 512 || img.height < 512) {
        errors.push("Image is too small. Please upload a larger screenshot.");
      }

      // Check aspect ratio (very tall/wide images might be full app screenshots)
      const aspectRatio = img.width / img.height;
      if (aspectRatio > 3 || aspectRatio < 0.33) {
        warnings.push(
          "Unusual aspect ratio detected. Make sure your screenshot focuses on design tokens, not a full app layout."
        );
      }

      resolve({
        valid: errors.length === 0,
        errors,
        warnings
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      errors.push("Failed to load image. Please try a different file.");
      resolve({ valid: false, errors, warnings });
    };

    img.src = objectUrl;
  });
}
```

**Update file upload handler**:

```typescript
const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setError(null);
  setValidationWarnings([]);

  // Validate image
  const validation = await validateImageUpload(file);

  // Show errors
  if (!validation.valid) {
    setError(validation.errors.join(" "));
    return;
  }

  // Show warnings (but allow upload)
  if (validation.warnings.length > 0) {
    setValidationWarnings(validation.warnings);
  }

  // Proceed with upload
  setSelectedFile(file);
};
```

**Display warnings in UI**:

```typescript
{
  validationWarnings.length > 0 && (
    <Alert variant="warning" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <div className="ml-2">
        <p className="font-medium text-sm">Quality Warnings</p>
        <ul className="text-xs mt-1 space-y-1">
          {validationWarnings.map((warning, i) => (
            <li key={i}>• {warning}</li>
          ))}
        </ul>
      </div>
    </Alert>
  );
}
```

---

### TASK 13.3: Create FigmaGuidance Component

**Goal**: Explain optimal Figma file structure and naming

**File to create**: `app/src/components/extract/FigmaGuidance.tsx`

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";

export function FigmaGuidance() {
  return (
    <Card className="p-6 mb-6 bg-muted/30">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg">
              Optimal Figma File Structure
            </h3>
            <p className="text-sm text-muted-foreground">
              We extract tokens from your Figma styles using semantic naming
              conventions
            </p>
          </div>
        </div>

        {/* Required: Published Styles */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">✅ Requirements</h4>
          <ul className="space-y-2 text-sm">
            <li>
              • File must have <strong>published local styles</strong> (colors
              and text)
            </li>
            <li>
              • You need a <strong>Personal Access Token</strong> with file read
              permissions
            </li>
            <li>
              • File must be accessible with your token (team files require
              appropriate permissions)
            </li>
          </ul>
        </div>

        {/* Naming Conventions */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">
            🏷️ Naming Conventions for Best Results
          </h4>

          <div className="space-y-4">
            {/* Color Styles */}
            <div>
              <p className="text-sm font-medium mb-2">Color Styles:</p>
              <div className="bg-background rounded-lg p-3 font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-success">✓ Primary/Blue</span>
                  <span className="text-muted-foreground">
                    → colors.primary
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Secondary/Gray</span>
                  <span className="text-muted-foreground">
                    → colors.secondary
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Accent/Teal</span>
                  <span className="text-muted-foreground">→ colors.accent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Error/Red</span>
                  <span className="text-muted-foreground">
                    → colors.destructive
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Background/White</span>
                  <span className="text-muted-foreground">
                    → colors.background
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Text/Black</span>
                  <span className="text-muted-foreground">
                    → colors.foreground
                  </span>
                </div>
              </div>
            </div>

            {/* Typography Styles */}
            <div>
              <p className="text-sm font-medium mb-2">Text Styles:</p>
              <div className="bg-background rounded-lg p-3 font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-success">✓ Heading/XL</span>
                  <span className="text-muted-foreground">
                    → typography.fontSize4xl
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Heading/Large</span>
                  <span className="text-muted-foreground">
                    → typography.fontSize2xl
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Body/Base</span>
                  <span className="text-muted-foreground">
                    → typography.fontSizeBase
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">✓ Body/Small</span>
                  <span className="text-muted-foreground">
                    → typography.fontSizeSm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keyword Matching */}
        <Alert>
          <Info className="h-4 w-4" />
          <div className="ml-2">
            <p className="font-medium text-sm">How Keyword Matching Works</p>
            <p className="text-xs mt-1 text-muted-foreground">
              We search style names for keywords like "primary", "heading",
              "error", "brand", etc. Styles with these keywords get mapped to
              semantic tokens automatically.
            </p>
            <p className="text-xs mt-2 text-muted-foreground">
              <strong>Example:</strong> A color style named "Brand/Primary/500"
              will match "primary" and map to{" "}
              <code className="bg-muted px-1 py-0.5 rounded">
                colors.primary
              </code>
            </p>
          </div>
        </Alert>

        {/* Get Token Link */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">
            🔑 How to Get a Figma Access Token
          </h4>
          <ol className="text-sm space-y-1 ml-4 list-decimal">
            <li>Go to Figma → Settings → Personal Access Tokens</li>
            <li>Click "Generate new token"</li>
            <li>Give it a descriptive name (e.g., "ComponentForge")</li>
            <li>Copy the token and paste it below</li>
          </ol>
          <a
            href="https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
          >
            View Figma Documentation
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </Card>
  );
}
```

---

### TASK 13.4: Add Good vs Bad Examples Component

**File to create**: `app/src/components/extract/ExampleComparison.tsx`

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

interface Example {
  type: "good" | "bad";
  image: string;
  title: string;
  description: string;
  annotations: string[];
}

const examples: Example[] = [
  {
    type: "good",
    image: "/examples/good-color-palette.png",
    title: "Color Palette with Semantic Labels",
    description: "Clear color swatches with descriptive names",
    annotations: [
      "Colors are labeled with semantic names (Primary, Secondary, etc.)",
      "Hex values are visible",
      "High contrast, easy to read",
      "Organized in a grid layout"
    ]
  },
  {
    type: "good",
    image: "/examples/good-typography-scale.png",
    title: "Typography Scale",
    description: "Font sizes displayed with examples",
    annotations: [
      "Font sizes clearly labeled (XL, Large, Base, Small)",
      "Actual text examples shown at each size",
      "Font weights indicated",
      "Line heights visible"
    ]
  },
  {
    type: "good",
    image: "/examples/good-design-system.png",
    title: "Complete Design System Page",
    description: "Comprehensive design tokens in one view",
    annotations: [
      "All token categories visible (colors, typography, spacing)",
      "Well-organized sections",
      "Consistent labeling",
      "High resolution export"
    ]
  },
  {
    type: "bad",
    image: "/examples/bad-full-app.png",
    title: "Full Application Screenshot",
    description: "Too much visual complexity",
    annotations: [
      "Too many UI elements create visual noise",
      "Design tokens not clearly isolated",
      "Hard to distinguish semantic roles",
      "Low extraction confidence expected"
    ]
  },
  {
    type: "bad",
    image: "/examples/bad-low-res.png",
    title: "Low Resolution Image",
    description: "Blurry or pixelated screenshot",
    annotations: [
      "Text is hard to read",
      "Colors may not be accurate",
      "Details are lost",
      "May cause extraction errors"
    ]
  },
  {
    type: "bad",
    image: "/examples/bad-no-labels.png",
    title: "No Semantic Labels",
    description: "Colors without context",
    annotations: [
      "No indication of token purpose",
      "AI must guess semantic roles",
      "Lower confidence scores",
      "May require manual editing"
    ]
  }
];

export function ExampleComparison() {
  const goodExamples = examples.filter((ex) => ex.type === "good");
  const badExamples = examples.filter((ex) => ex.type === "bad");

  return (
    <div className="space-y-8">
      {/* Good Examples */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-6 w-6 text-success" />
          <h3 className="text-xl font-semibold">Good Examples</h3>
          <Badge variant="success">High Confidence Extraction</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goodExamples.map((example, idx) => (
            <Card key={idx} className="overflow-hidden">
              <div className="aspect-video relative bg-muted">
                <Image
                  src={example.image}
                  alt={example.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-1">{example.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {example.description}
                </p>
                <ul className="space-y-1">
                  {example.annotations.map((annotation, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                      <span>{annotation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bad Examples */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="h-6 w-6 text-destructive" />
          <h3 className="text-xl font-semibold">Avoid These</h3>
          <Badge variant="destructive">Poor Extraction Quality</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badExamples.map((example, idx) => (
            <Card key={idx} className="overflow-hidden border-destructive/50">
              <div className="aspect-video relative bg-muted">
                <Image
                  src={example.image}
                  alt={example.title}
                  fill
                  className="object-cover opacity-60"
                />
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-1">{example.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {example.description}
                </p>
                <ul className="space-y-1">
                  {example.annotations.map((annotation, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                      <span>{annotation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### TASK 13.5: Create Example Images

**Directory**: `/public/examples/`

**Required Images** (6 total):

1. **good-color-palette.png** (1920x1080px)

   - Grid of 8 color swatches
   - Each labeled: "Primary #3B82F6", "Secondary #64748B", etc.
   - Clean white background
   - Professional design system aesthetic

2. **good-typography-scale.png** (1920x1080px)

   - Vertical list showing font sizes
   - "Heading XL (36px)" with example text
   - "Heading Large (24px)" with example text
   - "Body Base (16px)" with example text
   - "Body Small (14px)" with example text
   - Include font weights

3. **good-design-system.png** (1920x1080px)

   - Comprehensive design system page
   - Sections for Colors, Typography, Spacing, Border Radius
   - Well-organized, clearly labeled
   - Like a Figma design system page

4. **bad-full-app.png** (1920x1080px)

   - Screenshot of a full app interface
   - Complex UI with many elements
   - No clear focus on design tokens
   - Example: dashboard with charts, tables, navigation

5. **bad-low-res.png** (512x384px, scaled up to look pixelated)

   - Intentionally pixelated/blurry design system
   - Low resolution colors and text

6. **bad-no-labels.png** (1920x1080px)
   - Color swatches with no labels
   - Just colored rectangles, no context
   - No semantic names

**Creation Tips**:

- Use Figma or design tool to create these
- Export at 2x for retina displays
- Ensure realistic, professional appearance
- Use actual design system patterns (e.g., Material Design, Tailwind palette)

---

### Integration into Extract Page

**File to update**: `app/src/app/extract/page.tsx`

**Add imports**:

```typescript
import { UploadGuidance } from "@/components/extract/UploadGuidance";
import { FigmaGuidance } from "@/components/extract/FigmaGuidance";
import { ExampleComparison } from "@/components/extract/ExampleComparison";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
```

**Update Screenshot tab**:

```typescript
<TabsContent value="screenshot">
  {/* NEW: Upload guidance */}
  <UploadGuidance mode="screenshot" />

  {/* Existing upload UI */}
  <FileUpload
    onFileSelect={handleFileUpload}
    accept="image/png,image/jpeg,image/webp"
    maxSize={10 * 1024 * 1024}
  />

  {/* NEW: Show examples in collapsible section */}
  <Accordion type="single" collapsible className="mt-6">
    <AccordionItem value="examples">
      <AccordionTrigger>📸 View Good vs. Bad Examples</AccordionTrigger>
      <AccordionContent>
        <ExampleComparison />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</TabsContent>
```

**Update Figma tab**:

```typescript
<TabsContent value="figma">
  {/* NEW: Figma guidance */}
  <FigmaGuidance />

  {/* Existing Figma URL/token inputs */}
  <FigmaConnect />
</TabsContent>
```

---

## 🎯 TASK 14: Post-Extraction Value & Next Steps

**Goal**: Clearly communicate value and guide users through next steps after extraction.

---

### TASK 14.1: Update Onboarding Modal with Complete Workflow

**File to update**: `app/src/components/onboarding/OnboardingModal.tsx`

**Update workflow cards to include step-by-step flow**:

```typescript
const workflows = [
  {
    id: "design-system" as const,
    title: "Design System Screenshot",
    description: "Upload your color palette, typography scale, or style guide",
    icon: Palette,
    workflow: [
      "1. Upload design system screenshot",
      "2. AI extracts semantic tokens with confidence scores",
      "3. Review & edit tokens with visual previews",
      "4. Export Tailwind config + CSS variables",
      "5. (Coming soon) Generate styled components"
    ],
    bestFor: "Teams with documented design systems",
    outcome: "Production-ready design tokens + configuration files"
  },
  {
    id: "components" as const,
    title: "Component Mockups",
    description: "Extract tokens from UI component screenshots",
    icon: FileImage,
    workflow: [
      "1. Upload component screenshots (buttons, cards, etc.)",
      "2. AI identifies colors, spacing, typography, border radius",
      "3. Review extracted tokens",
      "4. Export to Tailwind or CSS",
      "5. (Coming soon) Auto-generate React components"
    ],
    bestFor: "Converting designs to code",
    outcome: "Component-specific design tokens"
  },
  {
    id: "figma" as const,
    title: "Figma File",
    description: "Connect directly to your Figma design system",
    icon: Figma,
    workflow: [
      "1. Connect Figma file with access token",
      "2. We extract all published styles",
      "3. Automatic semantic mapping (keyword-based)",
      "4. Export tokens & configuration",
      "5. (Coming soon) Sync updates from Figma"
    ],
    bestFor: "Complete design systems in Figma",
    outcome: "Always up-to-date design tokens"
  }
];
```

**Update card rendering to show workflow steps**:

```typescript
{
  workflows.map((workflow) => {
    const Icon = workflow.icon;
    return (
      <Card
        key={workflow.id}
        className="p-6 cursor-pointer hover:border-primary transition-colors"
        onClick={() => handleWorkflowSelect(workflow.id)}
      >
        <Icon className="h-12 w-12 mb-4 text-primary" />
        <h3 className="text-lg font-semibold mb-2">{workflow.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {workflow.description}
        </p>

        {/* NEW: Workflow Steps */}
        <div className="mb-4">
          <p className="text-xs font-medium mb-2">How it works:</p>
          <ol className="text-xs space-y-1 text-muted-foreground">
            {workflow.workflow.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        {/* NEW: Outcome */}
        <div className="pt-3 border-t">
          <p className="text-xs font-medium">You'll get:</p>
          <p className="text-xs text-primary">{workflow.outcome}</p>
        </div>

        {/* NEW: Best For Badge */}
        <Badge variant="secondary" className="mt-3 text-xs">
          {workflow.bestFor}
        </Badge>
      </Card>
    );
  });
}
```

---

### TASK 14.2: Create ExtractionSuccess Component

**Goal**: Post-extraction success banner with next steps

**File to create**: `app/src/components/extract/ExtractionSuccess.tsx`

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Eye, Sparkles, ArrowDown } from "lucide-react";
import { DesignTokens } from "@/types/api.types";

interface ExtractionSuccessProps {
  tokens: DesignTokens;
  onContinue: () => void;
}

export function ExtractionSuccess({
  tokens,
  onContinue
}: ExtractionSuccessProps) {
  // Count extracted tokens
  const colorCount = Object.values(tokens.colors).filter(Boolean).length;
  const typographyCount = Object.values(tokens.typography).filter(
    Boolean
  ).length;
  const spacingCount = Object.values(tokens.spacing).filter(Boolean).length;
  const borderRadiusCount = Object.values(tokens.borderRadius).filter(
    Boolean
  ).length;
  const totalCount =
    colorCount + typographyCount + spacingCount + borderRadiusCount;

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 mb-8">
      <div className="text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-success/10 p-4">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Tokens Extracted Successfully! 🎉
          </h2>
          <p className="text-muted-foreground">
            We've extracted {totalCount} design tokens from your upload
          </p>
        </div>

        {/* Token Breakdown */}
        <div className="flex justify-center gap-3 flex-wrap">
          {colorCount > 0 && (
            <Badge variant="secondary" className="px-4 py-2">
              {colorCount} Colors
            </Badge>
          )}
          {typographyCount > 0 && (
            <Badge variant="secondary" className="px-4 py-2">
              {typographyCount} Typography
            </Badge>
          )}
          {spacingCount > 0 && (
            <Badge variant="secondary" className="px-4 py-2">
              {spacingCount} Spacing
            </Badge>
          )}
          {borderRadiusCount > 0 && (
            <Badge variant="secondary" className="px-4 py-2">
              {borderRadiusCount} Border Radius
            </Badge>
          )}
        </div>

        {/* What's Next */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">What's Next?</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Step 1: Review */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">1. Review & Edit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Check confidence scores (🟢🟡🔴) and adjust values using visual
                previews
              </p>
            </div>

            {/* Step 2: Export */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">2. Export</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Download tailwind.config.js, CSS variables, and
                design-tokens.json
              </p>
            </div>

            {/* Step 3: Generate (Coming Soon) */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">3. Generate (Soon)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Auto-generate shadcn/ui components styled with your tokens
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Button size="lg" onClick={onContinue} className="gap-2">
            Continue to Review Tokens
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

**Integration in extract page**:

```typescript
// In app/src/app/extract/page.tsx

const [showSuccess, setShowSuccess] = useState(false);

// After successful extraction
const handleExtractionComplete = (extractedTokens: ExtractedTokens) => {
  setTokens(extractedTokens);
  setShowSuccess(true);
};

// In JSX
{
  showSuccess && (
    <ExtractionSuccess
      tokens={tokens}
      onContinue={() => {
        setShowSuccess(false);
        // Smooth scroll to TokenEditor
        document.getElementById("token-editor")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }}
    />
  );
}

<div id="token-editor">
  <TokenEditor tokens={tokens} onChange={setTokens} />
</div>;
```

---

### TASK 14.3: Add ValueProposition Component

**Goal**: Show value proposition before upload

**File to create**: `app/src/components/extract/ValueProposition.tsx`

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { FileCode2, Palette, Zap, Package } from "lucide-react";

export function ValueProposition() {
  const benefits = [
    {
      icon: Palette,
      title: "Semantic Design Tokens",
      description:
        "AI extracts colors, typography, spacing, and border radius with semantic naming (primary, secondary, accent, etc.)"
    },
    {
      icon: FileCode2,
      title: "Production-Ready Config",
      description:
        "Export Tailwind config, CSS variables, and JSON tokens ready to import into your project"
    },
    {
      icon: Zap,
      title: "Confidence-Based Editing",
      description:
        "Review AI confidence scores (🟢🟡🔴) and adjust values with visual previews"
    },
    {
      icon: Package,
      title: "Component Generation (Coming Soon)",
      description:
        "Auto-generate shadcn/ui components (Button, Card, Input, etc.) styled with your design system"
    }
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Transform Design to Production Code
        </h2>
        <p className="text-muted-foreground">
          Upload your design system and get instant, production-ready design
          tokens
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((benefit, idx) => {
          const Icon = benefit.icon;
          return (
            <Card key={idx} className="p-6">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

**Add to extract page** (above tabs):

```typescript
import { ValueProposition } from '@/components/extract/ValueProposition';

// In JSX (before tabs)
<ValueProposition />

<Tabs defaultValue="screenshot">
  {/* ... existing tab content */}
</Tabs>
```

---

### TASK 14.4: Component Preview (Phase 3 Placeholder)

**Goal**: Preview what users will get in future phases

**File to create**: `app/src/components/extract/ComponentPreview.tsx`

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { DesignTokens } from "@/types/api.types";

interface ComponentPreviewProps {
  tokens: DesignTokens;
}

export function ComponentPreview({ tokens }: ComponentPreviewProps) {
  // Generate CSS variables from tokens
  const cssVars = {
    "--primary": tokens.colors.primary || "#3B82F6",
    "--secondary": tokens.colors.secondary || "#64748B",
    "--background": tokens.colors.background || "#FFFFFF",
    "--foreground": tokens.colors.foreground || "#0F172A",
    "--border-radius-md": tokens.borderRadius.md || "8px"
  };

  return (
    <Card className="p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Component Preview</h3>
          <p className="text-sm text-muted-foreground">
            See how your tokens will look in actual components
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Lock className="h-3 w-3" />
          Coming Soon
        </Badge>
      </div>

      {/* Live Preview with user's tokens */}
      <div
        className="space-y-4 p-6 bg-muted rounded-lg"
        style={cssVars as React.CSSProperties}
      >
        {/* Button Preview */}
        <div>
          <p className="text-xs font-medium mb-2 text-muted-foreground">
            Button
          </p>
          <div
            className="inline-flex items-center px-4 py-2 font-medium text-white"
            style={{
              backgroundColor: "var(--primary)",
              borderRadius: "var(--border-radius-md)"
            }}
          >
            Primary Button
          </div>
        </div>

        {/* Card Preview */}
        <div>
          <p className="text-xs font-medium mb-2 text-muted-foreground">Card</p>
          <div
            className="p-4"
            style={{
              backgroundColor: "var(--background)",
              borderRadius: "var(--border-radius-md)",
              border: "1px solid var(--secondary)",
              color: "var(--foreground)"
            }}
          >
            <h4 className="font-semibold mb-2">Card Title</h4>
            <p className="text-sm opacity-70">
              This card is styled with your extracted design tokens.
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Message */}
      <Alert className="mt-4">
        <Lock className="h-4 w-4" />
        <div className="ml-2">
          <p className="font-medium text-sm">
            Component Generation Coming in Phase 3
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            We'll automatically generate shadcn/ui components (Button, Card,
            Input, Badge, etc.) fully styled with your design tokens. Download
            working React/TypeScript code.
          </p>
        </div>
      </Alert>
    </Card>
  );
}
```

**Add to extract page** (after TokenEditor):

```typescript
{
  tokens && <ComponentPreview tokens={tokens} />;
}
```

---

## 📁 Files Summary

### New Files to Create (10)

**Components:**

1. `app/src/components/extract/UploadGuidance.tsx`
2. `app/src/components/extract/FigmaGuidance.tsx`
3. `app/src/components/extract/ExampleComparison.tsx`
4. `app/src/components/extract/ExtractionSuccess.tsx`
5. `app/src/components/extract/ValueProposition.tsx`
6. `app/src/components/extract/ComponentPreview.tsx`

**Example Images:** 7. `/public/examples/good-color-palette.png` 8. `/public/examples/good-typography-scale.png` 9. `/public/examples/good-design-system.png` 10. `/public/examples/bad-full-app.png` 11. `/public/examples/bad-low-res.png` 12. `/public/examples/bad-no-labels.png`

### Files to Modify (2)

1. `app/src/app/extract/page.tsx` - Add guidance components, validation, success flow
2. `app/src/components/onboarding/OnboardingModal.tsx` - Add workflow step details

---

## 🧪 Testing Checklist

### Upload Guidance Testing

- [ ] UploadGuidance displays correctly on screenshot tab
- [ ] FigmaGuidance displays correctly on Figma tab
- [ ] Image validation catches files >10MB
- [ ] Image validation catches invalid formats (PDF, GIF, etc.)
- [ ] Warning shown for low-resolution images
- [ ] Warning shown for unusual aspect ratios
- [ ] Example images load and display correctly
- [ ] Accordion with examples can be expanded/collapsed

### Post-Extraction Testing

- [ ] ExtractionSuccess shows after successful extraction
- [ ] Token counts are accurate
- [ ] "Continue" button scrolls to TokenEditor
- [ ] ValueProposition displays before upload
- [ ] ComponentPreview renders with user's tokens
- [ ] Onboarding modal shows workflow steps
- [ ] Workflow cards are clickable and navigate correctly

### E2E User Flow Testing

- [ ] First visit shows onboarding modal
- [ ] Selecting workflow navigates to /extract
- [ ] Upload guidance visible before upload
- [ ] Invalid uploads are rejected with clear error
- [ ] Successful extraction shows success banner
- [ ] Clicking "Continue" focuses TokenEditor
- [ ] Component preview updates with edited tokens

---

## 📊 Success Metrics

### Quantitative

- ✅ Image validation rejects <5% of valid uploads (low false positive rate)
- ✅ 80%+ of users view upload guidance before uploading
- ✅ 60%+ of users expand example comparison accordion
- ✅ Extraction success rate >90% with guided uploads
- ✅ Average time to first successful extraction <3 minutes

### Qualitative

- ✅ Users understand what to upload (measured via support tickets)
- ✅ Users know what they'll receive (clear value prop)
- ✅ Confidence scores guide editing decisions
- ✅ Post-extraction flow feels complete and guided

---

## 🚨 Risks & Mitigation

### Risk 1: Example Images Don't Represent User Scenarios

**Impact**: Medium
**Probability**: Medium
**Mitigation**:

- Create examples based on popular design systems (Material, Tailwind, Ant Design)
- Include variety (minimal, comprehensive, component-focused)
- Test with real users and iterate

### Risk 2: Too Much Guidance Overwhelms Users

**Impact**: Low
**Probability**: Medium
**Mitigation**:

- Use collapsible sections (accordion for examples)
- Progressive disclosure (show basics first, details on demand)
- Keep guidance concise and scannable

### Risk 3: Image Validation Too Strict

**Impact**: High
**Probability**: Low
**Mitigation**:

- Use warnings instead of errors for non-critical issues
- Allow override for advanced users
- Monitor validation rejection rates

---

**Last Updated**: 2025-10-05
**Depends On**: TASKs 1-12 (token extraction must work)
**Next Phase**: Component generation (Phase 3)
