"""Events requirement proposer.

This module analyzes components to propose event handler requirements
such as onClick, onChange, onHover, and onFocus.
"""

import json
import os
from typing import Any, Dict, List, Optional
from openai import AsyncOpenAI
from PIL import Image

from .base_proposer import BaseRequirementProposer
from src.types.requirement_types import (
    RequirementProposal,
    RequirementCategory,
    ComponentClassification,
)
from src.services.image_processor import prepare_image_for_vision_api
from src.prompts.events_proposer import create_events_prompt
from src.core.tracing import traced
from src.core.logging import get_logger

logger = get_logger(__name__)


class EventsProposer(BaseRequirementProposer):
    """Propose event handler requirements from component analysis.
    
    Detects:
    - onClick handlers for clickable elements
    - onChange handlers for inputs
    - onHover/onFocus handlers for interactive states
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the events proposer.
        
        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
        """
        super().__init__(RequirementCategory.EVENTS)
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        self.client = AsyncOpenAI(api_key=self.api_key)
        # gpt-4o has vision capabilities and is the recommended model
        self.model = "gpt-4o"
    
    @traced(run_name="propose_events")
    async def propose(
        self,
        image: Image.Image,
        classification: ComponentClassification,
        tokens: Optional[Dict[str, Any]] = None,
        retry_count: int = 0,
    ) -> List[RequirementProposal]:
        """Propose event handler requirements for the component.
        
        Args:
            image: Component screenshot
            classification: Component type classification
            tokens: Optional design tokens
            retry_count: Current retry attempt (for internal use)
            
        Returns:
            List of proposed event handler requirements
        """
        logger.info(
            f"Proposing events for {classification.component_type.value}",
            extra={
                "extra": {
                    "component_type": classification.component_type.value,
                    "has_tokens": tokens is not None,
                    "retry_count": retry_count,
                }
            }
        )
        
        try:
            # Prepare image
            image_url = prepare_image_for_vision_api(image)

            # Build events analysis prompt using the prompts module
            prompt = create_events_prompt(
                classification.component_type.value,
                figma_data=None,  # Will be passed from orchestrator in future
            )

            # Call GPT-4V for events analysis
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url
                                }
                            }
                        ]
                    }
                ],
                response_format={"type": "json_object"},
                max_tokens=1500,
                temperature=0.2,
            )
            
            # Parse response
            result = json.loads(response.choices[0].message.content)
            
            # Convert to proposals
            proposals = self._parse_events_result(result, classification)
            
            # Log proposals
            for proposal in proposals:
                self.log_proposal(proposal)
            
            logger.info(
                f"Proposed {len(proposals)} events requirements",
                extra={"extra": {"count": len(proposals)}}
            )
            
            return proposals
            
        except Exception as e:
            if retry_count < self.max_retries:
                logger.warning(
                    f"Events proposal failed (attempt {retry_count + 1}), retrying: {e}",
                    extra={"extra": {"retry_count": retry_count, "error": str(e)}}
                )
                return await self.propose(
                    image, classification, tokens, retry_count + 1
                )
            else:
                logger.error(
                    f"Events proposal failed after {self.max_retries} retries",
                    extra={
                        "extra": {
                            "max_retries": self.max_retries,
                            "error": str(e),
                        }
                    }
                )
                # Return empty list instead of raising to allow workflow to continue
                return []
    
    def _parse_events_result(
        self,
        result: Dict[str, Any],
        classification: ComponentClassification
    ) -> List[RequirementProposal]:
        """Parse events analysis result into proposals.
        
        Args:
            result: Raw JSON result from GPT-4V
            classification: Component classification for context
            
        Returns:
            List of RequirementProposal objects
        """
        proposals = []
        events_list = result.get("events", [])
        
        for event_data in events_list:
            try:
                name = event_data.get("name", "unknown")
                required = event_data.get("required", False)
                visual_cues = event_data.get("visual_cues", [])
                base_confidence = float(event_data.get("confidence", 0.5))
                
                # Calculate adjusted confidence
                confidence = self.calculate_confidence(
                    base_confidence,
                    len(visual_cues),
                    min_cues=1,
                    max_cues=3
                )
                
                # Generate rationale
                rationale = self.generate_rationale(
                    name,
                    visual_cues,
                    source="visual analysis and interaction patterns"
                )
                
                # Add component type context to rationale
                rationale += f" (Component: {classification.component_type.value})"
                
                # Create proposal
                proposal = self.create_proposal(
                    name=name,
                    confidence=confidence,
                    rationale=rationale,
                    required=required,
                )
                
                proposals.append(proposal)
                
            except Exception as e:
                logger.warning(f"Failed to parse event: {e}")
                continue
        
        return proposals
