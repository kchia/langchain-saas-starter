# Caching Analysis: Prompt and Embedding Caching

**Date**: 2025  
**Status**: Not Recommended (Yet)

## Executive Summary

After analyzing the codebase, **prompt and embedding caching are NOT needed** for this application at this time. The recommendation is to focus on **result caching** (caching generated component code) instead, which provides much higher value.

---

## Current Caching Infrastructure

### ✅ Already Implemented

1. **Redis Infrastructure**

   - Configured in `docker-compose.yml`
   - Base cache utilities: `backend/src/core/cache.py`
   - Default TTL: 5 minutes
   - Can be enabled/disabled via `CACHE_ENABLED`

2. **Figma API Caching**

   - `FigmaCache` class extends `BaseCache`
   - Caches Figma file and styles responses (5 min TTL)
   - Hit rate tracking and metrics
   - Active and working in production

3. **Frontend Caching (TanStack Query)**
   - 5 minute staleTime
   - 10 minute gcTime
   - Used for API responses

### ❌ Missing

- Generation result caching
- Pattern retrieval caching
- Prompt/embedding caching (this analysis)

---

## Prompt Caching Analysis

### Current Prompt Construction

Prompts are built dynamically in `PromptBuilder.build_prompt()` with these inputs:

```python
# From backend/src/generation/prompt_builder.py
def build_prompt(
    pattern_code: str,        # Varies per pattern_id
    component_name: str,      # Varies per request
    component_type: str,       # Varies per pattern
    tokens: Dict[str, Any],    # Varies per user/extraction
    requirements: Dict[str, Any] # Varies per user (props, events, states, a11y)
) -> Dict[str, str]:
```

**Prompt Structure:**

- **System Prompt**: Static 200+ line template (could be cached, but trivial overhead)
- **User Prompt**: Highly dynamic, includes:
  - Pattern reference code (varies by `pattern_id`)
  - Design tokens (unique per extraction)
  - Requirements (unique per screenshot/Figma file)
  - Component metadata

### Prompt Caching Value Assessment

#### ❌ **Low Value: Not Recommended**

**Why Not:**

1. **Low Repetition Rate**

   - Each generation combines: pattern + tokens + requirements
   - Even same pattern with same tokens but different requirements = different prompt
   - Real-world repetition is extremely rare
   - Users don't typically regenerate identical components

2. **High Variability**

   - Design tokens extracted from different Figma files are different
   - Requirements extracted from screenshots vary significantly
   - Even "similar" requests have enough variation to miss cache

3. **Implementation Complexity**

   - Cache key = hash of entire prompt (system + user)
   - Would need to serialize large prompt strings
   - Cache hit rate would likely be <1-2%
   - Storage cost for large prompts with minimal benefit

4. **Minimal Cost Savings**
   - Prompt construction overhead: ~10-50ms (string formatting)
   - LLM API call: ~1-5 seconds (the real cost)
   - Caching prompt saves milliseconds, not seconds

**When Would Help:**

- ✅ Batch evaluation workloads with identical test cases
- ✅ Users regenerating exact same component (rare use case)
- ✅ Automated testing with fixed inputs

---

## Embedding Caching Analysis

### Current Embedding Usage

Embeddings are generated in `SemanticRetriever._create_embedding()`:

```python
# From backend/src/retrieval/semantic_retriever.py
async def _create_embedding(self, text: str) -> List[float]:
    response = await self.openai.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding
```

**Usage Pattern:**

- Called once per pattern retrieval query
- Query text built from user requirements (dynamic)
- Generates 1536-dimensional vector
- ~200-300ms latency
- Cost: ~$0.02 per 1M tokens (very cheap)

### Embedding Caching Value Assessment

#### ⚠️ **Low-Medium Value: Not Recommended (Yet)**

**Why Not High Priority:**

1. **Variable Query Text**

   - Queries built dynamically from requirements
   - Different screenshots/Figma files → different queries
   - Even "similar" requirements produce different query text
   - Exact matches are uncommon

2. **Low Cost**

   - Embedding API is very cheap ($0.02/1M tokens)
   - Average query: ~50-200 tokens
   - Cost per embedding: ~$0.000001-0.000004 (negligible)
   - Would need thousands of repeated queries to save significant money

3. **Already Optimized**
   - Pattern embeddings stored in Qdrant (one-time cost)
   - Only query embeddings generated on-demand
   - 200ms latency is acceptable for search

**When Would Help:**

- ✅ Evaluation workloads with repeated test queries
- ✅ Common query patterns reused across users
- ✅ High-volume production with measurable repetition

**Cache Key Strategy (if implemented):**

```python
cache_key = f"embedding:{hash(query_text)}"
```

---

## Recommendations

### 🚫 **Do NOT Implement (Current State)**

**Reasoning:**

- Low repetition rates in real usage
- Minimal cost savings vs. implementation complexity
- Better alternatives available (see below)
- Focus engineering effort on higher-value features

### ✅ **DO Implement Instead: Result Caching**

**Why Result Caching is Better:**

1. **Higher Hit Rate**

   - Same inputs (pattern + tokens + requirements) → same output
   - More deterministic than prompt/embedding caching
   - Users may regenerate after fixing validation errors

2. **Greater Cost Savings**

   - Saves entire LLM generation cost (~$0.03-0.10 per generation)
   - Saves full latency (~30-90 seconds → ~0.5 seconds)
   - Prompt/embedding caching saves minimal overhead

3. **Better User Experience**
   - Instant results for repeated requests
   - Faster iteration during development
   - Reduces API rate limit issues

**Implementation Strategy:**

```python
# Cache key: hash of inputs
cache_key = sha256({
    "pattern_id": pattern_id,
    "tokens": sorted_json_hash(tokens),
    "requirements": sorted_json_hash(requirements)
})

# Check cache before generation
cached_result = await cache.get(cache_key)
if cached_result:
    return cached_result

# Generate and cache
result = await generate(...)
await cache.set(cache_key, result, ttl=None)  # No expiration
return result
```

**Files to Modify:**

- `backend/src/generation/generator_service.py`
- Add cache check before LLM generation
- Store complete `GenerationResult` in cache

**Planned in Epic 6:**

- L1 Exact Cache: Complete generation results
- Cache key: SHA-256 hash of inputs
- No TTL (invalidate on input change)

---

## When to Revisit

Add prompt/embedding caching if you observe:

### High Repetition Indicators

1. **Usage Patterns**

   - 100+ generations/day with measurable repetition
   - Batch evaluation workloads with identical test cases
   - Common requirement templates reused frequently

2. **Cost Thresholds**

   - Embedding API costs > $10-20/month
   - Prompt construction overhead measurable in production metrics
   - LLM costs indicate prompt caching would save significant money

3. **Performance Issues**
   - Embedding generation becomes bottleneck (>500ms)
   - High-volume production needs sub-100ms latency
   - Query repetition rate >5-10%

### Implementation Checklist (If Needed)

**Prompt Caching:**

```python
# backend/src/generation/prompt_cache.py
class PromptCache(BaseCache):
    async def get_prompt_hash(self, system: str, user: str) -> Optional[str]:
        prompt_hash = hashlib.sha256(f"{system}:{user}".encode()).hexdigest()
        cache_key = f"prompt:{prompt_hash}"
        return await self.get(cache_key)

    async def cache_prompt_hash(self, system: str, user: str, result_hash: str):
        prompt_hash = hashlib.sha256(f"{system}:{user}".encode()).hexdigest()
        cache_key = f"prompt:{prompt_hash}"
        await self.set(cache_key, {"result_hash": result_hash}, ttl=3600)
```

**Embedding Caching:**

```python
# backend/src/retrieval/embedding_cache.py
class EmbeddingCache(BaseCache):
    async def get_embedding(self, query_text: str) -> Optional[List[float]]:
        query_hash = hashlib.sha256(query_text.encode()).hexdigest()
        cache_key = f"embedding:{query_hash}"
        cached = await self.get(cache_key)
        return cached["vector"] if cached else None

    async def cache_embedding(self, query_text: str, vector: List[float]):
        query_hash = hashlib.sha256(query_text.encode()).hexdigest()
        cache_key = f"embedding:{query_hash}"
        await self.set(cache_key, {"vector": vector}, ttl=86400)  # 24 hours
```

---

## Alternative Optimizations (Better ROI)

### 1. ✅ Pattern Code Caching (Already Done)

- Patterns loaded at startup
- No runtime fetching overhead
- **Status**: Implemented

### 2. ✅ Figma API Caching (Already Done)

- 5 minute TTL for file/styles
- Reduces external API calls
- **Status**: Active in production

### 3. ⭐ Generation Result Caching (Recommended Next)

- Cache complete generation outputs
- High hit rate potential
- Maximum cost/latency savings
- **Status**: Planned in Epic 6

### 4. Pattern Retrieval Result Caching

- Cache retrieval results for common queries
- Lower priority than generation caching
- **Status**: Not implemented

---

## Metrics to Monitor

If you want to validate this decision later, track:

### Prompt Repetition Metrics

```python
# Track prompt hash frequencies
prompt_hashes = {}
for request in generation_requests:
    prompt_hash = hash_prompt(request)
    prompt_hashes[prompt_hash] = prompt_hashes.get(prompt_hash, 0) + 1

# Calculate repetition rate
repetition_rate = sum(1 for count in prompt_hashes.values() if count > 1) / len(prompt_hashes)
```

### Embedding Repetition Metrics

```python
# Track query text frequencies
query_frequencies = {}
for retrieval in retrieval_requests:
    query_frequencies[retrieval.query] = query_frequencies.get(retrieval.query, 0) + 1

# Calculate repetition rate
repetition_rate = sum(1 for count in query_frequencies.values() if count > 1) / len(query_frequencies)
```

### Cost Analysis

- Track OpenAI API costs (embeddings vs. completions)
- Measure embedding generation latency
- Compare cost savings potential vs. implementation effort

---

## Conclusion

**Current Recommendation: DO NOT implement prompt/embedding caching**

**Rationale:**

1. Low repetition rates in real-world usage
2. Minimal cost savings vs. implementation complexity
3. Better alternatives available (result caching)
4. Focus engineering effort on higher-value features

**Priority Order:**

1. ✅ Result caching (generation outputs)
2. ⚠️ Pattern retrieval result caching
3. ❌ Prompt caching (defer)
4. ❌ Embedding caching (defer)

**Revisit When:**

- Observable repetition patterns emerge
- Costs exceed $10-20/month threshold
- Performance becomes bottleneck
- Evaluation workloads require optimization

---

## References

- Cache Infrastructure: `backend/src/core/cache.py`
- Figma Caching: `backend/src/cache/figma_cache.py`
- Prompt Builder: `backend/src/generation/prompt_builder.py`
- Semantic Retriever: `backend/src/retrieval/semantic_retriever.py`
- Generation Service: `backend/src/generation/generator_service.py`
- Epic 6 Planning: `.claude/epics/06-production-infrastructure.md`
