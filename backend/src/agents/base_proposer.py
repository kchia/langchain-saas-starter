"""Base class for requirement proposers.

This module provides the abstract base class that all requirement proposers
(props, events, states, accessibility) will extend.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from PIL import Image

from src.types.requirement_types import (
    RequirementProposal,
    ComponentClassification,
    RequirementCategory,
    get_confidence_level,
)
from src.core.tracing import traced
from src.core.logging import get_logger

logger = get_logger(__name__)


class BaseRequirementProposer(ABC):
    """Abstract base class for requirement proposers.
    
    All requirement proposers (props, events, states, a11y) extend this
    class and implement the propose() method.
    """
    
    def __init__(self, category: RequirementCategory):
        """Initialize the requirement proposer.
        
        Args:
            category: The requirement category this proposer handles
        """
        self.category = category
        self.retry_count = 0
        self.max_retries = 3
    
    @abstractmethod
    async def propose(
        self,
        image: Image.Image,
        classification: ComponentClassification,
        tokens: Optional[Dict[str, Any]] = None,
    ) -> List[RequirementProposal]:
        """Propose requirements for the given component.
        
        This method must be implemented by subclasses.
        
        Args:
            image: Component screenshot as PIL Image
            classification: Component type classification result
            tokens: Optional design tokens from Epic 1
            
        Returns:
            List of proposed requirements with confidence scores
        """
        pass
    
    def calculate_confidence(
        self,
        base_confidence: float,
        visual_cues_count: int,
        min_cues: int = 1,
        max_cues: int = 5,
    ) -> float:
        """Calculate confidence score for a requirement.
        
        Adjusts base confidence based on number of supporting visual cues.
        
        Args:
            base_confidence: Initial confidence estimate (0.0-1.0)
            visual_cues_count: Number of visual cues supporting this requirement
            min_cues: Minimum expected cues (reduces confidence if not met)
            max_cues: Maximum possible cues (for normalization)
            
        Returns:
            Adjusted confidence score clamped to [0.0, 1.0]
        """
        # Adjust confidence based on visual evidence
        if visual_cues_count < min_cues:
            # Penalize if not enough evidence
            adjustment = -0.2 * (min_cues - visual_cues_count)
        else:
            # Boost confidence with more evidence, up to max_cues
            boost_ratio = min(visual_cues_count, max_cues) / max_cues
            adjustment = 0.1 * boost_ratio
        
        adjusted_confidence = base_confidence + adjustment
        
        # Clamp to valid range
        return max(0.0, min(1.0, adjusted_confidence))
    
    def generate_rationale(
        self,
        requirement_name: str,
        visual_cues: List[str],
        source: str = "visual analysis"
    ) -> str:
        """Generate a rationale for a proposed requirement.
        
        Args:
            requirement_name: Name of the requirement
            visual_cues: List of visual cues that support this requirement
            source: Source of the evidence (default: "visual analysis")
            
        Returns:
            Human-readable rationale string
        """
        if not visual_cues:
            return f"{requirement_name} detected from {source}"
        
        # Join cues with proper grammar
        if len(visual_cues) == 1:
            cues_text = visual_cues[0]
        elif len(visual_cues) == 2:
            cues_text = f"{visual_cues[0]} and {visual_cues[1]}"
        else:
            cues_text = ", ".join(visual_cues[:-1]) + f", and {visual_cues[-1]}"
        
        return f"{requirement_name} inferred from {cues_text}"
    
    def create_proposal(
        self,
        name: str,
        confidence: float,
        rationale: str,
        values: Optional[List[str]] = None,
        required: Optional[bool] = None,
        description: Optional[str] = None,
    ) -> RequirementProposal:
        """Create a requirement proposal with standard fields.
        
        Args:
            name: Requirement name
            confidence: Confidence score (0.0-1.0)
            rationale: Explanation of the proposal
            values: Optional list of possible values (for props)
            required: Optional required flag (for events/a11y)
            description: Optional description (for states/a11y)
            
        Returns:
            RequirementProposal object
        """
        import uuid
        
        # Generate unique ID using UUID4
        proposal_id = f"{self.category.value}-{name}-{uuid.uuid4().hex[:8]}"
        
        return RequirementProposal(
            id=proposal_id,
            category=self.category,
            name=name,
            values=values,
            required=required,
            description=description,
            confidence=confidence,
            rationale=rationale,
            approved=False,
            edited=False,
        )
    
    def should_flag_for_review(self, confidence: float) -> bool:
        """Determine if a requirement should be flagged for review.
        
        Requirements with confidence < 0.8 are flagged for manual review.
        
        Args:
            confidence: Confidence score (0.0-1.0)
            
        Returns:
            True if should be flagged for review
        """
        return confidence < 0.8
    
    def log_proposal(
        self,
        proposal: RequirementProposal,
        extra_context: Optional[Dict[str, Any]] = None
    ):
        """Log a requirement proposal for observability.
        
        Args:
            proposal: The proposed requirement
            extra_context: Additional context to log
        """
        log_data = {
            "category": proposal.category.value,
            "name": proposal.name,
            "confidence": proposal.confidence,
            "confidence_level": get_confidence_level(proposal.confidence).value,
            "flagged_for_review": self.should_flag_for_review(proposal.confidence),
        }
        
        if extra_context:
            log_data.update(extra_context)
        
        logger.info(
            f"Proposed {proposal.category.value} requirement: {proposal.name}",
            extra={"extra": log_data}
        )
