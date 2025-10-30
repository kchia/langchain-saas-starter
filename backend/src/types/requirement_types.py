"""Domain types for requirement proposal system.

This module defines Pydantic models and enums for the requirement proposal
system that analyzes screenshots/Figma frames to propose functional requirements.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RequirementCategory(str, Enum):
    """Categories of requirements that can be proposed."""
    
    PROPS = "props"
    EVENTS = "events"
    STATES = "states"
    ACCESSIBILITY = "accessibility"


class ComponentType(str, Enum):
    """Supported component types for classification."""

    BUTTON = "Button"
    CARD = "Card"
    INPUT = "Input"
    SELECT = "Select"
    CHECKBOX = "Checkbox"
    RADIO = "Radio"
    SWITCH = "Switch"
    TABS = "Tabs"
    BADGE = "Badge"
    ALERT = "Alert"


class ConfidenceLevel(str, Enum):
    """Confidence level thresholds for requirements."""
    
    HIGH = "high"      # >= 0.9
    MEDIUM = "medium"  # >= 0.7 && < 0.9
    LOW = "low"        # < 0.7


def get_confidence_level(confidence: float) -> ConfidenceLevel:
    """Convert numeric confidence to level classification.
    
    Args:
        confidence: Confidence score between 0.0 and 1.0
        
    Returns:
        Corresponding confidence level enum
    """
    if confidence >= 0.9:
        return ConfidenceLevel.HIGH
    elif confidence >= 0.7:
        return ConfidenceLevel.MEDIUM
    else:
        return ConfidenceLevel.LOW


class RequirementProposal(BaseModel):
    """A single requirement proposal with confidence and rationale.
    
    Represents a proposed requirement extracted from visual analysis,
    including metadata about confidence and reasoning.
    """
    
    id: str = Field(..., description="Unique identifier for the requirement")
    category: RequirementCategory = Field(..., description="Requirement category")
    name: str = Field(..., description="Name of the requirement (e.g., 'variant', 'onClick')")
    values: Optional[List[str]] = Field(
        default=None,
        description="Possible values for props (e.g., ['primary', 'secondary'])"
    )
    required: Optional[bool] = Field(
        default=None,
        description="Whether this requirement is required (for events/a11y)"
    )
    description: Optional[str] = Field(
        default=None,
        description="Description of the requirement (for states/a11y)"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score between 0.0 and 1.0"
    )
    rationale: str = Field(
        ...,
        description="Explanation of why this requirement was proposed"
    )
    approved: bool = Field(
        default=False,
        description="Whether the requirement has been approved by the user"
    )
    edited: bool = Field(
        default=False,
        description="Whether the requirement has been edited by the user"
    )


class ComponentClassification(BaseModel):
    """Result of component type inference.
    
    Contains the primary component type detected along with
    alternative candidates in ambiguous cases.
    """
    
    component_type: ComponentType = Field(..., description="Primary detected component type")
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence in the primary classification"
    )
    candidates: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Alternative candidates with their confidence scores"
    )
    rationale: str = Field(
        ...,
        description="Explanation of classification decision"
    )


class RequirementState(BaseModel):
    """State object for LangGraph requirement proposal orchestrator.
    
    Maintains state throughout the requirement proposal workflow,
    including component classification and all proposed requirements.
    """
    
    # Input data
    image_data: Optional[str] = Field(
        default=None,
        description="Base64-encoded image data or URL"
    )
    figma_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Figma frame/component metadata"
    )
    tokens: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Design tokens extracted from Epic 1"
    )
    
    # Classification result
    classification: Optional[ComponentClassification] = Field(
        default=None,
        description="Component type classification result"
    )
    
    # Proposed requirements by category
    props_proposals: List[RequirementProposal] = Field(
        default_factory=list,
        description="Proposed prop requirements"
    )
    events_proposals: List[RequirementProposal] = Field(
        default_factory=list,
        description="Proposed event requirements"
    )
    states_proposals: List[RequirementProposal] = Field(
        default_factory=list,
        description="Proposed state/variant requirements"
    )
    accessibility_proposals: List[RequirementProposal] = Field(
        default_factory=list,
        description="Proposed accessibility requirements"
    )
    
    # Metadata
    started_at: Optional[str] = Field(
        default=None,
        description="ISO timestamp when proposal started"
    )
    completed_at: Optional[str] = Field(
        default=None,
        description="ISO timestamp when proposal completed"
    )
    error: Optional[str] = Field(
        default=None,
        description="Error message if proposal failed"
    )
    
    def get_all_proposals(self) -> List[RequirementProposal]:
        """Get all proposals from all categories.
        
        Returns:
            Combined list of all requirement proposals
        """
        return (
            self.props_proposals +
            self.events_proposals +
            self.states_proposals +
            self.accessibility_proposals
        )
    
    def get_approved_proposals(self) -> List[RequirementProposal]:
        """Get only approved proposals.
        
        Returns:
            List of approved requirement proposals
        """
        return [p for p in self.get_all_proposals() if p.approved]
