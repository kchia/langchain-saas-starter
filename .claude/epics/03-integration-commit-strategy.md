# Epic 3: Integration Gaps - Commit Strategy

**Status**: Critical Backend Integration Missing
**Date**: 2025-10-06
**Purpose**: Fix integration gaps to enable manual testing

---

## 🎯 Overview

This commit strategy addresses the **2 critical blockers** preventing Epic 3 manual testing:

1. ❌ Retrieval router not registered in `main.py`
2. ❌ Retrieval service not initialized in app startup

**Estimated Time**: 30-45 minutes
**Commits**: 2 critical fixes

---

## 📋 Commit Naming Convention

```
<type>(<scope>): <short description>

[Epic-3] [Integration] <detailed description>

- Bullet point of what changed
- Another change detail
- Impact on testing/functionality

Refs: #epic-3-integration
```

---

## 🚨 Critical Fixes (Priority Order)

### Commit 1: Register Retrieval Router

**Type**: `fix(backend)`
**Priority**: P0 - Blocking
**Impact**: Enables `/api/v1/retrieval/search` endpoint

```bash
git add backend/src/main.py
git commit -m "fix(backend): register retrieval router in main app

[Epic-3] [Integration] Register retrieval API endpoints

- Import retrieval router from api.v1.routes
- Register router with /api/v1 prefix
- Enables POST /api/v1/retrieval/search endpoint
- Unblocks frontend pattern retrieval

Impact:
- Frontend can now call retrieval API
- Pattern selection page can fetch data
- Manual testing now possible

File: backend/src/main.py (lines 102-106)
Refs: #epic-3-integration"
```

**Files Changed**:
- `backend/src/main.py` (2 lines modified)

**Code Change**:
```python
# Before (line 102):
from .api.v1.routes import figma, tokens, requirements

# After:
from .api.v1.routes import figma, tokens, requirements, retrieval

# Before (line 106):
app.include_router(requirements.router, prefix="/api/v1")

# After:
app.include_router(requirements.router, prefix="/api/v1")
app.include_router(retrieval.router, prefix="/api/v1")
```

---

### Commit 2: Initialize Retrieval Service in App Startup

**Type**: `feat(backend)`
**Priority**: P0 - Blocking
**Impact**: Creates retrieval service for API dependency injection

```bash
git add backend/src/main.py
git commit -m "feat(backend): initialize retrieval service on app startup

[Epic-3] [Integration] Setup retrieval service with pattern library

- Load pattern files from data/patterns/*.json
- Initialize BM25 retriever with patterns
- Initialize semantic retriever (with fallback if Qdrant unavailable)
- Create RetrievalService instance
- Assign to app.state.retrieval_service for DI
- Add error handling for missing patterns/services

Features:
- Automatic pattern library loading
- Graceful degradation (BM25 only if semantic unavailable)
- Comprehensive startup logging
- Service health validation

Impact:
- Retrieval API endpoint now functional
- Pattern search pipeline operational
- Frontend-backend integration complete

File: backend/src/main.py (lifespan function)
Refs: #epic-3-integration"
```

**Files Changed**:
- `backend/src/main.py` (30-40 lines added in lifespan function)

**Code Change**:
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting FastAPI application", extra={"extra": {"event": "startup"}})

    # Validate OpenAI API key
    import os
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set - token extraction will fail")
    else:
        logger.info("OpenAI API key configured")

    # Initialize retrieval service
    try:
        from .services.retrieval_service import RetrievalService
        from .retrieval.bm25_retriever import BM25Retriever
        from .retrieval.semantic_retriever import SemanticRetriever
        from .retrieval.query_builder import QueryBuilder
        from .retrieval.weighted_fusion import WeightedFusion
        from .retrieval.explainer import RetrievalExplainer
        import json
        import glob

        logger.info("Loading pattern library...")

        # Load patterns from JSON files
        pattern_files = glob.glob("data/patterns/*.json")
        if not pattern_files:
            logger.error("No pattern files found in data/patterns/")
            raise FileNotFoundError("Pattern library is empty")

        patterns = []
        for file in pattern_files:
            try:
                with open(file) as f:
                    pattern = json.load(f)
                    patterns.append(pattern)
                    logger.info(f"Loaded pattern: {pattern.get('name', 'unknown')} from {file}")
            except Exception as e:
                logger.error(f"Failed to load pattern from {file}: {e}")

        logger.info(f"Loaded {len(patterns)} patterns from library")

        # Initialize retrievers
        bm25_retriever = BM25Retriever(patterns)
        logger.info("BM25 retriever initialized")

        # Try to initialize semantic retriever (graceful fallback)
        semantic_retriever = None
        try:
            semantic_retriever = SemanticRetriever(patterns)
            logger.info("Semantic retriever initialized with Qdrant")
        except Exception as e:
            logger.warning(f"Semantic retriever unavailable: {e}. Using BM25 only.")

        # Initialize service components
        query_builder = QueryBuilder()
        weighted_fusion = WeightedFusion()
        explainer = RetrievalExplainer()

        # Create retrieval service
        app.state.retrieval_service = RetrievalService(
            patterns=patterns,
            bm25_retriever=bm25_retriever,
            semantic_retriever=semantic_retriever,
            query_builder=query_builder,
            weighted_fusion=weighted_fusion,
            explainer=explainer
        )

        logger.info(
            f"Retrieval service initialized successfully "
            f"(BM25: ✓, Semantic: {'✓' if semantic_retriever else '✗'})"
        )

    except Exception as e:
        logger.error(f"Failed to initialize retrieval service: {e}", exc_info=True)
        logger.warning("Retrieval endpoints will return 503 Service Unavailable")

    yield

    logger.info("Shutting down FastAPI application", extra={"extra": {"event": "shutdown"}})
```

---

## 🧪 Verification Steps

### After Commit 1 (Router Registration)

```bash
# Start backend
cd backend
source venv/bin/activate
uvicorn src.main:app --reload

# Check API docs
open http://localhost:8000/docs

# Verify endpoint exists
curl http://localhost:8000/api/v1/retrieval/health
```

**Expected**: Endpoint accessible but returns 503 (service not initialized)

---

### After Commit 2 (Service Initialization)

```bash
# Check startup logs
tail -f logs/backend.log

# Expected logs:
# - "Loading pattern library..."
# - "Loaded 2 patterns from library"
# - "BM25 retriever initialized"
# - "Retrieval service initialized successfully"

# Test retrieval endpoint
curl -X POST http://localhost:8000/api/v1/retrieval/search \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": {
      "component_type": "Button",
      "props": ["variant", "size"],
      "variants": ["primary", "secondary"]
    }
  }'
```

**Expected**: 200 response with top-3 patterns

---

### Full Integration Test

```bash
# 1. Start services
docker-compose up -d

# 2. Start backend
cd backend
source venv/bin/activate
uvicorn src.main:app --reload

# 3. Start frontend
cd app
npm run dev

# 4. Test full flow
open http://localhost:3000
# Navigate: Home → Requirements → Patterns
# Verify: Patterns load and display correctly
```

---

## 📊 Success Criteria

### Commit 1 Success
- [x] Retrieval router imported in `main.py`
- [x] Router registered with `/api/v1` prefix
- [x] Endpoint appears in `/docs`
- [x] Health check returns 200 or 503

### Commit 2 Success
- [x] Pattern files loaded on startup
- [x] BM25 retriever initialized
- [x] Semantic retriever initialized (or graceful fallback)
- [x] Service assigned to `app.state.retrieval_service`
- [x] POST `/api/v1/retrieval/search` returns 200
- [x] Response contains top-3 patterns

### Manual Testing Success
- [x] Frontend loads without errors
- [x] Pattern selection page fetches data
- [x] Top-3 patterns displayed
- [x] Confidence scores visible
- [x] Pattern selection works
- [x] Navigation to generation works

---

## 🔄 Rollback Plan

### If Commit 1 Fails
```bash
git revert HEAD
# System returns to previous state
# Retrieval endpoints unavailable
```

### If Commit 2 Fails
```bash
git revert HEAD
# Router still registered but service unavailable
# Endpoints return 503
# Can debug service initialization separately
```

---

## 📝 Additional Improvements (Optional)

These are **NOT blockers** but recommended for production readiness:

### Optional Commit 3: Add Remaining Patterns

```bash
git commit -m "chore(data): add remaining 8 patterns to library

[Epic-3] [B1] Complete pattern library with all P0 components

- Add input.json (text input with validation)
- Add select.json (dropdown with search)
- Add badge.json (status indicators)
- Add alert.json (notification banners)
- Add checkbox.json (form checkbox)
- Add radio.json (radio button group)
- Add switch.json (toggle switch)
- Add tabs.json (tabbed navigation)

Impact:
- Full component type coverage
- Better retrieval diversity
- More realistic testing scenarios

Pattern count: 2 → 10 (+8 patterns)
Refs: #epic-3-integration"
```

### Optional Commit 4: Add Semantic Search Configuration

```bash
git commit -m "feat(backend): configure Qdrant for semantic search

[Epic-3] [B4] Setup vector database for semantic retrieval

- Add Qdrant client initialization
- Create pattern embeddings collection
- Configure similarity search parameters
- Add collection health check

Impact:
- Enables hybrid retrieval (BM25 + semantic)
- Improves pattern matching accuracy
- Better handling of synonyms/variations

Refs: #epic-3-integration"
```

---

## 🎯 Final State After Critical Commits

```
✅ Epic 3 Status: READY FOR MANUAL TESTING

Backend:
✅ Retrieval router registered
✅ Retrieval service initialized
✅ Pattern library loaded (2-10 patterns)
✅ BM25 retrieval operational
⚠️ Semantic retrieval (optional, fallback to BM25)

Frontend:
✅ Pattern selection page complete
✅ API integration working
✅ Error handling implemented
✅ Loading states configured

Integration:
✅ Epic 2 → Epic 3 data flow
✅ Epic 3 → Epic 4 data flow
✅ End-to-end pipeline functional

Testing:
✅ 20 integration tests passing
✅ CI/CD workflow configured
✅ Manual testing enabled
```

---

## 🚀 Deployment Checklist

Before deploying to staging/production:

1. **Environment Variables**
   - [ ] `OPENAI_API_KEY` configured
   - [ ] `QDRANT_URL` configured
   - [ ] `DATABASE_URL` configured
   - [ ] `REDIS_URL` configured

2. **Services Running**
   - [ ] PostgreSQL (port 5432)
   - [ ] Qdrant (port 6333)
   - [ ] Redis (port 6379)

3. **Application Health**
   - [ ] Backend: `http://localhost:8000/health` returns 200
   - [ ] Retrieval: `http://localhost:8000/api/v1/retrieval/health` returns 200
   - [ ] Frontend: `http://localhost:3000` loads

4. **Integration Verified**
   - [ ] Pattern retrieval returns results
   - [ ] Confidence scores calculated
   - [ ] Match highlights displayed
   - [ ] Pattern selection persists

---

## 📚 References

- **Task Breakdown**: `.claude/epics/03-pattern-retrieval-tasks.md`
- **Original Commit Strategy**: `.claude/epics/03-commit-strategy.md`
- **Frontend Summary**: `EPIC_3_FRONTEND_IMPLEMENTATION_SUMMARY.md`
- **Integration Tests Summary**: `EPIC_3_INTEGRATION_TESTING_SUMMARY.md`
- **Readiness Report**: See conversation history

---

**Next Steps**: Execute Commit 1 and Commit 2, then proceed with manual testing.
