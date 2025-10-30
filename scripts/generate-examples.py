#!/usr/bin/env python3
"""
Generate example design system PNG images for the extract page modal.
Creates 3 good examples showing different design token layouts.
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "app", "public", "examples")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Canvas settings
WIDTH = 1200
HEIGHT = 900
BG_COLOR = "#FFFFFF"
TEXT_COLOR = "#1F2937"
MUTED_COLOR = "#6B7280"

def get_font(size):
    """Get system font or fallback to default"""
    try:
        return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
    except:
        try:
            return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
        except:
            return ImageFont.load_default()

def draw_text(draw, text, position, font_size, color=TEXT_COLOR, bold=False):
    """Helper to draw text with font"""
    font = get_font(font_size)
    draw.text(position, text, fill=color, font=font)

def generate_color_palette():
    """Generate Example 1: Color Palette with Semantic Labels"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Title
    draw_text(draw, "Design System Style Guide", (60, 60), 48, bold=True)
    draw_text(draw, "Color Palette", (60, 140), 32, bold=True)

    # Color swatches - Row 1
    colors = [
        ("Primary", "#3B82F6", 60, 200),
        ("Secondary", "#8B5CF6", 340, 200),
        ("Accent", "#06B6D4", 620, 200),
        ("Destructive", "#EF4444", 900, 200)
    ]

    for name, hex_color, x, y in colors:
        # Color swatch (120x120)
        draw.rectangle([x, y, x + 120, y + 120], fill=hex_color)
        # Label
        draw_text(draw, name, (x, y + 135), 18, bold=True)
        draw_text(draw, hex_color, (x, y + 160), 14, MUTED_COLOR)

    # Color swatches - Row 2
    colors2 = [
        ("Muted", "#64748B", 60, 380),
        ("Background", "#FFFFFF", 340, 380),
        ("Foreground", "#0F172A", 620, 380),
        ("Border", "#E2E8F0", 900, 380)
    ]

    for name, hex_color, x, y in colors2:
        # Color swatch with border for light colors
        if hex_color in ["#FFFFFF", "#E2E8F0"]:
            draw.rectangle([x, y, x + 120, y + 120], fill=hex_color, outline="#D1D5DB", width=2)
        else:
            draw.rectangle([x, y, x + 120, y + 120], fill=hex_color)
        # Label
        draw_text(draw, name, (x, y + 135), 18, bold=True)
        draw_text(draw, hex_color, (x, y + 160), 14, MUTED_COLOR)

    # Typography preview section
    draw_text(draw, "Typography Scale", (60, 560), 32, bold=True)

    typo_examples = [
        ("4xl (36px):", "Extra Large Heading", 60, 620, 36),
        ("2xl (24px):", "Large Heading", 60, 670, 24),
        ("base (16px):", "Base Body Text", 60, 710, 16),
        ("sm (14px):", "Small Text", 60, 740, 14)
    ]

    for label, text, x, y, size in typo_examples:
        draw_text(draw, label, (x, y), 14, MUTED_COLOR)
        draw_text(draw, text, (x + 120, y), size)

    # Save
    output_path = os.path.join(OUTPUT_DIR, "good-color-palette.png")
    img.save(output_path, 'PNG')
    print(f"✓ Generated: {output_path}")

def generate_typography_scale():
    """Generate Example 2: Typography Scale Focus"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Title
    draw_text(draw, "Design System Style Guide", (60, 60), 48, bold=True)
    draw_text(draw, "Typography Scale", (60, 140), 32, bold=True)

    # Typography examples with actual rendered text at each size
    type_scale = [
        ("4xl (36px)", "Extra Large Heading", 36, 220),
        ("3xl (30px)", "Large Heading", 30, 290),
        ("2xl (24px)", "Medium Heading", 24, 350),
        ("xl (20px)", "Small Heading", 20, 400),
        ("lg (18px)", "Large Body", 18, 445),
        ("base (16px)", "Base Body Text", 16, 485),
        ("sm (14px)", "Small Text", 14, 520),
        ("xs (12px)", "Extra Small Text", 12, 550)
    ]

    for label, example, size, y in type_scale:
        # Label on left
        draw_text(draw, label + ":", (60, y), 16, MUTED_COLOR)
        # Example text at actual size
        draw_text(draw, example, (280, y), size)

    # Font weights section
    draw_text(draw, "Font Weights", (60, 620), 28, bold=True)

    weights = [
        ("Regular (400)", 18, 680),
        ("Medium (500)", 18, 720),
        ("Semibold (600)", 18, 760),
        ("Bold (700)", 18, 800)
    ]

    for label, size, y in weights:
        draw_text(draw, label, (60, y), size)

    # Line height examples
    draw_text(draw, "Line Heights", (600, 620), 28, bold=True)

    line_heights = [
        ("Tight (1.25)", 600, 680),
        ("Normal (1.5)", 600, 720),
        ("Relaxed (1.75)", 600, 760),
        ("Loose (2.0)", 600, 800)
    ]

    for label, x, y in line_heights:
        draw_text(draw, label, (x, y), 16)

    # Save
    output_path = os.path.join(OUTPUT_DIR, "good-typography-scale.png")
    img.save(output_path, 'PNG')
    print(f"✓ Generated: {output_path}")

def generate_complete_design_system():
    """Generate Example 3: Complete Design System Overview"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Title
    draw_text(draw, "Design System Tokens", (60, 40), 42, bold=True)

    # Colors section (compact)
    draw_text(draw, "Colors", (60, 120), 24, bold=True)
    colors = [
        ("#3B82F6", 60, 160),
        ("#8B5CF6", 140, 160),
        ("#06B6D4", 220, 160),
        ("#EF4444", 300, 160),
        ("#64748B", 380, 160)
    ]
    for hex_color, x, y in colors:
        draw.rectangle([x, y, x + 60, y + 60], fill=hex_color)
        draw_text(draw, hex_color, (x, y + 68), 10, MUTED_COLOR)

    # Typography section
    draw_text(draw, "Typography", (60, 260), 24, bold=True)
    draw_text(draw, "4xl (36px): Extra Large", (60, 300), 24)
    draw_text(draw, "2xl (24px): Large", (60, 340), 18)
    draw_text(draw, "base (16px): Body", (60, 370), 14)
    draw_text(draw, "sm (14px): Small", (60, 395), 12)

    # Spacing section
    draw_text(draw, "Spacing Scale", (60, 450), 24, bold=True)
    spacing = [
        ("xs: 4px", 20, 60, 500),
        ("sm: 8px", 40, 60, 535),
        ("md: 16px", 80, 60, 570),
        ("lg: 24px", 120, 60, 605),
        ("xl: 32px", 160, 60, 640),
        ("2xl: 48px", 240, 60, 675)
    ]
    for label, width, x, y in spacing:
        draw.rectangle([x, y, x + width, y + 20], fill="#3B82F6")
        draw_text(draw, label, (x + width + 10, y + 2), 12, MUTED_COLOR)

    # Border radius section
    draw_text(draw, "Border Radius", (600, 120), 24, bold=True)
    radii = [
        ("sm: 4px", 4, 600, 170),
        ("md: 8px", 8, 740, 170),
        ("lg: 12px", 12, 880, 170),
        ("xl: 16px", 16, 600, 270),
        ("full: 9999px", 999, 740, 270)
    ]
    for label, radius, x, y in radii:
        if radius == 999:
            # Draw circle for "full" radius
            draw.ellipse([x, y, x + 80, y + 80], outline="#3B82F6", width=3)
        else:
            draw.rounded_rectangle([x, y, x + 80, y + 80], radius=radius, outline="#3B82F6", width=3)
        draw_text(draw, label, (x, y + 90), 12, MUTED_COLOR)

    # Shadows/Elevation section
    draw_text(draw, "Elevation", (600, 400), 24, bold=True)
    draw_text(draw, "sm: Subtle shadow", (600, 450), 14)
    draw.rectangle([600, 475, 750, 525], fill="#FFFFFF", outline="#E5E7EB")

    draw_text(draw, "md: Medium shadow", (600, 560), 14)
    draw.rectangle([600, 585, 750, 635], fill="#FFFFFF", outline="#E5E7EB")

    draw_text(draw, "lg: Large shadow", (600, 670), 14)
    draw.rectangle([600, 695, 750, 745], fill="#FFFFFF", outline="#E5E7EB")

    # Save
    output_path = os.path.join(OUTPUT_DIR, "good-design-system.png")
    img.save(output_path, 'PNG')
    print(f"✓ Generated: {output_path}")

def generate_button_variants():
    """Generate Example: Button Component Variants"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Title
    draw_text(draw, "Button Component Variants", (60, 60), 42, bold=True)

    # Primary buttons
    draw_text(draw, "Primary Buttons", (60, 140), 24, bold=True)

    button_states = [
        ("Default", "#3B82F6", 60, 190),
        ("Hover", "#2563EB", 280, 190),
        ("Disabled", "#93C5FD", 500, 190)
    ]

    for label, color, x, y in button_states:
        # Draw button
        draw.rounded_rectangle([x, y, x + 180, y + 50], radius=8, fill=color)
        draw_text(draw, "Button", (x + 55, y + 15), 16, "#FFFFFF")
        # Label below
        draw_text(draw, label, (x + 60, y + 65), 14, MUTED_COLOR)

    # Secondary buttons
    draw_text(draw, "Secondary Buttons", (60, 290), 24, bold=True)

    secondary_states = [
        ("Default", "#64748B", 60, 340),
        ("Hover", "#475569", 280, 340),
        ("Disabled", "#CBD5E1", 500, 340)
    ]

    for label, color, x, y in secondary_states:
        draw.rounded_rectangle([x, y, x + 180, y + 50], radius=8, fill=color)
        draw_text(draw, "Button", (x + 55, y + 15), 16, "#FFFFFF")
        draw_text(draw, label, (x + 60, y + 65), 14, MUTED_COLOR)

    # Outlined buttons
    draw_text(draw, "Outlined Buttons", (60, 440), 24, bold=True)

    outlined_states = [
        ("Default", "#3B82F6", 60, 490),
        ("Hover", "#2563EB", 280, 490),
        ("Disabled", "#93C5FD", 500, 490)
    ]

    for label, color, x, y in outlined_states:
        draw.rounded_rectangle([x, y, x + 180, y + 50], radius=8, fill="#FFFFFF", outline=color, width=2)
        draw_text(draw, "Button", (x + 55, y + 15), 16, color)
        draw_text(draw, label, (x + 60, y + 65), 14, MUTED_COLOR)

    # Button sizes
    draw_text(draw, "Button Sizes", (60, 590), 24, bold=True)

    sizes = [
        ("Small", 32, 60, 640),
        ("Medium", 44, 220, 640),
        ("Large", 56, 400, 640)
    ]

    for label, height, x, y in sizes:
        draw.rounded_rectangle([x, y, x + 140, y + height], radius=8, fill="#3B82F6")
        draw_text(draw, "Button", (x + 40, y + (height // 2) - 8), 16, "#FFFFFF")
        draw_text(draw, label, (x + 45, y + height + 10), 14, MUTED_COLOR)

    # Save
    output_path = os.path.join(OUTPUT_DIR, "good-button-variants.png")
    img.save(output_path, 'PNG')
    print(f"✓ Generated: {output_path}")

def generate_card_components():
    """Generate Example: Card Components"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Title
    draw_text(draw, "Card Components", (60, 60), 42, bold=True)

    # Card 1: Basic card
    draw_text(draw, "Basic Card", (60, 140), 20, bold=True)
    draw.rounded_rectangle([60, 175, 360, 375], radius=12, fill="#FFFFFF", outline="#E5E7EB", width=2)
    draw_text(draw, "Card Title", (80, 195), 18, bold=True)
    draw_text(draw, "This is a basic card with border", (80, 225), 14, MUTED_COLOR)
    draw_text(draw, "and padding. It has rounded", (80, 245), 14, MUTED_COLOR)
    draw_text(draw, "corners (12px radius).", (80, 265), 14, MUTED_COLOR)

    # Card 2: Elevated card
    draw_text(draw, "Elevated Card", (420, 140), 20, bold=True)
    # Draw shadow effect with multiple rectangles
    draw.rounded_rectangle([428, 183, 728, 383], radius=12, fill="#00000010")
    draw.rounded_rectangle([426, 181, 726, 381], radius=12, fill="#00000008")
    draw.rounded_rectangle([424, 179, 724, 379], radius=12, fill="#FFFFFF")
    draw_text(draw, "Card Title", (444, 199), 18, bold=True)
    draw_text(draw, "This card has box-shadow for", (444, 229), 14, MUTED_COLOR)
    draw_text(draw, "elevation effect. Padding: 20px", (444, 249), 14, MUTED_COLOR)
    draw_text(draw, "Shadow: 0 4px 12px rgba(0,0,0,0.1)", (444, 269), 14, MUTED_COLOR)

    # Card 3: Interactive card
    draw_text(draw, "Interactive Card (Hover)", (60, 420), 20, bold=True)
    draw.rounded_rectangle([60, 455, 360, 655], radius=12, fill="#3B82F610", outline="#3B82F6", width=2)
    draw_text(draw, "Clickable Card", (80, 475), 18, bold=True)
    draw_text(draw, "Border changes on hover", (80, 505), 14, MUTED_COLOR)
    draw_text(draw, "Cursor: pointer", (80, 525), 14, MUTED_COLOR)
    draw_text(draw, "Transition: all 200ms", (80, 545), 14, MUTED_COLOR)

    # Card 4: Content card
    draw_text(draw, "Content Card", (420, 420), 20, bold=True)
    draw.rounded_rectangle([420, 455, 720, 655], radius=12, fill="#FFFFFF", outline="#E5E7EB", width=2)
    draw_text(draw, "Card with Header", (440, 475), 18, bold=True)
    draw.line([440, 500, 700, 500], fill="#E5E7EB", width=1)
    draw_text(draw, "Body content goes here", (440, 515), 14)
    draw_text(draw, "with proper spacing and", (440, 535), 14)
    draw_text(draw, "typography hierarchy.", (440, 555), 14)

    # Save
    output_path = os.path.join(OUTPUT_DIR, "good-card-components.png")
    img.save(output_path, 'PNG')
    print(f"✓ Generated: {output_path}")

def generate_form_inputs():
    """Generate Example: Form Input Components"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Title
    draw_text(draw, "Form Input Components", (60, 60), 42, bold=True)

    # Text input - Default
    draw_text(draw, "Default Input", (60, 140), 18, bold=True)
    draw_text(draw, "Email Address", (60, 170), 14)
    draw.rounded_rectangle([60, 195, 460, 235], radius=6, fill="#FFFFFF", outline="#D1D5DB", width=2)
    draw_text(draw, "user@example.com", (75, 205), 14, MUTED_COLOR)

    # Text input - Focus
    draw_text(draw, "Focus State", (60, 280), 18, bold=True)
    draw_text(draw, "Password", (60, 310), 14)
    draw.rounded_rectangle([60, 335, 460, 375], radius=6, fill="#FFFFFF", outline="#3B82F6", width=2)
    draw_text(draw, "••••••••", (75, 345), 14)

    # Text input - Error
    draw_text(draw, "Error State", (60, 420), 18, bold=True)
    draw_text(draw, "Username", (60, 450), 14)
    draw.rounded_rectangle([60, 475, 460, 515], radius=6, fill="#FFFFFF", outline="#EF4444", width=2)
    draw_text(draw, "invalid_user", (75, 485), 14)
    draw_text(draw, "⚠ Username already taken", (60, 525), 12, "#EF4444")

    # Text input - Disabled
    draw_text(draw, "Disabled State", (60, 570), 18, bold=True)
    draw_text(draw, "Account ID", (60, 600), 14, MUTED_COLOR)
    draw.rounded_rectangle([60, 625, 460, 665], radius=6, fill="#F3F4F6", outline="#D1D5DB", width=1)
    draw_text(draw, "Read-only value", (75, 635), 14, MUTED_COLOR)

    # Checkbox examples
    draw_text(draw, "Checkbox & Radio", (540, 140), 18, bold=True)

    # Checkbox - checked
    draw.rounded_rectangle([540, 180, 560, 200], radius=4, fill="#3B82F6")
    draw_text(draw, "✓", (543, 180), 14, "#FFFFFF")
    draw_text(draw, "Remember me", (575, 183), 14)

    # Checkbox - unchecked
    draw.rounded_rectangle([540, 220, 560, 240], radius=4, fill="#FFFFFF", outline="#D1D5DB", width=2)
    draw_text(draw, "Send notifications", (575, 223), 14)

    # Radio - selected
    draw.ellipse([540, 270, 560, 290], fill="#FFFFFF", outline="#3B82F6", width=2)
    draw.ellipse([546, 276, 554, 284], fill="#3B82F6")
    draw_text(draw, "Option A", (575, 273), 14)

    # Radio - unselected
    draw.ellipse([540, 310, 560, 330], fill="#FFFFFF", outline="#D1D5DB", width=2)
    draw_text(draw, "Option B", (575, 313), 14)

    # Select dropdown
    draw_text(draw, "Select Dropdown", (540, 380), 18, bold=True)
    draw_text(draw, "Country", (540, 410), 14)
    draw.rounded_rectangle([540, 435, 940, 475], radius=6, fill="#FFFFFF", outline="#D1D5DB", width=2)
    draw_text(draw, "United States", (555, 445), 14)
    draw_text(draw, "▼", (910, 445), 14, MUTED_COLOR)

    # Save
    output_path = os.path.join(OUTPUT_DIR, "good-form-inputs.png")
    img.save(output_path, 'PNG')
    print(f"✓ Generated: {output_path}")

def main():
    print("🎨 Generating design system example images...")
    print(f"Output directory: {OUTPUT_DIR}\n")

    generate_color_palette()
    generate_button_variants()
    generate_card_components()
    generate_form_inputs()

    print(f"\n✅ Generated 4 example images successfully!")
    print(f"📁 Location: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
