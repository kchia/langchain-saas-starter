"""Requirement proposal orchestrator using LangGraph.

This module orchestrates the multi-agent requirement proposal workflow,
coordinating component classification and requirement analysis.
"""

import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from PIL import Image

from src.types.requirement_types import RequirementState, ComponentClassification
from src.agents.component_classifier import ComponentClassifier
from src.agents.props_proposer import PropsProposer
from src.agents.events_proposer import EventsProposer
from src.agents.states_proposer import StatesProposer
from src.agents.accessibility_proposer import AccessibilityProposer
from src.core.tracing import traced
from src.core.logging import get_logger

logger = get_logger(__name__)


class RequirementOrchestrator:
    """Orchestrate the requirement proposal workflow.
    
    This orchestrator manages the multi-step workflow for analyzing
    components and proposing requirements across all categories:
    props, events, states, and accessibility.
    """
    
    def __init__(self, openai_api_key: Optional[str] = None):
        """Initialize the requirement orchestrator.
        
        Args:
            openai_api_key: OpenAI API key for AI agents
        """
        self.classifier = ComponentClassifier(api_key=openai_api_key)
        # Initialize all requirement proposers
        self.props_proposer = PropsProposer(api_key=openai_api_key)
        self.events_proposer = EventsProposer(api_key=openai_api_key)
        self.states_proposer = StatesProposer(api_key=openai_api_key)
        self.a11y_proposer = AccessibilityProposer(api_key=openai_api_key)
    
    @traced(run_name="propose_requirements")
    async def propose_requirements(
        self,
        image: Image.Image,
        figma_data: Optional[Dict[str, Any]] = None,
        tokens: Optional[Dict[str, Any]] = None,
    ) -> RequirementState:
        """Run the full requirement proposal workflow.
        
        This method coordinates the multi-agent workflow:
        1. Classify component type
        2. Propose props requirements
        3. Propose events requirements
        4. Propose states requirements
        5. Propose accessibility requirements
        
        Args:
            image: Component screenshot as PIL Image
            figma_data: Optional Figma metadata
            tokens: Optional design tokens from Epic 1
            
        Returns:
            RequirementState with classification and all proposals
        """
        # Initialize state
        state = RequirementState(
            figma_data=figma_data,
            tokens=tokens,
            started_at=datetime.now(timezone.utc).isoformat()
        )
        
        try:
            logger.info("Starting requirement proposal workflow")
            
            # Step 1: Classify component type
            logger.info("Step 1: Classifying component type")
            classification = await self.classifier.classify_component(
                image, figma_data
            )
            state.classification = classification
            
            logger.info(
                f"Classification complete: {classification.component_type.value}",
                extra={
                    "extra": {
                        "component_type": classification.component_type.value,
                        "confidence": classification.confidence,
                    }
                }
            )
            
            # Step 2: Propose props requirements
            logger.info("Step 2: Proposing props requirements")
            if self.props_proposer:
                state.props_proposals = await self.props_proposer.propose(
                    image, state.classification, tokens
                )
                logger.info(
                    f"Props proposals complete: {len(state.props_proposals)} proposals",
                    extra={"extra": {"count": len(state.props_proposals)}}
                )
            
            # Step 3: Propose events requirements
            logger.info("Step 3: Proposing events requirements")
            if self.events_proposer:
                state.events_proposals = await self.events_proposer.propose(
                    image, state.classification, tokens
                )
                logger.info(
                    f"Events proposals complete: {len(state.events_proposals)} proposals",
                    extra={"extra": {"count": len(state.events_proposals)}}
                )
            
            # Step 4: Propose states requirements
            logger.info("Step 4: Proposing states requirements")
            if self.states_proposer:
                state.states_proposals = await self.states_proposer.propose(
                    image, state.classification, tokens
                )
                logger.info(
                    f"States proposals complete: {len(state.states_proposals)} proposals",
                    extra={"extra": {"count": len(state.states_proposals)}}
                )
            
            # Step 5: Propose accessibility requirements
            logger.info("Step 5: Proposing accessibility requirements")
            if self.a11y_proposer:
                state.accessibility_proposals = await self.a11y_proposer.propose(
                    image, state.classification, tokens
                )
                logger.info(
                    f"Accessibility proposals complete: {len(state.accessibility_proposals)} proposals",
                    extra={"extra": {"count": len(state.accessibility_proposals)}}
                )
            
            # Mark completion
            state.completed_at = datetime.now(timezone.utc).isoformat()
            
            # Calculate latency
            start_time = datetime.fromisoformat(state.started_at)
            end_time = datetime.fromisoformat(state.completed_at)
            latency = (end_time - start_time).total_seconds()
            
            logger.info(
                f"Requirement proposal workflow complete",
                extra={
                    "extra": {
                        "latency_seconds": latency,
                        "total_proposals": len(state.get_all_proposals()),
                        "target_latency": 15.0,  # p50 target
                    }
                }
            )
            
            return state
            
        except Exception as e:
            logger.error(f"Requirement proposal workflow failed: {e}")
            state.error = str(e)
            state.completed_at = datetime.now(timezone.utc).isoformat()
            raise
    
    async def propose_requirements_parallel(
        self,
        image: Image.Image,
        figma_data: Optional[Dict[str, Any]] = None,
        tokens: Optional[Dict[str, Any]] = None,
    ) -> RequirementState:
        """Run requirement proposal with parallel execution.
        
        This variant runs all requirement proposers in parallel after
        classification to minimize latency. This is the recommended
        approach for production deployments targeting p50 latency ≤15s.
        
        Args:
            image: Component screenshot as PIL Image
            figma_data: Optional Figma metadata
            tokens: Optional design tokens from Epic 1
            
        Returns:
            RequirementState with classification and all proposals
        """
        # Initialize state
        state = RequirementState(
            figma_data=figma_data,
            tokens=tokens,
            started_at=datetime.now(timezone.utc).isoformat()
        )
        
        try:
            # Step 1: Classify component type (sequential)
            classification = await self.classifier.classify_component(
                image, figma_data
            )
            state.classification = classification
            
            # Steps 2-5: Run proposers in parallel for better performance
            results = await asyncio.gather(
                self.props_proposer.propose(image, classification, tokens),
                self.events_proposer.propose(image, classification, tokens),
                self.states_proposer.propose(image, classification, tokens),
                self.a11y_proposer.propose(image, classification, tokens),
            )
            state.props_proposals = results[0]
            state.events_proposals = results[1]
            state.states_proposals = results[2]
            state.accessibility_proposals = results[3]
            
            logger.info(
                f"Parallel requirement proposal complete",
                extra={
                    "extra": {
                        "props_count": len(state.props_proposals),
                        "events_count": len(state.events_proposals),
                        "states_count": len(state.states_proposals),
                        "accessibility_count": len(state.accessibility_proposals),
                        "total_proposals": len(state.get_all_proposals()),
                    }
                }
            )
            
            state.completed_at = datetime.now(timezone.utc).isoformat()
            return state
            
        except Exception as e:
            logger.error(f"Parallel requirement proposal failed: {e}")
            state.error = str(e)
            state.completed_at = datetime.now(timezone.utc).isoformat()
            raise
