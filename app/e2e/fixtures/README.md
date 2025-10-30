# E2E Test Fixtures

This directory contains test fixtures for E2E integration tests.

## Required Fixtures

To run the full integration test suite, you need to add:

### 1. Test Images

- **design-system-sample.png**: A sample screenshot of a design system showing colors, typography, and spacing
  - Should be a real design system screenshot (e.g., Material Design, Tailwind palette)
  - Size: Under 10MB
  - Format: PNG or JPEG
  - Should contain visible design tokens

### 2. Figma Test Data

For Figma integration tests, you'll need:
- A valid Figma Personal Access Token (set as environment variable `TEST_FIGMA_PAT`)
- A Figma file URL with published styles (set as environment variable `TEST_FIGMA_URL`)

## Creating Test Fixtures

### Design System Screenshot

You can create a test screenshot by:
1. Taking a screenshot of a public design system (e.g., https://tailwindcss.com/docs/customizing-colors)
2. Creating a simple design in Figma with colors, fonts, and spacing
3. Using a sample from https://www.figma.com/community/file/1234567890/design-system-template

Save as `design-system-sample.png` in this directory.

### Environment Variables

Create a `.env.test` file in the `app` directory:

```bash
# Figma test credentials
TEST_FIGMA_PAT=your-figma-personal-access-token
TEST_FIGMA_URL=https://www.figma.com/file/your-file-key/your-file-name

# Backend URL (if running backend separately)
PLAYWRIGHT_BASE_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/onboarding.spec.ts

# Run in UI mode for debugging
npx playwright test --ui

# Run with specific browser
npx playwright test --project=chromium
```

## Test Coverage

- ✅ **onboarding.spec.ts**: Onboarding modal functionality (TASK 13.4, 13.5)
- 🚧 **token-extraction.spec.ts**: Screenshot/Figma extraction flows (TASK 12.2, 12.3, 13.1, 13.2, 13.3)
  - Many tests are marked `.skip()` and require backend integration
  - Remove `.skip()` and add test data to enable full tests

## Notes

- Tests marked with `.skip()` require a running backend and test data
- Update tests with actual selectors based on final UI implementation
- Add more fixtures as needed for edge cases and different design systems
