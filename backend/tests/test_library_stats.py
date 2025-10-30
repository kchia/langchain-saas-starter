"""Tests for library statistics functionality."""

import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime, timezone
from src.services.retrieval_service import RetrievalService, get_library_quality_metrics
from src.core.models import EvaluationRun


class TestLibraryStats:
    """Test suite for get_library_stats() method."""

    def test_get_library_stats_with_patterns(self):
        """Test library stats computation with valid patterns."""
        patterns = [
            {
                "id": "shadcn-button",
                "name": "Button",
                "category": "form",
                "framework": "react",
                "library": "shadcn/ui",
                "metadata": {
                    "variants": [{"name": "primary"}, {"name": "secondary"}],
                    "props": [{"name": "size"}, {"name": "variant"}]
                }
            },
            {
                "id": "shadcn-card",
                "name": "Card",
                "category": "layout",
                "framework": "react",
                "library": "shadcn/ui",
                "metadata": {
                    "variants": [{"name": "outlined"}, {"name": "elevated"}],
                    "props": [{"name": "variant"}]
                }
            }
        ]

        service = RetrievalService(patterns=patterns)
        stats = service.get_library_stats()

        assert stats["total_patterns"] == 2
        assert "Button" in stats["component_types"]
        assert "Card" in stats["component_types"]
        assert "form" in stats["categories"]
        assert "layout" in stats["categories"]
        assert "react" in stats["frameworks"]
        assert "shadcn/ui" in stats["libraries"]
        assert stats["total_variants"] == 4  # 2 + 2
        assert stats["total_props"] == 3     # 2 + 1

    def test_get_library_stats_empty_patterns(self):
        """Test library stats with empty patterns list."""
        service = RetrievalService(patterns=[])
        stats = service.get_library_stats()

        assert stats["total_patterns"] == 0
        assert stats["component_types"] == []
        assert stats["categories"] == []
        assert stats["frameworks"] == []
        assert stats["libraries"] == []
        assert stats["total_variants"] == 0
        assert stats["total_props"] == 0

    def test_get_library_stats_missing_metadata(self):
        """Test library stats with patterns missing metadata."""
        patterns = [
            {
                "id": "shadcn-input",
                "name": "Input",
                "category": "form",
                # No metadata field
            }
        ]

        service = RetrievalService(patterns=patterns)
        stats = service.get_library_stats()

        assert stats["total_patterns"] == 1
        assert "Input" in stats["component_types"]
        assert stats["total_variants"] == 0
        assert stats["total_props"] == 0

    def test_get_library_stats_props_as_dict(self):
        """Test library stats when props is a dict instead of list."""
        patterns = [
            {
                "id": "shadcn-select",
                "name": "Select",
                "metadata": {
                    "props": {
                        "size": {"type": "string"},
                        "variant": {"type": "string"}
                    }
                }
            }
        ]

        service = RetrievalService(patterns=patterns)
        stats = service.get_library_stats()

        assert stats["total_props"] == 2  # Should count dict keys

    def test_get_library_stats_unique_values(self):
        """Test that duplicate values are deduplicated."""
        patterns = [
            {"id": "shadcn-button-1", "name": "Button", "category": "form", "framework": "react"},
            {"id": "shadcn-input", "name": "Input", "category": "form", "framework": "react"},
            {"id": "shadcn-button-2", "name": "Button", "category": "form", "framework": "react"},  # Duplicate
        ]

        service = RetrievalService(patterns=patterns)
        stats = service.get_library_stats()

        # Should have unique component types
        assert len(stats["component_types"]) == 2
        assert set(stats["component_types"]) == {"Button", "Input"}

        # Should have one category and framework
        assert len(stats["categories"]) == 1
        assert len(stats["frameworks"]) == 1

    def test_get_library_stats_sorted_output(self):
        """Test that output lists are sorted alphabetically."""
        patterns = [
            {"id": "shadcn-zebra", "name": "Zebra"},
            {"id": "shadcn-apple", "name": "Apple"},
            {"id": "shadcn-banana", "name": "Banana"},
        ]

        service = RetrievalService(patterns=patterns)
        stats = service.get_library_stats()

        assert stats["component_types"] == ["Apple", "Banana", "Zebra"]


@pytest.mark.asyncio
class TestLibraryQualityMetrics:
    """Test suite for get_library_quality_metrics() function."""

    async def test_get_quality_metrics_success(self):
        """Test fetching quality metrics from database."""
        # Mock database session
        mock_db = AsyncMock()

        # Create mock evaluation run
        mock_eval = MagicMock(spec=EvaluationRun)
        mock_eval.metrics = {"mrr": 0.85, "hit_at_3": 0.92}
        mock_eval.completed_at = datetime(2025, 10, 6, 14, 30, 0, tzinfo=timezone.utc)

        # Mock query result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_eval
        mock_db.execute.return_value = mock_result

        metrics = await get_library_quality_metrics(mock_db)

        assert metrics is not None
        assert metrics["mrr"] == 0.85
        assert metrics["hit_at_3"] == 0.92
        assert metrics["last_evaluated"] == "2025-10-06T14:30:00+00:00"

    async def test_get_quality_metrics_no_data(self):
        """Test when no evaluation runs exist."""
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        metrics = await get_library_quality_metrics(mock_db)

        assert metrics is None

    async def test_get_quality_metrics_no_metrics_field(self):
        """Test when evaluation run exists but has no metrics."""
        mock_db = AsyncMock()

        mock_eval = MagicMock(spec=EvaluationRun)
        mock_eval.metrics = None
        mock_eval.completed_at = datetime.now(timezone.utc)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_eval
        mock_db.execute.return_value = mock_result

        metrics = await get_library_quality_metrics(mock_db)

        assert metrics is None

    async def test_get_quality_metrics_custom_evaluation_type(self):
        """Test filtering by custom evaluation type."""
        mock_db = AsyncMock()

        mock_eval = MagicMock(spec=EvaluationRun)
        mock_eval.metrics = {"mrr": 0.75}
        mock_eval.completed_at = datetime.now(timezone.utc)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_eval
        mock_db.execute.return_value = mock_result

        metrics = await get_library_quality_metrics(mock_db, evaluation_type="pattern_retrieval")

        assert metrics is not None
        # Verify the query was called (we can't easily verify the WHERE clause in mock)
        mock_db.execute.assert_called_once()

    async def test_get_quality_metrics_handles_exception(self):
        """Test error handling when database query fails."""
        mock_db = AsyncMock()
        mock_db.execute.side_effect = Exception("Database connection failed")

        metrics = await get_library_quality_metrics(mock_db)

        # Should return None and log warning (not raise exception)
        assert metrics is None
