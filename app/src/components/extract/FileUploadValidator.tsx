"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import {
  Upload,
  FileImage,
  X,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import {
  validateImageUpload,
  formatFileSize,
  type ImageValidationResult,
  type ImageValidationConfig
} from "@/lib/validation/image-upload-validator";

export interface FileUploadValidatorProps {
  onFileSelected: (file: File) => void;
  onFileRemoved?: () => void;
  validationConfig?: ImageValidationConfig;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

export function FileUploadValidator({
  onFileSelected,
  onFileRemoved,
  validationConfig,
  acceptedFileTypes = "image/png,image/jpeg,image/jpg,image/svg+xml",
  maxFileSizeMB = 10,
  className = "",
  disabled = false
}: FileUploadValidatorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ImageValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Handle file selection with validation
  const handleFileChange = async (file: File | null) => {
    if (!file) {
      resetState();
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    // Validate the file
    const result = await validateImageUpload(file, validationConfig);
    setValidationResult(result);
    setIsValidating(false);

    // If validation fails, don't proceed
    if (!result.valid) {
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    // File is valid, set it up
    setSelectedFile(file);

    // Create preview URL for non-SVG images
    if (file.type !== "image/svg+xml") {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      // For SVG, we can show it but need to be careful
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }

    // Notify parent component
    onFileSelected(file);
  };

  const resetState = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null);
    setImagePreview(null);
    setValidationResult(null);
    onFileRemoved?.();
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  // Handle drag and drop
  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileChange(file);
      }
    },
    [disabled]
  );

  return (
    <div className={className}>
      {/* Upload Zone */}
      {!selectedFile && !isValidating && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Drag and drop your file here, or
              </p>
              <label htmlFor="file-upload">
                <Button variant="outline" disabled={disabled} asChild>
                  <span>Browse Files</span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept={acceptedFileTypes}
                  onChange={handleInputChange}
                  className="hidden"
                  disabled={disabled}
                />
              </label>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Accepted: PNG, JPG, SVG</p>
              <p>Maximum size: {maxFileSizeMB}MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Validating State */}
      {isValidating && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">
                Validating file...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected File Display */}
      {selectedFile && validationResult?.valid && (
        <Card>
          <CardContent className="p-6 space-y-4">
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative rounded-lg overflow-hidden border bg-gray-50">
                <img
                  src={imagePreview}
                  alt="File preview"
                  className="w-full h-auto max-h-[300px] object-contain"
                />
              </div>
            )}

            {/* File Info */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileImage className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetState}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Success Indicator */}
            <Alert variant="success">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm ml-2">File validated successfully</p>
              </div>
            </Alert>

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <Alert variant="warning">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div className="ml-2">
                    <p className="font-medium text-sm">Quality Warnings</p>
                    <ul className="text-xs mt-1 space-y-1">
                      {validationResult.warnings.map((warning, i) => (
                        <li key={i}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {validationResult && !validationResult.valid && (
        <Alert variant="error">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="ml-2">
              <p className="font-medium text-sm">Validation Failed</p>
              <ul className="text-xs mt-1 space-y-1">
                {validationResult.errors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
              <div className="mt-3">
                <label htmlFor="file-upload-retry">
                  <Button variant="outline" size="sm" asChild>
                    <span>Try Another File</span>
                  </Button>
                  <input
                    id="file-upload-retry"
                    type="file"
                    accept={acceptedFileTypes}
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={disabled}
                  />
                </label>
              </div>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
}
