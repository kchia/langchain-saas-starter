/**
 * Domain types for requirement proposal system.
 * 
 * These types define the requirement proposal contract between
 * backend AI agents and frontend approval UI.
 */

// Requirement categories
export enum RequirementCategory {
  PROPS = 'props',
  EVENTS = 'events',
  STATES = 'states',
  ACCESSIBILITY = 'accessibility',
}

// Component types that can be detected
export enum ComponentType {
  BUTTON = 'Button',
  CARD = 'Card',
  INPUT = 'Input',
  SELECT = 'Select',
  BADGE = 'Badge',
  ALERT = 'Alert',
}

// Confidence level thresholds
export enum RequirementConfidenceLevel {
  HIGH = 'high',      // >= 0.9
  MEDIUM = 'medium',  // >= 0.7 && < 0.9
  LOW = 'low',        // < 0.7
}

// Single requirement proposal
export interface RequirementProposal {
  id: string;
  category: RequirementCategory;
  name: string;
  values?: string[];           // For props (e.g., ['primary', 'secondary'])
  required?: boolean;          // For events/a11y
  description?: string;        // For states/a11y
  confidence: number;          // 0.0 - 1.0
  rationale: string;           // Why this requirement was proposed
  approved: boolean;           // User approval status
  edited: boolean;             // Whether user edited it
}

// Component classification result
export interface ComponentClassification {
  componentType: ComponentType;
  confidence: number;
  candidates: Array<{         // Alternative candidates in ambiguous cases
    type: ComponentType;
    confidence: number;
  }>;
  rationale: string;
}

// Requirement proposal state
export interface RequirementState {
  // Input data
  imageData?: string;
  figmaData?: Record<string, unknown>;
  tokens?: Record<string, unknown>;
  
  // Classification result
  classification?: ComponentClassification;
  
  // Proposed requirements by category
  propsProposals: RequirementProposal[];
  eventsProposals: RequirementProposal[];
  statesProposals: RequirementProposal[];
  accessibilityProposals: RequirementProposal[];
  
  // Metadata
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// Requirements export format
export interface RequirementsExport {
  componentType: ComponentType;
  confidence: number;
  requirements: RequirementProposal[];
  metadata: {
    extractedAt: string;
    approvedAt?: string;
    source: 'screenshot' | 'figma';
  };
}

/**
 * Convert numeric confidence to level classification.
 * 
 * @param confidence - Confidence score between 0.0 and 1.0
 * @returns Corresponding confidence level
 */
export function getRequirementConfidenceLevel(
  confidence: number
): RequirementConfidenceLevel {
  if (confidence >= 0.9) return RequirementConfidenceLevel.HIGH;
  if (confidence >= 0.7) return RequirementConfidenceLevel.MEDIUM;
  return RequirementConfidenceLevel.LOW;
}

/**
 * Get all proposals from a requirement state.
 * 
 * @param state - Requirement state object
 * @returns Combined list of all proposals
 */
export function getAllProposals(
  state: RequirementState
): RequirementProposal[] {
  return [
    ...state.propsProposals,
    ...state.eventsProposals,
    ...state.statesProposals,
    ...state.accessibilityProposals,
  ];
}

/**
 * Get only approved proposals from a requirement state.
 * 
 * @param state - Requirement state object
 * @returns List of approved proposals
 */
export function getApprovedProposals(
  state: RequirementState
): RequirementProposal[] {
  return getAllProposals(state).filter((p) => p.approved);
}

/**
 * Group proposals by category.
 * 
 * @param proposals - List of proposals to group
 * @returns Proposals grouped by category
 */
export function groupProposalsByCategory(
  proposals: RequirementProposal[]
): Record<RequirementCategory, RequirementProposal[]> {
  return {
    [RequirementCategory.PROPS]: proposals.filter(
      (p) => p.category === RequirementCategory.PROPS
    ),
    [RequirementCategory.EVENTS]: proposals.filter(
      (p) => p.category === RequirementCategory.EVENTS
    ),
    [RequirementCategory.STATES]: proposals.filter(
      (p) => p.category === RequirementCategory.STATES
    ),
    [RequirementCategory.ACCESSIBILITY]: proposals.filter(
      (p) => p.category === RequirementCategory.ACCESSIBILITY
    ),
  };
}
