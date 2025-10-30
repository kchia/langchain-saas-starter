# Epic 5 Validation Tests

This directory contains comprehensive tests for Epic 5: Extended Quality Validation & Accessibility Testing.

## Test Structure

### Task T1: Frontend Validator Tests
**Location**: `app/src/services/validation/__tests__/`

- `auto-fixer.test.ts` - Auto-fix functionality tests (260 lines, 20+ tests)
- `a11y-validator.test.ts` - Accessibility validation tests (140 lines, 8+ tests)
- `keyboard-validator.test.ts` - Keyboard navigation tests (80 lines, 5+ tests)
- `focus-validator.test.ts` - Focus indicator tests (90 lines, 5+ tests)
- `contrast-validator.test.ts` - Color contrast tests (110 lines, 6+ tests)
- `token-validator.test.ts` - Token adherence tests (210 lines, 9+ tests)
- `integration.test.ts` - Integration tests (existing)
- `utils.test.ts` - Utility function tests (existing)

**Total**: 8 test files, 50+ test cases

### Task T2: Backend Integration Tests
**Location**: `backend/tests/validation/`

- `test_report_generator.py` - Quality report generation tests (existing, 40+ tests)
- `test_integration.py` - Epic 4.5 + Epic 5 integration tests (NEW, 30+ tests)

**Total**: 2 test files, 70+ test cases

### Task T3: End-to-End Tests
**Location**: `app/e2e/validation/`

- `a11y-validation.spec.ts` - Accessibility validation E2E (8 tests)
- `quality-reporting.spec.ts` - Quality report display E2E (10 tests)
- `integration.spec.ts` - Complete workflow E2E (10 tests)

**Total**: 3 test files, 28 test cases

## Running Tests

### Frontend Tests

```bash
# Run all validation tests
cd app
npm test -- services/validation

# Run specific test file
npm test -- auto-fixer.test.ts

# Run with coverage
npm test -- --coverage services/validation

# Watch mode
npm test -- --watch services/validation
```

### Backend Tests

```bash
# Run all validation tests
cd backend
source venv/bin/activate
pytest tests/validation/ -v

# Run specific test file
pytest tests/validation/test_integration.py -v

# Run with coverage
pytest tests/validation/ --cov=src/validation --cov-report=term-missing
```

### E2E Tests

```bash
# Run all E2E validation tests
cd app
npm run test:e2e -- e2e/validation/

# Run specific E2E test
npm run test:e2e -- e2e/validation/a11y-validation.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- e2e/validation/ --headed

# Debug mode
npm run test:e2e -- e2e/validation/ --debug
```

## Test Coverage Goals

- **Frontend validators**: ≥90% code coverage
- **Backend integration**: ≥80% code coverage
- **E2E tests**: Cover all critical user workflows

## Test Categories

### Unit Tests
- Test individual validator functions
- Test utility functions (WCAG calculations, color math)
- Test auto-fix logic
- Mock browser interactions

### Integration Tests
- Test Epic 4.5 + Epic 5 validator integration
- Test quality report generation with all validators
- Test frontend-backend bridge
- Test API integration

### E2E Tests
- Test complete user workflows
- Test UI interactions
- Test validation blocking
- Test auto-fix user flow
- Test report downloads
- Performance validation (<15s target)

## Performance Benchmarks

Each test suite includes performance tests:

- **Individual validators**: <2s per validator
- **Total validation**: <15s (Epic 4.5: ~5s + Epic 5: ~10s)
- **Report generation**: <1s

## Edge Cases Tested

- Empty/invalid component code
- Components with multiple violations
- Components with no violations
- Missing design tokens
- Browser launch failures
- Timeout scenarios
- JSON parse errors
- Network failures

## Continuous Integration

Tests run automatically on:
- Pull requests to main branch
- Commits to Epic 5 feature branches
- Nightly builds

## Test Data

Sample components and design tokens are defined in:
- `app/e2e/fixtures/` - E2E test fixtures
- `app/src/services/validation/__tests__/` - Unit test samples

## Debugging Tests

### Frontend
```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test
npm test -- -t "should fix button-name violations"
```

### Backend
```bash
# Run with pytest verbose mode
pytest tests/validation/ -vv

# Run with debugging on failure
pytest tests/validation/ --pdb
```

### E2E
```bash
# Run with trace viewer
npm run test:e2e -- e2e/validation/ --trace on

# Then view trace
npx playwright show-trace trace.zip
```

## Contributing

When adding new validators:

1. Add unit tests to `__tests__/validator-name.test.ts`
2. Add integration tests to `__tests__/integration.test.ts`
3. Add E2E tests to `e2e/validation/`
4. Ensure ≥90% coverage
5. Include performance benchmarks
6. Test edge cases

## Related Documentation

- [Epic 5 Specification](../../../.claude/epics/05-quality-validation.md)
- [Testing Overview](../../../docs/testing/README.md)
- [Integration Testing Guide](../../../docs/testing/integration-testing.md)
- [Manual Testing Checklist](../../../docs/testing/manual-testing.md)
