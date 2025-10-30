/**
 * Shared types for Epic 5 validation infrastructure
 * These types are used across all validators (F2-F6)
 */

/**
 * Standard validation result structure
 */
export interface ValidationResult {
  /** Whether validation passed without errors */
  valid: boolean;
  /** Critical errors that block component delivery */
  errors: string[];
  /** Warnings that don't block delivery but should be addressed */
  warnings: string[];
  /** Additional details about the validation */
  details?: Record<string, unknown>;
}

/**
 * Accessibility violation from axe-core (Task F2)
 */
export interface A11yViolation {
  /** Unique rule identifier (e.g., 'button-name', 'color-contrast') */
  id: string;
  /** Severity level */
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  /** Human-readable description */
  description: string;
  /** Selector for the affected element */
  target: string[];
  /** How to fix this violation */
  help: string;
  /** URL to axe documentation */
  helpUrl: string;
  /** HTML snippet of the violating element */
  html?: string;
}

/**
 * Keyboard navigation issue (Task F3)
 */
export interface KeyboardIssue {
  /** Type of keyboard issue */
  type: 'tab_navigation' | 'keyboard_activation' | 'escape_key' | 'keyboard_trap' | 'tab_order';
  /** Description of the issue */
  message: string;
  /** Severity level */
  severity: 'critical' | 'serious' | 'moderate';
  /** Element selector if applicable */
  target?: string;
  /** Expected behavior */
  expected?: string;
  /** Actual behavior observed */
  actual?: string;
}

/**
 * Focus indicator issue (Task F4)
 */
export interface FocusIssue {
  /** Type of focus issue */
  type: 'missing_focus_indicator' | 'insufficient_focus_contrast' | 'focus_failure' | 'outline_removed';
  /** Description of the issue */
  message: string;
  /** Severity level */
  severity: 'critical' | 'serious';
  /** Element selector if applicable */
  target?: string;
  /** Actual contrast ratio (if applicable) */
  actual?: number;
  /** Required contrast ratio */
  required?: number;
  /** Computed styles for debugging */
  styles?: Record<string, string>;
}

/**
 * Color contrast violation (Task F5)
 */
export interface ContrastViolation {
  /** Type of element with contrast issue */
  type: 'text' | 'large_text' | 'ui_component';
  /** Foreground color (text/icon color) */
  foreground: string;
  /** Background color */
  background: string;
  /** Actual contrast ratio */
  actualRatio: number;
  /** Required contrast ratio per WCAG AA */
  requiredRatio: number;
  /** Element selector */
  target: string;
  /** State when violation occurred (default, hover, focus, disabled) */
  state: 'default' | 'hover' | 'focus' | 'disabled' | 'active';
  /** Suggested alternative colors that meet standards */
  suggestions?: Array<{
    foreground?: string;
    background?: string;
    ratio: number;
  }>;
}

/**
 * Design tokens structure (Task F6)
 */
export interface DesignTokens {
  /** Color tokens (e.g., primary, secondary, text, background) */
  colors: Record<string, string>;
  /** Typography tokens (e.g., font families, sizes, weights, line heights) */
  typography: Record<string, string>;
  /** Spacing tokens (e.g., padding, margin, gap values) */
  spacing: Record<string, string>;
}

/**
 * Token adherence violation (Task F6)
 */
export interface TokenViolation {
  /** Category of token violation */
  category: 'color' | 'typography' | 'spacing';
  /** Property that doesn't match tokens */
  property: string;
  /** Expected value from design tokens */
  expected: string;
  /** Actual value in component */
  actual: string;
  /** Element selector */
  target: string;
  /** Color difference (Delta E) for color violations */
  deltaE?: number;
  /** Whether this is within tolerance */
  withinTolerance?: boolean;
}

/**
 * Auto-fix result (Task I1)
 */
export interface AutoFixResult {
  /** Whether auto-fix was successful */
  success: boolean;
  /** Updated code after auto-fix */
  code?: string;
  /** List of issues that were fixed */
  fixed: Array<{
    type: string;
    description: string;
  }>;
  /** List of issues that couldn't be auto-fixed */
  unfixed: Array<{
    type: string;
    description: string;
    suggestion: string;
  }>;
  /** Diff showing changes made */
  diff?: string;
}

/**
 * Comprehensive validation report
 */
export interface ValidationReport {
  /** Overall validation status */
  status: 'pass' | 'fail';
  /** Timestamp of validation */
  timestamp: string;
  /** Component metadata */
  component: {
    name: string;
    variant?: string;
  };
  /** TypeScript validation results (from Epic 4.5) */
  typescript?: ValidationResult;
  /** ESLint validation results (from Epic 4.5) */
  eslint?: ValidationResult;
  /** Accessibility validation results (Task F2) */
  accessibility?: ValidationResult & {
    violations: A11yViolation[];
  };
  /** Keyboard navigation results (Task F3) */
  keyboard?: ValidationResult & {
    issues: KeyboardIssue[];
  };
  /** Focus indicator results (Task F4) */
  focus?: ValidationResult & {
    issues: FocusIssue[];
  };
  /** Color contrast results (Task F5) */
  contrast?: ValidationResult & {
    violations: ContrastViolation[];
  };
  /** Token adherence results (Task F6) */
  tokens?: ValidationResult & {
    adherenceScore: number;
    violations: TokenViolation[];
    byCategory: {
      colors: number;
      typography: number;
      spacing: number;
    };
  };
  /** Auto-fix results */
  autoFix?: AutoFixResult;
  /** Overall quality scores */
  qualityScores?: {
    compilation: number;
    linting: number;
    accessibility: number;
    tokens: number;
    overall: number;
  };
}
