# E2E Evaluation Issues Analysis

## Summary of Problems

The evaluation results show poor performance due to several critical issues:

### 1. Pattern Retrieval Failures (0% Success Rate)

**Root Causes:**

- **Mock patterns have wrong schema**: Mock patterns use `component_type` field, but BM25Retriever expects `category` field (line 102 in `bm25_retriever.py`)
- **Minimal mock patterns**: Mock patterns lack rich metadata that real patterns have, leading to poor BM25 scoring
- **Evaluator uses mock patterns**: Should load real patterns from `data/patterns/*.json` like production does
- **Pattern ID mismatch**: Ground truth expects simple IDs like `"alert"`, but real patterns use IDs like `"shadcn-card"`

### 2. Semantic Retriever Unavailable

- **Qdrant is unhealthy**: Docker container shows `component-forge-qdrant-1 Up 4 minutes (unhealthy)`
- Falls back to BM25-only mode, but BM25 is broken due to mock patterns

### 3. Token Extraction Issues (5.5% Average Accuracy)

- **Many screenshots missing**: Individual component screenshots (e.g., `alert_error.png`) don't exist
- Only variant screenshots exist (e.g., `alert_variants.png`)
- Empty tokens when images missing → poor retrieval

### 4. BM25 Query Building Issues

- When `component_type` is missing/empty from requirements, BM25 query is empty or contains only token data
- Without proper component type, BM25 can't match patterns effectively

## Fixes Needed

### Priority 1: Fix Pattern Loading

- Load real patterns from `data/patterns/*.json` instead of mocks
- Map pattern IDs from ground truth to actual pattern IDs (e.g., `"alert"` → find pattern with `component_type: "alert"`)
- Ensure patterns have proper `category` field for BM25 indexing

### Priority 2: Fix BM25 Pattern Matching

- Ensure mock patterns (if used) have correct schema matching what BM25 expects
- Or better: use real patterns with proper field mapping

### Priority 3: Fix Qdrant Connection

- Investigate why Qdrant container is unhealthy
- Add better error handling/graceful degradation

### Priority 4: Fix Screenshot Loading

- Generate missing individual component screenshots OR
- Update evaluation to handle variant screenshots properly

## Expected Improvements After Fixes

- **Token Extraction**: Should improve to 60-80% (with images available)
- **Pattern Retrieval**: Should improve to 70-90% (with proper patterns and BM25 working)
- **Code Generation**: Already at 100%, but will generate better code with correct patterns
- **Overall Pipeline Success**: Should improve from 0% to 60-80%
