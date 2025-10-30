/**
 * Component-related types for UI props and state.
 */

// Props for token editing components
export interface TokenEditorProps {
  tokens: {
    colors?: Record<string, string>;
    typography?: Record<string, any>;
    spacing?: Record<string, any>;
  };
  onTokenChange?: (category: string, name: string, value: any) => void;
}

// Props for export components
export interface TokenExportProps {
  tokens: {
    colors?: Record<string, string>;
    typography?: Record<string, any>;
    spacing?: Record<string, any>;
  };
  format?: 'json' | 'css';
}

// Workflow step for progress tracking
export enum WorkflowStep {
  DASHBOARD = 'dashboard',
  EXTRACT = 'extract',
  REQUIREMENTS = 'requirements',
  PATTERNS = 'patterns',
  PREVIEW = 'preview',
}

// Workflow state
export interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  progress: number; // 0-100
}
