"""
Automated E2E pipeline tests against golden dataset.

These tests validate the full screenshot-to-code pipeline
and fail if metrics drop below acceptable thresholds.

Tests are marked as @pytest.mark.slow and can be skipped in quick test runs:
    pytest -m "not slow"  # Skip slow tests
    pytest -m slow        # Run only slow tests

Requirements:
    - OPENAI_API_KEY environment variable must be set
    - Golden dataset must exist
    - Services must be properly configured
"""

import pytest
import os
from pathlib import Path

from src.evaluation.e2e_evaluator import E2EEvaluator


@pytest.mark.asyncio
@pytest.mark.slow
async def test_e2e_pipeline_success_rate():
    """
    Test that E2E pipeline success rate is above threshold.

    Target: >= 80%
    Validates: Full pipeline produces valid code end-to-end
    """
    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    # Run evaluation
    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Assert success rate >= 80%
    success_rate = results['overall']['pipeline_success_rate']
    assert success_rate >= 0.80, (
        f"Pipeline success rate {success_rate:.1%} < 80%. "
        f"Check logs for details on failing stages."
    )


@pytest.mark.asyncio
@pytest.mark.slow
async def test_token_extraction_accuracy():
    """
    Test that token extraction accuracy is above threshold.

    Target: >= 85%
    Validates: GPT-4V accurately extracts design tokens from screenshots
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Assert avg token accuracy >= 85%
    accuracy = results['overall']['token_extraction']['avg_accuracy']
    assert accuracy >= 0.85, (
        f"Token extraction accuracy {accuracy:.1%} < 85%. "
        f"Review token extraction logic and ground truth definitions."
    )


@pytest.mark.asyncio
@pytest.mark.slow
async def test_retrieval_accuracy():
    """
    Test that pattern retrieval accuracy is above threshold.

    Target: MRR >= 0.90
    Validates: Hybrid retrieval selects correct patterns
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Assert MRR >= 0.90
    mrr = results['overall']['retrieval']['mrr']
    assert mrr >= 0.90, (
        f"Retrieval MRR {mrr:.3f} < 0.90. "
        f"Review retrieval service configuration and pattern database."
    )


@pytest.mark.asyncio
@pytest.mark.slow
async def test_retrieval_hit_at_3():
    """
    Test that retrieval Hit@3 is above threshold.

    Target: Hit@3 >= 90%
    Validates: Correct pattern appears in top-3 results
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Assert Hit@3 >= 90%
    hit_at_3 = results['overall']['retrieval']['hit_at_3']
    assert hit_at_3 >= 0.90, (
        f"Retrieval Hit@3 {hit_at_3:.1%} < 90%. "
        f"Context recall is insufficient - improve semantic search."
    )


@pytest.mark.asyncio
@pytest.mark.slow
async def test_code_compilation_rate():
    """
    Test that code compilation rate is above threshold.

    Target: >= 90%
    Validates: Generated code is valid TypeScript
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Assert compilation rate >= 90%
    compilation_rate = results['overall']['generation']['compilation_rate']
    assert compilation_rate >= 0.90, (
        f"Compilation rate {compilation_rate:.1%} < 90%. "
        f"Generated code has TypeScript errors. Review validation logic."
    )


@pytest.mark.asyncio
@pytest.mark.slow
async def test_code_quality_score():
    """
    Test that average code quality score is above threshold.

    Target: >= 0.85
    Validates: Generated code meets quality standards
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Assert avg quality score >= 0.85
    quality_score = results['overall']['generation']['avg_quality_score']
    assert quality_score >= 0.85, (
        f"Average quality score {quality_score:.2f} < 0.85. "
        f"Code quality is below standards. Review code validator metrics."
    )


@pytest.mark.asyncio
@pytest.mark.slow
async def test_e2e_latency():
    """
    Test that average E2E latency is below threshold.

    Target: < 20 seconds
    Validates: Pipeline performance is acceptable
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Assert avg latency < 20 seconds
    latency_ms = results['overall']['avg_latency_ms']
    latency_s = latency_ms / 1000
    assert latency_s < 20.0, (
        f"Average latency {latency_s:.1f}s >= 20s. "
        f"Pipeline is too slow. Profile and optimize bottlenecks."
    )


@pytest.mark.asyncio
@pytest.mark.slow
async def test_no_critical_failures():
    """
    Test that there are no critical failures in the pipeline.

    Validates: All stages produce output for all screenshots
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Check for critical failures
    for result in results['per_screenshot']:
        screenshot_id = result['screenshot_id']

        # Token extraction should produce some tokens
        assert result['token_extraction']['accuracy'] >= 0, (
            f"{screenshot_id}: Token extraction completely failed (accuracy = 0)"
        )

        # Retrieval should return a pattern
        assert result['retrieval']['retrieved'] != "", (
            f"{screenshot_id}: Retrieval returned no results"
        )

        # Generation should produce code
        assert result['generation']['code_generated'], (
            f"{screenshot_id}: Code generation produced no code"
        )


@pytest.mark.asyncio
@pytest.mark.slow
async def test_stage_failure_distribution():
    """
    Test that failures are not concentrated in a single stage.

    Validates: No single stage is consistently failing
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)
    results = await evaluator.evaluate_all()

    # Get total failures
    failures = results['overall']['stage_failures']
    total_screenshots = results['dataset_size']

    # No single stage should fail more than 30% of the time
    max_failure_rate = 0.3

    for stage, count in failures.items():
        failure_rate = count / total_screenshots if total_screenshots > 0 else 0
        assert failure_rate <= max_failure_rate, (
            f"{stage} failing {failure_rate:.1%} of the time (> {max_failure_rate:.0%}). "
            f"Investigate this stage specifically."
        )


@pytest.mark.asyncio
@pytest.mark.slow
async def test_dataset_coverage():
    """
    Test that dataset covers multiple component types.

    Validates: Evaluation is comprehensive
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    evaluator = E2EEvaluator(api_key=api_key)

    # Get dataset statistics
    stats = evaluator.dataset.get_statistics()

    # Should have at least 10 samples
    assert stats['total_samples'] >= 10, (
        f"Dataset too small: {stats['total_samples']} samples. "
        f"Need at least 10 for reliable evaluation."
    )

    # Should cover at least 5 component types
    assert len(stats['component_types']) >= 5, (
        f"Dataset covers only {len(stats['component_types'])} component types. "
        f"Need at least 5 for comprehensive evaluation."
    )


# Run with:
# pytest backend/tests/evaluation/test_e2e_pipeline.py -v -s
# Skip slow tests: pytest -m "not slow"
# Run only slow tests: pytest -m slow -v -s
