# Epic 4: Code Generation & Adaptation - Git Commit Strategy

**Epic**: Code Generation & Adaptation
**Task Document**: [04-code-generation.md](./04-code-generation.md)
**Total Commits**: 35 (separated into 4 streams)
**Target**: Generate production-ready TypeScript components in ≤60s

---

## 🎯 Commit Strategy Overview

This document defines a **granular, reviewable commit strategy** for Epic 4 implementation using **4 parallel development streams**:

1. **Backend Stream** (Commits B1-B15): All backend code generation logic
2. **Frontend Stream** (Commits F1-F7): All frontend UI and API integration
3. **Integration Stream** (Commits I1-I5): Cross-cutting E2E tests and validation
4. **Polish Stream** (Commits P1-P8): Production enhancements and documentation

**Benefits of Stream-Based Approach:**
- ✅ **Parallel Development**: Backend and frontend teams work independently
- ✅ **Clear Boundaries**: No mixing of concerns across commits
- ✅ **Easier Reviews**: Each stream can be reviewed by domain experts
- ✅ **Flexible Merging**: Streams can be merged in different orders based on priority

**Philosophy**: Epic 4 is the **core value delivery** of ComponentForge. Quality and performance here determine product success. We prioritize:
1. **Incremental delivery** - Each commit adds testable value
2. **Zero tolerance for `any` types** - TypeScript strict mode throughout
3. **Performance monitoring** - Track latency from Day 1
4. **Test coverage** - Every generator has unit tests

---

## 📋 Commit Naming Convention

```
<type>(<scope>): <short description>

[Epic-4] [<stream-id>] <detailed description>

- Bullet point of what changed
- Another change detail
- Related acceptance criteria met

Refs: #<issue-number>
```

### Types
- `feat`: New feature implementation
- `chore`: Non-feature work (setup, config, scripts)
- `test`: Test implementation
- `refactor`: Code refactoring without feature changes
- `fix`: Bug fixes
- `docs`: Documentation updates
- `perf`: Performance improvements

### Scopes
- `backend`: Backend code (generation module, API)
- `frontend`: Frontend code (pages, components, hooks)
- `integration`: Cross-cutting integration code
- `test`: Test files
- `scripts`: Helper scripts (Node.js, Python)

### Stream IDs
- `B1-B15`: Backend stream commits
- `F1-F7`: Frontend stream commits
- `I1-I5`: Integration stream commits
- `P1-P8`: Polish stream commits

---

## 🗂️ Stream Dependencies & Critical Path

```
Backend Stream (B1-B15)
    ├─ Core Pipeline (B1-B11) ──────────┐
    └─ API Endpoint (B12-B15) ──────────┤
                                        │
Frontend Stream (F1-F7)                 ├──> Integration Stream (I1-I5)
    ├─ Types & Client (F1-F3) ─────────┤         │
    ├─ Query Hooks (F4) ───────────────┤         └──> Polish Stream (P1-P8)
    └─ Preview Page (F5-F7) ───────────┘

Critical Path: B1-B11 → B12-B15 → I1-I5 → P1-P8
Parallel Path: F1-F7 (can start after B12)
```

**Merge Strategy:**
1. Merge Backend Stream (B1-B15) first - establishes API contract
2. Merge Frontend Stream (F1-F7) second - consumes backend API
3. Merge Integration Stream (I1-I5) third - validates end-to-end
4. Merge Polish Stream (P1-P8) last - production enhancements

---

## 🔧 Backend Stream (B1-B15) - Week 1, Days 1-4

**Goal**: Complete all backend code generation logic and API endpoints

### B1: Setup generation module structure
**Scope**: Foundation
```bash
chore(backend): setup code generation module structure

[Epic-4] [B1] Initialize backend/src/generation/ module

- Create backend/src/generation/ directory
- Add __init__.py with module exports
- Create backend/src/generation/types.py for generation types
- Add GenerationRequest, GenerationResult, GenerationStage types
- Add PatternStructure, TokenMapping, CodeParts types
- Add generation module to backend imports
- Document module architecture in backend/src/generation/README.md

Foundation for code generation pipeline.
```

**Files**:
- `backend/src/generation/__init__.py` (new)
- `backend/src/generation/types.py` (new)
- `backend/src/generation/README.md` (new)

**Test**: Import types, verify module structure

**Duration**: 30 min

---

### B2: Add pattern parser for template-based generation
**Scope**: Task 1 (Simplified AST approach)
```bash
feat(backend): add pattern parser for component structure

[Epic-4] [B2] Implement template-based pattern parser (simplified AST)

- Create backend/src/generation/pattern_parser.py
- Parse pattern JSON to extract structure (name, props, variants)
- Identify modification points (className, props, handlers)
- Extract imports and dependencies from pattern code
- Handle both function and arrow function components
- Return structured PatternStructure with modification points
- Use regex-based parsing (defer full AST to post-MVP)

Pattern parsing ready for token injection.
```

**Files**:
- `backend/src/generation/pattern_parser.py` (new)

**Test**: Parse button.json and card.json successfully

**Performance Target**: <100ms per pattern

**Duration**: 2 hours

---

### B3: Add pattern parser tests
**Scope**: Task 1 (Testing)
```bash
test(backend): add comprehensive pattern parser tests

[Epic-4] [B3] Test pattern parsing with all 10 curated patterns

- Create backend/tests/generation/test_pattern_parser.py
- Test Button pattern extraction (props, variants, imports)
- Test Card pattern extraction (composition, children)
- Test parsing error handling (invalid JSON, missing fields)
- Test modification point identification
- Verify all 10 patterns parse successfully
- Target: 100% code coverage for parser

Pattern parser tested and validated.
```

**Files**:
- `backend/tests/generation/test_pattern_parser.py` (new)

**Test**: `pytest backend/tests/generation/test_pattern_parser.py -v`

**Duration**: 1 hour

---

### B4: Implement design token injector
**Scope**: Task 2
```bash
feat(backend): implement design token injection

[Epic-4] [B4] Inject extracted design tokens into component styles

- Create backend/src/generation/token_injector.py
- Map tokens to component styles (colors, typography, spacing)
- Generate CSS variable definitions (:root { --color-primary: ... })
- Replace hardcoded values with CSS var references
- Handle token mapping for Button, Card, Input components
- Add fallback values for missing tokens
- Generate token metadata (count, categories)

Token injection pipeline ready.
```

**Files**:
- `backend/src/generation/token_injector.py` (new)

**Test**: Inject tokens into Button pattern, verify CSS vars generated

**Performance Target**: <50ms per component

**Duration**: 2 hours

---

### B5: Add token injection tests
**Scope**: Task 2 (Testing)
```bash
test(backend): add token injection validation tests

[Epic-4] [B5] Test token injection accuracy and CSS generation

- Create backend/tests/generation/test_token_injector.py
- Test CSS variable generation for colors, typography, spacing
- Test token mapping for different component types
- Test fallback values when tokens missing
- Test token injection accuracy (≥95% correct values)
- Mock token extraction output from Epic 1

Token injector validated with high accuracy.
```

**Files**:
- `backend/tests/generation/test_token_injector.py` (new)

**Test**: `pytest backend/tests/generation/test_token_injector.py -v`

**Duration**: 1 hour

---

### B6: Implement Tailwind CSS generator
**Scope**: Task 3
```bash
feat(backend): implement Tailwind CSS class generator

[Epic-4] [B6] Generate Tailwind classes using design tokens

- Create backend/src/generation/tailwind_generator.py
- Generate Tailwind classes using CSS variables
- Support all utilities: colors, spacing, typography, layout, states
- Generate responsive classes when needed
- Handle variant-specific classes (primary, secondary, ghost)
- Maintain semantic class composition
- Validate classes against Tailwind config (basic validation)

Tailwind generation pipeline ready.
```

**Files**:
- `backend/src/generation/tailwind_generator.py` (new)

**Test**: Generate classes for Button variants, verify structure

**Performance Target**: <30ms per element

**Duration**: 2 hours

---

### B7: Add Tailwind generator tests
**Scope**: Task 3 (Testing)
```bash
test(backend): add Tailwind class generation tests

[Epic-4] [B7] Validate Tailwind class generation and CSS vars

- Create backend/tests/generation/test_tailwind_generator.py
- Test base classes for Button, Card, Input components
- Test variant-specific classes (primary, secondary, ghost, outline)
- Test CSS variable usage (bg-[var(--color-primary)])
- Test responsive classes
- Test state classes (hover, focus, disabled)

Tailwind generator validated.
```

**Files**:
- `backend/tests/generation/test_tailwind_generator.py` (new)

**Test**: `pytest backend/tests/generation/test_tailwind_generator.py -v`

**Duration**: 1 hour

---

### B8: Implement requirements implementer
**Scope**: Task 4
```bash
feat(backend): implement requirement implementation

[Epic-4] [B8] Implement approved requirements in component

- Create backend/src/generation/requirement_implementer.py
- Add props to component interface from Epic 2 proposals
- Add event handlers (onClick, onChange, onFocus, etc.)
- Implement state management (hover, focus, disabled, loading)
- Generate TypeScript prop types from requirements
- Add JSDoc comments for props
- Handle default values for optional props
- Generate variant logic based on props

Requirement implementation pipeline ready.
```

**Files**:
- `backend/src/generation/requirement_implementer.py` (new)

**Test**: Add props/events from Epic 2, verify interface generated

**Performance Target**: <100ms per component

**Duration**: 2.5 hours

---

### B9: Add requirement implementer tests
**Scope**: Task 4 (Testing)
```bash
test(backend): add requirement implementation tests

[Epic-4] [B9] Validate requirement implementation accuracy

- Create backend/tests/generation/test_requirement_implementer.py
- Test props added to TypeScript interface
- Test event handlers implemented properly
- Test state management (hover, focus, disabled)
- Test default values for optional props
- Test variant logic generation
- Mock Epic 2 requirement proposals

Requirement implementer validated.
```

**Files**:
- `backend/tests/generation/test_requirement_implementer.py` (new)

**Test**: `pytest backend/tests/generation/test_requirement_implementer.py -v`

**Duration**: 1 hour

---

### B10: Implement code assembler
**Scope**: Task 10
```bash
feat(backend): implement code assembly and formatting

[Epic-4] [B10] Assemble final component code with formatting

- Create backend/src/generation/code_assembler.py
- Combine imports, CSS vars, types, component code
- Format code with Prettier via subprocess
- Validate TypeScript compilation (optional, defer to Epic 5)
- Generate component.tsx and component.stories.tsx files
- Measure assembly latency
- Return assembled code with metadata
- Create scripts/format_code.js for Prettier wrapper

Code assembler completes core pipeline.
```

**Files**:
- `backend/src/generation/code_assembler.py` (new)
- `backend/scripts/format_code.js` (new - Prettier wrapper)

**Test**: Assemble Button component, verify formatting

**Performance Target**: <2s for formatting

**Duration**: 2 hours

---

### B11: Add code assembler tests
**Scope**: Task 10 (Testing)
```bash
test(backend): add code assembly validation tests

[Epic-4] [B11] Test code assembly and formatting pipeline

- Create backend/tests/generation/test_code_assembler.py
- Test component code assembly from parts
- Test Prettier formatting succeeds
- Test import order (external, internal, utils, types)
- Test generated code structure (imports, CSS, types, component)
- Measure assembly latency (target: ≤2s)

Code assembler validated.
```

**Files**:
- `backend/tests/generation/test_code_assembler.py` (new)

**Test**: `pytest backend/tests/generation/test_code_assembler.py -v`

**Duration**: 1 hour

---

### B12: Implement generation orchestrator service
**Scope**: Integration
```bash
feat(backend): create generation orchestrator service

[Epic-4] [B12] Orchestrate full generation pipeline

- Create backend/src/generation/generator_service.py
- Orchestrate: parse → inject → generate → implement → assemble
- Add LangSmith tracing for pipeline stages
- Track latency per stage (parse, inject, generate, assemble)
- Handle errors gracefully with rollback
- Return GenerationResult with code, metadata, timing
- Target: p50 latency ≤60s for Button/Card

Core generation pipeline complete.
```

**Files**:
- `backend/src/generation/generator_service.py` (new)

**Test**: Generate Button component end-to-end

**Performance Target**: p50 ≤60s, p95 ≤90s

**Duration**: 2 hours

---

### B13: Add generation service tests
**Scope**: Integration (Testing)
```bash
test(backend): add end-to-end generation tests

[Epic-4] [B13] Test full generation pipeline

- Create backend/tests/generation/test_generator_service.py
- Test Button generation with tokens + requirements
- Test Card generation end-to-end
- Test error handling (missing tokens, invalid requirements)
- Test latency measurement (verify ≤60s target)
- Mock Epic 1 tokens and Epic 2 requirements
- Verify TypeScript code structure

Generation service validated end-to-end.
```

**Files**:
- `backend/tests/generation/test_generator_service.py` (new)

**Test**: `pytest backend/tests/generation/test_generator_service.py -v`

**Duration**: 1.5 hours

---

### B14: Create generation API endpoint
**Scope**: Backend API
```bash
feat(backend): add code generation API endpoint

[Epic-4] [B14] Create POST /api/v1/generation/generate endpoint

- Create backend/src/api/v1/routes/generation.py
- Add GenerationRequest model (pattern_id, tokens, requirements)
- Add GenerationResponse model (code, stories, metadata, timing)
- Add POST /generate endpoint with LangSmith tracing
- Call generator_service.generate()
- Return generated code with timing metrics
- Add error handling (400 for validation, 500 for generation errors)
- Add request/response logging

Generation API ready for frontend.
```

**Files**:
- `backend/src/api/v1/routes/generation.py` (new)

**Test**: `curl -X POST http://localhost:8000/api/v1/generation/generate`

**Duration**: 1.5 hours

---

### B15: Register generation API routes
**Scope**: Backend API
```bash
feat(backend): register generation routes in API router

[Epic-4] [B15] Add generation routes to v1 router

- Update backend/src/api/v1/routes/__init__.py
- Import generation router
- Register /generation routes
- Update API documentation
- Add generation endpoint to OpenAPI schema
- Update main.py to include generation routes

Generation API accessible at /api/v1/generation/generate
```

**Files**:
- `backend/src/api/v1/routes/__init__.py` (modified)
- `backend/src/main.py` (modified)

**Test**: Visit http://localhost:8000/docs, verify /generation endpoint

**Duration**: 30 min

---

## 🎨 Frontend Stream (F1-F7) - Week 1, Day 5

**Goal**: Complete all frontend UI and API integration

**Dependencies**: Requires B12-B15 (API endpoint) to be complete

---

### F1: Add frontend generation types
**Scope**: Frontend Types
```bash
feat(frontend): add generation request/response types

[Epic-4] [F1] Create TypeScript types for generation API

- Create app/src/types/generation.types.ts
- Add GenerationRequest interface (pattern_id, tokens, requirements)
- Add GenerationResponse interface (code, stories, metadata, timing)
- Add GenerationStage enum (PARSING, INJECTING, GENERATING, ASSEMBLING)
- Add GenerationError type
- Add GenerationMetadata type (latency, token_count, lines_of_code)
- Export from app/src/types/index.ts

Frontend types match backend API contract.
```

**Files**:
- `app/src/types/generation.types.ts` (new)
- `app/src/types/index.ts` (modified)

**Test**: `npm run build` succeeds, no type errors

**Duration**: 45 min

---

### F2: Add generation API client
**Scope**: Frontend API
```bash
feat(frontend): add generation API client methods

[Epic-4] [F2] Create API client for code generation

- Create app/src/lib/api/generation.ts
- Add generateComponent(request: GenerationRequest) method
- Use axios POST to /api/v1/generation/generate
- Handle streaming/polling for long-running generation (optional)
- Add error handling and retry logic (max 2 retries)
- Transform API response to frontend types
- Export from app/src/lib/api/index.ts

Frontend can call generation API.
```

**Files**:
- `app/src/lib/api/generation.ts` (new)
- `app/src/lib/api/index.ts` (modified)

**Test**: Mock API call, verify type safety

**Duration**: 1 hour

---

### F3: Add generation API client tests
**Scope**: Frontend Testing
```bash
test(frontend): add generation API client tests

[Epic-4] [F3] Test generation API client methods

- Create app/src/lib/api/__tests__/generation.test.ts
- Mock axios POST request
- Test successful generation response
- Test error handling (400, 500 errors)
- Test retry logic
- Test request transformation
- Verify type safety

Generation API client validated.
```

**Files**:
- `app/src/lib/api/__tests__/generation.test.ts` (new)

**Test**: `npm test -- generation.test.ts`

**Duration**: 1 hour

---

### F4: Create generation query hook
**Scope**: Frontend Query
```bash
feat(frontend): add TanStack Query hook for generation

[Epic-4] [F4] Create useGenerateComponent mutation hook

- Create app/src/hooks/useGenerateComponent.ts
- Use useMutation for POST /api/v1/generation/generate
- Handle loading, success, error states
- Cache generated code with query key
- Add onSuccess callback for navigation
- Integrate with useWorkflowStore to get pattern/tokens/requirements
- Add onError callback for error tracking

Frontend can trigger generation with state management.
```

**Files**:
- `app/src/hooks/useGenerateComponent.ts` (new)

**Test**: Mock mutation, verify state updates

**Duration**: 1 hour

---

### F5: Update preview page with generation integration
**Scope**: Frontend Integration
```bash
feat(frontend): integrate code generation into preview page

[Epic-4] [F5] Replace placeholder with real generation

- Update app/src/app/preview/page.tsx
- Call useGenerateComponent on page load
- Pass pattern_id, tokens, requirements from workflow store
- Display loading state during generation
- Render real generated code (replace placeholder)
- Show generation timing metrics
- Add error handling UI
- Update tabs to show real component.tsx and stories.tsx

Preview page shows real generated components.
```

**Files**:
- `app/src/app/preview/page.tsx` (modified)

**Test**: Navigate to /preview, verify generation triggers

**Duration**: 1.5 hours

---

### F6: Add generation progress tracking UI
**Scope**: Frontend UX
```bash
feat(frontend): add real-time generation progress UI

[Epic-4] [F6] Show pipeline stages during generation

- Create app/src/components/composite/GenerationProgress.tsx
- Display current stage (parsing, injecting, generating, assembling)
- Show elapsed time (target: ≤60s)
- Use Progress component with stage indicators
- Match Epic 4 wireframe design
- Update during generation (mock stages for now, real in I3)
- Show stage-by-stage completion (✓ Parse, ⏳ Inject, ⏸ Generate, ⏸ Assemble)

User sees generation progress in real-time.
```

**Files**:
- `app/src/components/composite/GenerationProgress.tsx` (new)

**Test**: View progress component, verify stages displayed

**Duration**: 1.5 hours

---

### F7: Add generation error handling UI
**Scope**: Frontend UX
```bash
feat(frontend): add generation error handling and retry

[Epic-4] [F7] Handle generation failures gracefully

- Update preview page with error boundary
- Show user-friendly error messages
- Add "Retry Generation" button
- Link to support/docs for common errors
- Log errors to console for debugging
- Preserve workflow state on error
- Show different messages for different error types (400, 500, timeout)

Generation errors handled gracefully.
```

**Files**:
- `app/src/app/preview/page.tsx` (modified)

**Test**: Mock API error, verify error UI

**Duration**: 1 hour

---

## 🔗 Integration Stream (I1-I5) - Week 2, Days 1-2

**Goal**: Cross-cutting E2E tests and validation

**Dependencies**: Requires B1-B15 (Backend) and F1-F7 (Frontend) to be complete

---

### I1: Add end-to-end generation integration tests
**Scope**: Integration Testing
```bash
test(integration): add E2E generation workflow tests

[Epic-4] [I1] Test full workflow from tokens to generated code

- Create backend/tests/integration/test_generation_e2e.py
- Test full workflow: tokens → requirements → pattern → generation
- Use real pattern library (backend/data/patterns/)
- Mock Epic 1 token extraction (real tokens JSON)
- Mock Epic 2 requirement proposals (real requirements JSON)
- Use real Epic 3 pattern retrieval
- Verify generated code structure
- Verify TypeScript syntax (basic validation)
- Verify all imports present

E2E generation workflow validated.
```

**Files**:
- `backend/tests/integration/test_generation_e2e.py` (new)

**Test**: `pytest backend/tests/integration/test_generation_e2e.py -v`

**Duration**: 2 hours

---

### I2: Add frontend E2E tests with Playwright
**Scope**: Integration Testing
```bash
test(integration): add Playwright E2E tests for generation UI

[Epic-4] [I2] Test preview page generation flow with real backend

- Create app/tests/e2e/generation.spec.ts
- Test navigation: extract → requirements → patterns → preview
- Test generation triggers on preview page load
- Test loading state displayed
- Test generated code rendered
- Test download button works
- Test error state if generation fails
- Run against local backend (http://localhost:8000)

Frontend E2E generation flow validated.
```

**Files**:
- `app/tests/e2e/generation.spec.ts` (new)

**Test**: `npm run test:e2e -- generation.spec.ts`

**Duration**: 2 hours

---

### I3: Add real-time progress tracking (backend → frontend)
**Scope**: Integration Feature
```bash
feat(integration): add real-time generation progress updates

[Epic-4] [I3] Stream progress from backend to frontend

- Update backend/src/generation/generator_service.py
- Add progress callback mechanism
- Emit stage events (PARSING, INJECTING, GENERATING, ASSEMBLING)
- Update frontend GenerationProgress.tsx to receive real events
- Use Server-Sent Events (SSE) or WebSocket for streaming (optional)
- For MVP: poll /api/v1/generation/status endpoint
- Update progress bar based on real backend stages

Real-time progress tracking complete.
```

**Files**:
- `backend/src/generation/generator_service.py` (modified)
- `app/src/components/composite/GenerationProgress.tsx` (modified)
- `backend/src/api/v1/routes/generation.py` (modified - add /status endpoint)

**Test**: Generate component, verify progress updates in real-time

**Duration**: 2 hours

---

### I4: Add performance validation and latency monitoring
**Scope**: Integration Testing
```bash
test(integration): add performance and latency validation

[Epic-4] [I4] Validate p50 ≤60s and p95 ≤90s targets

- Create backend/tests/performance/test_generation_latency.py
- Run 20 generation requests (Button, Card, Input)
- Measure latency for each request
- Calculate p50, p95, p99 percentiles
- Verify p50 ≤60s target
- Verify p95 ≤90s target
- Generate performance report
- Add Prometheus metrics for generation_latency_seconds

Performance targets validated.
```

**Files**:
- `backend/tests/performance/test_generation_latency.py` (new)
- `backend/src/monitoring/metrics.py` (modified)

**Test**: `pytest backend/tests/performance/test_generation_latency.py -v`

**Duration**: 1.5 hours

---

### I5: Add LangSmith trace validation
**Scope**: Integration Monitoring
```bash
feat(integration): validate LangSmith tracing coverage

[Epic-4] [I5] Ensure 100% LangSmith trace coverage

- Verify all generation stages traced in LangSmith
- Add trace validation script (backend/scripts/validate_traces.py)
- Check trace hierarchy (parse → inject → generate → assemble)
- Verify trace metadata (latency, token_count, cost)
- Add trace screenshots to documentation
- Verify traces visible in LangSmith dashboard

LangSmith tracing complete and validated.
```

**Files**:
- `backend/scripts/validate_traces.py` (new)
- `backend/src/generation/generator_service.py` (modified - ensure all stages traced)

**Test**: Generate component, verify trace in LangSmith

**Duration**: 1 hour

---

## ✨ Polish Stream (P1-P8) - Week 2, Days 3-4

**Goal**: Production enhancements and documentation

**Dependencies**: Requires B1-B15, F1-F7, I1-I5 to be complete

---

### P1: Implement provenance header generator
**Scope**: Task 8
```bash
feat(backend): add provenance headers to generated code

[Epic-4] [P1] Track generation source and metadata

- Create backend/src/generation/provenance.py
- Generate provenance header comment with pattern ID, version
- Add generation timestamp (ISO 8601 UTC)
- Add tokens hash and requirements hash (SHA-256)
- Add warning about manual edits
- Store provenance metadata in PostgreSQL (defer to Epic 8)
- Include provenance in all generated files
- Update code_assembler to prepend provenance header

Generated code includes provenance tracking.
```

**Files**:
- `backend/src/generation/provenance.py` (new)
- `backend/src/generation/code_assembler.py` (modified)

**Test**: Verify provenance header format

**Duration**: 1.5 hours

---

### P2: Implement import resolver
**Scope**: Task 9
```bash
feat(backend): add import resolution and ordering

[Epic-4] [P2] Resolve and order imports correctly

- Create backend/src/generation/import_resolver.py
- Resolve React, shadcn/ui, utility, type imports
- Order imports: external, internal, utils, types
- Handle alias imports (@/ for src/)
- Add missing imports automatically
- Remove unused imports (basic analysis)
- Generate package.json dependencies list
- Update code_assembler to use import_resolver

Import resolution complete.
```

**Files**:
- `backend/src/generation/import_resolver.py` (new)
- `backend/src/generation/code_assembler.py` (modified)

**Test**: Generate component, verify import order

**Duration**: 1.5 hours

---

### P3: Implement accessibility enhancer
**Scope**: Task 5
```bash
feat(backend): add ARIA attributes and semantic HTML

[Epic-4] [P3] Enhance components with accessibility features

- Create backend/src/generation/a11y_enhancer.py
- Add ARIA attributes (aria-label, aria-disabled, aria-busy)
- Use semantic HTML elements (<button>, <input>, <label>)
- Add keyboard navigation support (tabIndex, onKeyDown)
- Implement focus indicators
- Add screen reader text where needed
- Component-specific rules (Button, Input, Card)
- Update generator_service to call a11y_enhancer

Generated components are accessible.
```

**Files**:
- `backend/src/generation/a11y_enhancer.py` (new)
- `backend/src/generation/generator_service.py` (modified)

**Test**: Verify ARIA attributes present

**Duration**: 2 hours

---

### P4: Implement TypeScript type generator
**Scope**: Task 6
```bash
feat(backend): add TypeScript strict type generation

[Epic-4] [P4] Generate strict TypeScript with zero `any` types

- Create backend/src/generation/type_generator.py
- Generate prop interfaces with proper types
- Add return type annotations for functions
- Use TypeScript utility types (Omit, Pick, Partial)
- Add JSDoc comments for complex types
- Generate union types for variants
- Handle ref forwarding with proper types
- Validate generated code with `tsc --noEmit` (optional)
- Update generator_service to call type_generator

Generated code is TypeScript strict mode compliant.
```

**Files**:
- `backend/src/generation/type_generator.py` (new)
- `backend/src/generation/generator_service.py` (modified)

**Test**: Generate types, verify no `any` types

**Duration**: 2 hours

---

### P5: Implement Storybook story generator
**Scope**: Task 7
```bash
feat(backend): add Storybook story generation

[Epic-4] [P5] Generate Storybook stories for all variants

- Create backend/src/generation/storybook_generator.py
- Generate Storybook 8 (CSF 3.0) format stories
- Create stories for all variants (primary, secondary, ghost, etc.)
- Include interactive controls for props
- Add documentation in MDX format (defer to post-MVP)
- Generate example code snippets
- Add story for each state (default, hover, disabled, loading)
- Update code_assembler to generate .stories.tsx file

Generated components have Storybook stories.
```

**Files**:
- `backend/src/generation/storybook_generator.py` (new)
- `backend/src/generation/code_assembler.py` (modified)

**Test**: Generate stories, verify CSF 3.0 format

**Duration**: 2 hours

---

### P6: Add comprehensive polish tests
**Scope**: Testing
```bash
test(backend): add tests for polish enhancements

[Epic-4] [P6] Test provenance, imports, a11y, types, stories

- Create backend/tests/generation/test_provenance.py
- Create backend/tests/generation/test_import_resolver.py
- Create backend/tests/generation/test_a11y_enhancer.py
- Create backend/tests/generation/test_type_generator.py
- Create backend/tests/generation/test_storybook_generator.py
- Verify all enhancements work correctly
- Test integration with generator_service

All polish enhancements tested.
```

**Files**:
- `backend/tests/generation/test_provenance.py` (new)
- `backend/tests/generation/test_import_resolver.py` (new)
- `backend/tests/generation/test_a11y_enhancer.py` (new)
- `backend/tests/generation/test_type_generator.py` (new)
- `backend/tests/generation/test_storybook_generator.py` (new)

**Test**: `pytest backend/tests/generation/ -v --cov`

**Duration**: 2 hours

---

### P7: Update documentation with generation API
**Scope**: Documentation
```bash
docs(generation): document generation API and architecture

[Epic-4] [P7] Add API docs, architecture diagrams, examples

- Update backend/src/generation/README.md with architecture
- Document generation pipeline flow diagram
- Add API endpoint documentation with curl examples
- Document latency targets (p50 ≤60s, p95 ≤90s)
- Add troubleshooting guide for common errors
- Document extension points for custom generators
- Add sequence diagrams for each stage
- Document all configuration options

Epic 4 documentation complete.
```

**Files**:
- `backend/src/generation/README.md` (modified)
- `.claude/epics/04-code-generation.md` (modified - add implementation notes)

**Test**: Review docs, verify accuracy

**Duration**: 1.5 hours

---

### P8: Epic 4 completion and demo preparation
**Scope**: Demo
```bash
chore(epic-4): mark Epic 4 complete and prepare demo

[Epic-4] [P8] Code generation pipeline production-ready

- Update Epic 4 status to "Completed"
- Verify all acceptance criteria met
- Verify p50 latency ≤60s for Button/Card
- Verify TypeScript strict compilation passes
- Verify tokens injected correctly (≥95% accuracy)
- Verify all approved requirements implemented
- Verify ARIA attributes added appropriately
- Verify Storybook stories render correctly
- Verify provenance headers present
- Create demo script (backend/scripts/demo_generation.py)
- Record demo video showing full workflow

Epic 4: Code Generation COMPLETE ✅
```

**Files**:
- `.claude/epics/04-code-generation.md` (modified - status: Completed)
- `backend/scripts/demo_generation.py` (new)

**Test**: Full demo run through workflow

**Duration**: 1 hour

---

## 📊 Stream Summary

| Stream | Commits | Focus | Duration | Can Start |
|--------|---------|-------|----------|-----------|
| **Backend** | B1-B15 | Generation pipeline + API | 4 days | Immediately |
| **Frontend** | F1-F7 | UI + API integration | 1 day | After B12 |
| **Integration** | I1-I5 | E2E tests + validation | 2 days | After B15 + F7 |
| **Polish** | P1-P8 | Enhancements + docs | 2 days | After I5 |
| **Total** | **35 commits** | Full Epic 4 | **9 days** | - |

---

## 🔄 Parallelization Strategy

### Day 1-4: Backend Development
```
Developer 1: B1 → B2 → B3 → B4 → B5
Developer 2: B6 → B7 → B8 → B9
Developer 3: B10 → B11 → B12 → B13
Developer 4: B14 → B15
```

### Day 5: Frontend Development (After B12-B15 merged)
```
Developer 1: F1 → F2 → F3
Developer 2: F4 → F5
Developer 3: F6 → F7
```

### Day 6-7: Integration (After B15 + F7 merged)
```
Developer 1: I1 → I2
Developer 2: I3 → I4
Developer 3: I5
```

### Day 8-9: Polish (After I5 merged)
```
Developer 1: P1 → P2
Developer 2: P3 → P4
Developer 3: P5 → P6
All: P7 → P8 (docs + demo)
```

---

## ✅ Acceptance Criteria by Stream

### Backend Stream (B1-B15)
- [ ] Pattern parsing works for all 10 patterns
- [ ] Tokens injected correctly (≥95% accuracy)
- [ ] Tailwind classes generated properly
- [ ] Requirements implemented from Epic 2
- [ ] Code assembles with proper formatting
- [ ] Generation service orchestrates pipeline
- [ ] API endpoint returns valid responses

### Frontend Stream (F1-F7)
- [ ] Types match backend API contract
- [ ] API client calls backend successfully
- [ ] Query hook manages state correctly
- [ ] Preview page shows real generated code
- [ ] Progress UI displays generation stages
- [ ] Error handling works gracefully

### Integration Stream (I1-I5)
- [ ] E2E tests pass (backend + frontend)
- [ ] Playwright tests pass for UI flow
- [ ] Real-time progress updates work
- [ ] Performance targets met (p50 ≤60s, p95 ≤90s)
- [ ] LangSmith traces complete

### Polish Stream (P1-P8)
- [ ] Provenance headers in all files
- [ ] Imports resolved and ordered
- [ ] ARIA attributes present
- [ ] TypeScript strict mode (no `any`)
- [ ] Storybook stories generated
- [ ] All tests passing
- [ ] Documentation complete

---

## 🎯 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Latency (p50)** | ≤60s | LangSmith traces for Button/Card |
| **Latency (p95)** | ≤90s | 95th percentile generation time |
| **Token Injection Accuracy** | ≥95% | Correct token values in code |
| **Requirements Implementation** | 100% | All approved requirements present |
| **TypeScript Compilation** | 100% | All generated components compile |
| **Test Coverage** | ≥90% | Backend generation module coverage |

---

## 🚨 Merge Order (Critical Path)

```
1. Merge Backend Stream (B1-B15) ← FIRST
   ├─ Establishes API contract
   └─ Enables frontend development

2. Merge Frontend Stream (F1-F7) ← SECOND
   ├─ Consumes backend API
   └─ Enables E2E testing

3. Merge Integration Stream (I1-I5) ← THIRD
   ├─ Validates end-to-end workflow
   └─ Confirms performance targets

4. Merge Polish Stream (P1-P8) ← LAST
   └─ Production-ready enhancements
```

**Do NOT merge streams out of order** - Integration tests will fail

---

## 📝 Testing Strategy

### Backend Stream Tests
- **Unit Tests**: Each generator module (B3, B5, B7, B9, B11)
- **Integration Tests**: Generator service E2E (B13)
- **Coverage Target**: ≥90% for generation module

### Frontend Stream Tests
- **Unit Tests**: API client (F3)
- **Component Tests**: Preview page, progress UI
- **Mock Backend**: Use MSW for API mocking

### Integration Stream Tests
- **E2E Backend**: Full workflow tests (I1)
- **E2E Frontend**: Playwright tests (I2)
- **Performance**: Latency validation (I4)

### Polish Stream Tests
- **Unit Tests**: Each enhancement module (P6)
- **Integration**: Verify enhancements in full pipeline

---

## 🎓 Key Learnings

### Stream-Based Benefits
1. **Parallel Work**: Backend and frontend teams work independently
2. **Clear Ownership**: Each stream has dedicated owner
3. **Easier Reviews**: Domain experts review their stream
4. **Flexible Merging**: Streams can be merged based on priority

### Risk Mitigation
- **Risk**: Backend delays frontend → **Mitigation**: B12-B15 prioritized early
- **Risk**: Integration failures → **Mitigation**: I1-I5 validates everything
- **Risk**: Polish delays launch → **Mitigation**: P1-P8 can be deferred post-MVP

---

## 🎬 Demo Script

**After P8, demo Epic 4:**

1. **Start from Dashboard** (`/`)
2. **Upload screenshot** (`/extract`) - Generate tokens
3. **Review requirements** (`/requirements`) - Approve proposals
4. **Select pattern** (`/patterns`) - Choose Button pattern
5. **View generated code** (`/preview`)
   - Show generation progress (≤60s)
   - Show generated TypeScript component
   - Show Storybook stories
   - Show quality metrics
   - Download ZIP
6. **Show LangSmith trace** - Pipeline stages and timing
7. **Show backend logs** - Structured logging

**Talking Points**:
- "ComponentForge generates production-ready components in 60 seconds"
- "Full TypeScript strict mode, zero `any` types"
- "Accessibility built-in with ARIA attributes"
- "Storybook stories included for free"
- "Provenance tracking for regeneration"

---

## 📚 References

- **Epic 4 Spec**: [04-code-generation.md](./04-code-generation.md)
- **Wireframe**: [component-preview-page.html](../wireframes/component-preview-page.html)
- **Pattern Library**: `backend/data/patterns/`
- **LangSmith Docs**: https://docs.smith.langchain.com/
- **TypeScript Strict Mode**: https://www.typescriptlang.org/tsconfig#strict
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Storybook CSF 3.0**: https://storybook.js.org/docs/react/api/csf

---

**Epic 4: Code Generation - Production-ready components in ≤60s** 🚀

**4 Streams | 35 Commits | 9 Days | Parallel Development Ready**
