# Epic 2: Frontend Integration Strategy

## Context

Epic 2 backend and component library were merged in commit `281ae70`. This includes:
- ✅ Backend: Component classifier, requirement proposers, orchestrator, API endpoints
- ✅ Frontend Components: ApprovalPanel, RequirementCard, RequirementEditor, ExportPreview
- ✅ API Layer: `requirements.api.ts`, `useRequirementProposal` hook
- ✅ State: Extended `useWorkflowStore` with requirements management

**What's NOT done**: Integrating these into `/requirements/page.tsx` and solving the screenshot persistence problem.

---

## Problem Analysis

### Current Flow (Broken)
1. Extract page (`/extract`) → User uploads screenshot → Extracts tokens
2. User clicks "Continue to Requirements" → Navigate to `/requirements`
3. **PROBLEM**: Screenshot file is lost (only stored in local component state)
4. Requirements page shows placeholder data (not connected to Epic 2 components)

### Target Flow (Working)
1. Extract page → Upload screenshot → Extract tokens → **Store file in workflow store**
2. Navigate to `/requirements` → Auto-trigger requirement proposal with stored file + tokens
3. Display AI proposals in ApprovalPanelContainer
4. User reviews/edits → Export → Continue to patterns

---

## Integration Tasks (3 Commits)

### Commit 1: Store screenshot file in workflow store
**Scope**: Fix file persistence across pages

```bash
feat(store): persist screenshot file in workflow store for requirements page

- Add `uploadedFile: File | null` to useWorkflowStore state
- Add `setUploadedFile(file: File)` action
- Update extract page to call setUploadedFile() after successful extraction
- Store both file and tokens for requirement proposal
- Clear file when workflow resets

Enables requirements page to access original screenshot.
```

**Files Modified**:
- `app/src/stores/useWorkflowStore.ts`
- `app/src/app/extract/page.tsx`

**Changes**:
```typescript
// useWorkflowStore.ts
interface WorkflowStore {
  // ... existing state
  uploadedFile: File | null;

  // ... existing actions
  setUploadedFile: (file: File) => void;

  // Update resetWorkflow to clear file
}

// extract/page.tsx
const setUploadedFile = useWorkflowStore((state) => state.setUploadedFile);

const handleUpload = () => {
  if (selectedFile) {
    setUploadedFile(selectedFile); // NEW: Store file before extraction
    extractTokens(selectedFile, {
      onSuccess: () => {
        // ... existing success logic
      }
    });
  }
};
```

**Test**:
1. Upload screenshot on extract page
2. Navigate to requirements page
3. Verify `useWorkflowStore.uploadedFile` is not null

---

### Commit 2: Replace placeholder requirements page with Epic 2 integration
**Scope**: Connect requirements page to backend and display AI proposals

```bash
feat(requirements): integrate Epic 2 requirement proposal flow

- Replace placeholder data with ApprovalPanelContainer
- Auto-trigger useRequirementProposal on mount if file exists
- Pass uploadedFile + tokens to proposeRequirements API
- Show loading state during AI analysis (target ≤15s)
- Display component type detection results
- Handle error states (no file, API failure)
- Remove placeholder RequirementCard usage

Requirements page now fully functional with AI proposals.
```

**Files Modified**:
- `app/src/app/requirements/page.tsx`

**Changes**:
```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkflowStore } from "@/stores/useWorkflowStore";
import { useTokenStore } from "@/stores/useTokenStore";
import { useRequirementProposal } from "@/lib/query/hooks/useRequirementProposal";
import { ApprovalPanelContainer } from "@/components/requirements/ApprovalPanelContainer";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RequirementsPage() {
  const router = useRouter();
  const uploadedFile = useWorkflowStore((state) => state.uploadedFile);
  const tokens = useTokenStore((state) => state.tokens);
  const componentType = useWorkflowStore((state) => state.componentType);

  const { mutate: proposeRequirements, isPending, error } = useRequirementProposal();

  // Auto-trigger requirement proposal on mount if file exists
  useEffect(() => {
    if (uploadedFile && !componentType) {
      proposeRequirements({
        file: uploadedFile,
        tokens: tokens || undefined,
      });
    }
  }, [uploadedFile, componentType, tokens, proposeRequirements]);

  // If no file, redirect to extract
  if (!uploadedFile) {
    return (
      <main className="container mx-auto p-8">
        <Alert variant="warning">
          <p>No screenshot found. Please upload a screenshot first.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/extract">← Back to Extraction</Link>
          </Button>
        </Alert>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:p-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Review Requirements
        </h1>
        <p className="text-muted-foreground">
          AI-generated component requirements based on your screenshot
        </p>
      </div>

      {/* Loading State */}
      {isPending && (
        <div className="space-y-4">
          <Alert variant="info">
            <p className="font-medium">🤖 Analyzing your component...</p>
            <p className="text-sm">This typically takes 10-15 seconds.</p>
          </Alert>
          <Progress value={66} className="h-2" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="error">
          <p className="font-medium">Analysis Failed</p>
          <p className="text-sm">{error.message}</p>
        </Alert>
      )}

      {/* Approval Panel (shown after analysis completes) */}
      {componentType && !isPending && (
        <>
          <ApprovalPanelContainer />

          {/* Navigation */}
          <div className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/extract">← Back to Extraction</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/patterns">
                Continue to Patterns
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
```

**Test**:
1. Complete extract flow with screenshot
2. Navigate to requirements page
3. Verify automatic proposal trigger
4. Check ApprovalPanelContainer renders with proposals
5. Test error handling (disconnect backend)

---

### Commit 3: Add export flow to requirements page
**Scope**: Enable requirements export before navigating to patterns

```bash
feat(requirements): add requirements export flow

- Add ExportPreview component to requirements page
- Show export preview button when requirements approved
- Display approval statistics before export
- Call exportRequirements API on confirmation
- Store exportId in workflow store
- Enable "Continue to Patterns" only after export
- Pass exportId in URL params to patterns page

Export completes the requirements workflow.

Closes #XX (Epic 2: Frontend Integration)
```

**Files Modified**:
- `app/src/app/requirements/page.tsx`
- `app/src/stores/useWorkflowStore.ts` (if exportId not already there)

**Changes**:
```typescript
import { ExportPreview } from "@/components/requirements/ExportPreview";
import { exportRequirements } from "@/lib/api/requirements.api";

export default function RequirementsPage() {
  // ... existing code

  const [showExportPreview, setShowExportPreview] = useState(false);
  const exportId = useWorkflowStore((state) => state.exportId);
  const setExportInfo = useWorkflowStore((state) => state.setExportInfo);

  const handleExport = async () => {
    const approvedProposals = useWorkflowStore.getState().getApprovedProposals();

    const result = await exportRequirements({
      componentType,
      componentConfidence,
      proposals: approvedProposals,
      tokens: tokens || undefined,
    });

    setExportInfo(result.exportId, result.summary.exportedAt);
    setShowExportPreview(false);
  };

  return (
    // ... existing JSX

    {componentType && !isPending && (
      <>
        <ApprovalPanelContainer />

        {/* Export Preview Modal */}
        {showExportPreview && (
          <ExportPreview
            onConfirm={handleExport}
            onCancel={() => setShowExportPreview(false)}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button asChild variant="outline">
            <Link href="/extract">← Back</Link>
          </Button>

          {!exportId ? (
            <Button onClick={() => setShowExportPreview(true)} size="lg">
              Export Requirements
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href={`/patterns?exportId=${exportId}`}>
                Continue to Patterns
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </>
    )}
  );
}
```

**Test**:
1. Complete requirement approval
2. Click "Export Requirements"
3. Verify export preview modal
4. Confirm export
5. Verify "Continue to Patterns" enabled with exportId

---

## Testing Strategy

### Manual E2E Flow
1. Start services: `make dev`
2. Navigate to `/extract`
3. Upload button screenshot
4. Extract tokens
5. Click "Continue to Requirements"
6. **Verify**: Auto-trigger requirement proposal (loading ~15s)
7. **Verify**: ApprovalPanel shows component type (e.g., "Button") with confidence
8. **Verify**: Proposals grouped by category (Props, Events, States, Accessibility)
9. Accept/edit some requirements
10. Click "Export Requirements"
11. **Verify**: Export preview shows statistics
12. Confirm export
13. **Verify**: "Continue to Patterns" button enabled
14. Navigate to patterns
15. **Verify**: URL contains `?exportId=xxx`

### Automated Tests (Future)
```bash
# Playwright E2E test
cd app && npm run test:e2e -- requirements-flow.spec.ts
```

---

## Success Criteria

- [x] Screenshot file persists from extract → requirements page
- [x] Requirements page auto-triggers AI proposal on mount
- [x] ApprovalPanelContainer displays with real proposals (not placeholders)
- [x] Component type detection shows confidence score
- [x] All 4 requirement categories render (props, events, states, a11y)
- [x] Export flow works with preview modal
- [x] ExportId stored and passed to patterns page
- [x] Error states handled gracefully
- [x] Loading states clear and informative

---

## Rollback Strategy

Each commit is atomic and reversible:

```bash
# Revert Commit 3 (export flow)
git revert HEAD

# Revert Commit 2 (requirements integration)
git revert HEAD~1

# Revert Commit 1 (file persistence)
git revert HEAD~2
```

**Safe Rollback Points**:
- After Commit 1: File stored but requirements page still has placeholders
- After Commit 2: Requirements flow works but no export
- After Commit 3: Full Epic 2 integration complete

---

## Dependencies

**From Epic 1** (already complete):
- Token extraction API and store
- Component library (Card, Badge, Button, Progress, Alert)

**From Epic 2 Backend** (already merged):
- POST `/requirements/propose` endpoint
- POST `/requirements/export` endpoint
- Component classifier and requirement proposers

**From Epic 2 Components** (already merged):
- ApprovalPanelContainer
- RequirementCard, RequirementEditor
- ExportPreview
- useRequirementProposal hook

---

## Known Issues & Solutions

### Issue 1: File object not serializable
**Problem**: File objects can't be stored directly in Zustand (not serializable)
**Solution**: Store File object directly (Zustand supports non-serializable values). For persistence across page refreshes, we would need backend storage, but that's not required for SPA navigation.

### Issue 2: Re-triggering proposal on page refresh
**Problem**: If user refreshes requirements page, file is lost
**Solution**: Show error and redirect to extract page (acceptable UX for MVP)

### Issue 3: Backend not running
**Problem**: Frontend shows error if backend unavailable
**Solution**: Already handled in error state (Commit 2)

---

## Next Steps After Integration

1. **Epic 3**: Use `exportId` to retrieve requirements in patterns page
2. **Epic 4**: Pass requirements to code generation
3. **Epic 5**: Validate generated code against requirements
4. **Performance**: Monitor requirement proposal latency (target ≤15s p50)

---

## Metrics to Track

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Proposal Latency** | p50 ≤15s | LangSmith traces, API response time |
| **Component Type Accuracy** | ≥85% | User feedback, manual review |
| **User Edit Rate** | <30% | % requirements edited before approval |
| **Approval Rate** | ≥80% | % proposals approved vs rejected |

---

## Final Checklist

- [ ] Commit 1: File persistence working
- [ ] Commit 2: Requirements page shows real proposals
- [ ] Commit 3: Export flow functional
- [ ] E2E flow tested manually
- [ ] Error states handled
- [ ] Loading states clear
- [ ] Backend integration verified
- [ ] LangSmith traces visible
- [ ] Navigation flow correct (extract → requirements → patterns)
- [ ] No placeholder data remaining

---

## Estimated Timeline

- **Commit 1** (File persistence): 30 minutes
- **Commit 2** (Requirements integration): 1.5 hours
- **Commit 3** (Export flow): 1 hour
- **Testing & Fixes**: 1 hour

**Total**: ~4 hours

---

## Command Reference

```bash
# Start development
make dev

# Check stores in React DevTools
# Zustand DevTools: useWorkflowStore, useTokenStore

# Check backend logs
docker logs -f component-forge-backend

# Check LangSmith traces
open https://smith.langchain.com

# Test requirement proposal API directly
curl -X POST http://localhost:8000/api/v1/requirements/propose \
  -F "file=@button.png" \
  -F "tokens={\"colors\":{\"primary\":\"#3B82F6\"}}"
```
