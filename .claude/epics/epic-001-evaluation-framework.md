# Epic 001: End-to-End Evaluation Framework (E2E-First)

**Priority:** P0 - CRITICAL GAP
**Status:** Research Done → E2E Implementation Pending
**Estimated Effort:** 5-7 days
**Value:** Validates full screenshot-to-code pipeline with quantified metrics
**Bootcamp Requirement:** Week 4 - Evaluation ✅

## Problem Statement

ComponentForge has a sophisticated multi-agent pipeline (Screenshot → Tokens → Retrieval → Generation → Validation) but lacks **end-to-end validation**. Current evaluation only tests retrieval (isolated component), not the full pipeline that users actually experience.

**User Pain Point:** "I can only test bits and pieces of the pipeline, not end-to-end."

## Completed Work ✅

- **Retrieval metrics in notebooks** (`notebooks/evaluation/`)
  - MRR (Mean Reciprocal Rank): 0.913
  - Hit@3: 0.955
  - Precision@1: 0.864
  - Latency: 348ms avg
- **22 test queries** covering keyword, semantic, mixed types
- **Comparative analysis** of Baseline, BM25, Hybrid retrieval
- **LangSmith integration** for AI tracing
- **Code validation metrics** in `code_validator.py`

## What's Missing ❌

- ❌ Screenshot → Code end-to-end testing
- ❌ Token extraction accuracy measurement
- ❌ Code generation quality validation
- ❌ Golden dataset with ground truth
- ❌ Automated regression testing
- ❌ Stage-by-stage failure analysis

## Success Metrics

### Primary: End-to-End Pipeline Metrics
- ⏳ **Pipeline Success Rate**: Target >80% (% of screenshots → valid code)
- ⏳ **Token Extraction Accuracy**: Target >85% (% of tokens correctly extracted)
- ⏳ **Pattern Retrieval Accuracy**: Target >90% (% correct pattern selected)
- ⏳ **Code Validity Rate**: Target >90% (% of code that compiles)
- ⏳ **Quality Score**: Target >0.85 (avg quality score from validator)
- ⏳ **E2E Latency**: Target <20s (screenshot to valid code)

### Secondary: Retrieval-Only Metrics (Already Validated)
- ✅ Retrieval MRR: 0.913 (Target >0.70)
- ✅ Retrieval Hit@3: 0.955 (Target >0.80)
- ✅ Retrieval Latency: 348ms (Target <1000ms)

---

## Pipeline Architecture (What We're Testing)

```
Screenshot Upload
    ↓ [Token Extractor - GPT-4V]
Design Tokens
    ↓ [Retrieval Service - Hybrid BM25+Semantic]
Pattern Selection
    ↓ [Generator Service - LLM + Validation]
Generated Code
    ↓ [Code Validator - TypeScript/ESLint]
Valid Component Code
```

**Current Testing Coverage:**
- Stage 1 (Token Extraction): ❌ Not tested
- Stage 2 (Pattern Retrieval): ✅ Tested in notebooks (MRR: 0.913)
- Stage 3 (Code Generation): ❌ Not tested
- Stage 4 (Code Validation): ⚠️  Partial (quality scoring exists)
- **E2E Integration**: ❌ Not tested

---

## Task Breakdown (E2E-First Approach)

### Phase 1: End-to-End Golden Dataset & Evaluation (Days 1-3)

#### Task E1: Golden Dataset Creation
**Assignable to:** Backend Agent / Manual
**Dependencies:** None
**Estimated Time:** 4-6 hours

**Scope:**
- Create 10-15 component screenshots representing real use cases
- Define ground truth for each screenshot
- Organize as structured dataset

**Components to Include:**
- Button (3 variants: primary, secondary, outline)
- Card (2 variants: default, with image)
- Badge (2 variants: status colors)
- Input (2 variants: text, with icon)
- Checkbox (1 variant)
- Alert (2 variants: info, error)
- Select/Dropdown (1 variant)

**Files to Create:**
```
backend/data/golden_dataset/
├── screenshots/
│   ├── button_primary.png
│   ├── button_secondary.png
│   ├── card_default.png
│   └── ... (15 total)
├── ground_truth/
│   ├── button_primary.json
│   ├── button_secondary.json
│   └── ... (15 total)
└── README.md
```

**Ground Truth Structure:**
```json
{
  "screenshot_id": "button_primary",
  "component_name": "Primary Button",
  "expected_tokens": {
    "colors": {
      "primary": "#3B82F6",
      "text": "#FFFFFF"
    },
    "spacing": {
      "padding": "12px 24px"
    },
    "typography": {
      "fontSize": "14px",
      "fontWeight": "500"
    }
  },
  "expected_pattern_id": "button",
  "expected_code_properties": {
    "has_variant_prop": true,
    "has_accessibility": true,
    "compiles": true
  },
  "notes": "Standard primary button from shadcn/ui"
}
```

**Acceptance Criteria:**
- [ ] 10-15 screenshots covering 7 component types
- [ ] Each screenshot has ground truth JSON
- [ ] Screenshots are realistic (from shadcn/ui docs or Figma)
- [ ] Ground truth includes tokens, pattern_id, expected code properties
- [ ] README documents dataset format and usage

**Where to Get Screenshots:**
1. shadcn/ui documentation (https://ui.shadcn.com)
2. Existing Figma designs
3. Create simple test images (using PIL like test_e2e_requirements.py)

---

#### Task E2: E2E Evaluation Metrics Module
**Assignable to:** Backend Agent
**Dependencies:** E1 (Golden Dataset)
**Estimated Time:** 6-8 hours

**Scope:**
- Create metrics classes for each pipeline stage
- Port retrieval metrics from notebooks
- Add token extraction accuracy metrics
- Add code generation quality metrics

**Files to Create:**
```
backend/src/evaluation/
├── __init__.py
├── metrics.py              # Metric calculation classes
├── golden_dataset.py       # Dataset loader
├── e2e_evaluator.py        # Orchestrates full pipeline evaluation
└── types.py                # Evaluation result types

backend/tests/evaluation/
├── __init__.py
├── test_metrics.py
├── test_golden_dataset.py
└── test_e2e_evaluator.py
```

**Technical Implementation:**

```python
# backend/src/evaluation/metrics.py

from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class TokenExtractionResult:
    """Result of token extraction evaluation."""
    screenshot_id: str
    expected_tokens: Dict[str, Any]
    extracted_tokens: Dict[str, Any]
    accuracy: float  # 0.0-1.0
    missing_tokens: List[str]
    incorrect_tokens: List[str]

@dataclass
class RetrievalResult:
    """Result of pattern retrieval evaluation."""
    screenshot_id: str
    expected_pattern_id: str
    retrieved_pattern_id: str
    correct: bool
    rank: int  # Position of correct pattern (1-indexed)
    confidence: float

@dataclass
class GenerationResult:
    """Result of code generation evaluation."""
    screenshot_id: str
    code_generated: bool
    code_compiles: bool
    quality_score: float  # From code validator
    validation_errors: List[str]
    generation_time_ms: float

@dataclass
class E2EResult:
    """Complete end-to-end evaluation result."""
    screenshot_id: str
    token_extraction: TokenExtractionResult
    retrieval: RetrievalResult
    generation: GenerationResult
    pipeline_success: bool  # All stages passed
    total_latency_ms: float


class TokenExtractionMetrics:
    """Metrics for token extraction accuracy."""

    @staticmethod
    def calculate_accuracy(
        expected: Dict[str, Any],
        extracted: Dict[str, Any]
    ) -> float:
        """
        Calculate token extraction accuracy.

        Compares extracted tokens against ground truth.
        Returns accuracy as float 0.0-1.0.
        """
        total_tokens = 0
        correct_tokens = 0

        for category in ['colors', 'spacing', 'typography']:
            if category in expected:
                expected_cat = expected[category]
                extracted_cat = extracted.get(category, {})

                for key, value in expected_cat.items():
                    total_tokens += 1
                    if key in extracted_cat and extracted_cat[key] == value:
                        correct_tokens += 1

        return correct_tokens / total_tokens if total_tokens > 0 else 0.0


class RetrievalMetrics:
    """RAGAS-inspired retrieval metrics (ported from notebooks)."""

    @staticmethod
    def mean_reciprocal_rank(results: List[RetrievalResult]) -> float:
        """Context Precision: MRR of first correct pattern."""
        reciprocal_ranks = []
        for result in results:
            if result.correct:
                reciprocal_ranks.append(1.0 / result.rank)
            else:
                reciprocal_ranks.append(0.0)
        return sum(reciprocal_ranks) / len(reciprocal_ranks) if reciprocal_ranks else 0.0

    @staticmethod
    def hit_at_k(results: List[RetrievalResult], k: int = 3) -> float:
        """Context Recall: % of queries with correct pattern in top-K."""
        hits = sum(1 for r in results if r.correct and r.rank <= k)
        return hits / len(results) if results else 0.0

    @staticmethod
    def precision_at_k(results: List[RetrievalResult], k: int = 1) -> float:
        """Answer Relevancy: % of queries with correct pattern at position K."""
        correct = sum(1 for r in results if r.correct and r.rank == k)
        return correct / len(results) if results else 0.0


class GenerationMetrics:
    """Code generation quality metrics."""

    @staticmethod
    def compilation_rate(results: List[GenerationResult]) -> float:
        """% of generated code that compiles (TypeScript validity)."""
        compiled = sum(1 for r in results if r.code_compiles)
        return compiled / len(results) if results else 0.0

    @staticmethod
    def avg_quality_score(results: List[GenerationResult]) -> float:
        """Average quality score from code validator."""
        scores = [r.quality_score for r in results if r.code_generated]
        return sum(scores) / len(scores) if scores else 0.0

    @staticmethod
    def generation_success_rate(results: List[GenerationResult]) -> float:
        """% of attempts that produced code."""
        successful = sum(1 for r in results if r.code_generated)
        return successful / len(results) if results else 0.0


class E2EMetrics:
    """End-to-end pipeline metrics."""

    @staticmethod
    def pipeline_success_rate(results: List[E2EResult]) -> float:
        """% of screenshots that produced valid code end-to-end."""
        successful = sum(1 for r in results if r.pipeline_success)
        return successful / len(results) if results else 0.0

    @staticmethod
    def avg_latency_ms(results: List[E2EResult]) -> float:
        """Average end-to-end latency in milliseconds."""
        latencies = [r.total_latency_ms for r in results]
        return sum(latencies) / len(latencies) if latencies else 0.0

    @staticmethod
    def stage_failure_analysis(results: List[E2EResult]) -> Dict[str, int]:
        """Count failures by stage."""
        failures = {
            'token_extraction': 0,
            'retrieval': 0,
            'generation': 0
        }

        for r in results:
            if not r.pipeline_success:
                if r.token_extraction.accuracy < 0.8:
                    failures['token_extraction'] += 1
                if not r.retrieval.correct:
                    failures['retrieval'] += 1
                if not r.generation.code_compiles:
                    failures['generation'] += 1

        return failures
```

**Acceptance Criteria:**
- [ ] `TokenExtractionMetrics` calculates accuracy vs ground truth
- [ ] `RetrievalMetrics` ported from notebooks (MRR, Hit@K, P@K)
- [ ] `GenerationMetrics` calculates compilation rate, quality score
- [ ] `E2EMetrics` calculates pipeline success rate, latency
- [ ] All metrics handle edge cases (empty results, division by zero)
- [ ] pytest tests achieve >90% coverage

---

#### Task E3: E2E Evaluator Service
**Assignable to:** Backend Agent
**Dependencies:** E1 (Golden Dataset), E2 (Metrics)
**Estimated Time:** 6-8 hours

**Scope:**
- Create evaluator service that runs full pipeline
- Load golden dataset and run each screenshot through pipeline
- Collect metrics at each stage
- Generate detailed evaluation report

**Files to Create:**
```
backend/src/evaluation/e2e_evaluator.py
backend/tests/evaluation/test_e2e_evaluator.py
```

**Technical Implementation:**

```python
# backend/src/evaluation/e2e_evaluator.py

import time
from typing import List, Dict, Any
from pathlib import Path
from PIL import Image

from .metrics import (
    TokenExtractionMetrics,
    RetrievalMetrics,
    GenerationMetrics,
    E2EMetrics,
    E2EResult,
    TokenExtractionResult,
    RetrievalResult,
    GenerationResult
)
from .golden_dataset import GoldenDataset
from ..agents.token_extractor import TokenExtractor
from ..services.retrieval_service import RetrievalService
from ..generation.generator_service import GeneratorService
from ..core.logging import get_logger

logger = get_logger(__name__)


class E2EEvaluator:
    """
    Evaluates the full screenshot-to-code pipeline.

    Runs golden dataset screenshots through:
    1. Token extraction (GPT-4V)
    2. Pattern retrieval (Hybrid BM25+Semantic)
    3. Code generation (LLM + Validation)

    Collects metrics at each stage.
    """

    def __init__(
        self,
        golden_dataset_path: Path = None,
        api_key: str = None
    ):
        """Initialize E2E evaluator."""
        self.dataset = GoldenDataset(golden_dataset_path)
        self.token_extractor = TokenExtractor(api_key=api_key)
        self.retrieval_service = RetrievalService()
        self.generator_service = GeneratorService(api_key=api_key)

        self.results: List[E2EResult] = []

    async def evaluate_all(self) -> Dict[str, Any]:
        """
        Run evaluation on all golden dataset screenshots.

        Returns:
            Dictionary with overall metrics and per-screenshot results
        """
        logger.info(f"Starting E2E evaluation on {len(self.dataset)} screenshots")

        self.results = []

        for screenshot_data in self.dataset:
            logger.info(f"Evaluating: {screenshot_data['id']}")
            result = await self.evaluate_single(screenshot_data)
            self.results.append(result)

        # Calculate overall metrics
        metrics = self._calculate_overall_metrics()

        return {
            'overall': metrics,
            'per_screenshot': [self._result_to_dict(r) for r in self.results],
            'dataset_size': len(self.dataset),
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }

    async def evaluate_single(self, screenshot_data: Dict) -> E2EResult:
        """
        Evaluate a single screenshot through the full pipeline.

        Args:
            screenshot_data: Golden dataset entry with screenshot and ground truth

        Returns:
            E2EResult with metrics for each stage
        """
        screenshot_id = screenshot_data['id']
        image = screenshot_data['image']
        ground_truth = screenshot_data['ground_truth']

        start_time = time.time()

        # Stage 1: Token Extraction
        logger.info(f"  Stage 1: Token Extraction")
        token_result = await self._evaluate_token_extraction(
            image, ground_truth['expected_tokens']
        )

        # Stage 2: Pattern Retrieval
        logger.info(f"  Stage 2: Pattern Retrieval")
        retrieval_result = await self._evaluate_retrieval(
            token_result.extracted_tokens,
            ground_truth['expected_pattern_id']
        )

        # Stage 3: Code Generation
        logger.info(f"  Stage 3: Code Generation")
        generation_result = await self._evaluate_generation(
            retrieval_result.retrieved_pattern_id,
            token_result.extracted_tokens
        )

        total_latency = (time.time() - start_time) * 1000  # ms

        # Pipeline succeeds if all stages pass
        pipeline_success = (
            token_result.accuracy > 0.8 and
            retrieval_result.correct and
            generation_result.code_compiles
        )

        return E2EResult(
            screenshot_id=screenshot_id,
            token_extraction=token_result,
            retrieval=retrieval_result,
            generation=generation_result,
            pipeline_success=pipeline_success,
            total_latency_ms=total_latency
        )

    async def _evaluate_token_extraction(
        self, image: Image.Image, expected_tokens: Dict
    ) -> TokenExtractionResult:
        """Evaluate token extraction stage."""
        extracted = await self.token_extractor.extract_tokens(image)
        extracted_tokens = extracted.get('tokens', {})

        accuracy = TokenExtractionMetrics.calculate_accuracy(
            expected_tokens, extracted_tokens
        )

        # Find missing and incorrect tokens
        missing = []
        incorrect = []
        for category in expected_tokens:
            for key in expected_tokens[category]:
                if key not in extracted_tokens.get(category, {}):
                    missing.append(f"{category}.{key}")
                elif extracted_tokens[category][key] != expected_tokens[category][key]:
                    incorrect.append(f"{category}.{key}")

        return TokenExtractionResult(
            screenshot_id="",  # Will be set by caller
            expected_tokens=expected_tokens,
            extracted_tokens=extracted_tokens,
            accuracy=accuracy,
            missing_tokens=missing,
            incorrect_tokens=incorrect
        )

    async def _evaluate_retrieval(
        self, tokens: Dict, expected_pattern_id: str
    ) -> RetrievalResult:
        """Evaluate pattern retrieval stage."""
        # Convert tokens to search query
        query = self._tokens_to_query(tokens)

        # Search for patterns
        results = await self.retrieval_service.search(query, top_k=5)

        # Check if correct pattern was retrieved
        retrieved_pattern_id = results[0]['pattern_id'] if results else None
        correct = retrieved_pattern_id == expected_pattern_id

        # Find rank of correct pattern
        rank = None
        for i, result in enumerate(results):
            if result['pattern_id'] == expected_pattern_id:
                rank = i + 1
                break

        return RetrievalResult(
            screenshot_id="",
            expected_pattern_id=expected_pattern_id,
            retrieved_pattern_id=retrieved_pattern_id or "",
            correct=correct,
            rank=rank or 999,  # Large number if not found
            confidence=results[0]['score'] if results else 0.0
        )

    async def _evaluate_generation(
        self, pattern_id: str, tokens: Dict
    ) -> GenerationResult:
        """Evaluate code generation stage."""
        start_time = time.time()

        try:
            result = await self.generator_service.generate(
                pattern_id=pattern_id,
                tokens=tokens,
                requirements=[]
            )

            generation_time = (time.time() - start_time) * 1000

            return GenerationResult(
                screenshot_id="",
                code_generated=result.success,
                code_compiles=result.validation_metadata.get('valid', False) if result.validation_metadata else False,
                quality_score=result.validation_metadata.get('quality_score', 0.0) if result.validation_metadata else 0.0,
                validation_errors=result.validation_metadata.get('errors', []) if result.validation_metadata else [],
                generation_time_ms=generation_time
            )
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            return GenerationResult(
                screenshot_id="",
                code_generated=False,
                code_compiles=False,
                quality_score=0.0,
                validation_errors=[str(e)],
                generation_time_ms=(time.time() - start_time) * 1000
            )

    def _tokens_to_query(self, tokens: Dict) -> str:
        """Convert tokens to search query."""
        # Simple heuristic: use primary color to guess component type
        colors = tokens.get('colors', {})
        if 'primary' in colors:
            return "button component"
        # Add more heuristics as needed
        return "component"

    def _calculate_overall_metrics(self) -> Dict[str, Any]:
        """Calculate overall metrics from all results."""
        token_results = [r.token_extraction for r in self.results]
        retrieval_results = [r.retrieval for r in self.results]
        generation_results = [r.generation for r in self.results]

        return {
            'pipeline_success_rate': E2EMetrics.pipeline_success_rate(self.results),
            'avg_latency_ms': E2EMetrics.avg_latency_ms(self.results),
            'stage_failures': E2EMetrics.stage_failure_analysis(self.results),

            'token_extraction': {
                'avg_accuracy': sum(r.accuracy for r in token_results) / len(token_results) if token_results else 0.0,
            },

            'retrieval': {
                'mrr': RetrievalMetrics.mean_reciprocal_rank(retrieval_results),
                'hit_at_3': RetrievalMetrics.hit_at_k(retrieval_results, k=3),
                'precision_at_1': RetrievalMetrics.precision_at_k(retrieval_results, k=1),
            },

            'generation': {
                'compilation_rate': GenerationMetrics.compilation_rate(generation_results),
                'avg_quality_score': GenerationMetrics.avg_quality_score(generation_results),
                'success_rate': GenerationMetrics.generation_success_rate(generation_results),
            }
        }

    def _result_to_dict(self, result: E2EResult) -> Dict:
        """Convert E2EResult to dictionary for JSON serialization."""
        return {
            'screenshot_id': result.screenshot_id,
            'pipeline_success': result.pipeline_success,
            'total_latency_ms': result.total_latency_ms,
            'token_extraction': {
                'accuracy': result.token_extraction.accuracy,
                'missing_tokens': result.token_extraction.missing_tokens,
                'incorrect_tokens': result.token_extraction.incorrect_tokens,
            },
            'retrieval': {
                'correct': result.retrieval.correct,
                'expected': result.retrieval.expected_pattern_id,
                'retrieved': result.retrieval.retrieved_pattern_id,
                'rank': result.retrieval.rank,
            },
            'generation': {
                'code_generated': result.generation.code_generated,
                'code_compiles': result.generation.code_compiles,
                'quality_score': result.generation.quality_score,
                'validation_errors': result.generation.validation_errors,
            }
        }
```

**Acceptance Criteria:**
- [ ] `E2EEvaluator` runs full pipeline per screenshot
- [ ] Collects metrics at each stage (token, retrieval, generation)
- [ ] Calculates overall metrics (pipeline success rate, latency, stage failures)
- [ ] Returns structured results with per-screenshot details
- [ ] pytest tests with mocked services

---

#### Task E4: E2E Evaluation CLI Script
**Assignable to:** Backend Agent
**Dependencies:** E3 (E2E Evaluator)
**Estimated Time:** 3-4 hours

**Scope:**
- Create CLI script to run E2E evaluation
- Display formatted results to stdout
- Save JSON report to file

**Files to Create:**
```
backend/scripts/run_e2e_evaluation.py
backend/logs/.gitkeep
```

**Technical Implementation:**

```python
#!/usr/bin/env python3
"""
Run end-to-end evaluation on golden dataset.

Usage:
    cd backend
    python scripts/run_e2e_evaluation.py
"""

import asyncio
import json
import sys
import os
from pathlib import Path
from datetime import datetime

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from src.evaluation.e2e_evaluator import E2EEvaluator
from src.core.logging import get_logger

logger = get_logger(__name__)


def print_banner(text: str):
    """Print formatted banner."""
    print()
    print("=" * 80)
    print(text)
    print("=" * 80)
    print()


def print_section(text: str):
    """Print formatted section header."""
    print()
    print(text)
    print("-" * 80)


async def main():
    """Run E2E evaluation and display results."""
    print_banner("ComponentForge: End-to-End Pipeline Evaluation")

    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ ERROR: OPENAI_API_KEY environment variable not set")
        print("   Please set it to run this evaluation:")
        print("   export OPENAI_API_KEY='your-api-key-here'")
        sys.exit(1)

    print("✅ OpenAI API key found")

    # Initialize evaluator
    print("📊 Initializing evaluator...")
    evaluator = E2EEvaluator(api_key=api_key)
    print(f"   Loaded {len(evaluator.dataset)} screenshots from golden dataset")

    # Run evaluation
    print()
    print("🚀 Running evaluation...")
    print("   This may take a few minutes (GPT-4V calls + code generation)")
    print()

    results = await evaluator.evaluate_all()

    # Display results
    print_banner("RESULTS")

    # Overall Metrics
    overall = results['overall']

    print_section("📈 OVERALL METRICS")
    print(f"   Dataset Size: {results['dataset_size']} screenshots")
    print(f"   Pipeline Success Rate: {overall['pipeline_success_rate']:.1%}")
    print(f"   Average Latency: {overall['avg_latency_ms']:.0f}ms")
    print()

    # Stage-by-Stage Metrics
    print_section("🔍 TOKEN EXTRACTION")
    token_metrics = overall['token_extraction']
    print(f"   Average Accuracy: {token_metrics['avg_accuracy']:.1%}")
    print()

    print_section("🎯 PATTERN RETRIEVAL")
    retrieval_metrics = overall['retrieval']
    print(f"   MRR (Context Precision): {retrieval_metrics['mrr']:.3f}")
    print(f"   Hit@3 (Context Recall): {retrieval_metrics['hit_at_3']:.1%}")
    print(f"   Precision@1 (Top-1 Accuracy): {retrieval_metrics['precision_at_1']:.1%}")
    print()

    print_section("💻 CODE GENERATION")
    gen_metrics = overall['generation']
    print(f"   Compilation Rate (TypeScript Validity): {gen_metrics['compilation_rate']:.1%}")
    print(f"   Average Quality Score: {gen_metrics['avg_quality_score']:.2f}")
    print(f"   Success Rate: {gen_metrics['success_rate']:.1%}")
    print()

    # Failure Analysis
    print_section("🔴 FAILURE ANALYSIS")
    failures = overall['stage_failures']
    total_failures = sum(failures.values())
    if total_failures > 0:
        print(f"   Total Failures: {total_failures}")
        print(f"   - Token Extraction: {failures['token_extraction']}")
        print(f"   - Pattern Retrieval: {failures['retrieval']}")
        print(f"   - Code Generation: {failures['generation']}")
    else:
        print("   ✅ No failures!")
    print()

    # Per-Screenshot Results
    print_section("📸 PER-SCREENSHOT RESULTS")
    for result in results['per_screenshot']:
        status = "✅" if result['pipeline_success'] else "❌"
        print(f"{status} {result['screenshot_id']}")
        print(f"      Token Accuracy: {result['token_extraction']['accuracy']:.1%}")
        print(f"      Retrieval: {'✓' if result['retrieval']['correct'] else '✗'} (expected: {result['retrieval']['expected']}, got: {result['retrieval']['retrieved']})")
        print(f"      Generation: {'✓' if result['generation']['code_compiles'] else '✗'} (quality: {result['generation']['quality_score']:.2f})")
        print(f"      Latency: {result['total_latency_ms']:.0f}ms")
        print()

    # Save report
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    report_path = Path(__file__).parent.parent / 'logs' / f'e2e_evaluation_{timestamp}.json'
    report_path.parent.mkdir(parents=True, exist_ok=True)

    with open(report_path, 'w') as f:
        json.dump(results, f, indent=2)

    print_banner("REPORT SAVED")
    print(f"📄 Full report saved to: {report_path}")
    print()

    # Summary
    success_rate = overall['pipeline_success_rate']
    if success_rate >= 0.8:
        print("✅ Evaluation PASSED (success rate >= 80%)")
        sys.exit(0)
    else:
        print(f"❌ Evaluation FAILED (success rate {success_rate:.1%} < 80%)")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
```

**Acceptance Criteria:**
- [ ] Script runs with `python backend/scripts/run_e2e_evaluation.py`
- [ ] Displays formatted metrics to stdout
- [ ] Shows per-screenshot results
- [ ] Saves JSON report to `backend/logs/e2e_evaluation_{timestamp}.json`
- [ ] Returns exit code 0 if success rate >= 80%, else 1
- [ ] Can be run without web server

---

#### Task E5: E2E Automated Test Suite
**Assignable to:** Backend Agent
**Dependencies:** E3 (E2E Evaluator)
**Estimated Time:** 3-4 hours

**Scope:**
- Create pytest test suite that runs E2E evaluation
- Validates against golden dataset
- Fails if metrics drop below thresholds

**Files to Create:**
```
backend/tests/evaluation/test_e2e_pipeline.py
```

**Technical Implementation:**

```python
"""
Automated E2E pipeline tests against golden dataset.

These tests validate the full screenshot-to-code pipeline
and fail if metrics drop below acceptable thresholds.
"""

import pytest
import os
from pathlib import Path

from src.evaluation.e2e_evaluator import E2EEvaluator


@pytest.mark.asyncio
@pytest.mark.slow  # Mark as slow test (can skip in quick test runs)
async def test_e2e_pipeline_success_rate():
    """Test that E2E pipeline success rate is above threshold."""
    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    # Run evaluation
    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Assert success rate >= 80%
    success_rate = results['overall']['pipeline_success_rate']
    assert success_rate >= 0.80, f"Pipeline success rate {success_rate:.1%} < 80%"


@pytest.mark.asyncio
@pytest.mark.slow
async def test_token_extraction_accuracy():
    """Test that token extraction accuracy is above threshold."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Assert avg token accuracy >= 85%
    accuracy = results['overall']['token_extraction']['avg_accuracy']
    assert accuracy >= 0.85, f"Token extraction accuracy {accuracy:.1%} < 85%"


@pytest.mark.asyncio
@pytest.mark.slow
async def test_retrieval_accuracy():
    """Test that pattern retrieval accuracy is above threshold."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Assert MRR >= 0.90
    mrr = results['overall']['retrieval']['mrr']
    assert mrr >= 0.90, f"Retrieval MRR {mrr:.3f} < 0.90"


@pytest.mark.asyncio
@pytest.mark.slow
async def test_code_compilation_rate():
    """Test that code compilation rate is above threshold."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Assert compilation rate >= 90%
    compilation_rate = results['overall']['generation']['compilation_rate']
    assert compilation_rate >= 0.90, f"Compilation rate {compilation_rate:.1%} < 90%"


@pytest.mark.asyncio
@pytest.mark.slow
async def test_e2e_latency():
    """Test that average E2E latency is below threshold."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Assert avg latency < 20 seconds
    latency_ms = results['overall']['avg_latency_ms']
    latency_s = latency_ms / 1000
    assert latency_s < 20.0, f"Average latency {latency_s:.1f}s >= 20s"


@pytest.mark.asyncio
@pytest.mark.slow
async def test_no_critical_failures():
    """Test that there are no critical failures (all stages pass for all screenshots)."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Check for critical failures
    for result in results['per_screenshot']:
        assert result['token_extraction']['accuracy'] > 0, \
            f"{result['screenshot_id']}: Token extraction completely failed"

        assert result['retrieval']['retrieved'] != "", \
            f"{result['screenshot_id']}: Retrieval returned no results"

        assert result['generation']['code_generated'], \
            f"{result['screenshot_id']}: Code generation produced no code"


# Run tests with: pytest backend/tests/evaluation/test_e2e_pipeline.py -v -s
# Skip slow tests: pytest -m "not slow"
```

**Acceptance Criteria:**
- [ ] Test suite validates E2E pipeline against thresholds
- [ ] Tests fail if: success rate < 80%, token accuracy < 85%, MRR < 0.90, compilation < 90%, latency > 20s
- [ ] Tests marked as `@pytest.mark.slow` (can be skipped)
- [ ] Tests skip gracefully if OPENAI_API_KEY not set
- [ ] Can be run in CI/CD with `pytest backend/tests/evaluation/ -v`

---

### Phase 2: API & Retrieval Metrics Integration (Days 4-5)

#### Task B1: Evaluation API Endpoint
**Assignable to:** Backend Agent
**Dependencies:** E3 (E2E Evaluator)
**Estimated Time:** 2-3 hours

**Scope:**
- Create FastAPI endpoint that runs E2E evaluation
- Return JSON with all metrics

**Files to Create:**
```
backend/src/api/v1/routes/evaluation.py
backend/tests/api/v1/test_evaluation_routes.py
```

**Technical Implementation:**

```python
# backend/src/api/v1/routes/evaluation.py

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import os

from ....evaluation.e2e_evaluator import E2EEvaluator
from ....core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/evaluation", tags=["evaluation"])


@router.get("/metrics")
async def get_evaluation_metrics() -> Dict[str, Any]:
    """
    Run E2E evaluation and return metrics.

    This endpoint runs the full golden dataset evaluation pipeline:
    - Token extraction accuracy
    - Pattern retrieval accuracy
    - Code generation quality
    - End-to-end pipeline success rate

    Returns:
        JSON with overall metrics and per-screenshot results

    Raises:
        HTTPException: If evaluation fails or API key not configured
    """
    logger.info("Received request for evaluation metrics")

    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY not configured"
        )

    try:
        # Run evaluation
        logger.info("Running E2E evaluation...")
        evaluator = E2EEvaluator(api_key=api_key)
        results = await evaluator.evaluate_all()

        logger.info(f"Evaluation complete. Success rate: {results['overall']['pipeline_success_rate']:.1%}")

        return results

    except Exception as e:
        logger.error(f"Evaluation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation failed: {str(e)}"
        )


@router.get("/status")
async def get_evaluation_status() -> Dict[str, Any]:
    """
    Check if evaluation system is ready.

    Returns:
        Status information about golden dataset and API key
    """
    api_key_set = bool(os.getenv("OPENAI_API_KEY"))

    try:
        from ....evaluation.golden_dataset import GoldenDataset
        dataset = GoldenDataset()
        dataset_size = len(dataset)
        dataset_loaded = True
    except Exception as e:
        dataset_size = 0
        dataset_loaded = False

    return {
        "ready": api_key_set and dataset_loaded,
        "api_key_configured": api_key_set,
        "golden_dataset_loaded": dataset_loaded,
        "golden_dataset_size": dataset_size
    }
```

**Acceptance Criteria:**
- [ ] `GET /api/v1/evaluation/metrics` returns E2E metrics
- [ ] `GET /api/v1/evaluation/status` returns system status
- [ ] Endpoint takes <10s to respond (full evaluation)
- [ ] Handles errors with 500 status code
- [ ] pytest tests with TestClient

---

#### Task B2: Retrieval-Only Evaluation Integration
**Assignable to:** Backend Agent
**Dependencies:** None (uses notebook queries)
**Estimated Time:** 2-3 hours

**Scope:**
- Port 22 test queries from notebooks
- Add retrieval-only metrics to API response

**Files to Create:**
```
backend/src/evaluation/retrieval_queries.py
backend/tests/evaluation/test_retrieval_queries.py
```

**Technical Implementation:**

```python
# backend/src/evaluation/retrieval_queries.py

"""
Retrieval-only test queries (ported from notebooks).

These queries validate the retrieval component in isolation,
complementing the E2E evaluation.
"""

from typing import List, Dict

TEST_QUERIES = [
    # Keyword-heavy queries (7)
    {"query": "Button component", "expected_pattern": "Button", "category": "keyword"},
    {"query": "Card with header and footer", "expected_pattern": "Card", "category": "keyword"},
    {"query": "Badge variant status", "expected_pattern": "Badge", "category": "keyword"},
    {"query": "Input field with placeholder", "expected_pattern": "Input", "category": "keyword"},
    {"query": "Checkbox component checked state", "expected_pattern": "Checkbox", "category": "keyword"},
    {"query": "Select dropdown options", "expected_pattern": "Select", "category": "keyword"},
    {"query": "Alert notification message", "expected_pattern": "Alert", "category": "keyword"},

    # Semantic queries (10)
    {"query": "clickable action element for user interactions", "expected_pattern": "Button", "category": "semantic"},
    {"query": "container for organizing related content in sections", "expected_pattern": "Card", "category": "semantic"},
    {"query": "visual indicator showing status or category", "expected_pattern": "Badge", "category": "semantic"},
    {"query": "text field for user to enter information", "expected_pattern": "Input", "category": "semantic"},
    {"query": "binary choice control for selecting options", "expected_pattern": "Checkbox", "category": "semantic"},
    {"query": "collapsible menu to pick from multiple choices", "expected_pattern": "Select", "category": "semantic"},
    {"query": "important message to notify users of status", "expected_pattern": "Alert", "category": "semantic"},
    {"query": "toggle control to enable or disable a feature", "expected_pattern": "Switch", "category": "semantic"},
    {"query": "mutually exclusive option selector", "expected_pattern": "Radio Group", "category": "semantic"},
    {"query": "navigation element for switching between views", "expected_pattern": "Tabs", "category": "semantic"},

    # Mixed queries (5)
    {"query": "Button component with variant prop for different styles", "expected_pattern": "Button", "category": "mixed"},
    {"query": "Card component that can have interactive elements", "expected_pattern": "Card", "category": "mixed"},
    {"query": "Switch component with onChange handler and checked state", "expected_pattern": "Switch", "category": "mixed"},
    {"query": "Radio Group for form selection with multiple options", "expected_pattern": "Radio Group", "category": "mixed"},
    {"query": "Tabs component for organizing content into panels", "expected_pattern": "Tabs", "category": "mixed"},
]


def get_queries_by_category(category: str) -> List[Dict]:
    """Filter queries by category (keyword, semantic, mixed)."""
    return [q for q in TEST_QUERIES if q['category'] == category]


def get_all_queries() -> List[Dict]:
    """Get all test queries."""
    return TEST_QUERIES
```

**Update API to include retrieval metrics:**

```python
# In backend/src/api/v1/routes/evaluation.py

@router.get("/metrics")
async def get_evaluation_metrics() -> Dict[str, Any]:
    """Run E2E + retrieval evaluation and return metrics."""

    # ... existing E2E evaluation code ...

    # Add retrieval-only evaluation
    from ....evaluation.retrieval_queries import TEST_QUERIES
    from ....services.retrieval_service import RetrievalService

    retrieval_service = RetrievalService()
    retrieval_results = []

    for query_data in TEST_QUERIES:
        query = query_data['query']
        expected = query_data['expected_pattern']

        # Run retrieval
        results = await retrieval_service.search(query, top_k=5)
        retrieved = results[0]['pattern_id'] if results else None
        correct = retrieved == expected

        retrieval_results.append({
            'query': query,
            'expected': expected,
            'retrieved': retrieved,
            'correct': correct,
            'category': query_data['category']
        })

    # Calculate retrieval metrics
    from ....evaluation.metrics import RetrievalMetrics

    retrieval_metrics = {
        'mrr': RetrievalMetrics.mean_reciprocal_rank(retrieval_results),
        'hit_at_3': RetrievalMetrics.hit_at_k(retrieval_results, k=3),
        'precision_at_1': RetrievalMetrics.precision_at_k(retrieval_results, k=1),
        'test_queries': len(TEST_QUERIES),
        'per_category': {
            'keyword': _calculate_category_metrics([r for r in retrieval_results if r['category'] == 'keyword']),
            'semantic': _calculate_category_metrics([r for r in retrieval_results if r['category'] == 'semantic']),
            'mixed': _calculate_category_metrics([r for r in retrieval_results if r['category'] == 'mixed']),
        }
    }

    # Add to results
    results['retrieval_only'] = retrieval_metrics

    return results
```

**Acceptance Criteria:**
- [ ] 22 test queries ported from notebooks
- [ ] Retrieval-only metrics added to API response
- [ ] Shows per-category breakdown (keyword, semantic, mixed)
- [ ] pytest tests validate query structure

---

### Phase 3: Dashboard & Documentation (Days 6-7)

#### Task F1: Evaluation Dashboard Page
**Assignable to:** Frontend Agent
**Dependencies:** B1 (API Endpoint)
**Estimated Time:** 4-6 hours

**Scope:**
- Create simple evaluation dashboard page
- Display E2E metrics + retrieval metrics
- Export JSON button

**Files to Create:**
```
app/src/app/evaluation/page.tsx
app/src/types/evaluation.ts
app/src/components/evaluation/MetricCard.tsx
app/src/components/evaluation/ComparisonTable.tsx
app/e2e/evaluation.spec.ts
```

**Technical Implementation:**

```tsx
// app/src/types/evaluation.ts

export interface EvaluationMetrics {
  overall: {
    pipeline_success_rate: number;
    avg_latency_ms: number;
    stage_failures: {
      token_extraction: number;
      retrieval: number;
      generation: number;
    };
    token_extraction: {
      avg_accuracy: number;
    };
    retrieval: {
      mrr: number;
      hit_at_3: number;
      precision_at_1: number;
    };
    generation: {
      compilation_rate: number;
      avg_quality_score: number;
      success_rate: number;
    };
  };
  per_screenshot: Array<{
    screenshot_id: string;
    pipeline_success: boolean;
    total_latency_ms: number;
  }>;
  retrieval_only?: {
    mrr: number;
    hit_at_3: number;
    precision_at_1: number;
    test_queries: number;
  };
  dataset_size: number;
  timestamp: string;
}
```

```tsx
// app/src/app/evaluation/page.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

async function getEvaluationMetrics() {
  const res = await fetch('http://localhost:8000/api/v1/evaluation/metrics', {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function EvaluationPage() {
  const metrics = await getEvaluationMetrics();

  if (!metrics) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Evaluation Metrics</h1>
        <Card>
          <CardContent className="py-6">
            <p className="text-red-600">Failed to load evaluation metrics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overall = metrics.overall;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Evaluation Metrics</h1>

      {/* Overall Pipeline Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="Pipeline Success Rate"
          value={overall.pipeline_success_rate}
          target={0.80}
          format="percentage"
          description="% of screenshots that produced valid code end-to-end"
        />
        <MetricCard
          label="Average Latency"
          value={overall.avg_latency_ms / 1000}
          target={20}
          format="seconds"
          description="Time from screenshot to valid code"
          inverted
        />
        <MetricCard
          label="Dataset Size"
          value={metrics.dataset_size}
          format="number"
          description="Number of test screenshots"
        />
      </div>

      {/* Stage-by-Stage Metrics */}
      <h2 className="text-2xl font-semibold mb-4">Stage-by-Stage Performance</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Token Extraction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(overall.token_extraction.avg_accuracy * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 mt-2">Average accuracy</p>
            <Badge variant={overall.token_extraction.avg_accuracy >= 0.85 ? 'success' : 'warning'}>
              Target: ≥85%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pattern Retrieval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(overall.retrieval.mrr * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 mt-2">MRR (Context Precision)</p>
            <Badge variant={overall.retrieval.mrr >= 0.90 ? 'success' : 'warning'}>
              Target: ≥90%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Code Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(overall.generation.compilation_rate * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 mt-2">Compilation rate</p>
            <Badge variant={overall.generation.compilation_rate >= 0.90 ? 'success' : 'warning'}>
              Target: ≥90%
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Retrieval-Only Comparison */}
      {metrics.retrieval_only && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Retrieval Comparison</h2>
          <ComparisonTable
            etoMetrics={overall.retrieval}
            retrievalOnlyMetrics={metrics.retrieval_only}
          />
        </>
      )}

      {/* Export Button */}
      <div className="mt-8">
        <Button
          onClick={() => {
            const blob = new Blob([JSON.stringify(metrics, null, 2)], {
              type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `evaluation_metrics_${metrics.timestamp}.json`;
            a.click();
          }}
        >
          Export Metrics (JSON)
        </Button>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Page accessible at `/evaluation`
- [ ] Displays E2E metrics (pipeline success rate, token accuracy, retrieval MRR, code compilation)
- [ ] Shows stage-by-stage breakdown
- [ ] Export JSON button downloads metrics
- [ ] Uses existing shadcn/ui components
- [ ] Playwright E2E test validates page loads

---

#### Task D1: Documentation & Demo Preparation
**Assignable to:** Any Agent
**Dependencies:** All tasks complete
**Estimated Time:** 2-3 hours

**Scope:**
- Document evaluation system usage
- Prepare demo talking points

**Files to Create/Update:**
```
backend/src/evaluation/README.md
README.md (add evaluation section)
DEMO_METRICS.md (demo day talking points)
```

**Acceptance Criteria:**
- [ ] README documents how to run evaluation script
- [ ] Evaluation README explains metrics and thresholds
- [ ] Demo talking points document with real metrics
- [ ] Screenshots captured for demo slides

**Demo Talking Points Template:**

```markdown
# ComponentForge Evaluation Metrics (Demo Day)

## Proven End-to-End Performance

ComponentForge validates the **complete screenshot-to-code pipeline** with quantified metrics:

### Pipeline Success Rate: X%
- % of screenshots that produce valid, compilable code
- Target: >80%, Achieved: X%

### Token Extraction: Y% Accuracy
- Correctly extracts design tokens (colors, spacing, typography) from screenshots
- Target: >85%, Achieved: Y%

### Pattern Retrieval: Z% Precision (MRR)
- Selects the correct component pattern for generation
- Target: >90%, Achieved: Z%
- Context Recall (Hit@3): A%

### Code Generation: B% Compilation Rate
- Generated code compiles with TypeScript
- Average quality score: C/1.0
- Target: >90% compilation, Achieved: B%

### End-to-End Latency: Dms
- Time from screenshot upload to valid code
- Target: <20s, Achieved: Ds

## RAGAS Alignment

All metrics align with industry-standard RAGAS framework:
- **Context Precision** (MRR): ✅ Z% vs target 70%
- **Context Recall** (Hit@3): ✅ A% vs target 80%
- **Faithfulness** (Compilation): ✅ B% vs target 90%
- **Answer Relevancy** (Quality Score): ✅ C vs target 0.85

## Golden Dataset

Validated against 15 real component screenshots:
- Button (3 variants)
- Card (2 variants)
- Badge, Input, Checkbox, Alert, Select

## Continuous Validation

- **Automated tests**: pytest suite catches regressions
- **API endpoint**: Real-time metrics at `/api/v1/evaluation/metrics`
- **Dashboard**: Visual metrics at `/evaluation`
- **CLI script**: `python backend/scripts/run_e2e_evaluation.py`
```

---

## Task Dependency Graph (E2E-First)

```
Phase 1: E2E Foundation
  E1 (Golden Dataset) ──┐
                        ├──→ E2 (Metrics Module) ──→ E3 (E2E Evaluator) ──┬──→ E4 (CLI Script)
                        │                                                  └──→ E5 (Test Suite)

Phase 2: API Integration
  E3 (E2E Evaluator) ──→ B1 (API Endpoint)
  Notebooks ──→ B2 (Retrieval Queries) ──→ B1 (API Endpoint)

Phase 3: Dashboard & Docs
  B1 (API Endpoint) ──→ F1 (Dashboard Page)
  All Complete ──→ D1 (Documentation)
```

**Parallel Execution:**
- E1 can start immediately (manual work)
- E2 depends on E1 completing
- E3, E4, E5 can run in parallel after E2
- B2 can run in parallel with E2/E3 (independent)
- B1 waits for E3 + B2
- F1 waits for B1
- D1 waits for all

**Timeline:**
- **Days 1-2**: E1 (golden dataset) + E2 (metrics module)
- **Day 3**: E3 (E2E evaluator) + E4 (CLI) + E5 (tests) in parallel
- **Day 4**: B1 (API) + B2 (retrieval queries)
- **Days 5-6**: F1 (dashboard)
- **Day 7**: D1 (documentation)

---

## What You Get (Final Deliverables)

### 1. Golden Dataset
- 10-15 component screenshots with ground truth
- Validates full pipeline end-to-end

### 2. E2E Evaluation System
- **Metrics at each stage**: token extraction, retrieval, generation
- **Overall metrics**: pipeline success rate, latency, stage failures
- **Per-screenshot results**: detailed debugging info

### 3. Automated Testing
- **pytest suite**: `backend/tests/evaluation/test_e2e_pipeline.py`
- **Threshold validation**: fails if metrics drop below targets
- **CI/CD ready**: can run in GitHub Actions

### 4. CLI Script
- **Command**: `python backend/scripts/run_e2e_evaluation.py`
- **Output**: formatted metrics + JSON report
- **Exit codes**: 0 if pass, 1 if fail

### 5. API Endpoint
- **Endpoint**: `GET /api/v1/evaluation/metrics`
- **Returns**: E2E metrics + retrieval-only metrics
- **Real-time**: runs evaluation on demand

### 6. Dashboard
- **URL**: `/evaluation`
- **Shows**: pipeline success rate, stage-by-stage metrics, retrieval comparison
- **Export**: JSON download for demo slides

### 7. Documentation
- Usage guides
- Demo talking points with real metrics
- Screenshots for presentation

---

## Demo Day Presentation (E2E-Focused)

**Before (Old Approach):**
> "We built a multi-agent system to convert designs to accessible components. Our retrieval achieves 91.3% precision."

**After (E2E Approach):**
> "ComponentForge successfully generates production-ready code from screenshots with **X% pipeline success rate**. Token extraction achieves **Y% accuracy**, pattern retrieval achieves **Z% precision (MRR)**, and generated code compiles **B%** of the time with an average quality score of **C/1.0**. Our end-to-end latency is **D seconds**, beating the 20-second target. All metrics exceed industry-standard RAGAS targets."

---

## Success Criteria (Final)

**Phase 1: E2E Foundation** ✅ Complete when:
- [ ] Golden dataset with 10-15 screenshots
- [ ] E2E evaluator runs full pipeline per screenshot
- [ ] CLI script displays metrics
- [ ] pytest suite validates against thresholds
- [ ] All E2E metrics exceed targets

**Phase 2: API Integration** ✅ Complete when:
- [ ] API endpoint returns E2E + retrieval metrics
- [ ] Retrieval-only queries ported from notebooks
- [ ] API response includes per-category breakdown

**Phase 3: Dashboard & Docs** ✅ Complete when:
- [ ] Dashboard displays all metrics
- [ ] Export JSON functionality works
- [ ] Documentation complete
- [ ] Demo talking points ready with real metrics

**Ready for Demo Day when:**
- [ ] Pipeline success rate >80%
- [ ] All stage metrics exceed targets
- [ ] Dashboard accessible and polished
- [ ] Metrics exported for slides
- [ ] Can demonstrate E2E validation live

---

## References

- ✅ Completed: `notebooks/evaluation/tasks_6_7_consolidated_evaluation.ipynb` (retrieval metrics)
- ✅ Completed: `notebooks/evaluation/task5_golden_dataset_rag_evaluation.ipynb` (RAG evaluation)
- ✅ Existing: `backend/tests/test_e2e_requirements.py` (E2E test pattern)
- RAGAS principles: https://docs.ragas.io/ (adapted for E2E pipeline)
- Bootcamp Week 4: Evaluation lecture notes

---

## Why E2E-First is Better

| Aspect | Retrieval-Only (Old Plan) | E2E-First (New Plan) |
|--------|---------------------------|----------------------|
| **Tests** | Text query → Pattern | Screenshot → Code |
| **Coverage** | Step 2 only (retrieval) | All 4 steps + integration |
| **Value** | Proves retrieval works | Proves full system works |
| **Risk** | Can't catch token/generation bugs | Catches bugs at every stage |
| **Demo** | "Our retrieval is 91% accurate" | "Our pipeline works X% of the time" |
| **Time** | 2-3 days | 5-7 days |
| **Confidence** | Low (untested stages) | High (full validation) |

**Bottom Line:** You need to know the full pipeline works, not just one component.
