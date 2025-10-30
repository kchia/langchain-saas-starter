"""Tests for token extraction API endpoints."""

import io
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient
from PIL import Image

from src.main import app
from src.services.image_processor import ImageValidationError
from src.agents.token_extractor import TokenExtractionError


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def sample_image_bytes():
    """Create sample image bytes for testing."""
    image = Image.new("RGB", (800, 600), color="red")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


@pytest.fixture
def sample_tokens_response():
    """Sample successful token extraction response."""
    return {
        "tokens": {
            "colors": {
                "primary": "#3B82F6",
                "background": "#FFFFFF",
                "foreground": "#09090B"
            },
            "typography": {
                "fontFamily": "Inter",
                "fontSize": "16px",
                "fontWeight": 500
            },
            "spacing": {
                "padding": "16px",
                "gap": "8px"
            }
        },
        "confidence": {
            "colors": {
                "primary": 0.95,
                "background": 0.92,
                "foreground": 0.88
            },
            "typography": {
                "fontFamily": 0.65,
                "fontSize": 0.85,
                "fontWeight": 0.78
            },
            "spacing": {
                "padding": 0.82,
                "gap": 0.79
            }
        },
        "fallbacks_used": [],
        "review_needed": ["typography.fontFamily"]
    }


class TestExtractTokensEndpoint:
    """Tests for POST /api/v1/tokens/extract/screenshot endpoint."""
    
    @patch('src.api.v1.routes.tokens.TokenExtractor')
    def test_extract_tokens_success(
        self,
        mock_extractor_class,
        client,
        sample_image_bytes,
        sample_tokens_response
    ):
        """Test successful token extraction."""
        # Mock the token extractor
        mock_extractor = AsyncMock()
        mock_extractor.extract_tokens.return_value = sample_tokens_response
        mock_extractor_class.return_value = mock_extractor
        
        # Create file upload
        files = {
            "file": ("test.png", io.BytesIO(sample_image_bytes), "image/png")
        }
        
        response = client.post("/api/v1/tokens/extract/screenshot", files=files)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "tokens" in data
        assert "confidence" in data
        assert "metadata" in data
        assert data["metadata"]["filename"] == "test.png"
        assert data["metadata"]["extraction_method"] == "gpt-4v"
    
    def test_extract_tokens_oversized_file(self, client):
        """Test rejection of oversized file."""
        # Create large fake image data (11MB)
        large_data = b"x" * (11 * 1024 * 1024)
        
        files = {
            "file": ("large.png", io.BytesIO(large_data), "image/png")
        }
        
        response = client.post("/api/v1/tokens/extract/screenshot", files=files)
        
        assert response.status_code == 400
        assert "too large" in response.json()["detail"].lower()
    
    def test_extract_tokens_invalid_format(self, client):
        """Test rejection of invalid file format."""
        # Create fake non-image file
        fake_data = b"not an image"
        
        files = {
            "file": ("test.txt", io.BytesIO(fake_data), "text/plain")
        }
        
        response = client.post("/api/v1/tokens/extract/screenshot", files=files)
        
        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()
    
    def test_extract_tokens_corrupted_image(self, client):
        """Test rejection of corrupted image."""
        files = {
            "file": ("corrupted.png", io.BytesIO(b"fake png data"), "image/png")
        }
        
        response = client.post("/api/v1/tokens/extract/screenshot", files=files)
        
        assert response.status_code == 400
        assert "corrupted" in response.json()["detail"].lower() or "invalid" in response.json()["detail"].lower()
    
    @patch('src.api.v1.routes.tokens.TokenExtractor')
    def test_extract_tokens_extraction_error(
        self,
        mock_extractor_class,
        client,
        sample_image_bytes
    ):
        """Test handling of token extraction error."""
        # Mock extractor to raise error
        mock_extractor = AsyncMock()
        mock_extractor.extract_tokens.side_effect = TokenExtractionError("Extraction failed")
        mock_extractor_class.return_value = mock_extractor
        
        files = {
            "file": ("test.png", io.BytesIO(sample_image_bytes), "image/png")
        }
        
        response = client.post("/api/v1/tokens/extract/screenshot", files=files)
        
        assert response.status_code == 500
        assert "failed to extract tokens" in response.json()["detail"].lower()
    
    def test_extract_tokens_missing_file(self, client):
        """Test error when file is missing."""
        response = client.post("/api/v1/tokens/extract/screenshot")
        
        assert response.status_code == 422  # Unprocessable Entity


class TestDefaultTokensEndpoint:
    """Tests for GET /api/v1/tokens/defaults endpoint."""
    
    def test_get_default_tokens(self, client):
        """Test retrieving default tokens."""
        response = client.get("/api/v1/tokens/defaults")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "tokens" in data
        assert "source" in data
        assert data["source"] == "shadcn/ui"
        
        # Verify structure
        assert "colors" in data["tokens"]
        assert "typography" in data["tokens"]
        assert "spacing" in data["tokens"]
        
        # Verify some known defaults
        assert data["tokens"]["colors"]["primary"] == "#3B82F6"
        assert data["tokens"]["typography"]["fontFamily"] == "Inter"
