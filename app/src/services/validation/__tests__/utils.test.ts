/**
 * Unit tests for WCAG utility functions
 */

import {
  parseColor,
  getRelativeLuminance,
  getContrastRatio,
  calculateContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  calculateDeltaE,
  rgbToHex,
  suggestAccessibleColors,
} from '../utils';

describe('WCAG Utility Functions', () => {
  describe('parseColor', () => {
    it('should parse hex colors', () => {
      expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor('#000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(parseColor('#3b82f6')).toEqual({ r: 59, g: 130, b: 246 });
    });

    it('should parse rgb colors', () => {
      expect(parseColor('rgb(255, 255, 255)')).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor('rgb(0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0 });
      expect(parseColor('rgb(59, 130, 246)')).toEqual({ r: 59, g: 130, b: 246 });
    });

    it('should parse rgba colors', () => {
      expect(parseColor('rgba(255, 255, 255, 1)')).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse named colors', () => {
      expect(parseColor('white')).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor('black')).toEqual({ r: 0, g: 0, b: 0 });
      expect(parseColor('red')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should return null for invalid colors', () => {
      expect(parseColor('invalid')).toBeNull();
      expect(parseColor('#gg')).toBeNull();
      expect(parseColor('')).toBeNull();
    });
  });

  describe('getRelativeLuminance', () => {
    it('should calculate luminance for white', () => {
      const white = { r: 255, g: 255, b: 255 };
      expect(getRelativeLuminance(white)).toBeCloseTo(1, 2);
    });

    it('should calculate luminance for black', () => {
      const black = { r: 0, g: 0, b: 0 };
      expect(getRelativeLuminance(black)).toBeCloseTo(0, 2);
    });

    it('should calculate luminance for gray', () => {
      const gray = { r: 128, g: 128, b: 128 };
      const luminance = getRelativeLuminance(gray);
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate maximum contrast for black and white', () => {
      const white = { r: 255, g: 255, b: 255 };
      const black = { r: 0, g: 0, b: 0 };
      const ratio = getContrastRatio(white, black);
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate 1:1 contrast for same colors', () => {
      const color = { r: 128, g: 128, b: 128 };
      const ratio = getContrastRatio(color, color);
      expect(ratio).toBeCloseTo(1, 2);
    });

    it('should be order-independent', () => {
      const color1 = { r: 255, g: 255, b: 255 };
      const color2 = { r: 0, g: 0, b: 0 };
      const ratio1 = getContrastRatio(color1, color2);
      const ratio2 = getContrastRatio(color2, color1);
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });
  });

  describe('calculateContrastRatio', () => {
    it('should calculate contrast from color strings', () => {
      const ratio = calculateContrastRatio('#ffffff', '#000000');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should handle rgb colors', () => {
      const ratio = calculateContrastRatio('rgb(255, 255, 255)', 'rgb(0, 0, 0)');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should return null for invalid colors', () => {
      expect(calculateContrastRatio('invalid', '#000')).toBeNull();
      expect(calculateContrastRatio('#fff', 'invalid')).toBeNull();
    });
  });

  describe('meetsWCAGAA', () => {
    it('should validate normal text contrast', () => {
      expect(meetsWCAGAA(4.5, 'normal_text')).toBe(true);
      expect(meetsWCAGAA(4.4, 'normal_text')).toBe(false);
      expect(meetsWCAGAA(7.0, 'normal_text')).toBe(true);
    });

    it('should validate large text contrast', () => {
      expect(meetsWCAGAA(3.0, 'large_text')).toBe(true);
      expect(meetsWCAGAA(2.9, 'large_text')).toBe(false);
      expect(meetsWCAGAA(5.0, 'large_text')).toBe(true);
    });

    it('should validate UI component contrast', () => {
      expect(meetsWCAGAA(3.0, 'ui_component')).toBe(true);
      expect(meetsWCAGAA(2.9, 'ui_component')).toBe(false);
    });
  });

  describe('meetsWCAGAAA', () => {
    it('should validate AAA normal text contrast', () => {
      expect(meetsWCAGAAA(7.0, 'normal_text')).toBe(true);
      expect(meetsWCAGAAA(6.9, 'normal_text')).toBe(false);
      expect(meetsWCAGAAA(4.5, 'normal_text')).toBe(false);
    });

    it('should validate AAA large text contrast', () => {
      expect(meetsWCAGAAA(4.5, 'large_text')).toBe(true);
      expect(meetsWCAGAAA(4.4, 'large_text')).toBe(false);
    });
  });

  describe('calculateDeltaE', () => {
    it('should return 0 for identical colors', () => {
      const color = { r: 128, g: 128, b: 128 };
      const deltaE = calculateDeltaE(color, color);
      expect(deltaE).toBeCloseTo(0, 2);
    });

    it('should return higher values for different colors', () => {
      const color1 = { r: 255, g: 255, b: 255 };
      const color2 = { r: 0, g: 0, b: 0 };
      const deltaE = calculateDeltaE(color1, color2);
      expect(deltaE).toBeGreaterThan(0);
    });

    it('should detect small color differences', () => {
      const color1 = { r: 128, g: 128, b: 128 };
      const color2 = { r: 130, g: 130, b: 130 };
      const deltaE = calculateDeltaE(color1, color2);
      expect(deltaE).toBeGreaterThan(0);
      expect(deltaE).toBeLessThan(5);
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
      expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
      expect(rgbToHex({ r: 59, g: 130, b: 246 })).toBe('#3b82f6');
    });

    it('should handle single digit values', () => {
      expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe('#010203');
    });
  });

  describe('suggestAccessibleColors', () => {
    it('should suggest colors for low contrast', () => {
      const suggestions = suggestAccessibleColors('#999', '#aaa', 4.5);
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should return empty array for invalid colors', () => {
      const suggestions = suggestAccessibleColors('invalid', '#000', 4.5);
      expect(suggestions).toEqual([]);
    });

    it('should suggest colors that meet target ratio', () => {
      const suggestions = suggestAccessibleColors('#999', '#aaa', 4.5);
      suggestions.forEach((suggestion) => {
        expect(suggestion.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });
});
