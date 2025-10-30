# E2E Tests

This directory contains end-to-end integration tests for the Component Forge application.

## Test Files

### `onboarding.spec.ts` ✅
Tests for Epic 11 TASK 13.4 and 13.5 - Onboarding Modal

**Status:** Ready to run
**Requirements:** None (frontend only tests)

Tests:
- Modal shows on first visit
- Modal does NOT show on subsequent visits  
- Workflow selection saves preference and navigates
- Skip button functionality
- Workflow card content display

### `token-extraction.spec.ts` 🚧
Tests for Epic 11 TASK 12.2-12.8 and TASK 13.1-13.3 - Token Extraction Integration

**Status:** Partially implemented (many tests marked `.skip()`)
**Requirements:** Backend running + test fixtures

Tests:
- Screenshot extraction end-to-end
- Figma extraction end-to-end
- Token editing flow
- Export functionality
- Error handling
- Confidence score integration
- Complete integration flows

### `requirements-flow.spec.ts` ✅
Tests for Epic 2 - Requirements Flow Integration

**Status:** Complete
**Requirements:** Backend running + test fixtures

Tests:
- Extract → Requirements → Export flow
- AI proposal auto-trigger
- ApprovalPanel rendering
- Requirements editing and export

### `pattern-selection.spec.ts` ✅ **NEW**
Tests for Epic 3 - Pattern Selection Flow Integration (Tasks I1, I2, I3, T5)

**Status:** Complete
**Requirements:** None (uses mocked API)

Tests:
- **I1**: Frontend-Backend API Integration
  - Pattern retrieval results display
  - Top-3 patterns rendering
  - Confidence scores visibility
  - Retrieval metadata display
- **T5**: Pattern Selection Workflow
  - Pattern selection interaction
  - Single pattern selection constraint
  - Zustand store persistence
  - Selection persistence across refresh
- **I2**: Epic 2 → Epic 3 Data Flow
  - Requirements usage from Epic 2
  - Requirements transformation
- **I3**: Epic 3 → Epic 4 Navigation
  - Navigation to generation page
  - Pattern data passing to Epic 4
- **T5**: Error Handling
  - Error state display
  - Retry mechanism
  - Empty results handling
- **T5**: UI Features
  - Code preview modal
  - Match highlights display
  - Latency display and validation
- **Accessibility**
  - Keyboard navigation
  - Enter key selection

## Running Tests

### Prerequisites

1. **Install dependencies:**
   ```bash
   cd app
   npm install
   ```

2. **For onboarding tests only:**
   ```bash
   npm run test:e2e e2e/onboarding.spec.ts
   ```

3. **For full integration tests:**
   - Start backend and services: `make dev`
   - Add test fixtures (see `fixtures/README.md`)
   - Set environment variables in `.env.test`

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode (recommended for debugging)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/onboarding.spec.ts

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### CI Mode

Tests automatically run in CI with:
- Headless mode
- Retry on failure (2 retries)
- HTML reporter
- Trace collection on failure

## Test Configuration

See `playwright.config.ts` for:
- Browser configuration (Chromium, Firefox, WebKit)
- Base URL configuration
- Timeout settings
- Reporter configuration
- Web server auto-start

## Environment Variables

Create `.env.test` in the `app` directory:

```bash
# Frontend URL
PLAYWRIGHT_BASE_URL=http://localhost:3000

# Backend URL
BACKEND_URL=http://localhost:8000

# Figma test credentials (for Figma integration tests)
TEST_FIGMA_PAT=your-figma-personal-access-token
TEST_FIGMA_URL=https://www.figma.com/file/your-file-key/your-file-name
```

## Test Data

Add test fixtures to `fixtures/` directory:
- `design-system-sample.png` - Screenshot of a design system
- See `fixtures/README.md` for details

## Enabling Skipped Tests

Many tests in `token-extraction.spec.ts` are marked with `.skip()` because they require:
1. Running backend with all services
2. Test fixture files
3. Environment variables

To enable a test:
1. Remove `.skip()` from the test
2. Ensure prerequisites are met
3. Update selectors if UI has changed

Example:
```typescript
// Before
test.skip('TASK 12.4: edit colors and verify updates persist', async ({ page }) => {
  // test code
});

// After
test('TASK 12.4: edit colors and verify updates persist', async ({ page }) => {
  // test code
});
```

## Debugging Tests

### UI Mode (Recommended)
```bash
npm run test:e2e:ui
```
This opens an interactive UI where you can:
- See test execution in real-time
- Inspect each step
- Debug failed tests
- Re-run specific tests

### Debug Mode
```bash
npm run test:e2e:debug
```
Opens Playwright Inspector for step-by-step debugging.

### Screenshots and Videos

Playwright automatically:
- Takes screenshots on failure
- Records traces for retried tests
- Saves artifacts to `test-results/`

### View Test Report

After running tests:
```bash
npx playwright show-report
```

## Test Coverage

### TASK 13.4 & 13.5: Onboarding Modal ✅
- [x] 8 tests implemented and ready to run
- [x] No backend required
- [x] Tests first-time user experience
- [x] Tests workflow selection and persistence

### TASK 12 & 13: Token Extraction 🚧
- [x] Test structure created for all requirements
- [ ] Requires backend integration
- [ ] Requires test fixtures
- [ ] Many tests marked `.skip()`

## Related Documentation

- `../../INTEGRATION_TESTING.md` - Complete implementation guide
- `../../MANUAL_TEST_CHECKLIST.md` - Manual testing checklist
- `../../scripts/test-api-integration.sh` - API integration tests
- `fixtures/README.md` - Test fixtures guide

## Troubleshooting

### Tests fail to start
- Ensure frontend dev server is running: `npm run dev`
- Or let Playwright start it automatically (configured in `playwright.config.ts`)

### "Page didn't load" errors
- Check that `http://localhost:3000` is accessible
- Verify no other process is using port 3000

### Selector not found
- UI may have changed - update selectors in test file
- Use Playwright Inspector to find correct selectors: `npm run test:e2e:debug`

### Timeout errors
- Increase timeout in `playwright.config.ts`
- Or in specific test: `test.setTimeout(60000)`

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Keep tests independent** - each test should work in isolation
3. **Clean up state** - use `beforeEach` to reset localStorage, cookies, etc.
4. **Use page object pattern** for complex UIs
5. **Mock external APIs** when possible to reduce flakiness

## Contributing

When adding new tests:
1. Follow existing test structure and naming
2. Add clear descriptions and comments
3. Mark tests with `.skip()` if they require backend
4. Update this README with new test coverage
5. Ensure tests pass locally before committing

## Questions?

See:
- Playwright docs: https://playwright.dev/
- Epic 11 specification: `../../.claude/epics/11-expanded-design-tokens.md`
- CLAUDE.md for project conventions
