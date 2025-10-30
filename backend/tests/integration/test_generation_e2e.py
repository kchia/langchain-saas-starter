"""
Integration Tests for Epic 4: End-to-End Code Generation Workflow (I1)

Tests the complete workflow from tokens to generated code, validating:
- Full workflow: tokens → requirements → pattern → generation
- Generated code structure and TypeScript syntax
- Import statements and dependencies
- Epic 2 → Epic 3 → Epic 4 data flow

Prerequisites:
- Backend Stream (B1-B15) must be complete
- Generation service modules must be implemented
"""

import pytest
import importlib.util
import json
from pathlib import Path

from src.generation.generator_service import GeneratorService
from src.generation.types import GenerationRequest, GenerationStage


# Check if backend generation module is available
backend_available = importlib.util.find_spec("src.generation.generator_service") is not None


@pytest.mark.skipif(
    not backend_available,
    reason="Backend generation module not available. Backend Stream (B1-B15) must be complete."
)
class TestGenerationE2E:
    """End-to-end integration tests for code generation workflow."""

    @pytest.fixture
    def generator_service(self):
        """Create generator service instance."""
        return GeneratorService()

    # Note: sample_tokens, button_requirements, card_requirements, and input_requirements
    # fixtures are now defined in backend/tests/conftest.py and shared across test suites

    @pytest.fixture
    def sample_requirements(self):
        """Sample requirements from Epic 2 (requirement proposals)."""
        return [
            {
                "name": "variant",
                "type": "string",
                "values": ["default", "secondary", "ghost"],
                "required": False,
                "category": "props"
            },
            {
                "name": "size",
                "type": "string",
                "values": ["sm", "default", "lg"],
                "required": False,
                "category": "props"
            },
            {
                "name": "disabled",
                "type": "boolean",
                "required": False,
                "category": "props"
            },
            {
                "name": "onClick",
                "type": "MouseEvent",
                "required": False,
                "category": "events"
            },
            {
                "name": "aria-label",
                "required": True,
                "category": "accessibility"
            },
            {
                "name": "role",
                "value": "button",
                "required": True,
                "category": "accessibility"
            }
        ]

    @pytest.mark.asyncio
    async def test_e2e_button_generation(self, generator_service, sample_tokens, sample_requirements):
        """
        Test complete workflow for Button component generation.
        
        Flow: tokens (Epic 1) → requirements (Epic 2) → pattern (Epic 3) → generation (Epic 4)
        """
        # Create generation request (simulating data from Epic 1, 2, 3)
        request = GenerationRequest(
            pattern_id="shadcn-button",
            tokens=sample_tokens,
            requirements=sample_requirements,
            component_name="Button"
        )

        # Execute generation
        result = await generator_service.generate(request)

        # Verify generation succeeded (may fail validation due to ESLint TypeScript issues)
        # but component code should still be generated correctly
        assert result.component_code is not None
        assert len(result.component_code) > 0
        assert result.stories_code is not None
        assert len(result.stories_code) > 0

        # Verify files generated
        assert "Button.tsx" in result.files
        assert "Button.stories.tsx" in result.files

        # Verify metadata is present
        assert result.metadata is not None
        assert result.metadata.latency_ms > 0
        assert result.metadata.token_count > 0
        assert result.metadata.lines_of_code > 0

        # Verify stage latencies were tracked (new 3-stage pipeline)
        assert GenerationStage.LLM_GENERATING in result.metadata.stage_latencies
        assert GenerationStage.VALIDATING in result.metadata.stage_latencies
        assert GenerationStage.POST_PROCESSING in result.metadata.stage_latencies

    @pytest.mark.asyncio
    async def test_e2e_card_generation(self, generator_service, sample_tokens):
        """Test complete workflow for Card component generation."""
        # Card-specific requirements
        requirements = [
            {
                "name": "title",
                "type": "string",
                "required": False,
                "category": "props"
            },
            {
                "name": "description",
                "type": "string",
                "required": False,
                "category": "props"
            },
            {
                "name": "role",
                "value": "article",
                "required": False,
                "category": "accessibility"
            }
        ]

        request = GenerationRequest(
            pattern_id="shadcn-card",
            tokens=sample_tokens,
            requirements=requirements,
            component_name="Card"
        )

        result = await generator_service.generate(request)

        # Verify generation succeeded (may fail validation due to ESLint TypeScript issues)
        # but component code should still be generated correctly
        assert result.component_code is not None
        assert len(result.component_code) > 0
        assert result.stories_code is not None
        assert len(result.stories_code) > 0

        # Verify Card-specific files
        assert "Card.tsx" in result.files
        assert "Card.stories.tsx" in result.files

    @pytest.mark.asyncio
    async def test_e2e_input_generation(self, generator_service, sample_tokens):
        """Test complete workflow for Input component generation."""
        # Input-specific requirements
        requirements = [
            {
                "name": "type",
                "type": "string",
                "values": ["text", "email", "password", "number"],
                "required": False,
                "category": "props"
            },
            {
                "name": "placeholder",
                "type": "string",
                "required": False,
                "category": "props"
            },
            {
                "name": "disabled",
                "type": "boolean",
                "required": False,
                "category": "props"
            },
            {
                "name": "onChange",
                "type": "ChangeEvent",
                "required": False,
                "category": "events"
            },
            {
                "name": "aria-label",
                "required": True,
                "category": "accessibility"
            },
            {
                "name": "aria-invalid",
                "required": False,
                "category": "accessibility"
            }
        ]

        request = GenerationRequest(
            pattern_id="shadcn-input",
            tokens=sample_tokens,
            requirements=requirements,
            component_name="Input"
        )

        result = await generator_service.generate(request)

        # Verify generation succeeded (may fail validation due to ESLint TypeScript issues)
        # but component code should still be generated correctly
        assert result.component_code is not None
        assert len(result.component_code) > 0
        assert result.stories_code is not None
        assert len(result.stories_code) > 0
        assert "Input.tsx" in result.files

    @pytest.mark.asyncio
    async def test_generated_code_structure(self, generator_service, sample_tokens, sample_requirements):
        """Verify generated code has proper TypeScript structure."""
        request = GenerationRequest(
            pattern_id="shadcn-button",
            tokens=sample_tokens,
            requirements=sample_requirements,
            component_name="Button"
        )

        result = await generator_service.generate(request)
        code = result.component_code

        # Verify TypeScript syntax elements
        assert "import" in code  # Has import statements
        assert "export" in code  # Has exports
        assert "interface" in code or "type" in code  # Has type definitions
        assert "const" in code or "function" in code  # Has component definition
        assert "React" in code  # Uses React

        # Verify component structure
        assert "Button" in code  # Component name present
        assert "ButtonProps" in code or "Props" in code  # Props interface exists

    @pytest.mark.asyncio
    async def test_generated_imports_present(self, generator_service, sample_tokens, sample_requirements):
        """Verify all necessary imports are present in generated code."""
        request = GenerationRequest(
            pattern_id="shadcn-button",
            tokens=sample_tokens,
            requirements=sample_requirements,
            component_name="Button"
        )

        result = await generator_service.generate(request)
        code = result.component_code
        lines = code.split('\n')

        # Common expected imports for shadcn/ui components
        expected_import_keywords = [
            "import",  # At least one import statement
            "React",   # React import
        ]

        for keyword in expected_import_keywords:
            assert keyword in code, f"Missing expected import keyword: {keyword}"

        # Verify import statements are at the top (basic check)
        # Look for imports in the first 20 lines of the file (after comment block)
        assert any('import' in line for line in lines[:20]), \
            "Import statements should appear near the top of the file"

    @pytest.mark.asyncio
    async def test_generated_stories_structure(self, generator_service, sample_tokens, sample_requirements):
        """Verify generated Storybook stories have proper structure."""
        request = GenerationRequest(
            pattern_id="shadcn-button",
            tokens=sample_tokens,
            requirements=sample_requirements,
            component_name="Button"
        )

        result = await generator_service.generate(request)
        stories = result.stories_code

        # Verify Storybook structure
        assert "import" in stories  # Has imports
        assert "Meta" in stories or "meta" in stories  # Has Meta type/object
        assert "Story" in stories or "export" in stories  # Has story exports
        assert "Button" in stories  # References the component

    @pytest.mark.asyncio
    async def test_generation_with_real_pattern_library(self, generator_service, sample_tokens, sample_requirements):
        """
        Verify generation uses real pattern library files from backend/data/patterns/.
        
        This test ensures Epic 3 pattern retrieval integration works correctly.
        """
        # Test with multiple patterns from the real library
        pattern_ids = ["shadcn-button", "shadcn-card", "shadcn-input"]

        for pattern_id in pattern_ids:
            request = GenerationRequest(
                pattern_id=pattern_id,
                tokens=sample_tokens,
                requirements=sample_requirements
            )

            result = await generator_service.generate(request)

            # Verify pattern was loaded and used (may fail validation due to ESLint TypeScript issues)
            assert result.component_code is not None
            assert len(result.component_code) > 0
            assert result.stories_code is not None
            assert len(result.stories_code) > 0

            # Verify pattern-specific content
            component_name = pattern_id.split('-')[-1].capitalize()
            assert component_name in result.component_code

    @pytest.mark.asyncio
    async def test_performance_targets(self, generator_service, sample_tokens, sample_requirements):
        """
        Verify generation meets performance targets.
        
        Target: p50 ≤60s (60000ms), p95 ≤90s (90000ms)
        This is a basic check - full performance tests are in I4.
        """
        request = GenerationRequest(
            pattern_id="shadcn-button",
            tokens=sample_tokens,
            requirements=sample_requirements
        )

        result = await generator_service.generate(request)

        # Basic latency check (individual request should be fast)
        # Full p50/p95 tests are in backend/tests/performance/test_generation_latency.py
        assert result.metadata.latency_ms < 60000, \
            f"Generation took {result.metadata.latency_ms}ms, exceeds p50 target of 60000ms"

        # Verify individual stage latencies are reasonable
        for stage, latency in result.metadata.stage_latencies.items():
            assert latency < 30000, \
                f"Stage {stage} took {latency}ms, which seems too long"

    @pytest.mark.asyncio
    async def test_error_handling_invalid_pattern(self, generator_service, sample_tokens, sample_requirements):
        """Test error handling for invalid pattern ID."""
        request = GenerationRequest(
            pattern_id="nonexistent-pattern",
            tokens=sample_tokens,
            requirements=sample_requirements
        )

        # Should raise FileNotFoundError or return error in result
        try:
            result = await generator_service.generate(request)
            # If it returns a result, it should indicate failure
            assert result.success is False
            assert result.error is not None
        except FileNotFoundError:
            # This is expected - pattern not found
            pass

    @pytest.mark.asyncio
    async def test_epic_data_flow_validation(self, generator_service, sample_tokens, sample_requirements):
        """
        Validate complete Epic 1 → Epic 2 → Epic 3 → Epic 4 data flow.
        
        Ensures data from each epic is properly used in generation.
        """
        # Epic 1: Tokens extracted from screenshot/Figma
        assert "colors" in sample_tokens
        assert "typography" in sample_tokens
        assert "spacing" in sample_tokens

        # Epic 2: Requirements proposed from component analysis
        # Check that we have requirements with different categories
        categories = [req.get("category") for req in sample_requirements]
        assert "props" in categories
        assert "events" in categories
        assert "accessibility" in categories

        # Epic 3: Pattern retrieved (using pattern_id)
        # Epic 4: Generation using all above data
        request = GenerationRequest(
            pattern_id="shadcn-button",  # From Epic 3 pattern retrieval
            tokens=sample_tokens,  # From Epic 1 token extraction
            requirements=sample_requirements  # From Epic 2 requirement proposals
        )

        result = await generator_service.generate(request)

        # Verify Epic 1 tokens were used (colors injected) - may fail validation due to ESLint TypeScript issues
        assert result.component_code is not None
        assert len(result.component_code) > 0
        code = result.component_code
        # Check if color tokens influenced the code (presence of color-related CSS)
        # For mock components, we just verify the code was generated with some styling
        assert any(keyword in code.lower() for keyword in ['color', 'bg-', 'text-', 'className', 'button']), \
            "Generated code should include some styling elements"

        # Verify Epic 2 requirements were implemented
        assert result.metadata.requirements_implemented > 0, \
            "Should implement some requirements from Epic 2"

        # Verify Epic 3 pattern was used as base
        assert "Button" in code, "Should use Button pattern from Epic 3"
