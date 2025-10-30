# ComponentForge - Product Requirements Document

## Executive Summary

**ComponentForge** is an AI-powered design-to-code pipeline that transforms Figma designs and screenshots into production-ready, accessible React components (shadcn/ui + Radix) while maintaining continuous alignment with design tokens.

**Vision**: Reduce component development time by 85% (from 3-5 hours to <30 minutes) while ensuring 100% accessibility compliance and ≥90% design token adherence.

---

## 1. Problem Statement

Developers spend hours manually coding Figma designs into React components, leading to:

- **High Costs**: ~$220+ upfront development, ~$330-$440 lifecycle cost per component
- **Accessibility Risks**: 94.8% of websites have WCAG failures
- **Design Drift**: Despite 84% of design systems using tokens, code diverges from design
- **Developer Burnout**: Repetitive UI work reduces focus on meaningful features

---

## 2. Why This Matters

### For Companies
- Each component costs hundreds to thousands of dollars to build and rebuild
- Savings multiply across 100+ components per product
- Fixing accessibility late costs 2-3× more than during development

### For the World
- 1.3 billion people (16% of global population) have disabilities
- Accessible components expand reach and reduce exclusion

### For Developers
- Reduces repetitive UI work and burnout
- Enables focus on product features and business logic

### For Design Systems
- 84% of systems use tokens, but drift is still common
- Automation closes the design-code gap

### For This Project
- Proves mastery of advanced AI engineering (multi-agent orchestration, RAG, production monitoring)
- Solves a tangible, high-value problem with measurable impact

---

## 3. Success Metrics

### Quantifiable Targets

| Metric | Current State | Target | Measurement |
|--------|--------------|--------|-------------|
| **Time** | 3-5 hours | <30 minutes | ≥85% reduction |
| **Accessibility** | 94.8% sites fail | 0 critical violations | axe-core audit |
| **Consistency** | Variable | ≥90% token adherence | ΔE tolerance + specs |
| **Cost** | $330-$440 lifecycle | <$70 lifecycle | Per-component TCO |
| **Adoption** | 0 users | 10+ developers | First month usage |
| **Requirement Quality** | N/A | ≥80% precision, ≥70% recall | Manual eval set |
| **Latency** | N/A | p50 ≤15s proposal, ≤60s generation | LangSmith traces |
| **Retrieval Quality** | N/A | MRR ≥0.83, Hit@3 ≥0.91 | Labeled eval set |

---

## 4. Target Audience

### Primary
**Frontend developers at scale-ups** who spend too much time on repetitive UI work

### Secondary
**Design system teams** who need consistency between tokens and code

### Tertiary
**Engineering managers** who care about reducing cost, accelerating time-to-market, and mitigating accessibility/legal risks

---

## 5. Solution Overview

### What It Delivers

ComponentForge is a multi-agent AI pipeline that:

1. **Extracts design tokens** (colors, typography, spacing) from Figma or screenshots with confidence scoring
2. **Proposes functional requirements** (props, events, states, validation, a11y) with human-in-the-loop review
3. **Retrieves best code patterns** via ensemble retrieval (BM25 + semantic + diversity + RRF + cross-encoder rerank)
4. **Generates TypeScript + Storybook** with tokens applied and approved requirements implemented
5. **Validates quality automatically** (TypeScript, ESLint, axe-core, keyboard/focus/contrast, token adherence)
6. **Regenerates on change** to keep components in sync with evolving tokens/design

### Runtime Architecture

**Execution Model (MVP)**: Sequential LangGraph pipeline in single Orchestration Service

```
A1: Token Extractor
  ↓
A1.5: Requirement Proposer
  ↓
A2: Pattern Retriever
  ↓
A3: Code Adapter
  ↓
A4: Quality Validator
```

**Data Layer**:
- **Qdrant**: Vector retrieval for patterns
- **Redis**: Multi-layer caching (L0-L4)
- **PostgreSQL**: Metadata and audit logs
- **S3**: Component artifacts and reports

**Clients**: Web UI (Next.js) + CLI for MVP

---

## 6. Inputs & Outputs

### Inputs (MVP)
- **Figma**: PAT + file URL (v1 Files/Styles API)
- **Screenshot**: Optional design screenshot (PNG/JPG, max 10MB)
- **Manual Overrides**: Token edits, requirement hints
- **Optional Hints**: Expected interactions or behaviors

### Outputs
- `ComponentName.tsx` - TypeScript component (shadcn/ui + Radix)
- `ComponentName.stories.tsx` - Storybook stories
- `tokens.json` - Extracted design tokens
- `requirements.json` - Proposed + approved functional requirements
- `reports/` - axe summary, retrieval scores, timings, cost

### Requirements.json Structure
```json
{
  "componentType": "Button",
  "confidence": 0.92,
  "requirements": [
    {
      "id": "req-001",
      "category": "props",
      "name": "variant",
      "values": ["primary", "secondary", "ghost"],
      "confidence": 0.95,
      "rationale": "Multiple button styles detected in Figma variants"
    },
    {
      "id": "req-002",
      "category": "events",
      "name": "onClick",
      "required": true,
      "confidence": 0.88,
      "rationale": "Interactive element with cursor:pointer style"
    }
  ]
}
```

---

## 7. End-to-End Pipeline

### 1. Connect & Fetch
- Validate Figma PAT; fetch Files/Styles (cache 5 min)
- Preprocess screenshots (resize/normalize) for vision

### 2. Token Extraction (A1)
- Extract from Figma or GPT-4V vision → normalize to `tokens.json`
- Compute confidence; allow manual edits
- Fallback to shadcn/ui defaults if confidence <0.7

### 3. Requirement Proposal (A1.5)
- Infer component type and states/variants from frame/screenshot + Figma metadata
- Propose functional requirements with per-item confidence and rationales
- Surface editable approval panel (accept/edit/remove)
- Export `requirements.json` for retrieval and generation

### 4. Pattern Retrieval (A2)
- Run BM25 (lexical), semantic k-NN, and diversity (MMR)
- Fuse with RRF, rerank with cross-encoder
- Return top-3 with scores and explanations

### 5. Code Adaptation (A3)
- Parse pattern AST; inject tokens
- Generate Tailwind CSS with CSS variables
- Add ARIA/semantics; emit strict TypeScript

### 6. Quality Validation (A4)
- TypeScript compilation, ESLint/Prettier, axe-core (0 critical)
- Keyboard/focus/contrast checks, token adherence meter
- Auto-fix pass (one retry) → validated component

### 7. Persist, Trace, Cache
- Store artifacts to S3, metadata to PostgreSQL
- LangSmith trace with per-agent time/tokens/cost
- Update cache layers

---

## 8. Retrieval Targets

| Metric | Target | Baseline | Measurement |
|--------|--------|----------|-------------|
| **MRR** | ≥0.83 | 0.71 (semantic-only) | Labeled Button/Card eval |
| **Hit@3** | ≥0.91 | ~0.75 | Top-3 contains correct pattern |
| **Lift** | ≥15% | N/A | vs semantic-only baseline |

Metrics surfaced in `reports/` and dashboard; ablations supported.

---

## 9. Caching Strategy & Latencies

| Layer | Type | TTL/Threshold | Hit Latency | Use Case |
|-------|------|---------------|-------------|----------|
| **L0** | Figma cache | 5 min | ~0.1s | Repeated file access |
| **L1** | Exact cache | Hash-based | ~0.5s | Identical requests |
| **L2** | Semantic cache | ≥0.92 similarity | ~0.8s | Similar requests |
| **L3** | Pattern cache | Pre-computed | ~5s | Pattern adaptation |
| **L4** | Full generation | N/A | 45-75s | New components |

**Target**: p50 full generation ≤60s for Button/Card

---

## 10. Guardrails & Quality Gates

### Accessibility
- 0 critical axe-core violations (required)
- Keyboard navigation and focus indicators verified
- Color contrast compliance (WCAG AA minimum)

### Type Safety
- TypeScript strict compilation success (required)
- No `any` types without justification

### Token Adherence
- ≥90% match to approved tokens
- ΔE tolerance for colors; spacing/typography within spec

### Provenance
- Generated files include pattern + version headers
- Audit trail in PostgreSQL metadata

### Human-in-the-Loop
- Requirement approval required when confidence <0.80
- Editable panel before code generation

### Confidence Thresholds

| System | Auto-Accept | Review Required | Fallback/Reject |
|--------|-------------|-----------------|-----------------|
| Token Extraction | ≥0.9 | 0.7-0.9 | <0.7 |
| Requirements | ≥0.9 | 0.7-0.9 | <0.7 |
| Semantic Cache | ≥0.92 | - | <0.92 |
| Pattern Match | ≥0.8 | 0.6-0.8 | <0.6 |

---

## 11. Observability & Operations

### Day 1 (MVP)
- **LangSmith**: Distributed traces for every pipeline run
- **Metrics**: Cost, time, latency per agent in reports
- **Logging**: Structured JSON logs (Python, FastAPI)

### Phase 2
- **Prometheus**: System metrics (request rate, latency, errors)
- **CloudWatch**: Centralized log aggregation
- **Sentry**: Error tracking and alerting
- **PostHog**: Product analytics and user behavior

---

## 12. Technical Stack

### Frontend
- **Framework**: Next.js 15.5.4 with App Router
- **UI Library**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables
- **State**: Zustand (client), TanStack Query (server)
- **Testing**: Playwright (E2E), axe-core (a11y)
- **Auth**: Auth.js v5

### Backend
- **API**: FastAPI (async Python)
- **AI**: LangChain, LangGraph (orchestration), LangSmith (observability)
- **Vision**: GPT-4V for screenshot analysis
- **Code Gen**: GPT-4 for component generation
- **Embeddings**: text-embedding-3-small

### Infrastructure
- **Vector DB**: Qdrant (pattern retrieval)
- **Cache**: Redis (multi-layer)
- **Database**: PostgreSQL 16 (metadata, audit)
- **Storage**: S3 (artifacts, components)
- **Containers**: Docker Compose (local dev)

---

## 13. Unique Value Propositions

1. **Design-to-code that stays in sync**: Tokens drive regeneration, not manual refactors
2. **Explainable retrieval**: Top-3 patterns with scores and reasoning
3. **Production checks built-in**: a11y + lint + types + stories, every time
4. **Lifecycle savings**: Maintenance becomes "regenerate", not "rewrite"
5. **Human-in-the-loop safety**: Requirement approval before generation

---

## 14. Scope Boundaries

### In Scope (MVP)
- ✅ Button and Card components (proven patterns)
- ✅ Screenshot + Figma PAT extraction
- ✅ Requirement proposal with approval panel
- ✅ Ensemble retrieval with evaluation
- ✅ TypeScript + Storybook generation
- ✅ Quality validation (a11y, lint, types)
- ✅ Multi-layer caching
- ✅ LangSmith observability
- ✅ Web UI + CLI

### Explicitly Out of Scope (MVP)
- ❌ Multi-frame batch processing (Phase 2)
- ❌ Complex form components with dynamic validation (Phase 3)
- ❌ Team collaboration features (permissions, audit logs)
- ❌ VS Code extension (Phase 3)
- ❌ Figma plugin (Phase 3)
- ❌ OAuth 2.0 + MFA (Phase 2)
- ❌ Figma Variables/Modes (Phase 2)
- ❌ Sketch support (Phase 3)

---

## 15. Technical Constraints

### API Limits
- **OpenAI**: 10,000 RPM (Tier 2), handle 429 with exponential backoff
- **Figma**: 1,000 requests/hour, cache aggressively (5 min TTL)

### Component Complexity
- **MVP**: Simple interactive components (Button, Card)
- **Phase 2**: Forms, navigation, modals
- **Phase 3**: Complex layouts, data tables

### Pattern Library
- **MVP**: 10+ curated shadcn/ui patterns
- **Phase 2**: 50+ patterns with community contributions

---

## 16. Dependencies & Assumptions

### Critical Dependencies
- ✅ OpenAI GPT-4V/GPT-4 API availability
- ✅ Figma Files/Styles API stability
- ✅ shadcn/ui pattern compatibility
- ✅ Qdrant Cloud availability

### Key Assumptions
- Users have Figma PAT or design screenshots
- Components follow shadcn/ui conventions
- TypeScript and Tailwind are acceptable
- LangSmith tracing is sufficient for observability

---

## 17. Risk Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Token extraction fails | Medium | High | Fallback to manual input or defaults |
| Poor retrieval matches | Low | Medium | Always include base shadcn pattern |
| Compilation errors | Medium | High | Simplify to minimal component |
| API rate limits | Medium | Medium | Aggressive caching + local mode |
| Figma API changes | Low | High | Version pinning + adapter pattern |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Adoption resistance | Medium | High | Free tier + gradual rollout |
| Cost concerns | Low | Medium | Show ROI ($170 saved per component) |
| Quality concerns | Low | High | 100% accessibility guarantee |
| Integration complexity | Medium | Medium | Multiple integration options (UI, CLI) |

---

## 18. Decision Log

### Why LangGraph?
- Built-in state management for multi-agent workflows
- LangSmith integration for observability
- Proven for complex AI pipelines

### Why Qdrant?
- Open-source with managed cloud option
- Excellent Python SDK
- Supports hybrid search (dense + sparse)

### Why shadcn/ui?
- Copy-paste architecture (no npm dependency)
- Built on Radix UI (accessible primitives)
- Tailwind-native styling
- Active community and patterns

### Why Next.js App Router?
- Server components reduce client bundle
- Built-in streaming for AI responses
- Best-in-class DX for React

---

## 19. User Stories & Epics

### Epic 0: Project Setup & Infrastructure
**Goal**: Establish development environment and foundational infrastructure

**User Stories**:
- As a developer, I want to run `make install` and have all dependencies configured
- As a developer, I want to run `make dev` and access all services locally
- As a developer, I want clear documentation for environment setup

### Epic 1: Design Token Extraction
**Goal**: Extract design tokens from Figma and screenshots with confidence scoring

**User Stories**:
- As a developer, I want to upload a screenshot and extract color/typography/spacing tokens
- As a developer, I want to connect my Figma file and extract tokens automatically
- As a design system team member, I want to review and edit extracted tokens before use

### Epic 2: Requirement Proposal & Review
**Goal**: AI-powered functional requirement inference with human approval

**User Stories**:
- As a developer, I want the system to propose component requirements from my design
- As a developer, I want to review, edit, and approve requirements before generation
- As a developer, I want clear rationales for each proposed requirement

### Epic 3: Pattern Retrieval & Matching
**Goal**: Ensemble retrieval system that finds best shadcn/ui pattern match

**User Stories**:
- As a developer, I want the system to find the most relevant component pattern
- As an engineering manager, I want to see retrieval performance metrics
- As a developer, I want explanations for why patterns were selected

### Epic 4: Code Generation & Adaptation
**Goal**: Generate production-ready TypeScript components with token injection

**User Stories**:
- As a developer, I want to generate a Button component with my design tokens
- As a developer, I want Storybook stories generated automatically
- As a developer, I want generated code to follow TypeScript strict mode

### Epic 5: Quality Validation & Testing
**Goal**: Automated validation ensuring accessibility and code quality

**User Stories**:
- As a developer, I want all components to pass accessibility audits
- As a senior developer, I want generated code to meet our quality standards
- As a developer, I want automatic fixes for common issues

### Epic 6: Production Infrastructure
**Goal**: Caching, observability, and resilience for production use

**User Stories**:
- As a cost-conscious manager, I want semantic caching to reduce API costs
- As a DevOps engineer, I want full visibility into the generation pipeline
- As a developer, I want fast responses through intelligent caching

### Epic 7: Developer Experience & Documentation
**Goal**: Excellent DX with comprehensive docs and tooling

**User Stories**:
- As a developer, I want clear API documentation and examples
- As a developer, I want a CLI for automation and CI/CD integration
- As a new user, I want step-by-step guides and tutorials

### Epic 8: Regeneration & Versioning
**Goal**: Update components when tokens or designs change

**User Stories**:
- As a developer, I want to regenerate components when tokens change
- As a developer, I want to preview diffs before applying updates
- As a design system owner, I want version history for all components

### Epic 9: Security & Authentication (Phase 2)
**Goal**: Secure API access and secret management

**User Stories**:
- As a security engineer, I want secure Figma PAT storage
- As a developer, I want OAuth 2.0 for better UX than PAT
- As a team lead, I want API authentication with JWT

### Epic 10: Team & Enterprise Features (Phase 2)
**Goal**: Collaboration, permissions, and audit logs

**User Stories**:
- As a team lead, I want role-based access control
- As a compliance officer, I want audit logs for all generations
- As an enterprise user, I want SSO integration

---

## 20. Success Criteria Summary

### MVP Success (Must Have)
- ✅ Extract tokens from screenshot + Figma with ≥90% accuracy
- ✅ Propose requirements with ≥80% precision, ≥70% recall
- ✅ Achieve MRR ≥0.83, Hit@3 ≥0.91 on retrieval
- ✅ Generate Button + Card with 0 critical a11y violations
- ✅ Complete generation in ≤60s (p50)
- ✅ Achieve 73%+ cache hit rate after 100 generations

### Phase 2 Success (Should Have)
- ⭐ OAuth 2.0 authentication
- ⭐ Figma Variables support
- ⭐ 5+ additional component types
- ⭐ VS Code extension

### Phase 3 Success (Could Have)
- 🚀 Team collaboration features
- 🚀 Figma plugin
- 🚀 Complex form components
- 🚀 Multi-frame batch processing

---

## 21. Glossary

- **MRR (Mean Reciprocal Rank)**: Retrieval metric measuring ranking quality
- **Hit@K**: Percentage of queries where correct answer appears in top K results
- **RRF (Reciprocal Rank Fusion)**: Method to combine multiple ranking algorithms
- **MMR (Maximal Marginal Relevance)**: Diversity-promoting retrieval algorithm
- **Token Adherence**: Percentage of design tokens correctly applied in generated code
- **Semantic Cache**: Cache using embedding similarity rather than exact matches
- **Provenance Headers**: Metadata comments tracking generation sources
- **Confidence Score**: 0-1 probability indicating extraction/inference certainty
- **ΔE (Delta E)**: Color difference metric (CIEDE2000 formula)
- **WCAG**: Web Content Accessibility Guidelines
- **PAT**: Personal Access Token (Figma authentication)

---

## 22. Open Questions

1. **Pattern Versioning**: How to handle shadcn/ui updates without breaking existing components?
2. **Custom Patterns**: Should users be able to add their own patterns to the library?
3. **Multi-Tenant**: How to isolate pattern libraries per team/organization?
4. **Pricing Model**: Free tier limits? Pay-per-component or subscription?
5. **Offline Mode**: Should we support fully local LLM fallbacks?

---

## Appendix: Related Documentation

- [Architecture Diagrams](../../docs/architecture.md)
- [API Reference](../../docs/api.md)
- [Development Guide](../../CLAUDE.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)
