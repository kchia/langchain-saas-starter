# Epic 5: Extended Quality Validation & Accessibility Testing

This directory contains the frontend validation infrastructure for Epic 5, providing comprehensive accessibility, keyboard navigation, color contrast, and design token adherence validation.

## Overview

Epic 5 extends Epic 4.5's TypeScript/ESLint validation with:
- ✅ Accessibility testing (axe-core)
- ✅ Keyboard navigation validation
- ✅ Focus indicator validation
- ✅ Color contrast validation (WCAG AA)
- ✅ Design token adherence measurement

## Files

```
app/src/services/validation/
├── types.ts                  # Shared validation types
├── utils.ts                  # WCAG utility functions
├── index.ts                  # Public exports
├── a11y-validator.ts         # F2: Accessibility validator
├── keyboard-validator.ts     # F3: Keyboard navigation validator
├── focus-validator.ts        # F4: Focus indicator validator
├── contrast-validator.ts     # F5: Color contrast validator
├── token-validator.ts        # F6: Token adherence validator
└── __tests__/
    └── setup.ts              # Test utilities
```

## Usage

### A11y Validator (Task F2)

Validates component accessibility using axe-core:

```typescript
import { A11yValidator } from '@/services/validation';

const validator = new A11yValidator();
const result = await validator.validate(
  componentCode,
  'Button',
  ['default', 'primary', 'secondary']
);

console.log(result.valid); // true if no critical/serious violations
console.log(result.errors); // Critical/serious violations (block delivery)
console.log(result.warnings); // Moderate/minor violations
console.log(result.details.violations); // Full violation details
```

**Features:**
- Renders components in Playwright headless browser
- Runs axe-core v4.10 accessibility audit
- Tests all component variants
- Zero tolerance for critical/serious violations
- Provides remediation guidance

### Keyboard Validator (Task F3)

Tests keyboard navigation:

```typescript
import { KeyboardValidator } from '@/services/validation';

const validator = new KeyboardValidator();
const result = await validator.validate(
  componentCode,
  'Button',
  'button' // Component type
);

console.log(result.valid); // true if all keyboard tests pass
console.log(result.details.issues); // Keyboard navigation issues
```

**Tests:**
- Tab navigation through interactive elements
- Tab order validation
- Enter/Space activation (buttons)
- Escape key (modals, dialogs)
- Arrow keys (tabs, selects)
- Keyboard trap detection

### Focus Validator (Task F4)

Validates focus indicators:

```typescript
import { FocusValidator } from '@/services/validation';

const validator = new FocusValidator();
const result = await validator.validate(componentCode, 'Button');

console.log(result.valid); // true if all focus indicators pass
console.log(result.details.issues); // Focus indicator issues
```

**Checks:**
- Focus indicator visibility
- Focus indicator contrast ≥3:1 (WCAG 2.1 AA)
- Outline removal detection
- Custom focus styles validation

### Contrast Validator (Task F5)

Validates color contrast compliance:

```typescript
import { ContrastValidator } from '@/services/validation';

const validator = new ContrastValidator();
const result = await validator.validate(componentCode, 'Button');

console.log(result.valid); // true if all contrast ratios pass
console.log(result.details.violations); // Contrast violations
```

**Validates:**
- Normal text: ≥4.5:1
- Large text: ≥3:1
- UI components: ≥3:1
- All states: default, hover, focus, disabled
- Provides color suggestions

### Token Validator (Task F6)

Measures design token adherence:

```typescript
import { TokenValidator, extractComputedStyles } from '@/services/validation';

const validator = new TokenValidator();

// Option 1: Use code parsing (less accurate, fallback)
const result1 = await validator.validate(componentCode);

// Option 2: Use computed styles from browser (RECOMMENDED - more accurate)
const styles = await extractComputedStyles(componentCode, 'Button');
const result2 = await validator.validate(componentCode, styles);

console.log(result2.details.adherenceScore); // Overall adherence %
console.log(result2.details.byCategory); // Scores by category
```

**Measures:**
- Color adherence (ΔE ≤2 tolerance)
- Typography adherence (fonts, sizes, weights)
- Spacing adherence (padding, margin, gap)
- Target: ≥90% overall adherence

**Style Extraction:**
- **Recommended**: Use `extractComputedStyles()` for accurate style extraction from rendered components
- **Fallback**: Regex-based parsing from code (limited to inline styles and Tailwind arbitrary values)

## WCAG Utilities

Utility functions for accessibility calculations:

```typescript
import {
  parseColor,
  getContrastRatio,
  calculateContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  calculateDeltaE,
  suggestAccessibleColors,
  type RGBColor,
} from '@/services/validation';

// Parse color strings
const rgb = parseColor('#3b82f6'); // { r: 59, g: 130, b: 246 }

// Calculate contrast ratio
const ratio = calculateContrastRatio('#000000', '#ffffff'); // 21

// Check WCAG compliance
const passesAA = meetsWCAGAA(ratio, 'normal_text'); // true if ratio >= 4.5

// Get color suggestions
const suggestions = suggestAccessibleColors('#999', '#aaa', 4.5);
// Returns array of {foreground?, background?, ratio} objects
```

## Types

All validators return a `ValidationResult`:

```typescript
interface ValidationResult {
  valid: boolean;           // Overall pass/fail
  errors: string[];         // Critical issues (block delivery)
  warnings: string[];       // Non-blocking issues
  details?: Record<string, unknown>; // Validator-specific details
}
```

Specific violation types:
- `A11yViolation` - Accessibility violations
- `KeyboardIssue` - Keyboard navigation issues
- `FocusIssue` - Focus indicator issues
- `ContrastViolation` - Color contrast violations
- `TokenViolation` - Design token violations

## Architecture

### Browser-based Validation
Validators F2-F5 use Playwright to:
1. Launch headless browser
2. Render React component
3. Run validation checks
4. Collect violations
5. Clean up browser resources

### Validation Flow
```
Component Code
    ↓
Render in Playwright Browser
    ↓
Run Validation Checks
    ↓
Collect Violations
    ↓
Return ValidationResult
```

## Standards

### WCAG 2.1 AA Compliance
- **Normal text**: Contrast ≥4.5:1
- **Large text**: Contrast ≥3:1
- **UI components**: Contrast ≥3:1
- **Focus indicators**: Contrast ≥3:1
- **Zero tolerance**: Critical/serious accessibility violations

### Keyboard Accessibility
- Tab navigation works
- Correct tab order
- Enter/Space activation
- Escape dismisses modals
- No keyboard traps

### Design Tokens
- Color match with ΔE ≤2 tolerance
- Typography uses approved tokens
- Spacing uses approved values
- Target: ≥90% adherence

## Integration with Epic 4.5

Epic 5 validators extend Epic 4.5's `CodeValidator`:

```
Epic 4.5 (Foundation)        Epic 5 (Extensions)
├── TypeScript validation    ├── Accessibility (axe-core)
├── ESLint validation        ├── Keyboard navigation
└── Auto-fix (TS/ESLint)     ├── Focus indicators
                             ├── Color contrast
                             ├── Token adherence
                             └── Extended auto-fix
```

## Performance

Target validation times:
- **Per validator**: <2s
- **All validators**: <10s
- **Total (Epic 4.5 + Epic 5)**: <15s

### Performance Optimization

**Browser Reuse** (Recommended for multiple validations):

```typescript
import { 
  runValidatorsInParallel,
  A11yValidator,
  KeyboardValidator,
  FocusValidator,
  ContrastValidator,
  TokenValidator,
} from '@/services/validation';

// Run validators in parallel with shared browser instance
const results = await runValidatorsInParallel([
  () => new A11yValidator().validate(code, 'Button'),
  () => new KeyboardValidator().validate(code, 'Button', 'button'),
  () => new FocusValidator().validate(code, 'Button'),
  () => new ContrastValidator().validate(code, 'Button'),
  () => new TokenValidator().validate(code),
]);

// Browser is automatically cleaned up after all validators complete
```

**Manual Browser Management** (Advanced):

```typescript
import { getSharedBrowser, releaseSharedBrowser } from '@/services/validation';

const browser = await getSharedBrowser();
try {
  // Use browser for multiple validations
  const page = await browser.newPage();
  // ... perform validations
  await page.close();
} finally {
  await releaseSharedBrowser();
}
```

## Dependencies

- `@playwright/test` - Browser automation
- `@axe-core/react` - Accessibility testing (injected via CDN)
- TypeScript 5.9.3
- Next.js 15.5.4

## Testing

Comprehensive test suites included:

**Unit Tests** (`__tests__/utils.test.ts`):
- Tests for all WCAG utility functions
- Color parsing, contrast calculations
- Delta E color difference
- WCAG AA/AAA compliance checks

**Integration Tests** (`__tests__/integration.test.ts`):
- Tests all validators with real component code
- Tests accessible and inaccessible components
- Performance benchmarks (<15s target)
- Parallel execution tests

**Test Utilities** (`__tests__/setup.ts`):

```typescript
import { 
  SAMPLE_BUTTON_CODE, 
  BUTTON_WITH_A11Y_ISSUES,
  BUTTON_WITH_CONTRAST_ISSUES,
  createMockBrowser 
} from './setup';

// Use sample components for testing
const result = await validator.validate(SAMPLE_BUTTON_CODE, 'Button');

// Mock Playwright for unit tests
const { mockBrowser, mockPage } = createMockBrowser();
```

**Running Tests**:
```bash
# Run all validation tests
npm test -- validation

# Run specific test file
npm test -- integration.test.ts

# Run with coverage
npm test -- --coverage validation
```

## Error Handling

All validators include:
- Try/catch blocks
- Browser cleanup on error
- Proper resource disposal
- Descriptive error messages

## Future Enhancements

Potential improvements:
- ✅ Browser instance reuse (implemented in `browser-pool.ts`)
- ✅ Parallel validator execution (implemented with `runValidatorsInParallel`)
- ✅ Improved style extraction (implemented with `extractComputedStyles`)
- [ ] Caching validation results
- [ ] Custom rule configuration
- [ ] Visual regression testing
- [ ] Automated screenshot capture

## Related Documentation

- [Epic 5 Specification](/.claude/epics/05-quality-validation.md)
- [Commit Strategy](/.claude/epics/05-commit-strategy.md)
- [BASE-COMPONENTS.md](/.claude/BASE-COMPONENTS.md)

## Contributors

Generated with [Claude Code](https://claude.com/claude-code)

Last Updated: 2025-01-08
