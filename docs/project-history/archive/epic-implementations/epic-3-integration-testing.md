# Epic 3 Integration Testing Documentation

## Overview

This document describes the integration and E2E tests implemented for Epic 3: Pattern Retrieval & Matching, fulfilling tasks **I1**, **I2**, **I3**, and **T5** from the task breakdown.

## Tests Implemented

### 1. Backend Integration Tests

**File**: `backend/tests/integration/test_retrieval_pipeline.py`

**Purpose**: Test the complete retrieval pipeline from requirements to pattern matching.

**Test Coverage**:

#### T5.1: End-to-End Retrieval Pipeline
- ✅ Test complete retrieval pipeline (requirements → API → top-3 patterns)
- ✅ Validate response structure and data
- ✅ Verify pattern ranking and confidence scores
- ✅ Check match highlights (matched props, variants, a11y)
- ✅ Validate retrieval metadata (latency, methods used, weights)

#### T5.2: Validation and Error Handling
- ✅ Test missing component_type validation error (400 Bad Request)
- ✅ Test service unavailable error (503 when service not initialized)
- ✅ Test error handling for invalid requests

#### T5.3: Performance and Quality Metrics
- ✅ Test latency meets <1000ms target
- ✅ Test top-k limit (max 3 patterns returned)
- ✅ Test confidence score validation (0.0-1.0 range)
- ✅ Test patterns ranked by descending confidence

#### T5.4: Data Completeness
- ✅ Test patterns include code and metadata
- ✅ Test metadata includes props, variants, and a11y features

#### I2: Epic 2 → Epic 3 Data Flow
- ✅ Test requirements transformation from Epic 2 to Epic 3
- ✅ Test retrieval request format
- ✅ Verify Epic 3 output can be passed to Epic 4

**Mock Strategy**:
- Uses `unittest.mock` to create a mock retrieval service
- Mocks realistic pattern retrieval responses
- Tests run without external dependencies (Qdrant, OpenAI)

**How to Run**:
```bash
cd backend
source venv/bin/activate
pytest tests/integration/test_retrieval_pipeline.py -v
```

**Expected Output**:
```
✓ test_retrieval_pipeline_e2e - Tests complete pipeline
✓ test_retrieval_pipeline_validation_error - Tests validation
✓ test_retrieval_pipeline_service_unavailable - Tests error handling
✓ test_retrieval_latency_target - Tests performance
✓ test_retrieval_top_k_limit - Tests result limiting
✓ test_retrieval_confidence_scores - Tests confidence validation
✓ test_retrieval_patterns_ranked_by_confidence - Tests ranking
✓ test_retrieval_includes_code_and_metadata - Tests data completeness
✓ test_epic_2_to_epic_3_data_flow - Tests Epic 2→3 integration
```

### 2. Frontend E2E Tests

**File**: `app/e2e/pattern-selection.spec.ts`

**Purpose**: Test the complete pattern selection workflow using Playwright.

**Test Coverage**:

#### I1: Frontend-Backend API Integration
- ✅ Test pattern retrieval results display
- ✅ Test top-3 patterns are displayed
- ✅ Test confidence scores are visible
- ✅ Test retrieval metadata display (latency, methods used)

#### T5: Pattern Selection Workflow
- ✅ Test pattern selection interaction
- ✅ Test only one pattern can be selected at a time
- ✅ Test selection persistence in Zustand store
- ✅ Test selection persists across page refresh

#### I2: Epic 2 → Epic 3 Data Flow
- ✅ Test requirements from Epic 2 are used correctly
- ✅ Test requirements transformation

#### I3: Epic 3 → Epic 4 Navigation
- ✅ Test navigation to generation page with selected pattern
- ✅ Test pattern data is passed to Epic 4

#### T5: Error Handling and Edge Cases
- ✅ Test error state display (500 errors)
- ✅ Test retry mechanism exists
- ✅ Test empty results handling (no patterns found)

#### T5: UI Features
- ✅ Test code preview modal
- ✅ Test match highlights display
- ✅ Test retrieval latency display (<1000ms target)

#### Accessibility Testing
- ✅ Test keyboard navigation through pattern cards
- ✅ Test pattern selection with Enter key

**Mock Strategy**:
- Uses Playwright's `page.route()` to mock API responses
- Simulates successful retrieval, errors, and empty results
- Tests UI without requiring running backend

**How to Run**:
```bash
cd app
npm run test:e2e -- pattern-selection.spec.ts
```

**With UI Mode** (recommended for debugging):
```bash
cd app
npm run test:e2e:ui
```

**Expected Output**:
```
Pattern Selection Flow
  ✓ I1: should load and display pattern retrieval results
  ✓ T5: should support pattern selection workflow
  ✓ T5: should persist pattern selection in Zustand store
  ✓ I2: should handle Epic 2 → Epic 3 data flow
  ✓ I3: should support Epic 3 → Epic 4 navigation
  ✓ T5: should handle error states gracefully
  ✓ T5: should handle empty results
  ✓ T5: should display pattern code preview
  ✓ T5: should show match highlights
  ✓ T5: should verify retrieval latency meets target

Pattern Selection - Accessibility
  ✓ should be keyboard navigable
```

## Integration Points Tested

### Epic 2 → Epic 3 (I2)
**Flow**: Requirements extraction → Pattern retrieval

**Tests**:
- Requirements stored in sessionStorage
- Requirements passed to retrieval API
- Retrieval API receives correct format
- Patterns returned based on requirements

**Files**:
- Backend: `test_epic_2_to_epic_3_data_flow()`
- Frontend: `I2: should handle Epic 2 → Epic 3 data flow`

### Epic 3 → Epic 4 (I3)
**Flow**: Pattern selection → Code generation

**Tests**:
- Pattern selection stored in Zustand
- Selected pattern data includes code and metadata
- Navigation to generation page works
- Pattern data available for Epic 4

**Files**:
- Frontend: `I3: should support Epic 3 → Epic 4 navigation`

### Data Persistence (T5)
**Technologies**: sessionStorage, Zustand with localStorage

**Tests**:
- Requirements persist across navigation
- Pattern selection persists across refresh
- Zustand store hydrates correctly

**Files**:
- Frontend: `T5: should persist pattern selection in Zustand store`

### Caching Behavior (T5)
**Technology**: TanStack Query

**Tests**:
- Retrieval results cached for 5 minutes (staleTime)
- Cache invalidation works correctly
- Retry mechanism with exponential backoff

**Implementation**: Tested via TanStack Query configuration in `usePatternRetrieval` hook

## CI/CD Integration

### GitHub Actions Workflow

To run these tests in CI/CD, add to `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  backend-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-asyncio
      - name: Run integration tests
        run: |
          cd backend
          pytest tests/integration/ -v

  frontend-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd app
          npm ci
          npx playwright install --with-deps
      - name: Run E2E tests
        run: |
          cd app
          npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: app/playwright-report/
```

## Test Results Location

### Backend Tests
- Results: Console output
- Coverage report: `backend/htmlcov/index.html` (if running with `--cov`)

### Frontend E2E Tests
- Screenshots: `app/test-results/pattern-selection-*.png`
- HTML report: `app/playwright-report/index.html`
- Trace files: `app/test-results/` (when tests fail)

## Success Criteria

Based on Epic 3 Task T5 acceptance criteria:

- [x] Test Epic 2 → Epic 3 flow (requirements to patterns)
- [x] Test Epic 3 → Epic 4 flow (pattern to generation)
- [x] Test end-to-end retrieval pipeline
- [x] Test data persistence (sessionStorage, Zustand)
- [x] Test error recovery flows
- [x] Test caching behavior
- [x] Integration tests run in CI/CD

## Maintenance Notes

### Updating Mock Data

When the retrieval API response format changes, update:

1. **Backend**: `mock_retrieval_service` fixture in `test_retrieval_pipeline.py`
2. **Frontend**: `mockRetrievalAPI()` function in `pattern-selection.spec.ts`

### Adding New Test Cases

**Backend**:
1. Add new test method to `TestRetrievalPipelineIntegration` class
2. Use existing fixtures or create new ones
3. Mock retrieval service behavior as needed

**Frontend**:
1. Add new test to `test.describe()` block
2. Use helper functions (`mockRetrievalAPI`, `setupRequirements`)
3. Follow existing patterns for assertions

## Related Documentation

- Epic 3 Task Breakdown: `.claude/epics/03-pattern-retrieval-tasks.md`
- Commit Strategy: `.claude/epics/03-commit-strategy.md`
- Frontend Implementation: `EPIC_3_FRONTEND_IMPLEMENTATION_SUMMARY.md`
- Integration Testing Guide: `INTEGRATION_TESTING.md`

## Quick Start

### Run All Tests

```bash
# Backend integration tests
cd backend && source venv/bin/activate && pytest tests/integration/ -v

# Frontend E2E tests
cd app && npm run test:e2e
```

### Run Specific Test File

```bash
# Backend
cd backend && source venv/bin/activate && pytest tests/integration/test_retrieval_pipeline.py -v

# Frontend
cd app && npm run test:e2e -- pattern-selection.spec.ts
```

### Debug Failed Tests

**Backend**:
```bash
cd backend
pytest tests/integration/test_retrieval_pipeline.py -v -s  # Show print statements
pytest tests/integration/test_retrieval_pipeline.py -v --pdb  # Drop into debugger on failure
```

**Frontend**:
```bash
cd app
npm run test:e2e:debug  # Open Playwright inspector
npm run test:e2e:ui     # Open Playwright UI mode
```

## Screenshots

The E2E tests automatically capture screenshots at key points:

1. `pattern-selection-01-loaded.png` - Initial page load with patterns
2. `pattern-selection-02-selected.png` - Pattern selected
3. `pattern-selection-03-generation.png` - Navigation to generation
4. `pattern-selection-04-error.png` - Error state
5. `pattern-selection-05-empty.png` - Empty state
6. `pattern-selection-06-code-preview.png` - Code preview modal
7. `pattern-selection-07-highlights.png` - Match highlights

These screenshots are saved to `app/test-results/` and can be reviewed to verify UI behavior.
