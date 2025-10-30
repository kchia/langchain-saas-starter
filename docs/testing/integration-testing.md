# Integration Testing

Comprehensive guide to running integration tests for ComponentForge.

## Overview

Integration tests validate complete workflows and multi-component interactions across:

- **Epic 1**: Token Extraction & Export
- **Epic 3**: Pattern Retrieval Pipeline
- **Epic 4**: Code Generation & Adaptation
- **Epic 11**: Frontend-Backend Integration

## Test Structure

### Backend Integration Tests

Location: `backend/tests/integration/`

**Test Files:**
- `test_token_extraction.py` - Token extraction and export (Epic 1)
- `test_retrieval_pipeline.py` - Pattern retrieval pipeline (Epic 3)
- `test_generation_e2e.py` - Code generation workflows (Epic 4)

### Frontend E2E Tests

Location: `app/e2e/`

**Test Files:**
- `onboarding.spec.ts` - Onboarding modal (Epic 11)
- `token-extraction.spec.ts` - Token extraction UI (Epic 11)
- `pattern-selection.spec.ts` - Pattern selection UI (Epic 3)
- `generation.spec.ts` - Generation UI flow (Epic 4)

---

## Quick Start

### Run All Integration Tests

```bash
# Backend
cd backend && source venv/bin/activate && pytest tests/integration/ -v

# Frontend
cd app && npm run test:e2e
```

---

## Backend Integration Tests

### Prerequisites

```bash
# Python 3.11+ required
python --version  # Should be 3.11 or higher

# Set up virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables

Create `backend/.env`:

```bash
# OpenAI (required for generation)
OPENAI_API_KEY=your-openai-api-key

# LangSmith (optional - for trace validation)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langsmith-api-key
LANGCHAIN_PROJECT=componentforge-dev
```

### Running Tests

#### All Integration Tests
```bash
cd backend
source venv/bin/activate
pytest tests/integration/ -v
```

#### Specific Test File
```bash
# Token extraction tests
pytest tests/integration/test_token_extraction.py -v

# Pattern retrieval tests
pytest tests/integration/test_retrieval_pipeline.py -v

# Generation E2E tests
pytest tests/integration/test_generation_e2e.py -v
```

#### With Coverage
```bash
pytest tests/integration/ -v --cov=src --cov-report=html
# Open htmlcov/index.html to view coverage report
```

#### Debug Mode
```bash
# Show print statements
pytest tests/integration/test_retrieval_pipeline.py -v -s

# Drop into debugger on failure
pytest tests/integration/test_retrieval_pipeline.py -v --pdb
```

### Test Coverage

#### Token Extraction (Epic 1)
- ✅ Screenshot → Tokens → JSON Export
- ✅ Screenshot → Tokens → CSS Export
- ✅ Figma → Tokens → Export
- ✅ Manual token override → Export
- ✅ Export format compatibility

#### Pattern Retrieval (Epic 3)
- ✅ End-to-end retrieval flow (requirements → API → patterns)
- ✅ Response validation and data structure
- ✅ Pattern ranking and confidence scoring
- ✅ Match highlights (props, variants, accessibility)
- ✅ Retrieval metadata (latency, methods, weights)
- ✅ Validation errors and error handling
- ✅ Performance metrics (latency <1000ms target)
- ✅ Data flow: Epic 2 → Epic 3 → Epic 4

#### Code Generation (Epic 4)
- ✅ Full workflow: tokens → requirements → pattern → generation
- ✅ Button, Card, Input pattern generation
- ✅ TypeScript syntax validation
- ✅ Import statement verification
- ✅ Storybook stories structure
- ✅ Real pattern library usage
- ✅ Performance targets (basic check)
- ✅ Error handling
- ✅ Epic 1 → 2 → 3 → 4 data flow

---

## Frontend E2E Tests (Playwright)

### Prerequisites

```bash
# Node.js 18+ required
node --version  # Should be 18 or higher

# Install dependencies
cd app
npm install

# Install Playwright browsers (first time only)
npx playwright install
```

### Environment Variables

Create `app/.env.test`:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
TEST_FIGMA_PAT=your-figma-personal-access-token
TEST_FIGMA_URL=https://www.figma.com/file/your-file-key/your-file-name
```

### Running Tests

#### All E2E Tests
```bash
cd app
npm run test:e2e
```

#### Specific Test File
```bash
# Onboarding tests
npm run test:e2e -- onboarding.spec.ts

# Token extraction tests
npm run test:e2e -- token-extraction.spec.ts

# Pattern selection tests
npm run test:e2e -- pattern-selection.spec.ts

# Generation tests
npm run test:e2e -- generation.spec.ts
```

#### UI Mode (Recommended for Development)
```bash
npm run test:e2e:ui
```

#### Headed Mode (Visible Browser)
```bash
npm run test:e2e:headed
```

#### Debug Mode
```bash
npm run test:e2e:debug
```

#### Specific Test with Grep
```bash
npx playwright test pattern-selection.spec.ts -g "should load and display"
```

### Test Coverage

#### Onboarding Modal (Epic 11 - Task 13.4, 13.5)
- ✅ Modal shows on first visit
- ✅ Modal does NOT show on subsequent visits
- ✅ Workflow selection saves preference and navigates
- ✅ Skip button works correctly
- ✅ All workflow cards display with correct content

#### Token Extraction (Epic 11 - Tasks 12.2-12.8, 13.1-13.3)
- ✅ UI structure tests (upload area, file input)
- 🚧 Full extraction flow (requires backend + test image)
- ✅ File validation UI
- 🚧 Figma extraction flow (requires backend + Figma credentials)
- 🚧 Token editing and persistence
- 🚧 Export functionality (JSON, CSS, Tailwind)
- 🚧 Error handling and recovery
- 🚧 Confidence score display

#### Pattern Selection (Epic 3)
- ✅ Navigation flow through all workflow steps
- ✅ Pattern card display
- ✅ Pattern selection and highlighting
- ✅ Epic 2 → Epic 3 data flow
- ✅ Epic 3 → Epic 4 navigation
- ✅ Error states and recovery

#### Generation (Epic 4)
- ✅ Generation auto-trigger on page load
- ✅ Loading states and progress indicators
- ✅ Generated code rendering
- ✅ Metadata display
- ✅ Download functionality
- ✅ Error handling and recovery

---

## Specific Test Scenarios

### Test Epic 2 → Epic 3 Data Flow

```bash
# Backend
cd backend && source venv/bin/activate
pytest tests/integration/test_retrieval_pipeline.py::TestRetrievalPipelineIntegration::test_epic_2_to_epic_3_data_flow -v

# Frontend
cd app
npm run test:e2e -- pattern-selection.spec.ts -g "I2: should handle Epic 2"
```

### Test Epic 3 → Epic 4 Navigation

```bash
cd app
npm run test:e2e -- pattern-selection.spec.ts -g "I3: should support Epic 3"
```

### Test Error Handling

```bash
# Backend - Service unavailable
cd backend && source venv/bin/activate
pytest tests/integration/test_retrieval_pipeline.py::TestRetrievalPipelineIntegration::test_retrieval_pipeline_service_unavailable -v

# Frontend - Error states
cd app
npm run test:e2e -- pattern-selection.spec.ts -g "should handle error states"
```

### Test Performance (Latency)

```bash
# Backend
cd backend && source venv/bin/activate
pytest tests/integration/test_retrieval_pipeline.py::TestRetrievalPipelineIntegration::test_retrieval_latency_target -v

# Frontend
cd app
npm run test:e2e -- pattern-selection.spec.ts -g "should verify retrieval latency"
```

---

## Performance Testing

### Epic 4: Generation Performance

Tests generation latency against p50 ≤ 60s and p95 ≤ 90s targets.

```bash
cd backend
source venv/bin/activate

# Run all performance tests (SLOW - takes several minutes)
pytest tests/performance/test_generation_latency.py -v -s

# Run specific performance test
pytest tests/performance/test_generation_latency.py::TestGenerationPerformance::test_button_generation_performance -v -s

# Run only non-slow tests (excludes performance tests)
pytest tests/ -v -m "not slow"
```

**Expected Output:**

```
Running 20 iterations for shadcn-button...
  Iteration 1: 2500ms ✓
  Iteration 2: 2300ms ✓
  ...

============================================================
Performance Report: Button
============================================================
Iterations: 20
p50:        2350.0ms (target: ≤60000ms) ✓
p95:        2700.0ms (target: ≤90000ms) ✓
============================================================
```

**Performance Targets:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Total Latency (p50) | ≤60s (60000ms) | Validated ✓ |
| Total Latency (p95) | ≤90s (90000ms) | Validated ✓ |
| Pattern Parsing | <100ms | Informational |
| Token Injection | <50ms | Informational |
| Tailwind Generation | <30ms | Informational |
| Code Assembly | <2s (2000ms) | Informational |

---

## LangSmith Trace Validation

Validates that all generation stages are properly traced in LangSmith.

```bash
cd backend
source venv/bin/activate

# Ensure environment variables are set
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=your-api-key
export LANGCHAIN_PROJECT=componentforge-dev

# Run trace validation
python scripts/validate_traces.py
```

**Expected Output:**

```
==================================================================
LANGSMITH TRACE VALIDATION
==================================================================

✅ LangSmith tracing initialized
   Project: componentforge-dev

✅ Generation completed successfully
   Total latency: 2500ms

🔍 Validating trace hierarchy...

Expected trace hierarchy:
  1. parsing
  2. injecting
  3. generating
  4. implementing
  5. assembling

✅ Trace hierarchy structure validated
✅ All expected stages traced

==================================================================
📊 VIEW TRACES IN LANGSMITH
==================================================================

Visit: https://smith.langchain.com
Project: componentforge-dev

Expected trace structure:
  📦 generate (root)
    ├─ 🔍 parsing
    ├─ 💉 injecting
    ├─ ⚡ generating
    ├─ 🛠️  implementing
    └─ 🏗️  assembling
==================================================================
```

**What to Check in LangSmith UI:**

1. **Trace Hierarchy**: Verify parent-child relationships between stages
2. **Trace Metadata**: Check latency, token_count, component_name, pattern_id
3. **Trace Timing**: Verify stage latencies match expected ranges
4. **Trace Tags**: Check for proper tagging (pattern_id, success/failure)

---

## Test Structure Patterns

Integration tests follow this pattern:

```python
class TestFeatureIntegration:
    """Integration tests for Feature X."""

    @pytest.fixture
    def client(self):
        """Create FastAPI test client."""
        return TestClient(app)

    @pytest.fixture
    def sample_data(self):
        """Create sample test data."""
        return {...}

    def test_complete_workflow(self, client, sample_data):
        """Test end-to-end workflow."""
        # 1. Setup
        # 2. Execute
        # 3. Assert
        pass
```

---

## Mocking Strategy

Integration tests use `unittest.mock` to isolate external dependencies:

- **Retrieval Service**: Mocked with realistic responses
- **OpenAI API**: Mocked to avoid API calls
- **Qdrant**: Mocked vector database operations
- **Database**: Can use in-memory SQLite for testing

Example:

```python
from unittest.mock import Mock, AsyncMock, patch

@pytest.fixture
def mock_service(self):
    service = Mock()
    service.method = AsyncMock(return_value={...})
    return service

def test_with_mock(self, client, mock_service):
    with patch.object(app.state, 'service', mock_service):
        response = client.post("/api/endpoint", json={...})
        assert response.status_code == 200
```

---

## Troubleshooting

### Backend Import Errors

```bash
# Ensure you're in the backend directory
cd backend
# Activate virtual environment
source venv/bin/activate
# Install dependencies
pip install -r requirements.txt
```

### Frontend: Playwright Not Installed

```bash
cd app
npx playwright install --with-deps chromium
```

### Frontend: API Not Mocked

Tests should work without backend running. If you see real API calls:
- Check mock is set up correctly in test file
- Ensure `page.route()` is called before `page.goto()`

### Backend: Mock Errors

```python
# Use AsyncMock for async functions
service.async_method = AsyncMock(return_value=...)

# Use Mock for sync functions
service.sync_method = Mock(return_value=...)

# Patch at the right location (where it's used, not where it's defined)
with patch('src.api.routes.retrieval.service', mock_service):
    ...
```

### Performance Tests Take Too Long

```bash
# Run only fast tests
pytest tests/ -v -m "not slow"

# Or reduce iterations (modify test file)
iterations=5  # Instead of 20
```

### LangSmith Validation Fails

**Issue**: Tracing not configured

**Solution**:
```bash
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=your-api-key
export LANGCHAIN_PROJECT=componentforge-dev
```

**Issue**: No traces visible in UI

**Solution**: Wait a few minutes for traces to propagate, then refresh LangSmith UI

---

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  backend-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: |
          cd backend
          pip install -r requirements.txt
          pytest tests/integration/ -v

  frontend-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: |
          cd app
          npm ci
          npx playwright install --with-deps
          npm run test:e2e

  performance:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: |
          cd backend
          pip install -r requirements.txt
          pytest tests/performance/test_generation_latency.py -v -s
```

---

## Best Practices

### ✅ Do

- Test complete user workflows
- Use realistic test data
- Mock external services
- Test error cases and edge cases
- Keep tests independent (no shared state)
- Use descriptive test names
- Add comments for complex setup

### ❌ Don't

- Test implementation details
- Rely on external services in tests
- Share state between tests
- Create brittle tests (too many mocks)
- Skip error handling tests
- Commit failing tests

---

## Adding New Tests

1. Create test file: `test_<feature>_integration.py`
2. Follow the test class structure above
3. Use fixtures for common setup
4. Mock external dependencies
5. Test complete workflows, not individual functions
6. Add docstrings explaining what flow is tested
7. Run tests locally before committing

---

## Test Coverage Goals

- **Integration Tests**: ≥70% coverage of integration workflows
- **Critical Paths**: 100% coverage of main user flows
- **Error Handling**: All error cases tested

Run coverage report:

```bash
pytest tests/integration/ --cov=src --cov-report=term-missing
```

---

## See Also

- [Manual Testing Checklist](./manual-testing.md)
- [Quick Test Reference](./reference.md)
- [Testing Overview](./README.md)
- [Backend Documentation](../../backend/docs/README.md)
- [Playwright Documentation](https://playwright.dev/)
- [LangSmith Documentation](https://docs.smith.langchain.com/)
