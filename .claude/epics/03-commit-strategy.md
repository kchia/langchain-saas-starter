# Epic 3: Pattern Retrieval - Git Commit Strategy

**Epic**: Pattern Retrieval & Matching
**Task Document**: [03-pattern-retrieval-tasks.md](./03-pattern-retrieval-tasks.md)
**Total Tasks**: 23 (8 Backend, 5 Frontend, 4 Integration, 6 Testing)

---

## 🎯 Commit Strategy Overview

This document defines a **granular, reviewable commit strategy** for Epic 3 implementation. Each commit represents a **logical, self-contained unit of work** that can be:
- ✅ Reviewed independently
- ✅ Tested in isolation
- ✅ Reverted if needed
- ✅ Tracked against task completion

---

## 📋 Commit Naming Convention

```
<type>(<scope>): <short description>

[Epic-3] [<task-id>] <detailed description>

- Bullet point of what changed
- Another change detail
- Related acceptance criteria met

Refs: #<issue-number>
```

### Types
- `feat`: New feature implementation
- `chore`: Non-feature work (setup, config, data)
- `test`: Test implementation
- `refactor`: Code refactoring without feature changes
- `fix`: Bug fixes
- `docs`: Documentation updates
- `style`: Code style/formatting changes

### Scopes
- `backend`: Backend code
- `frontend`: Frontend code
- `integration`: Integration code
- `test`: Test files
- `data`: Data files (patterns, eval datasets)
- `config`: Configuration files

### Task IDs
- `B1` - `B8`: Backend tasks
- `F1` - `F5`: Frontend tasks
- `I1` - `I4`: Integration tasks
- `T1` - `T6`: Testing tasks

---

## 🗂️ Phase 1: Backend Foundation (Week 1)

### B1: Pattern Library Curation (8 commits)

**Commit 1**: Setup pattern data structure
```bash
git commit -m "chore(data): setup pattern library structure

[Epic-3] [B1] Create pattern data directory and template

- Create backend/data/patterns/ directory
- Add pattern JSON schema template
- Document pattern structure in README
- Reference: button.json and card.json as examples

Refs: #epic-3"
```

**Commit 2-9**: Add individual patterns (one commit per pattern)
```bash
# Commit 2
git commit -m "feat(data): add Input pattern to library

[Epic-3] [B1] Curate Input component pattern from shadcn/ui

- Extract TypeScript code from shadcn/ui repository
- Create comprehensive metadata (props, variants, states, a11y)
- Validate TypeScript compilation
- Add usage examples

Pattern: backend/data/patterns/input.json
Refs: #epic-3"

# Commit 3
git commit -m "feat(data): add Select pattern to library

[Epic-3] [B1] Curate Select/Dropdown component pattern

- Extract Select component code from shadcn/ui
- Document props interface and variants
- Add accessibility features (keyboard navigation, ARIA)
- Include usage examples

Pattern: backend/data/patterns/select.json
Refs: #epic-3"

# Repeat for: badge.json, alert.json, checkbox.json, radio.json, switch.json, tabs.json
```

**Commit 10**: Validate pattern library
```bash
git commit -m "test(data): validate pattern library completeness

[Epic-3] [B1] Add validation script for pattern library

- Create backend/scripts/validate_patterns.py
- Validate all 10 patterns have required fields
- Check TypeScript code syntax
- Verify metadata completeness
- All 10 patterns pass validation ✅

Acceptance criteria met:
- ✅ 10 shadcn/ui patterns curated
- ✅ All patterns have valid JSON structure
- ✅ Metadata complete (props, variants, a11y)

Refs: #epic-3"
```

---

### B2: Qdrant Vector Store Setup (3 commits)

**Commit 11**: Verify Qdrant service
```bash
git commit -m "chore(config): verify Qdrant service configuration

[Epic-3] [B2] Ensure Qdrant service running in docker-compose

- Verify docker-compose.yml has Qdrant service
- Document Qdrant connection details
- Add health check endpoint verification
- Update .env.example with QDRANT_URL

Refs: #epic-3"
```

**Commit 12**: Run seed script
```bash
git commit -m "chore(data): seed Qdrant with pattern embeddings

[Epic-3] [B2] Execute seed_patterns.py to index all patterns

- Run python scripts/seed_patterns.py
- Create 'patterns' collection with 1536-dim vectors
- Index all 10 patterns with OpenAI embeddings
- Verify via Qdrant dashboard (http://localhost:6333/dashboard)

Acceptance criteria met:
- ✅ Qdrant collection 'patterns' created
- ✅ All 10 patterns indexed with embeddings
- ✅ COSINE distance metric configured
- ✅ HNSW indexing enabled

Refs: #epic-3"
```

**Commit 13**: Add Qdrant client service wrapper
```bash
git commit -m "feat(backend): add Qdrant client service wrapper

[Epic-3] [B2] Create reusable Qdrant service client

- Create backend/src/services/qdrant_client.py
- Abstract Qdrant connection and search operations
- Add connection pooling and error handling
- Document service usage

Refs: #epic-3"
```

---

### B8: Query Construction Service (2 commits)

**Commit 14**: Implement query builder
```bash
git commit -m "feat(backend): implement query builder for retrieval

[Epic-3] [B8] Transform requirements into retrieval queries

- Create backend/src/retrieval/query_builder.py
- Implement BM25 keyword query builder
- Implement semantic natural language query builder
- Add filter construction for Qdrant
- Handle edge cases (missing fields)

Acceptance criteria met:
- ✅ Transforms requirements.json correctly
- ✅ BM25 query has proper term weighting
- ✅ Semantic query is natural language

Refs: #epic-3"
```

**Commit 15**: Add query builder tests
```bash
git commit -m "test(backend): add tests for query builder

[Epic-3] [B8] Test query construction from requirements

- Create backend/tests/test_query_builder.py
- Test BM25 query generation
- Test semantic query generation
- Test filter construction
- Test edge cases (missing/incomplete requirements)

Refs: #epic-3"
```

---

### T1: Evaluation Dataset Creation (2 commits)

**Commit 16**: Create evaluation dataset
```bash
git commit -m "chore(data): create retrieval evaluation dataset

[Epic-3] [T1] Add 20+ labeled queries for evaluation

- Create backend/data/eval/retrieval_queries.json
- Add 20+ queries covering all component types
- Include edge cases (ambiguous, complex)
- Document query format and difficulty levels
- Add README.md explaining dataset

Acceptance criteria met:
- ✅ 20+ queries created
- ✅ Mix of difficulties (easy, medium, hard)
- ✅ All component types covered
- ✅ Ground truth validated

Refs: #epic-3"
```

**Commit 17**: Add evaluation dataset documentation
```bash
git commit -m "docs(data): document evaluation dataset usage

[Epic-3] [T1] Add comprehensive eval dataset documentation

- Document query format and schema
- Explain ground truth labeling process
- Add examples for each difficulty level
- Document how to add new test queries

Refs: #epic-3"
```

---

### B3: BM25 Lexical Search (3 commits)

**Commit 18**: Install BM25 dependency
```bash
git commit -m "chore(backend): add rank-bm25 dependency

[Epic-3] [B3] Install BM25 library for lexical search

- Add rank-bm25 to backend/requirements.txt
- Update pip freeze output
- Document library usage

Refs: #epic-3"
```

**Commit 19**: Implement BM25 retriever
```bash
git commit -m "feat(backend): implement BM25 lexical retriever

[Epic-3] [B3] Add keyword-based pattern search

- Create backend/src/retrieval/__init__.py
- Create backend/src/retrieval/bm25_retriever.py
- Implement multi-field weighted search
- Support camelCase/kebab-case tokenization
- Field weights: name(3), type(2), props(1.5), desc(1)

Acceptance criteria met:
- ✅ BM25 returns relevant results for keyword queries
- ✅ Multi-field weighting works correctly
- ✅ Handles queries like 'button with variants'

Refs: #epic-3"
```

**Commit 20**: Add BM25 tests
```bash
git commit -m "test(backend): add BM25 retriever tests

[Epic-3] [B3] Test keyword-based search functionality

- Create backend/tests/test_bm25_retriever.py
- Test basic search with expected ranking
- Test field weighting (name > type > props)
- Test edge cases (no results, special chars)
- Test tokenization (camelCase, kebab-case)

Refs: #epic-3"
```

---

## 🗂️ Phase 2: Core Retrieval (Week 2)

### B4: Semantic Search Implementation (3 commits)

**Commit 21**: Implement semantic retriever
```bash
git commit -m "feat(backend): implement semantic search retriever

[Epic-3] [B4] Add vector-based pattern search with Qdrant

- Create backend/src/retrieval/semantic_retriever.py
- Integrate OpenAI text-embedding-3-small
- Query Qdrant with cosine similarity
- Return top-k patterns with similarity scores

Acceptance criteria met:
- ✅ Semantic search returns contextually relevant patterns
- ✅ Similarity scores in 0-1 range
- ✅ Handles natural language queries

Refs: #epic-3"
```

**Commit 22**: Add embedding caching with Redis
```bash
git commit -m "feat(backend): add Redis caching for embeddings

[Epic-3] [B4] Cache query embeddings to reduce API calls

- Create backend/src/services/embedding_service.py
- Add Redis caching layer (1 hour TTL)
- Implement cache-aside pattern
- Add retry logic for OpenAI API errors

Acceptance criteria met:
- ✅ Caching reduces embedding API calls
- ✅ Retry logic handles API failures gracefully

Refs: #epic-3"
```

**Commit 23**: Add semantic retriever tests
```bash
git commit -m "test(backend): add semantic retriever tests

[Epic-3] [B4] Test vector search functionality

- Create backend/tests/test_semantic_retriever.py
- Mock OpenAI API calls
- Mock Qdrant search responses
- Test embedding generation
- Test similarity scoring
- Test error handling and retries

Refs: #epic-3"
```

---

### B5: Weighted Fusion (3 commits)

**Commit 24**: Implement weighted fusion
```bash
git commit -m "feat(backend): implement weighted fusion combiner

[Epic-3] [B5] Combine BM25 + Semantic with 0.3/0.7 weights

- Create backend/src/retrieval/weighted_fusion.py
- Normalize scores to 0-1 range
- Apply configurable weights (BM25: 0.3, Semantic: 0.7)
- Handle patterns appearing in only one retriever
- Return top-3 patterns with combined scores

Acceptance criteria met:
- ✅ Weighted fusion combines rankings effectively
- ✅ Normalization works correctly
- ✅ Handles edge cases (pattern in one retriever only)

Refs: #epic-3"
```

**Commit 25**: Add fusion tests
```bash
git commit -m "test(backend): add weighted fusion tests

[Epic-3] [B5] Test score combination and normalization

- Create backend/tests/test_weighted_fusion.py
- Test score normalization
- Test weighted combination
- Test edge cases (empty results, single retriever)
- Test configurable weights

Refs: #epic-3"
```

**Commit 26**: Add fusion integration test
```bash
git commit -m "test(backend): add BM25+Semantic fusion integration test

[Epic-3] [B5] Test complete fusion pipeline

- Test BM25 + Semantic + Fusion together
- Verify top-3 results are reasonable
- Compare against baseline (semantic-only)
- Measure ranking quality

Refs: #epic-3"
```

---

### B6: Explainability & Confidence Scoring (4 commits)

**Commit 27**: Implement explainer base class
```bash
git commit -m "feat(backend): add retrieval explainer base

[Epic-3] [B6] Create explainability framework

- Create backend/src/retrieval/explainer.py
- Implement confidence score calculation
- Add match highlighting (props, variants, a11y)
- Generate ranking details structure

Refs: #epic-3"
```

**Commit 28**: Add explanation generation
```bash
git commit -m "feat(backend): add human-readable explanations

[Epic-3] [B6] Generate natural language explanations

- Implement explanation text generation
- Identify why pattern was selected
- Highlight matching features
- Show retrieval method contributions

Acceptance criteria met:
- ✅ Explanations are clear and accurate
- ✅ Match highlights show relevant features

Refs: #epic-3"
```

**Commit 29**: Add confidence scoring algorithm
```bash
git commit -m "feat(backend): implement confidence scoring

[Epic-3] [B6] Calculate 0-1 confidence scores

- Compute confidence based on:
  - Final ranking score (normalized)
  - Agreement between BM25 and semantic
  - Pattern metadata completeness
- Return structured confidence data

Acceptance criteria met:
- ✅ Confidence scores correlate with relevance
- ✅ Scoring algorithm is transparent

Refs: #epic-3"
```

**Commit 30**: Add explainer tests
```bash
git commit -m "test(backend): add explainability tests

[Epic-3] [B6] Test explanation and confidence generation

- Create backend/tests/test_explainer.py
- Test match highlighting
- Test confidence calculation
- Test explanation text generation
- Test edge cases (low confidence, no matches)

Refs: #epic-3"
```

---

### B7: Retrieval API Endpoint (5 commits)

**Commit 31**: Create retrieval service
```bash
git commit -m "feat(backend): add retrieval orchestration service

[Epic-3] [B7] Create service to orchestrate retrieval pipeline

- Create backend/src/services/retrieval_service.py
- Orchestrate: QueryBuilder → BM25 → Semantic → Fusion → Explainer
- Add error handling and logging
- Add LangSmith tracing decorators

Refs: #epic-3"
```

**Commit 32**: Create API endpoint
```bash
git commit -m "feat(backend): add retrieval search API endpoint

[Epic-3] [B7] POST /api/v1/retrieval/search endpoint

- Create backend/src/api/v1/routes/retrieval.py
- Add Pydantic request/response models
- Integrate retrieval service
- Add request validation
- Return top-3 patterns with explanations

Refs: #epic-3"
```

**Commit 33**: Add LangSmith tracing
```bash
git commit -m "feat(backend): add LangSmith tracing to retrieval

[Epic-3] [B7] Add observability for retrieval pipeline

- Add @traceable decorators to all retrieval methods
- Track latency metrics
- Log retrieval parameters and results
- Enable debugging via LangSmith dashboard

Refs: #epic-3"
```

**Commit 34**: Add API endpoint tests
```bash
git commit -m "test(backend): add retrieval API endpoint tests

[Epic-3] [B7] Test API request/response flow

- Create backend/tests/test_retrieval_api.py
- Test successful retrieval (200 response)
- Test validation errors (422 response)
- Test server errors (500 response)
- Test response schema compliance

Acceptance criteria met:
- ✅ Endpoint accepts requirements JSON
- ✅ Returns top-3 patterns with explanations
- ✅ Error handling with proper HTTP status codes

Refs: #epic-3"
```

**Commit 35**: Add performance tests
```bash
git commit -m "test(backend): add retrieval latency tests

[Epic-3] [B7] Verify p50 latency ≤1s target

- Test retrieval latency under load
- Measure p50, p95, p99 latencies
- Verify p50 ≤1000ms target
- Document performance benchmarks

Acceptance criteria met:
- ✅ Latency p50 ≤1s

Refs: #epic-3"
```

---

### T2: Retrieval Metrics Implementation (4 commits)

**Commit 36**: Implement metrics functions
```bash
git commit -m "feat(test): implement retrieval evaluation metrics

[Epic-3] [T2] Add MRR, Hit@3, Precision@3 calculations

- Create backend/tests/evaluation/metrics.py
- Implement calculate_mrr()
- Implement calculate_hit_at_k()
- Implement calculate_precision_at_k()
- Add NDCG (optional)

Refs: #epic-3"
```

**Commit 37**: Create evaluation script
```bash
git commit -m "feat(test): add retrieval evaluation script

[Epic-3] [T2] Create script to evaluate on test set

- Create backend/scripts/evaluate_retrieval.py
- Load patterns and test queries
- Run retrieval on each query
- Calculate aggregate metrics
- Generate evaluation report

Refs: #epic-3"
```

**Commit 38**: Run evaluation and document results
```bash
git commit -m "test(backend): run retrieval evaluation

[Epic-3] [T2] Evaluate retrieval quality on test set

- Run evaluation script on 20+ queries
- Generate backend/data/eval/evaluation_report.json
- Document results: MRR, Hit@3, Precision@3
- Verify targets met: MRR ≥0.75, Hit@3 ≥0.85

Acceptance criteria met:
- ✅ Metrics implemented correctly
- ✅ MRR ≥0.75 on test set
- ✅ Hit@3 ≥0.85 on test set

Refs: #epic-3"
```

**Commit 39**: Add metrics tests
```bash
git commit -m "test(backend): add unit tests for metrics

[Epic-3] [T2] Test metric calculation functions

- Create backend/tests/evaluation/test_metrics.py
- Test MRR calculation (edge cases)
- Test Hit@K calculation
- Test Precision@K calculation
- Verify metric correctness

Refs: #epic-3"
```

---

## 🗂️ Phase 3: Frontend (Week 3)

### F5: Pattern Selection State Management (2 commits)

**Commit 40**: Create Zustand store
```bash
git commit -m "feat(frontend): add pattern selection state store

[Epic-3] [F5] Create Zustand store for pattern selection

- Create app/src/store/patternSelectionStore.ts
- Track selected pattern (single selection)
- Track comparison patterns (up to 3)
- Add persist middleware for sessionStorage
- Export usePatternSelection hook

Acceptance criteria met:
- ✅ Only 1 pattern can be selected at a time
- ✅ Up to 3 patterns for comparison
- ✅ Selection persists across refreshes

Refs: #epic-3"
```

**Commit 41**: Add state store tests
```bash
git commit -m "test(frontend): add pattern selection store tests

[Epic-3] [F5] Test state management logic

- Create app/src/store/__tests__/patternSelectionStore.test.ts
- Test single selection behavior
- Test comparison selection (max 3)
- Test persistence
- Test clear actions

Refs: #epic-3"
```

---

### F1: Pattern Selection Page UI (10 commits)

**Commit 42**: Create page route and layout
```bash
git commit -m "feat(frontend): add pattern selection page route

[Epic-3] [F1] Create /patterns page with layout

- Create app/src/app/patterns/page.tsx
- Add page layout with header
- Add breadcrumb navigation
- Setup responsive grid layout

Refs: #epic-3"
```

**Commit 43**: Add SearchSummary component
```bash
git commit -m "feat(frontend): add retrieval search summary banner

[Epic-3] [F1] Display retrieval metadata and performance

- Create app/src/components/patterns/SearchSummary.tsx
- Show query construction
- Display retrieval methods (BM25, Semantic badges)
- Show total patterns searched
- Display latency (with target comparison)

Refs: #epic-3"
```

**Commit 44**: Add PatternCard component
```bash
git commit -m "feat(frontend): add pattern card component

[Epic-3] [F1] Display individual pattern match results

- Create app/src/components/patterns/PatternCard.tsx
- Show pattern numbering (1️⃣, 2️⃣, 3️⃣)
- Display pattern name, source, confidence
- Add SELECTED badge for chosen pattern
- Show score visualization bar (Progress component)
- Display explanation text
- Add action buttons (Select, Preview)

Refs: #epic-3"
```

**Commit 45**: Add MatchHighlights component
```bash
git commit -m "feat(frontend): add match highlights display

[Epic-3] [F1] Show matched props, variants, a11y features

- Create app/src/components/patterns/MatchHighlights.tsx
- Display matched props with badges
- Show matched variants
- Highlight matched a11y features
- Color-code matches (green = matched)

Refs: #epic-3"
```

**Commit 46**: Add ScoreVisualization component
```bash
git commit -m "feat(frontend): add confidence score visualization

[Epic-3] [F1] Horizontal progress bar for confidence scores

- Create app/src/components/patterns/ScoreVisualization.tsx
- Use Progress component from BASE-COMPONENTS.md
- Color-code: ≥0.9 green, 0.7-0.9 yellow, <0.7 red
- Show numeric score alongside bar

Refs: #epic-3"
```

**Commit 47**: Add RetrievalDetails accordion
```bash
git commit -m "feat(frontend): add retrieval details accordion

[Epic-3] [F1] Expandable section showing ranking breakdown

- Create app/src/components/patterns/RetrievalDetails.tsx
- Use Accordion component from BASE-COMPONENTS.md
- Show BM25 score + rank (weight: 0.3)
- Show semantic score + rank (weight: 0.7)
- Display final weighted score
- Show match reason explanation

Refs: #epic-3"
```

**Commit 48**: Add PatternLibraryInfo sidebar
```bash
git commit -m "feat(frontend): add pattern library info sidebar

[Epic-3] [F1] Display library metadata and quality metrics

- Create app/src/components/patterns/PatternLibraryInfo.tsx
- Show total patterns available (10)
- List supported component types
- Display quality metrics (MRR, Hit@3)
- Add refresh/reload action

Refs: #epic-3"
```

**Commit 49**: Add PatternList orchestrator
```bash
git commit -m "feat(frontend): add pattern list orchestrator

[Epic-3] [F1] Compose all pattern card components

- Create app/src/components/patterns/PatternList.tsx
- Map over top-3 patterns
- Pass selection state from Zustand
- Handle pattern selection
- Show empty state if no patterns

Refs: #epic-3"
```

**Commit 50**: Wire up page with data
```bash
git commit -m "feat(frontend): integrate pattern page with API data

[Epic-3] [F1] Connect UI to retrieval API via TanStack Query

- Use usePatternRetrieval hook (from I1)
- Read requirements from sessionStorage
- Display loading state (skeleton)
- Show error state if API fails
- Render pattern list when data loaded

Refs: #epic-3"
```

**Commit 51**: Add responsive design and polish
```bash
git commit -m "style(frontend): add responsive design to pattern page

[Epic-3] [F1] Mobile, tablet, desktop layouts

- Add responsive breakpoints
- Mobile: single column layout
- Tablet: 2-column grid
- Desktop: 3-column with sidebar
- Test on all screen sizes

Acceptance criteria met:
- ✅ Page matches wireframe design
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ All UI elements functional

Refs: #epic-3"
```

---

### F4: Loading & Error States (4 commits)

**Commit 52**: Add PatternSkeleton component
```bash
git commit -m "feat(frontend): add pattern card skeleton loader

[Epic-3] [F4] Loading state for pattern cards

- Create app/src/components/patterns/PatternSkeleton.tsx
- Use Skeleton component from BASE-COMPONENTS.md
- Match PatternCard structure
- Show 3 skeleton cards while loading

Refs: #epic-3"
```

**Commit 53**: Add ErrorState component
```bash
git commit -m "feat(frontend): add error state UI

[Epic-3] [F4] Display retrieval failure errors

- Create app/src/components/patterns/ErrorState.tsx
- Use Alert component for error messages
- Show user-friendly error text
- Add retry button
- Handle different error types

Refs: #epic-3"
```

**Commit 54**: Add EmptyState component
```bash
git commit -m "feat(frontend): add empty state for no patterns

[Epic-3] [F4] Show message when no patterns found

- Create app/src/components/patterns/EmptyState.tsx
- Display helpful message
- Suggest next steps (adjust requirements, try different query)
- Add back button to requirements page

Refs: #epic-3"
```

**Commit 55**: Add loading indicators
```bash
git commit -m "feat(frontend): add loading indicators

[Epic-3] [F4] Show loading state during retrieval

- Add spinner to search button
- Show progress indicator at top of page
- Add loading state to action buttons
- Handle timeout (>5s) gracefully

Acceptance criteria met:
- ✅ Skeleton matches pattern card structure
- ✅ Error messages helpful and actionable
- ✅ Empty state suggests next steps
- ✅ Loading states are smooth

Refs: #epic-3"
```

---

### F3: Pattern Code Preview Modal (3 commits)

**Commit 56**: Create CodePreviewModal component
```bash
git commit -m "feat(frontend): add code preview modal

[Epic-3] [F3] Full code display with tabs

- Create app/src/components/patterns/CodePreviewModal.tsx
- Use Modal/Dialog component from BASE-COMPONENTS.md
- Add Tabs: Code, Metadata, Examples
- Show syntax-highlighted code (CodeBlock component)
- Add copy to clipboard button

Refs: #epic-3"
```

**Commit 57**: Add MetadataPanel component
```bash
git commit -m "feat(frontend): add metadata panel for preview

[Epic-3] [F3] Display pattern props, variants, a11y

- Create app/src/components/patterns/MetadataPanel.tsx
- Show props table (name, type, optional, default)
- List variants with descriptions
- Display a11y features
- Show dependencies

Refs: #epic-3"
```

**Commit 58**: Add code preview tests
```bash
git commit -m "test(frontend): add code preview modal tests

[Epic-3] [F3] Test modal interactions

- Test modal open/close
- Test tab switching
- Test copy to clipboard
- Test code syntax highlighting
- Test accessibility (axe-core)

Acceptance criteria met:
- ✅ Code is syntax highlighted (TypeScript/TSX)
- ✅ Copy button works correctly
- ✅ Metadata displayed in readable format

Refs: #epic-3"
```

---

### F2: Pattern Comparison Modal (3 commits - Optional)

**Commit 59**: Create ComparisonModal component
```bash
git commit -m "feat(frontend): add pattern comparison modal

[Epic-3] [F2] Side-by-side pattern comparison

- Create app/src/components/patterns/ComparisonModal.tsx
- Show up to 3 patterns side-by-side
- Display comparison table
- Highlight differences (props, variants, code)

Refs: #epic-3"
```

**Commit 60**: Add comparison table
```bash
git commit -m "feat(frontend): add comparison table component

[Epic-3] [F2] Detailed pattern comparison view

- Create app/src/components/patterns/ComparisonTable.tsx
- Compare props (show differences)
- Compare variants
- Compare a11y features
- Show confidence scores

Refs: #epic-3"
```

**Commit 61**: Add comparison tests
```bash
git commit -m "test(frontend): add comparison modal tests

[Epic-3] [F2] Test comparison functionality

- Test pattern selection for comparison
- Test difference highlighting
- Test side-by-side code view
- Test accessibility

Acceptance criteria met:
- ✅ Shows up to 3 patterns side-by-side
- ✅ Highlights differences clearly
- ✅ Code comparison is readable

Refs: #epic-3"
```

---

## 🗂️ Phase 4: Integration & Testing (Week 4)

### I1: Frontend-Backend API Integration (4 commits)

**Commit 62**: Create API client
```bash
git commit -m "feat(frontend): add retrieval API client

[Epic-3] [I1] Type-safe API client for retrieval endpoint

- Create app/src/lib/api/retrieval.ts
- Define RetrievalRequest and RetrievalResponse types
- Implement retrievalApi.search() method
- Add error handling

Refs: #epic-3"
```

**Commit 63**: Create TanStack Query hook
```bash
git commit -m "feat(frontend): add usePatternRetrieval hook

[Epic-3] [I1] TanStack Query hook for data fetching

- Create app/src/hooks/usePatternRetrieval.ts
- Implement query with caching (5 min stale time)
- Handle loading, error, success states
- Add refetch mechanism

Refs: #epic-3"
```

**Commit 64**: Add TypeScript types
```bash
git commit -m "feat(frontend): add retrieval type definitions

[Epic-3] [I1] Comprehensive TypeScript interfaces

- Create app/src/types/retrieval.ts
- Define Pattern, Requirements, MatchHighlights types
- Define RetrievalMetadata type
- Ensure type safety across app

Refs: #epic-3"
```

**Commit 65**: Add API integration tests
```bash
git commit -m "test(frontend): add API integration tests

[Epic-3] [I1] Test API client and hooks

- Mock API responses with MSW
- Test successful retrieval
- Test error handling
- Test caching behavior
- Test retry mechanism

Acceptance criteria met:
- ✅ API client is type-safe
- ✅ TanStack Query caching works
- ✅ Error messages user-friendly

Refs: #epic-3"
```

---

### I4: Navigation & Routing (4 commits)

**Commit 66**: Create epic navigation hook
```bash
git commit -m "feat(frontend): add epic navigation utilities

[Epic-3] [I4] Navigation helper for epic flow

- Create app/src/lib/navigation/useEpicNavigation.ts
- Implement navigateToPatterns()
- Implement navigateToGeneration()
- Implement navigateBack()
- Handle data passing via sessionStorage

Refs: #epic-3"
```

**Commit 67**: Add breadcrumb navigation
```bash
git commit -m "feat(frontend): add breadcrumb navigation

[Epic-3] [I4] Visual progress through epic flow

- Create app/src/components/navigation/Breadcrumbs.tsx
- Show all 5 steps (Tokens → Requirements → Patterns → Generation → Preview)
- Highlight current step
- Disable future steps
- Add icons for each step

Refs: #epic-3"
```

**Commit 68**: Add route protection middleware
```bash
git commit -m "feat(frontend): add route protection

[Epic-3] [I4] Prevent skipping epic steps

- Create app/src/middleware.ts
- Protect /patterns (requires requirements)
- Protect /generation (requires selected pattern)
- Redirect to previous step if data missing

Refs: #epic-3"
```

**Commit 69**: Add navigation tests
```bash
git commit -m "test(frontend): add navigation tests

[Epic-3] [I4] Test routing and data flow

- Test route protection
- Test breadcrumb rendering
- Test navigation hooks
- Test data persistence
- Test browser back/forward

Acceptance criteria met:
- ✅ Routes work correctly
- ✅ Navigation preserves data
- ✅ Breadcrumbs show current step
- ✅ Route protection works

Refs: #epic-3"
```

---

### I2: Epic 2 → Epic 3 Data Flow (3 commits)

**Commit 70**: Create requirements transform
```bash
git commit -m "feat(frontend): add requirements-to-query transform

[Epic-3] [I2] Transform Epic 2 output to Epic 3 input

- Create app/src/lib/transforms/requirementsToQuery.ts
- Extract component_type, props, variants, a11y
- Format for API request
- Handle validation

Refs: #epic-3"
```

**Commit 71**: Wire Epic 2 to Epic 3 navigation
```bash
git commit -m "feat(frontend): connect Epic 2 to Epic 3 flow

[Epic-3] [I2] Pass requirements from Epic 2 to Epic 3

- Update requirements page to store requirements
- Navigate to /patterns on continue
- Pass requirements via sessionStorage
- Validate requirements before navigation

Refs: #epic-3"
```

**Commit 72**: Add Epic 2→3 integration test
```bash
git commit -m "test(frontend): add Epic 2→3 integration test

[Epic-3] [I2] Test requirements to patterns flow

- Test requirements storage
- Test navigation
- Test data transformation
- Test validation

Acceptance criteria met:
- ✅ Requirements passed from Epic 2 to Epic 3
- ✅ Transformation works correctly
- ✅ Validation catches invalid requirements

Refs: #epic-3"
```

---

### I3: Epic 3 → Epic 4 Data Flow (3 commits)

**Commit 73**: Create generation input transform
```bash
git commit -m "feat(frontend): add pattern-to-generation transform

[Epic-3] [I3] Transform Epic 3 output to Epic 4 input

- Create app/src/lib/transforms/patternToGenerationInput.ts
- Combine selected pattern + requirements
- Format for Epic 4 generation input
- Include confidence and match highlights

Refs: #epic-3"
```

**Commit 74**: Wire Epic 3 to Epic 4 navigation
```bash
git commit -m "feat(frontend): connect Epic 3 to Epic 4 flow

[Epic-3] [I3] Pass selected pattern to generation

- Update pattern page to handle continue action
- Store selected pattern + requirements
- Navigate to /generation
- Validate pattern selection before navigation

Refs: #epic-3"
```

**Commit 75**: Add Epic 3→4 integration test
```bash
git commit -m "test(frontend): add Epic 3→4 integration test

[Epic-3] [I3] Test pattern to generation flow

- Test pattern selection storage
- Test navigation
- Test data combination
- Test re-selection flow

Acceptance criteria met:
- ✅ Selected pattern passed to Epic 4
- ✅ All necessary data included
- ✅ User can go back and re-select

Refs: #epic-3"
```

---

### T3: Backend Unit Tests (2 commits)

**Commit 76**: Add comprehensive backend tests
```bash
git commit -m "test(backend): add comprehensive unit tests

[Epic-3] [T3] Test all backend retrieval components

- All tests previously added in individual commits
- Verify code coverage ≥80%
- Run full backend test suite
- Generate coverage report

Acceptance criteria met:
- ✅ All retrievers tested
- ✅ Edge cases covered
- ✅ Code coverage ≥80%

Refs: #epic-3"
```

**Commit 77**: Add backend integration tests
```bash
git commit -m "test(backend): add retrieval pipeline integration tests

[Epic-3] [T3] Test complete backend flow

- Create backend/tests/integration/test_retrieval_pipeline.py
- Test requirements → query → retrieval → response
- Test with real Qdrant (test collection)
- Verify latency targets

Refs: #epic-3"
```

---

### T4: Frontend Component Tests (2 commits)

**Commit 78**: Add comprehensive frontend tests
```bash
git commit -m "test(frontend): add comprehensive component tests

[Epic-3] [T4] Test all frontend pattern components

- All component tests previously added
- Verify component coverage ≥80%
- Run full frontend test suite
- Generate coverage report

Acceptance criteria met:
- ✅ All components tested
- ✅ User interactions covered
- ✅ Component coverage ≥80%

Refs: #epic-3"
```

**Commit 79**: Add accessibility tests
```bash
git commit -m "test(frontend): add accessibility tests with axe-core

[Epic-3] [T4] Verify WCAG compliance

- Add axe-core tests to all pattern components
- Test keyboard navigation
- Test screen reader compatibility
- Test focus management
- Verify no accessibility violations

Acceptance criteria met:
- ✅ Accessibility tests pass

Refs: #epic-3"
```

---

### T5: Integration Tests (2 commits)

**Commit 80**: Add full-stack integration tests
```bash
git commit -m "test(integration): add Epic 2→3→4 flow tests

[Epic-3] [T5] Test complete epic chain

- Test requirements → patterns → generation flow
- Test data persistence across epics
- Test error recovery
- Test browser navigation (back/forward)

Acceptance criteria met:
- ✅ Epic 2 → 3 → 4 flow works end-to-end
- ✅ Data persistence works
- ✅ Error recovery handled

Refs: #epic-3"
```

**Commit 81**: Add caching behavior tests
```bash
git commit -m "test(integration): add caching tests

[Epic-3] [T5] Test client and server caching

- Test TanStack Query caching
- Test Redis embedding cache
- Test cache invalidation
- Measure cache hit rates

Acceptance criteria met:
- ✅ Caching behavior validated

Refs: #epic-3"
```

---

### T6: E2E Tests (2 commits - Optional)

**Commit 82**: Add Playwright E2E tests
```bash
git commit -m "test(e2e): add pattern selection E2E tests

[Epic-3] [T6] Playwright tests for complete flow

- Create app/tests/e2e/pattern-selection.spec.ts
- Test complete pattern selection flow
- Test pattern comparison
- Test code preview and copy
- Test navigation through epics

Refs: #epic-3"
```

**Commit 83**: Add performance E2E tests
```bash
git commit -m "test(e2e): add retrieval performance tests

[Epic-3] [T6] Verify latency targets in production-like env

- Measure retrieval latency
- Verify p50 ≤1s target
- Test under concurrent load
- Document performance benchmarks

Acceptance criteria met:
- ✅ Complete flow tested end-to-end
- ✅ Performance validated (<1s)

Refs: #epic-3"
```

---

## 🎯 Final Commits

**Commit 84**: Update documentation
```bash
git commit -m "docs(epic-3): update epic documentation

[Epic-3] Final documentation updates

- Update 03-pattern-retrieval.md with completion status
- Mark all tasks as completed in 03-pattern-retrieval-tasks.md
- Add performance benchmarks to README
- Update CHANGELOG.md

Refs: #epic-3"
```

**Commit 85**: Epic 3 completion
```bash
git commit -m "feat(epic-3): complete Pattern Retrieval & Matching epic

[Epic-3] Epic completion summary

✅ All 23 tasks completed:
- 8 Backend tasks (B1-B8)
- 5 Frontend tasks (F1-F5)
- 4 Integration tasks (I1-I4)
- 6 Testing tasks (T1-T6)

✅ Success metrics achieved:
- MRR: 0.78 (target ≥0.75) ✅
- Hit@3: 0.87 (target ≥0.85) ✅
- Latency p50: 890ms (target ≤1s) ✅
- Code coverage: 84% (target ≥80%) ✅

✅ Deliverables:
- 10-pattern library indexed in Qdrant
- BM25 + Semantic retrieval with weighted fusion
- Explainability and confidence scoring
- Full pattern selection UI with state management
- Integration with Epic 2 and Epic 4
- Comprehensive test coverage

Ready for Epic 4: Code Generation

Refs: #epic-3
Closes: #epic-3"
```

---

## 📊 Commit Statistics Summary

| Phase | Commits | Focus Area |
|-------|---------|------------|
| **Phase 1: Backend Foundation** | 20 | B1, B2, B8, T1, B3 |
| **Phase 2: Core Retrieval** | 19 | B4, B5, B6, B7, T2 |
| **Phase 3: Frontend** | 22 | F5, F1, F4, F3, F2 |
| **Phase 4: Integration & Testing** | 22 | I1, I4, I2, I3, T3, T4, T5, T6 |
| **Final** | 2 | Documentation, Completion |
| **TOTAL** | **85 commits** | All 23 tasks |

---

## 🔄 Branch Strategy

### Main Branch Protection
- All commits to `main` require PR review
- At least 1 approval required
- All tests must pass
- Code coverage must be ≥80%

### Feature Branches
Create feature branches for each task group:

```bash
# Backend tasks
git checkout -b epic-3/backend-foundation
git checkout -b epic-3/backend-retrieval
git checkout -b epic-3/backend-api

# Frontend tasks
git checkout -b epic-3/frontend-state
git checkout -b epic-3/frontend-ui
git checkout -b epic-3/frontend-modals

# Integration tasks
git checkout -b epic-3/integration-api
git checkout -b epic-3/integration-navigation
git checkout -b epic-3/integration-flow

# Testing tasks
git checkout -b epic-3/testing-backend
git checkout -b epic-3/testing-frontend
git checkout -b epic-3/testing-e2e
```

### PR Strategy
- Create PRs for each phase (1 PR per week)
- **Week 1 PR**: Backend Foundation (commits 1-20)
- **Week 2 PR**: Core Retrieval (commits 21-39)
- **Week 3 PR**: Frontend (commits 40-61)
- **Week 4 PR**: Integration & Testing (commits 62-83)
- **Final PR**: Documentation & Completion (commits 84-85)

---

## ✅ Checklist Before Each Commit

- [ ] Code follows project style guide (ESLint, Black)
- [ ] All new code has tests (unit or integration)
- [ ] Tests pass locally (`make test`)
- [ ] No TypeScript/Python type errors
- [ ] Documentation updated (if applicable)
- [ ] Acceptance criteria met (from task document)
- [ ] Commit message follows format
- [ ] LangSmith tracing added (for AI operations)
- [ ] No hardcoded secrets or API keys

---

## 🎯 Success Criteria

Epic 3 is considered **complete** when:
- ✅ All 85 commits merged to main
- ✅ All 23 tasks marked complete
- ✅ Success metrics achieved (MRR ≥0.75, Hit@3 ≥0.85, Latency ≤1s)
- ✅ Code coverage ≥80% (backend and frontend)
- ✅ All tests passing in CI/CD
- ✅ Pattern selection page deployed and functional
- ✅ Integration with Epic 2 and Epic 4 verified
- ✅ Documentation complete and up-to-date

---

**Last Updated**: 2025-10-05
**Total Commits**: 85
**Estimated Timeline**: 4 weeks (20 commits/week)
