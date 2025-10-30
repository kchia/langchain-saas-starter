#!/usr/bin/env python3
"""
Generate sample component screenshots for golden dataset.

Creates realistic component images using PIL for testing the E2E pipeline.
"""

from PIL import Image, ImageDraw, ImageFont
import os
from pathlib import Path

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "golden_dataset" / "screenshots"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def create_button_primary():
    """Create a primary button screenshot."""
    img = Image.new('RGB', (200, 60), color='white')
    draw = ImageDraw.Draw(img)

    # Draw button background (blue)
    button_rect = [20, 15, 180, 45]
    draw.rounded_rectangle(button_rect, radius=6, fill='#3B82F6')

    # Draw button text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    except:
        font = ImageFont.load_default()

    text = "Click me"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = 100 - text_width // 2
    text_y = 30 - text_height // 2
    draw.text((text_x, text_y), text, fill='white', font=font)

    output_path = OUTPUT_DIR / "button_primary.png"
    img.save(output_path)
    print(f"Created: {output_path}")


def create_button_secondary():
    """Create a secondary button screenshot."""
    img = Image.new('RGB', (200, 60), color='white')
    draw = ImageDraw.Draw(img)

    # Draw button background (gray)
    button_rect = [20, 15, 180, 45]
    draw.rounded_rectangle(button_rect, radius=6, fill='#6B7280')

    # Draw button text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    except:
        font = ImageFont.load_default()

    text = "Cancel"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = 100 - text_width // 2
    text_y = 30 - text_height // 2
    draw.text((text_x, text_y), text, fill='white', font=font)

    output_path = OUTPUT_DIR / "button_secondary.png"
    img.save(output_path)
    print(f"Created: {output_path}")


def create_card_default():
    """Create a default card screenshot."""
    img = Image.new('RGB', (300, 200), color='white')
    draw = ImageDraw.Draw(img)

    # Draw card border
    card_rect = [10, 10, 290, 190]
    draw.rounded_rectangle(card_rect, radius=8, outline='#E5E7EB', width=2, fill='white')

    # Draw card header
    try:
        font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
        font_body = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 12)
    except:
        font_title = ImageFont.load_default()
        font_body = ImageFont.load_default()

    # Title
    draw.text((20, 20), "Card Title", fill='#111827', font=font_title)

    # Body text
    draw.text((20, 50), "This is a card component", fill='#6B7280', font=font_body)
    draw.text((20, 70), "with some content inside.", fill='#6B7280', font=font_body)

    output_path = OUTPUT_DIR / "card_default.png"
    img.save(output_path)
    print(f"Created: {output_path}")


def create_badge_success():
    """Create a success badge screenshot."""
    img = Image.new('RGB', (150, 60), color='white')
    draw = ImageDraw.Draw(img)

    # Draw badge background (green)
    badge_rect = [25, 20, 125, 40]
    draw.rounded_rectangle(badge_rect, radius=12, fill='#10B981')

    # Draw badge text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 12)
    except:
        font = ImageFont.load_default()

    text = "Success"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = 75 - text_width // 2
    text_y = 30 - text_height // 2
    draw.text((text_x, text_y), text, fill='white', font=font)

    output_path = OUTPUT_DIR / "badge_success.png"
    img.save(output_path)
    print(f"Created: {output_path}")


def create_input_text():
    """Create a text input screenshot."""
    img = Image.new('RGB', (300, 80), color='white')
    draw = ImageDraw.Draw(img)

    # Draw input field border
    input_rect = [20, 25, 280, 55]
    draw.rounded_rectangle(input_rect, radius=6, outline='#D1D5DB', width=2, fill='white')

    # Draw placeholder text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    except:
        font = ImageFont.load_default()

    draw.text((30, 35), "Enter your name...", fill='#9CA3AF', font=font)

    output_path = OUTPUT_DIR / "input_text.png"
    img.save(output_path)
    print(f"Created: {output_path}")


def main():
    """Generate all sample screenshots."""
    print("Generating golden dataset sample screenshots...")
    print(f"Output directory: {OUTPUT_DIR}")
    print()

    create_button_primary()
    create_button_secondary()
    create_card_default()
    create_badge_success()
    create_input_text()

    print()
    print(f"✅ Generated 5 sample screenshots in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
