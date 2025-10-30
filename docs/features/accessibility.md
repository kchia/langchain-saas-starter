# Accessibility

Comprehensive accessibility testing and WCAG compliance validation for generated components.

## Overview

ComponentForge ensures all generated components meet WCAG 2.1 Level AA accessibility standards through automated testing and validation. The system includes **requirement extraction** (Epic 2), **axe-core auditing** (Epic 5 Task F2), and **quality reporting** (Epic 5 Task B1).

**Key Features:**
- ♿ **WCAG 2.1 AA Compliance** - Automated testing against accessibility standards
- 🤖 **AI-Powered Requirements** - GPT-4V proposes ARIA labels and semantic HTML
- ✅ **axe-core Integration** - Industry-standard accessibility testing
- 📊 **Comprehensive Reporting** - Detailed violation tracking and quality scores
- 🔧 **Auto-Fix Capable** - LLM-based accessibility improvements (planned)
- ⚡ **Fast Validation** - <10s for complete accessibility audit

## Implementation Status

### ✅ Implemented (Epic 2 & Epic 5 Task F2, B1)

**Epic 2: Accessibility Requirement Extraction**
- AI-powered accessibility requirement proposals
- ARIA label detection and recommendations
- Semantic HTML suggestions
- Keyboard navigation requirements
- Color contrast considerations

**Epic 5 Task F2: axe-core Accessibility Validator**
- Playwright-based component rendering
- axe-core v4.10 integration
- WCAG 2.1 Level AA compliance checks
- Critical/Serious violation blocking
- Moderate/Minor violation warnings
- Multi-variant testing support

**Epic 5 Task B1: Quality Report Generator**
- Aggregates accessibility validation results
- Generates comprehensive HTML/JSON reports
- Status determination (PASS/FAIL)
- Tracking and traceability

### ⏳ Planned (Epic 5 Tasks F3-F6)

**Task F3: Keyboard Navigation Validator** (2-3 days)
- Tab order verification
- Enter/Space activation testing
- Escape key handling
- Arrow key navigation
- Focus trap detection

**Task F4: Focus Indicator Validator** (2 days)
- Focus visibility testing
- Contrast ratio verification (≥3:1)
- Focus outline rendering
- Custom focus styles validation

**Task F5: Color Contrast Validator** (2-3 days)
- WCAG AA compliance (4.5:1 text, 3:1 UI)
- Foreground/background contrast analysis
- Interactive state contrast
- Color blindness simulation

**Task F6: Token Adherence Validator** (2-3 days)
- Design token usage measurement
- ≥90% adherence target
- Color, typography, spacing verification

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Accessibility Testing Pipeline                 │
└─────────────────────────────────────────────────────────────┘

Epic 2: Requirement Extraction
       ↓
┌──────────────────────────────────────────────────────┐
│  Accessibility Requirement Proposer                  │
│  (GPT-4V Vision API)                                 │
├──────────────────────────────────────────────────────┤
│  Input: Component screenshot                         │
│  Output: Accessibility requirements                  │
│                                                      │
│  - ARIA labels (aria-label, aria-describedby)       │
│  - Semantic HTML (button, nav, article)             │
│  - Keyboard navigation (Tab, Enter, Escape)         │
│  - Color contrast considerations                    │
└──────────────────────┼───────────────────────────────┘
                       ↓
Epic 4: Code Generation with A11y Requirements
       ↓
┌──────────────────────────────────────────────────────┐
│  Generated Component Code                            │
│  (with accessibility features)                       │
└──────────────────────┼───────────────────────────────┘
                       ↓
Epic 5: Accessibility Validation
       ↓
┌──────────────────────────────────────────────────────┐
│  Stage 1: axe-core Accessibility Audit               │
│  (Epic 5 Task F2 - ✅ Implemented)                   │
├──────────────────────────────────────────────────────┤
│  ┌────────────────────┐                             │
│  │  A11yValidator     │  Playwright + axe-core      │
│  │                    │                             │
│  │  1. Launch browser │                             │
│  │  2. Render component                             │
│  │  3. Inject axe-core                              │
│  │  4. Run audit      │                             │
│  │  5. Process results│                             │
│  └─────────┬──────────┘                             │
│            ↓                                         │
│  Violations by Severity:                            │
│  - Critical (0 allowed) → FAIL                      │
│  - Serious (0 allowed) → FAIL                       │
│  - Moderate → Warn only                             │
│  - Minor → Warn only                                │
└──────────────────────┼───────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│  Stage 2-5: Additional Validators (⏳ Planned)       │
├──────────────────────────────────────────────────────┤
│  ⏳ Task F3: Keyboard Navigation                     │
│  ⏳ Task F4: Focus Indicators                        │
│  ⏳ Task F5: Color Contrast                          │
│  ⏳ Task F6: Token Adherence                         │
└──────────────────────┼───────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│  Quality Report Generator                            │
│  (Epic 5 Task B1 - ✅ Implemented)                   │
├──────────────────────────────────────────────────────┤
│  Aggregates:                                         │
│  - TypeScript/ESLint results                        │
│  - Accessibility violations                         │
│  - Quality scores                                   │
│  - Auto-fixes applied                               │
│                                                      │
│  Output: HTML/JSON Reports                          │
│  Status: PASS/FAIL                                  │
└──────────────────────────────────────────────────────┘
```

## How It Works

### Phase 1: Requirement Extraction (Epic 2)

**Input**: Component screenshot

**Process**:
1. `AccessibilityProposer` analyzes screenshot with GPT-4V
2. Detects interactive elements requiring accessibility features
3. Proposes ARIA attributes, semantic HTML, keyboard support
4. Returns requirements with confidence scores

**Example Requirements**:
```json
{
  "category": "accessibility",
  "proposals": [
    {
      "name": "aria-label",
      "value": "Close dialog",
      "confidence": 0.95,
      "reasoning": "Button with X icon needs descriptive label for screen readers"
    },
    {
      "name": "role",
      "value": "dialog",
      "confidence": 0.98,
      "reasoning": "Modal container should use dialog role for semantic meaning"
    },
    {
      "name": "keyboard-navigation",
      "value": "Tab, Escape, Enter",
      "confidence": 0.90,
      "reasoning": "Interactive modal requires keyboard accessibility"
    }
  ]
}
```

### Phase 2: Code Generation (Epic 4)

Requirements are passed to the code generator, which creates accessible components:

```typescript
interface DialogProps {
  open: boolean;
  onClose: () => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const Dialog = ({
  open,
  onClose,
  children,
  'aria-label': ariaLabel = 'Dialog',
  'aria-describedby': ariaDescribedBy,
}: DialogProps) => {
  // Keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog content */}
      <div className="relative bg-white rounded-lg p-6 shadow-xl">
        {children}

        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-2 right-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
```

### Phase 3: Accessibility Validation (Epic 5 Task F2)

**axe-core Audit Process**:

1. **Browser Launch**
   ```typescript
   const browser = await chromium.launch({ headless: true });
   const page = await browser.newPage();
   ```

2. **Component Rendering**
   ```typescript
   // Create test page with React component
   const html = createTestPage(componentCode, componentName, variants);
   await page.setContent(html);
   await page.waitForSelector('#root > *', { timeout: 5000 });
   ```

3. **axe-core Injection**
   ```typescript
   await page.addScriptTag({
     url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.0/axe.min.js'
   });
   ```

4. **Run Accessibility Audit**
   ```typescript
   const results = await page.evaluate(() => {
     return window.axe.run();
   });
   ```

5. **Process Results**
   ```typescript
   const violations = results.violations.map(violation => ({
     id: violation.id,
     impact: violation.impact, // 'critical' | 'serious' | 'moderate' | 'minor'
     description: violation.description,
     help: violation.help,
     helpUrl: violation.helpUrl,
     nodes: violation.nodes.map(node => ({
       html: node.html,
       target: node.target,
       failureSummary: node.failureSummary
     }))
   }));
   ```

**Validation Result**:
```json
{
  "valid": false,
  "errors": [
    "[CRITICAL] color-contrast: Elements must have sufficient color contrast (button.primary)"
  ],
  "warnings": [
    "[MODERATE] label: Form elements must have labels (input#email)"
  ],
  "details": {
    "violations": [
      {
        "id": "color-contrast",
        "impact": "critical",
        "description": "Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",
        "target": ["button.primary"],
        "help": "Elements must have sufficient color contrast",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/color-contrast",
        "html": "<button class=\"bg-gray-200 text-gray-300\">Click me</button>"
      }
    ],
    "violationsBySeverity": {
      "critical": 1,
      "serious": 0,
      "moderate": 1,
      "minor": 0
    }
  }
}
```

### Phase 4: Quality Reporting (Epic 5 Task B1)

The Quality Report Generator aggregates accessibility results:

```python
from validation.report_generator import QualityReportGenerator

generator = QualityReportGenerator()

validation_results = {
    "typescript": {"valid": True, "errorCount": 0},
    "eslint": {"valid": True, "errorCount": 0},
    "a11y": {
        "valid": False,
        "violations": [
            {"impact": "critical", "id": "color-contrast", ...}
        ]
    },
    "auto_fixes": []
}

report = generator.generate(validation_results, "Dialog")

# report.overall_status == "FAIL" (due to critical a11y violation)
# report.summary["accessibility"] == False
# report.recommendations includes "Fix color contrast for accessibility compliance"
```

## WCAG 2.1 Level AA Compliance

### Critical Violations (Must Pass)

These violations **block** component delivery:

| Rule | WCAG | Description |
|------|------|-------------|
| **color-contrast** | 1.4.3 | Text contrast ≥4.5:1, large text ≥3:1 |
| **button-name** | 4.1.2 | Buttons must have accessible names |
| **link-name** | 4.1.2 | Links must have accessible names |
| **image-alt** | 1.1.1 | Images must have alt text |
| **aria-valid-attr** | 4.1.2 | ARIA attributes must be valid |
| **aria-required-attr** | 4.1.2 | Required ARIA attributes must be present |

### Serious Violations (Must Pass)

These violations also **block** component delivery:

| Rule | WCAG | Description |
|------|------|-------------|
| **label** | 3.3.2 | Form inputs must have labels |
| **aria-allowed-attr** | 4.1.2 | ARIA attributes must be allowed on element |
| **duplicate-id** | 4.1.1 | IDs must be unique |
| **valid-lang** | 3.1.1 | Valid language codes required |

### Moderate/Minor Violations (Warnings Only)

These generate warnings but don't block delivery:

| Rule | WCAG | Description |
|------|------|-------------|
| **region** | 1.3.1 | Landmarks should be used for navigation |
| **list** | 1.3.1 | Lists must be structured properly |
| **meta-viewport** | - | Viewport should allow zoom |
| **heading-order** | - | Headings should be in logical order |

## API Usage

### Validate Accessibility

```typescript
import { A11yValidator } from '@/services/validation/a11y-validator';

const validator = new A11yValidator();

// Validate component
const result = await validator.validate(
  componentCode,
  'Button',
  ['default', 'primary', 'secondary']
);

if (!result.valid) {
  console.error('Accessibility violations:', result.errors);
  // Critical/Serious violations block delivery
}

if (result.warnings.length > 0) {
  console.warn('Accessibility warnings:', result.warnings);
  // Moderate/Minor violations are warnings only
}

// Cleanup
await validator.cleanup();
```

### Generate Quality Report

```python
from validation.report_generator import QualityReportGenerator

generator = QualityReportGenerator()

# Validation results from all validators
validation_results = {
    "typescript": ts_result,
    "eslint": eslint_result,
    "a11y": a11y_result,  # From A11yValidator
    # Future validators (Epic 5 Tasks F3-F6):
    # "keyboard": keyboard_result,
    # "focus": focus_result,
    # "contrast": contrast_result,
    # "tokens": token_result,
    "auto_fixes": fixes_applied
}

# Generate comprehensive report
report = generator.generate(validation_results, component_name)

# Check overall status
if report.overall_status == "FAIL":
    print("Component failed quality validation")
    print("Recommendations:", report.recommendations)

# Export as HTML
html_report = generator.generate_html(report)
with open("quality_report.html", "w") as f:
    f.write(html_report)
```

## Usage Examples

### End-to-End Accessibility Testing

```typescript
// 1. Extract accessibility requirements (Epic 2)
const requirements = await extractRequirements(screenshot);
const a11yRequirements = requirements.filter(r => r.category === 'accessibility');

// 2. Generate component with accessibility features (Epic 4)
const generated = await generateComponent({
  pattern_id: 'shadcn-dialog',
  requirements: a11yRequirements,
  tokens: designTokens
});

// 3. Validate accessibility (Epic 5)
const validator = new A11yValidator();
const validationResult = await validator.validate(
  generated.code.component,
  'Dialog',
  ['default']
);

// 4. Generate quality report (Epic 5 Task B1)
const report = await generateQualityReport({
  typescript: tsValidation,
  eslint: eslintValidation,
  a11y: validationResult
});

// 5. Check if component meets accessibility standards
if (report.overall_status === 'PASS') {
  console.log('✓ Component meets WCAG 2.1 AA standards');
} else {
  console.error('✗ Accessibility violations:', report.summary);
  console.log('Recommendations:', report.recommendations);
}

await validator.cleanup();
```

### Testing Multiple Variants

```typescript
const validator = new A11yValidator();

// Test all button variants
const result = await validator.validate(
  buttonCode,
  'Button',
  ['default', 'primary', 'secondary', 'ghost', 'outline']
);

console.log('Violations by severity:', result.details.violationsBySeverity);
// { critical: 0, serious: 0, moderate: 2, minor: 1 }

await validator.cleanup();
```

## Performance

### Latency Targets

- **Requirement Extraction**: 3-8s (GPT-4V API call)
- **axe-core Validation**: 5-10s (browser launch + audit)
- **Quality Report Generation**: <1s

**Total Accessibility Pipeline**: <15s

### Optimization Tips

1. **Parallel Validation**
   - Run TypeScript, ESLint, and A11y validators in parallel
   - Reduces total validation time

2. **Browser Reuse**
   - Reuse browser instances for multiple validations
   - Reduces browser launch overhead

3. **Variant Batching**
   - Test multiple variants in single page load
   - Current implementation already optimized

4. **Cache axe-core**
   - Use local axe-core instead of CDN
   - Reduces network latency

## Troubleshooting

### axe-core Validation Fails

**Problem**: Browser launch fails or times out

**Solutions**:
1. Verify Playwright is installed: `npm install @playwright/test`
2. Install browser binaries: `npx playwright install chromium`
3. Check system resources (memory, CPU)
4. Increase timeout in validator configuration

### False Positive Violations

**Problem**: axe-core reports violations that aren't relevant

**Solutions**:
1. Review violation details and help URLs
2. Check if component context affects accessibility
3. Use axe-core configuration to disable specific rules if needed
4. Verify component is rendering correctly in test page

### Missing Accessibility Requirements

**Problem**: AccessibilityProposer doesn't detect needed features

**Solutions**:
1. Ensure screenshot quality is high (clear, well-lit)
2. Review GPT-4V prompt in `accessibility_proposer.py`
3. Check classification accuracy (correct component type)
4. Manually add missing requirements in frontend UI

### Slow Validation

**Problem**: Accessibility validation takes >15s

**Solutions**:
1. Check browser launch time (should be <2s)
2. Verify axe-core loads quickly (consider local copy)
3. Reduce number of variants being tested
4. Profile with LangSmith tracing

## Roadmap

### ✅ Completed

- Epic 2: Accessibility Requirement Proposer
- Epic 5 Task F2: axe-core Accessibility Validator
- Epic 5 Task B1: Quality Report Generator

### 🚧 In Progress

None currently

### ⏳ Planned (Epic 5 Tasks F3-F6)

**Short Term** (Next 2-3 weeks):
- Task F3: Keyboard Navigation Validator
- Task F4: Focus Indicator Validator
- Task F5: Color Contrast Validator
- Task F6: Token Adherence Validator

**Medium Term** (1-2 months):
- Extended auto-fix for accessibility violations
- Screen reader compatibility testing
- Mobile accessibility testing
- Accessibility regression testing

**Long Term** (3-6 months):
- WCAG 2.2 compliance
- ARIA authoring practices validation
- Automated accessibility documentation
- Accessibility metrics dashboard

## See Also

- [Quality Validation](./quality-validation.md) - Complete quality validation system
- [Code Generation](./code-generation.md) - How accessibility features are generated
- [Requirements Extraction](../project-history/archive/epic-implementations/epic-2-implementation-summary.md) - Requirement extraction including accessibility
- [Epic 5 Specification](../../.claude/epics/05-quality-validation.md) - Full accessibility testing plan
- [axe-core Documentation](https://www.deque.com/axe/) - axe-core accessibility testing library
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Web Content Accessibility Guidelines
