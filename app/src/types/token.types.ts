/**
 * Domain model types for design tokens and components.
 * These types represent domain concepts, not API contracts.
 */

// Token categories
export enum TokenCategory {
  COLOR = 'color',
  TYPOGRAPHY = 'typography',
  SPACING = 'spacing',
}

// Confidence level classifications
export enum ConfidenceLevel {
  HIGH = 'high',       // >= 0.9
  MEDIUM = 'medium',   // >= 0.7 && < 0.9
  LOW = 'low',         // < 0.7
}

// Color token with metadata
export interface ColorToken {
  name: string;
  value: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  fallbackUsed?: boolean;
  reviewNeeded?: boolean;
}

// Typography token with metadata
export interface TypographyToken {
  name: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  fallbackUsed?: boolean;
  reviewNeeded?: boolean;
}

// Spacing token with metadata
export interface SpacingToken {
  name: string;
  value: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  fallbackUsed?: boolean;
  reviewNeeded?: boolean;
}

// Combined token set
export interface TokenSet {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
}

// Helper function to determine confidence level
export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.9) return ConfidenceLevel.HIGH;
  if (confidence >= 0.7) return ConfidenceLevel.MEDIUM;
  return ConfidenceLevel.LOW;
}
