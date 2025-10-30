"""Token extraction agent using GPT-4V vision capabilities."""

import json
import os
from typing import Dict, Any, Optional
from openai import AsyncOpenAI
from PIL import Image

from src.prompts.token_extraction import create_extraction_prompt
from src.services.image_processor import prepare_image_for_vision_api
from src.core.confidence import process_tokens_with_confidence
from src.core.logging import get_logger
from src.core.tracing import traced

logger = get_logger(__name__)


class TokenExtractionError(Exception):
    """Exception raised for token extraction errors."""
    pass


class TokenExtractor:
    """Extract design tokens from screenshots using GPT-4V."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the token extractor.
        
        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        self.client = AsyncOpenAI(api_key=self.api_key)
        self.max_retries = 3
    
    @traced(run_name="extract_tokens")
    async def extract_tokens(
        self,
        image: Image.Image,
        retry_count: int = 0
    ) -> Dict[str, Any]:
        """Extract design tokens from an image.
        
        Args:
            image: PIL Image object
            retry_count: Current retry attempt (for internal use)
            
        Returns:
            Dictionary containing extracted tokens with confidence scores
            
        Raises:
            TokenExtractionError: If extraction fails after retries
        """
        try:
            # Prepare image for API
            image_data_url = prepare_image_for_vision_api(image)
            
            # Create prompt
            prompt = create_extraction_prompt()
            
            # Call GPT-4V API
            logger.info("Calling GPT-4V API for token extraction")
            response = await self.client.chat.completions.create(
                model="gpt-4o",  # GPT-4 with vision
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_data_url,
                                    "detail": "high"
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ],
                max_tokens=2000,
                temperature=0.1,  # Low temperature for consistent extraction
            )
            
            # Extract response content
            content = response.choices[0].message.content
            if not content:
                raise TokenExtractionError("Empty response from GPT-4V")
            
            logger.info("Received response from GPT-4V")
            
            # Parse JSON response
            # Remove markdown code blocks if present (robust handling)
            import re
            content = content.strip()
            # Remove markdown code blocks with optional language specifier
            content = re.sub(r'^```(?:json|JSON)?\s*\n?', '', content, flags=re.IGNORECASE)
            content = re.sub(r'\n?```\s*$', '', content, flags=re.IGNORECASE)
            content = content.strip()
            
            try:
                tokens = json.loads(content)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                logger.debug(f"Raw content: {content}")
                raise TokenExtractionError(f"Invalid JSON response from GPT-4V: {str(e)}")
            
            # Validate structure
            self._validate_token_structure(tokens)
            
            # Process tokens with confidence scoring
            processed = process_tokens_with_confidence(tokens)
            
            logger.info(
                f"Token extraction successful. "
                f"Fallbacks used: {len(processed['fallbacks_used'])}, "
                f"Review needed: {len(processed['review_needed'])}"
            )
            
            return processed
            
        except TokenExtractionError:
            raise
        except Exception as e:
            logger.error(f"Token extraction error: {str(e)}")
            
            # Retry logic
            if retry_count < self.max_retries:
                logger.info(f"Retrying extraction (attempt {retry_count + 1}/{self.max_retries})")
                return await self.extract_tokens(image, retry_count + 1)
            
            raise TokenExtractionError(
                f"Failed to extract tokens after {self.max_retries} attempts: {str(e)}"
            )
    
    def _validate_token_structure(self, tokens: Dict[str, Any]) -> None:
        """Validate the structure of extracted tokens.
        
        Args:
            tokens: Extracted token dictionary
            
        Raises:
            TokenExtractionError: If structure is invalid
        """
        required_categories = ["colors", "typography", "spacing", "borderRadius"]
        
        for category in required_categories:
            if category not in tokens:
                raise TokenExtractionError(
                    f"Missing required category: {category}"
                )
            
            if not isinstance(tokens[category], dict):
                raise TokenExtractionError(
                    f"Invalid category structure: {category} must be a dictionary"
                )
        
        # Validate color format
        for token_name, token_data in tokens.get("colors", {}).items():
            if isinstance(token_data, dict) and "value" in token_data:
                value = token_data["value"]
                if not isinstance(value, str) or not value.startswith("#"):
                    logger.warning(
                        f"Invalid color format for {token_name}: {value}"
                    )
