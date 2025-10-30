#!/usr/bin/env python3
"""Create the 2 missing screenshots that failed during AI generation."""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "data" / "golden_dataset" / "screenshots"

def create_button_outline():
    """Create outline button screenshot."""
    img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(img)

    # Draw button outline
    button_rect = [100, 75, 300, 125]
    draw.rounded_rectangle(button_rect, radius=10, outline='#3B82F6', width=2)

    # Draw button text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    except:
        font = ImageFont.load_default()

    text = "Learn More"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = 200 - text_width // 2
    text_y = 100 - text_height // 2
    draw.text((text_x, text_y), text, fill='#3B82F6', font=font)

    output_path = OUTPUT_DIR / "button_outline.png"
    img.save(output_path)
    print(f"✅ Created: {output_path.name}")


def create_input_text():
    """Create text input screenshot."""
    img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(img)

    # Draw input field border
    input_rect = [50, 75, 350, 125]
    draw.rounded_rectangle(input_rect, radius=6, outline='#D1D5DB', width=2, fill='white')

    # Draw placeholder text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    except:
        font = ImageFont.load_default()

    draw.text((60, 95), "Enter your name", fill='#9CA3AF', font=font)

    output_path = OUTPUT_DIR / "input_text.png"
    img.save(output_path)
    print(f"✅ Created: {output_path.name}")


if __name__ == "__main__":
    print("Creating 2 missing screenshots...")
    create_button_outline()
    create_input_text()
    print("Done!")
