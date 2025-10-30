"""Code sanitization for generated components.

This module scans generated code for security vulnerabilities including:
- Arbitrary code execution patterns (eval, Function constructor)
- XSS vulnerabilities (dangerouslySetInnerHTML, innerHTML)
- Prototype pollution (__proto__)
- Hardcoded secrets and API keys
- Suspicious environment variable access
"""

import re
from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel

from ..core.logging import get_logger

logger = get_logger(__name__)


class SecuritySeverity(str, Enum):
    """Severity levels for security issues."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class SecurityIssueType(str, Enum):
    """Types of security issues."""
    CODE_INJECTION = "code_injection"
    XSS_RISK = "xss_risk"
    PROTOTYPE_POLLUTION = "prototype_pollution"
    HARDCODED_SECRET = "hardcoded_secret"
    ENV_VAR_EXPOSURE = "env_var_exposure"
    UNSAFE_HTML = "unsafe_html"
    SQL_INJECTION = "sql_injection"


class SecurityIssue(BaseModel):
    """Model for a security issue found in code."""
    type: SecurityIssueType
    severity: SecuritySeverity
    pattern: str
    line: int
    column: int = 0
    message: str
    code_snippet: Optional[str] = None


class CodeSanitizationResult(BaseModel):
    """Result of code sanitization."""
    is_safe: bool
    issues: List[SecurityIssue]
    issues_count: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    sanitized_code: Optional[str] = None


class ForbiddenPattern(BaseModel):
    """A forbidden code pattern with its security implications."""
    regex: str
    type: SecurityIssueType
    severity: SecuritySeverity
    message: str
    flags: int = re.IGNORECASE


class CodeSanitizer:
    """Sanitizer for generated code to detect security vulnerabilities."""
    
    # Forbidden patterns with detailed security context
    FORBIDDEN_PATTERNS = [
        # Critical: Arbitrary code execution
        ForbiddenPattern(
            regex=r'\beval\s*\(',
            type=SecurityIssueType.CODE_INJECTION,
            severity=SecuritySeverity.CRITICAL,
            message="Use of eval() allows arbitrary code execution and is a critical security risk"
        ),
        ForbiddenPattern(
            regex=r'\bnew\s+Function\s*\(',
            type=SecurityIssueType.CODE_INJECTION,
            severity=SecuritySeverity.CRITICAL,
            message="Function constructor allows code injection similar to eval()"
        ),
        
        # High: XSS risks
        ForbiddenPattern(
            regex=r'\bdangerouslySetInnerHTML\b',
            type=SecurityIssueType.XSS_RISK,
            severity=SecuritySeverity.HIGH,
            message="dangerouslySetInnerHTML can lead to XSS attacks if used with user input"
        ),
        ForbiddenPattern(
            regex=r'\binnerHTML\s*=',
            type=SecurityIssueType.UNSAFE_HTML,
            severity=SecuritySeverity.HIGH,
            message="Direct innerHTML assignment can lead to XSS vulnerabilities"
        ),
        ForbiddenPattern(
            regex=r'\bdocument\.write\s*\(',
            type=SecurityIssueType.XSS_RISK,
            severity=SecuritySeverity.HIGH,
            message="document.write() is deprecated and can introduce XSS vulnerabilities"
        ),
        
        # High: Prototype pollution
        ForbiddenPattern(
            regex=r'__proto__',
            type=SecurityIssueType.PROTOTYPE_POLLUTION,
            severity=SecuritySeverity.HIGH,
            message="Direct __proto__ access can lead to prototype pollution attacks"
        ),
        ForbiddenPattern(
            regex=r'\.constructor\.prototype',
            type=SecurityIssueType.PROTOTYPE_POLLUTION,
            severity=SecuritySeverity.MEDIUM,
            message="Manipulating constructor.prototype can be dangerous"
        ),
        
        # Critical: Hardcoded secrets (refined patterns to reduce false positives)
        ForbiddenPattern(
            regex=r'(?:password|api[_-]?key|secret|token|auth)\s*[=:]\s*["\'][a-zA-Z0-9_\-]{20,}["\']',
            type=SecurityIssueType.HARDCODED_SECRET,
            severity=SecuritySeverity.CRITICAL,
            message="Hardcoded secrets detected - use environment variables instead"
        ),
        ForbiddenPattern(
            regex=r'(?:sk-[a-zA-Z0-9]{20,})',  # OpenAI-style API keys
            type=SecurityIssueType.HARDCODED_SECRET,
            severity=SecuritySeverity.CRITICAL,
            message="Hardcoded API key detected - never commit secrets to code"
        ),
        
        # Critical: SQL injection patterns
        ForbiddenPattern(
            regex=r'`[^`]*\$\{[^}]+\}[^`]*`\s*(?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)',
            type=SecurityIssueType.SQL_INJECTION,
            severity=SecuritySeverity.CRITICAL,
            message="SQL query with template literal interpolation can lead to SQL injection"
        ),
        ForbiddenPattern(
            regex=r'(?:query|execute|raw)\s*\(\s*["`\'][^"`\']*\+',
            type=SecurityIssueType.SQL_INJECTION,
            severity=SecuritySeverity.HIGH,
            message="SQL query with string concatenation can lead to SQL injection"
        ),
        
        # Medium: Environment variable exposure (only flag client-side usage)
        ForbiddenPattern(
            regex=r"['\"]use client['\"][\s\S]{0,500}process\.env\.",
            type=SecurityIssueType.ENV_VAR_EXPOSURE,
            severity=SecuritySeverity.MEDIUM,
            message="Direct process.env access in client-side code can expose secrets",
            flags=0  # Case-sensitive for this one
        ),
        
        # Medium: Other unsafe patterns
        ForbiddenPattern(
            regex=r'\bouterHTML\s*=',
            type=SecurityIssueType.UNSAFE_HTML,
            severity=SecuritySeverity.MEDIUM,
            message="Direct outerHTML assignment can introduce security issues"
        ),
    ]
    
    def __init__(self):
        """Initialize the code sanitizer."""
        self._compiled_patterns = [
            (pattern, re.compile(pattern.regex, pattern.flags))
            for pattern in self.FORBIDDEN_PATTERNS
        ]
    
    def _find_line_and_column(self, code: str, position: int) -> tuple[int, int]:
        """Find line number and column from character position.
        
        Args:
            code: Source code
            position: Character position in code
            
        Returns:
            Tuple of (line_number, column_number) both 1-indexed
        """
        lines_before = code[:position].split('\n')
        line_number = len(lines_before)
        column_number = len(lines_before[-1]) + 1
        return line_number, column_number
    
    def _get_code_snippet(self, code: str, line: int, context_lines: int = 2) -> str:
        """Extract a code snippet around a specific line.
        
        Args:
            code: Full source code
            line: Line number (1-indexed)
            context_lines: Number of context lines to include before and after
            
        Returns:
            Code snippet with context
        """
        lines = code.split('\n')
        start = max(0, line - context_lines - 1)
        end = min(len(lines), line + context_lines)
        
        snippet_lines = []
        for i in range(start, end):
            marker = ">>> " if i == line - 1 else "    "
            snippet_lines.append(f"{marker}{i + 1:4d} | {lines[i]}")
        
        return '\n'.join(snippet_lines)
    
    def sanitize(
        self,
        code: str,
        include_snippets: bool = False,
        auto_fix: bool = False
    ) -> CodeSanitizationResult:
        """Scan code for security vulnerabilities.
        
        Args:
            code: Generated code to sanitize
            include_snippets: Whether to include code snippets in issues
            auto_fix: Whether to attempt automatic fixes (not implemented yet)
            
        Returns:
            CodeSanitizationResult with detected issues and safety status
        """
        issues: List[SecurityIssue] = []
        
        logger.info("Starting code sanitization scan")
        
        # Scan for each forbidden pattern
        for pattern_def, compiled_regex in self._compiled_patterns:
            matches = compiled_regex.finditer(code)
            
            for match in matches:
                line, column = self._find_line_and_column(code, match.start())
                
                issue = SecurityIssue(
                    type=pattern_def.type,
                    severity=pattern_def.severity,
                    pattern=pattern_def.regex,
                    line=line,
                    column=column,
                    message=pattern_def.message,
                    code_snippet=self._get_code_snippet(code, line) if include_snippets else None
                )
                
                issues.append(issue)
                
                logger.warning(
                    f"Security issue detected: {pattern_def.type.value} at line {line}",
                    extra={
                        "event": "security_violation",
                        "type": pattern_def.type.value,
                        "severity": pattern_def.severity.value,
                        "line": line,
                        "column": column,
                    }
                )
        
        # Count issues by severity
        critical_count = sum(1 for issue in issues if issue.severity == SecuritySeverity.CRITICAL)
        high_count = sum(1 for issue in issues if issue.severity == SecuritySeverity.HIGH)
        medium_count = sum(1 for issue in issues if issue.severity == SecuritySeverity.MEDIUM)
        low_count = sum(1 for issue in issues if issue.severity == SecuritySeverity.LOW)
        
        is_safe = len(issues) == 0
        
        if is_safe:
            logger.info("Code sanitization passed - no security issues detected")
        else:
            logger.warning(
                f"Code sanitization found {len(issues)} issues: "
                f"{critical_count} critical, {high_count} high, "
                f"{medium_count} medium, {low_count} low"
            )
        
        result = CodeSanitizationResult(
            is_safe=is_safe,
            issues=issues,
            issues_count=len(issues),
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
            sanitized_code=None  # TODO: Implement auto-fix if needed
        )
        
        return result
    
    def get_forbidden_patterns_info(self) -> List[Dict[str, Any]]:
        """Get information about all forbidden patterns.
        
        Returns:
            List of pattern information dictionaries
        """
        return [
            {
                "pattern": pattern.regex,
                "type": pattern.type.value,
                "severity": pattern.severity.value,
                "message": pattern.message
            }
            for pattern in self.FORBIDDEN_PATTERNS
        ]
