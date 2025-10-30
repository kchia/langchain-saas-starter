"""Service for exporting approved requirements with audit trail.

This service handles the export of approved requirements to JSON format,
stores them in the database for audit compliance, and provides integration
points for Epic 3 (Pattern Retrieval) and Epic 4 (Code Generation).
"""

import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.types.requirement_types import (
    RequirementProposal,
    ComponentType,
    RequirementCategory
)
from src.core.models import RequirementExport
from src.core.logging import get_logger

logger = get_logger(__name__)


class RequirementExporter:
    """Service for exporting and storing approved requirements.

    This service provides:
    - Export approved requirements to JSON format
    - Store exports in database with complete audit trail
    - Generate export previews
    - Track usage in Epic 3/4 pipelines
    - Calculate quality metrics
    """

    def __init__(self, db_session: AsyncSession):
        """Initialize the exporter with a database session.

        Args:
            db_session: Async SQLAlchemy session for database operations
        """
        self.db = db_session

    async def export_requirements(
        self,
        component_type: ComponentType,
        component_confidence: float,
        proposals_by_category: Dict[str, List[RequirementProposal]],
        source_type: str = "screenshot",
        source_metadata: Optional[Dict[str, Any]] = None,
        tokens: Optional[Dict[str, Any]] = None,
        proposal_latency_ms: Optional[int] = None,
        approval_duration_ms: Optional[int] = None,
        proposed_at: Optional[datetime] = None,
        approved_at: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Export approved requirements to JSON and store in database.

        Args:
            component_type: Detected component type
            component_confidence: Confidence score for component classification
            proposals_by_category: Dictionary of proposals grouped by category
            source_type: Source type (figma, screenshot, design_file)
            source_metadata: Optional metadata about the source
            tokens: Design tokens used as context from Epic 1
            proposal_latency_ms: Time taken for AI proposal
            approval_duration_ms: Time user spent reviewing
            proposed_at: When proposal was generated
            approved_at: When user approved

        Returns:
            dict: Export result with export_id, JSON data, and metadata
        """
        # Generate unique export ID
        export_id = str(uuid.uuid4())

        # Get only approved requirements
        approved_requirements = self._get_approved_requirements(proposals_by_category)

        # Calculate statistics
        total_requirements = sum(len(reqs) for reqs in proposals_by_category.values())
        approved_count = sum(len(reqs) for reqs in approved_requirements.values())
        edited_count = self._count_edited_requirements(approved_requirements)
        custom_added_count = self._count_custom_requirements(approved_requirements)

        # Build export JSON
        export_data = self._build_export_json(
            component_type=component_type,
            component_confidence=component_confidence,
            requirements=approved_requirements,
            export_id=export_id,
            source_metadata=source_metadata,
            tokens=tokens,
        )

        # Store in database for audit trail
        try:
            db_export = RequirementExport(
                export_id=export_id,
                component_type=component_type.value,
                component_confidence=component_confidence,
                requirements=approved_requirements,
                source_type=source_type,
                source_metadata=source_metadata,
                tokens=tokens,
                total_requirements=total_requirements,
                approved_count=approved_count,
                edited_count=edited_count,
                custom_added_count=custom_added_count,
                proposal_latency_ms=proposal_latency_ms,
                approval_duration_ms=approval_duration_ms,
                proposed_at=proposed_at or datetime.now(timezone.utc),
                approved_at=approved_at,
                exported_at=datetime.now(timezone.utc),
                user_edit_rate=(edited_count / total_requirements) if total_requirements > 0 else 0.0,
                status="exported",
            )

            self.db.add(db_export)
            await self.db.commit()
            await self.db.refresh(db_export)

            logger.info(
                f"Requirements exported successfully: {export_id}",
                extra={
                    "extra": {
                        "export_id": export_id,
                        "component_type": component_type.value,
                        "total_requirements": total_requirements,
                        "approved_count": approved_count,
                        "edited_count": edited_count,
                    }
                },
            )

            return {
                "export_id": export_id,
                "export_data": export_data,
                "database_record": db_export.get_approval_summary(),
                "status": "success",
            }

        except Exception as e:
            logger.error(f"Failed to export requirements: {e}")
            await self.db.rollback()
            raise

    def _get_approved_requirements(
        self, proposals_by_category: Dict[str, List[RequirementProposal]]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Filter and convert approved requirements to dict format.

        Args:
            proposals_by_category: All proposals grouped by category

        Returns:
            dict: Approved requirements as dictionaries
        """
        approved = {}

        for category, proposals in proposals_by_category.items():
            approved_in_category = []
            for proposal in proposals:
                if proposal.approved:
                    approved_in_category.append(proposal.model_dump())

            approved[category] = approved_in_category

        return approved

    def _count_edited_requirements(
        self, approved_requirements: Dict[str, List[Dict[str, Any]]]
    ) -> int:
        """Count how many requirements were edited by the user.

        Args:
            approved_requirements: Approved requirements by category

        Returns:
            int: Count of edited requirements
        """
        count = 0
        for requirements in approved_requirements.values():
            count += sum(1 for req in requirements if req.get("edited", False))
        return count

    def _count_custom_requirements(
        self, approved_requirements: Dict[str, List[Dict[str, Any]]]
    ) -> int:
        """Count custom requirements added by user (not AI-generated).

        Custom requirements typically have confidence = 1.0 and rationale
        indicating manual addition.

        Args:
            approved_requirements: Approved requirements by category

        Returns:
            int: Count of custom requirements
        """
        count = 0
        for requirements in approved_requirements.values():
            for req in requirements:
                # Custom requirements have confidence 1.0 and "manually added" in rationale
                if req.get("confidence") == 1.0 and "manually added" in req.get("rationale", "").lower():
                    count += 1
        return count

    def _build_export_json(
        self,
        component_type: ComponentType,
        component_confidence: float,
        requirements: Dict[str, List[Dict[str, Any]]],
        export_id: str,
        source_metadata: Optional[Dict[str, Any]],
        tokens: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Build the export JSON structure.

        This format is used by Epic 3 (Pattern Retrieval) and
        Epic 4 (Code Generation) as input.

        Args:
            component_type: Detected component type
            component_confidence: Classification confidence
            requirements: Approved requirements by category
            export_id: Unique export identifier
            source_metadata: Optional source metadata
            tokens: Design tokens from Epic 1

        Returns:
            dict: Structured export data
        """
        return {
            "exportId": export_id,
            "componentType": component_type.value,
            "componentConfidence": component_confidence,
            "requirements": requirements,
            "metadata": {
                "exportedAt": datetime.now(timezone.utc).isoformat(),
                "source": source_metadata or {},
                "tokens": tokens or {},
                "totalRequirements": sum(len(reqs) for reqs in requirements.values()),
                "requirementsByCategory": {
                    category: len(reqs) for category, reqs in requirements.items()
                },
            },
        }

    async def get_export_preview(
        self,
        proposals_by_category: Dict[str, List[RequirementProposal]],
        component_type: ComponentType,
        component_confidence: float,
    ) -> Dict[str, Any]:
        """Generate a preview of what will be exported.

        This allows users to review the export before committing.

        Args:
            proposals_by_category: All proposals grouped by category
            component_type: Detected component type
            component_confidence: Classification confidence

        Returns:
            dict: Export preview with statistics
        """
        approved_requirements = self._get_approved_requirements(proposals_by_category)

        total_requirements = sum(len(reqs) for reqs in proposals_by_category.values())
        approved_count = sum(len(reqs) for reqs in approved_requirements.values())
        edited_count = self._count_edited_requirements(approved_requirements)

        return {
            "componentType": component_type.value,
            "componentConfidence": component_confidence,
            "statistics": {
                "totalProposed": total_requirements,
                "totalApproved": approved_count,
                "approvalRate": approved_count / total_requirements if total_requirements > 0 else 0,
                "editedCount": edited_count,
                "editRate": edited_count / approved_count if approved_count > 0 else 0,
                "byCategory": {
                    category: {
                        "approved": len(reqs),
                        "edited": sum(1 for req in reqs if req.get("edited", False)),
                    }
                    for category, reqs in approved_requirements.items()
                },
            },
            "preview": approved_requirements,
        }

    async def mark_used_in_pattern_retrieval(self, export_id: str) -> bool:
        """Mark that this export was used in Epic 3 pattern retrieval.

        Args:
            export_id: Export identifier

        Returns:
            bool: True if update successful
        """
        try:
            result = await self.db.execute(
                select(RequirementExport).where(RequirementExport.export_id == export_id)
            )
            export = result.scalar_one_or_none()

            if not export:
                logger.error(f"Export not found: {export_id}")
                return False

            export.used_in_pattern_retrieval = True
            export.pattern_retrieval_at = datetime.now(timezone.utc)
            await self.db.commit()

            logger.info(f"Marked export {export_id} as used in pattern retrieval")
            return True

        except Exception as e:
            logger.error(f"Failed to mark export as used in pattern retrieval: {e}")
            await self.db.rollback()
            return False

    async def mark_used_in_code_generation(self, export_id: str) -> bool:
        """Mark that this export was used in Epic 4 code generation.

        Args:
            export_id: Export identifier

        Returns:
            bool: True if update successful
        """
        try:
            result = await self.db.execute(
                select(RequirementExport).where(RequirementExport.export_id == export_id)
            )
            export = result.scalar_one_or_none()

            if not export:
                logger.error(f"Export not found: {export_id}")
                return False

            export.used_in_code_generation = True
            export.code_generation_at = datetime.now(timezone.utc)
            await self.db.commit()

            logger.info(f"Marked export {export_id} as used in code generation")
            return True

        except Exception as e:
            logger.error(f"Failed to mark export as used in code generation: {e}")
            await self.db.rollback()
            return False

    async def get_export_by_id(self, export_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve an export by ID.

        Args:
            export_id: Export identifier

        Returns:
            dict: Export data or None if not found
        """
        try:
            result = await self.db.execute(
                select(RequirementExport).where(RequirementExport.export_id == export_id)
            )
            export = result.scalar_one_or_none()

            if not export:
                return None

            return {
                "export_id": export.export_id,
                "component_type": export.component_type,
                "component_confidence": export.component_confidence,
                "requirements": export.requirements,
                "source_metadata": export.source_metadata,
                "tokens": export.tokens,
                "summary": export.get_approval_summary(),
            }

        except Exception as e:
            logger.error(f"Failed to retrieve export {export_id}: {e}")
            return None

    async def get_recent_exports(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent requirement exports.

        Args:
            limit: Maximum number of exports to return

        Returns:
            list: Recent exports with summaries
        """
        try:
            result = await self.db.execute(
                select(RequirementExport)
                .order_by(RequirementExport.exported_at.desc())
                .limit(limit)
            )
            exports = result.scalars().all()

            return [export.get_approval_summary() for export in exports]

        except Exception as e:
            logger.error(f"Failed to retrieve recent exports: {e}")
            return []
