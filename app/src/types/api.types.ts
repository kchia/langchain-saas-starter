/**
 * TypeScript interfaces matching backend Pydantic models
 * for API request/response contracts.
 */

// Image metadata returned from backend
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  mode: string;
  size_bytes: number;
}

// Design tokens structure matching backend DesignTokens model
export interface ColorTokens {
  primary?: string;
  secondary?: string;
  accent?: string;
  destructive?: string;
  muted?: string;
  background?: string;
  foreground?: string;
  border?: string;
}

export interface TypographyTokens {
  fontFamily?: string;
  fontFamilyHeading?: string;
  fontFamilyMono?: string;
  fontSizeXs?: string;
  fontSizeSm?: string;
  fontSizeBase?: string;
  fontSizeLg?: string;
  fontSizeXl?: string;
  fontSize2xl?: string;
  fontSize3xl?: string;
  fontSize4xl?: string;
  fontWeightNormal?: number;
  fontWeightMedium?: number;
  fontWeightSemibold?: number;
  fontWeightBold?: number;
  lineHeightTight?: string;
  lineHeightNormal?: string;
  lineHeightRelaxed?: string;
}

export interface SpacingTokens {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  "2xl"?: string;
  "3xl"?: string;
}

export interface BorderRadiusTokens {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  full?: string;
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
}

// PII detection result (Epic 003 Story 3.1)
export interface PIICheckResult {
  performed: boolean;
  has_pii: boolean;
  confidence: number;
}

// Token extraction response from POST /tokens/extract/screenshot
export interface TokenExtractionResponse {
  tokens: DesignTokens;
  metadata: {
    filename: string;
    image: ImageMetadata;
    extraction_method: string;
    security_validated?: boolean;
    pii_check?: PIICheckResult;
  };
  confidence?: Record<string, number>;
  fallbacks_used?: string[];
  review_needed?: string[];
}

// Figma authentication request for POST /tokens/figma/auth
export interface FigmaAuthRequest {
  personal_access_token: string;
}

// Figma authentication response
export interface FigmaAuthResponse {
  valid: boolean;
  user_email?: string;
  message: string;
}

// Figma extraction request for POST /extract/figma
export interface FigmaExtractRequest {
  figma_url: string;
  personal_access_token?: string;
}

// Figma extraction response
export interface FigmaExtractResponse {
  file_key: string;
  file_name: string;
  tokens: DesignTokens;
  cached: boolean;
  confidence?: Record<string, number>;
  fallbacks_used?: string[];
  review_needed?: string[];
}

// Error response structure from FastAPI
export interface APIErrorResponse {
  detail: string | Record<string, any>;
}

// Rate limit error (Epic 003 Story 3.3)
export class RateLimitError extends Error {
  public readonly retryAfter: number; // seconds until retry is allowed
  public readonly endpoint?: string;
  public readonly tier?: string;

  constructor(message: string, retryAfter: number, endpoint?: string, tier?: string) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    this.endpoint = endpoint;
    this.tier = tier;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
