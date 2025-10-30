"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ConfidenceBadge } from "@/components/ui/badge";
import { TypographyTokens } from "@/types/api.types";
import { cn } from "@/lib/utils";

// Standard font families (web-safe + popular)
const FONT_FAMILIES = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana"
] as const;

// Standard font sizes
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 30, 36, 40, 48, 56, 64] as const;

// Standard font weights
const FONT_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export interface TypographyEditorProps {
  /**
   * Typography tokens
   */
  tokens?: TypographyTokens;

  /**
   * Confidence scores (flattened keys like "typography.fontFamily")
   */
  confidence?: Record<string, number>;

  /**
   * Callback when typography tokens change
   */
  onChange?: (tokens: TypographyTokens) => void;

  /**
   * Optional className
   */
  className?: string;
}

/**
 * TypographyEditor - Component for editing typography tokens
 *
 * @example
 * ```tsx
 * <TypographyEditor
 *   tokens={{ fontFamily: "Inter", fontSize: "16px", fontWeight: 500 }}
 *   confidence={{ "typography.fontFamily": 0.75 }}
 *   onChange={(tokens) => console.log(tokens)}
 * />
 * ```
 */
export function TypographyEditor({
  tokens = {},
  confidence = {},
  onChange,
  className
}: TypographyEditorProps) {
  const [localTokens, setLocalTokens] = React.useState<TypographyTokens>(tokens);
  const [customFontFamily, setCustomFontFamily] = React.useState("");
  const [showCustomFont, setShowCustomFont] = React.useState(
    tokens.fontFamily ? !FONT_FAMILIES.includes(tokens.fontFamily as any) : false
  );

  // Sync with external token changes
  React.useEffect(() => {
    setLocalTokens(tokens);
  }, [tokens]);

  const handleChange = (field: keyof TypographyTokens, value: string | number) => {
    const newTokens = { ...localTokens, [field]: value };
    setLocalTokens(newTokens);
    if (onChange) {
      onChange(newTokens);
    }
  };

  return (
    <div className={cn("space-y-4", className)} data-testid="typography-editor">
      {/* Font Family */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="font-family" className="text-sm font-medium">
            Font Family
          </Label>
          <ConfidenceBadge score={confidence["typography.fontFamily"] || 0} />
        </div>

        {showCustomFont ? (
          <div className="space-y-2">
            <Input
              id="font-family"
              type="text"
              value={customFontFamily || localTokens.fontFamily || ""}
              onChange={(e) => {
                setCustomFontFamily(e.target.value);
                handleChange("fontFamily", e.target.value);
              }}
              placeholder="Enter custom font family"
            />
            <button
              type="button"
              onClick={() => setShowCustomFont(false)}
              className="text-sm text-blue-600 hover:text-blue-700"
              aria-label="Switch to font family presets"
            >
              Choose from presets
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Select
              value={localTokens.fontFamily || "Inter"}
              onValueChange={(value) => {
                if (value === "custom") {
                  setShowCustomFont(true);
                } else {
                  handleChange("fontFamily", value);
                }
              }}
            >
              <SelectTrigger id="font-family">
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Font Size Base */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="font-size-base" className="text-sm font-medium">
            Font Size (Base)
          </Label>
          <ConfidenceBadge score={confidence["typography.fontSizeBase"] || 0} />
        </div>

        <Select
          value={localTokens.fontSizeBase?.replace("px", "") || "16"}
          onValueChange={(value) => {
            handleChange("fontSizeBase", `${value}px`);
          }}
        >
          <SelectTrigger id="font-size-base">
            <SelectValue placeholder="Select font size" />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Weight Normal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="font-weight-normal" className="text-sm font-medium">
            Font Weight (Normal)
          </Label>
          <ConfidenceBadge score={confidence["typography.fontWeightNormal"] || 0} />
        </div>

        <Select
          value={localTokens.fontWeightNormal?.toString() || "400"}
          onValueChange={(value) => {
            handleChange("fontWeightNormal", parseInt(value));
          }}
        >
          <SelectTrigger id="font-weight-normal">
            <SelectValue placeholder="Select font weight" />
          </SelectTrigger>
          <SelectContent>
            {FONT_WEIGHTS.map((weight) => (
              <SelectItem key={weight} value={weight.toString()}>
                {weight} -{" "}
                {weight === 100
                  ? "Thin"
                  : weight === 200
                  ? "Extra Light"
                  : weight === 300
                  ? "Light"
                  : weight === 400
                  ? "Regular"
                  : weight === 500
                  ? "Medium"
                  : weight === 600
                  ? "Semi Bold"
                  : weight === 700
                  ? "Bold"
                  : weight === 800
                  ? "Extra Bold"
                  : "Black"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
