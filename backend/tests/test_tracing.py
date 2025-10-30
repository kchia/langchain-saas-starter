"""Tests for LangSmith tracing configuration."""

import os
import pytest
from unittest.mock import patch

from src.core.tracing import (
    TracingConfig,
    get_tracing_config,
    init_tracing,
    get_trace_url,
    build_trace_metadata,
    get_current_run_id,
)
from src.api.middleware.session_tracking import session_id_var


class TestTracingConfig:
    """Tests for TracingConfig class."""

    def test_tracing_disabled_by_default(self):
        """Test that tracing is disabled by default."""
        with patch.dict(os.environ, {}, clear=True):
            config = TracingConfig()
            assert config.enabled is False
            assert config.is_configured() is False

    def test_tracing_enabled_with_env_vars(self):
        """Test that tracing is enabled with proper environment variables."""
        with patch.dict(
            os.environ,
            {
                "LANGCHAIN_TRACING_V2": "true",
                "LANGCHAIN_API_KEY": "test-api-key",
                "LANGCHAIN_PROJECT": "test-project",
            },
        ):
            config = TracingConfig()
            assert config.enabled is True
            assert config.api_key == "test-api-key"
            assert config.project == "test-project"
            assert config.is_configured() is True

    def test_tracing_enabled_but_no_api_key(self):
        """Test that tracing is not considered configured without API key."""
        with patch.dict(
            os.environ,
            {"LANGCHAIN_TRACING_V2": "true"},
            clear=True,
        ):
            config = TracingConfig()
            assert config.enabled is True
            assert config.is_configured() is False

    def test_default_project_name(self):
        """Test that default project name is used when not specified."""
        with patch.dict(
            os.environ,
            {
                "LANGCHAIN_TRACING_V2": "true",
                "LANGCHAIN_API_KEY": "test-key",
            },
            clear=True,
        ):
            config = TracingConfig()
            assert config.project == "componentforge-dev"

    def test_custom_endpoint(self):
        """Test that custom endpoint can be configured."""
        custom_endpoint = "https://custom.langchain.com"
        with patch.dict(
            os.environ,
            {
                "LANGCHAIN_TRACING_V2": "true",
                "LANGCHAIN_API_KEY": "test-key",
                "LANGCHAIN_ENDPOINT": custom_endpoint,
            },
        ):
            config = TracingConfig()
            assert config.endpoint == custom_endpoint

    def test_get_config_dict(self):
        """Test that get_config returns proper dictionary."""
        with patch.dict(
            os.environ,
            {
                "LANGCHAIN_TRACING_V2": "true",
                "LANGCHAIN_API_KEY": "test-key",
                "LANGCHAIN_PROJECT": "test-project",
            },
        ):
            config = TracingConfig()
            config_dict = config.get_config()

            assert config_dict["enabled"] is True
            assert config_dict["project"] == "test-project"
            assert config_dict["api_key_set"] is True
            assert "endpoint" in config_dict


class TestTracingInitialization:
    """Tests for tracing initialization functions."""

    def test_init_tracing_not_configured(self, caplog):
        """Test init_tracing when tracing is not configured."""
        with patch.dict(os.environ, {}, clear=True):
            # Reset the global config to test fresh initialization
            import src.core.tracing as tracing_module
            tracing_module._tracing_config = None
            
            result = init_tracing()
            assert result is False
            assert "not configured" in caplog.text.lower()

    def test_init_tracing_configured(self):
        """Test init_tracing when properly configured."""
        test_env = {
            "LANGCHAIN_TRACING_V2": "true",
            "LANGCHAIN_API_KEY": "test-key",
            "LANGCHAIN_PROJECT": "test-project",
        }

        with patch.dict(os.environ, test_env, clear=True):
            # Reset the global config
            import src.core.tracing as tracing_module

            tracing_module._tracing_config = None

            result = init_tracing()
            assert result is True

    def test_get_tracing_config_singleton(self):
        """Test that get_tracing_config returns same instance."""
        config1 = get_tracing_config()
        config2 = get_tracing_config()
        assert config1 is config2


class TestTraceURL:
    """Tests for trace URL generation."""

    def test_get_trace_url(self):
        """Test that trace URL is properly formatted."""
        with patch.dict(
            os.environ,
            {
                "LANGCHAIN_TRACING_V2": "true",
                "LANGCHAIN_API_KEY": "test-key",
                "LANGCHAIN_PROJECT": "my-project",
            },
        ):
            # Reset config
            import src.core.tracing as tracing_module

            tracing_module._tracing_config = None

            run_id = "12345-abcde"
            url = get_trace_url(run_id)

            assert "smith.langchain.com" in url
            assert "my-project" in url
            assert run_id in url
            assert url.startswith("https://")


class TestTracedDecorator:
    """Tests for the @traced decorator."""

    @pytest.mark.asyncio
    async def test_traced_decorator_async_without_tracing(self):
        """Test traced decorator on async function when tracing disabled."""
        from src.core.tracing import traced

        @traced()
        async def sample_async_function():
            return "async result"

        with patch.dict(os.environ, {}, clear=True):
            # Reset config
            import src.core.tracing as tracing_module

            tracing_module._tracing_config = None

            result = await sample_async_function()
            assert result == "async result"

    def test_traced_decorator_sync_without_tracing(self):
        """Test traced decorator on sync function when tracing disabled."""
        from src.core.tracing import traced

        @traced()
        def sample_sync_function():
            return "sync result"

        with patch.dict(os.environ, {}, clear=True):
            # Reset config
            import src.core.tracing as tracing_module

            tracing_module._tracing_config = None

            result = sample_sync_function()
            assert result == "sync result"

    @pytest.mark.asyncio
    async def test_traced_decorator_with_metadata(self):
        """Test traced decorator accepts metadata parameter."""
        from src.core.tracing import traced

        test_metadata = {"component_type": "button", "user_id": "user-123"}

        @traced(run_name="test_function", metadata=test_metadata)
        async def sample_function():
            return "result"

        with patch.dict(os.environ, {}, clear=True):
            # Reset config
            import src.core.tracing as tracing_module

            tracing_module._tracing_config = None

            result = await sample_function()
            assert result == "result"


class TestBuildTraceMetadata:
    """Tests for build_trace_metadata function."""

    def test_build_trace_metadata_basic(self):
        """Test that build_trace_metadata includes timestamp."""
        metadata = build_trace_metadata()

        assert "timestamp" in metadata
        assert isinstance(metadata["timestamp"], str)

    def test_build_trace_metadata_with_session_id(self):
        """Test that build_trace_metadata includes session_id from context."""
        test_session_id = "test-session-123"
        session_id_var.set(test_session_id)

        metadata = build_trace_metadata()

        assert "session_id" in metadata
        assert metadata["session_id"] == test_session_id

    def test_build_trace_metadata_with_user_id(self):
        """Test that build_trace_metadata includes user_id when provided."""
        metadata = build_trace_metadata(user_id="user-456")

        assert "user_id" in metadata
        assert metadata["user_id"] == "user-456"

    def test_build_trace_metadata_with_component_type(self):
        """Test that build_trace_metadata includes component_type when provided."""
        metadata = build_trace_metadata(component_type="button")

        assert "component_type" in metadata
        assert metadata["component_type"] == "button"

    def test_build_trace_metadata_with_extra_fields(self):
        """Test that build_trace_metadata includes extra fields."""
        metadata = build_trace_metadata(
            user_id="user-123",
            component_type="card",
            custom_field="custom_value",
            another_field=42,
        )

        assert metadata["user_id"] == "user-123"
        assert metadata["component_type"] == "card"
        assert metadata["custom_field"] == "custom_value"
        assert metadata["another_field"] == 42
        assert "timestamp" in metadata


class TestGetCurrentRunId:
    """Tests for get_current_run_id function."""

    def test_get_current_run_id_returns_none_without_context(self):
        """Test that get_current_run_id returns None when no run context exists."""
        run_id = get_current_run_id()
        assert run_id is None
