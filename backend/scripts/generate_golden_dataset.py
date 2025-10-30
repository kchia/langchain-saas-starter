#!/usr/bin/env python3
"""
Generate Golden Dataset for E2E Evaluation

Creates synthetic component screenshots using Pillow and LLM-generated code.
Auto-generates ground truth JSON for each screenshot.

Usage:
    cd backend
    python scripts/generate_golden_dataset.py
"""

import asyncio
import json
import sys
import os
import re
from pathlib import Path
from typing import Dict, Any, Tuple

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from PIL import Image, ImageDraw, ImageFont
from openai import AsyncOpenAI


# Component specifications
COMPONENTS_TO_GENERATE = [
    # Buttons (3 variants)
    {
        "name": "button_primary",
        "component": "Button",
        "variant": "primary",
        "text": "Click Me",
        "color": "#3B82F6",
        "pattern_id": "button"
    },
    {
        "name": "button_secondary",
        "component": "Button",
        "variant": "secondary",
        "text": "Cancel",
        "color": "#64748B",
        "pattern_id": "button"
    },
    {
        "name": "button_outline",
        "component": "Button",
        "variant": "outline",
        "text": "Learn More",
        "color": "#3B82F6",
        "pattern_id": "button"
    },

    # Cards (2 variants)
    {
        "name": "card_default",
        "component": "Card",
        "variant": "default",
        "title": "Card Title",
        "content": "Card content goes here",
        "pattern_id": "card"
    },
    {
        "name": "card_with_footer",
        "component": "Card",
        "variant": "with_footer",
        "title": "Product Card",
        "content": "Product description",
        "footer": "Price: $99",
        "pattern_id": "card"
    },

    # Badges (2 variants)
    {
        "name": "badge_success",
        "component": "Badge",
        "variant": "success",
        "text": "Active",
        "color": "#22C55E",
        "pattern_id": "badge"
    },
    {
        "name": "badge_error",
        "component": "Badge",
        "variant": "error",
        "text": "Error",
        "color": "#EF4444",
        "pattern_id": "badge"
    },

    # Inputs (2 variants)
    {
        "name": "input_text",
        "component": "Input",
        "variant": "text",
        "placeholder": "Enter your name",
        "pattern_id": "input"
    },
    {
        "name": "input_email",
        "component": "Input",
        "variant": "email",
        "placeholder": "your@email.com",
        "pattern_id": "input"
    },

    # Other components
    {
        "name": "checkbox_default",
        "component": "Checkbox",
        "variant": "default",
        "label": "Accept terms",
        "checked": True,
        "pattern_id": "checkbox"
    },
    {
        "name": "alert_info",
        "component": "Alert",
        "variant": "info",
        "text": "Information: Your changes have been saved",
        "color": "#3B82F6",
        "pattern_id": "alert"
    },
    {
        "name": "alert_warning",
        "component": "Alert",
        "variant": "warning",
        "text": "Warning: This action cannot be undone",
        "color": "#F59E0B",
        "pattern_id": "alert"
    },
    {
        "name": "select_default",
        "component": "Select",
        "variant": "default",
        "placeholder": "Select an option",
        "pattern_id": "select"
    },
]


class GoldenDatasetGenerator:
    """Generate golden dataset screenshots using LLM + Pillow."""

    def __init__(self, api_key: str = None):
        """Initialize generator with OpenAI API key."""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY required")

        self.client = AsyncOpenAI(api_key=self.api_key)

    async def generate_pillow_code(self, spec: Dict[str, Any]) -> str:
        """
        Use GPT-4 to generate Pillow code for component screenshot.

        Args:
            spec: Component specification dictionary

        Returns:
            Python code string that creates the screenshot
        """
        prompt = f"""
Generate Python PIL/Pillow code to create a realistic screenshot of a {spec['component']} component.

Component Specifications:
- Type: {spec['component']}
- Variant: {spec.get('variant', 'default')}
- Color: {spec.get('color', '#3B82F6')}
- Text: {spec.get('text', '')}
- Additional props: {json.dumps({k: v for k, v in spec.items() if k not in ['name', 'component', 'pattern_id']})}

Design System (shadcn/ui):
- Primary color: #3B82F6 (blue-500)
- Secondary color: #64748B (slate-500)
- Success color: #22C55E (green-500)
- Error color: #EF4444 (red-500)
- Warning color: #F59E0B (amber-500)
- Text color: #0F172A (slate-900)
- Border color: #E2E8F0 (slate-200)
- Background: #FFFFFF (white)

Requirements:
1. Create 400x200px image with white background
2. Draw component with realistic styling (rounded corners, shadows if applicable)
3. Use proper spacing (padding: 12px-24px, gaps: 8px-16px)
4. Use ImageFont for text (load_default() is fine)
5. Return image AND design tokens dict with exact values used

CRITICAL: Return ONLY valid Python code (no markdown, no explanations).
The code must define a function `create_screenshot()` that returns (Image, dict).

Example format:
```python
from PIL import Image, ImageDraw, ImageFont

def create_screenshot():
    img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()

    # Draw component
    button_rect = (50, 75, 200, 125)
    draw.rounded_rectangle(button_rect, radius=6, fill='#3B82F6')
    draw.text((125, 100), "Click Me", fill='white', font=font, anchor='mm')

    # Return image and tokens
    tokens = {{
        "colors": {{"primary": "#3B82F6", "text": "#FFFFFF"}},
        "spacing": {{"padding": "12px 24px"}},
        "typography": {{"fontSize": "14px", "fontWeight": "500"}},
        "border": {{"radius": "6px"}}
    }}
    return img, tokens
```
"""

        response = await self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at generating PIL/Pillow code for UI components. Return ONLY valid Python code."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=1500
        )

        code = response.choices[0].message.content

        # Clean up code (remove markdown if present)
        code = re.sub(r'^```python\s*\n?', '', code, flags=re.IGNORECASE)
        code = re.sub(r'\n?```$', '', code)

        return code.strip()

    def execute_pillow_code(self, code: str) -> Tuple[Image.Image, Dict[str, Any]]:
        """
        Execute generated Pillow code to create screenshot.

        Args:
            code: Python code string

        Returns:
            Tuple of (PIL Image, design tokens dict)
        """
        # Execute code in isolated namespace
        exec_globals = {
            'Image': Image,
            'ImageDraw': ImageDraw,
            'ImageFont': ImageFont
        }

        try:
            exec(code, exec_globals)
            create_fn = exec_globals.get('create_screenshot')

            if not create_fn:
                raise ValueError("Code must define create_screenshot() function")

            img, tokens = create_fn()
            return img, tokens

        except Exception as e:
            print(f"   ❌ Failed to execute code: {e}")
            print(f"   Code:\n{code}")
            raise

    def create_ground_truth(
        self,
        spec: Dict[str, Any],
        tokens: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create ground truth JSON for screenshot.

        Args:
            spec: Component specification
            tokens: Design tokens extracted from Pillow code

        Returns:
            Ground truth dictionary
        """
        return {
            "screenshot_id": spec['name'],
            "component_name": f"{spec['component']} ({spec.get('variant', 'default')})",
            "expected_tokens": tokens,
            "expected_pattern_id": spec['pattern_id'],
            "expected_code_properties": {
                "has_variant_prop": True,
                "has_accessibility": True,
                "compiles": True
            },
            "notes": f"Auto-generated {spec['component']} {spec.get('variant', 'default')} variant"
        }

    async def generate_dataset(self, output_dir: Path):
        """
        Generate complete golden dataset.

        Args:
            output_dir: Directory to save screenshots and ground truth
        """
        screenshots_dir = output_dir / "screenshots"
        ground_truth_dir = output_dir / "ground_truth"

        screenshots_dir.mkdir(parents=True, exist_ok=True)
        ground_truth_dir.mkdir(parents=True, exist_ok=True)

        print("🎨 Generating Golden Dataset")
        print(f"   Output: {output_dir}")
        print(f"   Components: {len(COMPONENTS_TO_GENERATE)}")
        print()

        success_count = 0

        for i, spec in enumerate(COMPONENTS_TO_GENERATE, 1):
            print(f"[{i}/{len(COMPONENTS_TO_GENERATE)}] Generating: {spec['name']}...")

            try:
                # Generate Pillow code using LLM
                print(f"   ⏳ Generating Pillow code...")
                pillow_code = await self.generate_pillow_code(spec)

                # Execute code to create image
                print(f"   ⏳ Executing code...")
                img, tokens = self.execute_pillow_code(pillow_code)

                # Save screenshot
                screenshot_path = screenshots_dir / f"{spec['name']}.png"
                img.save(screenshot_path)
                print(f"   ✅ Screenshot: {screenshot_path.name}")

                # Create and save ground truth
                ground_truth = self.create_ground_truth(spec, tokens)
                gt_path = ground_truth_dir / f"{spec['name']}.json"

                with open(gt_path, 'w') as f:
                    json.dump(ground_truth, f, indent=2)
                print(f"   ✅ Ground truth: {gt_path.name}")

                success_count += 1
                print()

            except Exception as e:
                print(f"   ❌ Failed: {e}")
                print()
                continue

        # Create README
        readme_path = output_dir / "README.md"
        readme_content = f"""# Golden Dataset for E2E Evaluation

Auto-generated component screenshots for end-to-end pipeline testing.

## Contents

- **{success_count} screenshots** in `screenshots/`
- **{success_count} ground truth files** in `ground_truth/`

## Components

{self._format_component_list()}

## Usage

This dataset is used by the E2E evaluator to validate the full screenshot-to-code pipeline:
1. Token extraction accuracy
2. Pattern retrieval accuracy
3. Code generation quality
4. End-to-end pipeline success rate

## Regeneration

To regenerate this dataset:

```bash
cd backend
python scripts/generate_golden_dataset.py
```

## Ground Truth Format

Each ground truth JSON includes:
- `screenshot_id`: Unique identifier
- `expected_tokens`: Design tokens (colors, spacing, typography)
- `expected_pattern_id`: Pattern to retrieve
- `expected_code_properties`: Expected code characteristics

## Notes

- Screenshots are synthetic (created with PIL/Pillow)
- Ground truth is exact (derived from generation code)
- Suitable for automated testing and regression detection
"""

        with open(readme_path, 'w') as f:
            f.write(readme_content)

        print("=" * 80)
        print(f"✅ Dataset Generation Complete!")
        print(f"   Success: {success_count}/{len(COMPONENTS_TO_GENERATE)} screenshots")
        print(f"   Location: {output_dir}")
        print(f"   Screenshots: {screenshots_dir}")
        print(f"   Ground truth: {ground_truth_dir}")
        print("=" * 80)

    def _format_component_list(self) -> str:
        """Format component list for README."""
        by_type = {}
        for spec in COMPONENTS_TO_GENERATE:
            comp_type = spec['component']
            if comp_type not in by_type:
                by_type[comp_type] = []
            by_type[comp_type].append(spec['variant'])

        lines = []
        for comp_type, variants in sorted(by_type.items()):
            lines.append(f"- **{comp_type}**: {len(variants)} variants ({', '.join(variants)})")

        return '\n'.join(lines)


async def main():
    """Main entry point."""
    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ ERROR: OPENAI_API_KEY environment variable not set")
        print("   Please set it to run this script:")
        print("   export OPENAI_API_KEY='your-api-key-here'")
        sys.exit(1)

    print("✅ OpenAI API key found")
    print()

    # Set output directory
    output_dir = Path(__file__).parent.parent / "data" / "golden_dataset"

    # Generate dataset
    generator = GoldenDatasetGenerator(api_key=api_key)
    await generator.generate_dataset(output_dir)

    print()
    print("Next steps:")
    print("1. Review generated screenshots in data/golden_dataset/screenshots/")
    print("2. Verify ground truth JSON in data/golden_dataset/ground_truth/")
    print("3. Run E2E evaluation: python scripts/run_e2e_evaluation.py")
    print()


if __name__ == "__main__":
    asyncio.run(main())
