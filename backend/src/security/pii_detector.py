"""PII detection using GPT-4V for OCR and sensitive data identification.

This module uses GPT-4V to scan images for personally identifiable information (PII)
such as email addresses, phone numbers, SSNs, credit cards, etc.
"""

import json
import base64
import io
from typing import Dict, Any, List, Optional
from PIL import Image
from pydantic import BaseModel

try:
    from langchain_openai import ChatOpenAI
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

from ..core.logging import get_logger

logger = get_logger(__name__)


class PIIDetectionError(Exception):
    """Exception raised for PII detection errors."""
    pass


class PIIEntity(BaseModel):
    """Model for a detected PII entity."""
    type: str
    confidence: float
    context: Optional[str] = None


class PIIDetectionResult(BaseModel):
    """Model for PII detection results."""
    has_pii: bool
    entities_found: List[PIIEntity]
    confidence: float
    raw_text: Optional[str] = None


class PIIDetector:
    """Detector for PII in images using GPT-4V."""
    
    # PII types to detect
    PII_TYPES = [
        "Email addresses",
        "Phone numbers",
        "Social Security Numbers (SSN)",
        "Credit card numbers",
        "Physical addresses",
        "Driver's license numbers",
        "Passport numbers",
        "Bank account numbers",
        "Names with context suggesting real people",
        "Date of birth with identifying information",
    ]
    
    # System prompt for PII detection
    SYSTEM_PROMPT = """You are a security expert specializing in detecting personally identifiable information (PII) in images.

Analyze the image carefully and detect any PII including:
- Email addresses
- Phone numbers  
- Social Security Numbers (SSN)
- Credit card numbers
- Physical addresses
- Driver's license numbers
- Passport numbers
- Bank account numbers
- Full names with identifying context
- Dates of birth with identifying information

Important:
- UI mockups and design elements with placeholder text (like "john@example.com" or "555-1234") are NOT PII
- Generic UI labels and example data in wireframes are NOT PII
- Only flag actual, specific personal information that could identify real individuals
- Consider the context: design screenshots typically contain example/placeholder data

Return a JSON response with:
{
    "has_pii": boolean,
    "entities_found": [
        {"type": "entity_type", "confidence": 0.0-1.0, "context": "brief description"}
    ],
    "confidence": 0.0-1.0,
    "raw_text": "any text extracted from the image"
}

If no PII is found, return has_pii: false with empty entities_found array."""
    
    def __init__(self, model: str = "gpt-4o", temperature: float = 0.0):
        """Initialize PII detector.
        
        Args:
            model: OpenAI model to use (default: gpt-4o which has vision capabilities)
            temperature: Sampling temperature for the model
        """
        self.model = model
        self.temperature = temperature
        self._client = None
    
    def _get_client(self) -> AsyncOpenAI:
        """Get or create OpenAI client.
        
        Returns:
            AsyncOpenAI client instance
            
        Raises:
            PIIDetectionError: If OpenAI is not available
        """
        if not OPENAI_AVAILABLE:
            raise PIIDetectionError(
                "OpenAI package not installed. Install with: pip install openai"
            )
        
        if self._client is None:
            import os
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise PIIDetectionError("OPENAI_API_KEY environment variable not set")
            
            self._client = AsyncOpenAI(api_key=api_key)
        
        return self._client
    
    def _image_to_base64(self, image: Image.Image) -> str:
        """Convert PIL Image to base64 string.
        
        Args:
            image: PIL Image object
            
        Returns:
            Base64-encoded image string
        """
        buffer = io.BytesIO()
        
        # Convert RGBA to RGB for JPEG
        if image.mode == 'RGBA':
            rgb_image = Image.new('RGB', image.size, (255, 255, 255))
            rgb_image.paste(image, mask=image.split()[3])
            rgb_image.save(buffer, format='PNG')
        else:
            image.save(buffer, format='PNG')
        
        buffer.seek(0)
        return base64.b64encode(buffer.read()).decode('utf-8')
    
    async def scan_image(
        self,
        image: Image.Image,
        auto_block: bool = True
    ) -> PIIDetectionResult:
        """Scan image for PII using GPT-4V.
        
        Args:
            image: PIL Image object to scan
            auto_block: Whether to raise exception if PII is detected
            
        Returns:
            PIIDetectionResult with detection details
            
        Raises:
            PIIDetectionError: If auto_block=True and PII is detected
        """
        try:
            client = self._get_client()
            
            # Convert image to base64
            base64_image = self._image_to_base64(image)
            
            # Call GPT-4V API
            logger.info(f"Scanning image for PII using model: {self.model}")
            
            response = await client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self.SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Analyze this image for PII. Return only the JSON response."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                temperature=self.temperature,
                max_tokens=1000,
            )
            
            # Parse response
            content = response.choices[0].message.content
            logger.debug(f"PII detection raw response: {content}")
            
            # Extract JSON from response (might be wrapped in markdown)
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            try:
                result_data = json.loads(content)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse PII detection response: {content}")
                raise PIIDetectionError(f"Invalid JSON response from model: {str(e)}")
            
            # Convert to PIIDetectionResult
            entities = [
                PIIEntity(**entity) for entity in result_data.get("entities_found", [])
            ]
            
            result = PIIDetectionResult(
                has_pii=result_data.get("has_pii", False),
                entities_found=entities,
                confidence=result_data.get("confidence", 0.0),
                raw_text=result_data.get("raw_text"),
            )
            
            # Log detection
            if result.has_pii:
                entity_types = [e.type for e in result.entities_found]
                logger.warning(
                    f"PII detected in image: {entity_types}",
                    extra={
                        "event": "pii_detection",
                        "has_pii": True,
                        "entity_count": len(result.entities_found),
                        "entity_types": entity_types,
                        "confidence": result.confidence,
                    }
                )
                
                # Auto-block if configured
                if auto_block:
                    raise PIIDetectionError(
                        f"Upload contains PII and cannot be processed. "
                        f"Detected: {', '.join(entity_types)}"
                    )
            else:
                logger.info("No PII detected in image")
            
            return result
            
        except PIIDetectionError:
            raise
        except Exception as e:
            logger.error(f"Error during PII detection: {str(e)}", exc_info=True)
            raise PIIDetectionError(f"PII detection failed: {str(e)}")
    
    async def scan_image_from_bytes(
        self,
        image_data: bytes,
        auto_block: bool = True
    ) -> PIIDetectionResult:
        """Scan image from bytes for PII.
        
        Args:
            image_data: Raw image bytes
            auto_block: Whether to raise exception if PII is detected
            
        Returns:
            PIIDetectionResult with detection details
            
        Raises:
            PIIDetectionError: If image is invalid or PII is detected (with auto_block)
        """
        try:
            image = Image.open(io.BytesIO(image_data))
            return await self.scan_image(image, auto_block=auto_block)
        except (IOError, OSError) as e:
            raise PIIDetectionError(f"Invalid image data: {str(e)}")
