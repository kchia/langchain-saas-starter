# Component Library Quick Reference

**Last Updated:** 2025-10-03
**Purpose:** Quick lookup for developers to check if a component exists before creating it

---

## 🚨 BEFORE Creating ANY Component

```bash
# 1. Check this file (fastest)
# 2. Check BASE-COMPONENTS.md (full specs)
# 3. Check app/src/components/ui/ (implementation)
# 4. Install from shadcn/ui if needed
```

---

## ✅ Available Components (DO NOT RECREATE)

### P0 - Critical (Use These Everywhere)

| Component | Import Path | Variants | Usage Count |
|-----------|-------------|----------|-------------|
| **Button** | `@/components/ui/button` | primary, secondary, ghost, outline, success, warning, destructive | 60+ |
| **Card** | `@/components/ui/card` | outlined, elevated, interactive | 35+ |
| **Badge** | `@/components/ui/badge` | success, warning, error, info, neutral | 25+ |

### P1 - High Priority

| Component | Import Path | Usage Count |
|-----------|-------------|-------------|
| **Tabs** | `@/components/ui/tabs` | 2 |
| **Progress** | `@/components/ui/progress` | 8+ |
| **Alert** | `@/components/ui/alert` | 5 |

### P2 - Medium Priority

| Component | Import Path | Usage Count |
|-----------|-------------|-------------|
| **Input** | `@/components/ui/input` | 5+ |
| **CodeBlock** | `@/components/ui/code-block` | 4 |
| **Dialog** | `@/components/ui/dialog` | 2 |
| **Accordion** | `@/components/ui/accordion` | 4 |
| **Select** | `@/components/ui/select` | 2 |

### P3 - Nice to Have

| Component | Import Path | Usage Count |
|-----------|-------------|-------------|
| **Tooltip** | `@/components/ui/tooltip` | Implicit |
| **Skeleton** | `@/components/ui/skeleton` | Implicit |

---

## 🎨 Composite Components (Reuse These)

| Component | Location | Composed From |
|-----------|----------|---------------|
| **RequirementCard** | `@/components/composite/RequirementCard` | Card + Badge + Button + Accordion |
| **PatternCard** | `@/components/composite/PatternCard` | Card + Badge + Button + Progress |
| **MetricCard** | `@/components/composite/MetricCard` | Card + Number display + Trend |
| **ComponentRow** | `@/components/composite/ComponentRow` | Card + Badge + Button + Timestamp |
| **TokenDisplay** | `@/components/composite/TokenDisplay` | Card + Color swatch + Badge + Button |
| **ProgressStages** | `@/components/composite/ProgressStages` | Progress + Stage list + Icons |
| **EditModal** | `@/components/composite/EditModal` | Dialog + Input + Select + Button |
| **CodePreviewModal** | `@/components/composite/CodePreviewModal` | Dialog + Tabs + CodeBlock |

---

## 📦 Installation Commands

```bash
# Install all base components at once
npx shadcn-ui@latest add button card badge input tabs progress alert accordion dialog select tooltip skeleton

# Install individually as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
# ... etc
```

---

## 🔍 Component Usage Examples

### Button Variants

```tsx
import { Button } from "@/components/ui/button"

// Primary (default)
<Button variant="primary">Upload Screenshot</Button>

// Secondary
<Button variant="secondary">Export as JSON</Button>

// Success (green)
<Button variant="success">✓ Accept All</Button>

// Warning (yellow)
<Button variant="warning">⚠️ Review Low Confidence</Button>

// Ghost (transparent)
<Button variant="ghost">Edit</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button> // default
<Button size="lg">Large</Button>
```

### Card Variants

```tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card"

// Outlined (default)
<Card variant="outlined">
  <CardHeader>Token Details</CardHeader>
  <CardContent>...</CardContent>
</Card>

// Elevated (with shadow)
<Card variant="elevated">
  <CardContent>Metric Card</CardContent>
</Card>

// Interactive (hover effects)
<Card variant="interactive">
  <CardContent>Pattern Card</CardContent>
</Card>
```

### Badge Variants

```tsx
import { Badge } from "@/components/ui/badge"

// Success (green)
<Badge variant="success">✅ 0.95</Badge>

// Warning (yellow)
<Badge variant="warning">⚠️ 0.76</Badge>

// Error (red)
<Badge variant="error">❌ 0.52</Badge>

// Info (blue)
<Badge variant="info">req-001</Badge>

// Neutral (gray)
<Badge variant="neutral">SELECTED</Badge>
```

### Progress Bars

```tsx
import { Progress } from "@/components/ui/progress"

// Default (blue)
<Progress value={60} />

// Success (green)
<Progress value={94} variant="success" />

// Warning (yellow)
<Progress value={75} variant="warning" />
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="screenshot">
  <TabsList>
    <TabsTrigger value="screenshot">Screenshot Upload</TabsTrigger>
    <TabsTrigger value="figma">Figma Integration</TabsTrigger>
  </TabsList>
  <TabsContent value="screenshot">...</TabsContent>
  <TabsContent value="figma">...</TabsContent>
</Tabs>
```

### Alerts/Banners

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

// Info (blue)
<Alert variant="info">
  <AlertTitle>🤖 AI Analysis Complete</AlertTitle>
  <AlertDescription>Completed in 12s</AlertDescription>
</Alert>

// Success (green)
<Alert variant="success">
  <AlertTitle>Component Generated Successfully</AlertTitle>
</Alert>

// Warning (yellow)
<Alert variant="warning">
  <AlertTitle>Low Confidence Detected</AlertTitle>
</Alert>
```

---

## 🎯 Common Patterns

### Form with Validation

```tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

<Card>
  <form onSubmit={handleSubmit}>
    <Input
      type="url"
      placeholder="https://figma.com/file/..."
      required
    />
    <Button type="submit">Extract Tokens</Button>
  </form>
</Card>
```

### Modal with Form

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Requirement</DialogTitle>
    </DialogHeader>
    <Input label="Name" />
    <Select label="Category">
      <option>Props</option>
      <option>Events</option>
    </Select>
    <Button onClick={handleSave}>Save Changes</Button>
  </DialogContent>
</Dialog>
```

### Metric Card (Composite)

```tsx
import { MetricCard } from "@/components/composite/MetricCard"

<MetricCard
  title="Components"
  value="12"
  subtitle="+3 this week"
  trend="+25%"
  icon="📦"
/>
```

---

## 🚫 Anti-Patterns (DON'T DO THIS)

### ❌ Creating Custom Button

```tsx
// WRONG - Don't create custom buttons
export function CustomButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-md bg-blue-500 px-4 py-2 text-white">
      {children}
    </button>
  )
}

// RIGHT - Use existing Button component
import { Button } from "@/components/ui/button"
<Button variant="primary">{children}</Button>
```

### ❌ Recreating Card

```tsx
// WRONG - Don't recreate Card
export function MetricBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 p-6">
      {children}
    </div>
  )
}

// RIGHT - Use existing Card component
import { Card, CardContent } from "@/components/ui/card"
<Card><CardContent>{children}</CardContent></Card>
```

### ❌ Custom Badge Implementation

```tsx
// WRONG - Don't create custom badges
export function StatusBadge({ status }: { status: string }) {
  const color = status === 'success' ? 'green' : 'red'
  return <span className={`px-2 py-1 rounded text-${color}-700`}>{status}</span>
}

// RIGHT - Use existing Badge component
import { Badge } from "@/components/ui/badge"
<Badge variant={status === 'success' ? 'success' : 'error'}>{status}</Badge>
```

---

## 📚 More Information

- **Full Specifications:** `.claude/BASE-COMPONENTS.md`
- **Architecture Guide:** `CLAUDE.md`
- **Cursor AI Rules:** `.cursorrules`
- **shadcn/ui Docs:** https://ui.shadcn.com/docs

---

**Remember:** If you need a component, it probably already exists. Check this file first! 🚀
