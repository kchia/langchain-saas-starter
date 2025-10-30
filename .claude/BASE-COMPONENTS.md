# Base Components Library - ComponentForge

**Analysis Date**: 2025-10-03
**Source**: Wireframe analysis across all 5 pages
**Purpose**: Reusable shadcn/ui + Radix UI components to build ComponentForge UI

---

## Component Priority Matrix

| Priority | Component | Used In | Frequency | Notes |
|----------|-----------|---------|-----------|-------|
| **P0** (Critical) | Button | All 5 pages | 60+ instances | Primary, secondary, ghost, success, warning variants |
| **P0** | Card | All 5 pages | 35+ instances | Metrics, requirements, patterns, results, elevated variants |
| **P0** | Badge | All 5 pages | 25+ instances | Confidence scores, status indicators, req IDs |
| **P1** (High) | Tabs | 2 pages | 2 instances | Screenshot vs Figma, Preview/Code/Storybook/Quality |
| **P1** | Progress Bar | 3 pages | 8+ instances | Extraction, generation, validation, token adherence |
| **P1** | Alert/Banner | 3 pages | 5 instances | Analysis complete, warnings, success |
| **P2** (Medium) | Input | 2 pages | 5+ instances | Figma URL, PAT, manual overrides, search |
| **P2** | Code Block | 2 pages | 4 instances | Generated code, pattern previews, Storybook |
| **P2** | Collapsible/Accordion | 1 page | 4 sections | Requirements categories (Props/Events/States/A11y) |
| **P2** | Modal/Dialog | 2 pages | 2 instances | Edit requirement, Full quality report |
| **P3** (Nice to have) | Skeleton Loader | 1 page | Implicit | Loading states (defined in wireframe CSS) |
| **P3** | Tooltip | Implicit | Many | Hover explanations for scores (not shown but implied) |
| **P3** | Dropdown/Select | 1 page | 2 instances | Edit modal dropdowns (Category, Type) |

---

## Component Specifications

### 1. Button Component

**Variants Required**:
```typescript
variant: "primary" | "secondary" | "ghost" | "outline" | "destructive" | "success" | "warning"
size: "sm" | "md" | "lg"
state: "default" | "hover" | "focus" | "disabled" | "loading"
```

**Usage Examples from Wireframes**:

| Page | Use Case | Variant | Count |
|------|----------|---------|-------|
| Token Extraction | "Upload Screenshot" | primary | 1 |
| Token Extraction | "Edit" (color tokens) | ghost | 9 |
| Token Extraction | "Back to Home" | ghost | 1 |
| Token Extraction | "Export as JSON/CSS" | secondary | 2 |
| Token Extraction | "Continue →" | primary | 1 |
| Requirements | "✓ Accept All" | success (green) | 1 |
| Requirements | "⚠️ Review Low Confidence" | warning (yellow) | 1 |
| Requirements | "+ Add Custom Requirement" | secondary | 1 |
| Requirements | "✓ Accept", "✎ Edit", "✗ Remove" | ghost/sm | 30+ |
| Requirements | "← Back to Tokens" | secondary | 1 |
| Requirements | "Continue to Pattern Matching →" | primary | 1 |
| Pattern Selection | "✓ Select This Pattern" | primary | 3 |
| Pattern Selection | "👁️ Preview Code" | secondary | 3 |
| Pattern Selection | "Continue with Selected →" | primary | 1 |
| Component Preview | "📥 Download ZIP", "📋 Copy Code" | secondary | 6 |
| Component Preview | "💾 Save to Project" | primary | 1 |
| Component Preview | "Test Keyboard/Focus" | secondary | 2 |
| Dashboard | "+ Generate Component" | primary | 1 |
| Dashboard | "View" (component row) | secondary | 4 |
| Dashboard | Quick action buttons | secondary | 4 |

**Base Implementation** (shadcn/ui):
```tsx
// Use existing shadcn/ui Button as base
// Location: app/src/components/ui/button.tsx
// Add success and warning variants:

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-blue-500 text-white hover:bg-blue-600",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-gray-300 hover:bg-gray-50",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "hover:bg-gray-100",
        // ADD THESE:
        success: "bg-green-500 text-white hover:bg-green-600",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8",
      },
    },
  }
)
```

---

### 2. Card Component

**Variants Required**:
```typescript
variant: "default" | "outlined" | "elevated" | "interactive"
padding: "sm" | "md" | "lg"
```

**Usage Examples from Wireframes**:

| Page | Use Case | Type | Interactive? |
|------|----------|------|--------------|
| Token Extraction | Color/Typography/Spacing sections | outlined | No |
| Token Extraction | Extraction progress banner | info (blue bg) | No |
| Token Extraction | Confidence legend | outlined (gray bg) | No |
| Requirements | Requirement cards (req-001, etc.) | outlined | Yes (hover) |
| Requirements | Analysis complete banner | info (blue bg) | No |
| Requirements | Summary card | outlined (gray bg) | No |
| Pattern Selection | Pattern match cards (top 3) | outlined | Yes (hover, selected state) |
| Pattern Selection | Retrieval summary banner | info (blue bg) | No |
| Pattern Selection | Metrics card | outlined (gray bg) | No |
| Component Preview | Generation summary banner | success (green bg) | No |
| Component Preview | Quality validation results | success (green bg) | No |
| Component Preview | Token adherence meter | outlined (gray bg) | No |
| Dashboard | Metric cards (4 grid) | elevated | Yes (hover) |
| Dashboard | Success targets card | outlined (gray bg) | No |
| Dashboard | Recent components rows | outlined | Yes (hover) |
| Dashboard | Retrieval/Cache performance | outlined | No |

**Base Implementation** (shadcn/ui):
```tsx
// Use existing shadcn/ui Card as base
// Location: app/src/components/ui/card.tsx

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border text-card-foreground",
        variant === "outlined" && "border-gray-200 bg-white",
        variant === "elevated" && "border-gray-200 bg-white shadow-sm",
        variant === "interactive" && "border-gray-200 bg-white hover:border-gray-300 transition-colors cursor-pointer",
        className
      )}
      {...props}
    />
  )
)

const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
)

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
)
```

**Metric Card Subcomponent**:
```tsx
// Special variant for dashboard metrics
export function MetricCard({ title, value, subtitle, trend, icon }) {
  return (
    <Card variant="elevated" className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <p className="text-sm text-gray-600 mb-2">{title}</p>
        <p className="text-3xl font-bold mb-2">{value}</p>
        {trend && <p className="text-sm text-green-600">{trend}</p>}
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
```

---

### 3. Badge Component

**Variants Required**:
```typescript
variant: "success" | "warning" | "error" | "info" | "neutral"
size: "sm" | "md" | "lg"
```

**Usage Examples from Wireframes**:

| Page | Use Case | Variant | Content |
|------|----------|---------|---------|
| Token Extraction | Confidence indicators | success/warning | "✅" / "⚠️" |
| Requirements | Confidence scores | success/warning/error | "✅" / "⚠️" / "❌" |
| Requirements | Requirement IDs | neutral | "req-001" |
| Pattern Selection | Match scores | success/warning | "0.94" (green), "0.81" (yellow) |
| Pattern Selection | Selected indicator | info | "SELECTED" (blue background) |
| Component Preview | Status indicators | success | "✓ Compiled successfully" |
| Component Preview | Quality checks | success/warning/info | "✅" / "⚠️" / "ℹ️" |
| Dashboard | Success targets | success/warning | "✅" / "⚠️" |
| Dashboard | Component metrics | success/warning | "94% tokens", "0 critical a11y" |
| Dashboard | Progress bars | success/info/neutral | Color-coded performance bars |

**Base Implementation** (shadcn/ui):
```tsx
// Location: app/src/components/ui/badge.tsx

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-900",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        neutral: "bg-gray-100 text-gray-600",
      },
    },
  }
)

// Confidence Badge specific variant
export function ConfidenceBadge({ score }: { score: number }) {
  const variant = score >= 0.9 ? "success" : score >= 0.7 ? "warning" : "error"
  const icon = score >= 0.9 ? "✅" : score >= 0.7 ? "⚠️" : "❌"

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <span>{icon}</span>
      <span>{score.toFixed(2)}</span>
    </Badge>
  )
}
```

---

### 4. Tabs Component

**Variants Required**:
```typescript
variant: "default" | "pills" | "underline"
orientation: "horizontal" | "vertical"
```

**Usage Examples from Wireframes**:

| Page | Use Case | Tabs | Variant |
|------|----------|------|---------|
| Token Extraction | Screenshot vs Figma | 2 tabs | pills (rounded bg) |
| Component Preview | Preview/Code/Storybook/Quality | 4 tabs | underline |

**Base Implementation** (Radix UI Tabs):
```tsx
// Location: app/src/components/ui/tabs.tsx
// Use Radix UI Tabs primitive with custom styling

import * as TabsPrimitive from "@radix-ui/react-tabs"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
```

---

### 5. Progress Bar Component

**Variants Required**:
```typescript
variant: "default" | "success" | "warning" | "error"
size: "sm" | "md" | "lg"
indeterminate: boolean
```

**Usage Examples from Wireframes**:

| Page | Use Case | Determinate? | Color |
|------|----------|--------------|-------|
| Token Extraction | Extraction progress (60%) | Yes | blue |
| Component Preview | Token adherence meters | Yes | green (94%, 92%, 96%) |
| Dashboard | Retrieval performance bars | Yes | gray/blue/green |
| Dashboard | Cache hit rate (78%) | Yes | green |
| Dashboard | Overall cache visualization | Yes | green |

**Base Implementation** (shadcn/ui):
```tsx
// Location: app/src/components/ui/progress.tsx

import * as ProgressPrimitive from "@radix-ui/react-progress"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: "default" | "success" | "warning" | "error"
  }
>(({ className, value, variant = "default", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-200", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all",
        variant === "default" && "bg-blue-500",
        variant === "success" && "bg-green-500",
        variant === "warning" && "bg-yellow-500",
        variant === "error" && "bg-red-500"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))

// Progress with stages
export function ProgressWithStages({
  stages,
  currentStage
}: {
  stages: string[]
  currentStage: number
}) {
  const progress = ((currentStage + 1) / stages.length) * 100

  return (
    <div className="space-y-2">
      <Progress value={progress} />
      <div className="space-y-1 text-sm">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center gap-2">
            {index < currentStage && <span className="text-green-500">✅</span>}
            {index === currentStage && <Spinner className="w-4 h-4" />}
            {index > currentStage && <span className="text-gray-400">⏳</span>}
            <span className={index <= currentStage ? "" : "text-gray-600"}>{stage}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### 6. Alert/Banner Component

**Variants Required**:
```typescript
variant: "default" | "success" | "warning" | "error" | "info"
dismissible: boolean
```

**Usage Examples from Wireframes**:

| Page | Use Case | Variant | Dismissible? |
|------|----------|---------|--------------|
| Requirements | "🤖 AI Analysis Complete" | info (blue) | No |
| Token Extraction | Extraction in progress | info | No |
| Component Preview | Generation metadata | info | No |

**Base Implementation** (shadcn/ui):
```tsx
// Location: app/src/components/ui/alert.tsx

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        success: "bg-green-50 border-green-200 text-green-900",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
        error: "bg-red-50 border-red-200 text-red-900",
        info: "bg-blue-50 border-blue-200 text-blue-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))

const AlertTitle = ({ className, ...props }) => (
  <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
)

const AlertDescription = ({ className, ...props }) => (
  <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
)
```

---

### 7. Code Block Component

**Features Required**:
- Syntax highlighting
- Copy button
- Line numbers (optional)
- Language detection

**Usage Examples from Wireframes**:

| Page | Use Case | Language | Lines |
|------|----------|----------|-------|
| Component Preview | Generated component code | tsx | 50+ |
| Pattern Selection | Pattern code preview | tsx | 20+ |
| Token Extraction | JSON token output | json | 10-20 |

**Base Implementation** (Custom + Prism):
```tsx
// Location: app/src/components/ui/code-block.tsx

import { useState } from "react"
import { Button } from "./button"
import Prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-tsx"

export function CodeBlock({
  code,
  language = "typescript",
  showLineNumbers = false,
  maxHeight = "400px"
}: {
  code: string
  language?: string
  showLineNumbers?: boolean
  maxHeight?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const highlighted = Prism.highlight(code, Prism.languages[language], language)

  return (
    <div className="relative rounded-lg border border-gray-200 bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="text-gray-400 hover:text-white"
        >
          {copied ? "✓ Copied" : "📋 Copy"}
        </Button>
      </div>
      <pre
        className="p-4 overflow-auto text-sm font-mono"
        style={{ maxHeight }}
      >
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  )
}
```

---

### 8. Collapsible/Accordion Component

**Variants Required**:
```typescript
type: "single" | "multiple" // Allow multiple sections open
defaultOpen: boolean
```

**Usage Examples from Wireframes**:

| Page | Use Case | Sections | Type |
|------|----------|----------|------|
| Requirements | Props/Events/States/A11y categories | 4 sections | multiple |
| Pattern Selection | Retrieval details | 1 section | single |

**Base Implementation** (Radix UI Accordion):
```tsx
// Location: app/src/components/ui/accordion.tsx

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
        "[&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
```

---

### 9. Input Component

**Variants Required**:
```typescript
variant: "default" | "error" | "success"
size: "sm" | "md" | "lg"
type: "text" | "email" | "url" | "password" | "number"
```

**Usage Examples from Wireframes**:

| Page | Use Case | Type | Validation |
|------|----------|------|------------|
| Token Extraction (Figma tab) | Figma URL input | url | Required, URL format |
| Token Extraction (Figma tab) | Personal Access Token | password | Required |
| Token Extraction | Manual color override | text | Hex color format |
| Token Extraction | Manual typography override | text | CSS font value |
| Requirements (Edit modal) | Requirement name | text | Required |
| Requirements (Edit modal) | Values (comma-separated) | text | Comma-separated list |

**Base Implementation** (shadcn/ui):
```tsx
// Location: app/src/components/ui/input.tsx

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
```

---

### 10. Skeleton Loader Component

**Variants Required**:
```typescript
variant: "text" | "circle" | "rectangle"
animation: "pulse" | "wave" | "none"
```

**Usage Examples from Wireframes**:

| Page | Use Case | Shape |
|------|----------|-------|
| Token Extraction | Loading token results | rectangle |
| (Implicit) | Loading components list | rectangle |

**Base Implementation** (shadcn/ui):
```tsx
// Location: app/src/components/ui/skeleton.tsx

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
      {...props}
    />
  )
}

// Preset skeletons for common use cases
export function TokenSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}
```

---

### 11. Tooltip Component

**Features Required**:
- Hover trigger
- Keyboard accessible
- Customizable placement
- Delay configuration

**Usage Examples from Wireframes**:

| Page | Implied Use Case | Trigger |
|------|------------------|---------|
| Requirements | Confidence score explanation | Hover on score |
| Pattern Selection | Match score details | Hover on score |
| Component Preview | Token adherence details | Hover on percentage |
| Dashboard | Metric explanations | Hover on metric |

**Base Implementation** (Radix UI Tooltip):
```tsx
// Location: app/src/components/ui/tooltip.tsx

import * as TooltipPrimitive from "@radix-ui/react-tooltip"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-md",
      "animate-in fade-in-0 zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      className
    )}
    {...props}
  />
))

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

---

## Composite/Page-Specific Components

These are **not** base components, but composed from base components above:

### RequirementCard
**Composition**: Card + Badge + Button (Accept/Edit/Remove) + Collapsible (rationale)
**Location**: `app/src/components/requirements/RequirementCard.tsx`
**Props**: id, name, type, confidence, rationale, values, category

### PatternCard
**Composition**: Card + Badge (match score, selected) + Button (Preview/Select) + Progress bar (score visualization)
**Location**: `app/src/components/patterns/PatternCard.tsx`
**Props**: patternId, name, version, matchScore, metadata, selected

### MetricCard
**Composition**: Card (elevated variant) + custom number display + trend indicator
**Location**: `app/src/components/dashboard/MetricCard.tsx`
**Props**: title, value, subtitle, trend, icon
**Example**: "12 Components", "48s Avg Time", "78% Cache Hit"

### ComponentRow
**Composition**: Card-like row + Badge (token %, a11y) + Button (View) + timestamp
**Location**: `app/src/components/dashboard/ComponentRow.tsx`
**Props**: name, timestamp, tokenAdherence, a11yScore, latency, pattern

### TokenDisplay
**Composition**: Card + color swatch/preview + Badge (confidence) + Button (Edit) + code display
**Location**: `app/src/components/tokens/TokenDisplay.tsx`
**Props**: tokenType (color/typography/spacing), value, confidence, editable

### ProgressStages
**Composition**: Progress bar + stage list (checkmark/spinner/pending icons) + text labels
**Location**: `app/src/components/ui/ProgressStages.tsx`
**Usage**: Token extraction page (Image validated, GPT-4V analyzing, Detecting spacing)

### EditModal
**Composition**: Modal/Dialog + Input fields + Select dropdowns + Radio buttons + Textarea + Buttons
**Location**: `app/src/components/requirements/EditModal.tsx`
**Props**: requirement (to edit), onSave, onCancel

### CodePreviewModal
**Composition**: Modal + Tabs (Code/Visual/Metadata) + CodeBlock + Button (Copy/Select)
**Location**: `app/src/components/patterns/CodePreviewModal.tsx`
**Props**: pattern, onSelect, onClose

---

## Implementation Roadmap

### Phase 1: Core Components (Week 1-2)
1. ✅ Button (P0) - Already exists in shadcn/ui, add success/warning variants
2. ✅ Card (P0) - Already exists, add interactive variant
3. ✅ Badge (P0) - Add confidence badge variant
4. ✅ Input (P2) - Already exists, add error state

### Phase 2: Interactive Components (Week 3)
5. ✅ Tabs - Install from shadcn/ui
6. ✅ Progress - Install from shadcn/ui, add stages variant
7. ✅ Alert - Install from shadcn/ui
8. ✅ Collapsible - Install from shadcn/ui

### Phase 3: Advanced Components (Week 4)
9. ✅ Code Block - Build custom with Prism
10. ✅ Tooltip - Install from shadcn/ui
11. ✅ Skeleton - Install from shadcn/ui

### Phase 4: Composite Components (Week 5-6)
12. Build page-specific composite components
13. Create Storybook stories for all components
14. Accessibility audit with axe-core

---

## Installation Commands

```bash
# Navigate to app directory
cd app

# Install core shadcn/ui components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select

# Install dependencies for code block
npm install prismjs @types/prismjs

# Install Lucide icons for UI (already in package.json)
# lucide-react: ^0.544.0
```

---

## Design Tokens to Configure

Based on wireframe analysis, configure these in `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        // Primary brand color (seen throughout wireframes)
        primary: {
          DEFAULT: '#3B82F6', // Blue 500
          foreground: '#FFFFFF',
        },
        // Success (green)
        success: {
          DEFAULT: '#10B981', // Green 500
          foreground: '#FFFFFF',
        },
        // Warning (yellow)
        warning: {
          DEFAULT: '#F59E0B', // Amber 500
          foreground: '#FFFFFF',
        },
        // Error (red)
        error: {
          DEFAULT: '#EF4444', // Red 500
          foreground: '#FFFFFF',
        },
        // Confidence score colors
        'confidence-high': '#10B981',   // Green
        'confidence-medium': '#F59E0B', // Yellow
        'confidence-low': '#EF4444',    // Red
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'monospace'],
      },
    },
  },
}
```

---

## Accessibility Checklist

All components must meet these standards (per Epic 5):

- ✅ Keyboard navigation (Tab, Enter, Space, Escape)
- ✅ Focus indicators (≥3:1 contrast ratio, 2px outline)
- ✅ Color contrast (WCAG AA: 4.5:1 text, 3:1 UI)
- ✅ Semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- ✅ ARIA attributes (aria-label, role, aria-expanded, etc.)
- ✅ Screen reader support (meaningful labels, announcements)

---

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)
```bash
npm test -- ui/button.test.tsx
npm test -- ui/card.test.tsx
```

### Visual Regression (Chromatic + Storybook)
```bash
npm run build-storybook
npx chromatic --project-token=<token>
```

### Accessibility Tests (axe-core)
```bash
npm run test:a11y
```

---

## References

- **shadcn/ui Documentation**: https://ui.shadcn.com/docs
- **Radix UI Primitives**: https://www.radix-ui.com/primitives
- **Tailwind CSS v4**: https://tailwindcss.com/docs
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **ComponentForge Wireframes**: `.claude/wireframes/`

---

## Summary of Changes from Wireframe Audit (2025-10-03)

**Corrections Made:**
1. ✅ Updated Button count: 50+ → 60+ instances (added Dashboard, Component Preview buttons)
2. ✅ Updated Card count: 30+ → 35+ instances (added all banner cards)
3. ✅ Updated Badge count: 20+ → 25+ instances (found in Dashboard progress bars)
4. ✅ Added Modal/Dialog to P2 (Edit modal, Full report modal)
5. ✅ Updated Progress Bar pages: 2 → 3 pages (found extensive use in Dashboard)
6. ✅ Updated Input count: 3 → 5+ instances (added PAT field, modal inputs)
7. ✅ Updated Dropdown/Select: 0 → 2 instances (Edit modal dropdowns)
8. ✅ Added warning variant to Button (⚠️ Review Low Confidence button)
9. ✅ Added detailed Card usage (info banners, success banners, gray backgrounds)
10. ✅ Added detailed Badge usage (blue "SELECTED", progress bars)
11. ✅ Expanded composite components with EditModal and CodePreviewModal
12. ✅ Added dialog and select to installation commands

**Accuracy Status**: ✅ **Verified accurate** against all 5 wireframe HTML files

---

**Last Updated**: 2025-10-03 (Audited and corrected)
**Status**: Ready for Implementation
**Owner**: Frontend Team
