# Pattern Retrieval

Intelligent semantic search for matching component patterns using hybrid BM25 + vector search.

## Overview

The Pattern Retrieval system (Epic 3) finds the most relevant shadcn/ui component patterns based on user requirements. It combines **keyword matching (BM25)** with **semantic understanding (vector search)** to deliver highly accurate pattern recommendations.

**Key Features:**
- 🔍 **Hybrid Search** - BM25 (30%) + Vector Similarity (70%)
- 🎯 **High Accuracy** - Confidence scoring with explainable results
- ⚡ **Fast** - <1000ms latency target
- 📊 **Transparent** - Match highlights and ranking details
- 🤖 **AI-Powered** - OpenAI embeddings + Qdrant vector database

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Pattern Retrieval Pipeline                  │
└─────────────────────────────────────────────────────────────┘

Requirements (Epic 2)
       ↓
┌──────────────────┐
│  Query Builder   │  Transforms requirements → search queries
└─────┬────────────┘
      ↓
┌─────────────────────────────────────────┐
│         Parallel Search                 │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────┐  ┌───────────────┐ │
│  │ BM25 Retriever │  │   Semantic    │ │
│  │ (Keyword)      │  │  Retriever    │ │
│  │                │  │  (Vector)     │ │
│  └────────┬───────┘  └──────┬────────┘ │
│           │ Score: 0.3      │ Score: 0.7 │
│           └─────────┬───────┘          │
│                     ↓                  │
│           ┌──────────────────┐        │
│           │ Weighted Fusion  │        │
│           │  (0.3 + 0.7)     │        │
│           └─────────┬────────┘        │
└─────────────────────┼──────────────────┘
                      ↓
              ┌──────────────┐
              │  Explainer   │  Confidence + explanations
              └──────┬───────┘
                     ↓
              Top-3 Patterns
```

### Components

**1. QueryBuilder** (`query_builder.py`)
- Transforms Epic 2 requirements into search queries
- Extracts component type, props, variants, accessibility features

**2. BM25Retriever** (`bm25_retriever.py`)
- Keyword-based lexical search (TF-IDF with BM25 ranking)
- Weight: 30% (configurable)
- Fast exact matching for known terms

**3. SemanticRetriever** (`semantic_retriever.py`)
- Vector similarity search using OpenAI embeddings
- Model: `text-embedding-3-small` (1536 dimensions)
- Vector DB: Qdrant with cosine similarity
- Weight: 70% (configurable)
- Understands semantic meaning and context

**4. WeightedFusion** (`weighted_fusion.py`)
- Combines BM25 and semantic scores
- Normalizes scores to [0, 1] range
- Default: `0.3 * BM25 + 0.7 * Semantic`

**5. RetrievalExplainer** (`explainer.py`)
- Generates confidence scores (0-1)
- Creates human-readable explanations
- Identifies match highlights (props, variants, a11y features)
- Provides ranking transparency

## How It Works

### Step 1: Requirements Input

Requirements from Epic 2 are passed in:

```python
{
  "component_type": "Button",
  "props": ["variant", "size", "disabled"],
  "variants": ["primary", "secondary", "ghost"],
  "a11y": ["aria-label", "keyboard navigation"]
}
```

### Step 2: Query Generation

QueryBuilder extracts searchable text:
- Component type: "Button"
- Props: "variant, size, disabled"
- Variants: "primary, secondary, ghost"
- Accessibility: "aria-label, keyboard navigation"

Combined query: "Button with variant size disabled props supporting primary secondary ghost variants and aria-label keyboard navigation accessibility"

### Step 3: Parallel Search

**BM25 Search** (Keyword Matching):
- Searches pattern metadata for exact keyword matches
- Ranks by TF-IDF relevance
- Fast for explicit requirements

**Semantic Search** (Vector Similarity):
1. Generate query embedding using OpenAI API
2. Search Qdrant vector database
3. Find patterns with highest cosine similarity
4. Better for implicit/contextual matches

### Step 4: Score Fusion

```python
final_score = (0.3 × bm25_score) + (0.7 × semantic_score)
```

Why 30/70 split?
- Semantic search (70%) is better at understanding intent
- BM25 (30%) ensures exact keyword matches aren't missed
- Weights are configurable per deployment

### Step 5: Explanation Generation

For each top-3 pattern:

**Confidence Score Calculation:**
```python
confidence = final_score × boost_factors

boost_factors:
- exact_component_type_match: +0.1
- >50% prop match: +0.05
- >50% variant match: +0.05
- accessibility features: +0.05
```

**Match Highlights:**
- Matched props: `["variant", "size"]`
- Matched variants: `["primary", "secondary"]`
- Matched a11y: `["aria-label"]`

**Explanation Text:**
> "High confidence match (0.92). This Button pattern matches 2/3 requested props (variant, size), 2/3 variants (primary, secondary), and includes aria-label support."

## API Endpoints

### POST /api/v1/retrieval/search

Retrieve top-3 matching patterns for given requirements.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/retrieval/search \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": {
      "component_type": "Button",
      "props": ["variant", "size", "disabled"],
      "variants": ["primary", "secondary", "ghost"],
      "a11y": ["aria-label", "keyboard navigation"]
    }
  }'
```

**Response:**
```json
{
  "patterns": [
    {
      "id": "shadcn-button",
      "name": "Button",
      "category": "form",
      "description": "A button component with variants and sizes",
      "framework": "react",
      "library": "shadcn/ui",
      "code": "...",
      "metadata": {
        "props": ["variant", "size", "disabled", "onClick"],
        "variants": ["default", "primary", "secondary", "ghost", "destructive"],
        "a11y": ["aria-label", "aria-disabled", "keyboard navigation"]
      },
      "confidence": 0.92,
      "explanation": "High confidence match (0.92). This Button pattern matches 3/3 requested props (variant, size, disabled), 3/3 variants (primary, secondary, ghost), and includes all requested accessibility features.",
      "match_highlights": {
        "matched_props": ["variant", "size", "disabled"],
        "matched_variants": ["primary", "secondary", "ghost"],
        "matched_a11y": ["aria-label", "keyboard navigation"]
      },
      "ranking_details": {
        "bm25_score": 0.85,
        "bm25_rank": 1,
        "semantic_score": 0.95,
        "semantic_rank": 1,
        "final_score": 0.92,
        "final_rank": 1
      }
    },
    {
      "id": "radix-button",
      "name": "Button (Radix UI)",
      "confidence": 0.78,
      "..."
    },
    {
      "id": "headlessui-button",
      "name": "Button (Headless UI)",
      "confidence": 0.65,
      "..."
    }
  ],
  "retrieval_metadata": {
    "latency_ms": 450,
    "methods_used": ["bm25", "semantic", "fusion"],
    "weights": {
      "bm25": 0.3,
      "semantic": 0.7
    },
    "total_patterns_searched": 150,
    "query": "Button with variant size disabled props supporting primary secondary ghost variants and aria-label keyboard navigation accessibility"
  }
}
```

### GET /api/v1/retrieval/stats

Get pattern library statistics.

**Request:**
```bash
curl http://localhost:8000/api/v1/retrieval/stats
```

**Response:**
```json
{
  "total_patterns": 150,
  "component_types": ["Button", "Card", "Input", "Modal", "Badge", "..."],
  "categories": ["form", "layout", "feedback", "navigation"],
  "frameworks": ["react", "vue", "svelte"],
  "libraries": ["shadcn/ui", "radix-ui", "headlessui"],
  "total_variants": 450,
  "total_props": 1200,
  "metrics": {
    "mrr": 0.85,
    "hit_at_3": 0.92
  }
}
```

## Confidence Scoring

Confidence scores indicate how well a pattern matches the requirements.

### Score Ranges

| Range | Interpretation | Action |
|-------|---------------|---------|
| 0.9 - 1.0 | **Excellent match** | Use with high confidence |
| 0.7 - 0.9 | **Good match** | Review highlighted differences |
| 0.5 - 0.7 | **Fair match** | Consider customization needed |
| 0.0 - 0.5 | **Weak match** | May require significant changes |

### Confidence Calculation

```python
base_score = (0.3 × bm25_score) + (0.7 × semantic_score)

# Boost factors
if exact_component_type_match:
    boost += 0.1

if prop_match_ratio > 0.5:
    boost += 0.05

if variant_match_ratio > 0.5:
    boost += 0.05

if has_accessibility_features:
    boost += 0.05

confidence = min(base_score + boost, 1.0)
```

## Usage Examples

### TypeScript Client

```typescript
import { RetrievalClient } from '@/lib/retrieval-client';

const client = new RetrievalClient('http://localhost:8000');

// Search for patterns
const result = await client.search({
  requirements: {
    component_type: "Button",
    props: ["variant", "size", "disabled"],
    variants: ["primary", "secondary", "ghost"],
    a11y: ["aria-label", "keyboard navigation"]
  }
});

// Access top pattern
const topPattern = result.patterns[0];
console.log(`Best match: ${topPattern.name} (confidence: ${topPattern.confidence})`);

// Check match highlights
console.log('Matched props:', topPattern.match_highlights.matched_props);
console.log('Matched variants:', topPattern.match_highlights.matched_variants);

// Use in generation
const generatedCode = await generateComponent(topPattern, requirements);
```

### Python Backend

```python
from services.retrieval_service import RetrievalService

# Initialize service
service = RetrievalService(
    patterns=patterns,
    semantic_retriever=semantic_retriever
)

# Search
result = await service.search(
    requirements={
        "component_type": "Button",
        "props": ["variant", "size", "disabled"],
        "variants": ["primary", "secondary", "ghost"],
        "a11y": ["aria-label", "keyboard navigation"]
    },
    top_k=3
)

# Process results
for pattern in result["patterns"]:
    print(f"{pattern['name']}: {pattern['confidence']}")
    print(f"  Explanation: {pattern['explanation']}")
```

## Performance

### Latency Targets

- **Target**: <1000ms (p95)
- **Typical**: 300-500ms
- **Breakdown**:
  - Query building: <10ms
  - BM25 search: 50-100ms
  - Semantic search: 200-300ms (includes OpenAI API)
  - Fusion & explanation: <50ms

### Optimization Tips

1. **Use Semantic Search Sparingly**
   - Semantic search is slower (OpenAI API call)
   - For exact keyword matches, BM25 alone may suffice

2. **Reduce top_k**
   - Fewer results = faster processing
   - Default top_k=3 is optimal for most cases

3. **Cache Embeddings**
   - Query embeddings can be cached
   - Reduces latency by ~200ms on repeat queries

4. **Adjust Weights**
   - Increase BM25 weight (e.g., 0.5/0.5) for faster searches
   - Decrease semantic weight if accuracy is acceptable

### Monitoring

Track these metrics in production:

```python
# LangSmith metrics
- retrieval_latency_ms: p50, p95, p99
- retrieval_accuracy: MRR, Hit@3
- embedding_generation_time: OpenAI API latency
- fusion_time: Score combination overhead
```

## Integration with Other Epics

**Input from Epic 2:**
- Requirements extraction provides structured requirements
- Component type, props, variants, accessibility features

**Output to Epic 4:**
- Top-3 matched patterns with code
- Pattern metadata for generation
- Confidence scores for quality assessment

**Epic 3 → Epic 4 Data Flow:**
```json
{
  "selected_pattern": {
    "id": "shadcn-button",
    "code": "...",
    "metadata": {
      "props": ["variant", "size"],
      "variants": ["primary", "secondary"]
    }
  },
  "confidence": 0.92,
  "requirements": { ... }
}
```

## Troubleshooting

### Low Confidence Scores

**Problem**: All patterns have confidence <0.7

**Solutions**:
1. Check if component_type is correct
2. Verify requirements are well-formed
3. Ensure pattern library is seeded in Qdrant
4. Check if semantic search is enabled

### Slow Retrieval

**Problem**: Latency >1000ms

**Solutions**:
1. Check Qdrant connection latency
2. Verify OpenAI API key is valid and not rate-limited
3. Reduce top_k to 3 or less
4. Consider caching embeddings for common queries

### Empty Results

**Problem**: No patterns returned

**Solutions**:
1. Verify pattern library has data: `GET /api/v1/retrieval/stats`
2. Check Qdrant collection exists and has vectors
3. Ensure component_type matches a known pattern
4. Try broader requirements

## See Also

- [Code Generation](./code-generation.md) - Uses retrieved patterns for generation
- [Token Extraction](./token-extraction.md) - Provides design tokens for customization
- [Observability](./observability.md) - LangSmith tracing for retrieval debugging
- [Backend Retrieval Module](../../backend/src/retrieval/) - Implementation details
