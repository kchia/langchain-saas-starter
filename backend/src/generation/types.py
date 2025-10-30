"""
Type definitions for the code generation module.
"""

from typing import Dict, List, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class GenerationStage(str, Enum):
    """Stages of the code generation pipeline."""
    # Legacy 8-stage pipeline (deprecated)
    PARSING = "parsing"
    INJECTING = "injecting"
    GENERATING = "generating"
    IMPLEMENTING = "implementing"
    ASSEMBLING = "assembling"
    FORMATTING = "formatting"
    
    # New 3-stage LLM-first pipeline
    LLM_GENERATING = "llm_generating"  # LLM generates component
    VALIDATING = "validating"  # TypeScript/ESLint validation + fixes
    POST_PROCESSING = "post_processing"  # Imports, provenance, formatting
    
    COMPLETE = "complete"


class GenerationRequest(BaseModel):
    """Request model for code generation."""
    pattern_id: str = Field(..., description="ID of the pattern to use")
    tokens: Dict[str, Any] = Field(..., description="Design tokens from extraction")
    requirements: List[Dict[str, Any]] = Field(..., description="Approved requirements as array")
    component_name: Optional[str] = Field(None, description="Optional custom component name")


class PatternStructure(BaseModel):
    """Simplified structured representation of a parsed pattern.
    
    For LLM-first generation, we only need:
    - Basic metadata (name, type, variants)
    - Complete pattern code as reference
    - Dependencies list
    """
    component_name: str = Field(..., description="Component name (e.g., 'Button')")
    component_type: str = Field(..., description="Component type (e.g., 'button', 'card', 'input')")
    code: str = Field(..., description="Complete pattern code (reference only)")
    variants: List[str] = Field(default_factory=list, description="List of variant names")
    dependencies: List[str] = Field(default_factory=list, description="List of dependency packages")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional pattern metadata")


class TokenMapping(BaseModel):
    """Mapping between design tokens and component styles."""
    colors: Dict[str, str] = Field(default_factory=dict)
    typography: Dict[str, str] = Field(default_factory=dict)
    spacing: Dict[str, str] = Field(default_factory=dict)
    css_variables: str = Field(default="")


class CodeParts(BaseModel):
    """Individual parts of the generated component code."""
    provenance_header: str = Field(default="")
    imports: List[str] = Field(default_factory=list)
    css_variables: str = Field(default="")
    type_definitions: str = Field(default="")
    component_code: str = Field(default="")
    storybook_stories: str = Field(default="")
    component_name: str = Field(default="")


class GenerationMetadata(BaseModel):
    """Metadata about the generation process."""
    latency_ms: int = Field(..., description="Total generation latency in milliseconds")
    stage_latencies: Dict[GenerationStage, int] = Field(default_factory=dict)
    token_count: int = Field(default=0, description="Number of tokens injected")
    lines_of_code: int = Field(default=0, description="Total lines of generated code")
    requirements_implemented: int = Field(default=0, description="Number of requirements implemented")
    
    # Pattern metadata for provenance tracking
    pattern_used: str = Field(default="", description="Pattern ID used for generation")
    pattern_version: str = Field(default="1.0.0", description="Pattern version")
    imports_count: int = Field(default=0, description="Number of imports in generated code")
    
    # Code quality indicators
    has_typescript_errors: bool = Field(default=False, description="Whether TypeScript errors exist")
    has_accessibility_warnings: bool = Field(default=False, description="Whether accessibility warnings exist")
    
    # New LLM-first metadata
    llm_token_usage: Optional[Dict[str, int]] = Field(None, description="LLM token usage")
    validation_attempts: int = Field(default=0, description="Number of validation attempts")
    quality_score: float = Field(default=0.0, description="Code quality score (0.0-1.0)")
    
    # Observability metadata
    trace_url: Optional[str] = Field(None, description="LangSmith trace URL")
    session_id: Optional[str] = Field(None, description="Request session ID")


class ValidationErrorDetail(BaseModel):
    """Detailed validation error information."""
    line: int = Field(..., description="Line number where error occurred")
    column: int = Field(..., description="Column number where error occurred")
    message: str = Field(..., description="Error message")
    rule_id: str = Field(..., description="Rule ID or error code")
    severity: str = Field(..., description="Severity level (error or warning)")
    
    def dict(self, *args, **kwargs):
        """Override dict() to include camelCase fields for frontend compatibility."""
        result = super().dict(*args, **kwargs)
        # Add camelCase aliases for frontend compatibility
        result['ruleId'] = result.get('rule_id', '')
        result['code'] = result.get('rule_id', '')  # Frontend may use 'code' field
        return result
    
    @classmethod
    def from_dataclass(cls, error: Any) -> "ValidationErrorDetail":
        """
        Convert ValidationError dataclass to ValidationErrorDetail Pydantic model.
        
        Args:
            error: ValidationError dataclass instance
        
        Returns:
            ValidationErrorDetail Pydantic model
        """
        return cls(
            line=error.line,
            column=error.column,
            message=error.message,
            rule_id=error.rule_id,
            severity=error.severity,
        )


class ValidationMetadata(BaseModel):
    """Metadata about code validation and fixing."""
    attempts: int = Field(..., description="Number of validation/fix attempts")
    final_status: str = Field(..., description="Final validation status: passed, failed, or skipped")
    
    # TypeScript validation
    typescript_passed: bool = Field(..., description="TypeScript compilation passed")
    typescript_errors: List[ValidationErrorDetail] = Field(default_factory=list, description="TypeScript errors with details")
    typescript_warnings: List[ValidationErrorDetail] = Field(default_factory=list, description="TypeScript warnings with details")
    
    # ESLint validation
    eslint_passed: bool = Field(..., description="ESLint validation passed")
    eslint_errors: List[ValidationErrorDetail] = Field(default_factory=list, description="ESLint errors with details")
    eslint_warnings: List[ValidationErrorDetail] = Field(default_factory=list, description="ESLint warnings with details")
    
    # Quality scores (0-100 scale for UI display)
    linting_score: int = Field(..., description="ESLint quality score (0-100)")
    type_safety_score: int = Field(..., description="TypeScript type safety score (0-100)")
    overall_score: int = Field(..., description="Overall code quality score (0-100)")
    
    # Legacy compatibility fields
    compilation_success: bool = Field(..., description="TypeScript compilation success (legacy)")
    lint_success: bool = Field(..., description="ESLint validation success (legacy)")


class GenerationResult(BaseModel):
    """Result of the code generation process."""
    component_code: str = Field(..., description="Generated component code")
    stories_code: str = Field(..., description="Generated Storybook stories code")
    files: Dict[str, str] = Field(..., description="Map of filename to content")
    metadata: GenerationMetadata = Field(..., description="Generation metadata")
    success: bool = Field(default=True)
    error: Optional[str] = Field(None, description="Error message if failed")
    
    # New LLM-first fields
    validation_results: Optional[ValidationMetadata] = Field(None, description="Validation results")
