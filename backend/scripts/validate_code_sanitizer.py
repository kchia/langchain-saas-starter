#!/usr/bin/env python3
"""
Validation script for code sanitization module.

This script tests the code sanitizer without requiring pytest or other dependencies.
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Mock dependencies
class MockLogger:
    def info(self, msg, **kwargs): pass
    def warning(self, msg, **kwargs): pass
    def error(self, msg, **kwargs): pass

import types
core = types.ModuleType('core')
logging_module = types.ModuleType('logging')
logging_module.get_logger = lambda name: MockLogger()
core.logging = logging_module
sys.modules['core'] = core
sys.modules['core.logging'] = logging_module

# Import the module directly without going through __init__.py
import importlib.util

spec = importlib.util.spec_from_file_location(
    "code_sanitizer", 
    os.path.join(os.path.dirname(__file__), '..', 'src', 'security', 'code_sanitizer.py')
)
code_sanitizer_module = importlib.util.module_from_spec(spec)
sys.modules['code_sanitizer'] = code_sanitizer_module
spec.loader.exec_module(code_sanitizer_module)

CodeSanitizer = code_sanitizer_module.CodeSanitizer
SecuritySeverity = code_sanitizer_module.SecuritySeverity
SecurityIssueType = code_sanitizer_module.SecurityIssueType


def test_safe_code():
    """Test that safe code passes."""
    sanitizer = CodeSanitizer()
    code = """
import React from 'react';

export const Button = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};
    """
    result = sanitizer.sanitize(code)
    assert result.is_safe, "Safe code should pass"
    assert result.issues_count == 0, "Safe code should have no issues"
    print("✓ Safe code test passed")


def test_eval_detection():
    """Test eval() detection."""
    sanitizer = CodeSanitizer()
    code = "const result = eval(userInput);"
    result = sanitizer.sanitize(code)
    assert not result.is_safe, "Code with eval() should be unsafe"
    assert result.issues_count >= 1, "Should detect eval()"
    assert result.critical_count >= 1, "eval() should be critical"
    print("✓ eval() detection test passed")


def test_xss_detection():
    """Test XSS pattern detection."""
    sanitizer = CodeSanitizer()
    code = "element.innerHTML = userInput;"
    result = sanitizer.sanitize(code)
    assert not result.is_safe, "Code with innerHTML should be unsafe"
    assert result.issues_count >= 1, "Should detect innerHTML"
    assert result.high_count >= 1, "innerHTML should be high severity"
    print("✓ XSS detection test passed")


def test_hardcoded_secret():
    """Test hardcoded secret detection."""
    sanitizer = CodeSanitizer()
    code = 'const apiKey = "sk-1234567890abcdefghij";'
    result = sanitizer.sanitize(code)
    assert not result.is_safe, "Code with hardcoded key should be unsafe"
    assert result.issues_count >= 1, "Should detect hardcoded secret"
    print("✓ Hardcoded secret detection test passed")


def test_proto_pollution():
    """Test __proto__ detection."""
    sanitizer = CodeSanitizer()
    code = "obj.__proto__.polluted = true;"
    result = sanitizer.sanitize(code)
    assert not result.is_safe, "Code with __proto__ should be unsafe"
    assert result.issues_count >= 1, "Should detect __proto__"
    print("✓ Prototype pollution detection test passed")


def test_line_numbers():
    """Test that line numbers are tracked."""
    sanitizer = CodeSanitizer()
    code = """
// Line 1
const safe = 'code';
// Line 3
const unsafe = eval('test');
// Line 5
    """
    result = sanitizer.sanitize(code)
    assert not result.is_safe, "Should detect eval"
    assert len(result.issues) > 0, "Should have issues"
    issue = result.issues[0]
    assert issue.line == 5, f"Expected line 5, got {issue.line}"
    print("✓ Line number tracking test passed")


def test_multiple_issues():
    """Test detection of multiple issues."""
    sanitizer = CodeSanitizer()
    code = """
const x = eval(input);
element.innerHTML = content;
obj.__proto__.hack = true;
    """
    result = sanitizer.sanitize(code)
    assert not result.is_safe, "Should detect multiple issues"
    assert result.issues_count >= 3, f"Should detect at least 3 issues, got {result.issues_count}"
    print("✓ Multiple issues detection test passed")


def test_pattern_info():
    """Test getting pattern information."""
    sanitizer = CodeSanitizer()
    patterns = sanitizer.get_forbidden_patterns_info()
    assert len(patterns) > 0, "Should have patterns"
    assert all('pattern' in p for p in patterns), "All patterns should have 'pattern' key"
    assert all('severity' in p for p in patterns), "All patterns should have 'severity' key"
    print("✓ Pattern info test passed")


def main():
    """Run all tests."""
    print("Running code sanitization validation tests...\n")
    
    tests = [
        test_safe_code,
        test_eval_detection,
        test_xss_detection,
        test_hardcoded_secret,
        test_proto_pollution,
        test_line_numbers,
        test_multiple_issues,
        test_pattern_info,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"✗ {test.__name__} failed: {e}")
            failed += 1
        except Exception as e:
            print(f"✗ {test.__name__} error: {e}")
            failed += 1
    
    print(f"\n{'='*60}")
    print(f"Results: {passed} passed, {failed} failed")
    print(f"{'='*60}")
    
    return 0 if failed == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
