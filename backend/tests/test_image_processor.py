"""Tests for image processing and validation."""

import io
import pytest
from PIL import Image

from src.services.image_processor import (
    validate_file_size,
    validate_mime_type,
    validate_and_process_image,
    image_to_base64,
    prepare_image_for_vision_api,
    ImageValidationError,
    MAX_FILE_SIZE,
    MAX_IMAGE_WIDTH,
)


class TestFileSizeValidation:
    """Tests for file size validation."""
    
    def test_valid_file_size(self):
        """Test that valid file size passes validation."""
        # 1MB
        validate_file_size(1024 * 1024)
        # 5MB
        validate_file_size(5 * 1024 * 1024)
        # 10MB (max)
        validate_file_size(10 * 1024 * 1024)
    
    def test_oversized_file(self):
        """Test that oversized file raises error."""
        with pytest.raises(ImageValidationError) as exc_info:
            validate_file_size(11 * 1024 * 1024)  # 11MB
        
        assert "too large" in str(exc_info.value).lower()
        assert "10MB" in str(exc_info.value)


class TestMimeTypeValidation:
    """Tests for MIME type validation."""
    
    def test_valid_mime_types(self):
        """Test that valid MIME types pass validation."""
        validate_mime_type("image/png")
        validate_mime_type("image/jpeg")
        validate_mime_type("image/jpg")
    
    def test_invalid_mime_type(self):
        """Test that invalid MIME type raises error."""
        with pytest.raises(ImageValidationError) as exc_info:
            validate_mime_type("image/gif")
        
        assert "invalid file type" in str(exc_info.value).lower()
        
        with pytest.raises(ImageValidationError):
            validate_mime_type("application/pdf")


class TestImageValidation:
    """Tests for image validation and processing."""
    
    def create_test_image(self, width: int = 800, height: int = 600, mode: str = "RGB") -> bytes:
        """Helper to create a test image."""
        image = Image.new(mode, (width, height), color="red")
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return buffer.getvalue()
    
    def test_valid_image_processing(self):
        """Test processing of valid image."""
        image_data = self.create_test_image(800, 600)
        
        image, metadata = validate_and_process_image(image_data, "image/png")
        
        assert isinstance(image, Image.Image)
        assert metadata["format"] == "PNG"
        assert metadata["width"] == 800
        assert metadata["height"] == 600
        assert metadata["resized"] is False
    
    def test_image_resizing_large_width(self):
        """Test that large images are resized."""
        # Create image wider than MAX_IMAGE_WIDTH
        image_data = self.create_test_image(3000, 2000)
        
        image, metadata = validate_and_process_image(image_data)
        
        assert metadata["resized"] is True
        assert metadata["width"] == MAX_IMAGE_WIDTH
        assert metadata["original_width"] == 3000
        # Check aspect ratio is maintained
        expected_height = int(2000 * (MAX_IMAGE_WIDTH / 3000))
        assert metadata["height"] == expected_height
    
    def test_image_too_small(self):
        """Test that very small images are rejected."""
        image_data = self.create_test_image(30, 30)
        
        with pytest.raises(ImageValidationError) as exc_info:
            validate_and_process_image(image_data)
        
        assert "too small" in str(exc_info.value).lower()
    
    def test_corrupted_image(self):
        """Test that corrupted image data raises error."""
        corrupted_data = b"not an image"
        
        with pytest.raises(ImageValidationError) as exc_info:
            validate_and_process_image(corrupted_data)
        
        assert "corrupted" in str(exc_info.value).lower() or "invalid" in str(exc_info.value).lower()
    
    def test_oversized_image_file(self):
        """Test that oversized file is rejected."""
        # Create a large buffer that exceeds MAX_FILE_SIZE
        large_data = b"x" * (MAX_FILE_SIZE + 1)
        
        with pytest.raises(ImageValidationError) as exc_info:
            validate_and_process_image(large_data)
        
        assert "too large" in str(exc_info.value).lower()
    
    def test_jpeg_format_validation(self):
        """Test JPEG format handling."""
        image = Image.new("RGB", (800, 600), color="blue")
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")
        image_data = buffer.getvalue()
        
        processed_image, metadata = validate_and_process_image(image_data, "image/jpeg")
        
        assert metadata["format"] == "JPEG"
        assert isinstance(processed_image, Image.Image)
    
    def test_mode_conversion(self):
        """Test that images are converted to RGB."""
        # Create grayscale image
        image_data = self.create_test_image(800, 600, mode="L")
        
        processed_image, metadata = validate_and_process_image(image_data)
        
        assert metadata.get("converted_to_rgb") is True
        assert processed_image.mode == "RGB"


class TestImageEncoding:
    """Tests for image encoding functions."""
    
    def test_image_to_base64_png(self):
        """Test converting image to base64 PNG."""
        image = Image.new("RGB", (100, 100), color="green")
        
        base64_str = image_to_base64(image, format="PNG")
        
        assert isinstance(base64_str, str)
        assert len(base64_str) > 0
        # Base64 strings only contain valid characters
        assert all(c in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" for c in base64_str)
    
    def test_image_to_base64_jpeg(self):
        """Test converting image to base64 JPEG."""
        image = Image.new("RGB", (100, 100), color="blue")
        
        base64_str = image_to_base64(image, format="JPEG")
        
        assert isinstance(base64_str, str)
        assert len(base64_str) > 0
    
    def test_rgba_to_jpeg_conversion(self):
        """Test that RGBA images are converted properly for JPEG."""
        # JPEG doesn't support transparency
        image = Image.new("RGBA", (100, 100), color=(255, 0, 0, 128))
        
        # Should not raise an error
        base64_str = image_to_base64(image, format="JPEG")
        assert len(base64_str) > 0
    
    def test_prepare_image_for_vision_api(self):
        """Test preparing image for GPT-4V API."""
        image = Image.new("RGB", (100, 100), color="red")
        
        data_url = prepare_image_for_vision_api(image)
        
        assert data_url.startswith("data:image/png;base64,")
        # Extract base64 part and verify it's valid
        base64_part = data_url.split(",", 1)[1]
        assert len(base64_part) > 0
