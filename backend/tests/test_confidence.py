"""Tests for confidence scoring and fallback logic."""

import pytest
from src.core.confidence import (
    calculate_confidence_from_logprobs,
    should_use_fallback,
    should_flag_for_review,
    apply_fallback_if_needed,
    process_tokens_with_confidence,
    CONFIDENCE_THRESHOLD_AUTO_ACCEPT,
    CONFIDENCE_THRESHOLD_FALLBACK,
)


class TestConfidenceCalculation:
    """Tests for confidence calculation from logprobs."""
    
    def test_calculate_confidence_high(self):
        """Test confidence calculation with high probabilities."""
        # Log probabilities close to 0 indicate high confidence
        logprobs = [-0.1, -0.05, -0.08, -0.12]
        confidence = calculate_confidence_from_logprobs(logprobs)
        
        assert 0.85 < confidence <= 1.0
    
    def test_calculate_confidence_low(self):
        """Test confidence calculation with low probabilities."""
        # More negative log probabilities indicate lower confidence
        logprobs = [-2.0, -3.0, -2.5, -1.8]
        confidence = calculate_confidence_from_logprobs(logprobs)
        
        assert 0.0 < confidence < 0.3
    
    def test_calculate_confidence_empty_list(self):
        """Test confidence calculation with empty logprobs."""
        confidence = calculate_confidence_from_logprobs([])
        assert confidence == 0.5
    
    def test_calculate_confidence_clamped(self):
        """Test that confidence is clamped between 0 and 1."""
        # Very positive logprobs (shouldn't happen but test boundary)
        logprobs = [1.0, 2.0]
        confidence = calculate_confidence_from_logprobs(logprobs)
        assert 0.0 <= confidence <= 1.0


class TestFallbackLogic:
    """Tests for fallback decision logic."""
    
    def test_should_use_fallback_low_confidence(self):
        """Test fallback is used for low confidence."""
        assert should_use_fallback(0.5) is True
        assert should_use_fallback(0.6) is True
        assert should_use_fallback(0.69) is True
    
    def test_should_not_use_fallback_high_confidence(self):
        """Test fallback is not used for high confidence."""
        assert should_use_fallback(0.7) is False
        assert should_use_fallback(0.8) is False
        assert should_use_fallback(0.95) is False
    
    def test_should_flag_for_review_moderate(self):
        """Test flagging for review with moderate confidence."""
        assert should_flag_for_review(0.7) is True
        assert should_flag_for_review(0.75) is True
        assert should_flag_for_review(0.85) is True
        assert should_flag_for_review(0.89) is True
    
    def test_should_not_flag_high_confidence(self):
        """Test no review flag for very high confidence."""
        assert should_flag_for_review(0.9) is False
        assert should_flag_for_review(0.95) is False
        assert should_flag_for_review(1.0) is False
    
    def test_should_not_flag_low_confidence(self):
        """Test no review flag for low confidence (uses fallback instead)."""
        assert should_flag_for_review(0.5) is False
        assert should_flag_for_review(0.6) is False


class TestApplyFallback:
    """Tests for applying fallback values."""
    
    def test_apply_fallback_low_confidence(self):
        """Test that fallback is applied for low confidence."""
        value, used = apply_fallback_if_needed(
            "#CUSTOM", 0.5, "colors", "primary"
        )
        assert value == "#3B82F6"  # shadcn/ui default
        assert used is True
    
    def test_keep_value_high_confidence(self):
        """Test that original value is kept for high confidence."""
        value, used = apply_fallback_if_needed(
            "#FF0000", 0.85, "colors", "primary"
        )
        assert value == "#FF0000"
        assert used is False
    
    def test_fallback_nonexistent_token(self):
        """Test fallback when default doesn't exist."""
        value, used = apply_fallback_if_needed(
            "#CUSTOM", 0.5, "colors", "nonexistent"
        )
        # Should keep original value if no default exists
        assert value == "#CUSTOM"
        assert used is False


class TestProcessTokens:
    """Tests for processing tokens with confidence."""
    
    def test_process_tokens_with_high_confidence(self):
        """Test processing tokens with high confidence."""
        tokens = {
            "colors": {
                "primary": {"value": "#FF0000", "confidence": 0.95}
            }
        }
        
        result = process_tokens_with_confidence(tokens)
        
        assert result["tokens"]["colors"]["primary"] == "#FF0000"
        assert result["confidence"]["colors.primary"] == 0.95
        assert len(result["fallbacks_used"]) == 0
        assert len(result["review_needed"]) == 0
    
    def test_process_tokens_with_low_confidence(self):
        """Test processing tokens with low confidence (fallback)."""
        tokens = {
            "colors": {
                "primary": {"value": "#CUSTOM", "confidence": 0.5}
            }
        }
        
        result = process_tokens_with_confidence(tokens)
        
        assert result["tokens"]["colors"]["primary"] == "#3B82F6"  # fallback
        assert result["confidence"]["colors.primary"] == 0.5
        assert "colors.primary" in result["fallbacks_used"]
        assert len(result["review_needed"]) == 0
    
    def test_process_tokens_review_needed(self):
        """Test processing tokens that need review."""
        tokens = {
            "colors": {
                "primary": {"value": "#FF0000", "confidence": 0.8}
            }
        }
        
        result = process_tokens_with_confidence(tokens)
        
        assert result["tokens"]["colors"]["primary"] == "#FF0000"
        assert result["confidence"]["colors.primary"] == 0.8
        assert len(result["fallbacks_used"]) == 0
        assert "colors.primary" in result["review_needed"]
    
    def test_process_mixed_confidence_tokens(self):
        """Test processing tokens with mixed confidence levels."""
        tokens = {
            "colors": {
                "primary": {"value": "#FF0000", "confidence": 0.95},  # high
                "secondary": {"value": "#00FF00", "confidence": 0.75},  # review
                "accent": {"value": "#0000FF", "confidence": 0.5}  # fallback
            }
        }
        
        result = process_tokens_with_confidence(tokens)
        
        # High confidence - kept
        assert result["tokens"]["colors"]["primary"] == "#FF0000"
        # Moderate - kept but flagged
        assert result["tokens"]["colors"]["secondary"] == "#00FF00"
        assert "colors.secondary" in result["review_needed"]
        # Low - fallback applied
        assert "colors.accent" in result["fallbacks_used"]
    
    def test_process_tokens_without_confidence(self):
        """Test processing tokens without confidence scores."""
        tokens = {
            "colors": {
                "primary": "#FF0000"  # No confidence field
            }
        }
        
        result = process_tokens_with_confidence(tokens)
        
        # Should keep value as-is
        assert result["tokens"]["colors"]["primary"] == "#FF0000"
