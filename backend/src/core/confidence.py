"""Confidence scoring and fallback logic for extracted design tokens."""

import math
from typing import Dict, Any, Tuple, Optional
from .defaults import SHADCN_DEFAULTS, get_default_token

# Confidence thresholds
CONFIDENCE_THRESHOLD_AUTO_ACCEPT = 0.9
CONFIDENCE_THRESHOLD_FALLBACK = 0.7


def calculate_confidence_from_logprobs(logprobs: list) -> float:
    """Calculate confidence score from OpenAI logprobs.
    
    NOTE: This function is currently unused. The current implementation relies on
    GPT-4V's self-assessed confidence scores provided in the JSON response, not
    actual token log probabilities from the API. This function is kept for potential
    future use if we switch to logprob-based confidence calculation.
    
    Args:
        logprobs: List of log probabilities from OpenAI API
        
    Returns:
        Confidence score between 0 and 1
    """
    if not logprobs:
        return 0.5  # Default moderate confidence
    
    # Calculate average log probability
    avg_logprob = sum(logprobs) / len(logprobs)
    
    # Convert log probability to confidence (0-1 scale)
    # Use exp to convert from log space, then clamp to 0-1
    confidence = math.exp(avg_logprob)
    return min(max(confidence, 0.0), 1.0)


def should_use_fallback(confidence: float) -> bool:
    """Determine if a token should use fallback based on confidence.
    
    Args:
        confidence: Confidence score (0-1)
        
    Returns:
        True if fallback should be used
    """
    return confidence < CONFIDENCE_THRESHOLD_FALLBACK


def should_flag_for_review(confidence: float) -> bool:
    """Determine if a token should be flagged for manual review.
    
    Args:
        confidence: Confidence score (0-1)
        
    Returns:
        True if token should be flagged for review
    """
    return CONFIDENCE_THRESHOLD_FALLBACK <= confidence < CONFIDENCE_THRESHOLD_AUTO_ACCEPT


def apply_fallback_if_needed(
    token_value: Any,
    confidence: float,
    category: str,
    token_name: str
) -> Tuple[Any, bool]:
    """Apply fallback value if confidence is too low.
    
    Args:
        token_value: Extracted token value
        confidence: Confidence score (0-1)
        category: Token category (e.g., 'colors', 'typography')
        token_name: Token name within category
        
    Returns:
        Tuple of (final_value, fallback_used)
    """
    if should_use_fallback(confidence):
        default_value = get_default_token(category, token_name)
        if default_value is not None:
            return default_value, True
        # If no default exists, keep extracted value
        return token_value, False
    
    return token_value, False


def process_tokens_with_confidence(
    tokens: Dict[str, Any]
) -> Dict[str, Any]:
    """Process extracted tokens and apply confidence-based fallbacks.

    Args:
        tokens: Dictionary of tokens with confidence scores
        Expected format:
        {
            "colors": {
                "primary": {"value": "#HEX", "confidence": 0.0-1.0}
            }
        }

    Returns:
        Processed tokens with fallbacks applied and metadata
        Format: {
            "tokens": { "colors": { "primary": "#HEX" } },
            "confidence": { "colors.primary": 0.92 },  # Flattened dotted keys
            "fallbacks_used": ["colors.primary"],
            "review_needed": ["typography.fontSize"]
        }
    """
    processed = {
        "tokens": {},
        "confidence": {},  # Flat dictionary with dotted keys (e.g., "colors.primary")
        "fallbacks_used": [],
        "review_needed": []
    }

    for category, category_tokens in tokens.items():
        processed["tokens"][category] = {}

        for token_name, token_data in category_tokens.items():
            if isinstance(token_data, dict) and "value" in token_data and "confidence" in token_data:
                value = token_data["value"]
                confidence = token_data["confidence"]

                # Apply fallback if needed
                final_value, fallback_used = apply_fallback_if_needed(
                    value, confidence, category, token_name
                )

                processed["tokens"][category][token_name] = final_value

                # Store confidence with flattened dotted key format (e.g., "colors.primary")
                token_id = f"{category}.{token_name}"
                processed["confidence"][token_id] = confidence

                # Track fallbacks and review flags
                if fallback_used:
                    processed["fallbacks_used"].append(token_id)
                elif should_flag_for_review(confidence):
                    processed["review_needed"].append(token_id)
            else:
                # Token without confidence score, use as-is
                processed["tokens"][category][token_name] = token_data

    return processed
