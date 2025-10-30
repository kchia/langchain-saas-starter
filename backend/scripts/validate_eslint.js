#!/usr/bin/env node
/**
 * ESLint Validation Script
 * 
 * Validates code using ESLint programmatically.
 * Accepts code via stdin and returns JSON with errors/warnings.
 * Uses basic ESLint rules suitable for React/TypeScript components.
 * 
 * Usage:
 *   echo "const x = 123" | node validate_eslint.js
 * 
 * Exit codes:
 *   0 - Valid code (no errors)
 *   1 - Validation errors found
 *   2 - Fatal error (timeout, config error, etc.)
 */

const { Linter } = require('eslint');

// Timeout configuration (10 seconds)
const TIMEOUT_MS = 10000;

/**
 * Main validation function
 */
async function validateESLint(code) {
  try {
    // Create Linter instance
    const linter = new Linter();
    
    // Lint configuration for TypeScript/React
    const config = {
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      rules: {
        // Basic rules for code quality (TypeScript-compatible)
        'no-unused-vars': 'off', // TypeScript handles this
        'no-undef': 'off', // TypeScript handles this
        'no-console': 'warn',
        'prefer-const': 'warn',
        'no-var': 'error',
        // Allow TypeScript keywords
        'no-reserved-keys': 'off',
      },
    };
    
    // Lint the code
    const messages = linter.verify(code, config);
    
    // Format results
    const errors = [];
    const warnings = [];
    
    messages.forEach((message) => {
      const diagnosticInfo = {
        line: message.line || 0,
        column: message.column || 0,
        message: message.message,
        ruleId: message.ruleId || 'unknown',
        severity: message.severity, // 1 = warning, 2 = error
      };
      
      if (message.severity === 2) {
        errors.push(diagnosticInfo);
      } else if (message.severity === 1) {
        warnings.push(diagnosticInfo);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      errorCount: errors.length,
      warningCount: warnings.length,
    };
  } catch (error) {
    // Handle ESLint-specific errors
    if (error.message.includes('ENOENT') || error.message.includes('config')) {
      throw new Error(`ESLint configuration error: ${error.message}`);
    }
    throw new Error(`ESLint validation failed: ${error.message}`);
  }
}

/**
 * Read from stdin with timeout
 */
function readStdin(timeoutMs) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let timeoutId;
    
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      process.stdin.removeAllListeners();
    };
    
    // Set timeout
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout reading from stdin'));
    }, timeoutMs);
    
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    process.stdin.on('end', () => {
      cleanup();
      resolve(chunks.join(''));
    });
    
    process.stdin.on('error', (error) => {
      cleanup();
      reject(error);
    });
  });
}

/**
 * Main execution
 */
(async () => {
  try {
    // Read code from stdin
    const code = await readStdin(TIMEOUT_MS);
    
    if (!code || code.trim().length === 0) {
      const result = {
        valid: false,
        errors: [{ line: 0, column: 0, message: 'No code provided', ruleId: 'input', severity: 2 }],
        warnings: [],
        errorCount: 1,
        warningCount: 0,
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }
    
    // Validate with ESLint
    const result = await validateESLint(code);
    
    // Output JSON result
    console.log(JSON.stringify(result, null, 2));
    
    // Exit with appropriate code
    process.exit(result.valid ? 0 : 1);
  } catch (error) {
    // Fatal error
    const result = {
      valid: false,
      errors: [
        {
          line: 0,
          column: 0,
          message: error.message,
          ruleId: 'fatal',
          severity: 2,
        },
      ],
      warnings: [],
      errorCount: 1,
      warningCount: 0,
      fatal: true,
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(2);
  }
})();
