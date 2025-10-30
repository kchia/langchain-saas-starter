"""Tests for session tracking middleware."""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.api.middleware.session_tracking import (
    SessionTrackingMiddleware,
    get_session_id,
    session_id_var,
)


@pytest.fixture
def app():
    """Create test FastAPI app with session tracking middleware."""
    app = FastAPI()
    app.add_middleware(SessionTrackingMiddleware)

    @app.get("/test")
    async def test_endpoint():
        return {"session_id": get_session_id()}

    return app


@pytest.fixture
def client(app):
    """Create test client."""
    return TestClient(app)


class TestSessionTrackingMiddleware:
    """Tests for SessionTrackingMiddleware."""

    def test_middleware_adds_session_id_header(self, client):
        """Test that middleware adds X-Session-ID header to response."""
        response = client.get("/test")

        assert response.status_code == 200
        assert "X-Session-ID" in response.headers
        assert "x-session-id" in response.headers  # Case insensitive check

    def test_session_id_is_valid_uuid(self, client):
        """Test that session ID is a valid UUID."""
        response = client.get("/test")

        session_id = response.headers["X-Session-ID"]
        # UUID format: 8-4-4-4-12 characters
        parts = session_id.split("-")
        assert len(parts) == 5
        assert len(parts[0]) == 8
        assert len(parts[1]) == 4
        assert len(parts[2]) == 4
        assert len(parts[3]) == 4
        assert len(parts[4]) == 12

    def test_different_requests_get_different_session_ids(self, client):
        """Test that each request gets a unique session ID."""
        response1 = client.get("/test")
        response2 = client.get("/test")

        session_id1 = response1.headers["X-Session-ID"]
        session_id2 = response2.headers["X-Session-ID"]

        assert session_id1 != session_id2

    def test_get_session_id_in_endpoint(self, client):
        """Test that get_session_id() returns session ID in endpoint."""
        response = client.get("/test")

        # Session ID from header should match the one from get_session_id()
        header_session_id = response.headers["X-Session-ID"]
        body_session_id = response.json()["session_id"]

        assert header_session_id == body_session_id

    def test_session_id_context_var(self):
        """Test that session_id_var can be set and retrieved."""
        test_id = "test-session-123"
        session_id_var.set(test_id)

        assert get_session_id() == test_id

    def test_get_session_id_returns_empty_string_when_not_set(self):
        """Test that get_session_id returns empty string when not in request context."""
        # Reset context
        session_id_var.set("")

        result = get_session_id()
        assert result == ""
