"""
Generator Service - Orchestrate the full code generation pipeline.

This module coordinates all generation steps from pattern parsing through
code assembly, with LangSmith tracing for observability.

REFACTORED (Epic 4.5): Now uses LLM-first 3-stage pipeline instead of 8-stage template-based approach.
"""

import time
import os
from typing import Dict, Any, Optional, List
from pathlib import Path

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

from .types import (
    GenerationRequest,
    GenerationResult,
    GenerationStage,
    GenerationMetadata,
    ValidationMetadata,
    ValidationErrorDetail,
    CodeParts
)
from .pattern_parser import PatternParser
from .code_assembler import CodeAssembler
from .provenance import ProvenanceGenerator

# New LLM-first components
from .prompt_builder import PromptBuilder
from .llm_generator import LLMComponentGenerator, MockLLMGenerator
from .code_validator import CodeValidator
from .exemplar_loader import ExemplarLoader


class GeneratorService:
    """
    Orchestrate the full code generation pipeline with tracing.
    
    NEW (Epic 4.5): 3-stage LLM-first pipeline:
    1. LLM Generation - Single pass with full context
    2. Validation - TypeScript/ESLint with LLM fixes
    3. Post-Processing - Imports, provenance, formatting
    """
    
    def __init__(
        self,
        patterns_dir: Optional[Path] = None,
        use_llm: bool = True,
        api_key: Optional[str] = None,
    ):
        """
        Initialize generator service.
        
        Args:
            patterns_dir: Optional custom patterns directory
            use_llm: Whether to use LLM generation (True) or mock (False)
            api_key: Optional OpenAI API key
        """
        # Core components
        self.pattern_parser = PatternParser(patterns_dir)
        self.code_assembler = CodeAssembler()
        self.provenance_generator = ProvenanceGenerator()
        
        # New LLM-first components
        self.prompt_builder = PromptBuilder()
        self.exemplar_loader = ExemplarLoader()
        
        # Initialize LLM generator
        if use_llm and (api_key or os.getenv("OPENAI_API_KEY")):
            try:
                self.llm_generator = LLMComponentGenerator(api_key=api_key)
            except Exception:
                # Fall back to mock if LLM initialization fails
                self.llm_generator = MockLLMGenerator()
        else:
            self.llm_generator = MockLLMGenerator()
        
        # Initialize code validator with LLM generator
        # Set max_retries=0 to disable auto-fix retries (speeds up generation from ~97s to ~35s)
        # Set skip_eslint=True to disable ESLint validation (TypeScript validation is sufficient)
        # Validation still runs once to provide quality scores and error details
        self.code_validator = CodeValidator(
            llm_generator=self.llm_generator,
            max_retries=0,  # Disable retries for faster generation
            skip_eslint=True  # Skip ESLint - TypeScript validation covers all important checks
        )
        
        # Track current stage for progress updates
        self.current_stage = GenerationStage.LLM_GENERATING
        self.stage_latencies: Dict[GenerationStage, int] = {}
    
    def _normalize_requirements(self, requirements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Convert requirements list to dict format expected by backend.

        Frontend sends: [{name, category, approved}, ...]
        Backend expects: {props: [], events: [], states: [], accessibility: []}

        Args:
            requirements: List of requirement objects with category field

        Returns:
            Dict organized by category
        """
        result = {
            "props": [],
            "events": [],
            "states": [],
            "accessibility": [],
            "validation": [],
            "variants": []
        }

        for req in requirements:
            category = req.get("category", "props")
            # Map frontend categories to backend categories
            if category in result:
                result[category].append(req)

        return result

    @traceable(run_type="chain", name="generate_component_llm_first")
    async def generate(self, request: GenerationRequest) -> GenerationResult:
        """
        Generate component code using LLM-first 3-stage pipeline.
        
        NEW PIPELINE (Epic 4.5):
        1. LLM Generation - Single pass with full context
        2. Validation - TypeScript/ESLint with iterative LLM fixes  
        3. Post-Processing - Imports, provenance, formatting
        
        Args:
            request: GenerationRequest with pattern_id, tokens, requirements
        
        Returns:
            GenerationResult with generated code and metadata
        """
        start_time = time.time()
        
        # Normalize requirements from list to dict format
        requirements_dict = self._normalize_requirements(request.requirements)
        
        try:
            # ====== STAGE 1: LLM GENERATION ======
            self.current_stage = GenerationStage.LLM_GENERATING
            stage1_start = time.time()

            # Load pattern as reference
            pattern_structure = await self._parse_pattern_for_reference(request.pattern_id)

            # Build comprehensive prompt with exemplars
            prompts = self._build_generation_prompt(
                pattern_code=pattern_structure.code,
                component_name=request.component_name or pattern_structure.component_name,
                component_type=self._infer_component_type(request.pattern_id),
                tokens=request.tokens,
                requirements=requirements_dict,
            )
            
            # Generate code via LLM
            llm_result = await self.llm_generator.generate(
                system_prompt=prompts["system"],
                user_prompt=prompts["user"],
            )
            
            self.stage_latencies[GenerationStage.LLM_GENERATING] = int(
                (time.time() - stage1_start) * 1000
            )
            
            # ====== STAGE 2: VALIDATION ======
            self.current_stage = GenerationStage.VALIDATING
            stage2_start = time.time()

            # Store original showcase before validation (to preserve it)
            original_showcase_code = llm_result.showcase_code

            # Validate and fix code iteratively (only validates component_code)
            validation_result = await self.code_validator.validate_and_fix(
                code=llm_result.component_code,
                original_prompt=prompts["user"],
            )

            self.stage_latencies[GenerationStage.VALIDATING] = int(
                (time.time() - stage2_start) * 1000
            )
            
            # ====== STAGE 3: POST-PROCESSING ======
            self.current_stage = GenerationStage.POST_PROCESSING
            stage3_start = time.time()
            
            # Add provenance header
            final_component_code = self._add_provenance(
                validation_result.code,
                request.component_name or pattern_structure.component_name,
                request.pattern_id,
                request.tokens,
                requirements_dict,
            )
            
            # Use stories from LLM (already validated)
            final_stories_code = llm_result.stories_code

            # Use showcase from ORIGINAL LLM response (preserved from first generation)
            # Validation retries don't update showcase, so we keep the original
            final_showcase_code = original_showcase_code

            # Count imports in final code
            imports_count = len([line for line in final_component_code.split('\n') if line.strip().startswith('import')])

            # Count tokens applied (from request.tokens) - count actual nested values, not just categories
            token_count = self._count_nested_tokens(request.tokens) if request.tokens else 0

            self.stage_latencies[GenerationStage.POST_PROCESSING] = int(
                (time.time() - stage3_start) * 1000
            )

            # ====== BUILD RESULT ======
            self.current_stage = GenerationStage.COMPLETE

            total_latency_ms = int((time.time() - start_time) * 1000)
            component_name = request.component_name or pattern_structure.component_name

            # Generate App.tsx template for auto-discovery showcase
            app_tsx_template = self._generate_app_tsx_template()

            # Create result files including showcase and App.tsx
            # Include both filename-based keys AND direct keys for API compatibility
            result_files = {
                f"{component_name}.tsx": final_component_code,
                f"{component_name}.stories.tsx": final_stories_code,
                f"{component_name}.showcase.tsx": final_showcase_code,
                "App.tsx": app_tsx_template,
                # Add direct keys for API route to access
                "showcase": final_showcase_code,
                "app": app_tsx_template,
            }
            
            # Convert ValidationError dataclass to ValidationErrorDetail Pydantic models
            ts_errors = [ValidationErrorDetail.from_dataclass(e) for e in validation_result.typescript_errors]
            ts_warnings = [ValidationErrorDetail.from_dataclass(e) for e in validation_result.typescript_warnings]
            eslint_errors = [ValidationErrorDetail.from_dataclass(e) for e in validation_result.eslint_errors]
            eslint_warnings = [ValidationErrorDetail.from_dataclass(e) for e in validation_result.eslint_warnings]
            
            # Convert quality scores from 0.0-1.0 to 0-100 scale
            linting_score = self.code_validator._convert_score_to_0_100(validation_result.eslint_quality_score)
            type_safety_score = self.code_validator._convert_score_to_0_100(validation_result.typescript_quality_score)
            overall_score = self.code_validator._convert_score_to_0_100(validation_result.overall_quality_score)
            
            # Create metadata with validation results
            validation_metadata = ValidationMetadata(
                attempts=validation_result.attempts,
                final_status=validation_result.final_status,
                typescript_passed=validation_result.compilation_success,
                typescript_errors=ts_errors,
                typescript_warnings=ts_warnings,
                eslint_passed=validation_result.lint_success,
                eslint_errors=eslint_errors,
                eslint_warnings=eslint_warnings,
                linting_score=linting_score,
                type_safety_score=type_safety_score,
                overall_score=overall_score,
                compilation_success=validation_result.compilation_success,
                lint_success=validation_result.lint_success,
            )
            
            metadata = GenerationMetadata(
                latency_ms=total_latency_ms,
                stage_latencies=self.stage_latencies,
                lines_of_code=len(final_component_code.split('\n')) + len(final_stories_code.split('\n')),
                requirements_implemented=len(request.requirements),
                pattern_used=request.pattern_id,
                pattern_version="1.0.0",
                token_count=token_count,
                imports_count=imports_count,
                has_typescript_errors=len(ts_errors) > 0,
                has_accessibility_warnings=False,  # TODO: Implement a11y detection
                llm_token_usage=llm_result.token_usage,
                validation_attempts=validation_result.attempts,
                quality_score=validation_result.overall_quality_score,
            )
            
            # Log validation details if failed
            if not validation_result.valid:
                from ..core.logging import get_logger
                logger = get_logger(__name__)
                logger.error(
                    f"Validation failed after {validation_result.attempts} attempts",
                    extra={
                        "extra": {
                            "typescript_errors": len(ts_errors),
                            "eslint_errors": len(eslint_errors),
                            "first_ts_error": ts_errors[0].message if ts_errors else None,
                            "first_eslint_error": eslint_errors[0].message if eslint_errors else None,
                        }
                    }
                )

            return GenerationResult(
                component_code=final_component_code,
                stories_code=final_stories_code,
                files=result_files,  # Contains both filename keys and direct showcase/app keys
                metadata=metadata,
                validation_results=validation_metadata,
                success=validation_result.valid,
                error=None if validation_result.valid else "Code validation failed after retries",
            )
        
        except Exception as e:
            # Handle errors gracefully
            error_latency_ms = int((time.time() - start_time) * 1000)
            
            return GenerationResult(
                component_code="",
                stories_code="",
                files={},
                metadata=GenerationMetadata(
                    latency_ms=error_latency_ms,
                    stage_latencies=self.stage_latencies,
                ),
                success=False,
                error=str(e),
            )
    
    @traceable(run_type="tool", name="parse_pattern")
    async def _parse_pattern(self, pattern_id: str):
        """Parse pattern and track latency."""
        self.current_stage = GenerationStage.PARSING
        stage_start = time.time()
        
        try:
            result = self.pattern_parser.parse(pattern_id)
            return result
        finally:
            self.stage_latencies[GenerationStage.PARSING] = int(
                (time.time() - stage_start) * 1000
            )
    
    @traceable(run_type="tool", name="assemble_code")
    async def _assemble_code(self, code_parts: CodeParts):
        """Assemble and format code, track latency."""
        self.current_stage = GenerationStage.ASSEMBLING
        stage_start = time.time()
        
        try:
            result = await self.code_assembler.assemble(code_parts)
            return result
        finally:
            self.stage_latencies[GenerationStage.ASSEMBLING] = int(
                (time.time() - stage_start) * 1000
            )
            self.current_stage = GenerationStage.COMPLETE
    
    def _generate_basic_story(self, component_name: str) -> str:
        """Generate basic Storybook story (full implementation in P5)."""
        return f"""import type {{ Meta, StoryObj }} from '@storybook/react';
import {{ {component_name} }} from './{component_name}';

const meta: Meta<typeof {component_name}> = {{
  title: 'Components/{component_name}',
  component: {component_name},
  tags: ['autodocs'],
}};

export default meta;
type Story = StoryObj<typeof {component_name}>;

export const Default: Story = {{
  args: {{
    children: '{component_name}',
  }},
}};
"""

    def _generate_app_tsx_template(self) -> str:
        """Generate App.tsx with auto-discovery showcase system."""
        return """import { useState } from 'react';

// Auto-discover all showcase files
const showcaseModules = import.meta.glob('./components/*.showcase.tsx', { eager: true });

export default function App() {
  const showcaseEntries = Object.entries(showcaseModules);
  const [activeIndex, setActiveIndex] = useState(0);

  // Extract component names from file paths
  const componentNames = showcaseEntries.map(([path]) => {
    const match = path.match(/\\/([^/]+)\\.showcase\\.tsx$/);
    return match ? match[1] : null;
  }).filter(Boolean);

  // Get the active showcase component
  const activeShowcaseModule = showcaseEntries[activeIndex]?.[1];
  const ActiveShowcase = activeShowcaseModule?.default;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with component tabs */}
      <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <h1 className="text-2xl font-bold mb-4">Component Showcase</h1>

          {componentNames.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {componentNames.map((name, idx) => (
                <button
                  key={name}
                  onClick={() => setActiveIndex(idx)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    activeIndex === idx
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No showcase files found. Create a .showcase.tsx file in /src/components/</p>
          )}
        </div>
      </div>

      {/* Showcase content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {ActiveShowcase ? (
          <ActiveShowcase />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">No components to display</p>
            <p className="text-sm">Add a .showcase.tsx file to see your component variations here</p>
          </div>
        )}
      </div>
    </div>
  );
}
"""

    # ====== NEW LLM-FIRST HELPER METHODS ======
    
    async def _parse_pattern_for_reference(self, pattern_id: str):
        """Load pattern as reference (not for modification)."""
        return self.pattern_parser.parse(pattern_id)
    
    def _build_generation_prompt(
        self,
        pattern_code: str,
        component_name: str,
        component_type: str,
        tokens: Dict[str, Any],
        requirements: Dict[str, Any],
    ) -> Dict[str, str]:
        """
        Build comprehensive generation prompt using PromptBuilder.
        
        Returns:
            Dict with 'system' and 'user' prompts
        """
        return self.prompt_builder.build_prompt(
            pattern_code=pattern_code,
            component_name=component_name,
            component_type=component_type,
            tokens=tokens,
            requirements=requirements,
        )
    
    def _add_provenance(
        self,
        code: str,
        component_name: str,
        pattern_id: str,
        tokens: Dict[str, Any],
        requirements: Dict[str, Any],
    ) -> str:
        """Add provenance header to generated code."""
        header = self.provenance_generator.generate_header(
            component_name=component_name,
            pattern_id=pattern_id,
            tokens=tokens,
            requirements=requirements,
        )
        return f"{header}\n\n{code}"
    
    def _infer_component_type(self, pattern_id: str) -> str:
        """Infer component type from pattern ID."""
        # Extract type from pattern ID (e.g., "shadcn-button" -> "button")
        return pattern_id.replace("shadcn-", "").lower()
    
    def _infer_component_type_from_name(self, component_name: str) -> str:
        """Infer component type from component name."""
        return component_name.lower()

    def _count_nested_tokens(self, tokens: Dict[str, Any]) -> int:
        """
        Count all populated nested token values across all categories.

        Example:
            tokens = {
                "colors": {"primary": "#3B82F6", "background": "#FFF"},
                "typography": {"fontFamily": "Inter"},
                "spacing": {},
                "borderRadius": {"md": "8px"}
            }
            Returns: 4 (primary + background + fontFamily + borderRadius.md)

        Args:
            tokens: Design tokens dictionary with nested categories

        Returns:
            Total count of non-None token values
        """
        count = 0
        for category_value in tokens.values():
            if isinstance(category_value, dict):
                # Count non-None values in the nested dict
                count += sum(1 for v in category_value.values() if v is not None)
        return count

    def get_current_stage(self) -> GenerationStage:
        """Get current generation stage for progress tracking."""
        return self.current_stage
    
    def get_stage_latencies(self) -> Dict[GenerationStage, int]:
        """Get latency for each stage."""
        return self.stage_latencies.copy()
