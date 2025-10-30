"""
Evaluation metrics for E2E pipeline evaluation.

This module provides metrics calculations for:
- Token extraction accuracy
- Pattern retrieval quality (RAGAS-inspired: MRR, Hit@K, Precision@K)
- Code generation quality
- End-to-end pipeline performance
"""

from typing import List, Dict, Any
from .types import (
    TokenExtractionResult,
    RetrievalResult,
    GenerationResult,
    E2EResult
)


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
        
        Excludes unmappable tokens (e.g., dimensions) from calculation.

        Args:
            expected: Ground truth tokens from golden dataset
            extracted: Tokens extracted by GPT-4V (normalized)

        Returns:
            Accuracy score (0.0-1.0)
        """
        total_tokens = 0
        correct_tokens = 0

        # Exclude dimensions category (not extractable from vision)
        mappable_categories = ['colors', 'spacing', 'typography', 'border']
        
        for category in mappable_categories:
            if category in expected:
                expected_cat = expected[category]
                extracted_cat = extracted.get(category, {})

                for key, value in expected_cat.items():
                    total_tokens += 1
                    if key in extracted_cat and extracted_cat[key] == value:
                        correct_tokens += 1

        return correct_tokens / total_tokens if total_tokens > 0 else 0.0

    @staticmethod
    def find_missing_tokens(
        expected: Dict[str, Any],
        extracted: Dict[str, Any]
    ) -> List[str]:
        """
        Find tokens present in ground truth but not extracted.

        Args:
            expected: Ground truth tokens
            extracted: Extracted tokens

        Returns:
            List of missing token paths (e.g., ["colors.primary", "spacing.padding"])
        """
        missing = []
        for category in expected:
            for key in expected[category]:
                if key not in extracted.get(category, {}):
                    missing.append(f"{category}.{key}")
        return missing

    @staticmethod
    def find_incorrect_tokens(
        expected: Dict[str, Any],
        extracted: Dict[str, Any]
    ) -> List[str]:
        """
        Find tokens extracted with incorrect values.

        Args:
            expected: Ground truth tokens
            extracted: Extracted tokens

        Returns:
            List of incorrect token paths
        """
        incorrect = []
        for category in expected:
            for key, value in expected[category].items():
                extracted_value = extracted.get(category, {}).get(key)
                if extracted_value is not None and extracted_value != value:
                    incorrect.append(f"{category}.{key}")
        return incorrect


class RetrievalMetrics:
    """
    RAGAS-inspired retrieval metrics (ported from notebooks).

    Metrics align with RAGAS framework:
    - MRR (Mean Reciprocal Rank) = Context Precision
    - Hit@K = Context Recall
    - Precision@K = Answer Relevancy
    """

    @staticmethod
    def mean_reciprocal_rank(results: List[RetrievalResult]) -> float:
        """
        Context Precision: MRR of first correct pattern.

        Args:
            results: List of retrieval results

        Returns:
            MRR score (0.0-1.0), higher is better
        """
        if not results:
            return 0.0

        reciprocal_ranks = []
        for result in results:
            if result.correct:
                reciprocal_ranks.append(1.0 / result.rank)
            else:
                reciprocal_ranks.append(0.0)

        return sum(reciprocal_ranks) / len(reciprocal_ranks)

    @staticmethod
    def hit_at_k(results: List[RetrievalResult], k: int = 3) -> float:
        """
        Context Recall: % of queries with correct pattern in top-K.

        Args:
            results: List of retrieval results
            k: Top-K threshold (default: 3)

        Returns:
            Hit@K score (0.0-1.0)
        """
        if not results:
            return 0.0

        hits = sum(1 for r in results if r.correct and r.rank <= k)
        return hits / len(results)

    @staticmethod
    def precision_at_k(results: List[RetrievalResult], k: int = 1) -> float:
        """
        Answer Relevancy: % of queries with correct pattern at position K.

        Args:
            results: List of retrieval results
            k: Position to check (default: 1 for top result)

        Returns:
            Precision@K score (0.0-1.0)
        """
        if not results:
            return 0.0

        correct = sum(1 for r in results if r.correct and r.rank == k)
        return correct / len(results)


class GenerationMetrics:
    """Code generation quality metrics."""

    @staticmethod
    def compilation_rate(results: List[GenerationResult]) -> float:
        """
        % of generated code that compiles (TypeScript validity).

        Args:
            results: List of generation results

        Returns:
            Compilation rate (0.0-1.0)
        """
        if not results:
            return 0.0

        compiled = sum(1 for r in results if r.code_compiles)
        return compiled / len(results)

    @staticmethod
    def avg_quality_score(results: List[GenerationResult]) -> float:
        """
        Average quality score from code validator.

        Args:
            results: List of generation results

        Returns:
            Average quality score (0.0-1.0)
        """
        scores = [r.quality_score for r in results if r.code_generated]
        return sum(scores) / len(scores) if scores else 0.0

    @staticmethod
    def generation_success_rate(results: List[GenerationResult]) -> float:
        """
        % of attempts that produced code.

        Args:
            results: List of generation results

        Returns:
            Success rate (0.0-1.0)
        """
        if not results:
            return 0.0

        successful = sum(1 for r in results if r.code_generated)
        return successful / len(results)

    @staticmethod
    def avg_generation_time(results: List[GenerationResult]) -> float:
        """
        Average code generation time in milliseconds.

        Args:
            results: List of generation results

        Returns:
            Average generation time (ms)
        """
        if not results:
            return 0.0

        times = [r.generation_time_ms for r in results if r.code_generated]
        return sum(times) / len(times) if times else 0.0


class E2EMetrics:
    """End-to-end pipeline metrics."""

    @staticmethod
    def pipeline_success_rate(results: List[E2EResult]) -> float:
        """
        % of screenshots that produced valid code end-to-end.

        Args:
            results: List of E2E results

        Returns:
            Success rate (0.0-1.0)
        """
        if not results:
            return 0.0

        successful = sum(1 for r in results if r.pipeline_success)
        return successful / len(results)

    @staticmethod
    def avg_latency_ms(results: List[E2EResult]) -> float:
        """
        Average end-to-end latency in milliseconds.

        Args:
            results: List of E2E results

        Returns:
            Average latency (ms)
        """
        if not results:
            return 0.0

        latencies = [r.total_latency_ms for r in results]
        return sum(latencies) / len(latencies)

    @staticmethod
    def stage_failure_analysis(results: List[E2EResult]) -> Dict[str, int]:
        """
        Count failures by stage.

        Args:
            results: List of E2E results

        Returns:
            Dictionary with failure counts per stage
        """
        failures = {
            'token_extraction': 0,
            'retrieval': 0,
            'generation': 0
        }

        for r in results:
            if not r.pipeline_success:
                # Token extraction failed if accuracy < 80%
                if r.token_extraction.accuracy < 0.8:
                    failures['token_extraction'] += 1
                # Retrieval failed if wrong pattern
                if not r.retrieval.correct:
                    failures['retrieval'] += 1
                # Generation failed if code doesn't compile
                if not r.generation.code_compiles:
                    failures['generation'] += 1

        return failures

    @staticmethod
    def calculate_overall_metrics(results: List[E2EResult]) -> Dict[str, Any]:
        """
        Calculate all metrics from E2E results.

        Args:
            results: List of E2E results

        Returns:
            Dictionary with all metrics
        """
        if not results:
            return {}

        token_results = [r.token_extraction for r in results]
        retrieval_results = [r.retrieval for r in results]
        generation_results = [r.generation for r in results]

        return {
            'pipeline_success_rate': E2EMetrics.pipeline_success_rate(results),
            'avg_latency_ms': E2EMetrics.avg_latency_ms(results),
            'stage_failures': E2EMetrics.stage_failure_analysis(results),

            'token_extraction': {
                'avg_accuracy': sum(r.accuracy for r in token_results) / len(token_results),
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
                'avg_generation_time_ms': GenerationMetrics.avg_generation_time(generation_results),
            }
        }
