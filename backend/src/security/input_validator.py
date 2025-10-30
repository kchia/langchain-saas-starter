"""Input validation for file uploads and text inputs.

This module provides comprehensive validation for:
- Image file uploads (type, size, dimensions, content)
- Text inputs (sanitization, length limits)
- SVG security checks (embedded scripts)
"""

import re
import io
from typing import Optional, Dict, Any
from PIL import Image
from pydantic import BaseModel, Field, field_validator
from fastapi import UploadFile

try:
    import nh3
    NH3_AVAILABLE = True
except ImportError:
    NH3_AVAILABLE = False
    # Fallback to basic HTML stripping if nh3 not available
    import html

try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False

from ..core.logging import get_logger

logger = get_logger(__name__)


class InputValidationError(Exception):
    """Exception raised for input validation errors."""
    pass


class ImageUploadValidator:
    """Validator for image file uploads with security checks."""
    
    # Configuration constants
    ALLOWED_MIME_TYPES = {'image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'}
    ALLOWED_FORMATS = {'PNG', 'JPEG', 'SVG'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_PIXELS = 25_000_000  # 25 megapixels (~5000x5000)
    MIN_WIDTH = 50
    MIN_HEIGHT = 50
    
    # SVG security patterns
    SVG_FORBIDDEN_PATTERNS = [
        r'<script[^>]*>',
        r'javascript:',
        r'on\w+\s*=',  # Event handlers like onclick, onload, etc.
        r'<iframe',
        r'<object',
        r'<embed',
        r'<link',
        r'<meta',
    ]
    
    @classmethod
    def detect_actual_mime_type(cls, contents: bytes) -> str:
        """Detect actual MIME type from file content using magic numbers.
        
        Args:
            contents: Raw file bytes
            
        Returns:
            Detected MIME type
            
        Raises:
            InputValidationError: If MIME type cannot be detected
        """
        if MAGIC_AVAILABLE:
            try:
                mime = magic.from_buffer(contents, mime=True)
                return mime
            except Exception as e:
                logger.warning(f"python-magic detection failed: {e}")
        
        # Fallback: check magic numbers manually for common image types
        if contents.startswith(b'\x89PNG\r\n\x1a\n'):
            return 'image/png'
        elif contents.startswith(b'\xff\xd8\xff'):
            return 'image/jpeg'
        elif contents.startswith(b'<?xml') or contents.startswith(b'<svg'):
            return 'image/svg+xml'
        elif b'<svg' in contents[:1024]:  # Check first 1KB for SVG
            return 'image/svg+xml'
        
        raise InputValidationError("Unable to detect file type from content")
    
    @classmethod
    def is_svg_content(cls, contents: bytes) -> bool:
        """Check if content is SVG regardless of extension or header.
        
        Args:
            contents: Raw file bytes
            
        Returns:
            True if content appears to be SVG
        """
        # Check for SVG markers in the beginning of the file
        try:
            # Try to decode as text
            text_content = contents[:2048].decode('utf-8', errors='ignore')
            return (
                text_content.lstrip().startswith('<?xml') or
                text_content.lstrip().startswith('<svg') or
                '<svg' in text_content[:512]
            )
        except Exception:
            return False
    
    @classmethod
    def validate_file_type(cls, content_type: Optional[str], filename: Optional[str] = None) -> None:
        """Validate file MIME type.
        
        Args:
            content_type: MIME type of the file
            filename: Optional filename for additional validation
            
        Raises:
            InputValidationError: If file type is not allowed
        """
        if not content_type:
            raise InputValidationError("File content type is required")
        
        if content_type not in cls.ALLOWED_MIME_TYPES:
            raise InputValidationError(
                f"Invalid file type: {content_type}. "
                f"Allowed types: PNG, JPG, JPEG, SVG"
            )
    
    @classmethod
    def validate_file_size(cls, size: int) -> None:
        """Validate file size is within limits.
        
        Args:
            size: Size of the file in bytes
            
        Raises:
            InputValidationError: If file is too large
        """
        if size > cls.MAX_FILE_SIZE:
            size_mb = size / (1024 * 1024)
            max_mb = cls.MAX_FILE_SIZE / (1024 * 1024)
            raise InputValidationError(
                f"File too large: {size_mb:.1f}MB. Maximum size is {max_mb}MB."
            )
    
    @classmethod
    def validate_svg_content(cls, content: str) -> None:
        """Check SVG content for embedded scripts and security issues.
        
        Args:
            content: SVG file content as string
            
        Raises:
            InputValidationError: If SVG contains forbidden patterns
        """
        content_lower = content.lower()
        
        for pattern in cls.SVG_FORBIDDEN_PATTERNS:
            if re.search(pattern, content_lower, re.IGNORECASE):
                raise InputValidationError(
                    f"SVG contains forbidden pattern: {pattern}. "
                    "SVG files must not contain scripts or embedded content."
                )
    
    @classmethod
    def validate_image_dimensions(
        cls,
        width: int,
        height: int,
        check_decompression_bomb: bool = True
    ) -> None:
        """Validate image dimensions.
        
        Args:
            width: Image width in pixels
            height: Image height in pixels
            check_decompression_bomb: Whether to check for decompression bombs
            
        Raises:
            InputValidationError: If dimensions are invalid
        """
        # Check minimum dimensions
        if width < cls.MIN_WIDTH or height < cls.MIN_HEIGHT:
            raise InputValidationError(
                f"Image too small: {width}x{height}. "
                f"Minimum size is {cls.MIN_WIDTH}x{cls.MIN_HEIGHT} pixels."
            )
        
        # Check for decompression bombs
        if check_decompression_bomb:
            total_pixels = width * height
            if total_pixels > cls.MAX_PIXELS:
                raise InputValidationError(
                    f"Image resolution too high: {width}x{height} = {total_pixels} pixels. "
                    f"Maximum is {cls.MAX_PIXELS} pixels to prevent memory exhaustion."
                )
    
    @classmethod
    async def validate_upload(cls, file: UploadFile) -> Dict[str, Any]:
        """Validate uploaded image file with content-based detection.
        
        This method performs multi-layer validation:
        1. File size check
        2. Content-Type header validation
        3. Actual content validation using magic numbers
        4. SVG security checks (if SVG detected)
        5. Image format validation
        
        Args:
            file: FastAPI UploadFile object
            
        Returns:
            Dictionary with validation metadata
            
        Raises:
            InputValidationError: If validation fails
        """
        # Read file contents
        contents = await file.read()
        file_size = len(contents)
        
        # Validate file size first
        cls.validate_file_size(file_size)
        
        # Validate Content-Type header
        cls.validate_file_type(file.content_type, file.filename)
        
        # Detect actual MIME type from file content (magic numbers)
        try:
            actual_mime = cls.detect_actual_mime_type(contents)
        except InputValidationError as e:
            raise InputValidationError(f"File type detection failed: {str(e)}")
        
        # Verify actual content matches allowed types
        if actual_mime not in cls.ALLOWED_MIME_TYPES:
            raise InputValidationError(
                f"File content type not allowed: {actual_mime}. "
                f"Allowed types: PNG, JPG, JPEG, SVG"
            )
        
        # Warn if Content-Type header doesn't match actual content
        if file.content_type != actual_mime:
            logger.warning(
                f"Content-Type mismatch detected: header='{file.content_type}', "
                f"actual='{actual_mime}' for file '{file.filename}'",
                extra={
                    "event": "content_type_mismatch",
                    "header_type": file.content_type,
                    "actual_type": actual_mime,
                    "filename": file.filename
                }
            )
        
        # Check if content is SVG (regardless of declared type)
        # This prevents SVG files from bypassing security checks
        is_svg = actual_mime == 'image/svg+xml' or cls.is_svg_content(contents)
        
        # Handle SVG files with security validation
        if is_svg:
            try:
                svg_content = contents.decode('utf-8')
                cls.validate_svg_content(svg_content)
            except UnicodeDecodeError:
                raise InputValidationError("Invalid SVG file: cannot decode content")
            
            return {
                "file_type": "svg",
                "actual_mime": actual_mime,
                "declared_mime": file.content_type,
                "size_bytes": file_size,
                "validated": True,
                "content_verified": True,
            }
        
        # Validate bitmap images (PNG, JPEG)
        try:
            image = Image.open(io.BytesIO(contents))
            
            # Verify image to detect corruption
            try:
                image.verify()
            except Exception as e:
                raise InputValidationError(f"Image verification failed: {str(e)}")
            
            # Re-open after verify (verify closes the file)
            image = Image.open(io.BytesIO(contents))
            
            # Check format
            if image.format not in cls.ALLOWED_FORMATS:
                raise InputValidationError(
                    f"Invalid image format: {image.format}. "
                    f"Allowed formats: {', '.join(cls.ALLOWED_FORMATS)}"
                )
            
            # Validate dimensions
            width, height = image.size
            cls.validate_image_dimensions(width, height)
            
            # Check for suspicious EXIF data (basic check)
            exif_data = image.getexif() if hasattr(image, 'getexif') else None
            has_exif = exif_data is not None and len(exif_data) > 0
            
            return {
                "file_type": image.format.lower(),
                "actual_mime": actual_mime,
                "declared_mime": file.content_type,
                "size_bytes": file_size,
                "width": width,
                "height": height,
                "mode": image.mode,
                "has_exif": has_exif,
                "validated": True,
                "content_verified": True,
            }
            
        except (IOError, OSError) as e:
            raise InputValidationError(f"Corrupted or invalid image file: {str(e)}")
        finally:
            # Reset file pointer for potential re-reading
            await file.seek(0)


class RequirementInputValidator(BaseModel):
    """Validator for text input with HTML sanitization."""
    
    text: str = Field(..., min_length=1, max_length=5000)
    
    @field_validator('text')
    @classmethod
    def sanitize_text(cls, v: str) -> str:
        """Sanitize text input by removing HTML tags.
        
        Args:
            v: Input text
            
        Returns:
            Sanitized text
        """
        if not v:
            return v
        
        if NH3_AVAILABLE:
            # Use nh3 for modern HTML sanitization
            # nh3.clean removes all tags by default
            return nh3.clean(v)
        else:
            # Fallback: basic HTML entity escaping
            return html.escape(v)
    
    @field_validator('text')
    @classmethod
    def validate_length(cls, v: str) -> str:
        """Validate text length after sanitization.
        
        Args:
            v: Sanitized text
            
        Returns:
            Validated text
            
        Raises:
            ValueError: If text is too short or too long
        """
        if len(v.strip()) == 0:
            raise ValueError("Text cannot be empty after sanitization")
        
        return v


class PatternNameValidator(BaseModel):
    """Validator for pattern/component names."""
    
    name: str = Field(..., min_length=1, max_length=100)
    
    @field_validator('name')
    @classmethod
    def validate_pattern_name(cls, v: str) -> str:
        """Validate and sanitize pattern name.
        
        Args:
            v: Pattern name
            
        Returns:
            Validated name
            
        Raises:
            ValueError: If name contains invalid characters
        """
        # Remove any HTML
        if NH3_AVAILABLE:
            v = nh3.clean(v)
        else:
            v = html.escape(v)
        
        # Allow alphanumeric, spaces, hyphens, underscores
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', v):
            raise ValueError(
                "Pattern name can only contain letters, numbers, spaces, hyphens, and underscores"
            )
        
        return v.strip()


class DescriptionValidator(BaseModel):
    """Validator for descriptions with HTML sanitization."""
    
    description: str = Field(..., min_length=1, max_length=1000)
    
    @field_validator('description')
    @classmethod
    def sanitize_description(cls, v: str) -> str:
        """Sanitize description by removing HTML tags.
        
        Args:
            v: Description text
            
        Returns:
            Sanitized description
        """
        if NH3_AVAILABLE:
            return nh3.clean(v)
        else:
            return html.escape(v)
