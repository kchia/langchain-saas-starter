"""
Tests for evaluation metrics module.

Validates:
- Token extraction metrics
- Retrieval metrics (RAGAS-inspired)
- Code generation metrics
- End-to-end pipeline metrics
"""

import pytest
from src.evaluation.metrics import (
    TokenExtractionMetrics,
    RetrievalMetrics,
    GenerationMetrics,
    E2EMetrics,
)
from src.evaluation.types import (
    TokenExtractionResult,
    RetrievalResult,
    GenerationResult,
    E2EResult,
)


class TestTokenExtractionMetrics:
    """Tests for TokenExtractionMetrics."""

    def test_calculate_accuracy_perfect_match(self):
        """Test accuracy calculation with perfect token match."""
        expected = {
            'colors': {'primary': '#3B82F6', 'text': '#FFFFFF'},
            'spacing': {'padding': '12px 24px'},
        }
        extracted = {
            'colors': {'primary': '#3B82F6', 'text': '#FFFFFF'},
            'spacing': {'padding': '12px 24px'},
        }

        accuracy = TokenExtractionMetrics.calculate_accuracy(expected, extracted)
        assert accuracy == 1.0

    def test_calculate_accuracy_partial_match(self):
        """Test accuracy calculation with partial token match."""
        expected = {
            'colors': {'primary': '#3B82F6', 'text': '#FFFFFF'},
            'spacing': {'padding': '12px 24px'},
        }
        extracted = {
            'colors': {'primary': '#3B82F6'},  # Missing text color
            'spacing': {'padding': '12px 24px'},
        }

        accuracy = TokenExtractionMetrics.calculate_accuracy(expected, extracted)
        assert accuracy == 2/3  # 2 out of 3 tokens correct

    def test_calculate_accuracy_no_match(self):
        """Test accuracy calculation with no token match."""
        expected = {
            'colors': {'primary': '#3B82F6'},
        }
        extracted = {
            'colors': {'primary': '#000000'},  # Wrong value
        }

        accuracy = TokenExtractionMetrics.calculate_accuracy(expected, extracted)
        assert accuracy == 0.0

    def test_calculate_accuracy_empty_extracted(self):
        """Test accuracy calculation with no extracted tokens."""
        expected = {
            'colors': {'primary': '#3B82F6'},
        }
        extracted = {}

        accuracy = TokenExtractionMetrics.calculate_accuracy(expected, extracted)
        assert accuracy == 0.0

    def test_calculate_accuracy_empty_expected(self):
        """Test accuracy calculation with no expected tokens."""
        expected = {}
        extracted = {
            'colors': {'primary': '#3B82F6'},
        }

        accuracy = TokenExtractionMetrics.calculate_accuracy(expected, extracted)
        assert accuracy == 0.0

    def test_find_missing_tokens(self):
        """Test finding missing tokens."""
        expected = {
            'colors': {'primary': '#3B82F6', 'text': '#FFFFFF'},
            'spacing': {'padding': '12px 24px'},
        }
        extracted = {
            'colors': {'primary': '#3B82F6'},  # Missing text
            # Missing spacing entirely
        }

        missing = TokenExtractionMetrics.find_missing_tokens(expected, extracted)
        assert 'colors.text' in missing
        assert 'spacing.padding' in missing
        assert len(missing) == 2

    def test_find_missing_tokens_none_missing(self):
        """Test finding missing tokens when none are missing."""
        expected = {
            'colors': {'primary': '#3B82F6'},
        }
        extracted = {
            'colors': {'primary': '#3B82F6', 'text': '#FFFFFF'},
        }

        missing = TokenExtractionMetrics.find_missing_tokens(expected, extracted)
        assert len(missing) == 0

    def test_find_incorrect_tokens(self):
        """Test finding tokens with incorrect values."""
        expected = {
            'colors': {'primary': '#3B82F6', 'text': '#FFFFFF'},
        }
        extracted = {
            'colors': {'primary': '#000000', 'text': '#FFFFFF'},  # Wrong primary
        }

        incorrect = TokenExtractionMetrics.find_incorrect_tokens(expected, extracted)
        assert 'colors.primary' in incorrect
        assert 'colors.text' not in incorrect
        assert len(incorrect) == 1


class TestRetrievalMetrics:
    """Tests for RetrievalMetrics (RAGAS-inspired)."""

    def test_mean_reciprocal_rank_perfect(self):
        """Test MRR with all top-1 results."""
        results = [
            RetrievalResult('test1', 'button', 'button', True, 1, 0.95),
            RetrievalResult('test2', 'card', 'card', True, 1, 0.93),
            RetrievalResult('test3', 'badge', 'badge', True, 1, 0.91),
        ]

        mrr = RetrievalMetrics.mean_reciprocal_rank(results)
        assert mrr == 1.0

    def test_mean_reciprocal_rank_mixed(self):
        """Test MRR with mixed ranks."""
        results = [
            RetrievalResult('test1', 'button', 'button', True, 1, 0.95),  # 1/1 = 1.0
            RetrievalResult('test2', 'card', 'card', True, 2, 0.85),      # 1/2 = 0.5
            RetrievalResult('test3', 'badge', 'wrong', False, 999, 0.60),  # 0
        ]

        mrr = RetrievalMetrics.mean_reciprocal_rank(results)
        expected = (1.0 + 0.5 + 0.0) / 3
        assert mrr == pytest.approx(expected)

    def test_mean_reciprocal_rank_empty(self):
        """Test MRR with empty results."""
        results = []
        mrr = RetrievalMetrics.mean_reciprocal_rank(results)
        assert mrr == 0.0

    def test_hit_at_k_all_hits(self):
        """Test Hit@3 with all results in top-3."""
        results = [
            RetrievalResult('test1', 'button', 'button', True, 1, 0.95),
            RetrievalResult('test2', 'card', 'card', True, 2, 0.85),
            RetrievalResult('test3', 'badge', 'badge', True, 3, 0.75),
        ]

        hit_at_3 = RetrievalMetrics.hit_at_k(results, k=3)
        assert hit_at_3 == 1.0

    def test_hit_at_k_partial_hits(self):
        """Test Hit@3 with some results outside top-3."""
        results = [
            RetrievalResult('test1', 'button', 'button', True, 1, 0.95),
            RetrievalResult('test2', 'card', 'card', True, 2, 0.85),
            RetrievalResult('test3', 'badge', 'badge', True, 5, 0.55),  # Outside top-3
        ]

        hit_at_3 = RetrievalMetrics.hit_at_k(results, k=3)
        assert hit_at_3 == pytest.approx(2/3)

    def test_hit_at_k_empty(self):
        """Test Hit@K with empty results."""
        results = []
        hit_at_3 = RetrievalMetrics.hit_at_k(results, k=3)
        assert hit_at_3 == 0.0

    def test_precision_at_1_perfect(self):
        """Test Precision@1 with all top-1 correct."""
        results = [
            RetrievalResult('test1', 'button', 'button', True, 1, 0.95),
            RetrievalResult('test2', 'card', 'card', True, 1, 0.93),
        ]

        p_at_1 = RetrievalMetrics.precision_at_k(results, k=1)
        assert p_at_1 == 1.0

    def test_precision_at_1_mixed(self):
        """Test Precision@1 with mixed results."""
        results = [
            RetrievalResult('test1', 'button', 'button', True, 1, 0.95),
            RetrievalResult('test2', 'card', 'card', True, 2, 0.85),  # Not rank 1
        ]

        p_at_1 = RetrievalMetrics.precision_at_k(results, k=1)
        assert p_at_1 == 0.5


class TestGenerationMetrics:
    """Tests for GenerationMetrics."""

    def test_compilation_rate_all_compile(self):
        """Test compilation rate with all code compiling."""
        results = [
            GenerationResult('test1', True, True, 0.95, [], 1500.0),
            GenerationResult('test2', True, True, 0.92, [], 1600.0),
        ]

        rate = GenerationMetrics.compilation_rate(results)
        assert rate == 1.0

    def test_compilation_rate_partial_compile(self):
        """Test compilation rate with some code not compiling."""
        results = [
            GenerationResult('test1', True, True, 0.95, [], 1500.0),
            GenerationResult('test2', True, False, 0.0, ['Syntax error'], 1600.0),
        ]

        rate = GenerationMetrics.compilation_rate(results)
        assert rate == 0.5

    def test_compilation_rate_empty(self):
        """Test compilation rate with empty results."""
        results = []
        rate = GenerationMetrics.compilation_rate(results)
        assert rate == 0.0

    def test_avg_quality_score(self):
        """Test average quality score calculation."""
        results = [
            GenerationResult('test1', True, True, 0.9, [], 1500.0),
            GenerationResult('test2', True, True, 0.8, [], 1600.0),
        ]

        avg_score = GenerationMetrics.avg_quality_score(results)
        assert avg_score == 0.85

    def test_avg_quality_score_ignores_not_generated(self):
        """Test that quality score ignores results where code wasn't generated."""
        results = [
            GenerationResult('test1', True, True, 0.9, [], 1500.0),
            GenerationResult('test2', False, False, 0.0, ['Failed to generate'], 100.0),
        ]

        avg_score = GenerationMetrics.avg_quality_score(results)
        assert avg_score == 0.9

    def test_generation_success_rate(self):
        """Test generation success rate."""
        results = [
            GenerationResult('test1', True, True, 0.9, [], 1500.0),
            GenerationResult('test2', False, False, 0.0, ['Failed'], 100.0),
            GenerationResult('test3', True, False, 0.5, ['Syntax error'], 1600.0),
        ]

        rate = GenerationMetrics.generation_success_rate(results)
        assert rate == pytest.approx(2/3)

    def test_avg_generation_time(self):
        """Test average generation time calculation."""
        results = [
            GenerationResult('test1', True, True, 0.9, [], 1500.0),
            GenerationResult('test2', True, True, 0.8, [], 2500.0),
        ]

        avg_time = GenerationMetrics.avg_generation_time(results)
        assert avg_time == 2000.0


class TestE2EMetrics:
    """Tests for E2EMetrics."""

    def setup_method(self):
        """Set up test fixtures."""
        self.e2e_results = [
            E2EResult(
                screenshot_id='test1',
                token_extraction=TokenExtractionResult(
                    'test1', {}, {}, 0.9, [], []
                ),
                retrieval=RetrievalResult(
                    'test1', 'button', 'button', True, 1, 0.95
                ),
                generation=GenerationResult(
                    'test1', True, True, 0.9, [], 1500.0
                ),
                pipeline_success=True,
                total_latency_ms=3000.0
            ),
            E2EResult(
                screenshot_id='test2',
                token_extraction=TokenExtractionResult(
                    'test2', {}, {}, 0.75, [], []  # Low accuracy
                ),
                retrieval=RetrievalResult(
                    'test2', 'card', 'wrong', False, 999, 0.60
                ),
                generation=GenerationResult(
                    'test2', True, False, 0.5, ['Error'], 1600.0
                ),
                pipeline_success=False,
                total_latency_ms=3500.0
            ),
        ]

    def test_pipeline_success_rate(self):
        """Test pipeline success rate calculation."""
        rate = E2EMetrics.pipeline_success_rate(self.e2e_results)
        assert rate == 0.5

    def test_pipeline_success_rate_empty(self):
        """Test pipeline success rate with empty results."""
        rate = E2EMetrics.pipeline_success_rate([])
        assert rate == 0.0

    def test_avg_latency(self):
        """Test average latency calculation."""
        latency = E2EMetrics.avg_latency_ms(self.e2e_results)
        assert latency == 3250.0  # (3000 + 3500) / 2

    def test_stage_failure_analysis(self):
        """Test stage failure analysis."""
        failures = E2EMetrics.stage_failure_analysis(self.e2e_results)

        # test2 failed in all stages
        assert failures['token_extraction'] == 1  # accuracy < 0.8
        assert failures['retrieval'] == 1         # wrong pattern
        assert failures['generation'] == 1        # doesn't compile

    def test_stage_failure_analysis_no_failures(self):
        """Test stage failure analysis with no failures."""
        successful_result = E2EResult(
            screenshot_id='test1',
            token_extraction=TokenExtractionResult(
                'test1', {}, {}, 0.95, [], []
            ),
            retrieval=RetrievalResult(
                'test1', 'button', 'button', True, 1, 0.95
            ),
            generation=GenerationResult(
                'test1', True, True, 0.9, [], 1500.0
            ),
            pipeline_success=True,
            total_latency_ms=3000.0
        )

        failures = E2EMetrics.stage_failure_analysis([successful_result])
        assert failures['token_extraction'] == 0
        assert failures['retrieval'] == 0
        assert failures['generation'] == 0

    def test_calculate_overall_metrics(self):
        """Test overall metrics calculation."""
        metrics = E2EMetrics.calculate_overall_metrics(self.e2e_results)

        # Verify structure
        assert 'pipeline_success_rate' in metrics
        assert 'avg_latency_ms' in metrics
        assert 'stage_failures' in metrics
        assert 'token_extraction' in metrics
        assert 'retrieval' in metrics
        assert 'generation' in metrics

        # Verify values
        assert metrics['pipeline_success_rate'] == 0.5
        assert metrics['avg_latency_ms'] == 3250.0
        assert metrics['token_extraction']['avg_accuracy'] == pytest.approx(0.825)

    def test_calculate_overall_metrics_empty(self):
        """Test overall metrics with empty results."""
        metrics = E2EMetrics.calculate_overall_metrics([])
        assert metrics == {}
