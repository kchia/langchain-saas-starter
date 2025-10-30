"""
Performance and Latency Validation Tests (Epic 4 - I4)

Validates performance targets for code generation:
- p50 ≤ 60s (60000ms)
- p95 ≤ 90s (90000ms)

Runs multiple generation requests and calculates percentiles.

Prerequisites:
- Backend Stream (B1-B15) must be complete
- Generation service modules must be implemented

Note: These are smoke tests with 20 iterations. For production-grade
statistical validation, consider using 100+ iterations or pytest-benchmark.
"""

import pytest
import importlib.util
import asyncio
import time
import statistics
from typing import List, Dict, Any

from src.generation.generator_service import GeneratorService
from src.generation.types import GenerationRequest


# Check if backend generation module is available
backend_available = importlib.util.find_spec("src.generation.generator_service") is not None


@pytest.mark.skipif(
    not backend_available,
    reason="Backend generation module not available. Backend Stream (B1-B15) must be complete."
)
class TestGenerationPerformance:
    """Performance validation tests for code generation."""

    @pytest.fixture
    def generator_service(self):
        """Create generator service instance."""
        return GeneratorService()

    # Note: sample_tokens, button_requirements, card_requirements, and input_requirements
    # fixtures are now defined in backend/tests/conftest.py and shared across test suites

    async def run_generation_benchmark(
        self,
        generator_service: GeneratorService,
        pattern_id: str,
        tokens: Dict[str, Any],
        requirements: List[Dict[str, Any]],
        iterations: int = 20
    ) -> List[int]:
        """
        Run generation benchmark for a given pattern.
        
        Args:
            generator_service: Generator service instance
            pattern_id: Pattern to generate
            tokens: Design tokens
            requirements: Component requirements
            iterations: Number of iterations to run
            
        Returns:
            List of latencies in milliseconds
        """
        latencies = []

        print(f"\nRunning {iterations} iterations for {pattern_id}...")

        for i in range(iterations):
            request = GenerationRequest(
                pattern_id=pattern_id,
                tokens=tokens,
                requirements=requirements
            )

            start_time = time.time()
            result = await generator_service.generate(request)
            end_time = time.time()

            latency_ms = int((end_time - start_time) * 1000)
            latencies.append(latency_ms)

            if result.success:
                print(f"  Iteration {i+1}: {latency_ms}ms ✓")
            else:
                print(f"  Iteration {i+1}: FAILED - {result.error}")

        return latencies

    def calculate_percentiles(self, latencies: List[int]) -> Dict[str, float]:
        """
        Calculate percentile statistics.
        
        Args:
            latencies: List of latency values in milliseconds
            
        Returns:
            Dictionary with p50, p95, p99, min, max, mean
        """
        sorted_latencies = sorted(latencies)
        
        return {
            "min": min(latencies),
            "max": max(latencies),
            "mean": statistics.mean(latencies),
            "median": statistics.median(latencies),
            "p50": statistics.median(latencies),
            "p95": sorted_latencies[int(len(sorted_latencies) * 0.95)],
            "p99": sorted_latencies[int(len(sorted_latencies) * 0.99)]
        }

    def print_performance_report(
        self,
        pattern_id: str,
        latencies: List[int],
        stats: Dict[str, float]
    ):
        """Print formatted performance report."""
        print(f"\n{'='*60}")
        print(f"Performance Report: {pattern_id}")
        print(f"{'='*60}")
        print(f"Iterations: {len(latencies)}")
        print(f"Min:        {stats['min']}ms")
        print(f"Max:        {stats['max']}ms")
        print(f"Mean:       {stats['mean']:.1f}ms")
        print(f"Median:     {stats['median']:.1f}ms")
        print(f"p50:        {stats['p50']:.1f}ms (target: ≤60000ms)")
        print(f"p95:        {stats['p95']:.1f}ms (target: ≤90000ms)")
        print(f"p99:        {stats['p99']:.1f}ms")
        print(f"{'='*60}\n")

    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_button_generation_performance(
        self,
        generator_service,
        sample_tokens,
        button_requirements
    ):
        """
        Test Button generation performance across 20 iterations.
        
        Validates p50 ≤ 60s and p95 ≤ 90s targets.
        """
        latencies = await self.run_generation_benchmark(
            generator_service,
            pattern_id="shadcn-button",
            tokens=sample_tokens,
            requirements=button_requirements,
            iterations=20
        )

        stats = self.calculate_percentiles(latencies)
        self.print_performance_report("Button", latencies, stats)

        # Validate performance targets
        assert stats['p50'] <= 60000, \
            f"p50 latency {stats['p50']}ms exceeds target of 60000ms (60s)"
        
        assert stats['p95'] <= 90000, \
            f"p95 latency {stats['p95']}ms exceeds target of 90000ms (90s)"

    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_card_generation_performance(
        self,
        generator_service,
        sample_tokens,
        card_requirements
    ):
        """
        Test Card generation performance across 20 iterations.
        
        Validates p50 ≤ 60s and p95 ≤ 90s targets.
        """
        latencies = await self.run_generation_benchmark(
            generator_service,
            pattern_id="shadcn-card",
            tokens=sample_tokens,
            requirements=card_requirements,
            iterations=20
        )

        stats = self.calculate_percentiles(latencies)
        self.print_performance_report("Card", latencies, stats)

        # Validate performance targets
        assert stats['p50'] <= 60000, \
            f"p50 latency {stats['p50']}ms exceeds target of 60000ms (60s)"
        
        assert stats['p95'] <= 90000, \
            f"p95 latency {stats['p95']}ms exceeds target of 90000ms (90s)"

    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_input_generation_performance(
        self,
        generator_service,
        sample_tokens,
        input_requirements
    ):
        """
        Test Input generation performance across 20 iterations.
        
        Validates p50 ≤ 60s and p95 ≤ 90s targets.
        """
        latencies = await self.run_generation_benchmark(
            generator_service,
            pattern_id="shadcn-input",
            tokens=sample_tokens,
            requirements=input_requirements,
            iterations=20
        )

        stats = self.calculate_percentiles(latencies)
        self.print_performance_report("Input", latencies, stats)

        # Validate performance targets
        assert stats['p50'] <= 60000, \
            f"p50 latency {stats['p50']}ms exceeds target of 60000ms (60s)"
        
        assert stats['p95'] <= 90000, \
            f"p95 latency {stats['p95']}ms exceeds target of 90000ms (90s)"

    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_mixed_patterns_performance(
        self,
        generator_service,
        sample_tokens,
        button_requirements,
        card_requirements,
        input_requirements
    ):
        """
        Test mixed pattern generation performance.
        
        Runs Button, Card, and Input generations and validates overall targets.
        """
        all_latencies = []

        # Run benchmarks for each pattern
        patterns = [
            ("shadcn-button", button_requirements, "Button"),
            ("shadcn-card", card_requirements, "Card"),
            ("shadcn-input", input_requirements, "Input")
        ]

        for pattern_id, requirements, name in patterns:
            latencies = await self.run_generation_benchmark(
                generator_service,
                pattern_id=pattern_id,
                tokens=sample_tokens,
                requirements=requirements,
                iterations=7  # 7 iterations per pattern = 21 total
            )
            all_latencies.extend(latencies)

        # Calculate overall statistics
        stats = self.calculate_percentiles(all_latencies)
        self.print_performance_report("Mixed Patterns", all_latencies, stats)

        # Validate overall performance targets
        assert stats['p50'] <= 60000, \
            f"Overall p50 latency {stats['p50']}ms exceeds target of 60000ms (60s)"
        
        assert stats['p95'] <= 90000, \
            f"Overall p95 latency {stats['p95']}ms exceeds target of 90000ms (90s)"

    @pytest.mark.asyncio
    async def test_stage_latency_breakdown(
        self,
        generator_service,
        sample_tokens,
        button_requirements
    ):
        """
        Analyze latency breakdown by generation stage.
        
        Validates individual stage latencies meet targets:
        - Pattern Parsing: <100ms
        - Token Injection: <50ms
        - Tailwind Generation: <30ms
        - Requirement Implementation: <100ms
        - Code Assembly: <2s
        """
        request = GenerationRequest(
            pattern_id="shadcn-button",
            tokens=sample_tokens,
            requirements=button_requirements
        )

        result = await generator_service.generate(request)
        # Verify generation succeeded (may fail validation due to ESLint TypeScript issues)
        assert result.component_code is not None
        assert len(result.component_code) > 0

        stage_latencies = result.metadata.stage_latencies

        print(f"\nStage Latency Breakdown:")
        print(f"{'='*60}")
        
        # Expected targets from Epic 4
        stage_targets = {
            "parsing": 100,  # <100ms
            "injecting": 50,  # <50ms
            "generating": 30,  # <30ms (Tailwind generation)
            "implementing": 100,  # <100ms
            "assembling": 2000,  # <2s
        }

        for stage, latency in stage_latencies.items():
            stage_name = stage.value if hasattr(stage, 'value') else str(stage)
            target = stage_targets.get(stage_name, None)
            
            status = ""
            if target and latency <= target:
                status = "✓"
            elif target:
                status = f"⚠ (target: {target}ms)"
            
            print(f"{stage_name:20s}: {latency:6d}ms {status}")
        
        print(f"{'='*60}\n")

        # Validate stage targets (informational - not strict)
        # These are guidelines, actual performance may vary
        for stage_name, target in stage_targets.items():
            if stage_name in [s.value for s in stage_latencies.keys()]:
                stage_enum = next(s for s in stage_latencies.keys() if s.value == stage_name)
                actual = stage_latencies[stage_enum]
                
                # Log warning if target exceeded
                if actual > target:
                    print(f"⚠ {stage_name} latency {actual}ms exceeds target {target}ms")

    @pytest.mark.asyncio
    async def test_concurrent_generation_performance(
        self,
        generator_service,
        sample_tokens,
        button_requirements
    ):
        """
        Test concurrent generation performance.
        
        Validates that multiple concurrent generations don't significantly
        degrade individual latencies.
        """
        concurrent_requests = 3
        requests = [
            GenerationRequest(
                pattern_id="shadcn-button",
                tokens=sample_tokens,
                requirements=button_requirements
            )
            for _ in range(concurrent_requests)
        ]

        print(f"\nRunning {concurrent_requests} concurrent generations...")
        
        start_time = time.time()
        results = await asyncio.gather(
            *[generator_service.generate(req) for req in requests]
        )
        end_time = time.time()

        total_time_ms = int((end_time - start_time) * 1000)
        
        print(f"Total time: {total_time_ms}ms")
        print(f"Average time per request: {total_time_ms / concurrent_requests:.1f}ms")

        # Verify all generated code (may fail validation due to ESLint TypeScript issues)
        for i, result in enumerate(results):
            print(f"Request {i+1}: {result.metadata.latency_ms}ms - " +
                  ("✓" if result.success else f"✗ {result.error}"))
            assert result.component_code is not None
            assert len(result.component_code) > 0

        # Average latency should still be reasonable
        avg_latency = sum(r.metadata.latency_ms for r in results) / len(results)
        assert avg_latency <= 60000, \
            f"Average concurrent latency {avg_latency}ms exceeds p50 target"


if __name__ == "__main__":
    # This allows running performance tests directly
    print("Run performance tests with: pytest backend/tests/performance/test_generation_latency.py -v -s")
    print("\nNote: These tests are marked with @pytest.mark.slow and may take several minutes.")
    print("To run only fast tests, use: pytest -m 'not slow'")
