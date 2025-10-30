"""API routes for design token extraction."""

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Dict, Any
import io
import os
from PIL import Image

from ....services.image_processor import (
    validate_and_process_image,
    ImageValidationError
)
from ....security.input_validator import (
    ImageUploadValidator,
    InputValidationError
)
from ....security.pii_detector import PIIDetector, PIIDetectionError
from ....agents.token_extractor import TokenExtractor, TokenExtractionError
from ....core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/tokens", tags=["tokens"])

# Environment variable to control PII detection
PII_DETECTION_ENABLED = os.getenv("PII_DETECTION_ENABLED", "false").lower() == "true"


@router.post("/extract/screenshot")
async def extract_tokens_from_screenshot(
    file: UploadFile = File(...)
) -> Dict[str, Any]:
    """Extract design tokens from an uploaded screenshot.
    
    Accepts PNG, JPG, JPEG formats up to 10MB.
    Returns extracted design tokens with confidence scores.
    
    Security features:
    - File type validation (PNG, JPG, JPEG only)
    - File size limits (10MB max)
    - Image dimension validation
    - SVG script detection
    - Optional PII detection (when PII_DETECTION_ENABLED=true)
    
    Args:
        file: Uploaded image file
        
    Returns:
        JSON response with extracted tokens and metadata
        
    Raises:
        HTTPException: For validation or extraction errors
    """
    # Sanitize filename to prevent path traversal issues
    safe_filename = os.path.basename(file.filename) if file.filename else "unknown"
    
    logger.info(
        f"Received screenshot upload: {safe_filename}, "
        f"content_type: {file.content_type}"
    )
    
    try:
        # Step 1: Security validation using new validator
        try:
            validation_metadata = await ImageUploadValidator.validate_upload(file)
            logger.info(
                f"Security validation passed: {validation_metadata}",
                extra={"event": "security_validation", "metadata": validation_metadata}
            )
        except InputValidationError as e:
            logger.warning(
                f"Security validation failed: {str(e)}",
                extra={"event": "security_validation_failed", "error": str(e)}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        
        # Read file contents (re-read after validation)
        contents = await file.read()
        
        # Step 2: Process image using existing processor
        try:
            image, metadata = validate_and_process_image(
                contents,
                mime_type=file.content_type
            )
            logger.info(
                f"Image validated: {metadata['width']}x{metadata['height']}, "
                f"format: {metadata['format']}"
            )
        except ImageValidationError as e:
            logger.warning(f"Image validation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        
        # Step 3: PII detection (optional, controlled by environment variable)
        pii_result = None
        if PII_DETECTION_ENABLED:
            try:
                pii_detector = PIIDetector()
                # Don't auto-block for token extraction (design screenshots often have placeholder data)
                pii_result = await pii_detector.scan_image(image, auto_block=False)
                
                # Log PII detection for audit
                if pii_result.has_pii:
                    logger.warning(
                        f"PII detected in screenshot (not blocking): {[e.type for e in pii_result.entities_found]}",
                        extra={
                            "event": "pii_detection_warning",
                            "filename": safe_filename,
                            "entities": [e.type for e in pii_result.entities_found]
                        }
                    )
                else:
                    logger.info("No PII detected in screenshot")
                    
            except PIIDetectionError as e:
                # Log error but don't fail the request
                logger.error(
                    f"PII detection failed (continuing): {str(e)}",
                    extra={"event": "pii_detection_error", "error": str(e)}
                )
        
        # Step 4: Extract tokens using GPT-4V
        try:
            extractor = TokenExtractor()
            result = await extractor.extract_tokens(image)
            
            # Add metadata to response
            result["metadata"] = {
                "filename": safe_filename,
                "image": metadata,
                "extraction_method": "gpt-4v",
                "security_validated": True,
            }
            
            # Add PII info if detection was run
            if pii_result:
                result["metadata"]["pii_check"] = {
                    "performed": True,
                    "has_pii": pii_result.has_pii,
                    "confidence": pii_result.confidence,
                }
            
            logger.info("Token extraction completed successfully")
            return result
            
        except TokenExtractionError as e:
            logger.error(f"Token extraction failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to extract tokens: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during token extraction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
    finally:
        # Clean up
        await file.close()


@router.get("/defaults")
async def get_default_tokens() -> Dict[str, Any]:
    """Get shadcn/ui default design tokens.
    
    Returns:
        JSON response with default tokens
    """
    from ....core.defaults import SHADCN_DEFAULTS
    
    return {
        "tokens": SHADCN_DEFAULTS,
        "source": "shadcn/ui",
        "description": "Default design tokens used as fallbacks"
    }
