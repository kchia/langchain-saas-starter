# Epic 004: Integration Validation Guide

This document describes how to validate the complete LangSmith observability integration.

## INT-1: Frontend to Backend Trace Data Connection ✅

**Status:** COMPLETE - Already working correctly

### Verification

The frontend API client correctly extracts trace metadata from backend responses:

1. **TypeScript Types Match Backend:**
   - `app/src/types/generation.types.ts` defines `GenerationMetadata` interface
   - Includes `trace_url?: string` and `session_id?: string` fields
   - Backend `backend/src/generation/types.py` has matching `GenerationMetadata` Pydantic model

2. **API Client Returns Correct Type:**
   - `app/src/lib/api/generation.ts` -> `generateComponent()` returns `Promise<GenerationResponse>`
   - `GenerationResponse.metadata` includes trace data
   - No additional extraction needed - axios automatically parses JSON response

3. **Session ID Flows Correctly:**
   - Backend sends `X-Session-ID` header
   - Backend also includes `session_id` in response body `metadata` field
   - Frontend receives both (header accessible via `response.headers`, body via `response.data`)

### Code References

**Frontend API Client:**
```typescript
// app/src/lib/api/generation.ts
export async function generateComponent(
  request: GenerationRequest
): Promise<GenerationResponse> {
  const response = await client.post<GenerationResponse>(
    '/generation/generate',
    request
  );
  return response.data; // Includes metadata.trace_url and metadata.session_id
}
```

**Frontend Types:**
```typescript
// app/src/types/generation.types.ts
export interface GenerationMetadata {
  // ... other fields
  trace_url?: string;  // LangSmith trace URL
  session_id?: string; // Session ID for tracking
}
```

**Backend Response:**
```python
# backend/src/api/v1/routes/generation.py
response = {
    "metadata": {
        "trace_url": trace_url,  # From get_trace_url(run_id)
        "session_id": session_id, # From get_session_id()
        # ... other metadata
    }
}
```

## INT-2: End-to-End Tracing Validation ✅

**Status:** COMPLETE - Tests implemented

### Test Coverage

**Backend Integration Tests:** `backend/tests/integration/test_e2e_tracing_flow.py`

- `test_generation_response_includes_session_id()` - Validates session ID in response
- `test_generation_response_includes_trace_url_when_available()` - Validates trace URL generation
- `test_generation_handles_missing_trace_url_gracefully()` - Validates graceful degradation
- `test_get_trace_url_format()` - Validates URL format
- `test_session_id_format()` - Validates UUID format
- `test_different_requests_get_different_session_ids()` - Validates session isolation

**Frontend E2E Tests:** `app/e2e/observability.spec.ts`

- Tests for trace link display
- Tests for metadata display (latency, tokens, cost)
- Tests for graceful handling of missing trace URLs
- Tests for stage breakdown visualization

### Running Tests

**Backend:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
pytest tests/integration/test_e2e_tracing_flow.py -v
```

**Frontend:**
```bash
cd app
npm run test:e2e
```

## INT-3: Documentation Updates ✅

**Status:** COMPLETE - Documentation updated

### Updated Documentation

**File:** `docs/features/observability.md`

**Additions:**
1. **Frontend Integration Section**
   - How to use `LangSmithTraceLink` component
   - How to use `GenerationMetadataDisplay` component
   - What information is displayed in the UI

2. **Session Tracking Section**
   - Session ID generation and flow
   - How to access session ID in backend code
   - Session ID usage examples

3. **Custom Metadata Section**
   - Using `@traced` decorator with metadata
   - Using `build_trace_metadata()` helper
   - Trace URL generation utilities

4. **Troubleshooting Section**
   - No trace link in UI
   - Trace link but no trace in LangSmith
   - Missing stages in trace
   - Session ID not showing
   - Frontend not displaying trace link
   - Log analysis by session ID

## Manual Validation Checklist

To manually validate the complete integration:

### Prerequisites
- [ ] LangSmith account created at smith.langchain.com
- [ ] `LANGCHAIN_TRACING_V2=true` in `backend/.env`
- [ ] `LANGCHAIN_API_KEY` set in `backend/.env`
- [ ] Backend running: `cd backend && uvicorn src.main:app --reload`
- [ ] Frontend running: `cd app && npm run dev`

### Validation Steps

#### 1. Session Tracking
- [ ] Make any API request (e.g., GET /health)
- [ ] Verify `X-Session-ID` header in response
- [ ] Verify session ID is a valid UUID (36 chars, 5 parts separated by hyphens)
- [ ] Make another request and verify different session ID

#### 2. Trace URL Generation
- [ ] Upload an image and extract tokens
- [ ] Navigate to pattern selection and requirements
- [ ] Generate a component
- [ ] Wait for generation to complete
- [ ] Verify "View Trace" link appears in preview page
- [ ] Verify link format: `https://smith.langchain.com/o/default/projects/p/{project}/r/{run_id}`
- [ ] Click link and verify it opens LangSmith in new tab
- [ ] Verify trace appears in LangSmith dashboard

#### 3. Metadata Display
- [ ] In preview page, check Observability section
- [ ] Verify generation metrics are displayed:
  - [ ] Latency (in seconds)
  - [ ] Token count
  - [ ] Token breakdown (prompt/completion)
  - [ ] Stage breakdown with progress bars
- [ ] Verify session ID is shown (first 8 characters)

#### 4. Trace Content
- [ ] Open trace in LangSmith
- [ ] Verify trace includes these stages:
  - [ ] `extract_tokens` (if image uploaded)
  - [ ] `classify_component` (if classifier used)
  - [ ] `propose_requirements` (for each requirement agent)
  - [ ] `generate_component_llm_first` (code generation)
- [ ] Verify metadata includes:
  - [ ] `session_id`
  - [ ] `timestamp`
  - [ ] Any custom metadata (user_id, component_type, etc.)

#### 5. Graceful Degradation
- [ ] Stop backend
- [ ] In `backend/.env`, set `LANGCHAIN_TRACING_V2=false`
- [ ] Restart backend
- [ ] Generate a component
- [ ] Verify:
  - [ ] Generation still succeeds
  - [ ] `trace_url` is `null` in response
  - [ ] No "View Trace" link in UI (or message saying tracing disabled)
  - [ ] Session ID still works

## Automated Validation

Run all integration tests:

```bash
# Backend integration tests
cd backend
source venv/bin/activate
pytest tests/integration/ -v -k tracing

# Frontend E2E tests
cd app
npm run test:e2e -- observability.spec.ts

# All tests
make test
```

## Success Criteria

✅ **All criteria met:**

1. ✅ Frontend API client correctly receives and types trace metadata
2. ✅ Session ID appears in both response header and body
3. ✅ Trace URL is correctly formatted and included in response
4. ✅ Graceful degradation when tracing is disabled
5. ✅ Frontend displays trace link and metadata
6. ✅ Integration tests pass
7. ✅ Documentation is comprehensive and accurate
8. ✅ Troubleshooting guide helps resolve common issues

## Notes

- **INT-1** required no code changes - already working correctly from PRs #82 and #83
- **INT-2** added comprehensive test coverage for E2E flow
- **INT-3** enhanced documentation with practical examples and troubleshooting

## See Also

- Epic 004 specification: `.claude/epics/epic-004-observability.md`
- Backend tracing implementation: `backend/src/core/tracing.py`
- Frontend trace link component: `app/src/components/observability/LangSmithTraceLink.tsx`
- Frontend metadata display: `app/src/components/observability/GenerationMetadataDisplay.tsx`
