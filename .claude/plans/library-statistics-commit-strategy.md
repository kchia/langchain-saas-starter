# Library Statistics Implementation - Commit Strategy

## Overview
This document outlines the Git commit strategy for implementing dynamic library statistics. The implementation is broken into **7 logical commits** following conventional commit format.

---

## Commit Strategy

### Commit 1: feat(backend): add library stats schema and types
**Branch**: `feature/library-statistics`

**Files Changed**:
- `backend/src/api/v1/schemas/retrieval.py` (create or modify)

**Changes**:
```python
# Add LibraryStats Pydantic model
class LibraryStats(BaseModel):
    total_patterns: int
    component_types: List[str]
    categories: List[str]
    frameworks: List[str]
    libraries: List[str]
    metrics: Optional[dict] = None
    total_variants: int = 0
    total_props: int = 0
```

**Commit Message**:
```
feat(backend): add library stats schema and types

- Add LibraryStats Pydantic model for API response
- Include fields for total patterns, component types, categories
- Add optional metrics field for quality metrics (MRR, Hit@3)
- Add metadata fields for total variants and props

Related to: Epic 3 Pattern Retrieval
```

**Tests**: None yet (model definition only)

---

### Commit 2: feat(backend): add library stats methods to retrieval service
**Files Changed**:
- `backend/src/services/retrieval_service.py`

**Changes**:
- Add `get_library_stats()` method to compute stats from patterns
- Add `get_quality_metrics()` async method to fetch from database
- Add imports: `from sqlalchemy import select`, `from ..core.models import EvaluationRun`

**Commit Message**:
```
feat(backend): add library stats methods to retrieval service

- Add get_library_stats() to compute statistics from pattern data
  - Extract unique component types, categories, frameworks
  - Count total variants and props across all patterns
- Add get_quality_metrics() to fetch latest evaluation metrics
  - Query evaluation_runs table for most recent completed run
  - Return MRR, Hit@3, and last evaluation timestamp

This enables the new /library/stats endpoint to provide dynamic data.

Related to: Epic 3 Pattern Retrieval
```

**Tests**: Unit tests in next commit

---

### Commit 3: test(backend): add tests for library stats service methods
**Files Changed**:
- `backend/tests/services/test_retrieval_service_stats.py` (create)
- `backend/tests/conftest.py` (add fixtures if needed)

**Changes**:
- Add `test_get_library_stats()` with sample patterns
- Add `test_get_library_stats_empty()` edge case
- Add `test_get_quality_metrics()` with mock database
- Add `test_get_quality_metrics_no_data()` edge case

**Commit Message**:
```
test(backend): add tests for library stats service methods

- Test get_library_stats() with various pattern structures
- Test edge cases: empty patterns, missing metadata
- Test get_quality_metrics() with mock evaluation runs
- Test behavior when no metrics available
- All tests pass with 100% coverage for new methods

Related to: Epic 3 Pattern Retrieval
```

---

### Commit 4: feat(backend): add GET /library/stats endpoint
**Files Changed**:
- `backend/src/api/v1/routes/retrieval.py`

**Changes**:
- Add `@router.get("/library/stats")` endpoint
- Implement `get_library_statistics()` handler
- Add proper error handling (503 if service unavailable, 500 for errors)
- Add comprehensive docstring with example response
- Add logging for successful requests

**Commit Message**:
```
feat(backend): add GET /library/stats endpoint

- Add GET /api/v1/retrieval/library/stats endpoint
- Returns library statistics including:
  - Total patterns count
  - Unique component types list
  - Categories, frameworks, libraries
  - Quality metrics (MRR, Hit@3) if available
- Add proper error handling and logging
- Response time < 100ms for typical library sizes

Example response:
{
  "total_patterns": 10,
  "component_types": ["Button", "Card", "Input", ...],
  "metrics": { "mrr": 0.75, "hit_at_3": 0.85 }
}

Related to: Epic 3 Pattern Retrieval
```

**Tests**: Integration test in next commit

---

### Commit 5: test(backend): add integration tests for library stats endpoint
**Files Changed**:
- `backend/tests/api/v1/test_retrieval_library_stats.py` (create)

**Changes**:
- Add `test_get_library_stats_success()`
- Add `test_get_library_stats_structure()`
- Add `test_get_library_stats_with_metrics()`
- Add `test_get_library_stats_service_unavailable()`

**Commit Message**:
```
test(backend): add integration tests for library stats endpoint

- Test GET /library/stats returns 200 and correct structure
- Verify all required fields are present
- Test with and without quality metrics
- Test error handling (503 when service unavailable)
- All integration tests pass

Related to: Epic 3 Pattern Retrieval
```

---

### Commit 6: feat(frontend): add library stats types, hook, and API client
**Files Changed**:
- `app/src/types/retrieval.ts`
- `app/src/lib/api/retrieval.ts` (create or modify)
- `app/src/hooks/useLibraryStats.ts` (create)

**Changes**:
- Add `LibraryStatsResponse` interface to types
- Create `fetchLibraryStats()` API client function
- Create `useLibraryStats()` React Query hook with:
  - 5-minute stale time
  - Proper error handling
  - Retry logic

**Commit Message**:
```
feat(frontend): add library stats types, hook, and API client

- Add LibraryStatsResponse TypeScript interface
- Create fetchLibraryStats() API client function
- Create useLibraryStats() React Query hook
  - 5-minute stale time (stats don't change often)
  - Automatic retry on failure
  - Proper TypeScript typing
- Ready for integration into patterns page

Related to: Epic 3 Pattern Retrieval
```

**Tests**: Frontend tests in next commit

---

### Commit 7: feat(frontend): integrate dynamic library stats in patterns page
**Files Changed**:
- `app/src/app/patterns/page.tsx`
- `app/src/components/patterns/PatternLibraryInfo.tsx`

**Changes**:
- Update patterns page to use `useLibraryStats()` hook
- Pass real data to `PatternLibraryInfo` component
- Add loading state (skeleton/spinner)
- Add error state (fallback message)
- Remove hardcoded defaults from `PatternLibraryInfo`
- Add conditional rendering for metrics

**Commit Message**:
```
feat(frontend): integrate dynamic library stats in patterns page

- Update patterns page to fetch library stats via useLibraryStats hook
- Pass actual data to PatternLibraryInfo component:
  - Total patterns from API (replaces hardcoded 10)
  - Component types from pattern library
  - Quality metrics from evaluation runs (if available)
- Add loading state with skeleton UI
- Add error state with fallback message
- Remove hardcoded defaults from PatternLibraryInfo component

Before: Library info showed hardcoded values
After: Library info displays real-time data from backend

Related to: Epic 3 Pattern Retrieval
Closes: #XX (issue number for library stats feature)
```

---

## Commit Order & Dependencies

```
1. feat(backend): add library stats schema and types
   ↓
2. feat(backend): add library stats methods to retrieval service
   ↓
3. test(backend): add tests for library stats service methods
   ↓
4. feat(backend): add GET /library/stats endpoint
   ↓
5. test(backend): add integration tests for library stats endpoint
   ↓
6. feat(frontend): add library stats types, hook, and API client
   ↓
7. feat(frontend): integrate dynamic library stats in patterns page
```

---

## Additional Commits (Optional - Post-MVP)

### Commit 8: test(e2e): add Playwright test for library stats
**Files Changed**:
- `app/tests/e2e/patterns-library-stats.spec.ts` (create)

**Commit Message**:
```
test(e2e): add Playwright test for library stats display

- Add E2E test verifying library stats are displayed
- Test loading states and final display
- Verify component types badges appear
- Verify metrics badges show correct values
- Test error state handling

Related to: Epic 3 Pattern Retrieval
```

---

### Commit 9: docs: update API documentation for library stats endpoint
**Files Changed**:
- `backend/docs/api/retrieval.md` (or relevant API docs)
- `README.md` (if applicable)

**Commit Message**:
```
docs: update API documentation for library stats endpoint

- Document GET /api/v1/retrieval/library/stats endpoint
- Add request/response examples
- Document response schema
- Add usage notes and performance considerations

Related to: Epic 3 Pattern Retrieval
```

---

## Git Workflow

### 1. Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/library-statistics
```

### 2. Make Commits
Follow the commit order above, making one commit at a time:
```bash
# After implementing commit 1
git add backend/src/api/v1/schemas/retrieval.py
git commit -m "feat(backend): add library stats schema and types

- Add LibraryStats Pydantic model for API response
- Include fields for total patterns, component types, categories
- Add optional metrics field for quality metrics (MRR, Hit@3)
- Add metadata fields for total variants and props

Related to: Epic 3 Pattern Retrieval"

# Continue with commits 2-7...
```

### 3. Run Tests After Each Backend Commit
```bash
# After backend commits
cd backend
source venv/bin/activate
pytest tests/services/test_retrieval_service_stats.py -v
pytest tests/api/v1/test_retrieval_library_stats.py -v
```

### 4. Run Frontend Tests After Frontend Commits
```bash
# After frontend commits
cd app
npm test
npm run test:e2e
```

### 5. Push Feature Branch
```bash
git push origin feature/library-statistics
```

### 6. Create Pull Request
- Title: `feat: Add dynamic library statistics to patterns page`
- Description: Link to `.claude/plans/library-statistics-implementation.md`
- Request review from team
- Ensure all CI checks pass

### 7. Merge Strategy
- **Squash merge** if commits are small/incremental
- **Merge commit** to preserve individual commit history (recommended for this feature)

---

## Pre-Commit Checklist

Before each commit, verify:
- [ ] Code follows project style guidelines
- [ ] No console.log or debug statements
- [ ] TypeScript types are correct (no `any`)
- [ ] Error handling is proper
- [ ] Tests pass locally
- [ ] No linting errors
- [ ] Commit message follows conventional commits format

---

## CI/CD Considerations

### Backend Checks
- Linting: `ruff check`
- Type checking: `mypy`
- Tests: `pytest` with coverage report
- API docs generation

### Frontend Checks
- Linting: `eslint`
- Type checking: `tsc --noEmit`
- Tests: `npm test`
- Build: `npm run build`

### E2E Checks
- Playwright tests: `npm run test:e2e`
- Visual regression tests (if configured)

---

## Rollback Strategy

If issues are discovered after merge:

### Revert Entire Feature
```bash
git revert -m 1 <merge-commit-hash>
```

### Revert Specific Commits
```bash
# Revert frontend changes only
git revert <commit-7-hash>
```

### Hotfix Forward
If minor issue, create hotfix branch:
```bash
git checkout -b hotfix/library-stats-fix
# Make fix
git commit -m "fix(frontend): handle null metrics in library stats"
git push origin hotfix/library-stats-fix
```

---

## Success Metrics

After all commits are merged:
- [ ] Library stats endpoint responds in < 100ms
- [ ] Frontend displays dynamic data (not hardcoded)
- [ ] All tests pass (unit, integration, E2E)
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Loading states work smoothly
- [ ] Error states handle failures gracefully
- [ ] Code review approved
- [ ] Feature documented

---

## Timeline Estimate

| Commit | Estimated Time | Cumulative |
|--------|---------------|------------|
| 1. Backend schema | 15 min | 15 min |
| 2. Service methods | 45 min | 1 hr |
| 3. Service tests | 30 min | 1.5 hr |
| 4. API endpoint | 30 min | 2 hr |
| 5. Endpoint tests | 30 min | 2.5 hr |
| 6. Frontend types/hook | 45 min | 3.25 hr |
| 7. Frontend integration | 45 min | 4 hr |
| 8. E2E tests (optional) | 30 min | 4.5 hr |
| 9. Documentation (optional) | 30 min | 5 hr |

**Total: 4-5 hours** (including testing and documentation)
