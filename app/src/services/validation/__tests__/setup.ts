/**
 * Test setup for validation services
 * Shared test utilities and mocks
 */

/**
 * Sample component code for testing validators
 */
export const SAMPLE_BUTTON_CODE = `
import React from 'react';

export const Button = ({ children, variant = 'primary', ...props }) => {
  return (
    <button
      className={\`btn btn-\${variant}\`}
      {...props}
    >
      {children}
    </button>
  );
};
`;

/**
 * Sample component with accessibility issues
 */
export const BUTTON_WITH_A11Y_ISSUES = `
import React from 'react';

export const Button = ({ onClick }) => {
  return (
    <div onClick={onClick} style={{ cursor: 'pointer' }}>
      Click me
    </div>
  );
};
`;

/**
 * Sample component with contrast issues
 */
export const BUTTON_WITH_CONTRAST_ISSUES = `
import React from 'react';

export const Button = ({ children }) => {
  return (
    <button style={{ color: '#999', backgroundColor: '#aaa' }}>
      {children}
    </button>
  );
};
`;

/**
 * Mock Playwright browser for testing
 */
export const createMockBrowser = () => {
  const mockPage = {
    setContent: jest.fn().mockResolvedValue(undefined),
    waitForSelector: jest.fn().mockResolvedValue(undefined),
    addScriptTag: jest.fn().mockResolvedValue(undefined),
    evaluate: jest.fn(),
    keyboard: {
      press: jest.fn().mockResolvedValue(undefined),
    },
    close: jest.fn().mockResolvedValue(undefined),
  };

  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn().mockResolvedValue(undefined),
  };

  return { mockBrowser, mockPage };
};
