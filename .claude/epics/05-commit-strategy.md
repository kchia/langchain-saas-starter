# Epic 5: Commit Strategy & Git Workflow

**Epic**: Extended Quality Validation & Accessibility Testing
**Status**: Ready to Start
**Last Updated**: 2025-01-08

---

## Overview

This document provides a detailed commit strategy for Epic 5 implementation. Follow these guidelines to maintain clean git history, enable effective code review, and support easy rollback if needed.

---

## General Commit Principles

### ✅ Good Commit Practices

1. **Atomic Commits**: One logical change per commit
2. **Descriptive Messages**: Clear, concise commit messages following convention
3. **Tested Code**: Only commit code that passes local tests
4. **Incremental Progress**: Commit frequently (multiple times per day)
5. **Proper Scope**: Use conventional commit types (feat, fix, test, refactor, docs)

### ❌ Avoid

1. **WIP Commits**: Use feature branches and draft PRs instead
2. **"Fixed it" Messages**: Be specific about what was fixed
3. **Large Commits**: Break down into smaller, reviewable chunks
4. **Mixing Concerns**: Keep feature commits separate from refactoring
5. **Skipping Tests**: Always ensure tests pass before committing

---

## Commit Message Format

### Template

```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding or updating tests
- `refactor`: Code restructuring without behavior change
- `docs`: Documentation changes
- `chore`: Build, dependencies, or tooling

### Scopes for Epic 5
- `validation`: General validation infrastructure
- `a11y`: Accessibility validation
- `keyboard`: Keyboard navigation validation
- `focus`: Focus indicator validation
- `contrast`: Color contrast validation
- `tokens`: Token adherence validation
- `reports`: Quality report generation
- `integration`: Integration between validators
- `auto-fix`: Auto-fix functionality

---

## Frontend Tasks (F1-F6)

### 🎨 Task F1: Shared Types & Infrastructure

**Branch**: `feat/epic5-f1-validation-types`

**Commit Strategy**: 3-4 commits

```
Commit 1: feat(validation): create validation service directory structure
- Add app/src/services/validation/ directory
- Add __tests__/ subdirectory
- Add .gitkeep files for organization

Commit 2: feat(validation): add shared validation types
- Define ValidationResult interface
- Define A11yViolation type
- Define KeyboardIssue type
- Define FocusIssue type
- Define ContrastViolation type
- Define TokenViolation type
- Define AutoFixResult type
- Add comprehensive JSDoc comments

Commit 3: feat(validation): add WCAG utility functions
- Implement color conversion utilities
- Add contrast ratio calculation (WCAG 2.1)
- Add relative luminance calculation
- Add color parsing utilities
- Include unit tests for all utilities

Commit 4: feat(validation): add validation exports and Playwright config
- Create index.ts with all exports
- Add Playwright test configuration for validators
- Update tsconfig.json if needed
- Add validation service documentation
```

**Pull Request**: `Epic 5 Task F1: Shared Validation Types & Infrastructure`

**PR Description Template**:
```markdown
## Summary
Implements shared types and utilities for Epic 5 validation infrastructure.

## Changes
- ✅ Created `app/src/services/validation/` directory
- ✅ Defined 7 shared validation types
- ✅ Implemented WCAG utility functions (contrast, luminance)
- ✅ Setup Playwright configuration for validators
- ✅ Added comprehensive unit tests (coverage: XX%)

## Testing
- Unit tests: `npm test -- validation/utils`
- Type checks: `npm run type-check`
- All tests passing ✅

## Dependencies
- None (foundation task)

## Next Steps
- Task F2: axe-core Accessibility Validator

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

### 🎨 Task F2: axe-core Accessibility Validator

**Branch**: `feat/epic5-f2-axe-core-validator`

**Commit Strategy**: 4-5 commits

```
Commit 1: feat(a11y): create axe-core validator class skeleton
- Add A11yValidator class with validate() method
- Implement browser launch/close lifecycle
- Add basic error handling
- Setup TypeScript types for axe-core

Commit 2: feat(a11y): implement test page generation
- Add createTestPage() method
- Support component variants rendering
- Include React UMD bundle loading
- Add axe-core CDN injection

Commit 3: feat(a11y): implement axe-core test execution
- Run axe.run() in browser context
- Collect violations by severity
- Format results into ValidationResult
- Add proper cleanup on errors

Commit 4: feat(a11y): add violation processing and reporting
- Implement processResults() method
- Format violations with remediation info
- Distinguish blocking vs warning violations
- Add severity-based categorization

Commit 5: test(a11y): add comprehensive axe-core validator tests
- Test violation detection
- Test critical violations block delivery
- Test all variants are tested
- Test report format correctness
- Mock Playwright browser interactions
```

**Pull Request**: `Epic 5 Task F2: axe-core Accessibility Validator`

**PR Description Template**:
```markdown
## Summary
Implements axe-core accessibility validator using Playwright for Epic 5.

## Changes
- ✅ Created `a11y-validator.ts` with full implementation
- ✅ Renders components in headless browser
- ✅ Runs axe-core audit on all variants
- ✅ Blocks delivery on critical/serious violations
- ✅ Provides remediation guidance

## Testing
- Unit tests: `npm test -- a11y-validator.test.ts`
- Integration tests: Tested with Button, Card, Input components
- Test coverage: XX%
- All tests passing ✅

## Dependencies
- ✅ Task F1 (Shared Types)
- Uses: `@playwright/test`, `@axe-core/react`

## Validation Metrics
- Critical violations: 0 allowed ❌
- Serious violations: 0 allowed ❌
- Moderate violations: Warning only ⚠️
- Performance: <2s per component ✅

## Next Steps
- Task F3: Keyboard Navigation Validator

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

### 🎨 Task F3: Keyboard Navigation Validator

**Branch**: `feat/epic5-f3-keyboard-validator`

**Commit Strategy**: 3-4 commits

```
Commit 1: feat(keyboard): create keyboard validator class
- Add KeyboardValidator class
- Implement browser setup/teardown
- Add test page generation

Commit 2: feat(keyboard): implement Tab navigation testing
- Add testTabNavigation() method
- Verify focus behavior
- Test tab order for multiple elements
- Track focusable elements

Commit 3: feat(keyboard): implement activation key testing
- Add testActivation() method for Enter/Space
- Test button activation
- Test link activation
- Add click event listeners

Commit 4: feat(keyboard): implement escape key and tests
- Add testEscapeKey() for dismissible components
- Test modal/dialog/dropdown escape behavior
- Add comprehensive unit tests
- Include edge case handling
```

**Pull Request**: `Epic 5 Task F3: Keyboard Navigation Validator`

---

### 🎨 Task F4: Focus Indicator Validator

**Branch**: `feat/epic5-f4-focus-validator`

**Commit Strategy**: 3 commits

```
Commit 1: feat(focus): create focus validator with visibility checks
- Add FocusValidator class
- Implement focus detection via keyboard.press('Tab')
- Check outline/box-shadow styles
- Detect missing focus indicators

Commit 2: feat(focus): add contrast ratio calculation for focus indicators
- Implement checkFocusContrast() method
- Extract indicator colors from computed styles
- Calculate contrast ratio (≥3:1 required)
- Report insufficient contrast

Commit 3: test(focus): add focus indicator validator tests
- Test focus indicator detection
- Test contrast calculation accuracy
- Test missing indicator reporting
- Mock computed styles
```

**Pull Request**: `Epic 5 Task F4: Focus Indicator Validator`

---

### 🎨 Task F5: Color Contrast Validator

**Branch**: `feat/epic5-f5-contrast-validator`

**Commit Strategy**: 4 commits

```
Commit 1: feat(contrast): create contrast validator class
- Add ContrastValidator class
- Setup Playwright browser integration
- Add color extraction skeleton

Commit 2: feat(contrast): implement WCAG contrast calculation
- Add calculateContrastRatio() method
- Implement relative luminance calculation
- Support RGB color parsing
- Add getRequiredRatio() for context types

Commit 3: feat(contrast): add color pair extraction and validation
- Extract text/background color pairs
- Test all component states (default, hover, focus, disabled)
- Report violations with actual vs required ratios
- Generate fix suggestions

Commit 4: test(contrast): add comprehensive contrast tests
- Test WCAG AA standards enforcement
- Test ratio calculations accuracy
- Test violation detection
- Test fix suggestions validity
```

**Pull Request**: `Epic 5 Task F5: Color Contrast Validator`

---

### 🎨 Task F6: Token Adherence Validator

**Branch**: `feat/epic5-f6-token-validator`

**Commit Strategy**: 4 commits

```
Commit 1: feat(tokens): create token validator class
- Add TokenValidator class
- Setup token extraction infrastructure
- Define token categories (colors, typography, spacing)

Commit 2: feat(tokens): implement color adherence checking
- Add checkColorAdherence() method
- Implement ΔE color difference calculation (CIEDE2000)
- Allow ≤2.0 tolerance
- Track matches vs total

Commit 3: feat(tokens): add typography and spacing adherence
- Implement checkTypographyAdherence()
- Implement checkSpacingAdherence()
- Calculate per-category scores
- Compute overall adherence (≥90% target)

Commit 4: test(tokens): add token validator tests
- Test token extraction accuracy
- Test adherence calculation
- Test ΔE tolerance (≤2.0)
- Test overall score computation
```

**Pull Request**: `Epic 5 Task F6: Token Adherence Validator`

---

## Backend Tasks (B1)

### 🔧 Task B1: Quality Report Generator

**Branch**: `feat/epic5-b1-quality-reports`

**Commit Strategy**: 4-5 commits

```
Commit 1: feat(reports): create quality report generator class
- Add backend/src/validation/ directory
- Create QualityReportGenerator class
- Define report schema (JSON structure)
- Add timestamp and metadata handling

Commit 2: feat(reports): implement report data aggregation
- Add generate() method
- Aggregate Epic 4.5 results (TS, ESLint)
- Aggregate Epic 5 results (A11y, Keyboard, Focus, Contrast, Tokens)
- Combine auto-fix summaries

Commit 3: feat(reports): add status determination logic
- Implement determineStatus() method
- Check critical validations (TS, ESLint, A11y)
- Verify token adherence ≥90%
- Return PASS/FAIL with reasoning

Commit 4: feat(reports): implement HTML report generation
- Create Jinja2 template (quality_report.html)
- Add visualizations (charts, badges)
- Include recommendations section
- Support responsive design

Commit 5: test(reports): add report generator tests
- Test JSON report generation
- Test HTML report generation
- Test status determination accuracy
- Test with various validation scenarios
```

**Pull Request**: `Epic 5 Task B1: Quality Report Generator`

**PR Description Template**:
```markdown
## Summary
Implements comprehensive quality report generation for Epic 5 validation results.

## Changes
- ✅ Created `backend/src/validation/report_generator.py`
- ✅ Created HTML template with Jinja2
- ✅ Aggregates Epic 4.5 + Epic 5 results
- ✅ Determines overall PASS/FAIL status
- ✅ Exports JSON and HTML formats
- ✅ Includes visualizations and recommendations

## Testing
- Unit tests: `pytest backend/tests/validation/test_report_generator.py -v`
- Integration tests: Tested with real validation results
- Test coverage: XX%
- All tests passing ✅

## Dependencies
- ✅ Task F2-F6 (Frontend validators)
- Uses: Jinja2, FastAPI

## Report Features
- Overall status: PASS/FAIL
- TypeScript + ESLint results
- Accessibility audit summary
- Keyboard/Focus/Contrast results
- Token adherence score
- Auto-fix summary
- Downloadable HTML/JSON

## Next Steps
- Task I1: Integration & Extended Auto-Fix

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Integration Tasks (I1)

### 🔗 Task I1: Extended Auto-Fix & Integration

**Branch**: `feat/epic5-i1-integration-autofix`

**Commit Strategy**: 5-6 commits

```
Commit 1: feat(integration): create extended auto-fixer class
- Add app/src/services/validation/auto-fixer.ts
- Define ExtendedAutoFixer class
- Setup integration with Epic 4.5 auto-fix
- Define fix tracking structure

Commit 2: feat(auto-fix): implement accessibility fixes
- Add fixA11y() method
- Fix missing aria-label violations
- Fix button-name violations
- Track fixes applied

Commit 3: feat(auto-fix): implement token replacement fixes (optional)
- Add fixTokens() method
- Replace hardcoded colors with CSS variables
- Track token replacements
- Calculate fix success rate

Commit 4: feat(integration): integrate validators with Epic 4.5 CodeValidator
- Modify backend/src/generation/code_validator.py
- Add _validate_a11y(), _validate_keyboard(), _validate_focus()
- Add _validate_contrast(), _validate_tokens()
- Call via Node.js subprocess or API

Commit 5: feat(integration): add validation results to generation API
- Modify backend/src/api/v1/routes/generation.py
- Include validation_results in response
- Add quality_report field
- Support validation blocking on critical violations

Commit 6: test(integration): add end-to-end integration tests
- Test complete validation flow (Epic 4.5 + Epic 5)
- Test auto-fix resolves common issues
- Test validation results in API response
- Test quality report generation
```

**Pull Request**: `Epic 5 Task I1: Integration & Extended Auto-Fix`

**PR Description Template**:
```markdown
## Summary
Integrates Epic 5 validators with Epic 4.5 CodeValidator and extends auto-fix capabilities.

## Changes

### Frontend
- ✅ Created `auto-fixer.ts` with extended fix logic
- ✅ Adds missing ARIA labels automatically
- ✅ Fixes button-name violations
- ✅ Replaces hardcoded values with CSS variables (optional)

### Backend
- ✅ Modified `code_validator.py` to call Epic 5 validators
- ✅ Modified `generation.py` API to include validation results
- ✅ Integrated quality report generation
- ✅ Added validation blocking for critical violations

## Testing
- Frontend tests: `npm test -- auto-fixer.test.ts`
- Backend tests: `pytest backend/tests/validation/test_integration.py -v`
- E2E tests: `npm run test:e2e -- validation/`
- Test coverage: XX%
- All tests passing ✅

## Dependencies
- ✅ Task F1-F6 (All frontend validators)
- ✅ Task B1 (Quality report generator)
- ✅ Epic 4.5 Task 2 (Code Validator)

## Integration Points
- Epic 4.5 validation (TS + ESLint) → Epic 5 validators (A11y + Tokens)
- Combined results → Quality report
- Auto-fix: Epic 4.5 fixes + Epic 5 fixes

## Performance
- Total validation time: <15s target
- Epic 4.5: ~5s
- Epic 5: ~10s
- Auto-fix success rate: ≥80% target

## Next Steps
- Task T1-T3: Comprehensive testing
- Frontend UI integration (future)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Testing Tasks (T1-T3)

### 🧪 Task T1: Frontend Validator Tests

**Branch**: `test/epic5-t1-frontend-tests`

**Commit Strategy**: 6 commits (one per validator)

```
Commit 1: test(a11y): add comprehensive axe-core validator tests
- Unit tests for A11yValidator
- Mock Playwright browser
- Test violation detection
- Test severity categorization

Commit 2: test(keyboard): add keyboard navigation validator tests
- Unit tests for KeyboardValidator
- Test Tab navigation
- Test activation keys (Enter/Space)
- Test Escape key behavior

Commit 3: test(focus): add focus indicator validator tests
- Unit tests for FocusValidator
- Test focus detection
- Test contrast calculation
- Test missing indicator reporting

Commit 4: test(contrast): add color contrast validator tests
- Unit tests for ContrastValidator
- Test WCAG calculations
- Test violation detection
- Test fix suggestions

Commit 5: test(tokens): add token adherence validator tests
- Unit tests for TokenValidator
- Test token extraction
- Test adherence calculation
- Test ΔE tolerance

Commit 6: test(validation): add integration tests and performance benchmarks
- Integration tests with real components
- Performance benchmarks (<2s per validator)
- Edge case handling tests
- Coverage report (target: ≥90%)
```

**Pull Request**: `Epic 5 Task T1: Frontend Validator Tests`

---

### 🧪 Task T2: Backend Integration Tests

**Branch**: `test/epic5-t2-backend-tests`

**Commit Strategy**: 2-3 commits

```
Commit 1: test(reports): add quality report generator tests
- Test JSON report generation
- Test HTML report generation
- Test status determination
- Test with various validation scenarios

Commit 2: test(integration): add Epic 4.5 + Epic 5 integration tests
- Test complete validation pipeline
- Test validator calls from CodeValidator
- Test API response includes validation results
- Test validation blocking works

Commit 3: test(integration): add performance and load tests
- Test validation under load
- Test concurrent validation requests
- Test timeout handling
- Test error recovery
```

**Pull Request**: `Epic 5 Task T2: Backend Integration Tests`

---

### 🧪 Task T3: End-to-End Tests

**Branch**: `test/epic5-t3-e2e-tests`

**Commit Strategy**: 3 commits

```
Commit 1: test(e2e): add accessibility validation E2E tests
- Test complete generation → validation flow
- Test with all pattern types (Button, Card, Input, etc.)
- Test validation blocking on critical violations
- Test auto-fix scenarios

Commit 2: test(e2e): add quality reporting E2E tests
- Test quality report generation
- Test report download (JSON/HTML)
- Test report displays correct metrics
- Test frontend UI displays validation results

Commit 3: test(e2e): add performance and edge case E2E tests
- Test validation completes in <15s
- Test error handling (network failures, timeouts)
- Test with complex components
- Test with multiple variants
```

**Pull Request**: `Epic 5 Task T3: End-to-End Tests`

---

## Pull Request Strategy

### PR Size Guidelines

- **Small PRs**: <300 lines changed (preferred)
- **Medium PRs**: 300-600 lines changed
- **Large PRs**: >600 lines (avoid if possible, split into smaller PRs)

### PR Review Process

1. **Self-Review**: Review your own PR before requesting review
2. **Draft PRs**: Use for work-in-progress to get early feedback
3. **Request Review**: Tag relevant team members
4. **CI/CD**: Ensure all checks pass
5. **Address Feedback**: Respond to all comments
6. **Squash & Merge**: Use for clean history

### PR Checklist

```markdown
## PR Checklist

- [ ] Code follows project style guidelines
- [ ] All tests passing locally
- [ ] New tests added for new functionality
- [ ] Documentation updated (if needed)
- [ ] No console.log or debug code
- [ ] TypeScript types properly defined (no 'any')
- [ ] Error handling implemented
- [ ] Performance tested (<2s for validators, <15s total)
- [ ] Accessibility tested (for UI changes)
- [ ] Self-reviewed the code
```

---

## Branch Management

### Branch Naming Convention

```
<type>/<epic>-<task>-<description>

Examples:
- feat/epic5-f1-validation-types
- feat/epic5-f2-axe-core-validator
- test/epic5-t1-frontend-tests
- fix/epic5-f2-browser-cleanup
```

### Branch Lifecycle

1. **Create**: Branch off `main` (or `develop` if using git-flow)
2. **Develop**: Make commits following strategy above
3. **Push**: Push to remote frequently
4. **PR**: Open PR when ready for review
5. **Review**: Address feedback, make changes
6. **Merge**: Squash & merge to keep history clean
7. **Delete**: Delete branch after merge

### Long-Running Feature Branch

For Epic 5, consider using a long-running feature branch:

```
feat/epic5-quality-validation
```

**Strategy**:
1. Create Epic 5 feature branch off `main`
2. Merge task branches (F1, F2, etc.) into Epic 5 branch
3. Keep Epic 5 branch up-to-date with `main` via regular merges
4. Final PR: Epic 5 → `main` when all tasks complete

**Benefits**:
- Isolates Epic 5 work from main
- Allows testing full integration before merge to main
- Easy to rollback entire epic if needed

---

## Merge Strategy

### Option 1: Task-by-Task Merge (Recommended)

**Workflow**:
```
main
  ├── feat/epic5-f1-validation-types → PR → merge to main
  ├── feat/epic5-f2-axe-core-validator → PR → merge to main
  ├── feat/epic5-f3-keyboard-validator → PR → merge to main
  └── ... (continue for all tasks)
```

**Pros**:
- ✅ Incremental progress visible in main
- ✅ Smaller, easier-to-review PRs
- ✅ Each task can be deployed independently
- ✅ Easy to identify which task introduced issues

**Cons**:
- ⚠️ Main may be incomplete until Epic 5 finishes
- ⚠️ Requires feature flags for incomplete features

### Option 2: Feature Branch Merge

**Workflow**:
```
main
  └── feat/epic5-quality-validation
        ├── feat/epic5-f1-validation-types → PR → merge to epic5
        ├── feat/epic5-f2-axe-core-validator → PR → merge to epic5
        ├── feat/epic5-f3-keyboard-validator → PR → merge to epic5
        └── ... (continue for all tasks)

After all tasks complete:
feat/epic5-quality-validation → PR → merge to main
```

**Pros**:
- ✅ Main stays stable
- ✅ Full epic reviewed as one unit
- ✅ Easy to test complete integration

**Cons**:
- ⚠️ Large final PR (harder to review)
- ⚠️ Merge conflicts if main diverges
- ⚠️ Delayed visibility of progress

**Recommendation**: Use **Option 1** with feature flags

---

## Continuous Integration

### CI/CD Checks (Per PR)

```yaml
# .github/workflows/epic5-validation.yml

name: Epic 5 Validation CI

on:
  pull_request:
    paths:
      - 'app/src/services/validation/**'
      - 'backend/src/validation/**'
      - 'backend/src/generation/code_validator.py'

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd app && npm ci
      - run: cd app && npm run type-check
      - run: cd app && npm test -- services/validation
      - run: cd app && npm run lint

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && pytest tests/validation/ -v
      - run: cd backend && mypy src/validation/

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    steps:
      - uses: actions/checkout@v3
      - run: docker-compose up -d
      - run: cd app && npm run test:e2e -- validation/
```

### Pre-commit Hooks

```bash
# .husky/pre-commit

#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run type check
cd app && npm run type-check

# Run linting
cd app && npm run lint

# Run affected tests
cd app && npm test -- --bail --findRelatedTests

echo "✅ Pre-commit checks passed"
```

---

## Rollback Strategy

### If Task Needs Rollback

```bash
# Option 1: Revert the merge commit
git revert -m 1 <merge-commit-hash>

# Option 2: Create fix PR
# (Preferred - preserves history)
git checkout -b fix/epic5-f2-revert-changes
# Make fixes
git commit -m "fix(a11y): revert problematic changes from F2"
# Create PR
```

### If Entire Epic Needs Rollback

```bash
# If using feature branch (Option 2)
# Simply don't merge epic5 branch to main

# If using task-by-task (Option 1)
# Revert commits in reverse order
git revert <latest-epic5-commit>
git revert <previous-epic5-commit>
# ... continue until all reverted
```

---

## Git History Examples

### Good History (Task-by-Task)

```
* abc1234 (main) feat(integration): integrate validators with Epic 4.5 (#45)
* def5678 feat(reports): add quality report generator (#44)
* ghi9012 feat(tokens): implement token adherence validator (#43)
* jkl3456 feat(contrast): implement color contrast validator (#42)
* mno7890 feat(focus): implement focus indicator validator (#41)
* pqr1234 feat(keyboard): implement keyboard navigation validator (#40)
* stu5678 feat(a11y): implement axe-core accessibility validator (#39)
* vwx9012 feat(validation): add shared validation types (#38)
```

### Good History (Feature Branch)

```
* abc1234 (main) feat(epic5): complete quality validation & accessibility testing (#50)
|
| (All Epic 5 work in single PR)
|
* xyz7890 (main) Previous commit
```

---

## Communication

### Commit Message Keywords

Use these in commit messages for automatic issue tracking:

- `Closes #123`: Closes issue #123
- `Fixes #123`: Fixes bug #123
- `Relates to #123`: Related to issue #123
- `Part of #123`: Part of larger issue #123

### Example

```
feat(a11y): implement axe-core validator

- Add A11yValidator class with validate() method
- Implement test page generation for variants
- Run axe.run() in browser context
- Format results with severity categorization

Closes #123
Part of Epic 5 (#100)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Summary

### Commit Counts by Category

| Category | Tasks | Est. Commits | PRs |
|----------|-------|--------------|-----|
| **Frontend** | F1-F6 | 18-22 | 6 |
| **Backend** | B1 | 4-5 | 1 |
| **Integration** | I1 | 5-6 | 1 |
| **Testing** | T1-T3 | 11 | 3 |
| **Total** | **11 tasks** | **38-44** | **11** |

### Timeline

**Week 1-2**: Frontend validators (F1-F6) - 6 PRs
**Week 3**: Backend + Integration (B1, I1) - 2 PRs
**Week 4**: Testing (T1-T3) - 3 PRs

**Total**: 11 PRs over 3-4 weeks

---

## Best Practices Checklist

### Before Each Commit
- [ ] Tests pass locally
- [ ] Code linted and formatted
- [ ] No debug code or console.log
- [ ] Types properly defined
- [ ] Documentation updated

### Before Each PR
- [ ] Branch up-to-date with main
- [ ] All commits follow convention
- [ ] PR description complete
- [ ] Self-reviewed code
- [ ] CI checks passing

### After PR Merge
- [ ] Delete feature branch
- [ ] Update project board
- [ ] Notify team
- [ ] Update documentation (if needed)

---

**Last Updated**: 2025-01-08
**Version**: 1.0
**Maintained By**: Epic 5 Team
