# Evaluation vs Production Pipeline Gaps

This document identifies differences between the evaluation pipeline and the production application pipeline, explaining what is intentionally excluded and why.

## Overview

The evaluation pipeline (`backend/src/evaluation/e2e_evaluator.py`) is designed to test the **core AI pipeline** with minimal overhead. It intentionally excludes certain production features that don't impact the core functionality being tested.

## Current Pipeline Comparison

### Production Flow

```
1. Image Upload → Security Validation → PII Detection
2. Token Extraction (GPT-4V)
3. Requirements Proposal (Multi-agent)
4. Human Review & Approval (UI interaction)
5. Pattern Retrieval (Hybrid BM25+Semantic)
6. Code Generation (LLM + Validation)
7. Code Sanitization (Security scanning)
8. Database Persistence (Audit trail)
9. Observability (LangSmith, Prometheus, Session tracking)
```

### Evaluation Flow

```
1. Token Extraction (GPT-4V)
2. Requirements Proposal (Multi-agent) ✅ Added
3. Simulated Approval (Auto-approve all)
4. Pattern Retrieval (Hybrid BM25+Semantic)
5. Code Generation (LLM + Validation)
6. Code Sanitization (Security scanning) ✅ Added
```

## Implemented Gaps (Now Closed)

### ✅ Requirements Proposal

**Status**: Implemented

**Production**: Uses `RequirementOrchestrator` to propose requirements, which are then reviewed and approved by humans via the UI.

**Evaluation**:

- Runs requirements proposal using the same orchestrator
- Auto-approves all proposals (simulates perfect human approval)
- Falls back to token-only retrieval if proposal fails

**Rationale**: Tests the requirements proposal quality and its impact on retrieval/generation, without requiring human interaction.

### ✅ Code Sanitization

**Status**: Implemented

**Production**: Runs security scanning on all generated code to detect vulnerabilities (XSS, code injection, etc.).

**Evaluation**:

- Runs the same code sanitization checks
- Tracks security metrics: `security_issues_count`, `security_severity`, `is_code_safe`
- Pipeline success requires code to be safe

**Rationale**: Ensures evaluation metrics reflect security concerns, not just compilation success.

## Intentionally Excluded Features

### Image Security Validation

**Production**:

- File upload validation (type, size, format checks)
- Image dimension validation
- SVG script detection
- PII detection (optional)

**Evaluation**: Uses PIL Image objects directly from golden dataset

**Rationale**:

- Golden dataset images are trusted/curated (no security risk)
- Validation overhead doesn't affect core pipeline metrics
- Focus on AI pipeline accuracy, not input validation

**Impact**: None (golden dataset is pre-validated)

### Human Review Step

**Production**: Users review, edit, and approve requirements in the UI before pattern retrieval

**Evaluation**: Auto-approves all proposals

**Rationale**:

- Cannot have humans in the loop for automated evaluation
- Ground truth represents "what human would approve"
- Tests: "If AI proposes correct requirements, does retrieval work?"

**Impact**: Metrics assume perfect approval (tests upper bound of pipeline performance)

### Database Persistence

**Production**:

- Stores requirement exports in PostgreSQL
- Tracks generation records with audit trails
- Records metrics and analytics

**Evaluation**: Results stored only in JSON report files

**Rationale**:

- Evaluation is for metrics, not audit compliance
- No need for database overhead during testing
- Results are persisted in reports for analysis

**Impact**: Cannot track trends over time or perform database queries (not needed for evaluation)

### Observability Infrastructure

**Production**:

- LangSmith tracing for all AI operations
- Prometheus metrics collection
- Session tracking middleware
- Request/response logging

**Evaluation**: Uses standard Python logging

**Rationale**:

- Evaluation runs in batch mode (not real-time monitoring)
- Focus on end metrics, not per-operation tracing
- Reduces overhead for faster evaluation runs

**Impact**:

- Harder to debug individual failures (but logs still available)
- No cost tracking per evaluation run
- No correlation IDs across operations

**Note**: Some observability may still work if environment variables are set, but it's not required.

### Caching

**Production**:

- L1 exact cache for repeated requests
- Redis-based caching layer

**Evaluation**: Bypasses all caching

**Rationale**:

- Each evaluation run should test fresh pipeline execution
- Cache hits would skew latency metrics
- Ensures consistent testing conditions

**Impact**: Latency metrics may be higher than production (more realistic baseline testing)

### Rate Limiting

**Production**: Enforced via Redis-based rate limiting middleware

**Evaluation**: No rate limiting

**Rationale**:

- Evaluation runs are controlled/authorized
- No risk of abuse in test environment
- Rate limiting overhead doesn't affect metrics

**Impact**: None (evaluation is a controlled environment)

### Error Handling & Retries

**Production**:

- Sophisticated retry logic with exponential backoff
- Graceful degradation and fallbacks
- Error recovery strategies

**Evaluation**: Basic error handling with fallbacks

**Rationale**:

- Evaluation should fail fast for testing purposes
- Complex retry logic adds variance to metrics
- Focus on measuring capabilities, not resilience

**Impact**: Evaluation failures may not represent production failure modes (acceptable for testing)

## Design Philosophy

The evaluation pipeline prioritizes:

1. **Accuracy**: Test the core AI capabilities accurately
2. **Speed**: Run evaluations quickly without production overhead
3. **Consistency**: Produce reproducible metrics
4. **Simplicity**: Avoid dependencies on external services (DB, Redis, etc.)

It intentionally excludes:

1. Infrastructure concerns (DB, caching, rate limiting)
2. UI interactions (human approval, file uploads)
3. Operational features (observability, persistence)
4. Resilience features (retries, fallbacks)

## When to Add Features

Add a production feature to evaluation if:

- It affects the **core AI pipeline quality** (e.g., requirements proposal ✅, code sanitization ✅)
- It impacts **metrics accuracy** (e.g., security scanning ✅)
- It's needed to **match production behavior** exactly

Don't add if:

- It's purely **infrastructure** (DB, caching, rate limiting)
- It involves **human interaction** (UI approval step - simulate instead ✅)
- It's for **operational monitoring** (observability, logging)

## Summary

| Feature               | Production | Evaluation   | Status                      |
| --------------------- | ---------- | ------------ | --------------------------- |
| Token Extraction      | ✅         | ✅           | Complete                    |
| Requirements Proposal | ✅         | ✅           | Complete                    |
| Human Approval        | ✅         | 🔄 Simulated | Auto-approve                |
| Pattern Retrieval     | ✅         | ✅           | Complete                    |
| Code Generation       | ✅         | ✅           | Complete                    |
| Code Sanitization     | ✅         | ✅           | Complete                    |
| Image Validation      | ✅         | ❌           | Excluded (trusted data)     |
| Database Persistence  | ✅         | ❌           | Excluded (metrics only)     |
| Observability         | ✅         | ⚠️ Optional  | Not required                |
| Caching               | ✅         | ❌           | Excluded (baseline testing) |
| Rate Limiting         | ✅         | ❌           | Excluded (controlled env)   |

**Legend**:

- ✅ Fully implemented
- ⚠️ Optional/partial
- 🔄 Simulated (different implementation)
- ❌ Intentionally excluded
