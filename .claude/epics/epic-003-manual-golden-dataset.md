# Epic 003: Manual Golden Dataset Creation (Alternative Approach)

**Priority:** P2 - OPTIONAL ENHANCEMENT
**Status:** Not Started
**Prerequisite:** Epic 001 complete (with automated dataset)
**Estimated Effort:** 4-6 hours (manual work)
**Value:** Higher visual quality, more realistic component screenshots
**Use Case:** If automated Pillow screenshots are insufficient for production validation

## Problem Statement

Epic 001's automated golden dataset uses AI-generated Pillow screenshots, which are:
- ✅ Fast to generate (10-15 minutes)
- ✅ Perfect ground truth (derived from generation code)
- ✅ Reproducible

But:
- ❌ Don't look like real shadcn/ui components
- ❌ Basic visual quality (rectangles, text, simple shapes)
- ❌ May not catch nuanced visual issues

For production deployments or stakeholder demos, you may want **real, high-quality screenshots** from actual shadcn/ui components.

## When to Implement This Epic

### Implement If:
- ✅ Automated dataset shows insufficient visual realism
- ✅ Stakeholders require "real" component screenshots
- ✅ Production deployment needs higher confidence
- ✅ Marketing/demo materials need polished visuals
- ✅ Edge cases not captured by Pillow-generated images

### Skip If:
- ⏳ Automated dataset works for your use case
- ⏳ MVP/bootcamp phase (Pillow screenshots sufficient)
- ⏳ Time is limited (manual work takes 4-6 hours)
- ⏳ Visual realism not a priority

---

## Approach Options

### Option 1: Fully Manual (Highest Quality)

Screenshot real components from shadcn/ui documentation or Figma, manually define ground truth.

**Time:** 4-6 hours
**Quality:** Highest
**Effort:** Most manual work

### Option 2: Hybrid (Best of Both Worlds)

Combine automated Pillow screenshots with 5-10 real screenshots.

**Time:** 2-3 hours
**Quality:** High for real screenshots, basic for synthetic
**Effort:** Moderate

### Option 3: Playwright Screenshots (Semi-Automated)

Use Playwright to programmatically screenshot live shadcn/ui components.

**Time:** 3-4 hours (initial setup)
**Quality:** High (real components)
**Effort:** Technical but reusable

---

## Task Breakdown

### Option 1: Fully Manual Golden Dataset

#### Task M1: Screenshot Collection
**Assignable to:** Manual / Designer
**Dependencies:** None
**Estimated Time:** 2-3 hours

**Scope:**
- Manually screenshot 15-20 components from shadcn/ui docs
- Capture multiple variants per component
- Ensure consistent sizing and quality

**Sources:**
1. **shadcn/ui Documentation**: https://ui.shadcn.com/
   - Button: primary, secondary, outline, ghost
   - Card: default, with image, with footer
   - Badge: default, success, warning, error
   - Input: text, email, password, with icon
   - Checkbox, Radio, Switch
   - Alert: info, warning, error, success
   - Select/Dropdown
   - Tabs

2. **Figma Designs** (if available)
   - Export components at 2x resolution
   - Ensure white/clean background

3. **Live Storybook** (if available)
   - Screenshot from Storybook stories
   - Consistent viewport size

**Screenshot Requirements:**
- Format: PNG
- Size: 400-800px width (consistent per component type)
- Background: White or transparent
- Clean crop (no extra UI, no browser chrome)
- File naming: `{component}_{variant}.png` (e.g., `button_primary.png`)

**Tools:**
- macOS: Cmd+Shift+4 (screenshot selection)
- Windows: Snipping Tool
- Browser: Firefox/Chrome screenshot tools

**Files to Create:**
```
backend/data/golden_dataset_manual/
└── screenshots/
    ├── button_primary.png
    ├── button_secondary.png
    └── ... (15-20 screenshots)
```

**Acceptance Criteria:**
- [ ] 15-20 high-quality screenshots captured
- [ ] Consistent sizing and framing
- [ ] Multiple variants per component
- [ ] Clean backgrounds
- [ ] Named following convention

---

#### Task M2: Manual Ground Truth Definition
**Assignable to:** Developer
**Dependencies:** M1 (Screenshots)
**Estimated Time:** 2-3 hours

**Scope:**
- Manually inspect each screenshot
- Define ground truth design tokens (colors, spacing, typography)
- Document expected pattern_id and code properties

**Process:**
1. Open screenshot in image viewer
2. Use color picker to extract exact colors
3. Measure spacing (estimate or use design tool)
4. Identify typography (font size, weight)
5. Create ground truth JSON

**Tools:**
- Color picker: Digital Color Meter (macOS), ColorPick Eyedropper (browser)
- Ruler/measurement: Browser DevTools, Figma, Sketch

**Example Ground Truth Creation:**

```json
{
  "screenshot_id": "button_primary_real",
  "component_name": "Primary Button (shadcn/ui)",
  "expected_tokens": {
    "colors": {
      "background": "#3B82F6",
      "text": "#FFFFFF",
      "border": "#2563EB"
    },
    "spacing": {
      "padding": "12px 24px",
      "gap": "8px"
    },
    "typography": {
      "fontSize": "14px",
      "fontWeight": "500",
      "lineHeight": "20px"
    },
    "border": {
      "radius": "6px"
    }
  },
  "expected_pattern_id": "button",
  "expected_code_properties": {
    "has_variant_prop": true,
    "has_accessibility": true,
    "compiles": true,
    "has_hover_state": true,
    "has_focus_ring": true
  },
  "notes": "Real shadcn/ui button from documentation",
  "source": "https://ui.shadcn.com/docs/components/button"
}
```

**Files to Create:**
```
backend/data/golden_dataset_manual/
└── ground_truth/
    ├── button_primary_real.json
    ├── button_secondary_real.json
    └── ... (15-20 JSON files)
```

**Acceptance Criteria:**
- [ ] Ground truth JSON for each screenshot
- [ ] Accurate color values (hex codes)
- [ ] Reasonable spacing estimates
- [ ] Correct pattern_id mapping
- [ ] Source URL documented

---

### Option 2: Hybrid Approach

#### Task H1: Combine Datasets
**Assignable to:** Developer
**Dependencies:** Epic 001 complete (automated dataset exists)
**Estimated Time:** 2-3 hours

**Scope:**
- Keep 10 automated Pillow screenshots (fast, exact ground truth)
- Add 5-10 real screenshots (high quality, realistic)
- Merge into single golden dataset

**Strategy:**
1. Keep automated screenshots for simple components (Button, Badge, Input)
2. Add real screenshots for complex components (Card, Tabs, complex layouts)
3. Total: 15-20 screenshots (mix of synthetic + real)

**Process:**
```bash
# Start with automated dataset
cp -r backend/data/golden_dataset/ backend/data/golden_dataset_hybrid/

# Add real screenshots
# Screenshot 5-10 components from shadcn/ui
# Add to golden_dataset_hybrid/screenshots/

# Create ground truth for real screenshots
# Add to golden_dataset_hybrid/ground_truth/
```

**Acceptance Criteria:**
- [ ] 15-20 total screenshots (10 automated + 5-10 real)
- [ ] Ground truth for all screenshots
- [ ] README documents which are synthetic vs real
- [ ] Merged dataset works with E2E evaluator

---

### Option 3: Playwright Automated Screenshots

#### Task P1: Playwright Screenshot Generator
**Assignable to:** Backend Agent
**Dependencies:** None
**Estimated Time:** 3-4 hours

**Scope:**
- Use Playwright to screenshot live shadcn/ui components
- Programmatically navigate to component docs
- Capture screenshots of each variant
- Semi-automated ground truth generation

**Technical Implementation:**

```python
# backend/scripts/generate_real_screenshots.py

from playwright.async_api import async_playwright
import asyncio
from pathlib import Path

SHADCN_COMPONENTS = [
    {
        "url": "https://ui.shadcn.com/docs/components/button",
        "component": "button",
        "variants": ["primary", "secondary", "outline", "ghost"]
    },
    {
        "url": "https://ui.shadcn.com/docs/components/card",
        "component": "card",
        "variants": ["default"]
    },
    # ... more components
]

async def screenshot_component(page, url, component, variant):
    """Navigate to component page and screenshot specific variant."""
    await page.goto(url)

    # Wait for component to load
    await page.wait_for_selector(f'[data-variant="{variant}"]', timeout=5000)

    # Screenshot specific element
    element = await page.query_selector(f'[data-variant="{variant}"]')
    screenshot_path = f"screenshots/{component}_{variant}_real.png"
    await element.screenshot(path=screenshot_path)

    return screenshot_path

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        for comp_spec in SHADCN_COMPONENTS:
            for variant in comp_spec["variants"]:
                print(f"Screenshotting: {comp_spec['component']} ({variant})")
                await screenshot_component(
                    page,
                    comp_spec["url"],
                    comp_spec["component"],
                    variant
                )

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
```

**Pros:**
- ✅ Real component screenshots
- ✅ Somewhat automated (run script)
- ✅ Reproducible

**Cons:**
- ❌ Requires Playwright setup
- ❌ Fragile (breaks if website changes)
- ❌ Still need manual ground truth definition

**Acceptance Criteria:**
- [ ] Playwright script screenshots shadcn/ui components
- [ ] 15-20 screenshots captured
- [ ] Manual ground truth creation (still required)
- [ ] Script documented for future use

---

## Comparison Matrix

| Approach | Time | Quality | Automation | Ground Truth Accuracy | Best For |
|----------|------|---------|------------|----------------------|----------|
| **Automated (Epic 001)** | 15 min | Basic | 100% | Perfect | MVP, testing, speed |
| **Manual (Option 1)** | 4-6 hrs | Highest | 0% | Manual (good) | Production, stakeholders |
| **Hybrid (Option 2)** | 2-3 hrs | Mixed | 50% | Mixed | Balanced approach |
| **Playwright (Option 3)** | 3-4 hrs | High | 70% | Manual (good) | Reusable automation |

---

## Integration with Epic 001

If you implement this epic, the E2E evaluator needs minimal changes:

```python
# backend/src/evaluation/golden_dataset.py

class GoldenDataset:
    """Load golden dataset from either automated or manual source."""

    def __init__(self, dataset_path: Path = None):
        """
        Load golden dataset.

        Priority:
        1. Custom path if provided
        2. golden_dataset_manual (if exists)
        3. golden_dataset_hybrid (if exists)
        4. golden_dataset (automated, default)
        """
        if dataset_path:
            self.path = dataset_path
        elif (Path("data/golden_dataset_manual").exists()):
            self.path = Path("data/golden_dataset_manual")
            print("Using manual golden dataset")
        elif (Path("data/golden_dataset_hybrid").exists()):
            self.path = Path("data/golden_dataset_hybrid")
            print("Using hybrid golden dataset")
        else:
            self.path = Path("data/golden_dataset")
            print("Using automated golden dataset")
```

---

## Cost Analysis

### Option 1: Manual
- **Time Cost**: 4-6 hours of manual work
- **Financial Cost**: $0 (just time)
- **Quality**: Highest

### Option 2: Hybrid
- **Time Cost**: 2-3 hours (1 hr automated + 2 hr manual)
- **Financial Cost**: $0.30 (automated portion)
- **Quality**: High for real, basic for synthetic

### Option 3: Playwright
- **Time Cost**: 3-4 hours (initial setup + manual ground truth)
- **Financial Cost**: $0
- **Quality**: High (real components)

---

## Recommendation

**For Most Cases:** Stick with Epic 001 (automated)
- Fast, exact ground truth, sufficient for testing

**Implement This Epic If:**
1. Automated screenshots fail to catch real issues
2. Stakeholders complain about visual quality
3. Production deployment needs higher confidence

**Start With:** Option 2 (Hybrid)
- Add 5 real screenshots to automated dataset
- Best balance of time vs quality

---

## Success Criteria

**Epic 003 Complete When:**
- [ ] Manual, hybrid, or Playwright dataset created
- [ ] 15-20 high-quality screenshots captured
- [ ] Ground truth JSON for all screenshots
- [ ] Dataset works with E2E evaluator
- [ ] README documents source and quality

**Production-Ready When:**
- [ ] E2E evaluation passes with manual dataset
- [ ] Visual quality meets stakeholder expectations
- [ ] Ground truth validated against actual component code
- [ ] Dataset maintenance process documented

---

## Future Enhancements

If manual dataset becomes standard:

1. **Automated Ground Truth Extraction**
   - Use browser DevTools API to extract computed styles
   - Auto-generate ground truth from live components

2. **Visual Regression Testing**
   - Compare generated component screenshots to golden dataset
   - Pixel-diff analysis for visual changes

3. **Continuous Dataset Updates**
   - Re-screenshot when shadcn/ui updates
   - Automated notifications of design system changes

---

## References

- **Prerequisite**: Epic 001 (E2E Evaluation with automated dataset)
- **shadcn/ui Docs**: https://ui.shadcn.com/docs/components
- **Playwright Docs**: https://playwright.dev/python/docs/screenshots

---

## Bottom Line

Manual golden dataset creation is an **optional enhancement** that provides higher visual quality at the cost of time. The automated approach from Epic 001 is sufficient for most use cases.

**Decision Matrix:**
- **MVP/Bootcamp**: Use Epic 001 automated dataset
- **Pre-Production**: Consider hybrid approach (Option 2)
- **Production/Marketing**: Implement full manual dataset (Option 1)

Start with Epic 001, implement Epic 003 only if automated screenshots prove insufficient.
