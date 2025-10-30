# Epic 2: Commit Strategy & Breakdown

## Overview

Breaking Epic 2 into **22 atomic commits** organized into 4 phases. Each commit is self-contained, testable, and follows the dependency chain.

---

## Dependency Analysis

```
Task 1 (Component Classifier) ──────────┐
                                        ├──> Task 2-5 (Requirement Proposers) ──┐
                                        │    (Props, Events, States, A11y)       │
                                        │                                        │
                                        └────────────────────────────────────────┤
                                                                                 │
                                                                                 ├──> Task 6 (Approval Panel UI)
                                                                                 │
                                                                                 ├──> Task 7 (Requirement Editing)
                                                                                 │
                                                                                 └──> Task 8 (Export & Integration)
```

**Critical Path**: Task 1 → Task 2-5 → Task 6 → Task 7 → Task 8

**Parallel Streams**:
- Stream A: Task 1 (Component Classifier - foundation)
- Stream B: Tasks 2-5 (Requirement Proposers - can parallelize after Task 1)
- Stream C: Task 6 (Approval Panel - needs Task 1 complete)
- Stream D: Task 7 (Editing - needs Task 6 UI)
- Stream E: Task 8 (Export - needs approved requirements)

---

## Phase 1: AI Infrastructure (Commits 1-6)
**Goal**: Setup LangChain agents, prompts, and component classification

### Commit 1: Add requirement domain types
**Scope**: Foundation types
```bash
feat(types): add requirement proposal domain types

- Create backend/src/types/requirement_types.py with Pydantic models
- Add RequirementCategory enum (props, events, states, accessibility)
- Add RequirementProposal model with confidence, rationale
- Add RequirementState type for LangGraph orchestrator state
- Add ComponentType enum (Button, Card, Input, Select, Badge, Alert)
- Add ConfidenceLevel thresholds (HIGH ≥0.9, MEDIUM 0.7-0.9, LOW <0.7)
- Create app/src/types/requirement.types.ts for frontend

Types define requirement proposal contract.
```

**Files**:
- `backend/src/types/requirement_types.py` (new)
- `app/src/types/requirement.types.ts` (new)

**Test**: Import types, verify Pydantic validation, no type errors

---

### Commit 2: Setup LangChain component classifier agent
**Scope**: Task 1 (partial)
```bash
feat(ai): create component type inference agent with GPT-4V

- Create backend/src/agents/component_classifier.py
- Use GPT-4V for visual analysis of screenshots
- Parse Figma layer names when available
- Return ComponentType with confidence score
- Handle ambiguous cases (return top 3 candidates)
- Add structured output parsing with Pydantic

Classifier ready for visual component detection.
```

**Files**:
- `backend/src/agents/component_classifier.py` (new)

**Test**: Mock GPT-4V response, verify structured output parsing

---

### Commit 3: Add component classifier prompts and few-shot examples
**Scope**: Task 1 (partial)
```bash
feat(ai): add component classifier prompts with examples

- Create backend/src/prompts/component_classifier.txt
- Add few-shot examples for Button, Card, Input detection
- Include visual cue analysis (shape, layout, interactive elements)
- Add Figma layer name parsing examples
- Include ambiguous case handling
- Target 85%+ accuracy with examples

Prompt engineering for component type inference.
```

**Files**:
- `backend/src/prompts/component_classifier.txt` (new)

**Test**: Load prompt, verify few-shot format, test with sample images

---

### Commit 4: Add LangSmith tracing for component classifier
**Scope**: Task 1 (final)
```bash
feat(observability): add LangSmith tracing to component classifier

- Add @traceable decorator to classify_component()
- Log input: screenshot/Figma data, tokens
- Log output: component type, confidence, candidates
- Track latency (target <5s)
- Add error tracking for classification failures
- Configure LANGCHAIN_PROJECT env var

Component classifier fully instrumented.
✅ MILESTONE: Component type inference operational with observability
```

**Files**:
- `backend/src/agents/component_classifier.py` (modified)

**Test**: Trigger classification, verify traces in LangSmith dashboard

---

### Commit 5: Create requirement proposal orchestrator
**Scope**: Architecture setup
```bash
feat(ai): create requirement proposal orchestrator with LangGraph

- Create backend/src/agents/requirement_orchestrator.py
- Use LangGraph for multi-agent state management
- Define RequirementState with component_type, tokens, proposals
- Add orchestration flow: classify → propose props/events/states/a11y
- Implement parallel execution for requirement proposers
- Target p50 latency ≤15s

Orchestrator ready for requirement proposers.
```

**Files**:
- `backend/src/agents/requirement_orchestrator.py` (new)

**Test**: Mock proposers, verify state transitions, check parallel execution

---

### Commit 6: Add requirement proposer base class
**Scope**: Shared infrastructure
```bash
feat(ai): create base requirement proposer class

- Create backend/src/agents/base_proposer.py
- Define abstract RequirementProposer with propose() method
- Add confidence scoring helper (0.0-1.0)
- Add rationale generation with visual cue citation
- Add LangSmith tracing decorator
- Implement error handling with retries

Base class for all requirement proposers.
```

**Files**:
- `backend/src/agents/base_proposer.py` (new)

**Test**: Verify abstract class, test confidence scoring logic

---

## Phase 2: Requirement Proposers (Commits 7-14)
**Goal**: Build specialized agents for props, events, states, accessibility

### Commit 7: Add props requirement proposer
**Scope**: Task 2 (partial)
```bash
feat(ai): implement props requirement proposer

- Create backend/src/agents/props_proposer.py extending BaseProposer
- Detect variant props from visual differences
- Detect size props (sm, md, lg) from dimensions
- Detect boolean props (disabled, loading, fullWidth)
- Parse Figma variants when available
- Generate confidence per prop with rationale

Props proposer detects component variations.
```

**Files**:
- `backend/src/agents/props_proposer.py` (new)

**Test**: Mock visual analysis, verify prop detection, check confidence scores

---

### Commit 8: Add props proposer prompts and examples
**Scope**: Task 2 (final)
```bash
feat(ai): add props proposer prompts with few-shot examples

- Create backend/src/prompts/props_proposer.txt
- Add examples for variant detection (primary, secondary, ghost)
- Add size detection examples with dimension analysis
- Add boolean prop examples (disabled state, loading spinner)
- Include Figma variant parsing examples
- Target high precision for common props

Props prompt engineering complete.
✅ MILESTONE: Props proposal functional
```

**Files**:
- `backend/src/prompts/props_proposer.txt` (new)

**Test**: Load prompt, test with Button/Card examples, verify output format

---

### Commit 9: Add events requirement proposer
**Scope**: Task 3 (partial)
```bash
feat(ai): implement events requirement proposer

- Create backend/src/agents/events_proposer.py extending BaseProposer
- Detect onClick for clickable elements (cursor: pointer)
- Detect onChange for inputs (text cursor, editable)
- Detect onHover/onFocus from interactive states
- Infer required vs optional based on component type
- Generate confidence from visual cues

Events proposer detects interaction handlers.
```

**Files**:
- `backend/src/agents/events_proposer.py` (new)

**Test**: Mock cursor styles, verify event detection, check required flags

---

### Commit 10: Add events proposer prompts
**Scope**: Task 3 (final)
```bash
feat(ai): add events proposer prompts with interaction examples

- Create backend/src/prompts/events_proposer.txt
- Add onClick detection from cursor:pointer style
- Add onChange examples for input fields
- Add onHover/onFocus detection from state layers
- Include event handler naming conventions
- Target correct required/optional inference

Events prompt engineering complete.
✅ MILESTONE: Events proposal functional
```

**Files**:
- `backend/src/prompts/events_proposer.txt` (new)

**Test**: Test with interactive components, verify event handlers

---

### Commit 11: Add states requirement proposer
**Scope**: Task 4 (partial)
```bash
feat(ai): implement states/variants requirement proposer

- Create backend/src/agents/states_proposer.py extending BaseProposer
- Detect hover states from color/shadow changes
- Detect focus states from outline/ring styles
- Detect disabled states from opacity/cursor changes
- Detect loading states from spinner/skeleton
- Parse Figma component properties for states

States proposer detects visual state variations.
```

**Files**:
- `backend/src/agents/states_proposer.py` (new)

**Test**: Mock state layers, verify state detection, check descriptions

---

### Commit 12: Add states proposer prompts
**Scope**: Task 4 (final)
```bash
feat(ai): add states proposer prompts with state examples

- Create backend/src/prompts/states_proposer.txt
- Add hover state detection examples (background-opacity-90)
- Add focus state examples (ring, outline)
- Add disabled state examples (opacity-50, cursor-not-allowed)
- Add loading state examples (spinner, skeleton)
- Include Figma property parsing

States prompt engineering complete.
✅ MILESTONE: States proposal functional
```

**Files**:
- `backend/src/prompts/states_proposer.txt` (new)

**Test**: Test with stateful components, verify all states detected

---

### Commit 13: Add accessibility requirement proposer
**Scope**: Task 5 (partial)
```bash
feat(ai): implement accessibility requirement proposer

- Create backend/src/agents/a11y_proposer.py extending BaseProposer
- Detect required fields from asterisk/"Required" text
- Propose ARIA labels for icon-only buttons
- Propose semantic HTML (button vs div)
- Detect keyboard navigation requirements
- Infer validation rules from field context

A11y proposer ensures accessible components.
```

**Files**:
- `backend/src/agents/a11y_proposer.py` (new)

**Test**: Mock icon buttons, verify aria-label proposals, check semantic HTML

---

### Commit 14: Add accessibility proposer prompts
**Scope**: Task 5 (final)
```bash
feat(ai): add accessibility proposer prompts with a11y examples

- Create backend/src/prompts/a11y_proposer.txt
- Add ARIA label examples for icon-only components
- Add semantic HTML detection (button, input, label)
- Add keyboard navigation requirements (tab, enter, escape)
- Add validation rule detection (required, email, min/max)
- Target WCAG 2.1 AA compliance

A11y prompt engineering complete.
✅ MILESTONE: All requirement proposers functional
```

**Files**:
- `backend/src/prompts/a11y_proposer.txt` (new)

**Test**: Test accessibility proposals, verify WCAG compliance suggestions

---

## Phase 3: API & UI Integration (Commits 15-19)
**Goal**: Build approval panel UI and requirement editing

### Commit 15: Add requirement proposal API endpoint
**Scope**: Backend API
```bash
feat(api): add requirement proposal endpoint

- Create backend/src/api/requirements.py
- Add POST /requirements/propose endpoint
- Accept screenshot/Figma + tokens as input
- Call requirement_orchestrator for proposals
- Return proposals grouped by category
- Add latency monitoring (target ≤15s p50)
- Add error handling for AI failures

API endpoint ready for frontend integration.
```

**Files**:
- `backend/src/api/requirements.py` (new)

**Test**: Mock orchestrator, test API response format, verify latency

---

### Commit 16: Add frontend requirement API client and hooks
**Scope**: Frontend integration
```bash
feat(api): add requirement proposal API client and hooks

- Create app/src/lib/api/requirements.api.ts
- Add proposeRequirements() API function
- Create app/src/lib/query/hooks/useRequirementProposal.ts
- Use useMutation for POST /requirements/propose
- Import useWorkflowStore from stores/useWorkflowStore
- Update useWorkflowStore with proposals on success
- Add loading, error, success states

Frontend ready to call requirement proposal API.
```

**Files**:
- `app/src/lib/api/requirements.api.ts` (new)
- `app/src/lib/query/hooks/useRequirementProposal.ts` (new)

**Test**: Mock API call, verify hook updates store, check state handling

---

### Commit 17: Build approval panel UI with requirement cards
**Scope**: Task 6 (partial)
```bash
feat(ui): create requirement approval panel with category sections

- Verify Epic 1 UI components exist (Card, Badge, Button, Progress, Alert)
- Create app/src/components/requirements/ApprovalPanel.tsx
- Create app/src/components/requirements/RequirementCard.tsx
- Display proposals grouped by category (Props, Events, States, A11y)
- Show confidence score with visual indicator (color, progress bar)
- Show rationale on hover/expand with Tooltip
- Add bulk actions toolbar (Accept All, Review Low Confidence)
- Use Card, Badge, Progress components from Epic 1

Approval panel structure complete.
```

**Files**:
- `app/src/components/requirements/ApprovalPanel.tsx` (new)
- `app/src/components/requirements/RequirementCard.tsx` (new)

**Test**: Render with mock proposals, verify grouping, check visual indicators

---

### Commit 18: Add requirement actions (accept, edit, remove)
**Scope**: Task 6 (final)
```bash
feat(ui): implement requirement approval actions

- Add Accept button with green checkmark to RequirementCard
- Add Edit button opening EditModal
- Add Remove button with confirmation
- Highlight low-confidence items (<0.8) with warning badge
- Implement Accept All bulk action
- Implement Review Low Confidence filter
- Update approval state in useWorkflowStore

Approval panel fully interactive.
✅ MILESTONE: Requirement review UX complete
```

**Files**:
- `app/src/components/requirements/RequirementCard.tsx` (modified)
- `app/src/components/requirements/ApprovalPanel.tsx` (modified)

**Test**: Click actions, verify state updates, test bulk actions

---

### Commit 19: Add requirement editor modal
**Scope**: Task 7
```bash
feat(ui): create requirement editor with validation

- Create app/src/components/requirements/RequirementEditor.tsx
- Edit requirement name, values, description in modal
- Add custom requirement creation (not AI-detected)
- Validate prop names (valid TypeScript identifiers)
- Validate event handlers (onClick, onChange format)
- Validate values (arrays, booleans, strings)
- Show validation errors inline with Alert
- Auto-save drafts to localStorage

Requirement editing fully functional.
✅ MILESTONE: Users can customize AI proposals
```

**Files**:
- `app/src/components/requirements/RequirementEditor.tsx` (new)

**Test**: Edit requirements, add custom, test validation, verify draft save

---

## Phase 4: Export & Integration (Commits 20-22)
**Goal**: Export approved requirements and integrate with Epic 3/4

### Commit 20: Add requirements export service
**Scope**: Task 8 (partial)
```bash
feat(export): implement requirements export service

- Create backend/src/services/requirement_exporter.py
- Export approved requirements as JSON
- Include metadata (component type, confidence, timestamp)
- Add approval status per requirement (approved, edited)
- Store in PostgreSQL for audit trail
- Add export preview generation

Export service ready for API integration.
```

**Files**:
- `backend/src/services/requirement_exporter.py` (new)

**Test**: Mock approved requirements, verify JSON format, check metadata

---

### Commit 21: Add requirements export API and frontend
**Scope**: Task 8 (partial)
```bash
feat(api): add requirements export endpoint and UI

- Add NEW endpoint POST /requirements/export to backend (separate from /propose)
- Create app/src/lib/api/requirements.api.ts exportRequirements()
- Create app/src/components/requirements/ExportPreview.tsx
- Show export preview before saving
- Display approval summary (total, approved, edited)
- Add "Export & Continue" button → /patterns
- Download requirements.json to client

Export UI complete.
```

**Files**:
- `backend/src/api/requirements.py` (modified)
- `app/src/lib/api/requirements.api.ts` (modified)
- `app/src/components/requirements/ExportPreview.tsx` (new)

**Test**: Export requirements, verify JSON download, check preview accuracy

---

### Commit 22: Integrate requirements with Epic 3/4 pipeline
**Scope**: Task 8 (final)
```bash
feat(integration): connect requirements to retrieval and generation

- Send approved requirements to Pattern Retrieval (Epic 3) as query context
- Send requirements to Code Generation (Epic 4) for implementation
- Update app/src/app/requirements/page.tsx with full workflow
- Add navigation to /patterns with requirements in URL params
- Add success metrics display (precision, recall targets)
- Add latency tracking (p50 ≤15s goal)

Requirements pipeline integrated with downstream epics.

Closes #XX (Epic 2: Requirement Proposal & Review)
✅ MILESTONE: Epic 2 complete, requirements flow to Epic 3/4
```

**Files**:
- `app/src/app/requirements/page.tsx` (modified)
- Integration points for Epic 3/4 (future)

**Test**: Full flow from proposal → approval → export → patterns, verify data passed

---

## Commit Message Format

All commits follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

**Scopes**: `types`, `ai`, `observability`, `api`, `ui`, `export`, `integration`

---

## Testing Strategy Per Commit

### Phase 1 (AI Infrastructure)
- **Commits 1-3**: Type validation, prompt loading, mock GPT-4V
- **Commit 4**: LangSmith traces visible in dashboard
- **Commits 5-6**: Orchestrator state transitions, base class logic

### Phase 2 (Requirement Proposers)
- **Commits 7-14**: Mock visual analysis, test proposer output, verify prompts

### Phase 3 (API & UI)
- **Commits 15-16**: API endpoint response, hook state management
- **Commits 17-19**: Visual testing, interaction testing, validation

### Phase 4 (Export & Integration)
- **Commits 20-22**: JSON export format, E2E workflow testing

---

## Rollback Strategy

Each commit is atomic and can be reverted independently:

```bash
# Revert last commit
git revert HEAD

# Revert specific commit
git revert <commit-hash>

# Revert phase (e.g., Phase 2 proposers)
git revert HEAD~15..HEAD~7
```

**Safe to revert**:
- Phase 4 commits (20-22) - Export can be re-implemented
- Individual proposers (7-14) - Other proposers work
- UI commits (17-19) - API still functional

**Risky to revert** (breaks dependencies):
- Commit 1 (types) - Everything depends on types
- Commit 5 (orchestrator) - Proposers need orchestration
- Commit 15 (API) - Frontend needs backend endpoint

---

## Branch Strategy (Optional)

Can use feature branches per phase:

```bash
# Phase 1: AI Infrastructure
git checkout -b epic-2/phase-1-ai-infrastructure
# Commits 1-6
git push origin epic-2/phase-1-ai-infrastructure

# Phase 2: Requirement Proposers
git checkout -b epic-2/phase-2-proposers
# Commits 7-14
git push origin epic-2/phase-2-proposers

# Phase 3: API & UI
git checkout -b epic-2/phase-3-api-ui
# Commits 15-19
git push origin epic-2/phase-3-api-ui

# Phase 4: Export & Integration
git checkout -b epic-2/phase-4-export
# Commits 20-22
git push origin epic-2/phase-4-export
```

Or work directly on `main` if preferred.

---

## Estimated Timeline

**Total**: 22 commits

- **Phase 1** (6 commits): ~6 hours (AI infrastructure, prompts)
- **Phase 2** (8 commits): ~8 hours (4 proposers with prompts)
- **Phase 3** (5 commits): ~6 hours (API, UI, editing)
- **Phase 4** (3 commits): ~3 hours (export, integration)

**Total Estimate**: ~23 hours

**Per Commit Average**: ~60 minutes

---

## Key Principles

1. ✅ **Atomic**: Each commit is self-contained and testable
2. ✅ **Sequential**: Commits follow dependency order
3. ✅ **Reversible**: Any commit can be reverted safely
4. ✅ **Traceable**: Clear commit messages with scope
5. ✅ **Incremental**: Progressive enhancement, no big bangs
6. ✅ **Observable**: LangSmith tracing for all AI operations

---

## Success Metrics (Epic 2)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Component Type Accuracy** | ≥85% | Eval on labeled dataset |
| **Requirement Precision** | ≥80% | True positives / (TP + FP) |
| **Requirement Recall** | ≥70% | True positives / (TP + FN) |
| **Proposal Latency** | p50 ≤15s | LangSmith traces |
| **User Edit Rate** | <30% | % requirements edited |

**Eval Set**: 20 labeled examples (Button, Card, Input, etc.)

---

## Definition of Done (Per Commit)

- [ ] Code compiles without errors
- [ ] Types are correct (Python/TypeScript)
- [ ] Manual/automated testing passed
- [ ] Commit message follows convention
- [ ] No broken imports or dependencies
- [ ] LangSmith traces working (AI commits)
- [ ] Existing functionality unaffected

---

## Integration with Epic 1

**Dependencies from Epic 1**:
- Design tokens (input to requirement proposal)
- Component library (Card, Badge, Progress, Alert, Modal)
- Token extraction API (provides visual context)

**Data Flow**:
```
Epic 1: Screenshot/Figma → Tokens
         ↓
Epic 2: Tokens + Visual → Requirements
         ↓
Epic 3: Requirements → Pattern Retrieval
         ↓
Epic 4: Requirements + Patterns → Code Generation
```

---

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Low precision (false positives) | Human review loop, confidence thresholds |
| Missed requirements (low recall) | Manual addition UI, prompt improvements |
| Slow proposal (>15s) | Parallel proposer execution, caching |
| Unclear rationales | Prompt tuning to cite visual cues |
| LangSmith API limits | Rate limiting, local fallback |

---

## Quick Reference

**Start Development**:
```bash
# Backend
cd backend && source venv/bin/activate
uvicorn src.main:app --reload

# Frontend
cd app && npm run dev

# Services
docker-compose up -d
```

**Verify LangSmith**:
```bash
# Check env vars
echo $LANGCHAIN_API_KEY
echo $LANGCHAIN_PROJECT

# View traces
open https://smith.langchain.com
```

**Run Tests**:
```bash
# Backend proposer tests
pytest backend/tests/agents/test_requirement_proposers.py -v

# Frontend component tests
cd app && npm test -- RequirementCard

# E2E requirement flow
cd app && npm run test:e2e -- requirements.spec.ts
```

---

## Next Steps After Epic 2

1. **Epic 3**: Use approved requirements for pattern retrieval
2. **Epic 4**: Use requirements + patterns for code generation
3. **Epic 5**: Validate generated code against requirements
4. **Epic 8**: Enable requirement versioning and regeneration

---

## Final Validation Checklist

- [x] All dependencies in correct order
- [x] Each commit is atomic and testable
- [x] Milestones clearly marked (4 major milestones)
- [x] LangSmith tracing on all AI operations
- [x] Types defined before implementation
- [x] Prompts separated from code
- [x] UI components reuse Epic 1 library
- [x] Export format matches downstream needs
- [x] Integration points with Epic 3/4 defined
