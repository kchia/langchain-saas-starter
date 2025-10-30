#!/usr/bin/env python3
"""
Generate a design system sample PNG for E2E testing.
This creates a visual representation of a design system with colors, typography, spacing, and border radius.
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("PIL (Pillow) not available. Please install: pip install Pillow")
    exit(1)

def create_design_system_sample():
    """Create a design system sample image showing colors, typography, spacing, and border radius."""

    # Image dimensions
    width = 1200
    height = 1600

    # Create white background
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)

    # Try to load a font, fallback to default if not available
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
        heading_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
        label_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
    except:
        title_font = heading_font = label_font = small_font = ImageFont.load_default()

    # Starting Y position
    y = 40
    x_margin = 60

    # Title
    draw.text((x_margin, y), "Design System Style Guide", fill='#1a1a1a', font=title_font)
    y += 60

    # === COLOR PALETTE ===
    draw.text((x_margin, y), "Color Palette", fill='#333333', font=heading_font)
    y += 40

    colors = [
        ("Primary", "#3b82f6"),
        ("Secondary", "#8b5cf6"),
        ("Accent", "#06b6d4"),
        ("Destructive", "#ef4444"),
        ("Muted", "#64748b"),
        ("Background", "#ffffff"),
        ("Foreground", "#0f172a"),
        ("Border", "#e2e8f0"),
    ]

    box_size = 80
    spacing_x = 120
    for i, (name, color) in enumerate(colors):
        x_pos = x_margin + (i % 4) * (box_size + spacing_x)
        y_pos = y + (i // 4) * 120

        # Draw color box
        draw.rectangle([x_pos, y_pos, x_pos + box_size, y_pos + box_size], fill=color, outline='#cccccc')

        # Draw label
        draw.text((x_pos, y_pos + box_size + 8), name, fill='#333333', font=label_font)
        draw.text((x_pos, y_pos + box_size + 28), color, fill='#666666', font=small_font)

    y += 260

    # === TYPOGRAPHY ===
    draw.text((x_margin, y), "Typography Scale", fill='#333333', font=heading_font)
    y += 40

    typography = [
        ("4xl", 36, "Extra Large Heading"),
        ("3xl", 30, "Large Heading"),
        ("2xl", 24, "Medium Heading"),
        ("xl", 20, "Small Heading"),
        ("lg", 18, "Large Body"),
        ("base", 16, "Base Body Text"),
        ("sm", 14, "Small Text"),
        ("xs", 12, "Extra Small Text"),
    ]

    for size_name, size_px, sample_text in typography:
        try:
            text_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size_px)
        except:
            text_font = ImageFont.load_default()

        draw.text((x_margin, y), f"{size_name} ({size_px}px):", fill='#666666', font=label_font)
        draw.text((x_margin + 150, y), sample_text, fill='#1a1a1a', font=text_font)
        y += size_px + 12

    y += 20

    # === SPACING SCALE ===
    draw.text((x_margin, y), "Spacing Scale", fill='#333333', font=heading_font)
    y += 40

    spacing = [
        ("xs", 4),
        ("sm", 8),
        ("md", 16),
        ("lg", 24),
        ("xl", 32),
        ("2xl", 48),
        ("3xl", 64),
    ]

    for space_name, space_px in spacing:
        draw.text((x_margin, y), f"{space_name}: {space_px}px", fill='#333333', font=label_font)
        # Draw visual representation
        draw.rectangle([x_margin + 150, y + 2, x_margin + 150 + space_px, y + 18], fill='#3b82f6', outline='#2563eb')
        y += 30

    y += 20

    # === BORDER RADIUS ===
    draw.text((x_margin, y), "Border Radius", fill='#333333', font=heading_font)
    y += 40

    border_radius = [
        ("sm", 4),
        ("md", 8),
        ("lg", 12),
        ("xl", 16),
        ("full", 9999),
    ]

    for i, (radius_name, radius_px) in enumerate(border_radius):
        x_pos = x_margin + (i % 3) * 280
        y_pos = y + (i // 3) * 100

        # Draw rounded rectangle (approximation)
        box_width = 80
        box_height = 60
        if radius_name == "full":
            # Draw circle for "full"
            draw.ellipse([x_pos, y_pos, x_pos + box_width, y_pos + box_height], fill='#e0e7ff', outline='#3b82f6', width=2)
        else:
            draw.rectangle([x_pos, y_pos, x_pos + box_width, y_pos + box_height], fill='#e0e7ff', outline='#3b82f6', width=2)

        # Label
        draw.text((x_pos, y_pos + box_height + 8), f"{radius_name}: {radius_px if radius_px != 9999 else 'full'}px", fill='#333333', font=label_font)

    return img

if __name__ == '__main__':
    print("Generating design system sample PNG...")
    img = create_design_system_sample()

    output_path = '/home/runner/work/component-forge/component-forge/app/e2e/fixtures/design-system-sample.png'
    img.save(output_path, 'PNG')
    print(f"✓ Design system sample saved to: {output_path}")
    print(f"  Size: {img.size[0]}x{img.size[1]} pixels")
