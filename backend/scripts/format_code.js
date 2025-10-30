#!/usr/bin/env node

/**
 * Prettier Code Formatter Script
 * 
 * Reads TypeScript code from stdin and formats it with Prettier,
 * writing the result to stdout.
 * 
 * Usage:
 *   echo "const x=1" | node format_code.js
 */

const fs = require('fs');
const path = require('path');

// Try to load prettier - handle both local and global installs
let prettier;
try {
  // Try loading from app/node_modules first (where it's likely installed)
  const appDir = path.join(__dirname, '../../app');
  prettier = require(path.join(appDir, 'node_modules', 'prettier'));
} catch (e) {
  try {
    // Fallback to global prettier
    prettier = require('prettier');
  } catch (e2) {
    console.error('Error: Prettier not found. Please install prettier in app/ directory.');
    console.error('Run: cd app && npm install');
    process.exit(1);
  }
}

// Read code from stdin
let inputCode = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputCode += chunk;
});

process.stdin.on('end', async () => {
  try {
    // Format code with Prettier
    const formatted = await prettier.format(inputCode, {
      parser: 'typescript',
      semi: true,
      singleQuote: false,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 80,
      arrowParens: 'always',
    });
    
    // Write formatted code to stdout
    process.stdout.write(formatted);
    process.exit(0);
  } catch (error) {
    // Write error to stderr
    process.stderr.write(`Prettier formatting error: ${error.message}\n`);
    process.exit(1);
  }
});

// Handle errors
process.stdin.on('error', (error) => {
  process.stderr.write(`Input error: ${error.message}\n`);
  process.exit(1);
});
