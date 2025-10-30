#!/usr/bin/env python
"""
Demo script for code generation module.

This script demonstrates how to use the GeneratorService to generate
a React/TypeScript component from a pattern, tokens, and requirements.

Usage:
    python backend/scripts/demo_generation.py
"""

import asyncio
import json
from pathlib import Path

# Add parent directory to path to import modules
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.generation.generator_service import GeneratorService
from src.generation.types import GenerationRequest


async def demo_button_generation():
    """Demonstrate Button component generation."""
    print("=" * 80)
    print("ComponentForge - Code Generation Demo")
    print("=" * 80)
    print()
    
    # Create generator service
    print("📦 Initializing generator service...")
    generator = GeneratorService()
    print("✓ Generator service ready\n")
    
    # Define generation request
    print("📋 Creating generation request for Button component...")
    request = GenerationRequest(
        pattern_id="shadcn-button",
        tokens={
            "colors": {
                "Primary": "#3B82F6",
                "Secondary": "#64748B",
                "Background": "#FFFFFF",
                "Foreground": "#0F172A"
            },
            "typography": {
                "fontSize": "14px",
                "fontFamily": "Inter, system-ui, sans-serif",
                "fontWeight": "500",
                "lineHeight": "1.5"
            },
            "spacing": {
                "padding": "16px",
                "gap": "8px"
            },
            "borderRadius": "6px"
        },
        requirements={
            "props": [
                {
                    "name": "variant",
                    "type": "string",
                    "values": ["default", "secondary", "ghost", "outline"],
                    "required": False,
                    "default": "default",
                    "description": "Visual style variant of the button"
                },
                {
                    "name": "size",
                    "type": "string",
                    "values": ["sm", "default", "lg", "icon"],
                    "required": False,
                    "default": "default",
                    "description": "Size of the button"
                }
            ],
            "events": [
                {"name": "onClick", "type": "MouseEvent"}
            ],
            "states": [
                {"name": "isLoading", "type": "boolean", "default": "false"},
                {"name": "isDisabled", "type": "boolean", "default": "false"}
            ]
        }
    )
    print("✓ Request created\n")
    
    # Generate component
    print("🔄 Generating component code...")
    print("   Stages: Parse → Inject Tokens → Generate Tailwind → Implement Requirements → Assemble")
    print()
    
    result = await generator.generate(request)
    
    # Check result
    if not result.success:
        print(f"❌ Generation failed: {result.error}")
        return
    
    print("✅ Generation completed successfully!\n")
    
    # Display metrics
    print("📊 Generation Metrics:")
    print(f"   Total Latency: {result.metadata.latency_ms}ms")
    print(f"   Tokens Injected: {result.metadata.token_count}")
    print(f"   Lines of Code: {result.metadata.lines_of_code}")
    print(f"   Requirements Implemented: {result.metadata.requirements_implemented}")
    print()
    
    # Display stage latencies
    print("⏱️  Stage Latencies:")
    for stage, latency in result.metadata.stage_latencies.items():
        print(f"   {stage.value.capitalize()}: {latency}ms")
    print()
    
    # Display generated files
    print("📁 Generated Files:")
    for filename in result.files.keys():
        print(f"   - {filename}")
    print()
    
    # Display code preview
    print("📝 Component Code Preview (first 50 lines):")
    print("-" * 80)
    component_lines = result.component_code.split('\n')[:50]
    for line in component_lines:
        print(line)
    if len(result.component_code.split('\n')) > 50:
        print("...")
    print("-" * 80)
    print()
    
    # Display stories preview
    if result.stories_code:
        print("📖 Storybook Stories Preview (first 30 lines):")
        print("-" * 80)
        stories_lines = result.stories_code.split('\n')[:30]
        for line in stories_lines:
            print(line)
        if len(result.stories_code.split('\n')) > 30:
            print("...")
        print("-" * 80)
        print()
    
    # Save to output directory
    output_dir = Path(__file__).parent.parent / "examples" / "generated"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"💾 Saving generated files to {output_dir}...")
    for filename, content in result.files.items():
        output_file = output_dir / filename
        with open(output_file, 'w') as f:
            f.write(content)
        print(f"   ✓ Saved {filename}")
    print()
    
    print("=" * 80)
    print("Demo completed successfully! 🎉")
    print("=" * 80)


async def demo_card_generation():
    """Demonstrate Card component generation."""
    print("\n" + "=" * 80)
    print("Generating Card Component...")
    print("=" * 80)
    print()
    
    generator = GeneratorService()
    
    request = GenerationRequest(
        pattern_id="shadcn-card",
        tokens={
            "colors": {
                "Background": "#FFFFFF",
                "Border": "#E2E8F0"
            },
            "spacing": {
                "padding": "24px",
                "gap": "16px"
            }
        },
        requirements={
            "props": [
                {"name": "title", "type": "string", "required": False}
            ]
        }
    )
    
    result = await generator.generate(request)
    
    if result.success:
        print(f"✅ Card generated in {result.metadata.latency_ms}ms")
        print(f"   Lines of code: {result.metadata.lines_of_code}")
    else:
        print(f"❌ Failed: {result.error}")


async def list_available_patterns():
    """List all available patterns."""
    print("\n" + "=" * 80)
    print("Available Patterns:")
    print("=" * 80)
    
    from src.generation.pattern_parser import PatternParser
    
    parser = PatternParser()
    patterns = parser.list_available_patterns()
    
    for i, pattern_id in enumerate(patterns, 1):
        # Load pattern to get name
        try:
            pattern_data = parser.load_pattern(pattern_id)
            name = pattern_data.get("name", "Unknown")
            description = pattern_data.get("description", "No description")
            print(f"{i:2}. {pattern_id:20} - {name:15} - {description[:50]}")
        except Exception as e:
            print(f"{i:2}. {pattern_id:20} - Error loading: {e}")
    
    print()


async def main():
    """Run all demos."""
    # List available patterns
    await list_available_patterns()
    
    # Generate Button component
    await demo_button_generation()
    
    # Generate Card component (optional)
    # await demo_card_generation()


if __name__ == "__main__":
    asyncio.run(main())
