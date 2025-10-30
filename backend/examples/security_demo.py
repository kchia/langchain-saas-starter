#!/usr/bin/env python3
"""
Example script demonstrating the security module usage.

This script shows how to use the input validators and PII detector
for image uploads and text inputs.
"""

import asyncio
import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from PIL import Image
import io


async def demo_image_validation():
    """Demonstrate image upload validation."""
    print("\n=== Image Upload Validation Demo ===\n")
    
    from src.security.input_validator import (
        ImageUploadValidator,
        InputValidationError
    )
    
    # Test 1: Valid file type
    print("Test 1: Validate MIME types")
    try:
        ImageUploadValidator.validate_file_type("image/png")
        print("✓ PNG is valid")
    except InputValidationError as e:
        print(f"✗ {e}")
    
    try:
        ImageUploadValidator.validate_file_type("image/gif")
        print("✓ GIF is valid")
    except InputValidationError as e:
        print(f"✗ GIF rejected: {e}")
    
    # Test 2: File size validation
    print("\nTest 2: Validate file sizes")
    try:
        ImageUploadValidator.validate_file_size(5 * 1024 * 1024)  # 5MB
        print("✓ 5MB file is valid")
    except InputValidationError as e:
        print(f"✗ {e}")
    
    try:
        ImageUploadValidator.validate_file_size(15 * 1024 * 1024)  # 15MB
        print("✓ 15MB file is valid")
    except InputValidationError as e:
        print(f"✗ 15MB file rejected: {e}")
    
    # Test 3: SVG security validation
    print("\nTest 3: SVG security checks")
    
    clean_svg = """
    <svg xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="red"/>
    </svg>
    """
    
    malicious_svg = """
    <svg xmlns="http://www.w3.org/2000/svg">
        <script>alert('xss')</script>
        <circle cx="50" cy="50" r="40"/>
    </svg>
    """
    
    try:
        ImageUploadValidator.validate_svg_content(clean_svg)
        print("✓ Clean SVG is valid")
    except InputValidationError as e:
        print(f"✗ {e}")
    
    try:
        ImageUploadValidator.validate_svg_content(malicious_svg)
        print("✓ Malicious SVG is valid")
    except InputValidationError as e:
        print(f"✗ Malicious SVG rejected: {e}")
    
    # Test 4: Image dimensions
    print("\nTest 4: Image dimension validation")
    try:
        ImageUploadValidator.validate_image_dimensions(800, 600)
        print("✓ 800x600 is valid")
    except InputValidationError as e:
        print(f"✗ {e}")
    
    try:
        ImageUploadValidator.validate_image_dimensions(6000, 5000)
        print("✓ 6000x5000 is valid")
    except InputValidationError as e:
        print(f"✗ 6000x5000 rejected (decompression bomb): {e}")


async def demo_text_validation():
    """Demonstrate text input validation."""
    print("\n\n=== Text Input Validation Demo ===\n")
    
    from src.security.input_validator import (
        RequirementInputValidator,
        PatternNameValidator,
        DescriptionValidator
    )
    
    # Test 1: Requirement text validation
    print("Test 1: Requirement validation")
    
    clean_text = "Create a button component with primary and secondary variants"
    validator = RequirementInputValidator(text=clean_text)
    print(f"✓ Clean text: {validator.text}")
    
    # Test 2: HTML sanitization
    print("\nTest 2: HTML sanitization")
    
    html_text = "Create a <script>alert('xss')</script> button with <b>bold</b> text"
    validator = RequirementInputValidator(text=html_text)
    print(f"Original: {html_text}")
    print(f"Sanitized: {validator.text}")
    
    # Test 3: Pattern name validation
    print("\nTest 3: Pattern name validation")
    
    valid_names = ["Button", "Card-Component", "user_profile"]
    for name in valid_names:
        validator = PatternNameValidator(name=name)
        print(f"✓ Valid name: {validator.name}")
    
    try:
        invalid_name = "Button<Component>"
        validator = PatternNameValidator(name=invalid_name)
        print(f"✓ {invalid_name} is valid")
    except ValueError as e:
        print(f"✗ {invalid_name} rejected: {e}")


async def demo_pii_detection():
    """Demonstrate PII detection (mocked for demo)."""
    print("\n\n=== PII Detection Demo (Mocked) ===\n")
    
    print("Note: This demo shows the API structure.")
    print("Actual PII detection requires OpenAI API key.\n")
    
    from src.security.pii_detector import PIIDetector
    
    # Create a simple test image
    image = Image.new('RGB', (800, 600), color='white')
    
    # Show how to use the detector
    print("Usage example:")
    print("```python")
    print("detector = PIIDetector()")
    print("result = await detector.scan_image(image, auto_block=False)")
    print("if result.has_pii:")
    print("    print(f'PII found: {result.entities_found}')")
    print("else:")
    print("    print('No PII detected')")
    print("```")
    
    print("\nPII types detected:")
    for pii_type in PIIDetector.PII_TYPES:
        print(f"  - {pii_type}")


async def main():
    """Run all demos."""
    print("=" * 60)
    print("Security Module Demo")
    print("=" * 60)
    
    await demo_image_validation()
    await demo_text_validation()
    await demo_pii_detection()
    
    print("\n" + "=" * 60)
    print("Demo complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
