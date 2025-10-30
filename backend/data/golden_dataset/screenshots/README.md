# Golden Dataset Screenshots

## Instructions for Obtaining Screenshots

Screenshots should be obtained from real component examples. Recommended sources:

1. **shadcn/ui documentation** (https://ui.shadcn.com)
   - Navigate to each component page
   - Take screenshots of the component examples
   - Crop to show only the component

2. **Existing Figma designs** (if available)
   - Export components as PNG at 2x resolution
   - Ensure consistent sizing (200-300px wide)

3. **Test images** (for development)
   - Use `backend/scripts/generate_golden_samples.py` to create placeholder images
   - Replace with real screenshots before evaluation

## Current Screenshots

### Initial 5 Samples (Commit 1)
- `button_primary.png` - Primary button with blue background
- `button_secondary.png` - Secondary button with gray background
- `card_default.png` - Default card with title and content
- `badge_success.png` - Success badge with green background
- `input_text.png` - Text input field with placeholder

### Additional Samples (Commit 2)
- Additional 10 screenshots to be added

## Screenshot Guidelines

- **Format**: PNG
- **Size**: 200-400px wide, maintain aspect ratio
- **Background**: White or transparent
- **Quality**: High resolution (2x for retina)
- **Cropping**: Show only the component, minimal padding
- **Naming**: `{component}_{variant}.png` (lowercase, underscores)
