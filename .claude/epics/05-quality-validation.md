# Epic 5: Extended Quality Validation & Accessibility Testing

**Status**: Ready to Start ✅ (Epic 4.5 Task 2 Complete as of 2025-01-08)
**Priority**: Critical
**Epic Owner**: QA/Frontend Team
**Estimated Tasks**: 7 (reduced from 9 - see integration notes)
**Estimated Timeline**: 3-4 weeks
**Depends On**:
- ✅ Epic 4 (Code Generation) - COMPLETE
- ✅ **Epic 4.5 Task 2** (Code Validator with TypeScript/ESLint validation) - COMPLETE ✅

**Integration Note**: This epic **extends** Epic 4.5's validation infrastructure with comprehensive accessibility testing, keyboard navigation, color contrast validation, and token adherence measurement.

---

## Status Summary (2025-01-08)

### 🎯 Epic is Ready to Start!

**Dependencies**: ✅ All satisfied
- ✅ Epic 4.5 Task 2 (Code Validator) completed and verified working
- ✅ TypeScript + ESLint validation operational
- ✅ LLM-based fix loop with max 2 retries functional
- ✅ `@playwright/test` and `@axe-core/react` available in package.json

**Implementation Status**:
- ✅ Foundation complete (Epic 4.5 Task 2)
- ⏳ Epic 5 Tasks 1-7: Ready to begin (0 of 7 complete)
- 📍 **Next Action**: Create `app/src/services/validation/` directory and start Task 1

**No blockers** - Can start implementation immediately.

### 📦 What Needs to Be Built

```
Epic 5: Extended Quality Validation
├── 🎨 FRONTEND (TypeScript)
│   ├── F1: Shared Types & Infrastructure [1 day] ⭐
│   ├── F2: axe-core Accessibility [3-4 days] ⭐
│   ├── F3: Keyboard Navigation [2-3 days]
│   ├── F4: Focus Indicator [2 days]
│   ├── F5: Color Contrast [2-3 days]
│   └── F6: Token Adherence [2-3 days]
│
├── 🔧 BACKEND (Python)
│   └── B1: Quality Reports [2-3 days]
│
├── 🔗 INTEGRATION (TS + Python)
│   └── I1: Integration + Auto-Fix [3-4 days] ⭐
│
└── 🧪 TESTING (All)
    ├── T1: Frontend Tests [2-3 days]
    ├── T2: Backend Tests [1-2 days]
    └── T3: E2E Tests [1-2 days]

Total: ~20-25 days | Team: 4 developers
```

---

## 📖 Document Navigation

**Quick Links**:
- [Task Summary](#task-overview) - Overview of all 7 tasks organized by category
- [Frontend Tasks (F1-F6)](#-frontend-tasks-typescriptplaywright) - 6 frontend validators
- [Backend Task (B1)](#-backend-tasks-python) - Quality report generator
- [Integration Task (I1)](#-integration-tasks-frontend--backend) - Auto-fix & integration
- [Testing Tasks (T1-T3)](#-testing-tasks) - Comprehensive testing
- [Task Dependencies](#task-dependencies) - Visual dependency graph
- [Team Allocation](#team-allocation) - Who does what
- [Implementation Details](#implementation-details) - Code examples
- [Current Status](#current-implementation-status-2025-01-08) - What's done vs what's needed

**Start Here**: 👉 [Tasks by Category](#tasks-by-category)

---

## Overview

**IMPORTANT**: Epic 4.5 Task 2 already provides TypeScript and ESLint validation with auto-fix and retry logic. Epic 5 **extends** this foundation with:

1. **Accessibility Testing** (axe-core, keyboard navigation, focus indicators)
2. **Color Contrast Validation** (WCAG AA compliance)
3. **Token Adherence Measurement** (≥90% target)
4. **Extended Auto-Fix Logic** (accessibility and token fixes)
5. **Comprehensive Quality Reporting** (all validation results)

**What Epic 4.5 Task 2 Already Provides:**
- ✅ TypeScript strict compilation validation (`backend/scripts/validate_typescript.js`)
- ✅ ESLint validation (`backend/scripts/validate_eslint.js`)
- ✅ Auto-fix with max 2 retries
- ✅ Quality scoring (compilation, linting, type safety)
- ✅ LLM-based error correction

**What Epic 5 Adds:**
- ✨ axe-core accessibility audit (0 critical violations)
- ✨ Keyboard navigation testing (Tab, Enter, Escape, Arrows)
- ✨ Focus indicator validation (≥3:1 contrast)
- ✨ Color contrast checking (WCAG AA: 4.5:1 text, 3:1 UI)
- ✨ Token adherence meter (colors, typography, spacing)
- ✨ Extended auto-fixes (ARIA labels, color adjustments)
- ✨ Unified quality reports (all metrics in one place)

**Architecture Note**: Epic 5 validators run in the **frontend** using existing Next.js/TypeScript tooling and integrate with Epic 4.5's validation pipeline. Backend stores results and generates reports.

---

## Goals

**Foundation (Epic 4.5 Task 2):**
1. ✅ TypeScript strict compilation (handled by Epic 4.5)
2. ✅ ESLint and Prettier validation (handled by Epic 4.5)
3. ✅ Basic auto-fix with retry logic (handled by Epic 4.5)

**Epic 5 Extensions:**
4. Execute axe-core accessibility testing (0 critical violations)
5. Test keyboard navigation and focus management
6. Verify focus indicators are visible
7. Check color contrast compliance (WCAG AA)
8. Calculate token adherence meter (≥90% target)
9. Extend auto-fix with accessibility and token fixes
10. Generate comprehensive quality reports (integrate all validation)

---

## Success Criteria

**From Epic 4.5 Task 2 (Foundation):**
- ✅ TypeScript strict compilation succeeds (Epic 4.5)
- ✅ ESLint validation passes with zero errors (Epic 4.5)
- ✅ Prettier formatting verified (Epic 4.5)
- ✅ Basic auto-fix resolves TS/ESLint issues (Epic 4.5)

**Epic 5 Extensions:**
- ✅ axe-core audit shows 0 critical violations (required)
- ✅ 0 serious violations (required)
- ✅ Keyboard navigation works (Tab, Enter, Space, Escape)
- ✅ Focus indicators visible with ≥3:1 contrast
- ✅ Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- ✅ Token adherence ≥90% (colors, typography, spacing)
- ✅ Extended auto-fix resolves 80%+ of accessibility/token issues
- ✅ Unified quality report generated with all metrics (TS + ESLint + A11y + Tokens)
- ✅ Extended validation completes in <15s (Epic 4.5: ~5s + Epic 5: ~10s)

---

## Wireframe

### Interactive Prototype
**View HTML:** [component-preview-page.html](../wireframes/component-preview-page.html) *(shares same page with Epic 4, validation section)*

![Component Preview Page - Validation](../wireframes/screenshots/04-component-preview-desktop.png)

### Key UI Elements

**Validation Progress** (Runs after generation)
- Progress bar with validation stages
  - TypeScript Compilation → Task 1
  - ESLint & Prettier → Task 2
  - axe-core A11y Test → Task 3
  - Keyboard Navigation → Task 4
  - Focus Indicators → Task 5
  - Color Contrast → Task 6
  - Token Adherence → Task 7
- Auto-fix indicator → Task 8: Auto-Fix & Retry Logic
- Elapsed time (target: <10s)

**Quality Scorecard** (Top summary)
- Overall status: PASS / FAIL
- Critical checks:
  - ✓ TypeScript: Compiled successfully
  - ✓ ESLint: 0 errors, 2 warnings
  - ✓ Accessibility: 0 critical/serious violations
  - ✓ Token Adherence: 94%
- Auto-fixes applied: 3 issues resolved

**Validation Results** (Tabbed sections)

**TypeScript Tab** → Task 1: TypeScript Compilation Check
- Compilation status
- Errors/warnings with line numbers
- Type coverage report
- Auto-fixes applied (unused imports removed)

**Code Quality Tab** → Task 2: ESLint & Prettier Validation
- ESLint results by severity
- Prettier formatting status
- Auto-fixed issues list

**Accessibility Tab** → Task 3, 4, 5, 6
- axe-core audit summary → Task 3: axe-core Accessibility Testing
  - 0 critical violations ✓
  - 0 serious violations ✓
  - 2 moderate issues (warnings only)
- Keyboard navigation results → Task 4: Keyboard Navigation Testing
  - Tab order visualization
  - Enter/Space activation test
- Focus indicators → Task 5: Focus Indicator Validation
  - Contrast ratio: 3.2:1 ✓
  - Visibility check passed
- Color contrast → Task 6: Color Contrast Validation
  - All text: 4.8:1 (WCAG AA ✓)
  - UI components: 3.5:1 ✓
  - Violations: None

**Token Adherence Tab** → Task 7: Token Adherence Meter
- Overall score: 94% ✓ (target: ≥90%)
- By category:
  - Colors: 96% (23/24 matches)
  - Typography: 95% (19/20 matches)
  - Spacing: 91% (21/23 matches)
- Violations list with expected vs actual
- ΔE tolerance visualization (≤2.0)

**Quality Report** → Task 9: Quality Report Generation
- Downloadable HTML/JSON report
- All metrics and details
- Timestamp and component metadata
- Recommendations for improvements

**Auto-Fix Summary** → Task 8: Auto-Fix & Retry Logic
- Issues automatically fixed: 3
  - Removed unused import (React)
  - Added aria-label to icon button
  - Formatted with Prettier
- Retry validation: Passed ✓
- Manual fixes needed: 0

**Action Buttons**
- "Download Report" (HTML/JSON)
- "Accept & Export Component"
- "Fix Issues Manually" (if validation failed)
- "Regenerate Component" (if major issues)

### User Flow
1. Validation starts automatically after code generation
2. Progress bar shows real-time validation stages
3. Auto-fix attempts to resolve common issues
4. Validation retries after auto-fixes
5. Quality scorecard displays overall status
6. User reviews detailed results by category
7. User downloads quality report
8. User accepts component (if PASS) or fixes issues (if FAIL)

**Validation Requirements:**
- **Blockers** (must pass):
  - TypeScript compilation
  - 0 critical/serious a11y violations
  - Token adherence ≥90%
- **Warnings** (allow but flag):
  - ESLint warnings
  - Moderate a11y issues
  - Minor token deviations

**Performance Display:**
- Validation latency (target: <10s)
- Auto-fix success rate (target: ≥80%)

**Quick Test:**
```bash
# View wireframe locally
open .claude/wireframes/component-preview-page.html
```

---

## Integration with Epic 4.5

**STATUS UPDATE (2025-01-08)**: ✅ Epic 4.5 Task 2 (Code Validator) is **COMPLETE**. Epic 5 is now ready to begin implementation.

### What Epic 4.5 Task 2 Provides (IMPLEMENTED ✅)

**File**: `backend/src/generation/code_validator.py`

**Functionality**:
```python
class CodeValidator:
    async def validate_and_fix(
        self,
        code: str,
        max_retries: int = 2
    ) -> ValidationResult:
        """Validate code, use LLM to fix if needed."""

        # Run validations in parallel
        ts_result, lint_result = await asyncio.gather(
            self._validate_typescript(code),  # via validate_typescript.js
            self._validate_eslint(code)        # via validate_eslint.js
        )

        if not valid:
            # Use LLM to fix errors
            code = await self._llm_fix_errors(code, errors)

        return ValidationResult(valid, code, quality_scores)
```

**Validation Scripts** (Node.js):
- `backend/scripts/validate_typescript.js` - TypeScript compilation check
- `backend/scripts/validate_eslint.js` - ESLint validation

**Epic 5 Integration Point**: Epic 5 validators will receive the validated code from Epic 4.5 and run additional checks (accessibility, tokens, etc.)

---

## Task Overview

**STATUS UPDATE (2025-01-08)**:
- ✅ Epic 4.5 Task 2 (Code Validator) is **COMPLETE** and verified working
- Epic 5 Tasks 1-7 are ready to begin implementation
- All dependencies are satisfied

**Total Tasks**: 7 (reduced from 9 after Epic 4.5 integration)

### 🔄 Task Naming Convention & Quick Reference

| Code | Task | What It Does | Priority | Est. |
|------|------|--------------|----------|------|
| **F1** | Shared Types | Create validation types & utilities | ⭐ P0 | 1d |
| **F2** | axe-core A11y | Run accessibility audit (0 critical violations) | ⭐ P0 | 3-4d |
| **F3** | Keyboard Nav | Test Tab, Enter, Escape, Arrow keys | P1 | 2-3d |
| **F4** | Focus Indicator | Verify focus indicators (≥3:1 contrast) | P1 | 2d |
| **F5** | Color Contrast | Check WCAG AA contrast (4.5:1 text, 3:1 UI) | P1 | 2-3d |
| **F6** | Token Adherence | Measure token usage (≥90% target) | P2 | 2-3d |
| **B1** | Quality Reports | Generate HTML/JSON reports | P1 | 2-3d |
| **I1** | Integration | Connect validators + extend auto-fix | ⭐ P0 | 3-4d |
| **T1** | Frontend Tests | Test validators (unit + integration) | P0 | 2-3d |
| **T2** | Backend Tests | Test reports + integration | P1 | 1-2d |
| **T3** | E2E Tests | Test full validation flow | P1 | 1-2d |

**Legend**: F=Frontend, B=Backend, I=Integration, T=Testing, P0=Critical, P1=High, P2=Medium

**Removed Tasks** (handled by Epic 4.5 ✅):
- ~~Task 1: TypeScript Validation~~ → Epic 4.5 Task 2 ✅
- ~~Task 2: ESLint Validation~~ → Epic 4.5 Task 2 ✅

---

## Tasks by Category

### 📊 Task Summary

| Category | Tasks | Files | Est. Time | Owner |
|----------|-------|-------|-----------|-------|
| **Frontend Validators** | 5 tasks | 6 files | 12-15 days | Frontend/QA Team |
| **Backend Reports** | 1 task | 1 file | 2-3 days | Backend Team |
| **Integration** | 1 task | 2 files | 3-4 days | Full-stack Team |
| **Testing** | All tasks | N/A | 4-5 days | QA Team |

---

### 🎨 FRONTEND TASKS (TypeScript/Playwright)
**Location**: `app/src/services/validation/`
**Technologies**: TypeScript, Playwright, @axe-core/react
**Owner**: Frontend/QA Team

#### Task F1: Shared Types & Infrastructure
**Priority**: P0 (Foundation)
**Estimated Time**: 1 day
**Dependencies**: None

**Acceptance Criteria**:
- [ ] Create `app/src/services/validation/` directory
- [ ] Create `types.ts` with shared interfaces:
  - `ValidationResult`
  - `A11yViolation`
  - `KeyboardIssue`
  - `FocusIssue`
  - `ContrastViolation`
  - `TokenViolation`
  - `AutoFixResult`
- [ ] Create `index.ts` with exports
- [ ] Setup Playwright test configuration for validators
- [ ] Add validator utilities (color math, contrast calculation)

**Files Created**:
```
app/src/services/validation/
├── types.ts           # Shared types
├── utils.ts           # Color math, WCAG formulas
├── index.ts           # Exports
└── __tests__/         # Test setup
    └── setup.ts
```

**Tests**:
- Test type definitions
- Test utility functions (color conversion, contrast ratios)

---

#### Task F2: axe-core Accessibility Validator
**Priority**: P0 (Critical)
**Estimated Time**: 3-4 days
**Dependencies**: F1

**Acceptance Criteria**:
- [ ] Create `a11y-validator.ts` using Playwright
- [ ] Render component in headless browser
- [ ] Run axe-core accessibility audit
- [ ] Test all component variants and states
- [ ] Report violations by severity (critical, serious, moderate, minor)
- [ ] Block component delivery on critical/serious violations
- [ ] Generate accessibility report with remediation steps

**Files**:
- `app/src/services/validation/a11y-validator.ts` (NEW)

**Tests**:
- Test axe-core detects violations
- Test critical violations block delivery
- Test all variants tested
- Test report format correct

---

#### Task F3: Keyboard Navigation Validator
**Priority**: P1
**Estimated Time**: 2-3 days
**Dependencies**: F1

**Acceptance Criteria**:
- [ ] Create `keyboard-validator.ts` using Playwright
- [ ] Test Tab key navigation through interactive elements
- [ ] Verify correct tab order
- [ ] Test Enter/Space activation for buttons
- [ ] Test Escape key for dismissible components
- [ ] Test Arrow keys for navigation (tabs, select, etc.)
- [ ] Verify focus trap for modals
- [ ] Ensure no keyboard traps
- [ ] Report keyboard navigation issues

**Files**:
- `app/src/services/validation/keyboard-validator.ts` (NEW)

**Tests**:
- Test Tab navigation works correctly
- Test Enter/Space activates elements
- Test Escape dismisses components
- Test keyboard traps detected

---

#### Task F4: Focus Indicator Validator
**Priority**: P1
**Estimated Time**: 2 days
**Dependencies**: F1

**Acceptance Criteria**:
- [ ] Create `focus-validator.ts` using Playwright
- [ ] Verify focus indicator is visible
- [ ] Check focus indicator contrast (≥3:1 against background)
- [ ] Test focus indicator on all interactive elements
- [ ] Verify focus-visible styles applied
- [ ] Check focus indicator is not removed with `outline: none`
- [ ] Ensure custom focus styles meet WCAG standards
- [ ] Test focus indicator in different states

**Files**:
- `app/src/services/validation/focus-validator.ts` (NEW)

**Tests**:
- Test focus indicators detected
- Test contrast ratio calculated correctly
- Test missing indicators reported

---

#### Task F5: Color Contrast Validator
**Priority**: P1
**Estimated Time**: 2-3 days
**Dependencies**: F1

**Acceptance Criteria**:
- [ ] Create `contrast-validator.ts` using Playwright
- [ ] Extract all text and UI element colors from component
- [ ] Calculate contrast ratios using WCAG formula
- [ ] Validate against WCAG AA standards:
  - Normal text: ≥4.5:1
  - Large text: ≥3:1
  - UI components: ≥3:1
- [ ] Test contrast in all states (default, hover, focus, disabled)
- [ ] Report violations with actual vs required ratios
- [ ] Suggest alternative colors that meet standards

**Files**:
- `app/src/services/validation/contrast-validator.ts` (NEW)

**Tests**:
- Test contrast ratios calculated correctly
- Test WCAG standards enforced
- Test violations detected accurately

---

#### Task F6: Token Adherence Validator
**Priority**: P2
**Estimated Time**: 2-3 days
**Dependencies**: F1

**Acceptance Criteria**:
- [ ] Create `token-validator.ts`
- [ ] Compare generated component against approved tokens
- [ ] Check token usage for:
  - Colors (all color values)
  - Typography (font family, sizes, weights)
  - Spacing (padding, margin, gap values)
- [ ] Calculate adherence percentage per category
- [ ] Calculate overall adherence score (≥90% target)
- [ ] Report non-compliant values with expected vs actual
- [ ] Allow tolerance for minor variations (ΔE ≤2 for colors)

**Files**:
- `app/src/services/validation/token-validator.ts` (NEW)

**Tests**:
- Test token extraction correct
- Test adherence calculated accurately
- Test ΔE tolerance works

---

### 🔧 BACKEND TASKS (Python)
**Location**: `backend/src/validation/`
**Technologies**: Python, FastAPI, Jinja2
**Owner**: Backend Team

#### Task B1: Quality Report Generator
**Priority**: P1
**Estimated Time**: 2-3 days
**Dependencies**: F2, F3, F4, F5, F6

**Acceptance Criteria**:
- [ ] Create `report_generator.py`
- [ ] Generate comprehensive quality report with:
  - Overall pass/fail status
  - TypeScript compilation result (from Epic 4.5)
  - ESLint/Prettier results (from Epic 4.5)
  - Accessibility audit summary
  - Keyboard navigation results
  - Focus indicator validation
  - Color contrast results
  - Token adherence score
  - Auto-fix summary
- [ ] Include visualizations (charts, badges)
- [ ] Export report in JSON and HTML formats
- [ ] Store report in database/S3 (optional)
- [ ] Track quality metrics over time

**Files**:
- `backend/src/validation/report_generator.py` (NEW)
- `backend/src/validation/templates/quality_report.html` (NEW - Jinja2)

**Tests**:
- Test reports generated correctly
- Test JSON and HTML formats valid
- Test status determination correct

---

### 🔗 INTEGRATION TASKS (Frontend + Backend)
**Location**: Multiple
**Technologies**: TypeScript + Python
**Owner**: Full-stack Team

#### Task I1: Extended Auto-Fix & Integration
**Priority**: P0 (Critical)
**Estimated Time**: 3-4 days
**Dependencies**: F2, F3, F4, F5, F6, B1

**Acceptance Criteria**:
- [ ] Create `auto-fixer.ts` in frontend (extends Epic 4.5 fixes)
- [ ] Integrate frontend validators with Epic 4.5 `CodeValidator`
- [ ] Extend auto-fix logic:
  - Accessibility: Add missing ARIA labels
  - Accessibility: Fix button-name violations
  - Token: Replace hardcoded values with CSS variables (optional)
- [ ] Track which issues were auto-fixed
- [ ] Report auto-fix success rate
- [ ] Generate diff showing changes
- [ ] Provide manual fix suggestions for unfixable issues
- [ ] Target: 80%+ auto-fix success rate (combined Epic 4.5 + Epic 5)
- [ ] Update backend to call frontend validators
- [ ] Integrate quality reports into generation response

**Files**:
- `app/src/services/validation/auto-fixer.ts` (NEW)
- `backend/src/generation/code_validator.py` (MODIFY - integrate Epic 5 validators)
- `backend/src/api/v1/routes/generation.py` (MODIFY - add validation results)

**Integration Points**:
```python
# backend/src/generation/code_validator.py
class CodeValidator:
    async def validate_and_fix(self, code: str) -> ValidationResult:
        # Existing Epic 4.5 validation (TypeScript + ESLint)
        ts_result, lint_result = await asyncio.gather(...)

        # NEW: Call Epic 5 validators via Node.js subprocess
        a11y_result = await self._validate_a11y(code)
        keyboard_result = await self._validate_keyboard(code)
        focus_result = await self._validate_focus(code)
        contrast_result = await self._validate_contrast(code)
        token_result = await self._validate_tokens(code)

        # Combined results
        return ValidationResult(...)
```

**Tests**:
- Test auto-fix resolves common issues
- Test integration with Epic 4.5 CodeValidator
- Test end-to-end validation flow
- Test fixes tracked correctly

---

### 🧪 TESTING TASKS
**Location**: `app/src/services/validation/__tests__/` and `backend/tests/validation/`
**Owner**: QA Team

#### Task T1: Frontend Validator Tests
**Priority**: P0
**Estimated Time**: 2-3 days
**Dependencies**: F2, F3, F4, F5, F6

**Acceptance Criteria**:
- [ ] Unit tests for each validator (F2-F6)
- [ ] Integration tests with real components
- [ ] Performance benchmarks (<2s per validator)
- [ ] Edge case handling tests
- [ ] Mock Playwright browser interactions
- [ ] Test coverage ≥90% for all validators

**Files**:
```
app/src/services/validation/__tests__/
├── a11y-validator.test.ts
├── keyboard-validator.test.ts
├── focus-validator.test.ts
├── contrast-validator.test.ts
├── token-validator.test.ts
├── auto-fixer.test.ts
└── integration.test.ts
```

---

#### Task T2: Backend Integration Tests
**Priority**: P1
**Estimated Time**: 1-2 days
**Dependencies**: B1, I1

**Acceptance Criteria**:
- [ ] Test report generation
- [ ] Test integration with Epic 4.5 CodeValidator
- [ ] Test end-to-end validation flow
- [ ] Test API responses include validation results
- [ ] Test performance under load

**Files**:
```
backend/tests/validation/
├── test_report_generator.py
└── test_integration.py
```

---

#### Task T3: End-to-End Tests
**Priority**: P1
**Estimated Time**: 1-2 days
**Dependencies**: All tasks

**Acceptance Criteria**:
- [ ] Test complete generation → validation → report flow
- [ ] Test with all pattern types (Button, Card, Input, etc.)
- [ ] Test validation blocking on critical violations
- [ ] Test auto-fix success scenarios
- [ ] Test quality report generation
- [ ] Test frontend UI displays results correctly
- [ ] Performance: Total validation <15s (Epic 4.5: ~5s + Epic 5: ~10s)

**Files**:
```
app/e2e/validation/
├── a11y-validation.spec.ts
├── quality-reporting.spec.ts
└── integration.spec.ts
```

---

## Task Dependencies

```
┌─────────────────────────────────────────────────────┐
│  WEEK 1: Foundation                                 │
│                                                     │
│  F1 (Types & Infrastructure) [1 day]               │
│         ↓                                           │
│  F2 (axe-core) [3-4 days]                          │
│                                                     │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│  WEEK 2: Accessibility Validators                   │
│                                                     │
│  F3 (Keyboard) [2-3 days] ─┐                       │
│  F4 (Focus) [2 days] ──────┤                       │
│                            ↓                        │
│                         T1 (Frontend Tests)         │
│                                                     │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│  WEEK 3: Contrast & Token Validators                │
│                                                     │
│  F5 (Contrast) [2-3 days] ─┐                       │
│  F6 (Token) [2-3 days] ────┤                       │
│                            ↓                        │
│                         B1 (Reports)                │
│                                                     │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│  WEEK 4: Integration & Testing                      │
│                                                     │
│  I1 (Integration + Auto-Fix) [3-4 days]            │
│         ↓                                           │
│  T2 (Backend Tests) [1-2 days] ─┐                  │
│  T3 (E2E Tests) [1-2 days] ─────┤                  │
│                                 ↓                   │
│                            ✅ DONE                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Critical Path

**Must complete in order**:
1. ⭐ **F1** (Types) - Blocks all frontend tasks
2. ⭐ **F2** (axe-core) - Highest priority validator
3. **F3-F6** (Other validators) - Can run in parallel after F1
4. **B1** (Reports) - Needs validator results
5. ⭐ **I1** (Integration) - Connects everything
6. **T1-T3** (Testing) - Validates implementation

**Total Critical Path**: ~13-17 days

---

## Parallel Work Opportunities

**Week 1**:
- F1 (Types) must complete first
- F2 (axe-core) can start immediately after F1

**Week 2** (Parallel tracks):
- Track A: F3 (Keyboard) + F4 (Focus)
- Track B: F5 (Contrast) + F6 (Token)
- Both tracks can run simultaneously

**Week 3**:
- B1 (Reports) can start as soon as validators are done
- T1 (Frontend tests) can run in parallel with B1

**Week 4**:
- I1 (Integration) must complete before T2/T3
- T2 and T3 can run in parallel after I1

---

## Team Allocation

### Frontend/QA Team (2 developers)
- **Developer 1**: F1, F2, F3 (Types, axe-core, Keyboard)
- **Developer 2**: F4, F5, F6 (Focus, Contrast, Token)
- **Both**: T1 (Frontend tests)

### Backend Team (1 developer)
- **Developer 1**: B1 (Report generator), T2 (Backend tests)

### Full-stack Team (1 developer)
- **Developer 1**: I1 (Integration), T3 (E2E tests)

**Total Team**: 4 developers (2 frontend, 1 backend, 1 full-stack)

---

## Implementation Details

> **Note**: This section provides detailed code examples and implementation patterns for reference. The actual task specifications are in the "Tasks by Category" section above.

### Code Examples by Task

#### Example: F2 - axe-core Accessibility Testing
**Acceptance Criteria**:
- [ ] Create `app/src/services/validation/a11y-validator.ts` using Playwright (already in `app/package.json`)
- [ ] Leverage existing `@axe-core/react` (already in `app/package.json`)
- [ ] Render component in headless browser using Playwright
- [ ] Run axe-core accessibility audit
- [ ] Test all component variants and states
- [ ] Report violations by severity:
  - Critical (0 allowed)
  - Serious (0 allowed)
  - Moderate (warn only)
  - Minor (warn only)
- [ ] Capture violation details:
  - Rule ID (e.g., `button-name`, `color-contrast`)
  - Impact level
  - Element selector
  - Fix suggestions from axe
- [ ] Block component delivery on critical/serious violations
- [ ] Generate accessibility report with remediation steps

**Files**:
- `app/src/services/validation/a11y-validator.ts` (NEW)
- `app/package.json` (EXISTING - has @axe-core/react, @playwright/test)

**axe-core Validation**:
```typescript
// app/src/services/validation/a11y-validator.ts
import { chromium, Browser, Page } from 'playwright';
import type { Result as AxeResults } from 'axe-core';
import type { ValidationResult, A11yViolation } from './types';

export class A11yValidator {
  private browser: Browser | null = null;

  async validate(
    componentCode: string,
    componentName: string,
    variants: string[] = ['default']
  ): Promise<ValidationResult> {
    try {
      this.browser = await chromium.launch({ headless: true });
      const page = await this.browser.newPage();

      // Create test page with component
      const html = this.createTestPage(componentCode, componentName, variants);
      await page.setContent(html);

      // Wait for React to render
      await page.waitForSelector('#root > *', { timeout: 5000 });

      // Inject axe-core
      await page.addScriptTag({
        url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.0/axe.min.js'
      });

      // Run axe accessibility tests
      const results = await page.evaluate(() => {
        return (window as any).axe.run();
      }) as AxeResults;

      await this.browser.close();
      this.browser = null;

      return this.processResults(results);
    } catch (error) {
      if (this.browser) {
        await this.browser.close();
      }
      throw error;
    }
  }

  private createTestPage(
    componentCode: string,
    componentName: string,
    variants: string[]
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A11y Test - ${componentName}</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${componentCode}

    // Render component variants for testing
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);

    root.render(
      React.createElement('div', null, [
        ${variants.map(variant => `
          React.createElement(${componentName}, {
            key: '${variant}',
            variant: '${variant}',
            children: '${variant} variant'
          })
        `).join(',\n')}
      ])
    );
  </script>
</body>
</html>
    `;
  }

  private processResults(results: AxeResults): ValidationResult {
    const violations = results.violations || [];

    const critical = violations.filter(v => v.impact === 'critical');
    const serious = violations.filter(v => v.impact === 'serious');
    const moderate = violations.filter(v => v.impact === 'moderate');
    const minor = violations.filter(v => v.impact === 'minor');

    const errors: A11yViolation[] = [
      ...this.formatViolations(critical, 'critical'),
      ...this.formatViolations(serious, 'serious')
    ];

    const warnings: A11yViolation[] = [
      ...this.formatViolations(moderate, 'moderate'),
      ...this.formatViolations(minor, 'minor')
    ];

    return {
      valid: errors.length === 0, // Block on critical/serious only
      errors,
      warnings,
      summary: {
        critical: critical.length,
        serious: serious.length,
        moderate: moderate.length,
        minor: minor.length,
        total: violations.length
      }
    };
  }

  private formatViolations(violations: any[], severity: string): A11yViolation[] {
    return violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n: any) => ({
        html: n.html,
        target: n.target,
        failureSummary: n.failureSummary
      })),
      severity
    }));
  }
}
```

**Tests**:
- axe-core detects violations
- Critical violations block delivery
- All variants tested
- Report format correct

---

#### Example: F3 - Keyboard Navigation Testing
**Acceptance Criteria**:
- [ ] Create `app/src/services/validation/keyboard-validator.ts` using Playwright
- [ ] Test Tab key navigation through interactive elements
- [ ] Verify correct tab order
- [ ] Test Enter/Space activation for buttons
- [ ] Test Escape key for dismissible components
- [ ] Test Arrow keys for navigation (tabs, select, etc.)
- [ ] Verify focus trap for modals
- [ ] Test skip links if present
- [ ] Ensure no keyboard traps
- [ ] Report keyboard navigation issues

**Files**:
- `app/src/services/validation/keyboard-validator.ts` (NEW)

**Keyboard Testing** (TypeScript):
```typescript
// app/src/services/validation/keyboard-validator.ts
import { chromium, Browser, Page } from 'playwright';
import type { ValidationResult, KeyboardIssue } from './types';

export class KeyboardValidator {
  private browser: Browser | null = null;

  async validate(
    componentCode: string,
    componentName: string,
    componentType: string
  ): Promise<ValidationResult> {
    try {
      this.browser = await chromium.launch({ headless: true });
      const page = await this.browser.newPage();

      const html = this.createTestPage(componentCode, componentName);
      await page.setContent(html);
      await page.waitForSelector('#root > *', { timeout: 5000 });

      const issues: KeyboardIssue[] = [];

      // Test Tab navigation
      const tabIssues = await this.testTabNavigation(page, componentType);
      issues.push(...tabIssues);

      // Test activation keys (Enter/Space)
      if (['button', 'link'].includes(componentType)) {
        const activationIssues = await this.testActivation(page);
        issues.push(...activationIssues);
      }

      // Test Escape for dismissible components
      if (['modal', 'dialog', 'dropdown'].includes(componentType)) {
        const escapeIssues = await this.testEscapeKey(page);
        issues.push(...escapeIssues);
      }

      await this.browser.close();
      this.browser = null;

      return {
        valid: issues.length === 0,
        errors: issues.filter(i => i.severity === 'critical'),
        warnings: issues.filter(i => i.severity === 'serious'),
        details: { issues }
      };
    } catch (error) {
      if (this.browser) {
        await this.browser.close();
      }
      throw error;
    }
  }

  private async testTabNavigation(
    page: Page,
    componentType: string
  ): Promise<KeyboardIssue[]> {
    const issues: KeyboardIssue[] = [];

    // Press Tab
    await page.keyboard.press('Tab');

    // Check if component received focus
    const focused = await page.evaluate(() => document.activeElement?.tagName);

    if (componentType === 'button' && focused !== 'BUTTON') {
      issues.push({
        type: 'tab_navigation',
        message: 'Button not focusable with Tab key',
        severity: 'critical'
      });
    }

    // Test tab order for multiple elements
    const focusableElements = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('button, a, input, select, textarea, [tabindex]')
      );
      return elements.length;
    });

    if (focusableElements > 1) {
      // Test sequential focus
      for (let i = 1; i < focusableElements; i++) {
        await page.keyboard.press('Tab');
      }
    }

    return issues;
  }

  private async testActivation(page: Page): Promise<KeyboardIssue[]> {
    const issues: KeyboardIssue[] = [];

    // Setup click listener
    await page.evaluate(() => {
      (window as any).clicked = false;
      document.activeElement?.addEventListener('click', () => {
        (window as any).clicked = true;
      });
    });

    // Test Enter key
    await page.keyboard.press('Enter');
    const enterClicked = await page.evaluate(() => (window as any).clicked);

    if (!enterClicked) {
      issues.push({
        type: 'keyboard_activation',
        message: 'Element not activated by Enter key',
        severity: 'serious'
      });
    }

    // Test Space key (for buttons)
    await page.evaluate(() => {
      (window as any).clicked = false;
    });
    await page.keyboard.press('Space');
    const spaceClicked = await page.evaluate(() => (window as any).clicked);

    if (!spaceClicked) {
      issues.push({
        type: 'keyboard_activation',
        message: 'Button not activated by Space key',
        severity: 'serious'
      });
    }

    return issues;
  }

  private async testEscapeKey(page: Page): Promise<KeyboardIssue[]> {
    const issues: KeyboardIssue[] = [];

    // Test Escape key dismisses component
    const initiallyVisible = await page.evaluate(() => {
      return document.querySelector('[role="dialog"]')?.getAttribute('aria-hidden') !== 'true';
    });

    if (initiallyVisible) {
      await page.keyboard.press('Escape');

      const afterEscape = await page.evaluate(() => {
        return document.querySelector('[role="dialog"]')?.getAttribute('aria-hidden') === 'true';
      });

      if (!afterEscape) {
        issues.push({
          type: 'escape_key',
          message: 'Dismissible component not closed by Escape key',
          severity: 'serious'
        });
      }
    }

    return issues;
  }

  private createTestPage(componentCode: string, componentName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Keyboard Test - ${componentName}</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${componentCode}
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(${componentName}));
  </script>
</body>
</html>
    `;
  }
}
```

**Tests**:
- Tab navigation works correctly
- Enter/Space activates elements
- Escape dismisses components
- Keyboard traps detected
- Focus order validated

---

#### Example: F4 - Focus Indicator Validation
**Acceptance Criteria**:
- [ ] Verify focus indicator is visible
- [ ] Check focus indicator contrast (≥3:1 against background)
- [ ] Test focus indicator on all interactive elements
- [ ] Verify focus-visible styles applied
- [ ] Check focus indicator is not removed with `outline: none`
- [ ] Ensure custom focus styles meet WCAG standards
- [ ] Test focus indicator in different states (hover, active)
- [ ] Report missing or insufficient focus indicators

**Files**:
- `app/src/services/validation/focus-validator.ts` (NEW)

**Focus Indicator Testing** (TypeScript):
```typescript
// app/src/services/validation/focus-validator.ts
import { chromium, Browser, Page } from 'playwright';
import type { ValidationResult, FocusIssue } from './types';

export class FocusValidator {
  private browser: Browser | null = null;

  async validate(
    componentCode: string,
    componentName: string
  ): Promise<ValidationResult> {
    try {
      this.browser = await chromium.launch({ headless: true });
      const page = await this.browser.newPage();

      const html = this.createTestPage(componentCode, componentName);
      await page.setContent(html);
      await page.waitForSelector('#root > *', { timeout: 5000 });

      // Focus element
      await page.keyboard.press('Tab');

      // Get computed styles
      const styles = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          outlineColor: computed.outlineColor,
          boxShadow: computed.boxShadow,
          backgroundColor: computed.backgroundColor
        };
      });

      const issues: FocusIssue[] = [];

      if (!styles) {
        issues.push({
          type: 'focus_failure',
          message: 'Could not focus any element',
          severity: 'critical'
        });
      } else {
        // Check for focus indicator
        const hasIndicator =
          styles.outlineWidth !== '0px' ||
          styles.boxShadow.includes('ring') ||
          styles.boxShadow !== 'none';

        if (!hasIndicator) {
          issues.push({
            type: 'missing_focus_indicator',
            message: 'No visible focus indicator detected',
            severity: 'critical'
          });
        }

        // Check contrast if indicator present
        if (hasIndicator) {
          const contrastIssues = await this.checkFocusContrast(page, styles);
          issues.push(...contrastIssues);
        }
      }

      await this.browser.close();
      this.browser = null;

      return {
        valid: issues.length === 0,
        errors: issues.filter(i => i.severity === 'critical'),
        warnings: issues.filter(i => i.severity === 'serious'),
        details: { styles, issues }
      };
    } catch (error) {
      if (this.browser) {
        await this.browser.close();
      }
      throw error;
    }
  }

  private async checkFocusContrast(
    page: Page,
    styles: any
  ): Promise<FocusIssue[]> {
    const issues: FocusIssue[] = [];

    // Extract colors from outline or box-shadow
    const indicatorColor = styles.outlineColor || this.extractShadowColor(styles.boxShadow);
    const backgroundColor = styles.backgroundColor;

    if (indicatorColor && backgroundColor) {
      const contrastRatio = this.calculateContrastRatio(indicatorColor, backgroundColor);

      if (contrastRatio < 3.0) {
        issues.push({
          type: 'insufficient_focus_contrast',
          message: `Focus indicator contrast ${contrastRatio.toFixed(2)}:1 is below 3:1 minimum`,
          severity: 'serious',
          actual: contrastRatio,
          required: 3.0
        });
      }
    }

    return issues;
  }

  private extractShadowColor(boxShadow: string): string | null {
    // Extract color from box-shadow (simplified)
    const match = boxShadow.match(/rgb\([^)]+\)/);
    return match ? match[0] : null;
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private getRelativeLuminance(color: string): number {
    // Parse RGB color
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return 0;

    const [, r, g, b] = match.map(Number);

    const adjust = (c: number) => {
      const val = c / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b);
  }

  private createTestPage(componentCode: string, componentName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Focus Test - ${componentName}</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${componentCode}
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(${componentName}));
  </script>
</body>
</html>
    `;
  }
}
```

**Tests**:
- Focus indicators detected
- Contrast ratio calculated correctly
- Missing indicators reported
- Custom focus styles validated

---

#### Example: F5 - Color Contrast Validation
**Acceptance Criteria**:
- [ ] Extract all text and UI element colors from component
- [ ] Calculate contrast ratios using WCAG formula
- [ ] Validate against WCAG AA standards:
  - Normal text: ≥4.5:1
  - Large text (≥18pt or 14pt bold): ≥3:1
  - UI components: ≥3:1
- [ ] Test contrast in all states (default, hover, focus, disabled)
- [ ] Report violations with actual vs required ratios
- [ ] Suggest alternative colors that meet standards
- [ ] Auto-fix: Adjust colors to meet minimum contrast

**Files**:
- `app/src/services/validation/contrast-validator.ts` (NEW)

**Contrast Validation** (TypeScript):
```typescript
// app/src/services/validation/contrast-validator.ts
import type { ValidationResult, ContrastViolation } from './types';

export class ContrastValidator {
    def validate(self, component_code: str, tokens: dict) -> dict:
        """Validate color contrast ratios."""
        violations = []

        # Extract color pairs from component
        color_pairs = self._extract_color_pairs(component_code, tokens)

        for pair in color_pairs:
            ratio = self._calculate_contrast_ratio(
                pair['foreground'],
                pair['background']
            )

            required_ratio = self._get_required_ratio(pair['context'])

            if ratio < required_ratio:
                violations.append({
                    "type": "insufficient_contrast",
                    "element": pair['element'],
                    "foreground": pair['foreground'],
                    "background": pair['background'],
                    "actual_ratio": round(ratio, 2),
                    "required_ratio": required_ratio,
                    "severity": "critical" if ratio < 3.0 else "serious"
                })

        return {
            "valid": len(violations) == 0,
            "violations": violations
        }

    def _calculate_contrast_ratio(self, fg: str, bg: str) -> float:
        """Calculate WCAG contrast ratio."""
        fg_color = Color(fg)
        bg_color = Color(bg)

        fg_luminance = self._get_relative_luminance(fg_color)
        bg_luminance = self._get_relative_luminance(bg_color)

        lighter = max(fg_luminance, bg_luminance)
        darker = min(fg_luminance, bg_luminance)

        return (lighter + 0.05) / (darker + 0.05)

    def _get_relative_luminance(self, color: Color) -> float:
        """Calculate relative luminance."""
        r, g, b = color.rgb

        def adjust(c):
            if c <= 0.03928:
                return c / 12.92
            return ((c + 0.055) / 1.055) ** 2.4

        r = adjust(r)
        g = adjust(g)
        b = adjust(b)

        return 0.2126 * r + 0.7152 * g + 0.0722 * b

    def _get_required_ratio(self, context: str) -> float:
        """Get required contrast ratio for context."""
        if context == 'large_text':
            return 3.0
        elif context == 'ui_component':
            return 3.0
        else:  # normal_text
            return 4.5

    def _extract_color_pairs(self, code: str, tokens: dict):
        """Extract foreground/background color pairs from code."""
        # Parse code to find text elements and their colors
        pairs = []
        # Implementation depends on AST parsing
        return pairs
```

**Tests**:
- Contrast ratios calculated correctly
- WCAG standards enforced
- Violations detected accurately
- Auto-fix suggestions valid

---

#### Example: F6 - Token Adherence Meter
**Acceptance Criteria**:
- [ ] Compare generated component against approved tokens
- [ ] Check token usage for:
  - Colors (all color values)
  - Typography (font family, sizes, weights)
  - Spacing (padding, margin, gap values)
- [ ] Calculate adherence percentage per category
- [ ] Calculate overall adherence score (≥90% target)
- [ ] Report non-compliant values with expected vs actual
- [ ] Generate visual adherence report
- [ ] Allow tolerance for minor variations (ΔE ≤2 for colors)

**Files**:
- `app/src/services/validation/token-validator.ts` (NEW)

**Token Adherence** (TypeScript):
```typescript
// app/src/services/validation/token-validator.ts
import type { ValidationResult, TokenViolation } from './types';

export class TokenValidator {
    def validate(self, component_code: str, approved_tokens: dict) -> dict:
        """Calculate token adherence."""
        # Extract tokens from generated code
        used_tokens = self._extract_used_tokens(component_code)

        adherence = {
            "colors": self._check_color_adherence(
                used_tokens.get("colors", {}),
                approved_tokens.get("colors", {})
            ),
            "typography": self._check_typography_adherence(
                used_tokens.get("typography", {}),
                approved_tokens.get("typography", {})
            ),
            "spacing": self._check_spacing_adherence(
                used_tokens.get("spacing", {}),
                approved_tokens.get("spacing", {})
            )
        }

        # Calculate overall score
        scores = [cat["score"] for cat in adherence.values()]
        overall_score = sum(scores) / len(scores) if scores else 0

        return {
            "valid": overall_score >= 0.90,
            "overall_score": overall_score,
            "adherence": adherence,
            "violations": self._collect_violations(adherence)
        }

    def _check_color_adherence(self, used: dict, approved: dict) -> dict:
        """Check color token adherence."""
        matches = 0
        total = len(used)

        violations = []
        for name, used_value in used.items():
            approved_value = approved.get(name)
            if not approved_value:
                violations.append({
                    "token": name,
                    "issue": "not_in_approved_tokens",
                    "used": used_value
                })
                continue

            # Calculate color difference (ΔE)
            delta_e = self._calculate_delta_e(used_value, approved_value)

            if delta_e <= 2.0:  # Tolerance
                matches += 1
            else:
                violations.append({
                    "token": name,
                    "issue": "color_mismatch",
                    "used": used_value,
                    "approved": approved_value,
                    "delta_e": round(delta_e, 2)
                })

        return {
            "score": matches / total if total > 0 else 1.0,
            "matches": matches,
            "total": total,
            "violations": violations
        }

    def _calculate_delta_e(self, color1: str, color2: str) -> float:
        """Calculate ΔE color difference (CIEDE2000)."""
        # Use colour library for ΔE calculation
        from colour import delta_E
        return delta_E(color1, color2, method='CIE 2000')

    def _extract_used_tokens(self, code: str) -> dict:
        """Extract token values from generated code."""
        # Parse CSS variables and inline values
        # Implementation depends on CSS parser
        return {}
```

**Tests**:
- Token extraction correct
- Adherence calculated accurately
- ΔE tolerance works
- Overall score matches expectations

---

#### Example: I1 - Extended Auto-Fix & Retry Logic

**Integration Note**: Epic 4.5 Task 2 already provides auto-fix for TypeScript and ESLint. This task **extends** that with accessibility and token fixes.

**Acceptance Criteria**:
- [ ] **Handled by Epic 4.5 Task 2**:
  - ✅ TypeScript: Remove unused imports, add type annotations
  - ✅ ESLint: Run `eslint --fix`
  - ✅ Prettier: Run `prettier --write`
  - ✅ Retry validation after auto-fix (max 2 attempts)
- [ ] **Epic 5 Extensions**:
  - Accessibility: Add missing ARIA labels
  - Accessibility: Fix button-name violations
  - Contrast: Adjust colors to meet minimum ratios (optional)
  - Token: Replace hardcoded values with CSS variables
- [ ] Integrate with Epic 4.5 CodeValidator
- [ ] Track which issues were auto-fixed (extend existing tracking)
- [ ] Report auto-fix success rate
- [ ] Generate diff showing changes
- [ ] Provide manual fix suggestions for unfixable issues
- [ ] Target: 80%+ auto-fix success rate (combined Epic 4.5 + Epic 5)

**Files**:
- `app/src/services/validation/auto-fixer.ts` (NEW - extends Epic 4.5 fixes)
- Integration with `backend/src/generation/code_validator.py` (Epic 4.5)

**Extended Auto-Fix Logic** (TypeScript):
```typescript
// app/src/services/validation/auto-fixer.ts
import type { ValidationResult, AutoFixResult } from './types';

export class ExtendedAutoFixer {
    async def fix_and_retry(self, code: str,
                           validation_result: dict) -> dict:
        """Attempt to auto-fix issues and retry validation."""
        fixed_code = code
        fixes_applied = []

        # Fix TypeScript issues
        if not validation_result.get("typescript", {}).get("valid"):
            fixed_code, ts_fixes = await self._fix_typescript(
                fixed_code,
                validation_result["typescript"]["errors"]
            )
            fixes_applied.extend(ts_fixes)

        # Fix ESLint issues
        if not validation_result.get("eslint", {}).get("valid"):
            fixed_code, lint_fixes = await self._fix_eslint(fixed_code)
            fixes_applied.extend(lint_fixes)

        # Format with Prettier
        fixed_code = await self._format_prettier(fixed_code)
        fixes_applied.append("prettier_format")

        # Fix accessibility issues
        if validation_result.get("a11y", {}).get("violations"):
            fixed_code, a11y_fixes = await self._fix_a11y(
                fixed_code,
                validation_result["a11y"]["violations"]
            )
            fixes_applied.extend(a11y_fixes)

        # Retry validation
        retry_result = await self.validator.validate_all(fixed_code)

        return {
            "fixed_code": fixed_code,
            "fixes_applied": fixes_applied,
            "retry_result": retry_result,
            "success": retry_result["valid"]
        }

    async def _fix_a11y(self, code: str, violations: dict) -> tuple[str, list]:
        """Fix accessibility violations."""
        fixes = []

        # Add missing aria-labels
        for violation in violations.get("critical", []):
            if violation["id"] == "button-name":
                # Add aria-label to buttons without text
                code = self._add_aria_label(code, violation)
                fixes.append("add_aria_label")

        return code, fixes
```

**Tests**:
- Auto-fix resolves common issues
- Retry validation works
- Fixes tracked correctly
- Success rate measured

---

#### Example: B1 - Comprehensive Quality Report Generation
**Acceptance Criteria**:
- [ ] Generate comprehensive quality report with:
  - Overall pass/fail status
  - TypeScript compilation result
  - ESLint/Prettier results
  - Accessibility audit summary
  - Keyboard navigation results
  - Focus indicator validation
  - Color contrast results
  - Token adherence score
  - Auto-fix summary
- [ ] Include visualizations (charts, badges)
- [ ] Export report in JSON and HTML formats
- [ ] Store report in S3
- [ ] Display report in UI
- [ ] Track quality metrics over time

**Files**:
- `backend/src/validation/report_generator.py`

**Report Generation**:
```python
class QualityReportGenerator:
    def generate(self, validation_results: dict) -> dict:
        """Generate quality report."""
        report = {
            "timestamp": datetime.utcnow().isoformat(),
            "overall_status": self._determine_status(validation_results),
            "summary": {
                "typescript": validation_results["typescript"]["valid"],
                "eslint": validation_results["eslint"]["valid"],
                "accessibility": validation_results["a11y"]["valid"],
                "keyboard": validation_results["keyboard"]["valid"],
                "focus": validation_results["focus"]["valid"],
                "contrast": validation_results["contrast"]["valid"],
                "token_adherence": validation_results["tokens"]["overall_score"]
            },
            "details": validation_results,
            "auto_fixes": validation_results.get("auto_fixes", []),
            "recommendations": self._generate_recommendations(validation_results)
        }

        # Generate HTML report
        html_report = self._generate_html(report)

        return {
            "json": report,
            "html": html_report
        }

    def _determine_status(self, results: dict) -> str:
        """Determine overall pass/fail status."""
        critical_checks = [
            results["typescript"]["valid"],
            results["eslint"]["valid"],
            results["a11y"]["valid"]
        ]

        if all(critical_checks) and results["tokens"]["overall_score"] >= 0.90:
            return "PASS"
        else:
            return "FAIL"

    def _generate_html(self, report: dict) -> str:
        """Generate HTML quality report."""
        # Use Jinja2 template
        pass
```

**Tests**:
- Reports generated correctly
- JSON and HTML formats valid
- Status determination correct
- Metrics tracked over time

---

## Dependencies

**Status**: ✅ All dependencies satisfied

**Requires**:
- ✅ Epic 4 (Code Generation) - COMPLETE
- ✅ **Epic 4.5 Task 2 (Code Validator)** - COMPLETE ✅ (as of 2025-01-08)
  - ✅ Provides TypeScript/ESLint validation (`backend/src/generation/code_validator.py`)
  - ✅ Provides auto-fix infrastructure with max 2 retries
  - ✅ Provides quality scoring foundation
  - ✅ Validation scripts ready (`backend/scripts/validate_typescript.js`, `validate_eslint.js`)

**Extends**:
- Epic 4.5 validation loop with accessibility checks
- Epic 4.5 quality scoring with token adherence
- Epic 4.5 auto-fix with ARIA label fixes

**Blocks**:
- Component delivery (comprehensive validation required)
- User acceptance of generated components

---

## Technical Architecture

### Validation Pipeline (Integrated with Epic 4.5)

```
┌──────────────────────────────────────────────────────────────┐
│  Epic 4: Code Generation (Backend)                           │
│         ↓                                                     │
│  Epic 4.5 Task 1: LLM Generator                             │
│         ↓                                                     │
│  Generated Component Code                                    │
└──────────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────────┐
│  Epic 4.5 Task 2: Code Validator ⭐ (Foundation)             │
│  (backend/src/generation/code_validator.py)                  │
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │ TypeScript Validation                      │ ✅           │
│  │ (backend/scripts/validate_typescript.js)   │             │
│  └────────────────────────────────────────────┘             │
│         ↓                                                     │
│  ┌────────────────────────────────────────────┐             │
│  │ ESLint Validation                          │ ✅           │
│  │ (backend/scripts/validate_eslint.js)       │             │
│  └────────────────────────────────────────────┘             │
│         ↓                                                     │
│  ┌────────────────────────────────────────────┐             │
│  │ LLM-Based Fix Loop (max 2 retries)        │ ✅           │
│  │ - Auto-fix TypeScript errors               │             │
│  │ - Auto-fix ESLint errors                   │             │
│  │ - Apply Prettier formatting                │             │
│  └────────────────────────────────────────────┘             │
│         ↓                                                     │
│  Quality Scores: Compilation, Linting, Type Safety          │
└──────────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────────┐
│  Epic 5: Extended Validation ✨ (Accessibility & Tokens)     │
│  (app/src/services/validation/)                              │
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │ Task 1: axe-core Accessibility Testing    │             │
│  │ (@playwright/test + @axe-core/react)       │             │
│  │ - 0 critical violations required           │             │
│  │ - 0 serious violations required            │             │
│  └────────────────────────────────────────────┘             │
│         ↓                                                     │
│  ┌────────────────────────────────────────────┐             │
│  │ Task 2: Keyboard Navigation Testing       │             │
│  │ (Playwright page.keyboard)                 │             │
│  │ - Tab order, Enter/Space, Escape          │             │
│  └────────────────────────────────────────────┘             │
│         ↓                                                     │
│  ┌────────────────────────────────────────────┐             │
│  │ Task 3: Focus Indicator Validation        │             │
│  │ (getComputedStyle + contrast formulas)     │             │
│  │ - ≥3:1 contrast required                   │             │
│  └────────────────────────────────────────────┘             │
│         ↓                                                     │
│  ┌────────────────────────────────────────────┐             │
│  │ Task 4: Color Contrast Validation         │             │
│  │ (WCAG formulas: 4.5:1 text, 3:1 UI)       │             │
│  └────────────────────────────────────────────┘             │
│         ↓                                                     │
│  ┌────────────────────────────────────────────┐             │
│  │ Task 5: Token Adherence Meter             │             │
│  │ (AST parsing + color math)                 │             │
│  │ - ≥90% adherence required                  │             │
│  └────────────────────────────────────────────┘             │
│         ↓                                                     │
│  ┌────────────────────────────────────────────┐             │
│  │ Task 6: Extended Auto-Fix                 │             │
│  │ - Add ARIA labels                          │             │
│  │ - Fix button-name violations               │             │
│  │ - Adjust colors (optional)                 │             │
│  └────────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────────┐
│  Task 7: Comprehensive Quality Report                        │
│  - Epic 4.5 results (TS, ESLint, Quality Scores)            │
│  - Epic 5 results (A11y, Keyboard, Focus, Contrast, Tokens) │
│  - Auto-fix summary (both epics)                            │
│  - Overall PASS/FAIL decision                               │
└──────────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────────┐
│  Epic 4.5 Task 5: Post-Processing & Assembly                │
│  - Import resolution                                         │
│  - Provenance header injection                              │
│  - Prettier formatting                                       │
└──────────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────────┐
│  Final Validated Component (Ready for Delivery)             │
│  - TypeScript compiled ✓                                     │
│  - ESLint passed ✓                                           │
│  - Accessibility validated ✓                                 │
│  - Tokens adhered ✓                                          │
│  - Quality report available                                  │
└──────────────────────────────────────────────────────────────┘
```

**Key Architectural Decisions:**

1. **Epic 4.5 Foundation**: TypeScript and ESLint validation already handled by Epic 4.5 Task 2 using Node.js scripts (`backend/scripts/validate_*.js`)

2. **Epic 5 Extensions**: Runs in frontend (`app/src/services/validation/`) and adds:
   - Accessibility testing (axe-core + Playwright)
   - Keyboard navigation validation
   - Focus indicator checking
   - Color contrast validation (WCAG)
   - Token adherence measurement

3. **No Duplication**: Epic 5 does NOT reimplement TypeScript/ESLint validation - it extends the Epic 4.5 foundation

4. **Existing Dependencies**: Leverages packages already in `app/package.json`:
   - `typescript` (5.9.3)
   - `eslint` (^9)
   - `@playwright/test` (^1.55.1)
   - `@axe-core/react` (^4.10.2)

5. **Backend Role**: Backend provides:
   - Validation orchestration (Epic 4.5 Task 2)
   - Validation result storage API (optional)
   - Quality report generation (Task 7)
   - Historical metrics tracking

6. **Integration Points**:
   - Epic 4.5 Task 2 → Epic 5 Tasks 1-6 (validated code flows into Epic 5)
   - Epic 5 Task 6 → Epic 4.5 CodeValidator (extended auto-fixes)
   - Epic 5 Task 7 → Epic 4.5 metadata (combined report)

---

## Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Critical A11y Violations** | 0 | axe-core audit |
| **Serious A11y Violations** | 0 | axe-core audit |
| **TypeScript Compilation** | 100% pass | tsc --noEmit |
| **Token Adherence** | ≥90% | Token validator |
| **Auto-Fix Success Rate** | ≥80% | Fixes resolved / Total issues |
| **Validation Latency** | <10s | Total validation time |

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Validation too slow (>10s) | Medium | Parallelize checks, optimize AST operations |
| Auto-fix breaks code | High | Validate after fix, provide manual override |
| False positives in a11y tests | Low | Manual review, adjust rules |
| Token adherence too strict | Low | Allow configurable tolerance |

---

## Definition of Done

### Prerequisites (COMPLETE ✅)
- [x] **Epic 4.5 Task 2 completed** (TypeScript/ESLint validation foundation) ✅

### Epic 5 Implementation Tasks
- [ ] All 7 Epic 5 tasks completed with acceptance criteria met
- [ ] axe-core testing detects violations (Task 1)
- [ ] Keyboard navigation tested (Task 2)
- [ ] Focus indicators validated (Task 3)
- [ ] Color contrast checked WCAG AA (Task 4)
- [ ] Token adherence meter implemented ≥90% (Task 5)
- [ ] Extended auto-fix resolves 80%+ of accessibility/token issues (Task 6)
- [ ] Comprehensive quality reports generated (Task 7)
- [ ] Extended validation completes in <15s (Epic 4.5: ~5s + Epic 5: ~10s)
- [ ] Integration tests passing with Epic 4.5 validators
- [ ] Documentation updated
- [ ] No duplication with Epic 4.5 Task 2

---

## Related Epics

- **Depends On**:
  - ✅ Epic 4 (Code Generation) - COMPLETE
  - ✅ Epic 4.5 Task 2 (Code Validator) - COMPLETE ✅ (as of 2025-01-08)
- **Extends**: Epic 4.5 validation with accessibility and token checks
- **Blocks**: Component delivery (full validation required)
- **Related**: Epic 8 (regeneration uses combined Epic 4.5 + Epic 5 validation)

---

## Notes

**Zero Tolerance**: Critical accessibility violations are non-negotiable. No component ships without passing.

**Auto-Fix**: Focus on high-impact, low-risk fixes. Don't break working code trying to fix minor issues.

**Performance**: 10s validation target is tight. Parallelize checks where possible.

---

## Implementation Summary

### Latest Update (2025-01-08)
✅ **Epic 4.5 Task 2 (Code Validator) is COMPLETE** - Epic 5 is ready to start implementation. All dependencies satisfied, no blockers.

### Major Changes - Integration with Epic 4.5 (2025-10-07 Restructure)

Epic 5 has been **completely restructured** to properly integrate with Epic 4.5's validation infrastructure:

**What Changed:**

1. **Title Updated**: "Quality Validation" → "**Extended Quality Validation & Accessibility Testing**"
   - Clarifies this epic extends Epic 4.5, doesn't replace it

2. **Tasks Reduced**: 9 tasks → **7 tasks**
   - ~~Task 1: TypeScript Validation~~ → **Epic 4.5 Task 2** ✅
   - ~~Task 2: ESLint Validation~~ → **Epic 4.5 Task 2** ✅
   - Remaining tasks renumbered (Task 3→1, Task 4→2, etc.)

3. **Dependencies Added**:
   - ⭐ **Epic 4.5 Task 2 (Code Validator)** is now a **CRITICAL DEPENDENCY**
   - Must be completed before Epic 5 starts

4. **Architecture Diagram Updated**:
   - Shows Epic 4.5 Task 2 as foundation
   - Epic 5 extends with accessibility and token validation
   - Clear integration points documented

5. **Auto-Fix Updated** (Task 6):
   - Epic 4.5 handles TypeScript/ESLint fixes
   - Epic 5 extends with ARIA labels and token fixes

6. **Quality Report Updated** (Task 7):
   - Combines results from Epic 4.5 + Epic 5
   - Single unified report

### What's Clear Now

**Epic 4.5 Provides** (Foundation):
- ✅ TypeScript strict compilation validation
- ✅ ESLint validation
- ✅ Prettier formatting
- ✅ Auto-fix with LLM-based error correction
- ✅ Max 2 retry attempts
- ✅ Quality scoring (compilation, linting, type safety)

**Epic 5 Adds** (Extensions):
- ✨ axe-core accessibility testing (0 critical violations)
- ✨ Keyboard navigation validation
- ✨ Focus indicator checking (≥3:1 contrast)
- ✨ Color contrast validation (WCAG AA)
- ✨ Token adherence meter (≥90%)
- ✨ Extended auto-fixes (ARIA, tokens)
- ✨ Comprehensive quality reports

### No Duplication

**Before Update:**
- Epic 4.5 Task 2: TypeScript + ESLint validation
- Epic 5 Task 1: TypeScript validation (DUPLICATE ❌)
- Epic 5 Task 2: ESLint validation (DUPLICATE ❌)

**After Update:**
- Epic 4.5 Task 2: TypeScript + ESLint validation ✅
- Epic 5 extends with accessibility + tokens ✅
- Zero duplication ✅

### Dependencies Status

**No new dependencies needed!** All required packages are already in `app/package.json`:
- ✅ `typescript` (5.9.3)
- ✅ `eslint` (^9)
- ✅ `@playwright/test` (^1.55.1)
- ✅ `@axe-core/react` (^4.10.2)
- ✅ `prettier` (via eslint config)

**Optional additions for color/token validation**:
- Color math library (e.g., `chroma-js`, `color`, or custom WCAG formulas)
- AST parsing library (if needed beyond TypeScript Compiler API)

### Implementation Order

1. **Complete Epic 4.5 Task 2 first** (Code Validator)
2. Then implement Epic 5 Tasks 1-7 in order
3. Integrate Epic 5 validators with Epic 4.5 pipeline
4. Build unified quality report (Task 7)
5. Update frontend UI to show combined results

### Key Benefits of This Approach

1. ✅ **No duplicate code** - Single source of truth for TS/ESLint validation
2. ✅ **Clear separation** - Epic 4.5 = code quality, Epic 5 = accessibility/tokens
3. ✅ **Better integration** - Epic 5 builds on Epic 4.5's foundation
4. ✅ **Easier maintenance** - One place to update TS/ESLint logic
5. ✅ **Combined reports** - Single quality score across all validations

---

## Current Implementation Status (2025-01-08)

### ✅ COMPLETE - Epic 4.5 Task 2 Foundation

**Implemented Files**:
- ✅ `backend/src/generation/code_validator.py` - 521 lines, fully functional
- ✅ `backend/scripts/validate_typescript.js` - TypeScript compilation validation
- ✅ `backend/scripts/validate_eslint.js` - ESLint validation
- ✅ `backend/tests/generation/test_code_validator.py` - Comprehensive test coverage

**Verified Functionality**:
- ✅ Parallel TypeScript + ESLint validation
- ✅ LLM-based fix loop with max 2 retries
- ✅ Quality scoring (compilation, linting, type safety)
- ✅ Error handling and graceful degradation
- ✅ LangSmith tracing integration

### ❌ NOT STARTED - Epic 5 Extensions

**Missing Files** (7 validators to create):
```
app/src/services/validation/
├── types.ts                    # Shared types (NEW)
├── a11y-validator.ts           # Task 1 (NEW)
├── keyboard-validator.ts       # Task 2 (NEW)
├── focus-validator.ts          # Task 3 (NEW)
├── contrast-validator.ts       # Task 4 (NEW)
├── token-validator.ts          # Task 5 (NEW)
├── auto-fixer.ts               # Task 6 (NEW)
└── index.ts                    # Exports (NEW)
```

**Backend Components** (1 file to create):
```
backend/src/validation/
└── report_generator.py         # Task 7 (NEW)
```

### 📋 Readiness Checklist

**Prerequisites** ✅:
- [x] Epic 4.5 Task 2 complete and verified
- [x] `@playwright/test` available in `app/package.json` (^1.55.1)
- [x] `@axe-core/react` available in `app/package.json` (^4.10.2)
- [x] TypeScript + ESLint validation working
- [x] LLM-based fix loop operational

**Ready to Implement**:
- [ ] **F1**: Create `app/src/services/validation/` directory + shared types
- [ ] **F2**: Implement axe-core accessibility validator
- [ ] **F3**: Implement keyboard navigation validator
- [ ] **F4**: Implement focus indicator validator
- [ ] **F5**: Implement color contrast validator
- [ ] **F6**: Implement token adherence validator
- [ ] **B1**: Implement quality report generator
- [ ] **I1**: Integrate validators + extended auto-fixer
- [ ] **T1-T3**: Comprehensive testing

### 🚀 Next Steps (Recommended Order)

1. **Week 1: Foundation & A11y**
   - Day 1-2: **F1** - Create directory structure + shared types
   - Day 3-5: **F2** - Implement axe-core validator with tests

2. **Week 2: Keyboard & Focus**
   - Day 1-3: **F3** - Implement keyboard validator with tests
   - Day 4-5: **F4** - Implement focus validator with tests

3. **Week 3: Contrast & Tokens**
   - Day 1-3: **F5** - Implement contrast validator with tests
   - Day 4-5: **F6** - Implement token validator with tests

4. **Week 4: Backend & Integration**
   - Day 1-2: **B1** - Implement quality report generator
   - Day 3-5: **I1** - Integration + extended auto-fixer
   - **T1-T3** - Comprehensive testing (ongoing)

### 🎯 Success Criteria Verification

Before marking Epic 5 complete, verify:
- [ ] All 7 validators implemented and tested
- [ ] Integration with Epic 4.5 CodeValidator working
- [ ] 0 critical/serious a11y violations detected and blocked
- [ ] Token adherence ≥90% calculated correctly
- [ ] Extended auto-fix resolves 80%+ of a11y/token issues
- [ ] Quality reports generated in JSON and HTML formats
- [ ] Validation completes in <15s total (Epic 4.5: ~5s + Epic 5: ~10s)
- [ ] Documentation updated with API examples
- [ ] Frontend UI displays validation results correctly

---

## Implementation Notes

### File Path Clarification
- **Frontend validators**: `app/src/services/validation/` (TypeScript)
  - Uses Playwright for browser-based testing
  - Leverages `@axe-core/react` for accessibility
  - Returns ValidationResult objects

- **Backend integration**: `backend/src/validation/` (Python)
  - Quality report generation
  - Historical metrics tracking
  - S3 storage for reports

### Architecture Decision: Frontend vs Backend

**Why validators run in frontend**:
1. ✅ Access to browser APIs (getComputedStyle, focus management)
2. ✅ Playwright already available in frontend tooling
3. ✅ Faster iteration (no Python/Node.js bridge needed)
4. ✅ Can reuse validation logic for live preview

**Backend responsibilities**:
1. ✅ Orchestrate validation flow (via Epic 4.5 CodeValidator)
2. ✅ Store validation results and quality scores
3. ✅ Generate comprehensive reports (HTML/JSON)
4. ✅ Track metrics over time

### Integration Pattern

```typescript
// Epic 5 validators follow this pattern:
export class ValidatorName {
  async validate(
    componentCode: string,
    componentName: string,
    // ... additional context
  ): Promise<ValidationResult> {
    // 1. Setup (launch browser, prepare test environment)
    // 2. Run validation checks
    // 3. Collect violations/issues
    // 4. Cleanup (close browser)
    // 5. Return ValidationResult
  }
}
```

### Testing Strategy

Each validator should have:
- ✅ Unit tests for validation logic
- ✅ Integration tests with real components
- ✅ Performance benchmarks (<2s per validator target)
- ✅ Edge case handling (empty components, complex variants)

---

**Last Updated**: 2025-01-08
**Last Status Change**: Epic 4.5 Task 2 completed, Epic 5 ready to start
**Version**: 2.0 (Updated for Epic 4.5 completion)
