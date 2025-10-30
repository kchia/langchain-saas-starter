# Contextual Navigation Implementation Plan

## Overview
Transform header navigation from showing all workflow steps upfront to **progressive disclosure** - only showing the next available step based on workflow state. Add in-page workflow breadcrumbs for context.

## Problem Statement
Current navigation shows all steps (Dashboard, Extract, Requirements, Patterns, Preview) regardless of workflow state, leading to:
- Cognitive overload for new users
- Ability to access incomplete workflow steps
- Unclear workflow dependencies
- Cluttered header with 5+ navigation items

## Solution
Implement progressive navigation that only shows available steps + in-page breadcrumbs for full context.

---

## Architecture Changes

### 1. Enhanced Workflow Store
**File:** `app/src/stores/useWorkflowStore.ts`

**Add new methods:**

```typescript
// Check if a step is accessible based on completed steps
canAccessStep: (step: WorkflowStep) => boolean;

// Get array of steps user can currently access
getAvailableSteps: () => WorkflowStep[];
```

**Logic:**
- Dashboard: Always accessible
- Extract: Always accessible (entry point)
- Requirements: Requires Extract completed
- Patterns: Requires Requirements completed
- Preview: Requires Patterns completed

**Implementation:**
```typescript
canAccessStep: (step) => {
  const state = useWorkflowStore.getState();

  // Dashboard and Extract always accessible
  if (step === WorkflowStep.DASHBOARD || step === WorkflowStep.EXTRACT) {
    return true;
  }

  // Check prerequisite completion
  const prerequisites: Record<WorkflowStep, WorkflowStep> = {
    [WorkflowStep.REQUIREMENTS]: WorkflowStep.EXTRACT,
    [WorkflowStep.PATTERNS]: WorkflowStep.REQUIREMENTS,
    [WorkflowStep.PREVIEW]: WorkflowStep.PATTERNS,
  };

  const prereq = prerequisites[step];
  return prereq ? state.completedSteps.includes(prereq) : true;
},

getAvailableSteps: () => {
  const state = useWorkflowStore.getState();
  const allSteps = [
    WorkflowStep.DASHBOARD,
    WorkflowStep.EXTRACT,
    WorkflowStep.REQUIREMENTS,
    WorkflowStep.PATTERNS,
    WorkflowStep.PREVIEW,
  ];

  return allSteps.filter(step => state.canAccessStep(step));
},
```

---

### 2. Navigation Component Refactor
**File:** `app/src/components/layout/Navigation.tsx`

**Changes:**
- Replace static `navItems` array with dynamic function
- Filter navigation items based on `getAvailableSteps()`
- Keep Dashboard + Help always visible
- Update both desktop and mobile navigation

**Before:**
```typescript
const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/extract", label: "Extract", icon: Upload },
  { href: "/requirements", label: "Requirements", icon: FileCheck },
  { href: "/patterns", label: "Patterns", icon: Layers },
  { href: "/preview", label: "Preview", icon: Eye },
];
```

**After:**
```typescript
const availableSteps = useWorkflowStore((state) => state.getAvailableSteps());

const allNavItems = [
  { href: "/", label: "Dashboard", icon: Home, step: WorkflowStep.DASHBOARD },
  { href: "/extract", label: "Extract", icon: Upload, step: WorkflowStep.EXTRACT },
  { href: "/requirements", label: "Requirements", icon: FileCheck, step: WorkflowStep.REQUIREMENTS },
  { href: "/patterns", label: "Patterns", icon: Layers, step: WorkflowStep.PATTERNS },
  { href: "/preview", label: "Preview", icon: Eye, step: WorkflowStep.PREVIEW },
];

// Filter to only show available steps
const navItems = allNavItems.filter(item => availableSteps.includes(item.step));
```

---

### 3. New Workflow Breadcrumb Component
**File:** `app/src/components/composite/WorkflowBreadcrumb.tsx` (NEW)

**Purpose:** In-page stepper showing full workflow context with visual states.

**Props:**
```typescript
interface WorkflowBreadcrumbProps {
  className?: string;
}
```

**Visual States:**
- ✅ Completed: Green checkmark, clickable
- 🔄 Current: Spinner animation, highlighted
- 🔒 Locked: Lock icon, disabled (prerequisite not met)
- ⏳ Pending: Hourglass, disabled (not started)

**Implementation Pattern:**
```typescript
export function WorkflowBreadcrumb({ className }: WorkflowBreadcrumbProps) {
  const currentStep = useWorkflowStore((state) => state.currentStep);
  const completedSteps = useWorkflowStore((state) => state.completedSteps);
  const canAccessStep = useWorkflowStore((state) => state.canAccessStep);

  const steps = [
    { label: "Extract", step: WorkflowStep.EXTRACT, href: "/extract" },
    { label: "Requirements", step: WorkflowStep.REQUIREMENTS, href: "/requirements" },
    { label: "Patterns", step: WorkflowStep.PATTERNS, href: "/patterns" },
    { label: "Preview", step: WorkflowStep.PREVIEW, href: "/preview" },
  ];

  return (
    <nav className={cn("flex items-center gap-2", className)} aria-label="Workflow progress">
      {steps.map((item, index) => {
        const isCompleted = completedSteps.includes(item.step);
        const isCurrent = currentStep === item.step;
        const isLocked = !canAccessStep(item.step);

        return (
          <React.Fragment key={item.step}>
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}

            {canAccessStep(item.step) ? (
              <Link href={item.href}>
                <Button
                  variant={isCurrent ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  {isCompleted && <CheckCircle className="h-4 w-4" />}
                  {isCurrent && <Loader2 className="h-4 w-4 animate-spin" />}
                  {item.label}
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="sm" disabled className="gap-2">
                <Lock className="h-4 w-4" />
                {item.label}
              </Button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
```

---

### 4. Page Integration - Add Breadcrumbs

**Files to update:**
- `app/src/app/extract/page.tsx`
- `app/src/app/requirements/page.tsx`
- `app/src/app/patterns/page.tsx`
- `app/src/app/preview/page.tsx`

**Pattern:**
```tsx
import { WorkflowBreadcrumb } from "@/components/composite/WorkflowBreadcrumb";

export default function ExtractPage() {
  return (
    <main className="container mx-auto p-4 sm:p-8 space-y-6">
      {/* Add breadcrumb at top */}
      <WorkflowBreadcrumb />

      {/* Existing page header */}
      <div className="space-y-2">
        <h1>Extract Design Tokens</h1>
        ...
      </div>

      {/* Rest of page content */}
    </main>
  );
}
```

---

### 5. Step Completion Tracking (CRITICAL)

**Add `completeStep()` calls to trigger workflow progression:**

#### Extract Page (`app/src/app/extract/page.tsx:252-267`)
```typescript
// After successful token extraction
const handleUpload = () => {
  if (selectedFile) {
    setUploadedFile(selectedFile);

    extractTokens(selectedFile, {
      onSuccess: () => {
        // Mark extract step as completed
        completeStep(WorkflowStep.EXTRACT); // ADD THIS

        showAlert('success', '✓ Tokens extracted successfully!');
        setTimeout(() => {
          document.getElementById("token-editor")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }, 500);
      }
    });
  }
};
```

#### Requirements Page (`app/src/app/requirements/page.tsx:82-107`)
```typescript
// After successful export
const handleExport = async () => {
  if (!componentType || componentConfidence === undefined) return;

  setIsExporting(true);
  setExportError(null);

  try {
    const result = await exportRequirements({
      componentType,
      componentConfidence,
      proposals,
      tokens: tokens || undefined,
    });

    // Store export info
    setExportInfo(result.exportId, result.summary.exportedAt);

    // Mark requirements step as completed
    completeStep(WorkflowStep.REQUIREMENTS); // ADD THIS

    // Navigate to patterns
    router.push(`/patterns?exportId=${result.exportId}`);
  } catch (err) {
    setExportError(err instanceof Error ? err.message : 'Failed to export requirements');
  } finally {
    setIsExporting(false);
  }
};
```

#### Patterns Page (`app/src/app/patterns/page.tsx:55-67`)
```typescript
const handleSelectPattern = (pattern: PatternMatch) => {
  // Convert PatternMatch to Pattern for store
  const patternForStore: Pattern = {
    pattern_id: pattern.pattern_id,
    name: pattern.name,
    confidence: pattern.confidence,
    source: pattern.source,
    version: pattern.version,
    code: pattern.code,
    metadata: pattern.metadata,
  };
  selectPattern(patternForStore);

  // Mark patterns step as completed
  completeStep(WorkflowStep.PATTERNS); // ADD THIS
};
```

#### Preview Page (`app/src/app/preview/page.tsx`)
```typescript
// Add useEffect to mark preview as completed when component loads
// (assuming preview generation happens elsewhere)
useEffect(() => {
  // Mark preview step as completed when page is viewed
  completeStep(WorkflowStep.PREVIEW);
}, []);
```

---

### 6. Route Guards (Prevent Direct URL Access)

**Option A: Page-Level Guards** (Recommended for this project)

Add guards to each page that require prerequisites:

**Pattern for Requirements/Patterns/Preview pages:**
```typescript
// At top of component
const completedSteps = useWorkflowStore((state) => state.completedSteps);
const router = useRouter();

useEffect(() => {
  // Check if prerequisites are met
  if (!completedSteps.includes(WorkflowStep.EXTRACT)) {
    router.push('/extract');
  }
}, [completedSteps, router]);
```

**Note:** Patterns page already has similar logic (line 30-34), but checks component-specific state instead of workflow state. Coordinate these checks.

**Option B: Next.js Middleware** (More complex, but cleaner)

Create `app/middleware.ts` to handle routing logic globally.

---

### 7. Fix Dashboard Quick Actions

**File:** `app/src/app/page.tsx:40-52`

**Issue:** Dashboard has direct links to `/patterns` which bypasses workflow.

**Solution 1: Conditional Rendering (Recommended)**
```tsx
const completedSteps = useWorkflowStore((state) => state.completedSteps);
const canAccessPatterns = completedSteps.includes(WorkflowStep.REQUIREMENTS);

<CardContent className="flex flex-col sm:flex-row gap-4">
  <Button asChild size="lg">
    <Link href="/extract">Extract Tokens</Link>
  </Button>
  <Button
    asChild
    variant="secondary"
    size="lg"
    disabled={!canAccessPatterns}
  >
    {canAccessPatterns ? (
      <Link href="/patterns">View Patterns</Link>
    ) : (
      <span>View Patterns (Complete Requirements First)</span>
    )}
  </Button>
</CardContent>
```

**Solution 2: Remove Direct Pattern Link**
Only show "Extract Tokens" button, let workflow guide users.

---

### 8. Fix `/generation` Route Issue

**File:** `app/src/app/patterns/page.tsx:130`

**Current Issue:**
```tsx
<Link href="/generation">
  Continue to Code Generation
  <ArrowRight className="ml-2 h-4 w-4" />
</Link>
```

Links to `/generation` but that route doesn't exist.

**Solution:** Change to `/preview`
```tsx
<Link href="/preview">
  Continue to Preview
  <ArrowRight className="ml-2 h-4 w-4" />
</Link>
```

---

## Implementation Order

### Phase 1: Foundation (No Breaking Changes)
1. ✅ Add `canAccessStep()` and `getAvailableSteps()` to workflow store
2. ✅ Create `WorkflowBreadcrumb` component
3. ✅ Add breadcrumbs to all workflow pages (Extract, Requirements, Patterns, Preview)
4. ✅ Test breadcrumbs display correctly

### Phase 2: Step Completion (Critical)
5. ✅ Add `completeStep()` call in Extract page (on successful extraction)
6. ✅ Add `completeStep()` call in Requirements page (on successful export)
7. ✅ Add `completeStep()` call in Patterns page (on pattern selection)
8. ✅ Add `completeStep()` call in Preview page (on mount)
9. ✅ Test workflow progression works correctly

### Phase 3: Progressive Navigation
10. ✅ Update Navigation component to use `getAvailableSteps()`
11. ✅ Test navigation items appear/disappear correctly
12. ✅ Fix Dashboard quick actions (conditional rendering)
13. ✅ Fix `/generation` route link to `/preview`

### Phase 4: Route Guards
14. ✅ Add page-level guards to Requirements page
15. ✅ Add page-level guards to Patterns page (coordinate with existing guard)
16. ✅ Add page-level guards to Preview page
17. ✅ Test direct URL access redirects correctly

### Phase 5: Polish
18. ✅ Add "Reset Workflow" button to Dashboard
19. ✅ Add ARIA labels for accessibility
20. ✅ Test with keyboard navigation
21. ✅ Test mobile navigation
22. ✅ Update Storybook stories for new components

---

## Files to Create

1. **`app/src/components/composite/WorkflowBreadcrumb.tsx`** - New breadcrumb component
2. **`app/src/components/composite/WorkflowBreadcrumb.test.tsx`** - Unit tests
3. **`app/src/components/composite/WorkflowBreadcrumb.stories.tsx`** - Storybook story

---

## Files to Modify

1. **`app/src/stores/useWorkflowStore.ts`**
   - Add `canAccessStep()` method
   - Add `getAvailableSteps()` method

2. **`app/src/components/layout/Navigation.tsx`**
   - Replace static navItems with dynamic filtering
   - Use `getAvailableSteps()` to determine visible items
   - Apply to both desktop and mobile navigation

3. **`app/src/app/extract/page.tsx`**
   - Import `WorkflowBreadcrumb`
   - Add breadcrumb to top of page
   - Add `completeStep(WorkflowStep.EXTRACT)` on successful extraction (line ~255)
   - Import `completeStep` from store

4. **`app/src/app/requirements/page.tsx`**
   - Import `WorkflowBreadcrumb`
   - Add breadcrumb to top of page
   - Add `completeStep(WorkflowStep.REQUIREMENTS)` on successful export (line ~98)
   - Import `completeStep` from store
   - Add route guard for Extract prerequisite

5. **`app/src/app/patterns/page.tsx`**
   - Import `WorkflowBreadcrumb`
   - Add breadcrumb to top of page
   - Add `completeStep(WorkflowStep.PATTERNS)` on pattern selection (line ~67)
   - Import `completeStep` from store
   - Coordinate existing redirect guard (line 30) with workflow state
   - Fix `/generation` link to `/preview` (line 130)

6. **`app/src/app/preview/page.tsx`**
   - Import `WorkflowBreadcrumb`
   - Add breadcrumb to top of page
   - Add `completeStep(WorkflowStep.PREVIEW)` on mount
   - Import `completeStep` and `WorkflowStep` from store
   - Add route guard for Patterns prerequisite

7. **`app/src/app/page.tsx`** (Dashboard)
   - Add conditional rendering for "View Patterns" button
   - Import `useWorkflowStore` and `WorkflowStep`
   - Add "Reset Workflow" button

---

## Testing Checklist

### Unit Tests
- [ ] `canAccessStep()` returns correct boolean for each step
- [ ] `getAvailableSteps()` returns correct array based on completed steps
- [ ] WorkflowBreadcrumb renders all states correctly (completed, current, locked, pending)
- [ ] Navigation filters items correctly based on available steps

### Integration Tests
- [ ] Completing Extract shows Requirements in nav
- [ ] Completing Requirements shows Patterns in nav
- [ ] Completing Patterns shows Preview in nav
- [ ] Breadcrumb states update correctly on step completion
- [ ] Dashboard quick actions respect workflow state

### E2E Tests (Playwright)
- [ ] Fresh user sees only Dashboard + Extract in nav
- [ ] After uploading screenshot, Requirements appears in nav
- [ ] After exporting requirements, Patterns appears in nav
- [ ] After selecting pattern, Preview appears in nav
- [ ] Direct URL access to locked pages redirects correctly
- [ ] Browser back button doesn't break workflow
- [ ] Mobile navigation shows/hides steps correctly

### Accessibility Tests
- [ ] Breadcrumb has proper ARIA labels
- [ ] Locked steps are properly disabled with aria-disabled
- [ ] Current step has aria-current="step"
- [ ] Keyboard navigation works through breadcrumb
- [ ] Screen reader announces step states correctly

---

## Rollback Plan

If issues arise, rollback is simple:

1. **Revert Navigation.tsx** to static navItems
2. **Remove breadcrumbs** from pages (non-breaking)
3. **Keep `completeStep()` calls** (they don't break anything if nav is static)
4. **Keep new store methods** (they're just unused functions)

The implementation is designed to be additive and reversible.

---

## Benefits

✅ **Cleaner UI** - Header shows 2-3 items instead of 5+
✅ **Prevents Errors** - Can't access incomplete workflow steps
✅ **Clear Context** - Breadcrumb shows full workflow at a glance
✅ **Better UX** - Guides users through correct flow
✅ **Progressive Disclosure** - Reduces cognitive load
✅ **Maintains Flexibility** - Dashboard still accessible, can jump back to completed steps

---

## Component Reuse

Following `.claude/BASE-COMPONENTS.md` guidelines:

- Uses existing **Button** component with variants
- Uses existing **Badge** component for status indicators
- Follows pattern of **ProgressStages** composite component
- Uses Lucide React icons (CheckCircle, Lock, Loader2, ChevronRight)
- Implements proper accessibility with ARIA labels
- Responsive design with mobile-first approach

---

## Notes

- This implementation maintains backward compatibility
- Existing links and navigation will continue to work
- The breadcrumb is additive and doesn't break existing UI
- Step completion tracking is the critical piece - without it, navigation never progresses
- Route guards are recommended but not required for basic functionality
