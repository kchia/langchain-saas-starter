# Epic 002: LLM-as-Judge Semantic Evaluation (Future Enhancement)

**Priority:** P1 - ENHANCEMENT (Optional)
**Status:** Not Started - Awaiting Epic 001 Completion
**Prerequisite:** Epic 001 (E2E Evaluation Framework) must be complete
**Estimated Effort:** 3-4 days
**Value:** Catches semantic correctness issues that deterministic metrics miss
**Cost:** ~$0.01-0.05 per screenshot (~$0.50 per full evaluation run)

## Problem Statement

Epic 001's deterministic evaluation validates that the pipeline **technically works** (tokens extracted, pattern retrieved, code compiles), but doesn't validate **semantic correctness** - whether the generated code actually matches the screenshot's visual intent.

### Gaps in Deterministic Evaluation

**Example Failure Scenario:**
```
Screenshot: Primary blue button with icon
  ↓
✅ Token extraction: 85% accuracy (colors/spacing correct)
✅ Pattern retrieval: "Button" (correct)
✅ Code compilation: Valid TypeScript
✅ Quality score: 0.88

BUT...
❌ Generated code uses wrong variant (secondary instead of primary)
❌ Missing icon even though screenshot shows one
❌ Wrong size (small when should be large)

Deterministic metrics: PASS ✅
Reality: Code doesn't match screenshot ❌
```

## What LLM-as-Judge Solves

Uses GPT-4V (vision) to compare screenshot + generated code and score:
1. **Visual Similarity**: Does rendered code look like screenshot?
2. **Design Token Adherence**: Are colors/spacing used correctly in context?
3. **Component Variant**: Is the right variant selected?
4. **Feature Completeness**: Are all visual features present (icons, labels, etc.)?
5. **Layout Accuracy**: Does layout match (horizontal/vertical, alignment)?

## Success Metrics

### New Metrics (LLM-as-Judge)
- ⏳ **Semantic Correctness Score**: Target >0.85 (0.0-1.0)
- ⏳ **Visual Similarity Score**: Target >0.90
- ⏳ **Feature Completeness**: Target 100% (all features present)
- ⏳ **Variant Accuracy**: Target 100% (correct variant selected)

### Existing Metrics (From Epic 001 - Unchanged)
- ✅ Token extraction accuracy: >85%
- ✅ Pattern retrieval accuracy: >90%
- ✅ Code compilation rate: >90%
- ✅ Quality score: >0.85

## Use Cases

### When You NEED LLM-as-Judge
1. **Production deployment**: Need high confidence in code quality
2. **Complex components**: Variants, icons, layouts where correctness is nuanced
3. **Stakeholder demos**: Need to prove semantic correctness, not just technical validity
4. **Regression testing**: Catch visual regressions after code changes

### When You DON'T Need LLM-as-Judge
1. **MVP/Bootcamp**: Deterministic metrics sufficient for proof-of-concept
2. **Budget constraints**: API costs add up
3. **Speed priority**: LLM calls add 5-10s per screenshot
4. **Simple components**: Basic buttons/cards where token + pattern matching is enough

---

## Task Breakdown

### Phase 1: Core LLM-as-Judge Implementation (Days 1-2)

#### Task L1: Semantic Correctness Evaluator
**Assignable to:** Backend Agent
**Dependencies:** Epic 001 complete
**Estimated Time:** 4-6 hours

**Scope:**
- Create LLM-as-judge evaluator using GPT-4V
- Define scoring rubric (visual similarity, token adherence, variant accuracy)
- Integrate with existing E2E evaluator

**Files to Create:**
```
backend/src/evaluation/llm_judge.py
backend/tests/evaluation/test_llm_judge.py
```

**Technical Implementation:**

```python
# backend/src/evaluation/llm_judge.py

import json
from typing import Dict, Any, List
from PIL import Image
from openai import AsyncOpenAI

from ..core.logging import get_logger

logger = get_logger(__name__)


class LLMJudge:
    """
    LLM-as-judge evaluator using GPT-4V for semantic correctness.

    Evaluates whether generated code matches the visual intent
    of the screenshot, catching issues that deterministic metrics miss.
    """

    EVALUATION_RUBRIC = """
    Rate the generated React component code against the UI screenshot on these criteria:

    1. VISUAL SIMILARITY (0-10): Does the code produce a component that looks like the screenshot?
       - 10: Visually identical
       - 7-9: Very similar, minor differences (spacing, exact colors)
       - 4-6: Recognizable but significant differences (wrong variant, missing features)
       - 1-3: Barely resembles screenshot
       - 0: Completely different

    2. DESIGN TOKEN ADHERENCE (0-10): Are the design tokens used correctly in context?
       - 10: All tokens used exactly as shown in screenshot
       - 7-9: Tokens mostly correct, minor deviations
       - 4-6: Some tokens incorrect (wrong color shade, incorrect spacing)
       - 1-3: Most tokens incorrect
       - 0: Tokens not used at all

    3. COMPONENT VARIANT (0-10): Is the correct variant selected?
       - 10: Exact variant match (e.g., primary button when screenshot shows primary)
       - 5: Wrong variant (e.g., secondary button when screenshot shows primary)
       - 0: Completely wrong component type

    4. FEATURE COMPLETENESS (0-10): Are all visual features from screenshot present?
       - 10: All features present (icons, labels, badges, etc.)
       - 7-9: Most features present, 1-2 minor features missing
       - 4-6: Several features missing (e.g., icon missing, wrong text)
       - 1-3: Most features missing
       - 0: No features match

    5. LAYOUT ACCURACY (0-10): Does the layout match the screenshot?
       - 10: Layout identical (alignment, direction, sizing)
       - 7-9: Layout mostly correct, minor differences
       - 4-6: Layout recognizable but wrong (horizontal when should be vertical)
       - 1-3: Layout mostly wrong
       - 0: Completely different layout

    IMPORTANT: Be strict. This is for automated testing, not user-facing evaluation.
    """

    def __init__(self, api_key: str = None):
        """Initialize LLM judge with OpenAI API key."""
        self.client = AsyncOpenAI(api_key=api_key)

    async def evaluate_semantic_correctness(
        self,
        screenshot: Image.Image,
        generated_code: str,
        expected_tokens: Dict[str, Any],
        screenshot_id: str
    ) -> Dict[str, Any]:
        """
        Evaluate semantic correctness of generated code against screenshot.

        Args:
            screenshot: Original UI screenshot
            generated_code: Generated React/TypeScript code
            expected_tokens: Ground truth design tokens
            screenshot_id: Identifier for logging

        Returns:
            Dictionary with scores and analysis:
            {
                "semantic_correctness": 0.88,  # Normalized 0-1
                "scores": {
                    "visual_similarity": 9,
                    "token_adherence": 8,
                    "variant_accuracy": 10,
                    "feature_completeness": 8,
                    "layout_accuracy": 9
                },
                "total_score": 44,  # Out of 50
                "issues": ["Missing icon in generated code"],
                "strengths": ["Correct variant selected", "All tokens used correctly"]
            }
        """
        logger.info(f"Running LLM-as-judge evaluation for {screenshot_id}")

        # Prepare image for API
        from ..services.image_processor import prepare_image_for_vision_api
        image_url = prepare_image_for_vision_api(screenshot)

        # Create evaluation prompt
        prompt = self._create_evaluation_prompt(
            generated_code, expected_tokens
        )

        try:
            # Call GPT-4V
            response = await self.client.chat.completions.create(
                model="gpt-4o",  # GPT-4 with vision
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert code reviewer evaluating React component code against UI screenshots. Be precise and critical."
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url,
                                    "detail": "high"
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.1,  # Low temp for consistent scoring
                max_tokens=1000
            )

            # Parse response
            content = response.choices[0].message.content
            result = json.loads(content)

            # Validate and normalize
            scores = result.get("scores", {})
            total = sum(scores.values())
            normalized = total / 50.0  # Max score is 50

            return {
                "semantic_correctness": normalized,
                "scores": scores,
                "total_score": total,
                "issues": result.get("issues", []),
                "strengths": result.get("strengths", []),
                "raw_response": result
            }

        except Exception as e:
            logger.error(f"LLM-as-judge evaluation failed for {screenshot_id}: {e}")
            # Return zero scores on failure
            return {
                "semantic_correctness": 0.0,
                "scores": {
                    "visual_similarity": 0,
                    "token_adherence": 0,
                    "variant_accuracy": 0,
                    "feature_completeness": 0,
                    "layout_accuracy": 0
                },
                "total_score": 0,
                "issues": [f"Evaluation failed: {str(e)}"],
                "strengths": [],
                "raw_response": {}
            }

    def _create_evaluation_prompt(
        self,
        generated_code: str,
        expected_tokens: Dict[str, Any]
    ) -> str:
        """Create structured evaluation prompt."""
        return f"""
{self.EVALUATION_RUBRIC}

SCREENSHOT: [Attached above]

GENERATED CODE:
```tsx
{generated_code}
```

EXPECTED DESIGN TOKENS:
```json
{json.dumps(expected_tokens, indent=2)}
```

TASK:
1. Compare the screenshot to what the generated code would render
2. Rate each criterion (1-5) using the rubric above
3. Identify specific issues (what's wrong/missing)
4. Identify strengths (what's correct)

Return JSON in this exact format:
{{
  "scores": {{
    "visual_similarity": 9,
    "token_adherence": 8,
    "variant_accuracy": 10,
    "feature_completeness": 8,
    "layout_accuracy": 9
  }},
  "issues": [
    "Missing icon in button even though screenshot shows one",
    "Padding slightly off (12px used, should be 16px)"
  ],
  "strengths": [
    "Correct variant (primary) selected",
    "All colors match design tokens exactly",
    "Layout direction correct (horizontal)"
  ]
}}
"""


class SemanticMetrics:
    """Metrics for LLM-as-judge semantic evaluation."""

    @staticmethod
    def avg_semantic_correctness(results: List[Dict]) -> float:
        """Average semantic correctness score across all evaluations."""
        scores = [r["semantic_correctness"] for r in results]
        return sum(scores) / len(scores) if scores else 0.0

    @staticmethod
    def avg_visual_similarity(results: List[Dict]) -> float:
        """Average visual similarity score (0-10 scale)."""
        scores = [r["scores"]["visual_similarity"] for r in results]
        return sum(scores) / len(scores) if scores else 0.0

    @staticmethod
    def variant_accuracy_rate(results: List[Dict]) -> float:
        """% of components with perfect variant accuracy (score = 10)."""
        perfect = sum(1 for r in results if r["scores"]["variant_accuracy"] == 10)
        return perfect / len(results) if results else 0.0

    @staticmethod
    def feature_completeness_rate(results: List[Dict]) -> float:
        """% of components with perfect feature completeness (score = 10)."""
        perfect = sum(1 for r in results if r["scores"]["feature_completeness"] == 10)
        return perfect / len(results) if results else 0.0
```

**Acceptance Criteria:**
- [ ] `LLMJudge` evaluates code vs screenshot using GPT-4V
- [ ] Returns 5 sub-scores: visual similarity, token adherence, variant, features, layout
- [ ] Normalized semantic correctness score (0.0-1.0)
- [ ] Identifies specific issues and strengths
- [ ] Handles API errors gracefully (returns zero scores)
- [ ] pytest tests with mocked OpenAI responses

---

#### Task L2: Integration with E2E Evaluator
**Assignable to:** Backend Agent
**Dependencies:** L1 (LLM Judge), Epic 001 (E2E Evaluator)
**Estimated Time:** 2-3 hours

**Scope:**
- Add LLM-as-judge as optional stage in E2E evaluation
- Extend evaluation results to include semantic scores
- Make it configurable (can enable/disable)

**Files to Update:**
```
backend/src/evaluation/e2e_evaluator.py
backend/src/evaluation/metrics.py
```

**Technical Implementation:**

```python
# Update to backend/src/evaluation/e2e_evaluator.py

from .llm_judge import LLMJudge, SemanticMetrics

class E2EEvaluator:
    """Evaluates full screenshot-to-code pipeline with optional LLM-as-judge."""

    def __init__(
        self,
        golden_dataset_path: Path = None,
        api_key: str = None,
        enable_llm_judge: bool = False  # NEW: Optional LLM-as-judge
    ):
        """Initialize E2E evaluator."""
        self.dataset = GoldenDataset(golden_dataset_path)
        self.token_extractor = TokenExtractor(api_key=api_key)
        self.retrieval_service = RetrievalService()
        self.generator_service = GeneratorService(api_key=api_key)

        # NEW: Optional LLM judge
        self.enable_llm_judge = enable_llm_judge
        if enable_llm_judge:
            self.llm_judge = LLMJudge(api_key=api_key)

        self.results: List[E2EResult] = []

    async def evaluate_single(self, screenshot_data: Dict) -> E2EResult:
        """Evaluate a single screenshot through the full pipeline."""
        screenshot_id = screenshot_data['id']
        image = screenshot_data['image']
        ground_truth = screenshot_data['ground_truth']

        start_time = time.time()

        # Stage 1-3: Existing evaluation (token, retrieval, generation)
        token_result = await self._evaluate_token_extraction(...)
        retrieval_result = await self._evaluate_retrieval(...)
        generation_result = await self._evaluate_generation(...)

        # Stage 4: NEW - LLM-as-judge (optional)
        semantic_result = None
        if self.enable_llm_judge and generation_result.code_generated:
            logger.info(f"  Stage 4: Semantic Evaluation (LLM-as-judge)")
            semantic_result = await self._evaluate_semantic_correctness(
                image=image,
                generated_code=generation_result.generated_code,
                expected_tokens=ground_truth['expected_tokens'],
                screenshot_id=screenshot_id
            )

        total_latency = (time.time() - start_time) * 1000

        # Pipeline succeeds if all stages pass (including semantic if enabled)
        pipeline_success = (
            token_result.accuracy > 0.8 and
            retrieval_result.correct and
            generation_result.code_compiles and
            (semantic_result.semantic_correctness > 0.85 if semantic_result else True)
        )

        return E2EResult(
            screenshot_id=screenshot_id,
            token_extraction=token_result,
            retrieval=retrieval_result,
            generation=generation_result,
            semantic=semantic_result,  # NEW field
            pipeline_success=pipeline_success,
            total_latency_ms=total_latency
        )

    async def _evaluate_semantic_correctness(
        self,
        image: Image.Image,
        generated_code: str,
        expected_tokens: Dict,
        screenshot_id: str
    ) -> SemanticResult:
        """Evaluate semantic correctness using LLM-as-judge."""
        result = await self.llm_judge.evaluate_semantic_correctness(
            screenshot=image,
            generated_code=generated_code,
            expected_tokens=expected_tokens,
            screenshot_id=screenshot_id
        )

        return SemanticResult(
            screenshot_id=screenshot_id,
            semantic_correctness=result["semantic_correctness"],
            visual_similarity=result["scores"]["visual_similarity"],
            token_adherence=result["scores"]["token_adherence"],
            variant_accuracy=result["scores"]["variant_accuracy"],
            feature_completeness=result["scores"]["feature_completeness"],
            layout_accuracy=result["scores"]["layout_accuracy"],
            issues=result["issues"],
            strengths=result["strengths"]
        )
```

**Update metrics.py:**

```python
# Add to backend/src/evaluation/metrics.py

@dataclass
class SemanticResult:
    """Result of LLM-as-judge semantic evaluation."""
    screenshot_id: str
    semantic_correctness: float  # 0.0-1.0
    visual_similarity: int  # 0-10
    token_adherence: int  # 0-10
    variant_accuracy: int  # 0-10
    feature_completeness: int  # 0-10
    layout_accuracy: int  # 0-10
    issues: List[str]
    strengths: List[str]

@dataclass
class E2EResult:
    """Complete end-to-end evaluation result."""
    screenshot_id: str
    token_extraction: TokenExtractionResult
    retrieval: RetrievalResult
    generation: GenerationResult
    semantic: SemanticResult = None  # NEW: Optional semantic evaluation
    pipeline_success: bool
    total_latency_ms: float
```

**Acceptance Criteria:**
- [ ] E2E evaluator has `enable_llm_judge` flag (default False)
- [ ] When enabled, runs semantic evaluation after code generation
- [ ] Semantic scores included in results
- [ ] Pipeline success considers semantic score if enabled
- [ ] Works with existing E2E evaluation when disabled
- [ ] pytest tests with LLM judge enabled/disabled

---

### Phase 2: CLI & API Integration (Day 3)

#### Task L3: Update CLI Script
**Assignable to:** Backend Agent
**Dependencies:** L2 (E2E Integration)
**Estimated Time:** 1-2 hours

**Scope:**
- Add `--enable-llm-judge` flag to CLI script
- Display semantic scores in output

**Files to Update:**
```
backend/scripts/run_e2e_evaluation.py
```

**Example Usage:**
```bash
# Run evaluation with LLM-as-judge
python backend/scripts/run_e2e_evaluation.py --enable-llm-judge

# Run without LLM-as-judge (default)
python backend/scripts/run_e2e_evaluation.py
```

**Example Output:**
```
🔍 SEMANTIC EVALUATION (LLM-as-judge)
   Semantic Correctness: 88.5%
   Visual Similarity: 8.9/10
   Variant Accuracy: 100% (10/10 perfect)
   Feature Completeness: 85% (9/10 with minor issues)

   Common Issues:
   - Missing icons in 2 components
   - Wrong padding in 1 component
```

**Acceptance Criteria:**
- [ ] `--enable-llm-judge` flag enables semantic evaluation
- [ ] Displays semantic metrics in formatted output
- [ ] Shows per-screenshot semantic scores
- [ ] Reports common issues/strengths
- [ ] Saves semantic results to JSON report

---

#### Task L4: Update API Endpoint
**Assignable to:** Backend Agent
**Dependencies:** L2 (E2E Integration)
**Estimated Time:** 1-2 hours

**Scope:**
- Add query parameter to enable LLM-as-judge
- Include semantic metrics in API response

**Files to Update:**
```
backend/src/api/v1/routes/evaluation.py
```

**Example Usage:**
```bash
# With LLM-as-judge
GET /api/v1/evaluation/metrics?enable_llm_judge=true

# Without (default)
GET /api/v1/evaluation/metrics
```

**Example Response:**
```json
{
  "overall": {
    "pipeline_success_rate": 0.85,
    "avg_latency_ms": 5240,
    "token_extraction": {...},
    "retrieval": {...},
    "generation": {...},
    "semantic": {
      "avg_semantic_correctness": 0.885,
      "avg_visual_similarity": 8.9,
      "variant_accuracy_rate": 1.0,
      "feature_completeness_rate": 0.85
    }
  }
}
```

**Acceptance Criteria:**
- [ ] API accepts `enable_llm_judge` query parameter
- [ ] Returns semantic metrics when enabled
- [ ] Response time warning if >30s (LLM calls are slow)
- [ ] pytest tests with parameter enabled/disabled

---

### Phase 3: Dashboard & Documentation (Day 4)

#### Task L5: Update Dashboard
**Assignable to:** Frontend Agent
**Dependencies:** L4 (API Update)
**Estimated Time:** 2-3 hours

**Scope:**
- Add toggle to enable LLM-as-judge evaluation
- Display semantic metrics in dashboard

**Files to Update:**
```
app/src/app/evaluation/page.tsx
app/src/types/evaluation.ts
app/src/components/evaluation/SemanticMetricsCard.tsx (new)
```

**Example UI:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Semantic Evaluation (LLM-as-Judge)</CardTitle>
    <Switch
      checked={enableLLMJudge}
      onCheckedChange={setEnableLLMJudge}
      label="Enable LLM-as-judge"
    />
  </CardHeader>
  <CardContent>
    {enableLLMJudge && semanticMetrics && (
      <>
        <div className="text-3xl font-bold">
          {(semanticMetrics.avg_semantic_correctness * 100).toFixed(1)}%
        </div>
        <p className="text-sm text-gray-600 mt-2">Semantic correctness</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <MetricBadge label="Visual Similarity" value={8.9} max={10} />
          <MetricBadge label="Variant Accuracy" value={100} unit="%" />
          <MetricBadge label="Feature Complete" value={85} unit="%" />
          <MetricBadge label="Layout Accuracy" value={9.1} max={10} />
        </div>
      </>
    )}
  </CardContent>
</Card>
```

**Acceptance Criteria:**
- [ ] Toggle to enable LLM-as-judge in dashboard
- [ ] Displays semantic metrics when enabled
- [ ] Shows warning about slower evaluation time
- [ ] Shows per-screenshot semantic scores
- [ ] Lists common issues across all screenshots

---

#### Task L6: Documentation
**Assignable to:** Any Agent
**Dependencies:** All tasks complete
**Estimated Time:** 1 hour

**Scope:**
- Document LLM-as-judge usage and cost
- Update demo talking points

**Files to Update:**
```
backend/src/evaluation/README.md
DEMO_METRICS.md
```

**Documentation Topics:**
- How to enable LLM-as-judge
- Cost analysis ($0.01-0.05 per screenshot)
- Latency impact (+5-10s per screenshot)
- When to use vs when to skip
- Interpreting semantic scores

---

## Cost Analysis

### API Costs (GPT-4V)

**Per Screenshot:**
- Input: ~1,000 tokens (image + code + prompt)
- Output: ~200 tokens (scores + analysis)
- Cost: ~$0.01-0.05 per screenshot

**Per Full Evaluation (15 screenshots):**
- Cost: ~$0.15-0.75

**Annual Cost (1 eval/day):**
- Cost: ~$55-275/year

**Comparison:**
- Deterministic evaluation: $0 (free)
- LLM-as-judge: ~$0.50 per eval run

### Time Impact

**Per Screenshot:**
- Deterministic: ~15-20s
- With LLM-judge: +5-10s = ~25-30s total

**Full Evaluation (15 screenshots):**
- Deterministic: ~5-8 minutes
- With LLM-judge: ~7-12 minutes

---

## When to Implement This Epic

### Implement Now If:
- ✅ Epic 001 metrics show false positives (code compiles but looks wrong)
- ✅ Preparing for production deployment (need high confidence)
- ✅ Complex components where variant/layout correctness matters
- ✅ Stakeholders require proof of semantic correctness

### Defer If:
- ⏳ Still in MVP/bootcamp phase
- ⏳ Budget is limited (<$50/year for evaluation)
- ⏳ Deterministic metrics are sufficient for current needs
- ⏳ Manual spot-checking is faster/cheaper

---

## Success Criteria

**Epic 002 Complete When:**
- [ ] LLM-as-judge evaluator implemented and tested
- [ ] Integrated with E2E evaluator (optional stage)
- [ ] CLI script supports `--enable-llm-judge` flag
- [ ] API endpoint supports semantic evaluation
- [ ] Dashboard displays semantic metrics
- [ ] Documentation explains usage and cost

**Production-Ready When:**
- [ ] Semantic correctness >0.85 average
- [ ] Visual similarity >8.5/10 average
- [ ] Variant accuracy >95%
- [ ] Feature completeness >90%
- [ ] No API failures in 100 consecutive evaluations

---

## Task Dependency Graph

```
L1 (LLM Judge Core) ──→ L2 (E2E Integration) ──┬──→ L3 (CLI Update)
                                                 ├──→ L4 (API Update)
                                                 └──→ L5 (Dashboard Update)

All Complete ──→ L6 (Documentation)
```

**Timeline:**
- Day 1: L1 (LLM Judge implementation)
- Day 2: L2 (E2E Integration)
- Day 3: L3 + L4 (CLI + API)
- Day 4: L5 + L6 (Dashboard + Docs)

---

## Example Evaluation Output (With LLM-as-Judge)

```json
{
  "screenshot_id": "button_primary",
  "pipeline_success": true,
  "total_latency_ms": 28450,

  "token_extraction": {
    "accuracy": 0.92
  },

  "retrieval": {
    "correct": true,
    "retrieved": "button"
  },

  "generation": {
    "code_compiles": true,
    "quality_score": 0.88
  },

  "semantic": {
    "semantic_correctness": 0.90,
    "scores": {
      "visual_similarity": 9,
      "token_adherence": 9,
      "variant_accuracy": 10,
      "feature_completeness": 8,
      "layout_accuracy": 9
    },
    "issues": [
      "Icon size slightly smaller than screenshot (16px vs 20px)"
    ],
    "strengths": [
      "Correct variant (primary) selected",
      "All colors match exactly",
      "Layout and alignment perfect"
    ]
  }
}
```

---

## References

- **Prerequisite**: Epic 001 (E2E Evaluation Framework)
- **LLM-as-Judge Pattern**: https://arxiv.org/abs/2306.05685
- **GPT-4V Documentation**: https://platform.openai.com/docs/guides/vision
- **Cost Calculator**: https://openai.com/pricing

---

## Alternatives Considered

### Alternative 1: Visual Regression Testing
**Approach:** Render generated component, compare screenshot pixel-by-pixel

**Pros:**
- Truly objective (pixel matching)
- No API costs

**Cons:**
- Brittle (breaks on minor visual changes)
- Requires rendering infrastructure
- Hard to debug (pixel diff doesn't explain why)

**Decision:** Rejected - too brittle for AI-generated code

### Alternative 2: Rule-Based Semantic Checks
**Approach:** Write deterministic rules (if variant="primary" then color must be X)

**Pros:**
- Fast
- Free
- Deterministic

**Cons:**
- Doesn't scale (need rules for every component/variant)
- Misses nuanced issues (layout, features)
- Manual maintenance burden

**Decision:** Rejected - doesn't solve the semantic gap

### Alternative 3: Human Evaluation
**Approach:** Manual review of each generated component

**Pros:**
- Most accurate
- Can catch any issue

**Cons:**
- Not scalable
- Slow
- Expensive (human time)

**Decision:** Rejected - automation is the goal

---

## Bottom Line

LLM-as-judge adds **semantic correctness validation** to catch issues that deterministic metrics miss. It's an optional enhancement that adds cost and latency but provides higher confidence in code quality.

**Recommended Timeline:**
1. Implement Epic 001 first (E2E deterministic evaluation)
2. Run for 1-2 weeks, collect data on false positives
3. If false positives are common, implement Epic 002
4. If deterministic metrics are sufficient, defer Epic 002

**Quick Decision Matrix:**

| Scenario | Recommendation |
|----------|----------------|
| MVP/Bootcamp | Skip (use Epic 001 only) |
| Pre-production | Implement (catch issues before launch) |
| Production | Implement (ongoing quality assurance) |
| Limited budget | Skip (deterministic is free) |
| Complex components | Implement (semantic correctness matters) |
