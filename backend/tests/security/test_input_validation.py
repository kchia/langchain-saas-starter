"""Tests for input validation security module."""

import io
import pytest
from PIL import Image
from fastapi import UploadFile

from src.security.input_validator import (
    ImageUploadValidator,
    RequirementInputValidator,
    PatternNameValidator,
    DescriptionValidator,
    InputValidationError,
)


class TestImageUploadValidator:
    """Tests for image upload validation."""
    
    def create_test_image(
        self,
        width: int = 800,
        height: int = 600,
        mode: str = "RGB",
        format: str = "PNG"
    ) -> bytes:
        """Helper to create a test image."""
        image = Image.new(mode, (width, height), color="red")
        buffer = io.BytesIO()
        image.save(buffer, format=format)
        return buffer.getvalue()
    
    def create_upload_file(
        self,
        content: bytes,
        filename: str = "test.png",
        content_type: str = "image/png"
    ) -> UploadFile:
        """Helper to create a mock UploadFile."""
        file = io.BytesIO(content)
        upload_file = UploadFile(
            filename=filename,
            file=file,
        )
        # Set content_type manually as it's not set by default in test
        upload_file.content_type = content_type
        return upload_file
    
    def test_validate_valid_mime_types(self):
        """Test that valid MIME types pass validation."""
        # These should not raise exceptions
        ImageUploadValidator.validate_file_type("image/png")
        ImageUploadValidator.validate_file_type("image/jpeg")
        ImageUploadValidator.validate_file_type("image/jpg")
        ImageUploadValidator.validate_file_type("image/svg+xml")
    
    def test_validate_invalid_mime_type(self):
        """Test that invalid MIME types raise error."""
        with pytest.raises(InputValidationError) as exc_info:
            ImageUploadValidator.validate_file_type("image/gif")
        assert "invalid file type" in str(exc_info.value).lower()
        
        with pytest.raises(InputValidationError):
            ImageUploadValidator.validate_file_type("application/pdf")
        
        with pytest.raises(InputValidationError):
            ImageUploadValidator.validate_file_type("text/plain")
    
    def test_validate_missing_content_type(self):
        """Test that missing content type raises error."""
        with pytest.raises(InputValidationError) as exc_info:
            ImageUploadValidator.validate_file_type(None)
        assert "required" in str(exc_info.value).lower()
    
    def test_validate_file_size_within_limit(self):
        """Test that files within size limit pass validation."""
        # 1MB
        ImageUploadValidator.validate_file_size(1024 * 1024)
        # 5MB
        ImageUploadValidator.validate_file_size(5 * 1024 * 1024)
        # 10MB (max)
        ImageUploadValidator.validate_file_size(10 * 1024 * 1024)
    
    def test_validate_file_size_exceeds_limit(self):
        """Test that oversized files raise error."""
        with pytest.raises(InputValidationError) as exc_info:
            ImageUploadValidator.validate_file_size(11 * 1024 * 1024)  # 11MB
        
        assert "too large" in str(exc_info.value).lower()
        assert "10" in str(exc_info.value)  # Should mention 10MB limit
    
    def test_validate_svg_with_script_tag(self):
        """Test that SVG with script tag is rejected."""
        svg_with_script = """
        <svg xmlns="http://www.w3.org/2000/svg">
            <script>alert('xss')</script>
            <circle cx="50" cy="50" r="40"/>
        </svg>
        """
        
        with pytest.raises(InputValidationError) as exc_info:
            ImageUploadValidator.validate_svg_content(svg_with_script)
        
        assert "script" in str(exc_info.value).lower()
    
    def test_validate_svg_with_javascript_url(self):
        """Test that SVG with javascript: URL is rejected."""
        svg_with_js = """
        <svg xmlns="http://www.w3.org/2000/svg">
            <a href="javascript:alert('xss')">
                <circle cx="50" cy="50" r="40"/>
            </a>
        </svg>
        """
        
        with pytest.raises(InputValidationError) as exc_info:
            ImageUploadValidator.validate_svg_content(svg_with_js)
        
        assert "forbidden" in str(exc_info.value).lower()
    
    def test_validate_svg_with_event_handler(self):
        """Test that SVG with event handlers is rejected."""
        svg_with_onclick = """
        <svg xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" onclick="alert('xss')"/>
        </svg>
        """
        
        with pytest.raises(InputValidationError):
            ImageUploadValidator.validate_svg_content(svg_with_onclick)
    
    def test_validate_clean_svg(self):
        """Test that clean SVG passes validation."""
        clean_svg = """
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
            <circle cx="50" cy="50" r="40" fill="red"/>
            <text x="50" y="50">Hello</text>
        </svg>
        """
        
        # Should not raise exception
        ImageUploadValidator.validate_svg_content(clean_svg)
    
    def test_validate_image_dimensions_valid(self):
        """Test that valid dimensions pass validation."""
        # Normal dimensions
        ImageUploadValidator.validate_image_dimensions(800, 600)
        ImageUploadValidator.validate_image_dimensions(1920, 1080)
        ImageUploadValidator.validate_image_dimensions(100, 100)
    
    def test_validate_image_dimensions_too_small(self):
        """Test that too small images are rejected."""
        with pytest.raises(InputValidationError) as exc_info:
            ImageUploadValidator.validate_image_dimensions(30, 30)
        
        assert "too small" in str(exc_info.value).lower()
    
    def test_validate_image_dimensions_decompression_bomb(self):
        """Test that potential decompression bombs are rejected."""
        with pytest.raises(InputValidationError) as exc_info:
            # 6000x5000 = 30,000,000 pixels > 25,000,000 limit
            ImageUploadValidator.validate_image_dimensions(6000, 5000)
        
        assert "resolution too high" in str(exc_info.value).lower()
        assert "memory" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_validate_upload_png_success(self):
        """Test successful validation of PNG upload."""
        image_data = self.create_test_image(800, 600, format="PNG")
        upload_file = self.create_upload_file(
            image_data,
            filename="test.png",
            content_type="image/png"
        )
        
        result = await ImageUploadValidator.validate_upload(upload_file)
        
        assert result["validated"] is True
        assert result["file_type"] == "png"
        assert result["width"] == 800
        assert result["height"] == 600
        assert "size_bytes" in result
    
    @pytest.mark.asyncio
    async def test_validate_upload_jpeg_success(self):
        """Test successful validation of JPEG upload."""
        image_data = self.create_test_image(800, 600, format="JPEG")
        upload_file = self.create_upload_file(
            image_data,
            filename="test.jpg",
            content_type="image/jpeg"
        )
        
        result = await ImageUploadValidator.validate_upload(upload_file)
        
        assert result["validated"] is True
        assert result["file_type"] == "jpeg"
    
    @pytest.mark.asyncio
    async def test_validate_upload_invalid_mime_type(self):
        """Test that invalid MIME type is rejected."""
        image_data = self.create_test_image()
        upload_file = self.create_upload_file(
            image_data,
            filename="test.gif",
            content_type="image/gif"
        )
        
        with pytest.raises(InputValidationError) as exc_info:
            await ImageUploadValidator.validate_upload(upload_file)
        
        assert "invalid file type" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_validate_upload_oversized_file(self):
        """Test that oversized file is rejected."""
        # Create a large buffer
        large_data = b"x" * (11 * 1024 * 1024)  # 11MB
        upload_file = self.create_upload_file(
            large_data,
            filename="large.png",
            content_type="image/png"
        )
        
        with pytest.raises(InputValidationError) as exc_info:
            await ImageUploadValidator.validate_upload(upload_file)
        
        assert "too large" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_validate_upload_corrupted_image(self):
        """Test that corrupted image data is rejected."""
        corrupted_data = b"not an image"
        upload_file = self.create_upload_file(
            corrupted_data,
            filename="corrupted.png",
            content_type="image/png"
        )
        
        with pytest.raises(InputValidationError) as exc_info:
            await ImageUploadValidator.validate_upload(upload_file)
        
        assert "corrupted" in str(exc_info.value).lower() or "invalid" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_detect_actual_mime_type_png(self):
        """Test detection of PNG from magic numbers."""
        png_data = self.create_test_image(100, 100, format="PNG")
        mime = ImageUploadValidator.detect_actual_mime_type(png_data)
        assert mime == "image/png"
    
    @pytest.mark.asyncio
    async def test_detect_actual_mime_type_jpeg(self):
        """Test detection of JPEG from magic numbers."""
        jpeg_data = self.create_test_image(100, 100, format="JPEG")
        mime = ImageUploadValidator.detect_actual_mime_type(jpeg_data)
        assert mime == "image/jpeg"
    
    @pytest.mark.asyncio
    async def test_is_svg_content_detects_svg(self):
        """Test SVG content detection."""
        svg_data = b'<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>'
        assert ImageUploadValidator.is_svg_content(svg_data) is True
    
    @pytest.mark.asyncio
    async def test_is_svg_content_rejects_non_svg(self):
        """Test that non-SVG content is not detected as SVG."""
        png_data = self.create_test_image(100, 100, format="PNG")
        assert ImageUploadValidator.is_svg_content(png_data) is False
    
    @pytest.mark.asyncio
    async def test_validate_upload_svg_with_wrong_content_type(self):
        """Test that SVG uploaded with wrong Content-Type is still validated."""
        svg_data = b'<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script></svg>'
        
        # Upload SVG with image/png Content-Type (spoofing attempt)
        upload_file = self.create_upload_file(
            svg_data,
            filename="malicious.png",
            content_type="image/png"
        )
        
        # Should detect SVG content and run security validation
        with pytest.raises(InputValidationError) as exc_info:
            await ImageUploadValidator.validate_upload(upload_file)
        
        # Should fail because of script tag in SVG
        assert "script" in str(exc_info.value).lower() or "forbidden" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_validate_upload_content_type_mismatch_warning(self):
        """Test that Content-Type mismatch is logged but doesn't fail validation."""
        # Create a PNG image but declare it as JPEG
        png_data = self.create_test_image(100, 100, format="PNG")
        upload_file = self.create_upload_file(
            png_data,
            filename="test.jpg",
            content_type="image/jpeg"  # Wrong type
        )
        
        # Should succeed but log warning
        result = await ImageUploadValidator.validate_upload(upload_file)
        
        # Verify metadata includes both declared and actual types
        assert result["declared_mime"] == "image/jpeg"
        assert result["actual_mime"] == "image/png"
        assert result["validated"] is True
        assert result["content_verified"] is True


class TestRequirementInputValidator:
    """Tests for requirement text input validation."""
    
    def test_valid_text_input(self):
        """Test that valid text passes validation."""
        validator = RequirementInputValidator(text="Create a button component")
        assert validator.text == "Create a button component"
    
    def test_empty_text_rejected(self):
        """Test that empty text is rejected."""
        with pytest.raises(ValueError):
            RequirementInputValidator(text="")
    
    def test_html_sanitization(self):
        """Test that HTML tags are removed."""
        text_with_html = "Create a <script>alert('xss')</script> button"
        validator = RequirementInputValidator(text=text_with_html)
        
        # Should not contain script tags
        assert "<script>" not in validator.text
        assert "alert" not in validator.text or "<" not in validator.text
    
    def test_text_too_long(self):
        """Test that text exceeding max length is rejected."""
        long_text = "x" * 5001  # Exceeds 5000 char limit
        
        with pytest.raises(ValueError):
            RequirementInputValidator(text=long_text)
    
    def test_text_with_special_characters(self):
        """Test that special characters are preserved appropriately."""
        text = "Create a button with 'quotes' and \"double quotes\""
        validator = RequirementInputValidator(text=text)
        
        # Special characters should be handled safely
        assert validator.text is not None
        assert len(validator.text) > 0


class TestPatternNameValidator:
    """Tests for pattern name validation."""
    
    def test_valid_pattern_name(self):
        """Test that valid pattern names pass validation."""
        valid_names = [
            "Button",
            "Card Component",
            "nav-bar",
            "user_profile",
            "Button-Large-Primary",
            "Component123",
        ]
        
        for name in valid_names:
            validator = PatternNameValidator(name=name)
            assert validator.name == name.strip()
    
    def test_invalid_pattern_name_special_chars(self):
        """Test that names with invalid special characters are rejected."""
        invalid_names = [
            "Button<Component>",
            "Card@Component",
            "Nav/Bar",
            "User#Profile",
            "Component$123",
        ]
        
        for name in invalid_names:
            with pytest.raises(ValueError) as exc_info:
                PatternNameValidator(name=name)
            assert "can only contain" in str(exc_info.value).lower()
    
    def test_pattern_name_too_long(self):
        """Test that names exceeding max length are rejected."""
        long_name = "x" * 101  # Exceeds 100 char limit
        
        with pytest.raises(ValueError):
            PatternNameValidator(name=long_name)
    
    def test_pattern_name_html_sanitization(self):
        """Test that HTML is removed from pattern names."""
        name_with_html = "Button<script>alert('xss')</script>"
        validator = PatternNameValidator(name=name_with_html)
        
        # Should not contain script tags
        assert "<script>" not in validator.name


class TestDescriptionValidator:
    """Tests for description validation."""
    
    def test_valid_description(self):
        """Test that valid descriptions pass validation."""
        desc = "A reusable button component with multiple variants"
        validator = DescriptionValidator(description=desc)
        assert validator.description == desc
    
    def test_description_html_sanitization(self):
        """Test that HTML tags are removed from descriptions."""
        desc_with_html = "A button with <b>bold</b> text and <script>alert('xss')</script>"
        validator = DescriptionValidator(description=desc_with_html)
        
        # Should not contain HTML tags
        assert "<script>" not in validator.description
        assert "<b>" not in validator.description
    
    def test_description_too_long(self):
        """Test that descriptions exceeding max length are rejected."""
        long_desc = "x" * 1001  # Exceeds 1000 char limit
        
        with pytest.raises(ValueError):
            DescriptionValidator(description=long_desc)
    
    def test_empty_description_rejected(self):
        """Test that empty description is rejected."""
        with pytest.raises(ValueError):
            DescriptionValidator(description="")
