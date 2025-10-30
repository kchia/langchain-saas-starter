"""Integration test for token extraction (requires OpenAI API key)."""

import asyncio
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

from src.agents.token_extractor import TokenExtractor
from src.services.image_processor import validate_and_process_image


async def create_test_screenshot():
    """Create a simple test screenshot with known design tokens."""
    # Create a 1200x800 image
    image = Image.new("RGB", (1200, 800), color="#FFFFFF")
    draw = ImageDraw.Draw(image)
    
    # Draw a primary color button
    button_color = "#3B82F6"  # Blue
    draw.rectangle([100, 100, 300, 180], fill=button_color)
    
    # Draw some text-like rectangles
    text_color = "#09090B"
    draw.rectangle([100, 200, 500, 220], fill=text_color)
    draw.rectangle([100, 240, 400, 260], fill=text_color)
    
    # Draw a secondary color element
    secondary_color = "#F1F5F9"
    draw.rectangle([100, 300, 600, 400], fill=secondary_color)
    
    return image


async def test_extraction():
    """Test token extraction with a sample image."""
    print("Creating test screenshot...")
    image = await create_test_screenshot()
    
    # Save for reference
    test_dir = Path("/tmp/token_extraction_test")
    test_dir.mkdir(exist_ok=True)
    test_image_path = test_dir / "test_screenshot.png"
    image.save(test_image_path)
    print(f"Test image saved to: {test_image_path}")
    
    # Check if API key is available
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("\n⚠️  OPENAI_API_KEY not set. Skipping actual GPT-4V call.")
        print("To run this test with actual extraction, set OPENAI_API_KEY environment variable.")
        return
    
    print("\nExtracting tokens with GPT-4V...")
    try:
        extractor = TokenExtractor(api_key=api_key)
        result = await extractor.extract_tokens(image)
        
        print("\n✅ Extraction successful!")
        print("\n=== EXTRACTED TOKENS ===")
        print("\nColors:")
        for name, value in result["tokens"]["colors"].items():
            confidence = result["confidence"]["colors"][name]
            print(f"  {name}: {value} (confidence: {confidence:.2f})")
        
        print("\nTypography:")
        for name, value in result["tokens"]["typography"].items():
            confidence = result["confidence"]["typography"][name]
            print(f"  {name}: {value} (confidence: {confidence:.2f})")
        
        print("\nSpacing:")
        for name, value in result["tokens"]["spacing"].items():
            confidence = result["confidence"]["spacing"][name]
            print(f"  {name}: {value} (confidence: {confidence:.2f})")
        
        if result["fallbacks_used"]:
            print(f"\n⚠️  Fallbacks used for: {', '.join(result['fallbacks_used'])}")
        
        if result["review_needed"]:
            print(f"\n📝 Review needed for: {', '.join(result['review_needed'])}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise


if __name__ == "__main__":
    print("=== Token Extraction Integration Test ===\n")
    asyncio.run(test_extraction())
