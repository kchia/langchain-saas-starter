# Multi-Agent Task Assignment Strategy

## Overview
This document breaks down all epic tasks into assignable units for parallel multi-agent development.

---

## PARALLEL STREAM 1: Core Feature Pipeline (Sequential)

**Agent: CorePipeline**
**Timeline: Weeks 1-8**
**Dependencies: Requires Epic 0 complete**

### Phase 1.1: Token Extraction (Week 1-2)

#### Issue #1: Screenshot Upload & GPT-4V Extraction
**Epic**: 1 - Design Token Extraction
**Tasks**: 1, 2, 6
**Priority**: P0
**Estimated**: 5 days

**Sub-tasks:**
- [ ] Implement screenshot upload endpoint (PNG/JPG, 10MB max)
- [ ] Add image validation and preprocessing
- [ ] Create GPT-4V prompt for token extraction
- [ ] Extract colors (hex), typography (px), spacing
- [ ] Implement confidence scoring (0-1 scale)
- [ ] Add fallback to shadcn/ui defaults (<0.7 confidence)

**Files**: `backend/src/api/v1/routes/tokens.py`, `backend/src/services/image_processor.py`, `backend/src/agents/token_extractor.py`

**Acceptance Criteria**:
- Screenshot upload accepts PNG/JPG up to 10MB
- GPT-4V extracts colors, typography, spacing with confidence scores
- Fallback activates when confidence <0.7

---

#### Issue #2: Figma Integration (PAT + API)
**Epic**: 1 - Design Token Extraction
**Tasks**: 3, 4, 5
**Priority**: P1
**Estimated**: 4 days

**Sub-tasks:**
- [ ] Implement Figma PAT authentication
- [ ] Create Figma file extraction endpoint
- [ ] Extract color styles, text styles, auto-layout
- [ ] Implement Redis caching (5 min TTL)
- [ ] Add cache invalidation endpoint
- [ ] Track cache hit rate metrics

**Files**: `backend/src/services/figma_client.py`, `backend/src/cache/figma_cache.py`

**Acceptance Criteria**:
- Figma PAT validates correctly
- File extraction returns normalized tokens
- Cache hit rate tracked, ~0.1s latency on hits

---

#### Issue #3: Token UI & Export
**Epic**: 1 - Design Token Extraction
**Tasks**: 7, 8, 9, 10
**Priority**: P0
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Build manual token override UI (color picker, inputs)
- [ ] Add token export (JSON, CSS variables)
- [ ] Implement error handling for API failures
- [ ] Add integration tests (screenshot → export, Figma → export)
- [ ] Track performance metrics (p50 ≤10s)

**Files**: `app/src/components/tokens/TokenEditor.tsx`, `backend/src/services/token_exporter.py`

**Acceptance Criteria**:
- Manual override UI allows editing all tokens
- Export formats (JSON, CSS) work correctly
- Error rate <1%, extraction completes <10s

---

### Phase 1.2: Requirement Proposal (Week 3)

#### Issue #4: Component Type Inference
**Epic**: 2 - Requirement Proposal
**Task**: 1
**Priority**: P0
**Estimated**: 2 days

**Sub-tasks:**
- [ ] Implement component type classifier (Button, Card, Input, etc.)
- [ ] Use visual cues + Figma layer names
- [ ] Return type with confidence score
- [ ] Handle ambiguous cases (top-3 candidates)
- [ ] Target latency <5s

**Files**: `backend/src/agents/component_classifier.py`

**Acceptance Criteria**:
- 85%+ accuracy on component type detection
- Latency <5s
- Returns confidence score per type

---

#### Issue #5: Requirements Analyzers (Parallel Sub-Agents)
**Epic**: 2 - Requirement Proposal
**Tasks**: 2, 3, 4, 5
**Priority**: P0
**Estimated**: 3 days

**Sub-tasks (can run in parallel):**
- [ ] **Props Analyzer**: Detect variant, size, boolean props
- [ ] **Events Analyzer**: Detect onClick, onChange, onHover
- [ ] **States Analyzer**: Detect hover, focus, disabled, loading states
- [ ] **A11y Analyzer**: Detect ARIA requirements, semantic HTML needs

**Files**: `backend/src/agents/requirement_proposer.py` (contains all 4 analyzers)

**Acceptance Criteria**:
- Each analyzer returns requirements with confidence + rationale
- Combined analysis achieves ≥80% precision, ≥70% recall
- p50 latency ≤15s for full analysis

---

#### Issue #6: Requirement Approval UI
**Epic**: 2 - Requirement Proposal
**Tasks**: 6, 7, 8
**Priority**: P0
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Build approval panel UI (grouped by category)
- [ ] Add requirement editing modal
- [ ] Implement accept/edit/remove actions
- [ ] Add bulk actions (Accept All, Review Low Confidence)
- [ ] Export approved requirements.json

**Files**: `app/src/components/requirements/ApprovalPanel.tsx`, `backend/src/services/requirement_exporter.py`

**Acceptance Criteria**:
- All proposed requirements displayed with confidence
- Edit/remove functionality works
- Export format matches specification

---

### Phase 1.3: Pattern Retrieval (Week 4)

#### Issue #7: Pattern Library Curation
**Epic**: 3 - Pattern Retrieval
**Task**: 1
**Priority**: P0
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Curate ≥10 shadcn/ui patterns (Button, Card, Input, etc.)
- [ ] Extract TypeScript code with AST parsing
- [ ] Create metadata (props, variants, a11y features)
- [ ] Store in structured JSON format
- [ ] Validate TypeScript compilation

**Files**: `backend/data/patterns/*.json`, `backend/scripts/curate_patterns.py`

**Acceptance Criteria**:
- ≥10 patterns curated with complete metadata
- All patterns compile with TypeScript strict mode
- Metadata includes props, variants, states, a11y

---

#### Issue #8: Dual Retrieval System (BM25 + Semantic)
**Epic**: 3 - Pattern Retrieval
**Tasks**: 2, 3, 4
**Priority**: P0
**Estimated**: 4 days

**Sub-tasks (can run in parallel):**
- [ ] **BM25 Implementation**: Index patterns, multi-field search
- [ ] **Semantic Search**: text-embedding-3-small, Qdrant vector search
- [ ] **Weighted Fusion**: Combine BM25 (0.3) + Semantic (0.7)
- [ ] Setup Qdrant collection (1536 dims, cosine distance)

**Files**: `backend/src/retrieval/bm25_retriever.py`, `backend/src/retrieval/semantic_retriever.py`, `backend/src/services/qdrant_client.py`

**Acceptance Criteria**:
- BM25 and semantic search return relevant patterns
- Weighted fusion combines scores correctly
- p50 latency ≤1s (without cross-encoder)

---

#### Issue #9: Explainability & Evaluation
**Epic**: 3 - Pattern Retrieval
**Tasks**: 5, 6 (eval from MVP scope)
**Priority**: P1
**Estimated**: 2 days

**Sub-tasks:**
- [ ] Generate explanations for pattern selection
- [ ] Compute confidence scores (0-1)
- [ ] Create evaluation set (20+ labeled queries)
- [ ] Measure MRR (target ≥0.75), Hit@3 (target ≥0.85)
- [ ] Generate evaluation report

**Files**: `backend/src/retrieval/explainer.py`, `backend/data/eval/retrieval_queries.json`

**Acceptance Criteria**:
- Explanations cite matching features
- MRR ≥0.75, Hit@3 ≥0.85 on eval set
- Confidence scores correlate with relevance

---

### Phase 1.4: Code Generation (Week 5-6)

#### Issue #10: AST Parsing & Token Injection
**Epic**: 4 - Code Generation
**Tasks**: 1, 2
**Priority**: P0
**Estimated**: 4 days

**Sub-tasks:**
- [ ] Parse TypeScript to AST (@babel/parser)
- [ ] Extract component structure (props, JSX, imports)
- [ ] Generate CSS variables from tokens
- [ ] Inject tokens into Tailwind classes
- [ ] Replace hardcoded values with CSS vars

**Files**: `backend/src/generation/ast_parser.py`, `backend/src/generation/token_injector.py`

**Acceptance Criteria**:
- AST parsing handles function/arrow components
- CSS variables generated correctly
- Tokens injected with 95%+ accuracy

---

#### Issue #11: Tailwind & Requirements Implementation
**Epic**: 4 - Code Generation
**Tasks**: 3, 4
**Priority**: P0
**Estimated**: 4 days

**Sub-tasks:**
- [ ] Generate Tailwind classes with CSS variables
- [ ] Implement all approved requirements (props, events, states)
- [ ] Generate TypeScript prop interfaces from requirements
- [ ] Add variant logic based on props
- [ ] Handle default values for optional props

**Files**: `backend/src/generation/tailwind_generator.py`, `backend/src/generation/requirement_implementer.py`

**Acceptance Criteria**:
- Tailwind classes use CSS variables appropriately
- All approved requirements implemented
- Props typed correctly in TypeScript

---

#### Issue #12: A11y, Types & Documentation
**Epic**: 4 - Code Generation
**Tasks**: 5, 6, 7, 8
**Priority**: P0
**Estimated**: 5 days

**Sub-tasks:**
- [ ] Add ARIA attributes (aria-label, aria-disabled, etc.)
- [ ] Use semantic HTML (button, input, label)
- [ ] Generate strict TypeScript types (no `any`)
- [ ] Generate Storybook stories (CSF 3.0)
- [ ] Add provenance headers to files

**Files**: `backend/src/generation/a11y_enhancer.py`, `backend/src/generation/type_generator.py`, `backend/src/generation/storybook_generator.py`

**Acceptance Criteria**:
- ARIA attributes added correctly
- TypeScript compiles in strict mode
- Storybook stories for all variants

---

#### Issue #13: Import Resolution & Assembly
**Epic**: 4 - Code Generation
**Tasks**: 9, 10
**Priority**: P0
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Resolve all imports (React, shadcn/ui, utils)
- [ ] Generate import statements in correct order
- [ ] Assemble final code (imports + types + component)
- [ ] Format with Prettier
- [ ] Validate with `tsc --noEmit`
- [ ] Run ESLint with auto-fix

**Files**: `backend/src/generation/import_resolver.py`, `backend/src/generation/code_assembler.py`

**Acceptance Criteria**:
- All imports resolved correctly
- Code formatted and linted
- TypeScript validation passes
- p50 latency ≤60s for Button/Card

---

### Phase 1.5: Quality Validation (Week 7)

#### Issue #14: TypeScript & Code Quality Validation
**Epic**: 5 - Quality Validation
**Tasks**: 1, 2
**Priority**: P0
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Run `tsc --noEmit` on generated code
- [ ] Run ESLint with TypeScript parser
- [ ] Check Prettier formatting
- [ ] Implement auto-fix (remove unused imports, add type annotations)
- [ ] Retry validation after auto-fix (once)

**Files**: `backend/src/validation/typescript_validator.py`, `backend/src/validation/eslint_validator.py`

**Acceptance Criteria**:
- TypeScript strict compilation 100% pass rate
- ESLint zero errors (warnings allowed)
- Auto-fix resolves 80%+ of issues

---

#### Issue #15: Accessibility Testing (axe-core + Keyboard)
**Epic**: 5 - Quality Validation
**Tasks**: 3, 4, 5, 6
**Priority**: P0
**Estimated**: 4 days

**Sub-tasks (can run in parallel):**
- [ ] **axe-core Testing**: Render in Playwright, run audit, 0 critical/serious violations
- [ ] **Keyboard Navigation**: Test Tab, Enter, Space, Escape keys
- [ ] **Focus Indicators**: Verify visible with ≥3:1 contrast
- [ ] **Color Contrast**: Calculate ratios, ensure WCAG AA (4.5:1 text, 3:1 UI)

**Files**: `backend/src/validation/a11y_validator.py`, `backend/src/validation/keyboard_validator.py`, `backend/src/validation/focus_validator.py`, `backend/src/validation/contrast_validator.py`

**Acceptance Criteria**:
- 0 critical/serious axe violations
- Keyboard navigation works correctly
- Focus indicators visible and meet contrast
- Color contrast meets WCAG AA

---

#### Issue #16: Token Adherence & Reporting
**Epic**: 5 - Quality Validation
**Tasks**: 7, 8, 9
**Priority**: P0
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Calculate token adherence per category (colors, typography, spacing)
- [ ] Overall adherence score (≥90% target)
- [ ] Implement auto-fix for common issues
- [ ] Generate quality report (JSON + HTML)
- [ ] Display metrics in UI

**Files**: `backend/src/validation/token_validator.py`, `backend/src/validation/auto_fixer.py`, `backend/src/validation/report_generator.py`

**Acceptance Criteria**:
- Token adherence ≥90%
- Auto-fix resolves 80%+ of fixable issues
- Quality report comprehensive and downloadable
- Validation completes <10s

---

## PARALLEL STREAM 2: Infrastructure (Can Start After Epic 0)

**Agent: Infrastructure**
**Timeline: Weeks 2-6**
**Dependencies: Epic 0 complete**

### Issue #17: L1 Exact Cache Implementation
**Epic**: 6 - Production Infrastructure
**Task**: 1 (renumbered from Task 2 in MVP)
**Priority**: P1
**Estimated**: 2 days

**Sub-tasks:**
- [ ] Implement hash-based exact cache in Redis
- [ ] Cache key: SHA-256(figma_key + tokens + requirements)
- [ ] Cache hit returns in ~0.5s
- [ ] No TTL (invalidate on change only)
- [ ] Track cache hit rate (target ≥20% after 50 gens)

**Files**: `backend/src/cache/exact_cache.py`

**Acceptance Criteria**:
- Cache hit latency ~0.5s
- Hit rate ≥20% after 50 generations
- Hash generation deterministic

---

### Issue #18: L4 Baseline Metrics & LangSmith Tracing
**Epic**: 6 - Production Infrastructure
**Tasks**: 2 (renumbered), 3
**Priority**: P1
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Track L4 full generation metrics (p50, p95, p99, cost, success rate)
- [ ] Integrate LangSmith for distributed tracing
- [ ] Create traces for complete pipeline runs
- [ ] Tag traces with component type, cache layer, cost
- [ ] Create spans for each agent (token, requirement, retrieval, generation)

**Files**: `backend/src/monitoring/generation_metrics.py`, `backend/src/core/tracing.py`

**Acceptance Criteria**:
- L4 p50 ≤60s for Button/Card
- LangSmith traces show all agent steps
- Cost tracking per operation

---

### Issue #19: Prometheus Metrics & Grafana Dashboards
**Epic**: 6 - Production Infrastructure
**Task**: 4 (renumbered)
**Priority**: P1
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Expose `/metrics` endpoint for Prometheus
- [ ] Collect system metrics (CPU, memory, connections)
- [ ] Collect application metrics (latency, cache hit rate, costs)
- [ ] Configure Prometheus scraping (15s interval)
- [ ] Create Grafana dashboards

**Files**: `backend/src/monitoring/prometheus.py`, `backend/prometheus.yml`, `backend/grafana/dashboards/`

**Acceptance Criteria**:
- Metrics exported on `/metrics`
- Prometheus scrapes successfully
- Grafana dashboards display metrics

---

### Issue #20: S3 Storage & PostgreSQL Metadata
**Epic**: 6 - Production Infrastructure
**Task**: 5 (renumbered - combined 8+9)
**Priority**: P1
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Store generated components in S3 (component.tsx, stories.tsx, etc.)
- [ ] Set S3 lifecycle policy (90-day retention)
- [ ] Enable versioning
- [ ] Generate presigned URLs (1 hour expiry)
- [ ] Track all generations in PostgreSQL
- [ ] Store metadata (cost, latency, cache layer, success/failure)

**Files**: `backend/src/storage/s3_client.py`, `backend/src/database/models.py`, `backend/alembic/versions/002_add_tracking.py`

**Acceptance Criteria**:
- Components stored in S3 with lifecycle policy
- PostgreSQL tracks all generations
- Presigned URLs work for downloads

---

### Issue #21: Error Handling & Circuit Breakers
**Epic**: 6 - Production Infrastructure
**Task**: 6 (renumbered from 10)
**Priority**: P1
**Estimated**: 2 days

**Sub-tasks:**
- [ ] Implement graceful fallbacks for all external services
- [ ] Add circuit breaker pattern for OpenAI, Figma, Qdrant, Redis
- [ ] Retry logic with exponential backoff (3 attempts)
- [ ] Timeout handling
- [ ] Health check endpoint shows service status

**Files**: `backend/src/core/error_handler.py`, `backend/src/core/circuit_breaker.py`

**Acceptance Criteria**:
- Error rate <1% under normal load
- Circuit breakers prevent cascade failures
- Graceful fallbacks work (e.g., continue without Redis)

---

## PARALLEL STREAM 3: Security & Auth (Can Start After Epic 0)

**Agent: Security**
**Timeline: Weeks 2-5**
**Dependencies: Epic 0 complete**

### Issue #22: Figma PAT Secure Storage (Vault)
**Epic**: 9 - Security & Authentication
**Task**: 1
**Priority**: P0
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Integrate HashiCorp Vault or AWS Secrets Manager
- [ ] Encrypt PATs at rest (AES-256) and in transit (TLS)
- [ ] Store PATs in vault (not database)
- [ ] Never log PAT values
- [ ] Implement PAT rotation and deletion
- [ ] Audit all vault access

**Files**: `backend/src/core/secrets_vault.py`, `backend/src/services/figma_auth.py`

**Acceptance Criteria**:
- PATs never in database or logs
- Vault communication encrypted
- Deletion endpoint works

---

### Issue #23: OAuth 2.0 Flow for Figma
**Epic**: 9 - Security & Authentication
**Task**: 2
**Priority**: P1
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Implement OAuth 2.0 authorization code flow
- [ ] Register OAuth app with Figma
- [ ] Redirect to Figma authorization
- [ ] Handle callback and exchange code for token
- [ ] Store access token in vault
- [ ] Implement token refresh mechanism

**Files**: `backend/src/auth/figma_oauth.py`, `app/src/components/auth/FigmaConnect.tsx`

**Acceptance Criteria**:
- OAuth flow completes successfully
- Tokens stored in vault
- Refresh mechanism works

---

### Issue #24: JWT Authentication & API Keys
**Epic**: 9 - Security & Authentication
**Tasks**: 3, 4
**Priority**: P0
**Estimated**: 4 days

**Sub-tasks:**
- [ ] Issue JWT tokens on login (RS256 signing)
- [ ] Validate JWT on every request
- [ ] Implement token refresh and revocation (blacklist)
- [ ] Generate API keys (`cf_live_xxx` format)
- [ ] Hash API keys with bcrypt before storing
- [ ] Support multiple keys per user with scoping

**Files**: `backend/src/auth/jwt_handler.py`, `backend/src/auth/api_key_manager.py`

**Acceptance Criteria**:
- JWT validation works, 401 for invalid tokens
- API keys hash stored, never plaintext
- Key revocation and rotation work

---

### Issue #25: Input Validation & Rate Limiting
**Epic**: 9 - Security & Authentication
**Tasks**: 5, 6
**Priority**: P0
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Validate all inputs with Pydantic models
- [ ] Sanitize strings to prevent XSS
- [ ] Validate URLs (Figma.com only)
- [ ] Limit file uploads (10MB, PNG/JPG only)
- [ ] Implement rate limiting per user/API key (Redis counters)
- [ ] Different limits per tier (free: 50/hr, pro: 500/hr)
- [ ] Return 429 with Retry-After header

**Files**: `backend/src/validation/input_validator.py`, `backend/src/middleware/rate_limiter.py`

**Acceptance Criteria**:
- Invalid inputs rejected with clear errors
- XSS attempts blocked
- Rate limits enforced, 429 returned when exceeded

---

### Issue #26: MFA & Audit Logging
**Epic**: 9 - Security & Authentication
**Tasks**: 7, 8
**Priority**: P1
**Estimated**: 4 days

**Sub-tasks:**
- [ ] Support TOTP (Google Authenticator compatible)
- [ ] Generate QR codes for MFA setup
- [ ] Verify TOTP codes on login
- [ ] Provide backup codes (10 single-use)
- [ ] Log all sensitive actions (login, API key changes, generation, etc.)
- [ ] Audit log includes timestamp, user_id, action, IP, result
- [ ] Store logs in PostgreSQL (append-only)
- [ ] Provide audit log viewer for admins

**Files**: `backend/src/auth/mfa.py`, `backend/src/core/audit_logger.py`

**Acceptance Criteria**:
- MFA setup works with QR code
- TOTP and backup codes verified correctly
- All sensitive actions logged
- Logs immutable, queryable

---

## PARALLEL STREAM 4: Developer Experience (Can Start After Epic 0, Some After Epic 4)

**Agent: DeveloperExperience**
**Timeline: Weeks 3-7**
**Dependencies: Epic 0 complete, some tasks need Epic 4**

### Issue #27: OpenAPI/Swagger Documentation
**Epic**: 7 - Developer Experience
**Task**: 1
**Priority**: P1
**Estimated**: 2 days

**Sub-tasks:**
- [ ] Generate OpenAPI 3.0 spec from FastAPI
- [ ] Document all endpoints with examples
- [ ] Interactive Swagger UI at `/docs`
- [ ] ReDoc alternative at `/redoc`
- [ ] Export spec as JSON/YAML
- [ ] Add code examples in multiple languages

**Files**: `backend/src/main.py`, `backend/docs/openapi.json`

**Acceptance Criteria**:
- OpenAPI spec covers 100% of endpoints
- Swagger UI loads and works
- Examples are accurate

---

### Issue #28: CLI Tool Development
**Epic**: 7 - Developer Experience
**Task**: 2
**Priority**: P1
**Estimated**: 5 days

**Sub-tasks:**
- [ ] Build CLI with commands (generate, validate, export, list, config)
- [ ] Support flags (--output, --tokens, --requirements, --watch)
- [ ] Configuration file support (`componentforge.config.json`)
- [ ] Interactive prompts for missing params
- [ ] Progress indicators and color-coded output
- [ ] Publish to npm (`npm install -g componentforge`)

**Files**: `cli/src/index.ts`, `cli/src/commands/*.ts`

**Acceptance Criteria**:
- CLI installs via npm
- All commands work correctly
- Configuration file loads
- Progress indicators display

---

### Issue #29: Component Preview System & Local Dev Mode
**Epic**: 7 - Developer Experience
**Tasks**: 3, 4
**Priority**: P1
**Estimated**: 4 days

**Sub-tasks:**
- [ ] Build web-based component preview (iframe sandbox)
- [ ] Interactive prop controls (variant, size, state toggles)
- [ ] Viewport controls (mobile, tablet, desktop)
- [ ] Copy code snippet button
- [ ] Support local dev mode with API mocks
- [ ] Mock all endpoints (return sample data)
- [ ] Fast responses (<100ms)
- [ ] Environment variable: `DEV_MODE=local`

**Files**: `app/src/app/preview/[id]/page.tsx`, `backend/src/mocks/api_mocks.py`

**Acceptance Criteria**:
- Preview renders components with controls
- Hot reload works
- Local dev mode runs without external APIs

---

### Issue #30: Tutorials, SDKs & Troubleshooting
**Epic**: 7 - Developer Experience
**Tasks**: 5, 6, 7, 8
**Priority**: P2
**Estimated**: 6 days

**Sub-tasks:**
- [ ] Write tutorials (Getting Started, Custom Tokens, CI/CD)
- [ ] Create quick start guide (5 min to first component)
- [ ] Generate TypeScript SDK from OpenAPI
- [ ] Generate Python SDK from OpenAPI
- [ ] Publish SDKs (npm: `@componentforge/sdk`, PyPI: `componentforge-sdk`)
- [ ] Create troubleshooting guide (common issues + solutions)
- [ ] Produce video walkthroughs (5 videos, 3-8 min each)

**Files**: `docs/tutorials/*.md`, `sdks/typescript/src/client.ts`, `sdks/python/componentforge/client.py`, `docs/troubleshooting.md`

**Acceptance Criteria**:
- Tutorials cover beginner to advanced
- SDKs published and functional
- Troubleshooting resolves 90% of issues
- Videos published with captions

---

## PARALLEL STREAM 5: Regeneration & Versioning (Depends on Epic 4 + Epic 6)

**Agent: Versioning**
**Timeline: Weeks 7-9**
**Dependencies: Epic 4 (Code Generation), Epic 6 (Infrastructure)**

### Issue #31: Component Version Tracking
**Epic**: 8 - Regeneration & Versioning
**Task**: 1
**Priority**: P1
**Estimated**: 3 days

**Sub-tasks:**
- [ ] Create database schema for component versions
- [ ] Semantic versioning (major.minor.patch)
- [ ] Store version metadata (tokens_hash, requirements_hash, pattern_id)
- [ ] Store full component code per version
- [ ] Track version relationships (parent/children)
- [ ] Support version tags (stable, experimental)

**Files**: `backend/src/database/models.py`, `backend/alembic/versions/003_add_versioning.py`

**Acceptance Criteria**:
- All versions stored with metadata
- Semantic versioning works correctly
- Version history queryable

---

### Issue #32: Regeneration Pipeline
**Epic**: 8 - Regeneration & Versioning
**Task**: 2
**Priority**: P1
**Estimated**: 4 days

**Sub-tasks:**
- [ ] Implement `POST /api/v1/regenerate/:id` endpoint
- [ ] Detect changes (tokens, requirements, pattern)
- [ ] Determine version bump (patch/minor/major)
- [ ] Run full generation pipeline
- [ ] Create new version record
- [ ] Generate diff between versions

**Files**: `backend/src/services/regeneration_service.py`

**Acceptance Criteria**:
- Regeneration creates new version correctly
- Changes detected accurately
- Version bumping logic correct

---

### Issue #33: Diff Preview & Version History UI
**Epic**: 8 - Regeneration & Versioning
**Tasks**: 3, 4
**Priority**: P1
**Estimated**: 4 days

**Sub-tasks:**
- [ ] Build diff viewer component (unified + split views)
- [ ] Syntax highlighting for TypeScript
- [ ] Highlight added/removed/modified lines
- [ ] Summary of changes at top
- [ ] Build version history timeline
- [ ] Compare any two versions
- [ ] Download/rollback buttons

**Files**: `app/src/components/versioning/DiffViewer.tsx`, `app/src/components/versioning/VersionHistory.tsx`

**Acceptance Criteria**:
- Diff displays correctly with syntax highlighting
- Version history timeline shows all versions
- Comparison between versions works

---

### Issue #34: Rollback, Change Detection & Auto-Regeneration
**Epic**: 8 - Regeneration & Versioning
**Tasks**: 5, 6, 7
**Priority**: P2
**Estimated**: 5 days

**Sub-tasks:**
- [ ] Implement rollback endpoint (`POST /api/v1/rollback/:id`)
- [ ] Validate rollback safety (no breaking changes)
- [ ] Monitor Figma files for updates (webhook/polling)
- [ ] Detect token and requirement changes
- [ ] Suggest regeneration when appropriate
- [ ] Support automated regeneration triggers (auto/notify/manual policies)
- [ ] Queue regeneration jobs with Celery

**Files**: `backend/src/services/rollback_service.py`, `backend/src/services/change_detector.py`, `backend/src/services/auto_regeneration.py`

**Acceptance Criteria**:
- Rollback creates new version from target
- Change detection identifies updates
- Auto-regeneration respects user policy

---

## PARALLEL STREAM 6: Team & Enterprise (Depends on Epic 9)

**Agent: Platform**
**Timeline: Weeks 6-10**
**Dependencies: Epic 9 (Security & Authentication)**

### Issue #35: Team Management & Collaboration
**Epic**: 10 - Team & Enterprise
**Tasks**: TBD (Epic 10 not fully read)
**Priority**: P2
**Estimated**: TBD

**Note**: This stream can start after basic auth (Epic 9) is complete. Will be detailed once Epic 10 is fully analyzed.

---

## Agent Assignment Summary

### Agent 1: CorePipeline
**Responsibilities**: Epics 1→2→3→4→5 (sequential)
**Issues**: #1-16
**Timeline**: 8 weeks
**Critical Path**: YES

### Agent 2: Infrastructure
**Responsibilities**: Epic 6 (parallel with Agent 1)
**Issues**: #17-21
**Timeline**: 5 weeks
**Critical Path**: NO (supports production)

### Agent 3: Security
**Responsibilities**: Epic 9 (parallel with Agent 1)
**Issues**: #22-26
**Timeline**: 4 weeks
**Critical Path**: NO (required for production, can develop in parallel)

### Agent 4: DeveloperExperience
**Responsibilities**: Epic 7 (some parallel, some after Epic 4)
**Issues**: #27-30
**Timeline**: 5 weeks
**Critical Path**: NO (enhances adoption, not blocking)

### Agent 5: Versioning
**Responsibilities**: Epic 8 (after Epic 4 complete)
**Issues**: #31-34
**Timeline**: 3 weeks
**Critical Path**: NO (nice-to-have for MVP)

### Agent 6: Platform (Future)
**Responsibilities**: Epic 10
**Issues**: #35+
**Timeline**: TBD
**Critical Path**: NO (enterprise features, post-MVP)

---

## Priority Tiers

### P0 (Must Have for MVP):
- Issues: #1-16 (entire core pipeline)
- Issues: #22, #24, #25 (security essentials)

### P1 (Should Have for Production):
- Issues: #17-21 (infrastructure)
- Issues: #23, #26 (security nice-to-have)
- Issues: #27-29 (DX core)

### P2 (Nice to Have):
- Issues: #30 (DX extras)
- Issues: #31-34 (versioning)
- Issues: #35+ (enterprise)

---

## Synchronization Points

### Sync Point 1 (Week 2):
- Agent 1 completes Issue #1-3 (Token Extraction)
- Agent 2 starts Issue #17 (requires token extraction working)
- Agent 3 works on Issue #22-23 (parallel)

### Sync Point 2 (Week 4):
- Agent 1 completes Issue #7-9 (Pattern Retrieval)
- Agent 4 can start Issue #27 (OpenAPI docs now complete)

### Sync Point 3 (Week 6):
- Agent 1 completes Issue #10-13 (Code Generation)
- Agent 4 starts Issue #28-29 (CLI needs generation endpoint)
- Agent 5 can start Issue #31 (versioning needs generated components)

### Sync Point 4 (Week 8):
- Agent 1 completes Issue #14-16 (Validation)
- All agents report for integration testing
- Prepare for MVP release

---

## GitHub Issue Template

Each issue should be created with:

```markdown
## Epic
Epic X: [Epic Name]

## Priority
P0/P1/P2

## Estimated Effort
X days

## Dependencies
- Requires: [List of prerequisite issues]
- Blocks: [List of dependent issues]

## Agent Assignment
Agent: [CorePipeline/Infrastructure/Security/DeveloperExperience/Versioning/Platform]

## Description
[Copy from sub-tasks above]

## Acceptance Criteria
[Copy from acceptance criteria above]

## Files
[List of files to create/modify]

## Testing Requirements
[List of tests needed]

## Definition of Done
- [ ] Code implemented and tested
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Merged to main
```
