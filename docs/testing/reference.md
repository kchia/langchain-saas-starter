# Quick Test Reference - Epic 3 Integration Tests

## 🚀 Quick Start

### Run All Integration Tests
```bash
# Backend
cd backend && source venv/bin/activate && pytest tests/integration/test_retrieval_pipeline.py -v

# Frontend
cd app && npm run test:e2e -- pattern-selection.spec.ts
```

## 🎯 Specific Test Scenarios

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

### Test Accessibility
```bash
cd app
npm run test:e2e -- pattern-selection.spec.ts -g "Accessibility"
```

## 🐛 Debugging

### Backend Debug Mode
```bash
cd backend && source venv/bin/activate

# Show print statements
pytest tests/integration/test_retrieval_pipeline.py -v -s

# Drop into debugger on failure
pytest tests/integration/test_retrieval_pipeline.py -v --pdb

# Run specific test in debug mode
pytest tests/integration/test_retrieval_pipeline.py::TestRetrievalPipelineIntegration::test_retrieval_pipeline_e2e -v -s --pdb
```

### Frontend Debug Mode
```bash
cd app

# UI mode (best for debugging)
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through)
npm run test:e2e:debug

# Debug specific test
npx playwright test pattern-selection.spec.ts -g "should load and display" --debug
```

## 📊 Coverage Reports

### Backend Coverage
```bash
cd backend && source venv/bin/activate
pytest tests/integration/test_retrieval_pipeline.py -v --cov=src --cov-report=html
# Open htmlcov/index.html
```

### Frontend Screenshots
```bash
cd app
npm run test:e2e -- pattern-selection.spec.ts
# Screenshots in test-results/pattern-selection-*.png
```

## 🔍 Common Issues

### Backend: Import Errors
```bash
cd backend
source venv/bin/activate  # Ensure venv is activated
pip install -r requirements.txt  # Ensure dependencies installed
export PYTHONPATH=$PWD/src  # If still having issues
```

### Frontend: API Not Mocked
```bash
# Tests should work without backend running
# If you see real API calls, check:
# - Mock is set up correctly in test file
# - page.route() is called before page.goto()
```

### Frontend: Playwright Not Installed
```bash
cd app
npx playwright install --with-deps chromium
```

## 📝 Test File Locations

```
backend/tests/integration/
  └── test_retrieval_pipeline.py    # Backend integration tests

app/e2e/
  └── pattern-selection.spec.ts     # Frontend E2E tests

.github/workflows/
  └── integration-tests.yml         # CI/CD workflow
```

## 📖 Documentation

- **Main Guide**: `EPIC_3_INTEGRATION_TESTING.md`
- **Summary**: `EPIC_3_INTEGRATION_TESTING_SUMMARY.md`
- **Backend README**: `backend/tests/integration/README.md`
- **E2E README**: `app/e2e/README.md`

## ✅ Success Criteria Checklist

Run this to verify everything works:

```bash
# 1. Backend integration tests pass
cd backend && source venv/bin/activate
pytest tests/integration/test_retrieval_pipeline.py -v
echo "✅ Backend tests: $?"

# 2. Frontend E2E tests pass
cd ../app
npm run test:e2e -- pattern-selection.spec.ts
echo "✅ Frontend tests: $?"

# 3. All tests covered
echo "Total backend tests: 9 (expected)"
echo "Total frontend tests: 11 (expected)"
```

## 🎨 Visual Verification

After running E2E tests, check screenshots:
```bash
cd app/test-results
ls -la pattern-selection-*.png

# You should see:
# - pattern-selection-01-loaded.png
# - pattern-selection-02-selected.png
# - pattern-selection-03-generation.png
# - pattern-selection-04-error.png
# - pattern-selection-05-empty.png
# - pattern-selection-06-code-preview.png
# - pattern-selection-07-highlights.png
```

## 🚨 CI/CD

Tests run automatically on GitHub Actions:
- Push to main/develop
- Pull requests to main/develop

View results: Actions tab → Integration Tests workflow

## 💡 Pro Tips

1. **Run E2E in UI mode first** - easier to see what's happening
   ```bash
   npm run test:e2e:ui
   ```

2. **Use test filters** - run specific tests faster
   ```bash
   pytest -k "latency" -v  # Backend
   npx playwright test -g "error"  # Frontend
   ```

3. **Check screenshots** - if E2E test fails, screenshots show what went wrong
   ```bash
   open app/test-results/pattern-selection-*.png
   ```

4. **Use coverage reports** - see what's tested
   ```bash
   pytest --cov=src --cov-report=term-missing
   ```

5. **Parallel execution** - run tests faster
   ```bash
   pytest -n auto  # Requires pytest-xdist
   npx playwright test --workers 4
   ```
