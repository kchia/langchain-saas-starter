# Backend Integration Tests

This directory contains integration tests that test complete workflows and multi-component interactions.

## Test Files

### `test_token_extraction.py`
Tests the complete token extraction and export flow from Epic 1.

**Coverage**:
- Screenshot → Tokens → JSON Export
- Screenshot → Tokens → CSS Export
- Figma → Tokens → Export
- Manual token override → Export
- Export format compatibility

### `test_retrieval_pipeline.py` (Epic 3 - T5)
Tests the complete pattern retrieval pipeline from Epic 3.

**Coverage**:
- End-to-end retrieval flow (requirements → API → patterns)
- Response validation and data structure
- Pattern ranking and confidence scoring
- Match highlights (props, variants, accessibility)
- Retrieval metadata (latency, methods, weights)
- Validation errors and error handling
- Performance metrics (latency <1000ms target)
- Data flow: Epic 2 → Epic 3 → Epic 4

## Running Tests

### All Integration Tests
```bash
cd backend
source venv/bin/activate
pytest tests/integration/ -v
```

### Specific Test File
```bash
cd backend
source venv/bin/activate
pytest tests/integration/test_retrieval_pipeline.py -v
```

### With Coverage
```bash
cd backend
source venv/bin/activate
pytest tests/integration/ -v --cov=src --cov-report=html
# Open htmlcov/index.html to view coverage report
```

### Debug Mode
```bash
cd backend
source venv/bin/activate
pytest tests/integration/test_retrieval_pipeline.py -v -s  # Show print statements
pytest tests/integration/test_retrieval_pipeline.py -v --pdb  # Drop into debugger on failure
```

## Test Structure

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

## CI/CD Integration

These tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

See `.github/workflows/integration-tests.yml` for configuration.

## Adding New Tests

1. Create test file: `test_<feature>_integration.py`
2. Follow the test class structure above
3. Use fixtures for common setup
4. Mock external dependencies
5. Test complete workflows, not individual functions
6. Add docstrings explaining what flow is tested
7. Run tests locally before committing

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

## Troubleshooting

### Import Errors
```bash
# Ensure you're in the backend directory
cd backend
# Activate virtual environment
source venv/bin/activate
# Install dependencies
pip install -r requirements.txt
```

### Mock Errors
```python
# Use AsyncMock for async functions
service.async_method = AsyncMock(return_value=...)

# Use Mock for sync functions
service.sync_method = Mock(return_value=...)

# Patch at the right location
# Patch where it's used, not where it's defined
with patch('src.api.routes.retrieval.service', mock_service):
    ...
```

### Test Isolation
```python
# Use setUp/tearDown or fixtures
@pytest.fixture(autouse=True)
def reset_state(self):
    # Setup
    yield
    # Teardown - runs after each test
```

## Related Documentation

- [Integration Testing Guide](../../docs/testing/integration-testing.md) - Complete integration testing guide
- [Manual Testing Checklist](../../docs/testing/manual-testing.md) - Manual test procedures
- [Quick Test Reference](../../docs/testing/reference.md) - Quick command reference
- [03-pattern-retrieval-tasks.md](../../.claude/epics/03-pattern-retrieval-tasks.md) - Task breakdown
- [pytest documentation](https://docs.pytest.org/)
- [FastAPI testing](https://fastapi.tiangolo.com/tutorial/testing/)

## Test Coverage Goals

- **Integration Tests**: ≥70% coverage of integration workflows
- **Critical Paths**: 100% coverage of main user flows
- **Error Handling**: All error cases tested

Run coverage report:
```bash
pytest tests/integration/ --cov=src --cov-report=term-missing
```
