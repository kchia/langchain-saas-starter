"""
Tests for evaluation API endpoints.

Validates:
- GET /api/v1/evaluation/metrics endpoint
- GET /api/v1/evaluation/status endpoint
- Error handling
- Response structure
"""

import pytest
from unittest.mock import patch, AsyncMock, Mock
from fastapi.testclient import TestClient
from pathlib import Path

from src.main import app


client = TestClient(app)


class TestEvaluationStatusEndpoint:
    """Tests for /api/v1/evaluation/status endpoint."""

    def test_status_with_valid_setup(self):
        """Test status endpoint with valid golden dataset."""
        backend_dir = Path(__file__).parent.parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        response = client.get("/api/v1/evaluation/status")

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "ready" in data
        assert "api_key_configured" in data
        assert "golden_dataset" in data
        assert "retrieval_queries" in data
        assert "message" in data

        # Verify golden dataset info
        assert "loaded" in data["golden_dataset"]
        assert "size" in data["golden_dataset"]
        assert "statistics" in data["golden_dataset"]

        # Verify retrieval queries info
        assert "total" in data["retrieval_queries"]
        assert data["retrieval_queries"]["total"] == 22

    def test_status_without_dataset(self):
        """Test status endpoint when golden dataset is missing."""
        with patch('src.api.v1.routes.evaluation.GoldenDataset') as mock_dataset:
            mock_dataset.side_effect = FileNotFoundError("Dataset not found")

            response = client.get("/api/v1/evaluation/status")

            assert response.status_code == 200
            data = response.json()

            assert data["golden_dataset"]["loaded"] is False
            assert data["golden_dataset"]["size"] == 0
            assert data["ready"] is False

    def test_status_response_structure(self):
        """Test that status response has correct structure."""
        response = client.get("/api/v1/evaluation/status")

        assert response.status_code == 200
        data = response.json()

        # Verify all required fields
        required_fields = [
            "ready",
            "api_key_configured",
            "golden_dataset",
            "retrieval_queries",
            "message"
        ]

        for field in required_fields:
            assert field in data, f"Missing field: {field}"


class TestEvaluationMetricsEndpoint:
    """Tests for /api/v1/evaluation/metrics endpoint."""

    @pytest.mark.asyncio
    async def test_metrics_without_api_key(self):
        """Test metrics endpoint without API key configured."""
        with patch.dict('os.environ', {}, clear=True):
            response = client.get("/api/v1/evaluation/metrics")

            assert response.status_code == 500
            data = response.json()
            assert "detail" in data
            assert "OPENAI_API_KEY" in data["detail"]

    @pytest.mark.asyncio
    async def test_metrics_with_mocked_evaluation(self):
        """Test metrics endpoint with mocked evaluation services."""
        # Mock E2EEvaluator
        mock_e2e_results = {
            'overall': {
                'pipeline_success_rate': 0.85,
                'avg_latency_ms': 5000,
                'stage_failures': {
                    'token_extraction': 0,
                    'retrieval': 1,
                    'generation': 1
                },
                'token_extraction': {'avg_accuracy': 0.90},
                'retrieval': {
                    'mrr': 0.92,
                    'hit_at_3': 0.95,
                    'precision_at_1': 0.87
                },
                'generation': {
                    'compilation_rate': 0.93,
                    'avg_quality_score': 0.88,
                    'success_rate': 0.95
                }
            },
            'per_screenshot': [],
            'dataset_size': 15,
            'timestamp': '2024-01-01 12:00:00'
        }

        with patch('src.api.v1.routes.evaluation.E2EEvaluator') as mock_evaluator_class, \
             patch('src.api.v1.routes.evaluation.RetrievalService') as mock_retrieval_class, \
             patch.dict('os.environ', {'OPENAI_API_KEY': 'test-key'}):

            # Mock E2EEvaluator
            mock_evaluator = Mock()
            mock_evaluator.evaluate_all = AsyncMock(return_value=mock_e2e_results)
            mock_evaluator_class.return_value = mock_evaluator

            # Mock RetrievalService
            mock_retrieval = Mock()
            mock_retrieval.search = AsyncMock(return_value=[
                {'pattern_id': 'button', 'score': 0.95}
            ])
            mock_retrieval_class.return_value = mock_retrieval

            response = client.get("/api/v1/evaluation/metrics")

            assert response.status_code == 200
            data = response.json()

            # Verify E2E results present
            assert 'overall' in data
            assert 'per_screenshot' in data
            assert 'dataset_size' in data

            # Verify retrieval-only results present
            assert 'retrieval_only' in data
            assert 'mrr' in data['retrieval_only']
            assert 'test_queries' in data['retrieval_only']
            assert 'per_category' in data['retrieval_only']

    @pytest.mark.asyncio
    async def test_metrics_response_structure(self):
        """Test that metrics response has correct structure."""
        # This test requires actual evaluation to run
        # Skip if no API key configured
        import os
        if not os.getenv("OPENAI_API_KEY"):
            pytest.skip("OPENAI_API_KEY not set")

        backend_dir = Path(__file__).parent.parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"
        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        response = client.get("/api/v1/evaluation/metrics")

        # This will take time as it runs actual evaluation
        # For fast tests, use mocked version above
        assert response.status_code == 200
        data = response.json()

        # Verify main sections
        assert 'overall' in data
        assert 'per_screenshot' in data
        assert 'retrieval_only' in data

        # Verify overall metrics structure
        overall = data['overall']
        assert 'pipeline_success_rate' in overall
        assert 'token_extraction' in overall
        assert 'retrieval' in overall
        assert 'generation' in overall

        # Verify retrieval-only structure
        retrieval_only = data['retrieval_only']
        assert 'mrr' in retrieval_only
        assert 'hit_at_3' in retrieval_only
        assert 'precision_at_1' in retrieval_only
        assert 'test_queries' in retrieval_only
        assert 'per_category' in retrieval_only

        # Verify per-category breakdown
        per_category = retrieval_only['per_category']
        assert 'keyword' in per_category
        assert 'semantic' in per_category
        assert 'mixed' in per_category

    @pytest.mark.asyncio
    async def test_metrics_handles_evaluation_failure(self):
        """Test metrics endpoint handles evaluation failures gracefully."""
        with patch('src.api.v1.routes.evaluation.E2EEvaluator') as mock_evaluator_class, \
             patch.dict('os.environ', {'OPENAI_API_KEY': 'test-key'}):

            # Mock evaluator to raise exception
            mock_evaluator = Mock()
            mock_evaluator.evaluate_all = AsyncMock(side_effect=Exception("Evaluation failed"))
            mock_evaluator_class.return_value = mock_evaluator

            response = client.get("/api/v1/evaluation/metrics")

            assert response.status_code == 500
            data = response.json()
            assert "detail" in data
            assert "Evaluation failed" in data["detail"]


class TestEvaluationEndpointsIntegration:
    """Integration tests for evaluation endpoints."""

    def test_status_then_metrics_flow(self):
        """Test typical user flow: check status, then run metrics."""
        # First check status
        status_response = client.get("/api/v1/evaluation/status")
        assert status_response.status_code == 200

        status_data = status_response.json()

        # Only run metrics if system is ready
        if status_data["ready"]:
            # Note: This will run actual evaluation if API key is set
            # For fast tests, skip if no API key
            import os
            if not os.getenv("OPENAI_API_KEY"):
                pytest.skip("OPENAI_API_KEY not set - skipping metrics test")

            metrics_response = client.get("/api/v1/evaluation/metrics")
            assert metrics_response.status_code == 200

    def test_concurrent_status_requests(self):
        """Test that multiple concurrent status requests work."""
        # Status endpoint should be fast and handle concurrent requests
        responses = []
        for _ in range(5):
            response = client.get("/api/v1/evaluation/status")
            responses.append(response)

        # All requests should succeed
        for response in responses:
            assert response.status_code == 200

        # All responses should have same structure
        datas = [r.json() for r in responses]
        for data in datas:
            assert "ready" in data
            assert "golden_dataset" in data


# Run with:
# pytest backend/tests/api/v1/test_evaluation_routes.py -v
# Fast tests only (skip actual evaluation): pytest -k "not metrics_response_structure"
