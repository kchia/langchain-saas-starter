"""
Code Generation Module for ComponentForge

This module handles the generation of production-ready React/TypeScript components
from retrieved patterns, design tokens, and requirements.

Pipeline: Pattern → Token Injection → Tailwind Generation → Requirements → Assembly
"""

from .types import (
    GenerationRequest,
    GenerationResult,
    GenerationStage,
    PatternStructure,
    TokenMapping,
    CodeParts,
)

__all__ = [
    "GenerationRequest",
    "GenerationResult",
    "GenerationStage",
    "PatternStructure",
    "TokenMapping",
    "CodeParts",
]
