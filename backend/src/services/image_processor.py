"""Image processing service for screenshot upload and validation."""

import io
from typing import Tuple, Optional
from PIL import Image
import base64

# Configuration
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_IMAGE_WIDTH = 2000  # Max width in pixels
# PIL returns "JPEG" for both .jpg and .jpeg files
ALLOWED_FORMATS = {"PNG", "JPEG"}
ALLOWED_MIME_TYPES = {"image/png", "image/jpeg", "image/jpg"}


class ImageValidationError(Exception):
    """Exception raised for image validation errors."""
    pass


def validate_file_size(file_size: int) -> None:
    """Validate file size is within limits.
    
    Args:
        file_size: Size of the file in bytes
        
    Raises:
        ImageValidationError: If file is too large
    """
    if file_size > MAX_FILE_SIZE:
        size_mb = file_size / (1024 * 1024)
        raise ImageValidationError(
            f"File too large ({size_mb:.1f}MB). Maximum size is 10MB."
        )


def validate_mime_type(mime_type: str) -> None:
    """Validate file MIME type.
    
    Args:
        mime_type: MIME type of the file
        
    Raises:
        ImageValidationError: If MIME type is not allowed
    """
    if mime_type not in ALLOWED_MIME_TYPES:
        raise ImageValidationError(
            f"Invalid file type: {mime_type}. Allowed types: PNG, JPG, JPEG."
        )


def validate_and_process_image(
    image_data: bytes,
    mime_type: Optional[str] = None
) -> Tuple[Image.Image, dict]:
    """Validate and process uploaded image.
    
    Args:
        image_data: Raw image bytes
        mime_type: Optional MIME type for additional validation
        
    Returns:
        Tuple of (processed_image, metadata)
        
    Raises:
        ImageValidationError: If image is invalid or corrupted
    """
    # Validate file size
    validate_file_size(len(image_data))
    
    # Validate MIME type if provided
    if mime_type:
        validate_mime_type(mime_type)
    
    try:
        # Try to open and validate image with decompression bomb check
        image = Image.open(io.BytesIO(image_data))
        
        # Verify image to detect corruption early
        try:
            image.verify()
        except Exception as e:
            raise ImageValidationError(f"Image verification failed: {str(e)}")
        
        # Re-open image after verify (verify() closes the file)
        image = Image.open(io.BytesIO(image_data))
        
        # Check for decompression bombs (PIL's default limit is 178956970 pixels)
        # We add an additional conservative check
        width, height = image.size
        max_pixels = 25_000_000  # ~5000x5000, reasonable for design screenshots
        if width * height > max_pixels:
            raise ImageValidationError(
                f"Image too large ({width}x{height} = {width*height} pixels). "
                f"Maximum is {max_pixels} pixels to prevent memory issues."
            )
        
        # Verify image format
        if image.format not in ALLOWED_FORMATS:
            raise ImageValidationError(
                f"Invalid image format: {image.format}. Allowed formats: PNG, JPG, JPEG."
            )
        
        # Get image metadata
        metadata = {
            "format": image.format,
            "width": width,
            "height": height,
            "mode": image.mode,
        }
        
        # Validate dimensions (not too small)
        if width < 50 or height < 50:
            raise ImageValidationError(
                f"Image too small ({width}x{height}). Minimum size is 50x50 pixels."
            )
        
        # Resize if needed
        if width > MAX_IMAGE_WIDTH:
            # Calculate new height maintaining aspect ratio
            ratio = MAX_IMAGE_WIDTH / width
            new_height = int(height * ratio)
            image = image.resize((MAX_IMAGE_WIDTH, new_height), Image.LANCZOS)
            metadata["resized"] = True
            metadata["original_width"] = width
            metadata["original_height"] = height
            metadata["width"] = MAX_IMAGE_WIDTH
            metadata["height"] = new_height
        else:
            metadata["resized"] = False
        
        # Convert to RGB if needed (for consistency)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
            metadata["converted_to_rgb"] = True
        
        return image, metadata
        
    except (IOError, OSError) as e:
        raise ImageValidationError(f"Corrupted or invalid image file: {str(e)}")


def image_to_base64(image: Image.Image, format: str = "PNG") -> str:
    """Convert PIL Image to base64 string.
    
    Args:
        image: PIL Image object
        format: Image format (PNG, JPEG)
        
    Returns:
        Base64-encoded image string
    """
    buffer = io.BytesIO()
    
    # For JPEG, convert RGBA to RGB
    if format.upper() == "JPEG" and image.mode == "RGBA":
        # Create white background
        rgb_image = Image.new("RGB", image.size, (255, 255, 255))
        rgb_image.paste(image, mask=image.split()[3] if len(image.split()) == 4 else None)
        rgb_image.save(buffer, format=format, quality=90)
    else:
        image.save(buffer, format=format)
    
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")


def prepare_image_for_vision_api(image: Image.Image) -> str:
    """Prepare image for GPT-4V API.
    
    Args:
        image: PIL Image object
        
    Returns:
        Base64-encoded image in data URL format
    """
    # Use PNG format to preserve quality and support transparency
    base64_image = image_to_base64(image, format="PNG")
    return f"data:image/png;base64,{base64_image}"
