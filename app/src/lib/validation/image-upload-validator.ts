/**
 * Image upload validation utilities for security and quality checks.
 * Implements Epic 003 Story 3.1 - Input Safety validation requirements.
 */

export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImageValidationConfig {
  maxSizeBytes?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowedTypes?: string[];
  checkSvgSecurity?: boolean;
}

const DEFAULT_CONFIG: Required<ImageValidationConfig> = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  minWidth: 512,
  minHeight: 512,
  maxWidth: 25000, // ~25MP to prevent decompression bombs
  maxHeight: 25000,
  allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
  checkSvgSecurity: true,
};

/**
 * Validates SVG files for embedded scripts and potentially malicious content.
 * Blocks: <script> tags, javascript: protocol, event handlers
 */
export async function validateSvgSecurity(file: File): Promise<ImageValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const content = await file.text();
    const lowerContent = content.toLowerCase();

    // Check for script tags
    if (lowerContent.includes('<script')) {
      errors.push('SVG contains <script> tags and cannot be processed for security reasons.');
    }

    // Check for javascript: protocol
    if (lowerContent.includes('javascript:')) {
      errors.push('SVG contains javascript: protocol and cannot be processed for security reasons.');
    }

    // Check for event handlers (onclick, onload, etc.)
    const eventHandlerPattern = /\s+on\w+\s*=/i;
    if (eventHandlerPattern.test(content)) {
      errors.push('SVG contains event handlers (onclick, onload, etc.) and cannot be processed for security reasons.');
    }

    // Check for data: URIs with script content
    if (lowerContent.includes('data:') && lowerContent.includes('script')) {
      errors.push('SVG contains suspicious data URIs and cannot be processed for security reasons.');
    }

    // Check for external resource loading
    if (/<use\s+[^>]*xlink:href\s*=\s*["']http/i.test(content)) {
      warnings.push('SVG references external resources. These will be blocked during processing.');
    }

  } catch (error) {
    errors.push('Failed to read SVG file content.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates image file type, size, and dimensions.
 */
export async function validateImageUpload(
  file: File,
  config: ImageValidationConfig = {}
): Promise<ImageValidationResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file type
  if (!cfg.allowedTypes.includes(file.type)) {
    errors.push(
      `Invalid file type: ${file.type}. Please upload PNG, JPG, or SVG files only.`
    );
    return { valid: false, errors, warnings };
  }

  // Check file size
  if (file.size > cfg.maxSizeBytes) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const maxMB = (cfg.maxSizeBytes / (1024 * 1024)).toFixed(0);
    errors.push(
      `File size (${sizeMB}MB) exceeds maximum (${maxMB}MB). Please compress your image.`
    );
  }

  // Special handling for SVG files
  if (file.type === 'image/svg+xml') {
    if (cfg.checkSvgSecurity) {
      const svgValidation = await validateSvgSecurity(file);
      errors.push(...svgValidation.errors);
      warnings.push(...svgValidation.warnings);
    }

    // SVG files don't need dimension checks
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Check image dimensions for raster images
  return new Promise<ImageValidationResult>((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Check minimum dimensions
      if (img.width < cfg.minWidth || img.height < cfg.minHeight) {
        errors.push(
          `Image dimensions (${img.width}x${img.height}) are too small. Minimum: ${cfg.minWidth}x${cfg.minHeight}px.`
        );
      }

      // Check maximum dimensions (prevent decompression bombs)
      if (img.width > cfg.maxWidth || img.height > cfg.maxHeight) {
        errors.push(
          `Image dimensions (${img.width}x${img.height}) are too large. Maximum: ${cfg.maxWidth}x${cfg.maxHeight}px.`
        );
      }

      // Warning for sub-optimal resolution
      if (img.width < 1024 && img.width >= cfg.minWidth) {
        warnings.push(
          `Image width is ${img.width}px. For best results, use images at least 1024px wide.`
        );
      }

      // Check aspect ratio (detect full app screenshots)
      const aspectRatio = img.width / img.height;
      if (aspectRatio > 3 || aspectRatio < 0.33) {
        warnings.push(
          'Unusual aspect ratio detected. Make sure your screenshot focuses on design tokens, not a full app layout.'
        );
      }

      resolve({
        valid: errors.length === 0,
        errors,
        warnings,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      errors.push('Failed to load image. The file may be corrupted.');
      resolve({ valid: false, errors, warnings });
    };

    img.src = objectUrl;
  });
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}
