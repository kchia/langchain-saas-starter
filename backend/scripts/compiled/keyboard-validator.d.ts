/**
 * Epic 5 Task F3: Keyboard Navigation Validator
 * Tests keyboard accessibility including Tab, Enter, Space, Escape, and Arrow keys
 */
import type { ValidationResult } from './types';
/**
 * KeyboardValidator tests component keyboard navigation
 *
 * Tests:
 * - Tab navigation through interactive elements
 * - Correct tab order
 * - Enter/Space activation for buttons
 * - Escape key for dismissible components
 * - Arrow keys for navigation (tabs, select, etc.)
 * - Focus trap detection
 * - Keyboard trap detection
 */
export declare class KeyboardValidator {
    private browser;
    /**
     * Validate component keyboard navigation
     *
     * @param componentCode - React component code to validate
     * @param componentName - Name of the component
     * @param componentType - Type of component (button, input, modal, etc.)
     * @returns ValidationResult with keyboard issues
     */
    validate(componentCode: string, componentName: string, componentType?: 'button' | 'input' | 'modal' | 'dialog' | 'dropdown' | 'tabs' | 'select' | 'link' | 'general'): Promise<ValidationResult>;
    /**
     * Test Tab key navigation
     */
    private testTabNavigation;
    /**
     * Test correct tab order
     */
    private testTabOrder;
    /**
     * Test Enter and Space key activation
     */
    private testActivation;
    /**
     * Test Escape key for dismissible components
     */
    private testEscapeKey;
    /**
     * Test Arrow key navigation for tabs, selects, etc.
     */
    private testArrowKeys;
    /**
     * Create HTML test page with React component
     */
    private createTestPage;
    /**
     * Clean up browser resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=keyboard-validator.d.ts.map