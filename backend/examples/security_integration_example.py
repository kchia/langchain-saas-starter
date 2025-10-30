"""
Example: Integrating security validation into a new API endpoint.

This example shows how to add input validation and PII detection
to any API endpoint that accepts file uploads or text inputs.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import Dict, Any
import os

from src.security.input_validator import (
    ImageUploadValidator,
    RequirementInputValidator,
    InputValidationError
)
from src.security.pii_detector import PIIDetector, PIIDetectionError
from src.services.image_processor import validate_and_process_image
from src.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/patterns", tags=["patterns"])

# Enable/disable PII detection via environment variable
PII_DETECTION_ENABLED = os.getenv("PII_DETECTION_ENABLED", "false").lower() == "true"


@router.post("/upload")
async def upload_pattern_image(
    file: UploadFile = File(...),
    name: str = None,
    description: str = None
) -> Dict[str, Any]:
    """
    Upload a pattern image with security validation.
    
    This endpoint demonstrates the full security workflow:
    1. Security validation (file type, size, SVG checks)
    2. Image processing
    3. Optional PII detection
    4. Pattern storage
    
    Args:
        file: Uploaded image file
        name: Optional pattern name
        description: Optional pattern description
        
    Returns:
        JSON response with upload details
        
    Raises:
        HTTPException: For validation or processing errors
    """
    safe_filename = os.path.basename(file.filename) if file.filename else "unknown"
    
    logger.info(
        f"Pattern upload request: {safe_filename}",
        extra={
            "event": "pattern_upload",
            "filename": safe_filename,
            "content_type": file.content_type
        }
    )
    
    try:
        # STEP 1: Security validation
        logger.info("Step 1: Security validation")
        try:
            validation_metadata = await ImageUploadValidator.validate_upload(file)
            logger.info(
                f"Security validation passed: {validation_metadata}",
                extra={"event": "security_validation_passed", "metadata": validation_metadata}
            )
        except InputValidationError as e:
            logger.warning(
                f"Security validation failed: {str(e)}",
                extra={"event": "security_validation_failed", "error": str(e)}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Security validation failed: {str(e)}"
            )
        
        # STEP 2: Validate name and description if provided
        if name:
            try:
                from src.security.input_validator import PatternNameValidator
                name_validator = PatternNameValidator(name=name)
                name = name_validator.name
                logger.info(f"Pattern name validated: {name}")
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid pattern name: {str(e)}"
                )
        
        if description:
            try:
                from src.security.input_validator import DescriptionValidator
                desc_validator = DescriptionValidator(description=description)
                description = desc_validator.description
                logger.info("Pattern description validated and sanitized")
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid description: {str(e)}"
                )
        
        # STEP 3: Process image
        logger.info("Step 2: Image processing")
        contents = await file.read()
        
        try:
            image, metadata = validate_and_process_image(
                contents,
                mime_type=file.content_type
            )
            logger.info(
                f"Image processed: {metadata['width']}x{metadata['height']}, "
                f"format: {metadata['format']}"
            )
        except Exception as e:
            logger.error(f"Image processing failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image processing failed: {str(e)}"
            )
        
        # STEP 4: Optional PII detection
        pii_result = None
        if PII_DETECTION_ENABLED:
            logger.info("Step 3: PII detection (enabled)")
            try:
                pii_detector = PIIDetector()
                
                # For user-generated content, use auto_block=True
                # For design screenshots, use auto_block=False for warnings only
                pii_result = await pii_detector.scan_image(image, auto_block=True)
                
                if pii_result.has_pii:
                    # This should not be reached if auto_block=True
                    logger.warning(
                        f"PII detected: {[e.type for e in pii_result.entities_found]}",
                        extra={
                            "event": "pii_detected",
                            "filename": safe_filename,
                            "entities": [e.type for e in pii_result.entities_found]
                        }
                    )
                else:
                    logger.info("No PII detected")
                    
            except PIIDetectionError as e:
                # PII was detected and upload is blocked
                logger.error(
                    f"Upload blocked due to PII: {str(e)}",
                    extra={"event": "pii_upload_blocked", "error": str(e)}
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=str(e)
                )
        else:
            logger.info("Step 3: PII detection (disabled)")
        
        # STEP 5: Store pattern (example - actual storage logic would go here)
        logger.info("Step 4: Pattern storage")
        
        # TODO: Implement actual pattern storage logic
        # - Save image to S3/local storage
        # - Create database record
        # - Generate pattern ID
        # - etc.
        
        pattern_id = "pattern_123"  # Placeholder
        
        # Build response
        response = {
            "pattern_id": pattern_id,
            "filename": safe_filename,
            "name": name,
            "description": description,
            "metadata": {
                "image": metadata,
                "security_validated": True,
            }
        }
        
        # Add PII check info if performed
        if pii_result:
            response["metadata"]["pii_check"] = {
                "performed": True,
                "has_pii": pii_result.has_pii,
                "confidence": pii_result.confidence,
            }
        
        logger.info(
            f"Pattern uploaded successfully: {pattern_id}",
            extra={"event": "pattern_uploaded", "pattern_id": pattern_id}
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during pattern upload: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
    finally:
        await file.close()


@router.post("/requirements")
async def submit_requirements(
    requirements: str
) -> Dict[str, Any]:
    """
    Submit component requirements with text validation.
    
    This endpoint demonstrates text input security:
    1. HTML sanitization
    2. Length validation
    3. Safe processing
    
    Args:
        requirements: Component requirements text
        
    Returns:
        JSON response with processed requirements
        
    Raises:
        HTTPException: For validation errors
    """
    logger.info("Requirements submission received")
    
    try:
        # Validate and sanitize requirements text
        validator = RequirementInputValidator(text=requirements)
        sanitized_requirements = validator.text
        
        logger.info(
            f"Requirements validated: {len(sanitized_requirements)} chars",
            extra={
                "event": "requirements_validated",
                "length": len(sanitized_requirements)
            }
        )
        
        # TODO: Process requirements
        # - Parse requirements
        # - Extract key features
        # - Match to patterns
        # - etc.
        
        return {
            "requirements": sanitized_requirements,
            "length": len(sanitized_requirements),
            "validated": True,
        }
        
    except ValueError as e:
        logger.warning(f"Requirements validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid requirements: {str(e)}"
        )


# Integration instructions:
"""
To integrate this into your FastAPI app:

1. Add to main.py:
   ```python
   from .api.v1.routes import patterns
   app.include_router(patterns.router, prefix="/api/v1")
   ```

2. Set environment variables:
   ```bash
   export PII_DETECTION_ENABLED=true
   export OPENAI_API_KEY=your_key_here
   ```

3. Test the endpoints:
   ```bash
   # Upload pattern
   curl -X POST http://localhost:8000/api/v1/patterns/upload \
     -F "file=@screenshot.png" \
     -F "name=Button Component" \
     -F "description=Primary action button"
   
   # Submit requirements
   curl -X POST http://localhost:8000/api/v1/patterns/requirements \
     -H "Content-Type: application/json" \
     -d '{"requirements": "Create a responsive card component"}'
   ```
"""
