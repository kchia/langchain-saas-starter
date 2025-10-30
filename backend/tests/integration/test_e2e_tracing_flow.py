"""End-to-end integration tests for complete tracing flow.

Epic 004: LangSmith Observability - Integration Testing (INT-2)

This test suite validates:
- Complete tracing flow from API request to response
- Session tracking through middleware
- Trace URL generation and inclusion in API responses
- Metadata propagation from backend to frontend
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from src.main import app
from src.core.tracing import get_trace_url, get_current_run_id
from src.api.middleware.session_tracking import get_session_id


class TestEndToEndTracingFlow:
    """End-to-end tests for complete tracing flow."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)

    def test_generation_response_includes_session_id(self, client):
        """Verify generation API returns session_id in response.
        
        INT-2: Validate session tracking flows from middleware to API response.
        """
        # Mock the generator service to avoid actual LLM calls
        with patch('src.api.v1.routes.generation.generator_service') as mock_service:
            # Create a mock response
            mock_result = MagicMock()
            mock_result.success = True
            mock_result.component_code = "export const Button = () => <button>Click</button>;"
            mock_result.stories_code = "export default { title: 'Button' };"
            mock_result.files = {}
            mock_result.metadata = MagicMock()
            mock_result.metadata.token_count = 100
            mock_result.metadata.lines_of_code = 10
            mock_result.metadata.requirements_implemented = 3
            mock_result.metadata.imports_count = 2
            mock_result.metadata.has_typescript_errors = False
            mock_result.metadata.has_accessibility_warnings = False
            mock_result.metadata.latency_ms = 1000
            mock_result.metadata.stage_latencies = {"generating": 1000}
            mock_result.validation_results = None
            mock_result.error = None
            
            mock_service.generate.return_value = mock_result
            
            # Mock code sanitizer
            with patch('src.api.v1.routes.generation.code_sanitizer') as mock_sanitizer:
                mock_sanitization = MagicMock()
                mock_sanitization.is_safe = True
                mock_sanitization.issues_count = 0
                mock_sanitization.critical_count = 0
                mock_sanitization.high_count = 0
                mock_sanitization.issues = []
                mock_sanitizer.sanitize.return_value = mock_sanitization
                
                # Make generation request
                response = client.post("/api/v1/generation/generate", json={
                    "pattern_id": "shadcn-button",
                    "tokens": {
                        "primary": "#007bff",
                        "borderRadius": "4px",
                        "fontSize": "14px",
                        "padding": "8px 16px"
                    },
                    "requirements": []
                })
        
        # Verify response
        assert response.status_code == 200
        data = response.json()
        
        # Verify session_id is in response body
        assert "metadata" in data
        assert "session_id" in data["metadata"]
        assert data["metadata"]["session_id"] is not None
        assert len(data["metadata"]["session_id"]) > 0
        
        # Verify session_id is in response headers
        assert "X-Session-ID" in response.headers
        assert response.headers["X-Session-ID"] == data["metadata"]["session_id"]

    def test_generation_response_includes_trace_url_when_available(self, client):
        """Verify generation API includes trace_url when tracing is enabled.
        
        INT-2: Validate trace URL generation and inclusion in API responses.
        """
        # Mock the generator service
        with patch('src.api.v1.routes.generation.generator_service') as mock_service:
            mock_result = MagicMock()
            mock_result.success = True
            mock_result.component_code = "export const Button = () => <button>Click</button>;"
            mock_result.stories_code = "export default { title: 'Button' };"
            mock_result.files = {}
            mock_result.metadata = MagicMock()
            mock_result.metadata.token_count = 100
            mock_result.metadata.lines_of_code = 10
            mock_result.metadata.requirements_implemented = 3
            mock_result.metadata.imports_count = 2
            mock_result.metadata.has_typescript_errors = False
            mock_result.metadata.has_accessibility_warnings = False
            mock_result.metadata.latency_ms = 1000
            mock_result.metadata.stage_latencies = {"generating": 1000}
            mock_result.validation_results = None
            mock_result.error = None
            
            mock_service.generate.return_value = mock_result
            
            # Mock code sanitizer
            with patch('src.api.v1.routes.generation.code_sanitizer') as mock_sanitizer:
                mock_sanitization = MagicMock()
                mock_sanitization.is_safe = True
                mock_sanitization.issues_count = 0
                mock_sanitization.critical_count = 0
                mock_sanitization.high_count = 0
                mock_sanitization.issues = []
                mock_sanitizer.sanitize.return_value = mock_sanitization
                
                # Mock get_current_run_id to simulate tracing being active
                with patch('src.api.v1.routes.generation.get_current_run_id') as mock_run_id:
                    # Simulate a trace run ID
                    mock_run_id.return_value = "12345-abcde-67890-test"
                    
                    # Make generation request
                    response = client.post("/api/v1/generation/generate", json={
                        "pattern_id": "shadcn-button",
                        "tokens": {
                            "primary": "#007bff",
                            "borderRadius": "4px"
                        },
                        "requirements": []
                    })
        
        # Verify response
        assert response.status_code == 200
        data = response.json()
        
        # Verify trace_url is in response
        assert "metadata" in data
        assert "trace_url" in data["metadata"]
        assert data["metadata"]["trace_url"] is not None
        
        # Verify trace_url format (should contain LangSmith URL)
        trace_url = data["metadata"]["trace_url"]
        assert "smith.langchain.com" in trace_url
        assert "12345-abcde-67890-test" in trace_url
        assert "/projects/p/" in trace_url

    def test_generation_handles_missing_trace_url_gracefully(self, client):
        """Verify generation API handles missing trace_url gracefully.
        
        INT-2: Validate graceful degradation when tracing is disabled.
        """
        # Mock the generator service
        with patch('src.api.v1.routes.generation.generator_service') as mock_service:
            mock_result = MagicMock()
            mock_result.success = True
            mock_result.component_code = "export const Button = () => <button>Click</button>;"
            mock_result.stories_code = "export default { title: 'Button' };"
            mock_result.files = {}
            mock_result.metadata = MagicMock()
            mock_result.metadata.token_count = 100
            mock_result.metadata.lines_of_code = 10
            mock_result.metadata.requirements_implemented = 3
            mock_result.metadata.imports_count = 2
            mock_result.metadata.has_typescript_errors = False
            mock_result.metadata.has_accessibility_warnings = False
            mock_result.metadata.latency_ms = 1000
            mock_result.metadata.stage_latencies = {"generating": 1000}
            mock_result.validation_results = None
            mock_result.error = None
            
            mock_service.generate.return_value = mock_result
            
            # Mock code sanitizer
            with patch('src.api.v1.routes.generation.code_sanitizer') as mock_sanitizer:
                mock_sanitization = MagicMock()
                mock_sanitization.is_safe = True
                mock_sanitization.issues_count = 0
                mock_sanitization.critical_count = 0
                mock_sanitization.high_count = 0
                mock_sanitization.issues = []
                mock_sanitizer.sanitize.return_value = mock_sanitization
                
                # Mock get_current_run_id to return None (tracing disabled)
                with patch('src.api.v1.routes.generation.get_current_run_id') as mock_run_id:
                    mock_run_id.return_value = None
                    
                    # Make generation request
                    response = client.post("/api/v1/generation/generate", json={
                        "pattern_id": "shadcn-button",
                        "tokens": {
                            "primary": "#007bff"
                        },
                        "requirements": []
                    })
        
        # Verify response still succeeds
        assert response.status_code == 200
        data = response.json()
        
        # Verify trace_url is None (not missing, but explicitly None)
        assert "metadata" in data
        assert "trace_url" in data["metadata"]
        assert data["metadata"]["trace_url"] is None


class TestTraceURLGeneration:
    """Tests for trace URL generation utility."""
    
    def test_get_trace_url_format(self):
        """Verify trace URL is correctly formatted.
        
        INT-2: Validate trace URL format matches LangSmith expectations.
        """
        run_id = "test-run-12345-abcde"
        trace_url = get_trace_url(run_id)
        
        # Verify URL structure
        assert trace_url.startswith("https://smith.langchain.com")
        assert "/o/default/projects/p/" in trace_url
        assert f"/r/{run_id}" in trace_url
        
        # Verify complete URL format
        # Format: https://smith.langchain.com/o/default/projects/p/{project}/r/{run_id}
        parts = trace_url.split("/")
        assert "smith.langchain.com" in parts[2]
        assert parts[-2] == "r"
        assert parts[-1] == run_id

    def test_get_current_run_id_without_tracing(self):
        """Verify get_current_run_id returns None when not in trace context.
        
        INT-2: Validate graceful handling when tracing is unavailable.
        """
        # Without active tracing, should return None
        run_id = get_current_run_id()
        assert run_id is None


class TestSessionTracking:
    """Tests for session tracking middleware integration."""
    
    def test_session_id_format(self, client):
        """Verify session ID format is valid UUID.
        
        INT-2: Validate session ID generation and format.
        """
        response = client.get("/health")
        
        # Should have session ID in header
        assert "X-Session-ID" in response.headers
        session_id = response.headers["X-Session-ID"]
        
        # Should be UUID format (36 characters with hyphens)
        assert len(session_id) == 36
        assert session_id.count("-") == 4
        
        # Should match UUID pattern
        parts = session_id.split("-")
        assert len(parts) == 5
        assert len(parts[0]) == 8
        assert len(parts[1]) == 4
        assert len(parts[2]) == 4
        assert len(parts[3]) == 4
        assert len(parts[4]) == 12

    def test_different_requests_get_different_session_ids(self, client):
        """Verify each request gets a unique session ID.
        
        INT-2: Validate session isolation across requests.
        """
        response1 = client.get("/health")
        response2 = client.get("/health")
        
        session_id_1 = response1.headers.get("X-Session-ID")
        session_id_2 = response2.headers.get("X-Session-ID")
        
        assert session_id_1 is not None
        assert session_id_2 is not None
        assert session_id_1 != session_id_2
