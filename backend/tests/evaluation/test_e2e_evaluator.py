"""
Tests for E2E pipeline evaluator.

Validates:
- E2E evaluator initialization
- Single screenshot evaluation
- Full dataset evaluation
- Service integration
- Error handling
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from pathlib import Path
from PIL import Image

from src.evaluation.e2e_evaluator import E2EEvaluator
from src.evaluation.types import E2EResult


class TestE2EEvaluator:
    """Tests for E2EEvaluator class."""

    @pytest.fixture
    def mock_services(self):
        """Create mocked services."""
        with patch('src.evaluation.e2e_evaluator.TokenExtractor') as mock_token, \
             patch('src.evaluation.e2e_evaluator.RetrievalService') as mock_retrieval, \
             patch('src.evaluation.e2e_evaluator.GeneratorService') as mock_generator:

            # Mock token extractor
            mock_token_instance = Mock()
            mock_token_instance.extract_tokens = AsyncMock(return_value={
                'tokens': {
                    'colors': {'primary': '#3B82F6', 'text': '#FFFFFF'},
                    'spacing': {'padding': '12px 24px'},
                }
            })
            mock_token.return_value = mock_token_instance

            # Mock retrieval service
            mock_retrieval_instance = Mock()
            mock_retrieval_instance.search = AsyncMock(return_value=[
                {'pattern_id': 'button', 'score': 0.95},
                {'pattern_id': 'card', 'score': 0.75},
            ])
            mock_retrieval.return_value = mock_retrieval_instance

            # Mock generator service
            mock_generator_instance = Mock()
            mock_result = Mock()
            mock_result.success = True
            mock_result.validation_results = Mock()
            mock_result.validation_results.typescript_passed = True
            mock_result.validation_results.overall_score = 90
            mock_result.validation_results.typescript_errors = []
            mock_result.validation_results.eslint_errors = []
            mock_generator_instance.generate = AsyncMock(return_value=mock_result)
            mock_generator.return_value = mock_generator_instance

            yield {
                'token': mock_token_instance,
                'retrieval': mock_retrieval_instance,
                'generator': mock_generator_instance,
            }

    @pytest.mark.asyncio
    async def test_init_with_real_dataset(self):
        """Test initialization with real golden dataset."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        evaluator = E2EEvaluator(
            golden_dataset_path=dataset_path,
            api_key="test-key"
        )

        assert len(evaluator.dataset) >= 5
        assert evaluator.token_extractor is not None
        assert evaluator.retrieval_service is not None
        assert evaluator.generator_service is not None

    @pytest.mark.asyncio
    async def test_evaluate_single_success(self, mock_services):
        """Test evaluating a single screenshot successfully."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        evaluator = E2EEvaluator(
            golden_dataset_path=dataset_path,
            api_key="test-key"
        )

        # Get first sample
        sample = evaluator.dataset[0]

        # Evaluate single sample
        result = await evaluator.evaluate_single(sample)

        # Verify result structure
        assert isinstance(result, E2EResult)
        assert result.screenshot_id == sample['id']
        assert result.total_latency_ms > 0

        # Verify all stages completed
        assert result.token_extraction is not None
        assert result.retrieval is not None
        assert result.generation is not None

    @pytest.mark.asyncio
    async def test_evaluate_single_token_extraction(self, mock_services):
        """Test token extraction stage evaluation."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        evaluator = E2EEvaluator(
            golden_dataset_path=dataset_path,
            api_key="test-key"
        )

        sample = evaluator.dataset[0]
        result = await evaluator.evaluate_single(sample)

        # Verify token extraction result
        token_result = result.token_extraction
        assert token_result.screenshot_id == sample['id']
        assert 0.0 <= token_result.accuracy <= 1.0
        assert isinstance(token_result.missing_tokens, list)
        assert isinstance(token_result.incorrect_tokens, list)

    @pytest.mark.asyncio
    async def test_evaluate_single_retrieval(self, mock_services):
        """Test retrieval stage evaluation."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        evaluator = E2EEvaluator(
            golden_dataset_path=dataset_path,
            api_key="test-key"
        )

        sample = evaluator.dataset[0]
        result = await evaluator.evaluate_single(sample)

        # Verify retrieval result
        retrieval_result = result.retrieval
        assert retrieval_result.screenshot_id == sample['id']
        assert retrieval_result.expected_pattern_id == sample['ground_truth']['expected_pattern_id']
        assert retrieval_result.retrieved_pattern_id is not None
        assert retrieval_result.rank >= 1

    @pytest.mark.asyncio
    async def test_evaluate_single_generation(self, mock_services):
        """Test generation stage evaluation."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        evaluator = E2EEvaluator(
            golden_dataset_path=dataset_path,
            api_key="test-key"
        )

        sample = evaluator.dataset[0]
        result = await evaluator.evaluate_single(sample)

        # Verify generation result
        gen_result = result.generation
        assert gen_result.screenshot_id == sample['id']
        assert isinstance(gen_result.code_generated, bool)
        assert isinstance(gen_result.code_compiles, bool)
        assert 0.0 <= gen_result.quality_score <= 1.0
        assert gen_result.generation_time_ms >= 0

    @pytest.mark.asyncio
    async def test_evaluate_all(self, mock_services):
        """Test evaluating all samples in dataset."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        evaluator = E2EEvaluator(
            golden_dataset_path=dataset_path,
            api_key="test-key"
        )

        # Limit to 2 samples for faster testing
        # In production, would evaluate all samples
        original_len = len(evaluator.dataset._samples)
        evaluator.dataset._samples = evaluator.dataset._samples[:2]

        results = await evaluator.evaluate_all()

        # Restore original samples
        evaluator.dataset._samples = evaluator.dataset._samples[:original_len]

        # Verify results structure
        assert 'overall' in results
        assert 'per_screenshot' in results
        assert 'dataset_size' in results
        assert 'timestamp' in results

        # Verify overall metrics
        overall = results['overall']
        assert 'pipeline_success_rate' in overall
        assert 'avg_latency_ms' in overall
        assert 'token_extraction' in overall
        assert 'retrieval' in overall
        assert 'generation' in overall

        # Verify per-screenshot results
        assert len(results['per_screenshot']) == 2

    @pytest.mark.asyncio
    async def test_pipeline_success_determination(self, mock_services):
        """Test that pipeline_success is calculated correctly."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        evaluator = E2EEvaluator(
            golden_dataset_path=dataset_path,
            api_key="test-key"
        )

        sample = evaluator.dataset[0]
        result = await evaluator.evaluate_single(sample)

        # Pipeline succeeds if:
        # - Token accuracy > 0.8
        # - Retrieval correct
        # - Code compiles
        expected_success = (
            result.token_extraction.accuracy > 0.8 and
            result.retrieval.correct and
            result.generation.code_compiles
        )

        assert result.pipeline_success == expected_success

    @pytest.mark.asyncio
    async def test_error_handling_no_image(self, mock_services):
        """Test error handling when image is missing."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        evaluator = E2EEvaluator(
            golden_dataset_path=dataset_path,
            api_key="test-key"
        )

        # Create sample with no image
        sample = {
            'id': 'test_no_image',
            'image': None,
            'ground_truth': {
                'expected_tokens': {'colors': {'primary': '#3B82F6'}},
                'expected_pattern_id': 'button',
            }
        }

        result = await evaluator.evaluate_single(sample)

        # Should complete without crashing
        assert result.screenshot_id == 'test_no_image'
        # Token accuracy will be 0 since no tokens extracted
        assert result.token_extraction.accuracy == 0.0

    @pytest.mark.asyncio
    async def test_result_to_dict(self, mock_services):
        """Test converting E2EResult to dictionary."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        evaluator = E2EEvaluator(
            golden_dataset_path=dataset_path,
            api_key="test-key"
        )

        sample = evaluator.dataset[0]
        result = await evaluator.evaluate_single(sample)

        # Convert to dict
        result_dict = evaluator._result_to_dict(result)

        # Verify structure
        assert 'screenshot_id' in result_dict
        assert 'pipeline_success' in result_dict
        assert 'total_latency_ms' in result_dict
        assert 'token_extraction' in result_dict
        assert 'retrieval' in result_dict
        assert 'generation' in result_dict

        # Verify all values are JSON-serializable
        import json
        json_str = json.dumps(result_dict)
        assert json_str is not None
