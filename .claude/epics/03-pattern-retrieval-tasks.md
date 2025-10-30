# Epic 3: Pattern Retrieval & Matching - Task Breakdown

**Epic Document**: [03-pattern-retrieval.md](./03-pattern-retrieval.md)
**Status**: Not Started
**Priority**: High
**Last Updated**: 2025-10-05

---

## 📊 Task Summary

| Category | Total Tasks | Not Started | In Progress | Completed |
|----------|-------------|-------------|-------------|-----------|
| **Backend** | 8 | 6 | 2 (partial) | 0 |
| **Frontend** | 5 | 5 | 0 | 0 |
| **Integration** | 4 | 4 | 0 | 0 |
| **Testing** | 6 | 6 | 0 | 0 |
| **TOTAL** | **23** | **21** | **2** | **0** |

---

## 🔥 Critical Path (MVP Implementation Order)

### Phase 1: Backend Foundation (Week 1)
1. **B1** - Complete pattern library (8 remaining patterns)
2. **B2** - Setup Qdrant and seed patterns
3. **B8** - Query builder implementation ⚠️ NEW
4. **T1** - Create evaluation dataset
5. **B3** - BM25 lexical retriever

### Phase 2: Core Retrieval (Week 2)
6. **B4** - Semantic search implementation
7. **B5** - Weighted fusion (0.3 BM25 + 0.7 Semantic)
8. **B6** - Explainability & confidence scoring
9. **B7** - Retrieval API endpoint
10. **T2** - Metrics implementation & evaluation

### Phase 3: Frontend (Week 3)
11. **F5** - Pattern selection state management ⚠️ NEW
12. **F1** - Pattern selection page UI
13. **F3** - Code preview modal
14. **F4** - Loading & error states
15. **I1** - Frontend-Backend API integration

### Phase 4: Integration & Testing (Week 4)
16. **I4** - Navigation & routing ⚠️ NEW
17. **I2** - Epic 2 → Epic 3 data flow
18. **I3** - Epic 3 → Epic 4 data flow
19. **T3** - Backend unit tests
20. **T4** - Frontend component tests
21. **T5** - Integration tests
22. **F2** - Pattern comparison modal (optional)
23. **T6** - E2E tests (optional)

---

## 📦 BACKEND TASKS

### B1: Pattern Library Curation
**Owner**: Backend Team
**Status**: 🟡 Partial (2/10 complete - Button ✅, Card ✅)
**Priority**: P0 - Blocking
**Original Epic Task**: Task 1

**Deliverables**:
- [ ] Create 8 additional pattern JSON files:
  - [ ] `backend/data/patterns/input.json`
  - [ ] `backend/data/patterns/select.json`
  - [ ] `backend/data/patterns/badge.json`
  - [ ] `backend/data/patterns/alert.json`
  - [ ] `backend/data/patterns/checkbox.json`
  - [ ] `backend/data/patterns/radio.json`
  - [ ] `backend/data/patterns/switch.json`
  - [ ] `backend/data/patterns/tabs.json`
- [ ] Extract TypeScript code from shadcn/ui repository
- [ ] Parse AST to validate code quality
- [ ] Create comprehensive metadata:
  - Component name and type
  - Props interface
  - Variants and states
  - Accessibility features (ARIA attributes)
  - Usage examples
- [ ] Store in structured JSON format
- [ ] Validate TypeScript compilation

**Reference**:
- Pattern structure: See `backend/data/patterns/button.json`
- Component specs: `.claude/BASE-COMPONENTS.md`

**Files**:
```
backend/data/patterns/
  ✅ button.json
  ✅ card.json
  ❌ input.json
  ❌ select.json
  ❌ badge.json
  ❌ alert.json
  ❌ checkbox.json
  ❌ radio.json
  ❌ switch.json
  ❌ tabs.json
backend/scripts/curate_patterns.py (optional helper)
```

**Acceptance Criteria**:
- ✅ All 10 patterns have valid JSON structure
- ✅ Metadata includes props, variants, states, a11y features
- ✅ TypeScript code is syntactically valid
- ✅ Each pattern has usage examples

---

### B2: Qdrant Vector Store Setup
**Owner**: Backend/DevOps
**Status**: 🟡 Partial (seed script exists ✅, needs execution)
**Priority**: P0 - Blocking
**Original Epic Task**: Task 2

**Deliverables**:
- [ ] Start Qdrant service via docker-compose
- [ ] Run `seed_patterns.py` to create collection
- [ ] Verify collection config:
  - Vector size: 1536 (text-embedding-3-small)
  - Distance metric: Cosine
  - Indexing: HNSW for fast search
- [ ] Verify all patterns indexed in Qdrant dashboard
- [ ] Test vector search returns results

**Files**:
```
✅ backend/scripts/seed_patterns.py (implemented)
❌ backend/src/services/qdrant_client.py (optional wrapper)
```

**Commands**:
```bash
# Start Qdrant
docker-compose up -d qdrant

# Seed patterns
cd backend && source venv/bin/activate
export OPENAI_API_KEY=<your-key>
python scripts/seed_patterns.py

# Verify
open http://localhost:6333/dashboard
```

**Acceptance Criteria**:
- ✅ Qdrant service running on port 6333
- ✅ Collection `patterns` created with 1536-dim vectors
- ✅ All 10 patterns indexed with embeddings
- ✅ Vector search query returns relevant results
- ✅ Dashboard shows collection statistics

---

### B3: BM25 Lexical Search
**Owner**: Backend/AI Team
**Status**: ❌ Not Started
**Priority**: P0 - Blocking
**Original Epic Task**: Task 3

**Deliverables**:
- [ ] Install `rank-bm25` package: `pip install rank-bm25`
- [ ] Implement BM25 retriever class
- [ ] Index pattern metadata (name, type, props, description)
- [ ] Support multi-field search with weights:
  - Component name (weight: 3.0)
  - Component type (weight: 2.0)
  - Props and variants (weight: 1.5)
  - Description (weight: 1.0)
- [ ] Return scored results with BM25 relevance
- [ ] Handle tokenization (camelCase, kebab-case)

**Files**:
```
backend/src/retrieval/__init__.py
backend/src/retrieval/bm25_retriever.py
```

**Implementation Skeleton**:
```python
# backend/src/retrieval/bm25_retriever.py
from rank_bm25 import BM25Okapi
from typing import List, Dict, Tuple

class BM25Retriever:
    def __init__(self, patterns: List[Dict]):
        """Initialize BM25 with weighted corpus."""
        self.patterns = patterns
        corpus = [self._create_document(p) for p in patterns]
        self.bm25 = BM25Okapi(corpus)

    def _create_document(self, pattern: Dict) -> List[str]:
        """Create weighted document for BM25 indexing."""
        doc = []
        # Name (weight: 3)
        doc.extend([pattern["name"]] * 3)
        # Type (weight: 2)
        doc.extend([pattern.get("category", "")] * 2)
        # Props (weight: 1.5)
        props = [p["name"] for p in pattern.get("metadata", {}).get("props", [])]
        doc.extend(props + props[:len(props)//2])  # 1.5x weight
        # Description (weight: 1)
        doc.append(pattern.get("description", ""))
        return doc

    def search(self, query: str, top_k: int = 10) -> List[Tuple[Dict, float]]:
        """Search patterns using BM25."""
        scores = self.bm25.get_scores(query.split())
        results = sorted(
            zip(self.patterns, scores),
            key=lambda x: x[1],
            reverse=True
        )
        return results[:top_k]
```

**Acceptance Criteria**:
- ✅ BM25 returns relevant results for keyword queries
- ✅ Multi-field weighting works correctly
- ✅ Handles queries like "button with variants", "card component"
- ✅ Scores are reasonable and consistent

---

### B4: Semantic Search Implementation
**Owner**: Backend/AI Team
**Status**: ❌ Not Started
**Priority**: P0 - Blocking
**Original Epic Task**: Task 4

**Deliverables**:
- [ ] Implement semantic retriever using Qdrant
- [ ] Generate query embeddings with text-embedding-3-small
- [ ] Query embedding from:
  - Component type from requirements
  - Proposed props and variants
  - Accessibility requirements
- [ ] Search Qdrant with cosine similarity
- [ ] Return top-k patterns with similarity scores
- [ ] Cache embeddings in Redis (1 hour TTL)
- [ ] Handle OpenAI API errors with retry logic

**Files**:
```
backend/src/retrieval/semantic_retriever.py
backend/src/services/embedding_service.py (optional)
```

**Implementation Skeleton**:
```python
# backend/src/retrieval/semantic_retriever.py
from openai import AsyncOpenAI
from qdrant_client import QdrantClient
from typing import List, Dict, Tuple

class SemanticRetriever:
    def __init__(
        self,
        qdrant_client: QdrantClient,
        openai_client: AsyncOpenAI,
        collection_name: str = "patterns"
    ):
        self.qdrant = qdrant_client
        self.openai = openai_client
        self.collection_name = collection_name

    async def _create_embedding(self, text: str) -> List[float]:
        """Generate embedding for query text."""
        response = await self.openai.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding

    async def search(self, query: str, top_k: int = 10) -> List[Tuple[Dict, float]]:
        """Semantic search using vector similarity."""
        # Generate query embedding
        query_vector = await self._create_embedding(query)

        # Search Qdrant
        results = self.qdrant.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=top_k
        )

        # Format results
        return [(r.payload, r.score) for r in results]
```

**Acceptance Criteria**:
- ✅ Semantic search returns contextually relevant patterns
- ✅ Similarity scores are reasonable (0-1 range)
- ✅ Handles natural language queries well
- ✅ Caching reduces embedding API calls
- ✅ Retry logic handles API failures gracefully

---

### B5: Weighted Fusion
**Owner**: Backend/AI Team
**Status**: ❌ Not Started
**Priority**: P0 - Blocking
**Original Epic Task**: Task 5 (Simplified from MMR/RRF)

**Deliverables**:
- [ ] Combine BM25 + Semantic rankings
- [ ] Apply weights:
  - BM25: 0.3
  - Semantic: 0.7
- [ ] Normalize scores to 0-1 range
- [ ] Handle patterns appearing in only one retriever
- [ ] Return top-3 patterns with combined scores

**Files**:
```
backend/src/retrieval/weighted_fusion.py
```

**Implementation Skeleton**:
```python
# backend/src/retrieval/weighted_fusion.py
from typing import List, Dict, Tuple

class WeightedFusion:
    def __init__(self, bm25_weight: float = 0.3, semantic_weight: float = 0.7):
        self.bm25_weight = bm25_weight
        self.semantic_weight = semantic_weight

    def _normalize_scores(self, results: List[Tuple[Dict, float]]) -> Dict[str, float]:
        """Normalize scores to 0-1 range."""
        if not results:
            return {}

        scores = [score for _, score in results]
        min_score = min(scores)
        max_score = max(scores)
        range_score = max_score - min_score if max_score != min_score else 1

        return {
            pattern["id"]: (score - min_score) / range_score
            for pattern, score in results
        }

    def fuse(
        self,
        bm25_results: List[Tuple[Dict, float]],
        semantic_results: List[Tuple[Dict, float]],
        top_k: int = 3
    ) -> List[Tuple[Dict, float]]:
        """Combine BM25 and semantic rankings with weights."""
        # Normalize scores
        bm25_scores = self._normalize_scores(bm25_results)
        semantic_scores = self._normalize_scores(semantic_results)

        # Combine scores
        all_pattern_ids = set(bm25_scores.keys()) | set(semantic_scores.keys())
        combined_scores = {}

        for pattern_id in all_pattern_ids:
            bm25_score = bm25_scores.get(pattern_id, 0)
            semantic_score = semantic_scores.get(pattern_id, 0)

            combined_scores[pattern_id] = (
                self.bm25_weight * bm25_score +
                self.semantic_weight * semantic_score
            )

        # Sort and get top-k
        sorted_ids = sorted(
            combined_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:top_k]

        # Retrieve full pattern data
        pattern_map = {p["id"]: p for p, _ in bm25_results + semantic_results}
        return [(pattern_map[pid], score) for pid, score in sorted_ids]
```

**Acceptance Criteria**:
- ✅ Weighted fusion combines BM25 + Semantic effectively
- ✅ Weights (0.3/0.7) are configurable
- ✅ Normalization works correctly
- ✅ Handles edge cases (pattern in only one retriever)
- ✅ Top-3 results are reasonable

---

### B6: Explainability & Confidence Scoring
**Owner**: Backend/AI Team
**Status**: ❌ Not Started
**Priority**: P1 - High
**Original Epic Task**: Task 8

**Deliverables**:
- [ ] Generate explanation for each pattern match
- [ ] Compute confidence score (0-1) based on:
  - Final ranking score (normalized)
  - Agreement between BM25 and semantic
  - Pattern metadata completeness
- [ ] Identify matching features (props, variants, a11y)
- [ ] Return structured explanation with each result

**Files**:
```
backend/src/retrieval/explainer.py
```

**Output Schema**:
```json
{
  "pattern_id": "shadcn-button",
  "confidence": 0.92,
  "explanation": "Matches 'button' type with 'variant' and 'size' props. High semantic similarity (0.89) and keyword match (0.95).",
  "match_highlights": {
    "matched_props": ["variant", "size", "disabled"],
    "matched_variants": ["primary", "secondary", "ghost"],
    "matched_a11y": ["aria-label", "keyboard navigation"]
  },
  "ranking_details": {
    "bm25_score": 0.95,
    "bm25_rank": 1,
    "semantic_score": 0.89,
    "semantic_rank": 2,
    "final_score": 0.915,
    "final_rank": 1
  }
}
```

**Implementation Skeleton**:
```python
# backend/src/retrieval/explainer.py
from typing import Dict, List

class RetrievalExplainer:
    def explain(
        self,
        pattern: Dict,
        requirements: Dict,
        bm25_score: float,
        bm25_rank: int,
        semantic_score: float,
        semantic_rank: int,
        final_score: float,
        final_rank: int
    ) -> Dict:
        """Generate explanation for pattern match."""

        # Find matching features
        match_highlights = self._find_matches(pattern, requirements)

        # Compute confidence
        confidence = self._compute_confidence(
            final_score, bm25_rank, semantic_rank, pattern
        )

        # Generate explanation text
        explanation = self._generate_explanation(
            pattern, requirements, match_highlights, bm25_score, semantic_score
        )

        return {
            "pattern_id": pattern["id"],
            "confidence": round(confidence, 2),
            "explanation": explanation,
            "match_highlights": match_highlights,
            "ranking_details": {
                "bm25_score": round(bm25_score, 2),
                "bm25_rank": bm25_rank,
                "semantic_score": round(semantic_score, 2),
                "semantic_rank": semantic_rank,
                "final_score": round(final_score, 2),
                "final_rank": final_rank
            }
        }

    def _find_matches(self, pattern: Dict, requirements: Dict) -> Dict:
        """Identify matching props, variants, a11y features."""
        # TODO: Implement matching logic
        pass

    def _compute_confidence(
        self, final_score: float, bm25_rank: int,
        semantic_rank: int, pattern: Dict
    ) -> float:
        """Compute confidence score 0-1."""
        # TODO: Implement confidence calculation
        pass

    def _generate_explanation(
        self, pattern: Dict, requirements: Dict,
        matches: Dict, bm25_score: float, semantic_score: float
    ) -> str:
        """Generate human-readable explanation."""
        # TODO: Implement explanation generation
        pass
```

**Acceptance Criteria**:
- ✅ Explanations are clear and accurate
- ✅ Confidence scores correlate with relevance
- ✅ Match highlights show why pattern was selected
- ✅ Ranking details help debugging

---

### B7: Retrieval API Endpoint
**Owner**: Backend Team
**Status**: ❌ Not Started
**Priority**: P0 - Blocking

**Deliverables**:
- [ ] Create `POST /api/v1/retrieval/search` endpoint
- [ ] Accept requirements JSON as input
- [ ] Orchestrate BM25 + Semantic + Fusion pipeline
- [ ] Add explainability to results
- [ ] Return top-3 patterns with scores and explanations
- [ ] Add LangSmith tracing for observability
- [ ] Handle errors gracefully
- [ ] Add request validation with Pydantic

**Files**:
```
backend/src/api/v1/routes/retrieval.py
backend/src/services/retrieval_service.py
```

**API Specification**:
```python
# POST /api/v1/retrieval/search

# Request
{
  "requirements": {
    "component_type": "Button",
    "props": ["variant", "size", "disabled"],
    "variants": ["primary", "secondary", "ghost"],
    "a11y": ["aria-label", "keyboard navigation"]
  }
}

# Response
{
  "patterns": [
    {
      "pattern_id": "shadcn-button",
      "name": "Button",
      "category": "form",
      "library": "shadcn/ui",
      "confidence": 0.92,
      "explanation": "Matches 'button' type with 'variant' and 'size' props...",
      "match_highlights": {
        "matched_props": ["variant", "size", "disabled"],
        "matched_variants": ["primary", "secondary", "ghost"]
      },
      "code_preview": "import * as React from \"react\"...",
      "metadata": { /* full metadata */ },
      "ranking_details": {
        "bm25_score": 0.95,
        "semantic_score": 0.89,
        "final_score": 0.915,
        "final_rank": 1
      }
    }
  ],
  "retrieval_metadata": {
    "latency_ms": 850,
    "methods_used": ["bm25", "semantic"],
    "weights": {"bm25": 0.3, "semantic": 0.7},
    "total_patterns_searched": 10,
    "query": "Button component with variant, size, disabled props"
  }
}
```

**Implementation Skeleton**:
```python
# backend/src/api/v1/routes/retrieval.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from langsmith import traceable

router = APIRouter(prefix="/retrieval", tags=["retrieval"])

class RetrievalRequest(BaseModel):
    requirements: Dict

class RetrievalResponse(BaseModel):
    patterns: List[Dict]
    retrieval_metadata: Dict

@router.post("/search", response_model=RetrievalResponse)
@traceable(name="retrieval_search")
async def search_patterns(
    request: RetrievalRequest,
    retrieval_service = Depends(get_retrieval_service)
):
    """Search for matching patterns based on requirements."""
    try:
        results = await retrieval_service.search(request.requirements)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Acceptance Criteria**:
- ✅ Endpoint accepts requirements JSON
- ✅ Returns top-3 patterns with explanations
- ✅ Latency p50 ≤1s (without cross-encoder)
- ✅ LangSmith traces show full pipeline
- ✅ Error handling with proper HTTP status codes
- ✅ Request validation with Pydantic

---

### B8: Query Construction Service ⚠️ NEW
**Owner**: Backend/AI Team
**Status**: ❌ Not Started
**Priority**: P0 - BLOCKING

**Why Critical**: Requirements JSON from Epic 2 needs transformation into retrieval queries for both BM25 (keywords) and semantic search (natural language).

**Deliverables**:
- [ ] Transform Epic 2 requirements.json into retrieval queries
- [ ] Extract component type, props, variants, a11y features
- [ ] Create keyword query for BM25 (weighted terms)
- [ ] Create natural language query for semantic search
- [ ] Handle edge cases (missing fields, incomplete requirements)
- [ ] Support query enhancement (synonyms, expansions)

**Files**:
```
backend/src/retrieval/query_builder.py
backend/src/services/requirement_parser.py
```

**Implementation Skeleton**:
```python
# backend/src/retrieval/query_builder.py
from typing import Dict

class QueryBuilder:
    def build_from_requirements(self, requirements: Dict) -> Dict:
        """Transform requirements.json into retrieval queries."""
        return {
            "bm25_query": self._build_bm25_query(requirements),
            "semantic_query": self._build_semantic_query(requirements),
            "filters": self._build_filters(requirements)
        }

    def _build_bm25_query(self, req: Dict) -> str:
        """Build keyword query for BM25.

        Example: "button variant size primary secondary ghost disabled"
        """
        parts = []

        # Component type (highest weight)
        if "component_type" in req:
            parts.extend([req["component_type"]] * 3)

        # Props (medium weight)
        if "props" in req:
            parts.extend(req["props"])

        # Variants (medium weight)
        if "variants" in req:
            parts.extend(req["variants"])

        # States
        if "states" in req:
            parts.extend(req["states"])

        return " ".join(parts)

    def _build_semantic_query(self, req: Dict) -> str:
        """Build natural language query for semantic search.

        Example: "A Button component with variant and size props,
                  supporting primary, secondary, and ghost variants..."
        """
        component_type = req.get("component_type", "component")
        props = req.get("props", [])
        variants = req.get("variants", [])
        a11y = req.get("a11y", [])

        query_parts = [f"A {component_type} component"]

        if props:
            props_text = ", ".join(props[:-1]) + f" and {props[-1]}" if len(props) > 1 else props[0]
            query_parts.append(f"with {props_text} props")

        if variants:
            variants_text = ", ".join(variants)
            query_parts.append(f"supporting {variants_text} variants")

        if a11y:
            a11y_text = ", ".join(a11y)
            query_parts.append(f"with accessibility features: {a11y_text}")

        return ", ".join(query_parts) + "."

    def _build_filters(self, req: Dict) -> Dict:
        """Build Qdrant filters if needed."""
        filters = {}

        if "component_type" in req:
            filters["type"] = req["component_type"].lower()

        return filters
```

**Example Transformation**:
```python
# Input: requirements.json from Epic 2
requirements = {
    "component_type": "Button",
    "props": ["variant", "size", "disabled"],
    "variants": ["primary", "secondary", "ghost"],
    "a11y": ["aria-label", "keyboard navigation"]
}

# Output: Retrieval queries
queries = query_builder.build_from_requirements(requirements)

# queries = {
#     "bm25_query": "button button button variant size disabled primary secondary ghost",
#     "semantic_query": "A Button component with variant, size and disabled props, supporting primary, secondary, ghost variants, with accessibility features: aria-label, keyboard navigation.",
#     "filters": {"type": "button"}
# }
```

**Acceptance Criteria**:
- ✅ Transforms requirements JSON correctly
- ✅ BM25 query has proper term weighting
- ✅ Semantic query is natural language
- ✅ Handles missing/incomplete requirements gracefully
- ✅ Filters work with Qdrant search

---

## 🎨 FRONTEND TASKS

### F1: Pattern Selection Page UI
**Owner**: Frontend Team
**Status**: ❌ Not Started
**Priority**: P0 - Blocking

**Deliverables**:
- [ ] Build Pattern Selection page (`app/src/app/patterns/page.tsx`)
- [ ] **Search Analysis Summary** banner component:
  - Query construction display
  - Retrieval methods indicator (BM25 + Semantic badges)
  - Total patterns searched count
  - Latency display (target: ≤1s)
- [ ] **Pattern Cards** component (top-3 results):
  - Pattern numbering (1️⃣, 2️⃣, 3️⃣)
  - Pattern name and source (shadcn/ui)
  - Confidence score badge (color-coded)
  - **SELECTED badge** for chosen pattern
  - Score visualization bar (horizontal progress bar)
  - Ranking explanation text
  - Match highlights (matched props, variants)
  - Code preview snippet
  - Visual preview thumbnail (if available)
- [ ] **Retrieval Details** expandable accordion:
  - BM25 score + rank (weight: 0.3)
  - Semantic score + rank (weight: 0.7)
  - Final weighted score
  - Match reason explanation
  - Method badges (BM25, Semantic)
- [ ] **Pattern Library Info** sidebar:
  - Total patterns available (10)
  - Supported component types
  - Quality metrics (MRR, Hit@3)
- [ ] **Action buttons**:
  - "Select Pattern" (primary)
  - "Preview Code" (secondary)
  - "Compare Patterns" (secondary)
  - "Continue to Generation →" (primary)

**Files**:
```
app/src/app/patterns/page.tsx
app/src/components/patterns/PatternCard.tsx
app/src/components/patterns/PatternList.tsx
app/src/components/patterns/SearchSummary.tsx
app/src/components/patterns/RetrievalDetails.tsx
app/src/components/patterns/PatternLibraryInfo.tsx
app/src/components/patterns/ScoreVisualization.tsx
app/src/components/patterns/MatchHighlights.tsx
```

**Component Dependencies** (from BASE-COMPONENTS.md):
- Card (elevated, interactive variants)
- Badge (success, warning, info for confidence scores + SELECTED badge)
- Button (Select, Preview, Compare, Continue)
- Accordion/Collapsible (Retrieval Details)
- CodeBlock (code preview)
- Progress (score visualization bar)
- Alert (summary banner)

**Wireframe Reference**: `.claude/wireframes/pattern-selection-page.html`

**Acceptance Criteria**:
- ✅ Page matches wireframe design
- ✅ Displays top-3 patterns correctly
- ✅ Confidence scores color-coded (≥0.9 green, 0.7-0.9 yellow, <0.7 red)
- ✅ SELECTED badge appears on chosen pattern
- ✅ Score bars visualize confidence accurately
- ✅ Retrieval details accordion expands/collapses
- ✅ Match highlights show relevant props/variants
- ✅ Responsive design (mobile, tablet, desktop)

---

### F2: Pattern Comparison Modal
**Owner**: Frontend Team
**Status**: ❌ Not Started
**Priority**: P2 - Medium (Optional)

**Deliverables**:
- [ ] Build side-by-side pattern comparison modal
- [ ] Allow comparing 2-3 patterns at once
- [ ] Highlight differences:
  - Props differences
  - Variants differences
  - Code differences (syntax highlighted)
  - Confidence score comparison
- [ ] Show pros/cons of each pattern
- [ ] Allow selecting pattern from comparison view

**Files**:
```
app/src/components/patterns/ComparisonModal.tsx
app/src/components/patterns/ComparisonTable.tsx
```

**Component Dependencies**:
- Modal/Dialog
- Tabs (for different comparison views)
- CodeBlock (side-by-side code)
- Badge (highlight differences)
- Button (Select, Close)

**Acceptance Criteria**:
- ✅ Shows up to 3 patterns side-by-side
- ✅ Highlights differences clearly
- ✅ Code comparison is readable
- ✅ Can select pattern from modal

---

### F3: Pattern Code Preview Modal
**Owner**: Frontend Team
**Status**: ❌ Not Started
**Priority**: P1 - High

**Deliverables**:
- [ ] Full code preview modal
- [ ] Syntax highlighted code display
- [ ] Copy to clipboard functionality
- [ ] Show pattern metadata:
  - Props table
  - Variants list
  - Accessibility features
  - Usage examples
- [ ] Tabs for different views:
  - Code (TypeScript)
  - Metadata
  - Examples

**Files**:
```
app/src/components/patterns/CodePreviewModal.tsx
app/src/components/patterns/CodeViewer.tsx
app/src/components/patterns/MetadataPanel.tsx
```

**Component Dependencies**:
- Modal/Dialog
- CodeBlock with syntax highlighting
- Button (Copy, Select, Close)
- Tabs (Code, Metadata, Examples)
- Badge (for props, variants)

**Acceptance Criteria**:
- ✅ Code is syntax highlighted (TypeScript/TSX)
- ✅ Copy button works correctly
- ✅ Metadata displayed in readable format
- ✅ Usage examples are clear
- ✅ Tab switching works smoothly

---

### F4: Loading & Error States
**Owner**: Frontend Team
**Status**: ❌ Not Started
**Priority**: P1 - High

**Deliverables**:
- [ ] Skeleton loaders for pattern cards
- [ ] Error state UI for retrieval failures
- [ ] Empty state (no patterns found)
- [ ] Retry mechanism for failed searches
- [ ] Loading indicators during search
- [ ] Timeout handling (if search takes >5s)

**Files**:
```
app/src/components/patterns/PatternSkeleton.tsx
app/src/components/patterns/ErrorState.tsx
app/src/components/patterns/EmptyState.tsx
app/src/components/patterns/LoadingIndicator.tsx
```

**Component Dependencies**:
- Skeleton (from BASE-COMPONENTS.md)
- Alert (error messages)
- Button (retry action)
- Spinner (loading indicator)

**States to Handle**:
```typescript
type PatternState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success', patterns: Pattern[] }
  | { status: 'error', error: Error }
  | { status: 'empty' }
```

**Acceptance Criteria**:
- ✅ Skeleton matches pattern card structure
- ✅ Error messages are helpful and actionable
- ✅ Empty state suggests next steps
- ✅ Retry button works correctly
- ✅ Loading states are smooth (no jank)

---

### F5: Pattern Selection State Management ⚠️ NEW
**Owner**: Frontend Team
**Status**: ❌ Not Started
**Priority**: P0 - BLOCKING

**Why Critical**: Wireframe shows selected pattern tracking and comparison selection, but state management wasn't explicitly tasked.

**Deliverables**:
- [ ] Create Zustand store for pattern selection
- [ ] Track selected pattern (only 1 can be selected at a time)
- [ ] Track comparison selections (up to 3 patterns)
- [ ] Persist selection across navigation (to Epic 4)
- [ ] Clear selection when needed
- [ ] Sync selection with URL query params

**Files**:
```
app/src/store/patternSelectionStore.ts
app/src/hooks/usePatternSelection.ts
```

**Implementation Skeleton**:
```typescript
// app/src/store/patternSelectionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Pattern {
  pattern_id: string;
  name: string;
  confidence: number;
  // ... other fields
}

interface PatternSelectionStore {
  // State
  selectedPattern: Pattern | null;
  comparisonPatterns: Pattern[];

  // Actions
  selectPattern: (pattern: Pattern) => void;
  addToComparison: (pattern: Pattern) => void;
  removeFromComparison: (patternId: string) => void;
  clearSelection: () => void;
  clearComparison: () => void;
}

export const usePatternSelection = create<PatternSelectionStore>()(
  persist(
    (set) => ({
      selectedPattern: null,
      comparisonPatterns: [],

      selectPattern: (pattern) => set({ selectedPattern: pattern }),

      addToComparison: (pattern) => set((state) => {
        // Max 3 patterns for comparison
        if (state.comparisonPatterns.length >= 3) {
          return state;
        }
        // Don't add duplicates
        if (state.comparisonPatterns.some(p => p.pattern_id === pattern.pattern_id)) {
          return state;
        }
        return {
          comparisonPatterns: [...state.comparisonPatterns, pattern]
        };
      }),

      removeFromComparison: (patternId) => set((state) => ({
        comparisonPatterns: state.comparisonPatterns.filter(
          p => p.pattern_id !== patternId
        )
      })),

      clearSelection: () => set({ selectedPattern: null }),
      clearComparison: () => set({ comparisonPatterns: [] }),
    }),
    {
      name: 'pattern-selection-storage',
      partialize: (state) => ({
        selectedPattern: state.selectedPattern
      })
    }
  )
);
```

**Usage Example**:
```typescript
// In PatternCard.tsx
const { selectedPattern, selectPattern } = usePatternSelection();

const handleSelect = () => {
  selectPattern(pattern);
};

const isSelected = selectedPattern?.pattern_id === pattern.pattern_id;
```

**Acceptance Criteria**:
- ✅ Only 1 pattern can be selected at a time
- ✅ Up to 3 patterns can be added to comparison
- ✅ Selection persists across page refreshes
- ✅ Selected pattern available for Epic 4
- ✅ Comparison patterns tracked correctly
- ✅ No duplicate patterns in comparison

---

## 🔌 INTEGRATION TASKS

### I1: Frontend-Backend API Integration
**Owner**: Full-stack Team
**Status**: ❌ Not Started
**Priority**: P0 - Blocking

**Deliverables**:
- [ ] Create API client for retrieval endpoint
- [ ] Implement TanStack Query hooks for data fetching
- [ ] Handle loading, success, error states
- [ ] Cache retrieval results (client-side, 5 min)
- [ ] Type-safe request/response interfaces
- [ ] Error handling with user-friendly messages

**Files**:
```
app/src/lib/api/retrieval.ts
app/src/hooks/usePatternRetrieval.ts
app/src/types/retrieval.ts
```

**Implementation Skeleton**:
```typescript
// app/src/lib/api/retrieval.ts
import { apiClient } from './client';

export interface RetrievalRequest {
  requirements: {
    component_type: string;
    props: string[];
    variants: string[];
    a11y: string[];
  };
}

export interface RetrievalResponse {
  patterns: Pattern[];
  retrieval_metadata: {
    latency_ms: number;
    methods_used: string[];
    total_patterns_searched: number;
  };
}

export const retrievalApi = {
  async search(request: RetrievalRequest): Promise<RetrievalResponse> {
    const response = await apiClient.post('/api/v1/retrieval/search', request);
    return response.data;
  }
};
```

```typescript
// app/src/hooks/usePatternRetrieval.ts
import { useQuery } from '@tanstack/react-query';
import { retrievalApi, RetrievalRequest } from '@/lib/api/retrieval';

export function usePatternRetrieval(requirements: RetrievalRequest['requirements']) {
  return useQuery({
    queryKey: ['patterns', requirements],
    queryFn: () => retrievalApi.search({ requirements }),
    staleTime: 5 * 60 * 1000, // 5 min cache
    gcTime: 10 * 60 * 1000, // 10 min garbage collection
    enabled: !!requirements.component_type, // Only run if we have requirements
  });
}
```

**Usage in Component**:
```typescript
// In PatternSelectionPage
const requirements = useRequirements(); // from Epic 2
const { data, isLoading, error, refetch } = usePatternRetrieval(requirements);

if (isLoading) return <PatternSkeleton />;
if (error) return <ErrorState onRetry={refetch} />;
if (!data?.patterns.length) return <EmptyState />;

return <PatternList patterns={data.patterns} />;
```

**Acceptance Criteria**:
- ✅ API client is type-safe (TypeScript)
- ✅ TanStack Query caching works correctly
- ✅ Loading states handled gracefully
- ✅ Error messages are user-friendly
- ✅ Retry mechanism works
- ✅ Request/response types match API spec

---

### I2: Epic 2 → Epic 3 Data Flow
**Owner**: Full-stack Team
**Status**: ❌ Not Started
**Priority**: P0 - Blocking

**Deliverables**:
- [ ] Accept `requirements.json` from Epic 2
- [ ] Transform requirements into retrieval query (use B8)
- [ ] Pass query to retrieval API (use I1)
- [ ] Handle navigation from Requirements page to Patterns page
- [ ] Pass data via sessionStorage or Zustand store
- [ ] Validate requirements before retrieval

**Files**:
```
app/src/lib/transforms/requirementsToQuery.ts
app/src/store/requirementsStore.ts
app/src/app/patterns/page.tsx (receive requirements)
```

**Data Flow**:
```
Epic 2 (Requirements Review)
  ↓
  User clicks "Continue to Pattern Matching"
  ↓
  requirements.json stored in Zustand/sessionStorage
  ↓
  Navigate to /patterns
  ↓
  Pattern page reads requirements
  ↓
  Transform to retrieval query (B8 logic on frontend)
  ↓
  POST /api/v1/retrieval/search
  ↓
  Display top-3 patterns
```

**Implementation Skeleton**:
```typescript
// app/src/lib/transforms/requirementsToQuery.ts
export function transformRequirementsToQuery(requirements: Requirements) {
  return {
    component_type: requirements.type,
    props: requirements.props.map(p => p.name),
    variants: requirements.variants,
    a11y: requirements.accessibility_features
  };
}
```

```typescript
// app/src/app/patterns/page.tsx
export default function PatternSelectionPage() {
  const searchParams = useSearchParams();

  // Get requirements from previous step
  const requirements = useMemo(() => {
    const stored = sessionStorage.getItem('requirements');
    return stored ? JSON.parse(stored) : null;
  }, []);

  // Transform and fetch patterns
  const query = requirements ? transformRequirementsToQuery(requirements) : null;
  const { data, isLoading, error } = usePatternRetrieval(query);

  // ... rest of component
}
```

**Acceptance Criteria**:
- ✅ Requirements passed from Epic 2 to Epic 3
- ✅ Transformation works correctly
- ✅ Navigation maintains data
- ✅ Validation catches invalid requirements
- ✅ Error handling for missing requirements

---

### I3: Epic 3 → Epic 4 Data Flow
**Owner**: Full-stack Team
**Status**: ❌ Not Started
**Priority**: P0 - Blocking

**Deliverables**:
- [ ] Pass selected pattern to Epic 4 (Generation)
- [ ] Include pattern code, metadata, requirements
- [ ] Maintain context through navigation
- [ ] Handle pattern re-selection if needed
- [ ] Store in Zustand for persistence

**Files**:
```
app/src/store/generationStore.ts
app/src/lib/transforms/patternToGenerationInput.ts
app/src/app/generation/page.tsx (receive pattern)
```

**Data Flow**:
```
Epic 3 (Pattern Selection)
  ↓
  User selects pattern (stored in Zustand - F5)
  ↓
  User clicks "Continue to Generation"
  ↓
  Selected pattern + original requirements
  ↓
  Navigate to /generation
  ↓
  Generation page reads pattern + requirements
  ↓
  Start code generation (Epic 4)
```

**Implementation Skeleton**:
```typescript
// app/src/lib/transforms/patternToGenerationInput.ts
export function prepareGenerationInput(
  pattern: Pattern,
  requirements: Requirements
) {
  return {
    pattern: {
      id: pattern.pattern_id,
      name: pattern.name,
      code: pattern.code_preview,
      metadata: pattern.metadata
    },
    requirements: {
      component_type: requirements.type,
      props: requirements.props,
      variants: requirements.variants,
      a11y: requirements.accessibility_features
    },
    context: {
      confidence: pattern.confidence,
      match_highlights: pattern.match_highlights
    }
  };
}
```

```typescript
// In pattern selection page, navigation handler
const { selectedPattern } = usePatternSelection();
const router = useRouter();

const handleContinue = () => {
  if (!selectedPattern) {
    toast.error('Please select a pattern first');
    return;
  }

  const generationInput = prepareGenerationInput(selectedPattern, requirements);
  sessionStorage.setItem('generationInput', JSON.stringify(generationInput));

  router.push('/generation');
};
```

**Acceptance Criteria**:
- ✅ Selected pattern passed to Epic 4
- ✅ All necessary data included (code, metadata, requirements)
- ✅ Navigation preserves context
- ✅ User can go back and re-select pattern
- ✅ Data available in Epic 4 generation page

---

### I4: Navigation & Routing ⚠️ NEW
**Owner**: Frontend Team
**Status**: ❌ Not Started
**Priority**: P1 - HIGH

**Why Important**: Wireframe shows navigation flow (Epic 2 → Epic 3 → Epic 4) but wasn't explicitly tasked.

**Deliverables**:
- [ ] Create route: `/patterns` (pattern selection page)
- [ ] Navigation from Epic 2: `/requirements` → `/patterns`
- [ ] Navigation to Epic 4: `/patterns` → `/generation`
- [ ] URL query params for state (optional)
- [ ] Handle browser back/forward correctly
- [ ] Breadcrumb navigation
- [ ] Protected routes (require previous step completion)

**Files**:
```
app/src/app/patterns/page.tsx (route)
app/src/lib/navigation/useEpicNavigation.ts (hook)
app/src/components/navigation/Breadcrumbs.tsx
app/src/middleware.ts (route protection)
```

**Implementation Skeleton**:
```typescript
// app/src/lib/navigation/useEpicNavigation.ts
import { useRouter, useSearchParams } from 'next/navigation';

export function useEpicNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToPatterns = (requirements: Requirements) => {
    // Store requirements
    sessionStorage.setItem('requirements', JSON.stringify(requirements));
    router.push('/patterns');
  };

  const navigateToGeneration = (pattern: Pattern) => {
    // Store selected pattern
    sessionStorage.setItem('selectedPattern', JSON.stringify(pattern));
    router.push('/generation');
  };

  const navigateBack = () => {
    router.back();
  };

  return {
    navigateToPatterns,
    navigateToGeneration,
    navigateBack
  };
}
```

**Breadcrumb Navigation**:
```typescript
// app/src/components/navigation/Breadcrumbs.tsx
export function Breadcrumbs() {
  const pathname = usePathname();

  const steps = [
    { path: '/tokens', label: 'Token Extraction', icon: '🎨' },
    { path: '/requirements', label: 'Requirements Review', icon: '📋' },
    { path: '/patterns', label: 'Pattern Selection', icon: '🔍' },
    { path: '/generation', label: 'Code Generation', icon: '⚡' },
    { path: '/preview', label: 'Component Preview', icon: '👁️' }
  ];

  const currentIndex = steps.findIndex(s => s.path === pathname);

  return (
    <nav className="flex items-center gap-2 text-sm">
      {steps.map((step, index) => (
        <div key={step.path} className="flex items-center gap-2">
          <Link
            href={step.path}
            className={cn(
              'flex items-center gap-1',
              index > currentIndex && 'pointer-events-none opacity-50',
              index === currentIndex && 'font-bold'
            )}
          >
            <span>{step.icon}</span>
            <span>{step.label}</span>
          </Link>
          {index < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
        </div>
      ))}
    </nav>
  );
}
```

**Route Protection**:
```typescript
// app/src/middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /patterns - requires requirements
  if (pathname === '/patterns') {
    const requirements = request.cookies.get('requirements')?.value;
    if (!requirements) {
      return NextResponse.redirect(new URL('/requirements', request.url));
    }
  }

  // Protect /generation - requires selected pattern
  if (pathname === '/generation') {
    const pattern = request.cookies.get('selectedPattern')?.value;
    if (!pattern) {
      return NextResponse.redirect(new URL('/patterns', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/patterns', '/generation', '/preview']
};
```

**Acceptance Criteria**:
- ✅ Routes work correctly (`/patterns`)
- ✅ Navigation preserves data
- ✅ Browser back/forward work
- ✅ Breadcrumbs show current step
- ✅ Route protection prevents skipping steps
- ✅ URL state management (optional)

---

## 🧪 TESTING TASKS

### T1: Evaluation Dataset Creation
**Owner**: AI/ML Team
**Status**: ❌ Not Started
**Priority**: P0 - Blocking
**Original Epic Task**: Task 9

**Deliverables**:
- [ ] Create 20+ labeled queries with ground truth
- [ ] Mix of component types:
  - Button (5 queries)
  - Card (4 queries)
  - Input (3 queries)
  - Select (2 queries)
  - Badge (2 queries)
  - Alert (2 queries)
  - Other components (2 queries)
- [ ] Include edge cases:
  - Ambiguous requirements
  - Complex multi-variant queries
  - Missing prop requirements
  - Accessibility-focused queries
- [ ] Store in `backend/data/eval/retrieval_queries.json`

**Files**:
```
backend/data/eval/retrieval_queries.json
backend/data/eval/README.md (documentation)
```

**Example Query Format**:
```json
{
  "query_id": "q001",
  "query_text": "Button component with primary, secondary, and ghost variants",
  "requirements": {
    "component_type": "Button",
    "props": ["variant", "size"],
    "variants": ["primary", "secondary", "ghost"]
  },
  "ground_truth": ["shadcn-button"],
  "difficulty": "easy",
  "tags": ["button", "variants", "basic"]
}
```

**Edge Case Examples**:
```json
{
  "query_id": "q015",
  "query_text": "Interactive card with hover effects and clickable sections",
  "requirements": {
    "component_type": "Card",
    "props": ["onClick", "hover"],
    "variants": ["interactive", "elevated"]
  },
  "ground_truth": ["shadcn-card"],
  "difficulty": "medium",
  "tags": ["card", "interactive", "ambiguous"]
}
```

**Acceptance Criteria**:
- ✅ 20+ queries created
- ✅ Mix of difficulties (easy, medium, hard)
- ✅ All component types covered
- ✅ Edge cases included
- ✅ Ground truth validated

---

### T2: Retrieval Metrics Implementation
**Owner**: AI/ML Team
**Status**: ❌ Not Started
**Priority**: P0 - Blocking
**Original Epic Task**: Task 9

**Deliverables**:
- [ ] Implement MRR (Mean Reciprocal Rank)
- [ ] Implement Hit@3 (correct pattern in top-3)
- [ ] Implement Precision@3
- [ ] Implement NDCG (optional)
- [ ] Create evaluation script
- [ ] Run evaluation on test set
- [ ] Achieve targets:
  - MRR ≥0.75 (relaxed from 0.83)
  - Hit@3 ≥0.85 (relaxed from 0.91)
- [ ] Generate evaluation report

**Files**:
```
backend/tests/evaluation/test_retrieval_metrics.py
backend/scripts/evaluate_retrieval.py
backend/tests/evaluation/metrics.py
```

**Implementation Skeleton**:
```python
# backend/tests/evaluation/metrics.py
from typing import List, Dict

def calculate_mrr(results: List[str], ground_truth: List[str]) -> float:
    """Calculate Mean Reciprocal Rank.

    Args:
        results: Ordered list of pattern IDs returned by retrieval
        ground_truth: List of correct pattern IDs

    Returns:
        MRR score between 0 and 1
    """
    for rank, pattern_id in enumerate(results, start=1):
        if pattern_id in ground_truth:
            return 1.0 / rank
    return 0.0

def calculate_hit_at_k(results: List[str], ground_truth: List[str], k: int = 3) -> bool:
    """Calculate Hit@K.

    Args:
        results: Ordered list of pattern IDs
        ground_truth: List of correct pattern IDs
        k: Top-K threshold

    Returns:
        True if correct pattern in top-K, False otherwise
    """
    top_k = results[:k]
    return any(pattern_id in ground_truth for pattern_id in top_k)

def calculate_precision_at_k(results: List[str], ground_truth: List[str], k: int = 3) -> float:
    """Calculate Precision@K.

    Args:
        results: Ordered list of pattern IDs
        ground_truth: List of correct pattern IDs
        k: Top-K threshold

    Returns:
        Precision score between 0 and 1
    """
    top_k = results[:k]
    relevant = sum(1 for pid in top_k if pid in ground_truth)
    return relevant / k if k > 0 else 0.0
```

**Evaluation Script**:
```python
# backend/scripts/evaluate_retrieval.py
import json
from pathlib import Path
from backend.src.retrieval.bm25_retriever import BM25Retriever
from backend.src.retrieval.semantic_retriever import SemanticRetriever
from backend.src.retrieval.weighted_fusion import WeightedFusion
from backend.tests.evaluation.metrics import (
    calculate_mrr, calculate_hit_at_k, calculate_precision_at_k
)

def evaluate():
    # Load test queries
    queries_path = Path("backend/data/eval/retrieval_queries.json")
    with open(queries_path) as f:
        test_queries = json.load(f)

    # Load patterns
    patterns = load_patterns()  # from data/patterns/

    # Initialize retrievers
    bm25 = BM25Retriever(patterns)
    semantic = SemanticRetriever(...)
    fusion = WeightedFusion()

    # Run evaluation
    results = {
        "mrr_scores": [],
        "hit_at_3": [],
        "precision_at_3": []
    }

    for query in test_queries:
        # Run retrieval
        bm25_results = bm25.search(query["query_text"])
        semantic_results = await semantic.search(query["query_text"])
        final_results = fusion.fuse(bm25_results, semantic_results, top_k=3)

        # Extract pattern IDs
        retrieved_ids = [p["id"] for p, _ in final_results]

        # Calculate metrics
        mrr = calculate_mrr(retrieved_ids, query["ground_truth"])
        hit = calculate_hit_at_k(retrieved_ids, query["ground_truth"], k=3)
        precision = calculate_precision_at_k(retrieved_ids, query["ground_truth"], k=3)

        results["mrr_scores"].append(mrr)
        results["hit_at_3"].append(1 if hit else 0)
        results["precision_at_3"].append(precision)

    # Aggregate results
    avg_mrr = sum(results["mrr_scores"]) / len(results["mrr_scores"])
    avg_hit_at_3 = sum(results["hit_at_3"]) / len(results["hit_at_3"])
    avg_precision = sum(results["precision_at_3"]) / len(results["precision_at_3"])

    print(f"MRR: {avg_mrr:.3f} (target: ≥0.75)")
    print(f"Hit@3: {avg_hit_at_3:.3f} (target: ≥0.85)")
    print(f"Precision@3: {avg_precision:.3f}")

    # Save report
    with open("backend/data/eval/evaluation_report.json", "w") as f:
        json.dump({
            "avg_mrr": avg_mrr,
            "avg_hit_at_3": avg_hit_at_3,
            "avg_precision_at_3": avg_precision,
            "detailed_results": results,
            "targets_met": {
                "mrr": avg_mrr >= 0.75,
                "hit_at_3": avg_hit_at_3 >= 0.85
            }
        }, f, indent=2)

if __name__ == "__main__":
    evaluate()
```

**Acceptance Criteria**:
- ✅ Metrics implemented correctly
- ✅ MRR ≥0.75 on test set
- ✅ Hit@3 ≥0.85 on test set
- ✅ Evaluation report generated
- ✅ Results reproducible

---

### T3: Backend Unit Tests
**Owner**: Backend Team
**Status**: ❌ Not Started
**Priority**: P1 - High

**Deliverables**:
- [ ] Test BM25 retriever (keyword matching)
- [ ] Test semantic retriever (vector search)
- [ ] Test weighted fusion (score combination)
- [ ] Test query builder (requirements transformation)
- [ ] Test explainer (confidence scoring)
- [ ] Test API endpoint (request/response)
- [ ] Achieve ≥80% code coverage

**Files**:
```
backend/tests/test_bm25_retriever.py
backend/tests/test_semantic_retriever.py
backend/tests/test_weighted_fusion.py
backend/tests/test_query_builder.py
backend/tests/test_explainer.py
backend/tests/test_retrieval_api.py
```

**Example Test**:
```python
# backend/tests/test_bm25_retriever.py
import pytest
from backend.src.retrieval.bm25_retriever import BM25Retriever

@pytest.fixture
def sample_patterns():
    return [
        {
            "id": "shadcn-button",
            "name": "Button",
            "category": "form",
            "description": "Accessible button with variants",
            "metadata": {
                "props": [{"name": "variant"}, {"name": "size"}]
            }
        },
        {
            "id": "shadcn-card",
            "name": "Card",
            "category": "layout",
            "description": "Card container component",
            "metadata": {
                "props": [{"name": "padding"}, {"name": "shadow"}]
            }
        }
    ]

def test_bm25_retriever_basic_search(sample_patterns):
    retriever = BM25Retriever(sample_patterns)
    results = retriever.search("button variant", top_k=5)

    assert len(results) > 0
    assert results[0][0]["id"] == "shadcn-button"  # Button should rank first
    assert results[0][1] > 0  # Should have positive score

def test_bm25_retriever_no_results(sample_patterns):
    retriever = BM25Retriever(sample_patterns)
    results = retriever.search("nonexistent component", top_k=5)

    assert len(results) == len(sample_patterns)  # Returns all, sorted by score
    assert all(score >= 0 for _, score in results)

def test_bm25_field_weighting(sample_patterns):
    retriever = BM25Retriever(sample_patterns)

    # Name should have higher weight than description
    results_name = retriever.search("button", top_k=1)
    results_desc = retriever.search("accessible", top_k=1)

    assert results_name[0][1] > results_desc[0][1]
```

**Acceptance Criteria**:
- ✅ All retrievers tested
- ✅ Edge cases covered
- ✅ Mocking external dependencies (OpenAI, Qdrant)
- ✅ Tests run fast (<5s total)
- ✅ Code coverage ≥80%

---

### T4: Frontend Component Tests
**Owner**: Frontend Team
**Status**: ❌ Not Started
**Priority**: P1 - High

**Deliverables**:
- [ ] Test PatternCard rendering
- [ ] Test pattern selection interaction
- [ ] Test code preview modal
- [ ] Test comparison modal
- [ ] Test error/loading states
- [ ] Accessibility tests with axe-core
- [ ] Achieve ≥80% component coverage

**Files**:
```
app/src/components/patterns/__tests__/PatternCard.test.tsx
app/src/components/patterns/__tests__/PatternList.test.tsx
app/src/components/patterns/__tests__/CodePreviewModal.test.tsx
app/src/components/patterns/__tests__/ComparisonModal.test.tsx
app/src/components/patterns/__tests__/ErrorState.test.tsx
```

**Example Test**:
```typescript
// app/src/components/patterns/__tests__/PatternCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PatternCard } from '../PatternCard';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

const mockPattern = {
  pattern_id: 'shadcn-button',
  name: 'Button',
  confidence: 0.92,
  explanation: 'Matches button type with variant prop',
  code_preview: 'export const Button = ...',
  metadata: { /* ... */ }
};

describe('PatternCard', () => {
  it('renders pattern information correctly', () => {
    render(<PatternCard pattern={mockPattern} />);

    expect(screen.getByText('Button')).toBeInTheDocument();
    expect(screen.getByText('0.92')).toBeInTheDocument();
    expect(screen.getByText(/Matches button type/)).toBeInTheDocument();
  });

  it('calls onSelect when Select button clicked', () => {
    const handleSelect = jest.fn();
    render(<PatternCard pattern={mockPattern} onSelect={handleSelect} />);

    const selectButton = screen.getByRole('button', { name: /select pattern/i });
    fireEvent.click(selectButton);

    expect(handleSelect).toHaveBeenCalledWith(mockPattern);
  });

  it('shows selected state when selected', () => {
    render(<PatternCard pattern={mockPattern} isSelected={true} />);

    expect(screen.getByText('SELECTED')).toBeInTheDocument();
    expect(screen.getByTestId('pattern-card')).toHaveClass('selected-card');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PatternCard pattern={mockPattern} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
```

**Acceptance Criteria**:
- ✅ All components tested
- ✅ User interactions covered
- ✅ Accessibility tests pass
- ✅ Visual regression tests (optional)
- ✅ Component coverage ≥80%

---

### T5: Integration Tests
**Owner**: Full-stack Team
**Status**: ❌ Not Started
**Priority**: P1 - High

**Deliverables**:
- [ ] Test Epic 2 → Epic 3 flow (requirements to patterns)
- [ ] Test Epic 3 → Epic 4 flow (pattern to generation)
- [ ] Test end-to-end retrieval pipeline
- [ ] Test data persistence (sessionStorage, Zustand)
- [ ] Test error recovery flows
- [ ] Test caching behavior

**Files**:
```
backend/tests/integration/test_retrieval_pipeline.py
app/src/__tests__/integration/pattern-flow.test.tsx
```

**Backend Integration Test**:
```python
# backend/tests/integration/test_retrieval_pipeline.py
import pytest
from fastapi.testclient import TestClient
from backend.src.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_retrieval_pipeline_e2e(client):
    """Test complete retrieval pipeline."""
    # 1. Seed patterns (setup)
    # ... (assumes patterns are seeded)

    # 2. Make retrieval request
    request_data = {
        "requirements": {
            "component_type": "Button",
            "props": ["variant", "size"],
            "variants": ["primary", "secondary", "ghost"]
        }
    }

    response = client.post("/api/v1/retrieval/search", json=request_data)

    # 3. Validate response
    assert response.status_code == 200
    data = response.json()

    assert "patterns" in data
    assert len(data["patterns"]) <= 3  # Top-3
    assert data["patterns"][0]["pattern_id"] == "shadcn-button"
    assert data["patterns"][0]["confidence"] >= 0.7

    assert "retrieval_metadata" in data
    assert data["retrieval_metadata"]["latency_ms"] < 1000  # <1s target
    assert "bm25" in data["retrieval_metadata"]["methods_used"]
    assert "semantic" in data["retrieval_metadata"]["methods_used"]
```

**Frontend Integration Test**:
```typescript
// app/src/__tests__/integration/pattern-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PatternSelectionPage } from '@/app/patterns/page';
import { server } from '@/mocks/server';
import { rest } from 'msw';

describe('Pattern Selection Flow', () => {
  it('completes Epic 2 → Epic 3 → Epic 4 flow', async () => {
    // 1. Mock requirements from Epic 2
    sessionStorage.setItem('requirements', JSON.stringify({
      component_type: 'Button',
      props: ['variant', 'size'],
      variants: ['primary', 'secondary']
    }));

    // 2. Mock API response
    server.use(
      rest.post('/api/v1/retrieval/search', (req, res, ctx) => {
        return res(ctx.json({
          patterns: [/* mock patterns */],
          retrieval_metadata: { latency_ms: 500 }
        }));
      })
    );

    // 3. Render pattern selection page
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <PatternSelectionPage />
      </QueryClientProvider>
    );

    // 4. Wait for patterns to load
    await waitFor(() => {
      expect(screen.getByText(/Button/)).toBeInTheDocument();
    });

    // 5. Select pattern
    const selectButton = screen.getByRole('button', { name: /select pattern/i });
    fireEvent.click(selectButton);

    // 6. Navigate to generation
    const continueButton = screen.getByRole('button', { name: /continue to generation/i });
    fireEvent.click(continueButton);

    // 7. Verify pattern stored for Epic 4
    const stored = sessionStorage.getItem('selectedPattern');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).pattern_id).toBe('shadcn-button');
  });
});
```

**Acceptance Criteria**:
- ✅ Epic 2 → 3 → 4 flow works end-to-end
- ✅ Data persistence works correctly
- ✅ Error recovery handled
- ✅ Caching behavior validated
- ✅ Integration tests run in CI/CD

---

### T6: E2E Tests (Playwright)
**Owner**: QA/Frontend Team
**Status**: ❌ Not Started
**Priority**: P2 - Medium (Optional)

**Deliverables**:
- [ ] Test complete pattern selection flow
- [ ] Test pattern comparison
- [ ] Test code preview and copy
- [ ] Test navigation (Epic 2 → 3 → 4)
- [ ] Test performance (latency ≤1s)
- [ ] Test error scenarios

**Files**:
```
app/tests/e2e/pattern-selection.spec.ts
app/tests/e2e/pattern-comparison.spec.ts
```

**Example E2E Test**:
```typescript
// app/tests/e2e/pattern-selection.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Pattern Selection', () => {
  test('complete pattern selection flow', async ({ page }) => {
    // 1. Start from requirements page
    await page.goto('/requirements');

    // 2. Complete requirements (Epic 2)
    await page.fill('input[name="component_type"]', 'Button');
    await page.click('button:has-text("Continue to Pattern Matching")');

    // 3. Verify pattern selection page
    await expect(page).toHaveURL('/patterns');
    await expect(page.locator('h1')).toContainText('Pattern Match Results');

    // 4. Wait for patterns to load
    await page.waitForSelector('[data-testid="pattern-card"]');

    // 5. Verify top-3 patterns displayed
    const patternCards = page.locator('[data-testid="pattern-card"]');
    await expect(patternCards).toHaveCount(3);

    // 6. Select first pattern
    await patternCards.first().locator('button:has-text("Select")').click();

    // 7. Verify selected state
    await expect(patternCards.first()).toHaveClass(/selected/);
    await expect(page.locator('text=SELECTED')).toBeVisible();

    // 8. Preview code
    await patternCards.first().locator('button:has-text("Preview Code")').click();
    await expect(page.locator('[data-testid="code-preview-modal"]')).toBeVisible();

    // 9. Copy code
    await page.click('button:has-text("Copy")');
    await expect(page.locator('text=Copied')).toBeVisible();

    // 10. Close modal and continue
    await page.click('button[aria-label="Close"]');
    await page.click('button:has-text("Continue to Generation")');

    // 11. Verify navigation to Epic 4
    await expect(page).toHaveURL('/generation');
  });

  test('measures retrieval performance', async ({ page }) => {
    await page.goto('/patterns');

    // Measure time to first pattern
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="pattern-card"]');
    const endTime = Date.now();

    const latency = endTime - startTime;
    expect(latency).toBeLessThan(1000); // <1s target
  });
});
```

**Acceptance Criteria**:
- ✅ Complete flow tested end-to-end
- ✅ All user interactions covered
- ✅ Performance validated (<1s)
- ✅ Error scenarios tested
- ✅ Tests run in CI/CD

---

## 📋 Dependencies & Blockers

### Epic Dependencies
- **Requires**: Epic 0 (Project Setup) - Docker, Qdrant, PostgreSQL
- **Requires**: Epic 2 (Requirements) - requirements.json as input
- **Blocks**: Epic 4 (Code Generation) - selected pattern needed

### External Dependencies
- **Python Packages**:
  - `rank-bm25` (BM25 retriever)
  - `qdrant-client` (vector store) ✅
  - `openai` (embeddings) ✅
  - `sentence-transformers` (optional, for cross-encoder)
- **Services**:
  - Qdrant running on port 6333
  - Redis for caching (optional)
  - PostgreSQL for metadata (optional)

### Data Dependencies
- 10 pattern JSON files (2/10 complete)
- Evaluation dataset (20+ queries)
- OpenAI API key for embeddings

---

## 📈 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **MRR** | ≥0.75 | Mean reciprocal rank on eval set |
| **Hit@3** | ≥0.85 | % queries with correct pattern in top-3 |
| **Precision@3** | ≥0.80 | Relevant patterns in top-3 |
| **Latency** | p50 ≤1s | LangSmith traces |
| **Code Coverage** | ≥80% | Backend + Frontend |

---

## 🚀 Getting Started

### For Backend Developers
1. Complete pattern library (B1)
2. Setup Qdrant and seed patterns (B2)
3. Implement BM25 retriever (B3)
4. Implement semantic retriever (B4)
5. Build weighted fusion (B5)

### For Frontend Developers
1. Build pattern selection page UI (F1)
2. Implement state management (F5)
3. Create API integration hooks (I1)
4. Add loading/error states (F4)
5. Build code preview modal (F3)

### For Full-Stack Developers
1. Setup navigation routing (I4)
2. Implement Epic 2 → 3 data flow (I2)
3. Implement Epic 3 → 4 data flow (I3)
4. Integration testing (T5)

---

## 📝 Notes

- **MVP Focus**: BM25 + Semantic with weighted fusion (deferred MMR, RRF, cross-encoder)
- **Post-MVP**: Diversity search, advanced fusion, ablation testing
- **Critical Path**: Pattern library → Qdrant setup → Retrievers → API → Frontend
- **Evaluation First**: Build eval dataset early to validate retrieval quality

---

**Last Updated**: 2025-10-05
**Document Status**: Complete ✅
**Total Tasks**: 23 (8 Backend, 5 Frontend, 4 Integration, 6 Testing)
