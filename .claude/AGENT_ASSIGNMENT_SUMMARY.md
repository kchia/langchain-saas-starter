# Multi-Agent Assignment Quick Reference

## Agent Overview

| Agent | Epics | Issues | Timeline | Critical Path | Start After |
|-------|-------|--------|----------|---------------|-------------|
| **CorePipeline** | 1→2→3→4→5 | #1-16 | 8 weeks | ✅ YES | Epic 0 |
| **Infrastructure** | 6 | #17-21 | 5 weeks | ❌ NO | Epic 0 |
| **Security** | 9 | #22-26 | 4 weeks | ❌ NO | Epic 0 |
| **DeveloperExperience** | 7 | #27-30 | 5 weeks | ❌ NO | Epic 0 (some need Epic 4) |
| **Versioning** | 8 | #31-34 | 3 weeks | ❌ NO | Epic 4 + Epic 6 |
| **Platform** | 10 | #35+ | TBD | ❌ NO | Epic 9 |

---

## Parallelization Strategy

### Phase 1: Weeks 1-2 (After Epic 0)
**Launch 4 agents in parallel:**

```
┌─────────────────┐
│  CorePipeline   │ → Epic 1: Token Extraction (Issues #1-3)
│   (Agent 1)     │    - Screenshot + GPT-4V
│                 │    - Figma Integration
│                 │    - Token UI & Export
└─────────────────┘

┌─────────────────┐
│ Infrastructure  │ → Epic 6: Start Infrastructure (Issue #17)
│   (Agent 2)     │    - L1 Exact Cache
└─────────────────┘

┌─────────────────┐
│   Security      │ → Epic 9: Security Essentials (Issues #22-23)
│   (Agent 3)     │    - Figma PAT Vault Storage
│                 │    - OAuth 2.0 Flow
└─────────────────┘

┌─────────────────┐
│ DeveloperExp    │ → Epic 7: Documentation (Issue #27)
│   (Agent 4)     │    - OpenAPI/Swagger Docs
└─────────────────┘
```

### Phase 2: Weeks 3-4
**Continue parallel work:**

```
Agent 1 → Epic 2: Requirements (Issues #4-6) + Epic 3: Retrieval (Issues #7-9)
Agent 2 → Epic 6: Metrics & Monitoring (Issues #18-19)
Agent 3 → Epic 9: Auth & Validation (Issues #24-25)
Agent 4 → Epic 7: Wait for Epic 4 (or work on Issue #27 refinement)
```

### Phase 3: Weeks 5-6
**Code generation phase:**

```
Agent 1 → Epic 4: Code Generation (Issues #10-13) ⚡ CRITICAL
Agent 2 → Epic 6: Storage & Error Handling (Issues #20-21)
Agent 3 → Epic 9: MFA & Audit Logging (Issue #26)
Agent 4 → Epic 7: CLI & Preview (Issues #28-29) - depends on Epic 4 completion
```

### Phase 4: Week 7
**Validation & integration:**

```
Agent 1 → Epic 5: Quality Validation (Issues #14-16) ⚡ CRITICAL
Agent 2 → Epic 6: Complete
Agent 3 → Epic 9: Complete
Agent 4 → Epic 7: Tutorials & SDKs (Issue #30)
Agent 5 → Epic 8: START Versioning (Issues #31-32) - Epic 4 now complete
```

### Phase 5: Weeks 8-10
**Polish & enterprise features:**

```
Agent 1 → Integration testing & bug fixes
Agent 2 → Performance optimization
Agent 3 → Security audit
Agent 4 → Documentation polish
Agent 5 → Epic 8: Diff UI & Auto-Regen (Issues #33-34)
Agent 6 → Epic 10: START Team Features (Issue #35+) - Epic 9 now complete
```

---

## Issue Breakdown by Agent

### Agent 1: CorePipeline (Critical Path)
**Total: 16 issues, 8 weeks**

| Week | Epic | Issues | Tasks |
|------|------|--------|-------|
| 1-2 | Epic 1 | #1-3 | Token Extraction (Screenshot, Figma, UI) |
| 3 | Epic 2 | #4-6 | Requirements (Inference, Analyzers, Approval UI) |
| 4 | Epic 3 | #7-9 | Pattern Retrieval (Curation, BM25+Semantic, Explainability) |
| 5-6 | Epic 4 | #10-13 | Code Generation (AST, Tailwind, A11y, Assembly) |
| 7 | Epic 5 | #14-16 | Quality Validation (TypeScript, A11y, Token Adherence) |
| 8 | - | - | Integration testing, bug fixes |

**Key Deliverables:**
- Week 2: Token extraction working (Figma + Screenshot)
- Week 3: Requirements proposal complete
- Week 4: Pattern retrieval operational
- Week 6: Code generation producing valid components
- Week 7: Full validation pipeline passing
- Week 8: End-to-end generation working

---

### Agent 2: Infrastructure
**Total: 5 issues, 5 weeks**

| Week | Epic | Issue | Task |
|------|------|-------|------|
| 2 | Epic 6 | #17 | L1 Exact Cache (Redis) |
| 3 | Epic 6 | #18 | L4 Baseline Metrics + LangSmith Tracing |
| 4 | Epic 6 | #19 | Prometheus Metrics + Grafana Dashboards |
| 5 | Epic 6 | #20 | S3 Storage + PostgreSQL Metadata |
| 6 | Epic 6 | #21 | Error Handling + Circuit Breakers |

**Key Deliverables:**
- Week 2: Cache hit rate ≥20% after 50 generations
- Week 3: LangSmith traces for all operations
- Week 4: Grafana dashboards deployed
- Week 5: S3 storage with 90-day lifecycle
- Week 6: Error rate <1%, graceful fallbacks

---

### Agent 3: Security
**Total: 5 issues, 4 weeks**

| Week | Epic | Issue | Task |
|------|------|-------|------|
| 2 | Epic 9 | #22 | Figma PAT Vault Storage |
| 2-3 | Epic 9 | #23 | OAuth 2.0 Flow for Figma |
| 3-4 | Epic 9 | #24 | JWT Authentication + API Keys |
| 4-5 | Epic 9 | #25 | Input Validation + Rate Limiting |
| 5-6 | Epic 9 | #26 | MFA + Audit Logging |

**Key Deliverables:**
- Week 2: PATs never in database/logs
- Week 3: OAuth 2.0 flow working
- Week 4: JWT + API key auth complete
- Week 5: Rate limiting enforced
- Week 6: MFA operational, all actions audited

---

### Agent 4: DeveloperExperience
**Total: 4 issues, 5 weeks**

| Week | Epic | Issue | Task |
|------|------|-------|------|
| 2-3 | Epic 7 | #27 | OpenAPI/Swagger Documentation |
| 4-5 | Epic 7 | #28 | CLI Tool Development |
| 5-6 | Epic 7 | #29 | Component Preview + Local Dev Mode |
| 7-8 | Epic 7 | #30 | Tutorials + SDKs + Troubleshooting + Videos |

**Key Deliverables:**
- Week 3: API docs 100% complete
- Week 5: CLI published to npm
- Week 6: Preview system working, local dev mode operational
- Week 8: SDKs published, tutorials + videos complete

---

### Agent 5: Versioning
**Total: 4 issues, 3 weeks**

| Week | Epic | Issue | Task |
|------|------|-------|------|
| 7 | Epic 8 | #31 | Component Version Tracking |
| 7-8 | Epic 8 | #32 | Regeneration Pipeline |
| 8 | Epic 8 | #33 | Diff Preview + Version History UI |
| 8-9 | Epic 8 | #34 | Rollback + Change Detection + Auto-Regen |

**Key Deliverables:**
- Week 7: Version tracking operational
- Week 8: Regeneration creating new versions correctly
- Week 8: Diff UI functional
- Week 9: Auto-regeneration triggers working

---

### Agent 6: Platform (Future)
**Total: TBD issues, TBD weeks**

| Week | Epic | Issue | Task |
|------|------|-------|------|
| 9+ | Epic 10 | #35+ | Team Management, Collaboration, etc. |

**Key Deliverables:**
- TBD based on Epic 10 analysis

---

## Priority Matrix

### P0 (MVP Blockers) - Must Have
**Required for basic product functionality:**

- ✅ **Issue #1-16** (Agent 1: CorePipeline) - Complete generation pipeline
- ✅ **Issue #22** (Agent 3: Security) - Figma PAT vault storage
- ✅ **Issue #24** (Agent 3: Security) - JWT + API key auth
- ✅ **Issue #25** (Agent 3: Security) - Input validation + rate limiting

**Timeline**: 8 weeks (critical path)

---

### P1 (Production Ready) - Should Have
**Required for production deployment:**

- **Issue #17-21** (Agent 2: Infrastructure) - Caching, metrics, storage, error handling
- **Issue #23** (Agent 3: Security) - OAuth 2.0 flow
- **Issue #26** (Agent 3: Security) - MFA + audit logging
- **Issue #27-29** (Agent 4: DX) - API docs, CLI, preview system

**Timeline**: +3 weeks after P0 (Week 11)

---

### P2 (Enhanced Experience) - Nice to Have
**Improves adoption and maintenance:**

- **Issue #30** (Agent 4: DX) - Tutorials, SDKs, videos
- **Issue #31-34** (Agent 5: Versioning) - Full versioning system
- **Issue #35+** (Agent 6: Platform) - Enterprise features

**Timeline**: +2 weeks after P1 (Week 13)

---

## Dependency Graph

```
Epic 0 (Project Setup)
   ├─→ Epic 1 (Token Extraction) ─┐
   ├─→ Epic 6 (Infrastructure)    ├─→ Epic 2 (Requirements) ─┐
   ├─→ Epic 9 (Security)          │                           │
   └─→ Epic 7 (Docs Start)        └─→ Epic 3 (Retrieval) ────┤
                                                               │
                                                               ├─→ Epic 4 (Code Gen) ─┐
                                                               │                       │
                                                               └───────────────────────┤
                                                                                       │
                                                               ┌───────────────────────┤
                                                               │                       │
                                                               ├─→ Epic 5 (Validation)│
                                                               │                       │
                             Epic 7 (CLI, Preview) ←──────────┤                       │
                                                               │                       │
                             Epic 8 (Versioning) ←────────────┴───────────────────────┘
                                                               │
                             Epic 10 (Enterprise) ←────── Epic 9 (Security Complete)
```

---

## Synchronization Points

### 🔄 Sync Point 1 (End of Week 2)
**Who**: Agents 1, 2, 3, 4
**Purpose**: Validate token extraction working

**Checklist**:
- [ ] Agent 1: Token extraction (screenshot + Figma) working
- [ ] Agent 2: L1 cache operational
- [ ] Agent 3: Figma PATs in vault, OAuth started
- [ ] Agent 4: OpenAPI docs drafted

**Go/No-Go**: Agent 1 must complete Issue #1-3 before Epic 2 starts

---

### 🔄 Sync Point 2 (End of Week 4)
**Who**: Agents 1, 2, 3, 4
**Purpose**: Validate requirements + retrieval working

**Checklist**:
- [ ] Agent 1: Requirements proposal + pattern retrieval working
- [ ] Agent 2: Metrics + monitoring operational
- [ ] Agent 3: JWT + API keys working
- [ ] Agent 4: OpenAPI docs complete

**Go/No-Go**: Agent 1 must complete Issue #7-9 before Epic 4 starts

---

### 🔄 Sync Point 3 (End of Week 6)
**Who**: Agents 1, 2, 3, 4
**Purpose**: Validate code generation working

**Checklist**:
- [ ] Agent 1: Code generation producing valid components
- [ ] Agent 2: S3 storage + error handling complete
- [ ] Agent 3: MFA + audit logging working
- [ ] Agent 4: CLI + preview system ready (dependent on Agent 1)

**Go/No-Go**: Agent 1 must complete Issue #10-13 before Epic 5 starts
**Trigger**: Agent 5 can now start Epic 8 (versioning)

---

### 🔄 Sync Point 4 (End of Week 8)
**Who**: All agents
**Purpose**: MVP integration testing

**Checklist**:
- [ ] Agent 1: Full validation pipeline passing
- [ ] Agent 2: All infrastructure operational
- [ ] Agent 3: Security audit passing
- [ ] Agent 4: CLI published, preview working
- [ ] Agent 5: Versioning MVP complete (optional)

**Go/No-Go**: Full end-to-end test (design → validated component)
**Decision**: MVP release or additional iteration?

---

## Communication Protocol

### Daily Standups (Async)
Each agent posts:
1. **Yesterday**: What was completed (issue # + acceptance criteria met)
2. **Today**: What's being worked on (issue #)
3. **Blockers**: Any dependencies or issues

### Weekly Sync (All Agents)
**Topics**:
- Review progress against timeline
- Identify blockers and dependencies
- Adjust priorities if needed
- Plan next week's work

### Ad-Hoc Syncs
**When to trigger**:
- Dependency blocked (Agent X needs output from Agent Y)
- Major architectural decision needed
- Critical bug affecting multiple agents
- Sync point approaching

---

## Handoff Checklist

### When Agent 1 Completes Epic 1 → Agent 4 Needs Output
**Handoff Items**:
- [ ] Token extraction API endpoint deployed and documented
- [ ] Sample token extraction responses (screenshot + Figma)
- [ ] Error handling behavior documented
- [ ] Performance metrics (p50, p95 latency)

### When Agent 1 Completes Epic 4 → Agent 5 Can Start
**Handoff Items**:
- [ ] Code generation API endpoint deployed
- [ ] Sample generated components (Button, Card, Input)
- [ ] Component metadata schema
- [ ] S3 storage paths documented

### When Agent 3 Completes Epic 9 → Agent 6 Can Start
**Handoff Items**:
- [ ] Authentication system fully operational
- [ ] User roles/permissions schema
- [ ] API key scoping mechanism
- [ ] Audit logging available for team actions

---

## Success Metrics by Agent

### Agent 1: CorePipeline
- ✅ Token extraction success rate ≥95%
- ✅ Requirements precision ≥80%, recall ≥70%
- ✅ Pattern retrieval MRR ≥0.75, Hit@3 ≥0.85
- ✅ Code generation produces valid TypeScript 100%
- ✅ Validation passes with 0 critical issues

### Agent 2: Infrastructure
- ✅ Cache hit rate ≥20% after 50 generations
- ✅ LangSmith traces for 100% of operations
- ✅ Error rate <1% under normal load
- ✅ p50 latency ≤60s for Button/Card

### Agent 3: Security
- ✅ 0 PATs in database or logs
- ✅ Auth failure rate <1%
- ✅ MFA adoption ≥30%
- ✅ Security audit passes with 0 critical findings

### Agent 4: DeveloperExperience
- ✅ API documentation covers 100% of endpoints
- ✅ CLI adoption ≥50% of users
- ✅ Tutorial completion rate ≥80%
- ✅ Support tickets <10% of users

### Agent 5: Versioning
- ✅ Regeneration success rate ≥95%
- ✅ Version storage <100MB per component
- ✅ Change detection latency <5 min

---

## Risk Mitigation by Agent

### Agent 1 Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| GPT-4V quality inconsistent | High | Confidence scoring + manual override |
| Pattern retrieval poor accuracy | High | Curated library + weighted fusion |
| Generation too slow | Medium | Caching + streaming responses |

### Agent 2 Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| S3 costs high | Medium | Lifecycle policy (90-day retention) |
| Redis outage | Medium | Graceful fallback (continue without cache) |
| Metrics overhead | Low | Async collection, sampling |

### Agent 3 Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Vault outage | Critical | Fallback to encrypted DB + alerts |
| Rate limiting too strict | Medium | Per-tier limits + temp increases |
| MFA lockout | Medium | Backup codes + recovery process |

### Agent 4 Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| CLI bugs affect users | High | Thorough testing + gradual rollout |
| Documentation outdated | Medium | Automated checks + quarterly review |
| Preview system slow | Low | Optimize iframe rendering |

### Agent 5 Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Version storage costs | Medium | Archive old versions + compression |
| Auto-regen breaks code | High | Require approval for breaking changes |
| Webhook failures | Medium | Fallback to polling + retry |

---

## Quick Start for New Agent

### Step 1: Setup
1. Clone repo: `git clone <repo>`
2. Install dependencies: `make install`
3. Start services: `docker-compose up -d`
4. Verify setup: `make test`

### Step 2: Find Your Issues
1. Check your agent assignment in this document
2. Review issues in `.claude/AGENT_TASKS.md`
3. Create GitHub issues using template
4. Assign issues to yourself

### Step 3: Development Flow
1. Create feature branch: `git checkout -b agent-X/issue-Y`
2. Implement issue (refer to epic files in `.claude/epics/`)
3. Run tests: `make test`
4. Commit with issue reference: `git commit -m "feat: <description> (#Y)"`
5. Create PR and request review
6. Update todo list to mark complete

### Step 4: Coordination
1. Post daily standup in team channel
2. Attend weekly sync meetings
3. Communicate blockers immediately
4. Handoff completed work with checklist

---

## Quick Reference Commands

### For Agent 1 (CorePipeline)
```bash
# Backend testing
cd backend && pytest tests/test_tokens.py -v
cd backend && pytest tests/test_requirements.py -v
cd backend && pytest tests/test_retrieval.py -v
cd backend && pytest tests/test_generation.py -v
cd backend && pytest tests/test_validation.py -v

# Frontend testing
cd app && npm test components/tokens
cd app && npm test components/requirements
```

### For Agent 2 (Infrastructure)
```bash
# Start monitoring stack
docker-compose up -d prometheus grafana

# Check cache performance
redis-cli INFO stats

# View LangSmith traces
open https://smith.langchain.com

# Test S3 storage
aws s3 ls s3://componentforge-components/
```

### For Agent 3 (Security)
```bash
# Test vault connection
vault status

# Check JWT validation
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/profile

# Test rate limiting
for i in {1..60}; do curl http://localhost:8000/api/v1/generate; done

# View audit logs
psql -d componentforge -c "SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10;"
```

### For Agent 4 (DeveloperExperience)
```bash
# View OpenAPI docs
open http://localhost:8000/docs

# Test CLI
npm install -g ./cli
componentforge generate <figma-url>

# Run preview
cd app && npm run dev
open http://localhost:3000/preview/123
```

### For Agent 5 (Versioning)
```bash
# Test regeneration
curl -X POST http://localhost:8000/api/v1/regenerate/123

# View version history
psql -d componentforge -c "SELECT * FROM component_versions WHERE component_id = '123';"

# Test diff generation
curl http://localhost:8000/api/v1/components/123/versions/compare?v1=1.0.0&v2=1.1.0
```
