"""Integration tests for library statistics endpoint."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock, patch
from src.main import app


class TestLibraryStatsEndpoint:
    """Integration tests for GET /api/v1/retrieval/library/stats endpoint."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_service(self):
        """Create mock retrieval service."""
        service = MagicMock()
        service.get_library_stats.return_value = {
            "total_patterns": 10,
            "component_types": ["Button", "Card", "Input", "Select", "Badge"],
            "categories": ["form", "layout", "data-display"],
            "frameworks": ["react"],
            "libraries": ["shadcn/ui", "radix-ui"],
            "total_variants": 45,
            "total_props": 120,
        }
        return service

    def test_library_stats_success(self, client, mock_service):
        """Test successful library stats retrieval."""
        # Mock app state
        app.state.retrieval_service = mock_service

        response = client.get("/api/v1/retrieval/library/stats")

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "total_patterns" in data
        assert "component_types" in data
        assert "categories" in data
        assert "frameworks" in data
        assert "libraries" in data
        assert "total_variants" in data
        assert "total_props" in data

        # Verify data
        assert data["total_patterns"] == 10
        assert "Button" in data["component_types"]
        assert "react" in data["frameworks"]

    def test_library_stats_with_metrics(self, client, mock_service):
        """Test library stats including quality metrics."""
        app.state.retrieval_service = mock_service

        # Mock get_library_quality_metrics
        with patch("src.api.v1.routes.retrieval.get_library_quality_metrics") as mock_metrics:
            mock_metrics.return_value = {
                "mrr": 0.85,
                "hit_at_3": 0.92,
                "last_evaluated": "2025-10-06T14:30:00Z"
            }

            response = client.get("/api/v1/retrieval/library/stats")

            assert response.status_code == 200
            data = response.json()

            # Verify metrics included
            assert "metrics" in data
            assert data["metrics"]["mrr"] == 0.85
            assert data["metrics"]["hit_at_3"] == 0.92

    def test_library_stats_without_metrics(self, client, mock_service):
        """Test library stats when no metrics available."""
        app.state.retrieval_service = mock_service

        # Mock get_library_quality_metrics returning None
        with patch("src.api.v1.routes.retrieval.get_library_quality_metrics") as mock_metrics:
            mock_metrics.return_value = None

            response = client.get("/api/v1/retrieval/library/stats")

            assert response.status_code == 200
            data = response.json()

            # Metrics should not be in response or be None
            assert data.get("metrics") is None

    def test_library_stats_service_unavailable(self, client):
        """Test 503 error when service not initialized."""
        # Clear app state
        if hasattr(app.state, "retrieval_service"):
            delattr(app.state, "retrieval_service")

        response = client.get("/api/v1/retrieval/library/stats")

        assert response.status_code == 503
        data = response.json()
        assert "Retrieval service not initialized" in data["detail"]

    def test_library_stats_empty_patterns(self, client):
        """Test with service that has no patterns."""
        mock_service = MagicMock()
        mock_service.get_library_stats.return_value = {
            "total_patterns": 0,
            "component_types": [],
            "categories": [],
            "frameworks": [],
            "libraries": [],
            "total_variants": 0,
            "total_props": 0,
        }
        app.state.retrieval_service = mock_service

        response = client.get("/api/v1/retrieval/library/stats")

        assert response.status_code == 200
        data = response.json()
        assert data["total_patterns"] == 0
        assert len(data["component_types"]) == 0

    def test_library_stats_response_schema(self, client, mock_service):
        """Test response matches LibraryStatsResponse schema."""
        app.state.retrieval_service = mock_service

        response = client.get("/api/v1/retrieval/library/stats")

        assert response.status_code == 200
        data = response.json()

        # Verify all required fields are present and correct types
        assert isinstance(data["total_patterns"], int)
        assert isinstance(data["component_types"], list)
        assert isinstance(data["categories"], list)
        assert isinstance(data["frameworks"], list)
        assert isinstance(data["libraries"], list)
        assert isinstance(data["total_variants"], int)
        assert isinstance(data["total_props"], int)

        # Optional metrics
        if "metrics" in data and data["metrics"] is not None:
            assert isinstance(data["metrics"], dict)

    def test_library_stats_error_handling(self, client):
        """Test 500 error when service raises exception."""
        mock_service = MagicMock()
        mock_service.get_library_stats.side_effect = Exception("Internal error")
        app.state.retrieval_service = mock_service

        response = client.get("/api/v1/retrieval/library/stats")

        assert response.status_code == 500
        data = response.json()
        assert "Failed to retrieve library statistics" in data["detail"]

    def test_library_stats_performance(self, client, mock_service):
        """Test that endpoint responds quickly."""
        app.state.retrieval_service = mock_service

        import time
        start = time.time()
        response = client.get("/api/v1/retrieval/library/stats")
        duration_ms = (time.time() - start) * 1000

        assert response.status_code == 200
        # Should respond in less than 100ms (sync operation)
        assert duration_ms < 100
