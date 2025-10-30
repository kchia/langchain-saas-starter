# Library Statistics Implementation Plan

## Overview
Add dynamic component types list and quality metrics to the Pattern Library Info card by creating a new backend endpoint that analyzes the pattern library and computes statistics.

## Current State Analysis

### Data Sources Available
- **Pattern Files**: `data/patterns/button.json`, `data/patterns/card.json`
- **RetrievalService**: Has access to `self.patterns` (loaded from JSON files)
- **Pattern Structure**: Each pattern has:
  - `id`, `name`, `category`, `framework`, `library`
  - `metadata`: Contains `variants`, `props`, `a11y`, `events`, `states`
  - `code`: The actual component implementation

### Current Hardcoded Values
```typescript
// app/src/components/patterns/PatternLibraryInfo.tsx
totalPatterns = 10  // Now fixed: uses API data
componentTypes = ['Button', 'Card', 'Input', 'Select', 'Badge', 'Alert', 'Checkbox', 'Radio', 'Switch', 'Tabs']
metrics = { mrr: 0.75, hit_at_3: 0.85 }
```

## Detailed Implementation Plan

---

## Phase 1: Backend - Library Statistics Endpoint

### 1.1 Create Library Stats Response Model
**File**: `backend/src/api/v1/schemas/retrieval.py` (or create new file)

```python
from pydantic import BaseModel
from typing import List, Optional

class LibraryStats(BaseModel):
    """Statistics about the pattern library."""

    total_patterns: int
    component_types: List[str]
    categories: List[str]
    frameworks: List[str]
    libraries: List[str]

    # Quality metrics (computed from evaluation runs)
    metrics: Optional[dict] = None  # { "mrr": 0.75, "hit_at_3": 0.85 }

    # Additional metadata
    last_updated: Optional[str] = None
    total_variants: int = 0
    total_props: int = 0
```

### 1.2 Add Library Stats Method to RetrievalService
**File**: `backend/src/services/retrieval_service.py`

```python
def get_library_stats(self) -> Dict:
    """Compute library-level statistics from loaded patterns.

    Returns:
        Dictionary with:
        - total_patterns: int
        - component_types: List[str] (unique component names)
        - categories: List[str] (unique categories)
        - frameworks: List[str] (unique frameworks)
        - libraries: List[str] (unique libraries)
        - total_variants: int (sum of all variant counts)
        - total_props: int (sum of all prop counts)
    """
    component_types = set()
    categories = set()
    frameworks = set()
    libraries = set()
    total_variants = 0
    total_props = 0

    for pattern in self.patterns:
        # Extract unique values
        component_types.add(pattern.get("name", "Unknown"))

        if "category" in pattern:
            categories.add(pattern["category"])

        if "framework" in pattern:
            frameworks.add(pattern["framework"])

        if "library" in pattern:
            libraries.add(pattern["library"])

        # Count metadata items
        metadata = pattern.get("metadata", {})
        if "variants" in metadata:
            total_variants += len(metadata["variants"])
        if "props" in metadata:
            total_props += len(metadata["props"])

    return {
        "total_patterns": len(self.patterns),
        "component_types": sorted(list(component_types)),
        "categories": sorted(list(categories)),
        "frameworks": sorted(list(frameworks)),
        "libraries": sorted(list(libraries)),
        "total_variants": total_variants,
        "total_props": total_props,
    }
```

### 1.3 Add Quality Metrics from Evaluation Database
**File**: `backend/src/services/retrieval_service.py`

```python
async def get_quality_metrics(self, db: AsyncSession) -> Optional[Dict]:
    """Fetch latest quality metrics from evaluation_runs table.

    Args:
        db: Database session

    Returns:
        Dictionary with MRR, Hit@3, and other metrics, or None
    """
    try:
        # Query latest completed evaluation run
        query = (
            select(EvaluationRun)
            .where(EvaluationRun.status == "completed")
            .where(EvaluationRun.evaluation_type == "pattern_retrieval")
            .order_by(EvaluationRun.completed_at.desc())
            .limit(1)
        )

        result = await db.execute(query)
        latest_eval = result.scalar_one_or_none()

        if latest_eval and latest_eval.metrics:
            return {
                "mrr": latest_eval.metrics.get("mrr"),
                "hit_at_3": latest_eval.metrics.get("hit_at_3"),
                "last_evaluated": latest_eval.completed_at.isoformat()
            }

        return None

    except Exception as e:
        logger.warning(f"Failed to fetch quality metrics: {e}")
        return None
```

### 1.4 Create GET /api/v1/retrieval/library/stats Endpoint
**File**: `backend/src/api/v1/routes/retrieval.py`

```python
@router.get("/library/stats")
async def get_library_statistics(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Get library-level statistics and quality metrics.

    Returns:
        LibraryStats object with:
        - total_patterns: Total number of patterns in library
        - component_types: List of unique component names
        - categories: List of categories (e.g., "form", "layout")
        - frameworks: List of frameworks (e.g., "react", "vue")
        - libraries: List of libraries (e.g., "shadcn/ui", "chakra")
        - metrics: Quality metrics (MRR, Hit@3) from latest eval
        - total_variants: Sum of all variants across patterns
        - total_props: Sum of all props across patterns

    Example Response:
        {
            "total_patterns": 10,
            "component_types": ["Button", "Card", "Input", ...],
            "categories": ["form", "data-display", "layout"],
            "frameworks": ["react"],
            "libraries": ["shadcn/ui", "radix-ui"],
            "metrics": {
                "mrr": 0.75,
                "hit_at_3": 0.85,
                "last_evaluated": "2025-10-06T14:30:00Z"
            },
            "total_variants": 45,
            "total_props": 120
        }
    """
    try:
        # Get retrieval service from app state
        if not hasattr(request.app.state, "retrieval_service"):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Retrieval service not initialized"
            )

        service = request.app.state.retrieval_service

        # Get library stats (synchronous)
        stats = service.get_library_stats()

        # Get quality metrics from database (async)
        metrics = await service.get_quality_metrics(db)
        if metrics:
            stats["metrics"] = metrics

        logger.info(f"Library stats retrieved: {stats['total_patterns']} patterns")

        return stats

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Failed to get library statistics: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve library statistics: {str(e)}"
        )
```

---

## Phase 2: Frontend - Library Statistics Integration

### 2.1 Update TypeScript Types
**File**: `app/src/types/retrieval.ts`

Add new interface:

```typescript
export interface LibraryStatistics {
  total_patterns: number;
  component_types: string[];
  categories: string[];
  frameworks: string[];
  libraries: string[];
  total_variants: number;
  total_props: number;
  metrics?: {
    mrr: number;
    hit_at_3: number;
    last_evaluated?: string;
  };
}

export interface LibraryStatsResponse {
  total_patterns: number;
  component_types: string[];
  categories?: string[];
  frameworks?: string[];
  libraries?: string[];
  metrics?: {
    mrr: number;
    hit_at_3: number;
    last_evaluated?: string;
  };
  total_variants?: number;
  total_props?: number;
}
```

### 2.2 Create API Client Function
**File**: `app/src/lib/api/retrieval.ts` (or create if doesn't exist)

```typescript
import { LibraryStatsResponse } from '@/types/retrieval';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchLibraryStats(): Promise<LibraryStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/retrieval/library/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch library stats: ${response.statusText}`);
  }

  return response.json();
}
```

### 2.3 Create React Query Hook
**File**: `app/src/hooks/useLibraryStats.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchLibraryStats } from '@/lib/api/retrieval';
import type { LibraryStatsResponse } from '@/types/retrieval';

export function useLibraryStats() {
  return useQuery<LibraryStatsResponse, Error>({
    queryKey: ['library-stats'],
    queryFn: fetchLibraryStats,
    staleTime: 5 * 60 * 1000, // 5 minutes - stats don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}
```

### 2.4 Update PatternLibraryInfo Component
**File**: `app/src/components/patterns/PatternLibraryInfo.tsx`

Update to accept dynamic data as props (already has the interface, just need to remove defaults):

```typescript
export function PatternLibraryInfo({
  totalPatterns,  // Remove default value
  componentTypes,  // Remove default value
  metrics  // Remove default value
}: PatternLibraryInfoProps) {
  // Add loading state handling
  if (!totalPatterns) {
    return (
      <Card variant="outlined">
        <CardContent className="flex items-center justify-center h-40">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  // Rest of component remains the same...
}
```

### 2.5 Update Patterns Page
**File**: `app/src/app/patterns/page.tsx`

```typescript
import { useLibraryStats } from '@/hooks/useLibraryStats';

export default function PatternsPage() {
  // ... existing code ...

  // Fetch library statistics
  const {
    data: libraryStats,
    isLoading: statsLoading,
    isError: statsError
  } = useLibraryStats();

  return (
    // ... existing JSX ...

    {/* Sidebar - Library Info */}
    <div className="lg:col-span-1">
      <div className="lg:sticky lg:top-8">
        {statsLoading ? (
          <Card variant="outlined">
            <CardContent className="flex items-center justify-center h-40">
              <Spinner />
            </CardContent>
          </Card>
        ) : statsError ? (
          <Card variant="outlined">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Unable to load library statistics
              </p>
            </CardContent>
          </Card>
        ) : (
          <PatternLibraryInfo
            totalPatterns={libraryStats?.total_patterns}
            componentTypes={libraryStats?.component_types}
            metrics={libraryStats?.metrics}
          />
        )}
      </div>
    </div>
  );
}
```

---

## Phase 3: Testing & Validation

### 3.1 Backend Tests
**File**: `backend/tests/test_retrieval_library_stats.py`

```python
import pytest
from fastapi.testclient import TestClient

def test_library_stats_endpoint(client: TestClient):
    """Test GET /api/v1/retrieval/library/stats"""
    response = client.get("/api/v1/retrieval/library/stats")

    assert response.status_code == 200
    data = response.json()

    # Verify structure
    assert "total_patterns" in data
    assert "component_types" in data
    assert isinstance(data["component_types"], list)
    assert data["total_patterns"] > 0

    # If metrics exist, verify structure
    if "metrics" in data:
        assert "mrr" in data["metrics"]
        assert "hit_at_3" in data["metrics"]
        assert 0 <= data["metrics"]["mrr"] <= 1
        assert 0 <= data["metrics"]["hit_at_3"] <= 1

def test_library_stats_service_method():
    """Test RetrievalService.get_library_stats()"""
    patterns = [
        {"name": "Button", "category": "form"},
        {"name": "Card", "category": "layout"},
    ]
    service = RetrievalService(patterns=patterns)

    stats = service.get_library_stats()

    assert stats["total_patterns"] == 2
    assert "Button" in stats["component_types"]
    assert "Card" in stats["component_types"]
```

### 3.2 Frontend Tests
**File**: `app/src/hooks/__tests__/useLibraryStats.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLibraryStats } from '../useLibraryStats';

test('useLibraryStats fetches library statistics', async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const { result } = renderHook(() => useLibraryStats(), { wrapper });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toBeDefined();
  expect(result.current.data?.total_patterns).toBeGreaterThan(0);
  expect(Array.isArray(result.current.data?.component_types)).toBe(true);
});
```

### 3.3 E2E Test
**File**: `app/tests/e2e/patterns-library-stats.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('Pattern Library Info displays dynamic statistics', async ({ page }) => {
  // Navigate to patterns page
  await page.goto('/patterns');

  // Wait for library stats to load
  await page.waitForSelector('[data-testid="pattern-library-info"]');

  // Verify total patterns is displayed and not hardcoded "10"
  const totalPatterns = await page.textContent('[data-testid="total-patterns"]');
  expect(parseInt(totalPatterns)).toBeGreaterThan(0);

  // Verify component types are displayed
  const componentBadges = await page.locator('[data-testid="component-type-badge"]').count();
  expect(componentBadges).toBeGreaterThan(0);

  // Verify quality metrics if available
  const mrrBadge = await page.locator('[data-testid="mrr-metric"]');
  if (await mrrBadge.isVisible()) {
    const mrrValue = await mrrBadge.textContent();
    expect(mrrValue).toMatch(/\d+%/);
  }
});
```

---

## Phase 4: Optional Enhancements

### 4.1 Add Caching
- Cache library stats in Redis with 5-minute TTL
- Invalidate cache when new patterns are added

### 4.2 Add Real-Time Updates
- WebSocket connection to push library stats updates
- Update React Query cache when patterns change

### 4.3 Add Historical Trends
- Store quality metrics history in database
- Display trend charts (MRR over time, Hit@3 improvements)

### 4.4 Add More Granular Metrics
- Per-component quality metrics
- Average confidence scores by category
- Most/least retrieved patterns

---

## Implementation Checklist

### Backend (Epic 3.5 Extension)
- [ ] 1. Add `LibraryStats` schema to `schemas/retrieval.py`
- [ ] 2. Add `get_library_stats()` method to `RetrievalService`
- [ ] 3. Add `get_quality_metrics()` method to `RetrievalService`
- [ ] 4. Create `GET /api/v1/retrieval/library/stats` endpoint
- [ ] 5. Write backend unit tests
- [ ] 6. Test endpoint with curl/Postman
- [ ] 7. Update API documentation

### Frontend
- [ ] 8. Add `LibraryStatsResponse` type to `types/retrieval.ts`
- [ ] 9. Create `fetchLibraryStats()` API client function
- [ ] 10. Create `useLibraryStats()` React Query hook
- [ ] 11. Update `PatternLibraryInfo` component to remove defaults
- [ ] 12. Update patterns page to use `useLibraryStats()` hook
- [ ] 13. Add loading and error states to patterns page
- [ ] 14. Write frontend unit tests
- [ ] 15. Write E2E test with Playwright
- [ ] 16. Add data-testid attributes for testing

### Integration & Testing
- [ ] 17. Test full flow: Backend → Frontend display
- [ ] 18. Verify metrics update when evaluation runs complete
- [ ] 19. Test error handling (service unavailable, no data)
- [ ] 20. Verify performance (API latency < 100ms)
- [ ] 21. Update user documentation

---

## Success Criteria

1. **Dynamic Data**: Pattern Library Info card displays actual data from backend
2. **Component Types**: Shows real component names from `data/patterns/`
3. **Quality Metrics**: Shows MRR and Hit@3 from latest evaluation run (if available)
4. **Performance**: Library stats endpoint responds in < 100ms
5. **UX**: Loading states and error handling work smoothly
6. **Tests**: All unit, integration, and E2E tests pass

---

## Rollout Plan

### Phase 1: MVP (2-3 hours)
- Backend endpoint with basic stats (no quality metrics yet)
- Frontend integration with loading states
- Basic E2E test

### Phase 2: Quality Metrics (1-2 hours)
- Add quality metrics from evaluation database
- Update frontend to display metrics
- Add conditional rendering (show/hide if no metrics)

### Phase 3: Polish (1 hour)
- Add error boundaries
- Improve loading states
- Add animations/transitions
- Complete test coverage

**Total Estimated Time**: 4-6 hours
