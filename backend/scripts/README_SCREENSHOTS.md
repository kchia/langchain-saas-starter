# Screenshot Generation for Golden Dataset

Generate clean, professional component screenshots from HTML templates using Playwright.

## Prerequisites

1. **Playwright installed** in app directory
2. **Node.js 18+** to run the screenshot script

## Quick Start

```bash
# From project root
cd /Users/houchia/Desktop/AIM/component-forge
NODE_PATH=./app/node_modules node backend/scripts/screenshot_html.js
```

## What It Does

1. Loads HTML component templates from `backend/scripts/html_templates/`
2. Screenshots each template using Playwright with high-quality settings (2x device scale for retina displays)
3. Saves PNG files to `backend/data/golden_dataset/screenshots/`
4. Generates clean, professional images suitable for evaluation

## HTML Templates

The HTML templates are standalone files that showcase component variants using Tailwind CSS:

```
backend/scripts/html_templates/
├── button_variants.html       - Primary, Secondary, Outlined buttons + sizes
├── card_variants.html         - Default, With Footer, With Image
├── badge_variants.html        - Success, Warning, Error, Info, Neutral
├── input_variants.html        - Default, Focused, Error, Disabled, With Icon
├── alert_variants.html        - Info, Success, Warning, Error
├── select_variants.html       - Default, With Selection, Disabled
├── checkbox_variants.html     - Unchecked, Checked, Disabled variants
└── switch_variants.html       - Off, On, Disabled variants
```

Each HTML file:
- Uses Tailwind CSS CDN for styling
- Has clean white background
- Shows multiple component variants in one showcase
- Includes section headers and labels for clarity
- Matches shadcn/ui design system conventions

## Configuration

Edit `backend/scripts/screenshot_html.js` to:
- Add/remove HTML template files
- Change viewport sizes
- Adjust screenshot settings
- Modify output directory

```javascript
const HTML_FILES = [
  {
    htmlFile: 'button_variants.html',
    outputFile: 'button_variants.png',
    viewport: { width: 1400, height: 1000 }
  },
  // ... more files
];
```

## Output

Screenshots are saved to `backend/data/golden_dataset/screenshots/`:

```
backend/data/golden_dataset/screenshots/
├── button_variants.png    (110 KB)
├── card_variants.png      (211 KB)
├── badge_variants.png     (48 KB)
├── input_variants.png     (63 KB)
├── alert_variants.png     (99 KB)
├── select_variants.png    (54 KB)
├── checkbox_variants.png  (56 KB)
└── switch_variants.png    (60 KB)
```

Each screenshot:
- Contains multiple component variants in one image
- Has professional layout with section titles and labels
- Uses clean white background (no UI chrome)
- Is production-quality and suitable for evaluation

## Ground Truth Files

Corresponding ground truth JSON files in `backend/data/golden_dataset/ground_truth/`:

```
backend/data/golden_dataset/ground_truth/
├── button_variants.json
├── card_variants.json
├── badge_variants.json
├── input_variants.json
├── alert_variants.json
├── select_variants.json
├── checkbox_variants.json
└── switch_variants.json
```

Each ground truth file defines:
- `screenshot_id` - Matches screenshot filename
- `component_name` - Display name
- `variants` - Array of variants shown in screenshot
- `expected_tokens` - Colors, spacing, typography, borders
- `expected_pattern_id` - Pattern to match
- `expected_code_properties` - Properties the generated code should have

## Troubleshooting

### "Cannot find module '@playwright/test'"

Make sure Playwright is installed in the app directory:
```bash
cd app
npm install @playwright/test
npx playwright install chromium
```

### Screenshots are missing or incomplete

1. Check that HTML template files exist in `backend/scripts/html_templates/`
2. Verify output directory exists: `backend/data/golden_dataset/screenshots/`
3. Check the console output for error messages

### Customize viewport sizes

Edit the `viewport` property in `screenshot_html.js` for each component:
```javascript
{
  htmlFile: 'button_variants.html',
  outputFile: 'button_variants.png',
  viewport: { width: 1600, height: 1200 }  // Increase size
}
```

## Deprecated Approaches

The following approaches are no longer used (see `.deprecated/` folder):
- **Storybook screenshots** (`screenshot_storybook.js`) - Captured UI chrome, not just components
- **AI + Pillow** (`generate_golden_dataset.py`) - Synthetic quality, not realistic

## Next Steps

After generating screenshots:
1. Review images in `backend/data/golden_dataset/screenshots/`
2. Verify ground truth JSON files in `backend/data/golden_dataset/ground_truth/`
3. Run evaluation: `python backend/scripts/run_e2e_evaluation.py`
4. View results in the dashboard: `http://localhost:3000/evaluation`
