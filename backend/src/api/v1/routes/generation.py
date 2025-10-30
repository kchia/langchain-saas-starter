"""API routes for code generation."""

from typing import Any, Dict

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
import time

# Try to import LangSmith for tracing (optional dependency)
try:
    from langsmith import traceable
    LANGSMITH_AVAILABLE = True
except ImportError:
    # Create a no-op decorator if LangSmith is not available
    def traceable(*args, **kwargs):
        def decorator(func):
            return func
        return decorator
    LANGSMITH_AVAILABLE = False

from ....core.logging import get_logger
from ....core.tracing import get_current_run_id, get_trace_url
from ....generation.generator_service import GeneratorService
from ....generation.types import GenerationRequest, GenerationResult
from ....security.code_sanitizer import CodeSanitizer
from ....security.metrics import record_code_sanitization_failure
from ....api.middleware.session_tracking import get_session_id

logger = get_logger(__name__)

# Initialize code sanitizer (singleton)
code_sanitizer = CodeSanitizer()

router = APIRouter(prefix="/generation", tags=["generation"])

# Initialize generator service (singleton)
generator_service = GeneratorService()

# Prometheus metrics (optional - only if prometheus_client is available)
try:
    from prometheus_client import Histogram
    
    generation_latency_seconds = Histogram(
        "generation_latency_seconds",
        "Code generation latency in seconds",
        ["pattern_id", "success"]
    )
    
    METRICS_ENABLED = True
except ImportError:
    METRICS_ENABLED = False
    logger.warning("Prometheus metrics not available for generation endpoint")


@router.post("/generate")
@traceable(run_type="chain", name="generate_component_api")
async def generate_component(
    request: GenerationRequest
) -> Dict[str, Any]:
    """
    Generate production-ready React/TypeScript component code.
    
    Takes a pattern ID, design tokens, and requirements, then generates:
    - Component.tsx with TypeScript types
    - Component.stories.tsx for Storybook
    - CSS variables and Tailwind classes
    - ARIA attributes and semantic HTML
    
    LLM-first pipeline includes:
    - LLM code generation with structured output
    - TypeScript and ESLint validation with auto-fix loop
    - Security sanitization for code vulnerabilities
    - Quality scoring and metrics
    
    Args:
        request: GenerationRequest with pattern_id, tokens, requirements
        
    Returns:
        JSON response with:
        - code: Generated component and stories code
        - metadata: Pattern, tokens, requirements info
        - timing: Latency breakdown by stage
        - validation_results: TypeScript/ESLint validation details (if available)
        - quality_scores: Code quality metrics (if available)
        - security_issues: Security sanitization results
        - provenance: Generation metadata for tracking
        
    Raises:
        HTTPException: For validation or generation errors
    """
    logger.info(
        f"Received generation request for pattern: {request.pattern_id}"
    )
    
    start_time = time.time()
    success = False
    
    try:
        # Validate request
        if not request.pattern_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="pattern_id is required"
            )
        
        if not request.tokens:
            logger.warning("No tokens provided, using fallback tokens")
            # Fallback tokens could be generated from defaults if needed
        
        if not request.requirements:
            logger.warning("No requirements provided, using pattern defaults")
        
        # Generate component
        logger.info(f"Starting generation for pattern: {request.pattern_id}")
        
        result: GenerationResult = await generator_service.generate(request)

        # Check if generation catastrophically failed (no code at all)
        if not result.success and not result.component_code:
            logger.error(f"Generation failed: {result.error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Code generation failed: {result.error}"
            )

        # If we have code but validation failed, continue and return it with validation errors
        if not result.success:
            logger.warning(f"Code generated but validation failed: {result.error}")
        
        # Run code sanitization on generated component code
        logger.info("Running code sanitization on generated component")
        sanitization_result = code_sanitizer.sanitize(
            result.component_code,
            include_snippets=True
        )
        
        # Log and record metrics for security issues
        if not sanitization_result.is_safe:
            logger.warning(
                f"Code sanitization detected {sanitization_result.issues_count} security issues",
                extra={
                    "event": "code_sanitization_issues",
                    "pattern_id": request.pattern_id,
                    "issues_count": sanitization_result.issues_count,
                    "critical_count": sanitization_result.critical_count,
                    "high_count": sanitization_result.high_count,
                }
            )
            
            # Record metrics for each issue
            for issue in sanitization_result.issues:
                record_code_sanitization_failure(
                    pattern=issue.type.value,
                    severity=issue.severity.value
                )
        else:
            logger.info("Code sanitization passed - no security issues detected")
        
        # Calculate total latency
        total_latency_ms = int((time.time() - start_time) * 1000)
        success = True
        
        # Get trace metadata for observability
        # Note: session_id is always available from middleware
        # trace_url will be None if LangSmith tracing is disabled or unavailable
        # This is expected and handled gracefully by the frontend
        session_id = get_session_id()
        run_id = get_current_run_id()
        trace_url = get_trace_url(run_id) if run_id else None
        
        # Add trace metadata to result
        result.metadata.session_id = session_id
        result.metadata.trace_url = trace_url
        
        # Record Prometheus metric
        if METRICS_ENABLED:
            generation_latency_seconds.labels(
                pattern_id=request.pattern_id,
                success="true"
            ).observe((time.time() - start_time))
        
        logger.info(
            f"Generation completed successfully in {total_latency_ms}ms",
            extra={
                "extra": {
                    "pattern_id": request.pattern_id,
                    "latency_ms": total_latency_ms,
                    "token_count": result.metadata.token_count,
                    "lines_of_code": result.metadata.lines_of_code,
                    "session_id": session_id,
                    "trace_url": trace_url,
                }
            }
        )
        
        # Return successful response matching frontend GenerationResponse type
        response = {
            "code": {
                "component": result.component_code,
                "stories": result.stories_code,
                "showcase": result.files.get("showcase", ""),
                "app": result.files.get("app", ""),
                "tokens_json": result.files.get("tokens", None),
                "requirements_json": result.files.get("requirements", None)
            },
            "metadata": {
                "pattern_used": request.pattern_id,
                "pattern_version": "1.0.0",
                "tokens_applied": result.metadata.token_count,
                "requirements_implemented": result.metadata.requirements_implemented,
                "lines_of_code": result.metadata.lines_of_code,
                "imports_count": result.metadata.imports_count,
                "has_typescript_errors": result.metadata.has_typescript_errors,
                "has_accessibility_warnings": result.metadata.has_accessibility_warnings,
                "trace_url": trace_url,
                "session_id": session_id,
            },
            "timing": {
                "total_ms": result.metadata.latency_ms,
                "parsing_ms": result.metadata.stage_latencies.get("parsing", 0),
                "injection_ms": result.metadata.stage_latencies.get("injecting", 0),
                "generation_ms": result.metadata.stage_latencies.get("generating", 0),
                "assembly_ms": result.metadata.stage_latencies.get("assembling", 0),
                "formatting_ms": result.metadata.stage_latencies.get("formatting", 0),
                # New LLM-first stages
                "llm_generating_ms": result.metadata.stage_latencies.get("llm_generating", 0),
                "validating_ms": result.metadata.stage_latencies.get("validating", 0),
                "post_processing_ms": result.metadata.stage_latencies.get("post_processing", 0)
            },
            "provenance": {
                "pattern_id": request.pattern_id,
                "pattern_version": "1.0.0",
                "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "tokens_hash": "placeholder",  # TODO: Calculate hash
                "requirements_hash": "placeholder"  # TODO: Calculate hash
            },
            # Always return "completed" - validation details are in validation_results
            "status": "completed"
        }
        
        # Initialize validation_results - required for security_sanitization below
        # If LLM validation was run, use those results; otherwise use minimal defaults
        if result.validation_results:
            # Flatten validation results to match frontend schema
            # Nest inside metadata as per frontend TypeScript types
            response["metadata"]["validation_results"] = {
                "attempts": result.validation_results.attempts,
                "final_status": result.validation_results.final_status,
                "typescript_passed": result.validation_results.typescript_passed,
                "typescript_errors": [error.dict() for error in result.validation_results.typescript_errors],
                "typescript_warnings": [error.dict() for error in result.validation_results.typescript_warnings],
                "eslint_passed": result.validation_results.eslint_passed,
                "eslint_errors": [error.dict() for error in result.validation_results.eslint_errors],
                "eslint_warnings": [error.dict() for error in result.validation_results.eslint_warnings]
            }

            # Add quality scores with frontend-compatible field names
            # Nest inside metadata as per frontend TypeScript types
            response["metadata"]["quality_scores"] = {
                "overall": result.validation_results.overall_score,
                "linting": result.validation_results.linting_score,
                "type_safety": result.validation_results.type_safety_score,
                "compilation": result.validation_results.compilation_success,  # Match frontend field name
            }
        else:
            # No LLM validation - initialize with minimal validation_results
            # This ensures validation_results exists before adding security_sanitization
            # Nest inside metadata as per frontend TypeScript types
            response["metadata"]["validation_results"] = {
                "attempts": 0,
                "final_status": "skipped",
                "typescript_passed": True,
                "typescript_errors": [],
                "typescript_warnings": [],
                "eslint_passed": True,
                "eslint_errors": [],
                "eslint_warnings": []
            }
        
        # Add LLM token usage if available
        if result.metadata.llm_token_usage:
            response["metadata"]["llm_token_usage"] = result.metadata.llm_token_usage
            response["metadata"]["validation_attempts"] = result.metadata.validation_attempts
        
        # Add security sanitization results to validation_results (Epic 003 - Story 3.2)
        # Frontend expects security_sanitization nested in metadata.validation_results
        response["metadata"]["validation_results"]["security_sanitization"] = {
            "is_safe": sanitization_result.is_safe,
            "issues": [
                {
                    "type": issue.type.value,
                    "severity": issue.severity.value,
                    "line": issue.line,
                    "column": issue.column,
                    "message": issue.message,
                    "pattern": issue.pattern,
                    "code_snippet": issue.code_snippet
                }
                for issue in sanitization_result.issues
            ],
            "sanitized_code": None  # Optional field for future use
        }
        
        return response
    
    except HTTPException:
        # Record failure metric
        if METRICS_ENABLED:
            generation_latency_seconds.labels(
                pattern_id=request.pattern_id,
                success="false"
            ).observe((time.time() - start_time))
        # Re-raise HTTP exceptions
        raise
    
    except FileNotFoundError as e:
        # Record failure metric
        if METRICS_ENABLED:
            generation_latency_seconds.labels(
                pattern_id=request.pattern_id,
                success="false"
            ).observe((time.time() - start_time))
        logger.error(f"Pattern not found: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pattern not found: {request.pattern_id}"
        )
    
    except ValueError as e:
        # Record failure metric
        if METRICS_ENABLED:
            generation_latency_seconds.labels(
                pattern_id=request.pattern_id,
                success="false"
            ).observe((time.time() - start_time))
        logger.error(f"Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request: {str(e)}"
        )
    
    except Exception as e:
        # Record failure metric
        if METRICS_ENABLED:
            generation_latency_seconds.labels(
                pattern_id=request.pattern_id,
                success="false"
            ).observe((time.time() - start_time))
        logger.error(f"Unexpected error during generation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/patterns")
async def list_available_patterns() -> Dict[str, Any]:
    """
    List all available component patterns.
    
    Returns:
        JSON response with list of available pattern IDs
    """
    logger.info("Listing available patterns")
    
    try:
        # Use pattern parser to list patterns
        from ....generation.pattern_parser import PatternParser
        
        parser = PatternParser()
        patterns = parser.list_available_patterns()
        
        logger.info(f"Found {len(patterns)} available patterns")
        
        return {
            "success": True,
            "patterns": patterns,
            "count": len(patterns)
        }
    
    except Exception as e:
        logger.error(f"Error listing patterns: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list patterns: {str(e)}"
        )


@router.get("/status/{pattern_id}")
async def get_generation_status(pattern_id: str) -> Dict[str, Any]:
    """
    Get current generation status (for progress tracking).
    
    Args:
        pattern_id: ID of pattern being generated
        
    Returns:
        JSON response with current stage and progress
    """
    logger.info(f"Getting generation status for pattern: {pattern_id}")
    
    try:
        # Get current stage from generator service
        current_stage = generator_service.get_current_stage()
        stage_latencies = generator_service.get_stage_latencies()
        
        return {
            "success": True,
            "pattern_id": pattern_id,
            "current_stage": current_stage.value,
            "stage_latencies": {
                stage.value: latency 
                for stage, latency in stage_latencies.items()
            }
        }
    
    except Exception as e:
        logger.error(f"Error getting generation status: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get status: {str(e)}"
        )
