# Testing Documentation

Testing guides and references for ComponentForge.

## Contents

- [Testing Overview](./overview.md) - Testing strategy and approach
- [Integration Testing](./integration-testing.md) - API and service integration tests
- [E2E Testing](./e2e-testing.md) - End-to-end Playwright tests
- [Manual Testing](./manual-testing.md) - Manual test checklist
- [Testing Reference](./reference.md) - Quick reference for running tests

## Quick Reference

```bash
# Run all tests
make test

# Backend tests only
cd backend && source venv/bin/activate && pytest tests/ -v

# Frontend unit tests
cd app && npm test

# E2E tests with Playwright
cd app && npm run test:e2e

# Accessibility tests
cd app && npm run test:a11y
```

## Test Coverage

- Backend API endpoints (pytest)
- AI agent workflows (LangChain mocks)
- Frontend components (Jest + React Testing Library)
- E2E user flows (Playwright)
- Accessibility compliance (axe-core)

See [Testing Overview](./overview.md) for comprehensive testing strategy.
