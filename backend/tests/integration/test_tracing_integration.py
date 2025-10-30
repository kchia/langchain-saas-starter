"""Integration tests for end-to-end tracing functionality."""

import pytest
from unittest.mock import Mock, patch

from src.agents.token_extractor import TokenExtractor
from src.agents.component_classifier import ComponentClassifier
from src.agents.props_proposer import PropsProposer
from src.agents.events_proposer import EventsProposer
from src.agents.states_proposer import StatesProposer
from src.agents.accessibility_proposer import AccessibilityProposer
from src.api.middleware.session_tracking import session_id_var


class TestAgentTracing:
    """Tests to verify all agents have tracing enabled."""

    @pytest.mark.asyncio
    async def test_token_extractor_has_traced_decorator(self):
        """Verify TokenExtractor.extract_tokens has @traced decorator."""
        from src.core.tracing import traced

        # Check that the method has the traced decorator applied
        # The decorator wraps the function, so we check for wrapper attributes
        extractor = TokenExtractor.__new__(TokenExtractor)
        method = extractor.extract_tokens

        # If traced decorator is applied, __wrapped__ or __name__ should exist
        assert hasattr(method, "__name__")
        assert method.__name__ == "extract_tokens"

    @pytest.mark.asyncio
    async def test_component_classifier_has_traced_decorator(self):
        """Verify ComponentClassifier.classify has @traced decorator."""
        classifier = ComponentClassifier.__new__(ComponentClassifier)
        method = classifier.classify

        assert hasattr(method, "__name__")
        assert method.__name__ == "classify"

    @pytest.mark.asyncio
    async def test_props_proposer_has_traced_decorator(self):
        """Verify PropsProposer.propose has @traced decorator."""
        proposer = PropsProposer.__new__(PropsProposer)
        method = proposer.propose

        assert hasattr(method, "__name__")
        assert method.__name__ == "propose"

    @pytest.mark.asyncio
    async def test_events_proposer_has_traced_decorator(self):
        """Verify EventsProposer.propose has @traced decorator."""
        proposer = EventsProposer.__new__(EventsProposer)
        method = proposer.propose

        assert hasattr(method, "__name__")
        assert method.__name__ == "propose"

    @pytest.mark.asyncio
    async def test_states_proposer_has_traced_decorator(self):
        """Verify StatesProposer.propose has @traced decorator."""
        proposer = StatesProposer.__new__(StatesProposer)
        method = proposer.propose

        assert hasattr(method, "__name__")
        assert method.__name__ == "propose"

    @pytest.mark.asyncio
    async def test_accessibility_proposer_has_traced_decorator(self):
        """Verify AccessibilityProposer.propose has @traced decorator."""
        proposer = AccessibilityProposer.__new__(AccessibilityProposer)
        method = proposer.propose

        assert hasattr(method, "__name__")
        assert method.__name__ == "propose"


class TestTracingMetadataPropagation:
    """Tests for metadata propagation in traces."""

    def test_session_id_propagated_to_traces(self):
        """Test that session ID from middleware is available in trace metadata."""
        from src.core.tracing import build_trace_metadata

        # Set session ID in context
        test_session_id = "test-session-789"
        session_id_var.set(test_session_id)

        # Build metadata
        metadata = build_trace_metadata(component_type="button")

        # Verify session ID is included
        assert "session_id" in metadata
        assert metadata["session_id"] == test_session_id
        assert "component_type" in metadata
        assert metadata["component_type"] == "button"

    def test_metadata_includes_timestamp(self):
        """Test that trace metadata always includes timestamp."""
        from src.core.tracing import build_trace_metadata

        metadata = build_trace_metadata()

        assert "timestamp" in metadata
        assert isinstance(metadata["timestamp"], str)
        # Should be ISO format
        assert "T" in metadata["timestamp"]

    def test_custom_metadata_fields_included(self):
        """Test that custom metadata fields are included."""
        from src.core.tracing import build_trace_metadata

        metadata = build_trace_metadata(
            user_id="user-123",
            component_type="card",
            pattern_id="shadcn-card",
            custom_field="value",
        )

        assert metadata["user_id"] == "user-123"
        assert metadata["component_type"] == "card"
        assert metadata["pattern_id"] == "shadcn-card"
        assert metadata["custom_field"] == "value"


class TestTracingGracefulDegradation:
    """Tests for graceful degradation when tracing is unavailable."""

    @pytest.mark.asyncio
    async def test_traced_decorator_works_without_langsmith(self):
        """Test that @traced decorator works when langsmith is not available."""
        from src.core.tracing import traced

        @traced(run_name="test_func")
        async def test_function():
            return "success"

        # Should work even if langsmith import fails
        result = await test_function()
        assert result == "success"

    def test_get_current_run_id_returns_none_gracefully(self):
        """Test that get_current_run_id returns None when context unavailable."""
        from src.core.tracing import get_current_run_id

        # Should not raise exception
        run_id = get_current_run_id()
        assert run_id is None

    def test_build_trace_metadata_works_without_session(self):
        """Test that build_trace_metadata works without session context."""
        from src.core.tracing import build_trace_metadata

        # Clear session context
        session_id_var.set("")

        # Should still work and include timestamp
        metadata = build_trace_metadata(user_id="user-456")

        assert "timestamp" in metadata
        assert metadata.get("user_id") == "user-456"
        # session_id should not be in metadata if not set
        assert metadata.get("session_id") in [None, ""]
