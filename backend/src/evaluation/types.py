"""
Evaluation result types for E2E pipeline evaluation.

This module defines dataclasses for storing evaluation results
at each stage of the screenshot-to-code pipeline.
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Optional


@dataclass
class TokenExtractionResult:
    """Result of token extraction evaluation."""
    screenshot_id: str
    expected_tokens: Dict[str, Any]
    extracted_tokens: Dict[str, Any]
    accuracy: float  # 0.0-1.0
    missing_tokens: List[str]
    incorrect_tokens: List[str]


@dataclass
class RetrievalResult:
    """Result of pattern retrieval evaluation."""
    screenshot_id: str
    expected_pattern_id: str
    retrieved_pattern_id: str
    correct: bool
    rank: int  # Position of correct pattern (1-indexed)
    confidence: float


@dataclass
class GenerationResult:
    """Result of code generation evaluation."""
    screenshot_id: str
    code_generated: bool
    code_compiles: bool
    quality_score: float  # From code validator
    validation_errors: List[str]
    generation_time_ms: float
    security_issues_count: int = 0
    security_severity: Optional[str] = None  # 'critical', 'high', 'medium', 'low'
    is_code_safe: bool = True


@dataclass
class E2EResult:
    """Complete end-to-end evaluation result."""
    screenshot_id: str
    token_extraction: TokenExtractionResult
    retrieval: RetrievalResult
    generation: GenerationResult
    pipeline_success: bool  # All stages passed
    total_latency_ms: float
