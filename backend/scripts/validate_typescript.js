#!/usr/bin/env node
/**
 * TypeScript Validation Script
 * 
 * Validates TypeScript code using ts.createProgram API.
 * Accepts code via stdin and returns JSON with errors/warnings.
 * 
 * Usage:
 *   echo "const x: string = 123;" | node validate_typescript.js
 * 
 * Exit codes:
 *   0 - Valid TypeScript code
 *   1 - Validation errors found
 *   2 - Fatal error (malformed code, timeout, etc.)
 */

const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Timeout configuration (10 seconds)
const TIMEOUT_MS = 10000;

// TypeScript compiler options (strict mode)
const compilerOptions = {
  target: ts.ScriptTarget.ES2017,
  module: ts.ModuleKind.ESNext,
  lib: ['lib.dom.d.ts', 'lib.dom.iterable.d.ts', 'lib.esnext.d.ts'],
  jsx: ts.JsxEmit.Preserve,
  strict: true,
  esModuleInterop: true,
  skipLibCheck: true,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  resolveJsonModule: true,
  isolatedModules: true,
  noEmit: true,
  allowJs: true,
  types: ['react', 'node'],
  typeRoots: [path.join(__dirname, 'node_modules/@types')],
};

/**
 * Main validation function
 */
async function validateTypeScript(code) {
  // Create temporary directory for validation
  const tmpDir = path.join(os.tmpdir(), `.component-forge-ts-${Date.now()}`);
  const tmpFile = path.join(tmpDir, 'component.tsx');
  
  try {
    // Create temp directory
    fs.mkdirSync(tmpDir, { recursive: true });
    
    // Write code to temp file
    fs.writeFileSync(tmpFile, code, 'utf8');
    
    // Create TypeScript program
    const program = ts.createProgram([tmpFile], compilerOptions);
    
    // Get diagnostics
    const allDiagnostics = ts.getPreEmitDiagnostics(program);
    
    // Format diagnostics
    const errors = [];
    const warnings = [];
    
    allDiagnostics.forEach((diagnostic) => {
      if (diagnostic.file && diagnostic.start !== undefined) {
        const { line, character } = ts.getLineAndCharacterOfPosition(
          diagnostic.file,
          diagnostic.start
        );
        
        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          '\n'
        );
        
        const diagnosticInfo = {
          line: line + 1, // 1-indexed
          column: character + 1, // 1-indexed
          message: message,
          code: diagnostic.code,
          category: ts.DiagnosticCategory[diagnostic.category],
        };
        
        if (diagnostic.category === ts.DiagnosticCategory.Error) {
          errors.push(diagnosticInfo);
        } else if (diagnostic.category === ts.DiagnosticCategory.Warning) {
          warnings.push(diagnosticInfo);
        }
      } else {
        // Global diagnostic (no specific location)
        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          '\n'
        );
        
        const diagnosticInfo = {
          line: 0,
          column: 0,
          message: message,
          code: diagnostic.code,
          category: ts.DiagnosticCategory[diagnostic.category],
        };
        
        if (diagnostic.category === ts.DiagnosticCategory.Error) {
          errors.push(diagnosticInfo);
        } else if (diagnostic.category === ts.DiagnosticCategory.Warning) {
          warnings.push(diagnosticInfo);
        }
      }
    });
    
    const result = {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      errorCount: errors.length,
      warningCount: warnings.length,
    };
    
    return result;
  } catch (error) {
    throw new Error(`TypeScript validation failed: ${error.message}`);
  } finally {
    // Cleanup temp files
    try {
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
      if (fs.existsSync(tmpDir)) {
        fs.rmdirSync(tmpDir);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
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
        errors: [{ line: 0, column: 0, message: 'No code provided', code: 0, category: 'Error' }],
        warnings: [],
        errorCount: 1,
        warningCount: 0,
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }
    
    // Validate TypeScript
    const result = await validateTypeScript(code);
    
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
          code: 0,
          category: 'Error',
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
