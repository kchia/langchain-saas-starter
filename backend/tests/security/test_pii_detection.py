"""Tests for PII detection security module."""

import io
import pytest
from PIL import Image
from unittest.mock import AsyncMock, MagicMock, patch
import json

from src.security.pii_detector import (
    PIIDetector,
    PIIDetectionError,
    PIIDetectionResult,
    PIIEntity,
)


class TestPIIDetector:
    """Tests for PII detection using GPT-4V."""
    
    def create_test_image(
        self,
        width: int = 800,
        height: int = 600,
        mode: str = "RGB"
    ) -> Image.Image:
        """Helper to create a test image."""
        return Image.new(mode, (width, height), color="red")
    
    def test_pii_detector_initialization(self):
        """Test PII detector initialization."""
        detector = PIIDetector()
        assert detector.model == "gpt-4o"
        assert detector.temperature == 0.0
    
    def test_pii_detector_custom_model(self):
        """Test PII detector with custom model."""
        detector = PIIDetector(model="gpt-4-vision-preview", temperature=0.5)
        assert detector.model == "gpt-4-vision-preview"
        assert detector.temperature == 0.5
    
    def test_image_to_base64(self):
        """Test converting image to base64."""
        detector = PIIDetector()
        image = self.create_test_image(100, 100)
        
        base64_str = detector._image_to_base64(image)
        
        assert isinstance(base64_str, str)
        assert len(base64_str) > 0
        # Base64 strings only contain valid characters
        import string
        valid_chars = string.ascii_letters + string.digits + "+/="
        assert all(c in valid_chars for c in base64_str)
    
    def test_image_to_base64_rgba(self):
        """Test converting RGBA image to base64."""
        detector = PIIDetector()
        image = self.create_test_image(100, 100, mode="RGBA")
        
        # Should not raise exception
        base64_str = detector._image_to_base64(image)
        assert len(base64_str) > 0
    
    @pytest.mark.asyncio
    async def test_scan_image_no_pii(self):
        """Test scanning image with no PII."""
        detector = PIIDetector()
        image = self.create_test_image()
        
        # Mock the OpenAI client
        mock_response = {
            "has_pii": False,
            "entities_found": [],
            "confidence": 0.95,
            "raw_text": "UI mockup text"
        }
        
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock()]
        mock_completion.choices[0].message.content = json.dumps(mock_response)
        
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_completion)
        
        with patch.object(detector, '_get_client', return_value=mock_client):
            result = await detector.scan_image(image, auto_block=False)
        
        assert isinstance(result, PIIDetectionResult)
        assert result.has_pii is False
        assert len(result.entities_found) == 0
        assert result.confidence == 0.95
    
    @pytest.mark.asyncio
    async def test_scan_image_with_pii_no_block(self):
        """Test scanning image with PII but no auto-blocking."""
        detector = PIIDetector()
        image = self.create_test_image()
        
        # Mock the OpenAI client
        mock_response = {
            "has_pii": True,
            "entities_found": [
                {
                    "type": "Email addresses",
                    "confidence": 0.9,
                    "context": "john.doe@example.com"
                },
                {
                    "type": "Phone numbers",
                    "confidence": 0.85,
                    "context": "555-1234"
                }
            ],
            "confidence": 0.88,
            "raw_text": "Contact: john.doe@example.com, 555-1234"
        }
        
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock()]
        mock_completion.choices[0].message.content = json.dumps(mock_response)
        
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_completion)
        
        with patch.object(detector, '_get_client', return_value=mock_client):
            result = await detector.scan_image(image, auto_block=False)
        
        assert result.has_pii is True
        assert len(result.entities_found) == 2
        assert result.entities_found[0].type == "Email addresses"
        assert result.entities_found[1].type == "Phone numbers"
        assert result.confidence == 0.88
    
    @pytest.mark.asyncio
    async def test_scan_image_with_pii_auto_block(self):
        """Test scanning image with PII and auto-blocking enabled."""
        detector = PIIDetector()
        image = self.create_test_image()
        
        # Mock the OpenAI client
        mock_response = {
            "has_pii": True,
            "entities_found": [
                {
                    "type": "Social Security Numbers (SSN)",
                    "confidence": 0.95,
                    "context": "123-45-6789"
                }
            ],
            "confidence": 0.95,
            "raw_text": "SSN: 123-45-6789"
        }
        
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock()]
        mock_completion.choices[0].message.content = json.dumps(mock_response)
        
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_completion)
        
        with patch.object(detector, '_get_client', return_value=mock_client):
            with pytest.raises(PIIDetectionError) as exc_info:
                await detector.scan_image(image, auto_block=True)
        
        assert "PII" in str(exc_info.value)
        assert "Social Security Numbers" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_scan_image_json_in_markdown(self):
        """Test parsing JSON response wrapped in markdown."""
        detector = PIIDetector()
        image = self.create_test_image()
        
        # Mock response with markdown code block
        mock_response_text = """
        ```json
        {
            "has_pii": false,
            "entities_found": [],
            "confidence": 0.9,
            "raw_text": "Clean UI"
        }
        ```
        """
        
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock()]
        mock_completion.choices[0].message.content = mock_response_text
        
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_completion)
        
        with patch.object(detector, '_get_client', return_value=mock_client):
            result = await detector.scan_image(image, auto_block=False)
        
        assert result.has_pii is False
        assert result.confidence == 0.9
    
    @pytest.mark.asyncio
    async def test_scan_image_invalid_json_response(self):
        """Test handling of invalid JSON response."""
        detector = PIIDetector()
        image = self.create_test_image()
        
        # Mock response with invalid JSON
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock()]
        mock_completion.choices[0].message.content = "This is not valid JSON"
        
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_completion)
        
        with patch.object(detector, '_get_client', return_value=mock_client):
            with pytest.raises(PIIDetectionError) as exc_info:
                await detector.scan_image(image)
        
        assert "Invalid JSON response" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_scan_image_from_bytes_success(self):
        """Test scanning image from raw bytes."""
        detector = PIIDetector()
        
        # Create image bytes
        image = self.create_test_image(100, 100)
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        image_data = buffer.getvalue()
        
        # Mock the OpenAI client
        mock_response = {
            "has_pii": False,
            "entities_found": [],
            "confidence": 0.9,
            "raw_text": "Test"
        }
        
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock()]
        mock_completion.choices[0].message.content = json.dumps(mock_response)
        
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_completion)
        
        with patch.object(detector, '_get_client', return_value=mock_client):
            result = await detector.scan_image_from_bytes(image_data, auto_block=False)
        
        assert result.has_pii is False
    
    @pytest.mark.asyncio
    async def test_scan_image_from_bytes_invalid_data(self):
        """Test scanning with invalid image bytes."""
        detector = PIIDetector()
        
        invalid_data = b"not an image"
        
        with pytest.raises(PIIDetectionError) as exc_info:
            await detector.scan_image_from_bytes(invalid_data)
        
        assert "Invalid image data" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_scan_image_openai_error(self):
        """Test handling of OpenAI API errors."""
        detector = PIIDetector()
        image = self.create_test_image()
        
        # Mock the OpenAI client to raise an error
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(
            side_effect=Exception("API Error")
        )
        
        with patch.object(detector, '_get_client', return_value=mock_client):
            with pytest.raises(PIIDetectionError) as exc_info:
                await detector.scan_image(image)
        
        assert "PII detection failed" in str(exc_info.value)
    
    def test_get_client_no_openai(self):
        """Test error when OpenAI package is not available."""
        detector = PIIDetector()
        
        with patch('src.security.pii_detector.OPENAI_AVAILABLE', False):
            with pytest.raises(PIIDetectionError) as exc_info:
                detector._get_client()
            
            assert "OpenAI package not installed" in str(exc_info.value)
    
    def test_get_client_no_api_key(self):
        """Test error when API key is not set."""
        detector = PIIDetector()
        
        with patch('os.getenv', return_value=None):
            with pytest.raises(PIIDetectionError) as exc_info:
                detector._get_client()
            
            assert "OPENAI_API_KEY" in str(exc_info.value)


class TestPIIEntity:
    """Tests for PIIEntity model."""
    
    def test_pii_entity_creation(self):
        """Test creating a PIIEntity."""
        entity = PIIEntity(
            type="Email addresses",
            confidence=0.9,
            context="user@example.com"
        )
        
        assert entity.type == "Email addresses"
        assert entity.confidence == 0.9
        assert entity.context == "user@example.com"
    
    def test_pii_entity_without_context(self):
        """Test creating a PIIEntity without context."""
        entity = PIIEntity(
            type="Phone numbers",
            confidence=0.85
        )
        
        assert entity.type == "Phone numbers"
        assert entity.confidence == 0.85
        assert entity.context is None


class TestPIIDetectionResult:
    """Tests for PIIDetectionResult model."""
    
    def test_detection_result_with_pii(self):
        """Test creating a result with PII."""
        entities = [
            PIIEntity(type="Email addresses", confidence=0.9),
            PIIEntity(type="Phone numbers", confidence=0.85),
        ]
        
        result = PIIDetectionResult(
            has_pii=True,
            entities_found=entities,
            confidence=0.88,
            raw_text="Some text"
        )
        
        assert result.has_pii is True
        assert len(result.entities_found) == 2
        assert result.confidence == 0.88
        assert result.raw_text == "Some text"
    
    def test_detection_result_no_pii(self):
        """Test creating a result without PII."""
        result = PIIDetectionResult(
            has_pii=False,
            entities_found=[],
            confidence=0.95
        )
        
        assert result.has_pii is False
        assert len(result.entities_found) == 0
        assert result.confidence == 0.95
        assert result.raw_text is None
