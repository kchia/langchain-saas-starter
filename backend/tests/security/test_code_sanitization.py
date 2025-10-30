"""Tests for code sanitization security module."""

import pytest

from src.security.code_sanitizer import (
    CodeSanitizer,
    SecuritySeverity,
    SecurityIssueType,
    CodeSanitizationResult,
)


class TestCodeSanitizer:
    """Tests for CodeSanitizer class."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.sanitizer = CodeSanitizer()
    
    def test_safe_code_passes(self):
        """Test that safe code passes sanitization."""
        safe_code = """
import React from 'react';

export const Button = ({ children, onClick }) => {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  );
};
        """
        
        result = self.sanitizer.sanitize(safe_code)
        
        assert result.is_safe is True
        assert result.issues_count == 0
        assert len(result.issues) == 0
        assert result.critical_count == 0
        assert result.high_count == 0
        assert result.medium_count == 0
        assert result.low_count == 0
    
    def test_detect_eval(self):
        """Test detection of eval() usage."""
        code_with_eval = """
const result = eval(userInput);
        """
        
        result = self.sanitizer.sanitize(code_with_eval)
        
        assert result.is_safe is False
        assert result.issues_count == 1
        assert result.critical_count == 1
        
        issue = result.issues[0]
        assert issue.type == SecurityIssueType.CODE_INJECTION
        assert issue.severity == SecuritySeverity.CRITICAL
        assert issue.line == 2
        assert "eval()" in issue.message
    
    def test_detect_function_constructor(self):
        """Test detection of Function constructor."""
        code_with_function = """
const fn = new Function('x', 'return x * 2');
        """
        
        result = self.sanitizer.sanitize(code_with_function)
        
        assert result.is_safe is False
        assert result.issues_count == 1
        assert result.critical_count == 1
        
        issue = result.issues[0]
        assert issue.type == SecurityIssueType.CODE_INJECTION
        assert issue.severity == SecuritySeverity.CRITICAL
        assert "Function constructor" in issue.message
    
    def test_detect_dangerously_set_inner_html(self):
        """Test detection of dangerouslySetInnerHTML."""
        code_with_dangerous_html = """
return <div dangerouslySetInnerHTML={{ __html: userContent }} />;
        """
        
        result = self.sanitizer.sanitize(code_with_dangerous_html)
        
        assert result.is_safe is False
        assert result.issues_count == 1
        assert result.high_count == 1
        
        issue = result.issues[0]
        assert issue.type == SecurityIssueType.XSS_RISK
        assert issue.severity == SecuritySeverity.HIGH
        assert "dangerouslySetInnerHTML" in issue.message
    
    def test_detect_inner_html_assignment(self):
        """Test detection of innerHTML assignment."""
        code_with_innerhtml = """
element.innerHTML = '<div>' + userInput + '</div>';
        """
        
        result = self.sanitizer.sanitize(code_with_innerhtml)
        
        assert result.is_safe is False
        assert result.issues_count == 1
        assert result.high_count == 1
        
        issue = result.issues[0]
        assert issue.type == SecurityIssueType.UNSAFE_HTML
        assert issue.severity == SecuritySeverity.HIGH
        assert "innerHTML" in issue.message
    
    def test_detect_document_write(self):
        """Test detection of document.write()."""
        code_with_doc_write = """
document.write('<script>alert("xss")</script>');
        """
        
        result = self.sanitizer.sanitize(code_with_doc_write)
        
        assert result.is_safe is False
        assert result.issues_count == 1
        assert result.high_count == 1
        
        issue = result.issues[0]
        assert issue.type == SecurityIssueType.XSS_RISK
        assert issue.severity == SecuritySeverity.HIGH
        assert "document.write" in issue.message
    
    def test_detect_proto_pollution(self):
        """Test detection of __proto__ usage."""
        code_with_proto = """
const obj = {};
obj.__proto__.polluted = true;
        """
        
        result = self.sanitizer.sanitize(code_with_proto)
        
        assert result.is_safe is False
        assert result.issues_count == 1
        assert result.high_count == 1
        
        issue = result.issues[0]
        assert issue.type == SecurityIssueType.PROTOTYPE_POLLUTION
        assert issue.severity == SecuritySeverity.HIGH
        assert "__proto__" in issue.message
    
    def test_detect_hardcoded_api_key(self):
        """Test detection of hardcoded API keys."""
        code_with_api_key = """
const apiKey = "sk-1234567890abcdefghij";
const openaiKey = "sk-proj-abcdefghijklmnopqrstuvwxyz1234567890";
        """
        
        result = self.sanitizer.sanitize(code_with_api_key)
        
        assert result.is_safe is False
        assert result.issues_count >= 1  # Should detect at least the OpenAI key pattern
        assert result.critical_count >= 1
        
        # Check that at least one issue is about hardcoded secrets
        secret_issues = [
            issue for issue in result.issues 
            if issue.type == SecurityIssueType.HARDCODED_SECRET
        ]
        assert len(secret_issues) >= 1
    
    def test_detect_hardcoded_password(self):
        """Test detection of hardcoded passwords."""
        code_with_password = """
const password = "mySecretPassword123456789012";
const dbPassword = 'super_secure_password_456789012345';
        """
        
        result = self.sanitizer.sanitize(code_with_password)
        
        assert result.is_safe is False
        assert result.critical_count >= 1
        
        secret_issues = [
            issue for issue in result.issues 
            if issue.type == SecurityIssueType.HARDCODED_SECRET
        ]
        assert len(secret_issues) >= 1
        assert any("password" in issue.message.lower() for issue in secret_issues)
    
    def test_detect_hardcoded_secret(self):
        """Test detection of hardcoded secrets."""
        code_with_secret = """
const secret = "my-secret-token-12345678901234567890";
const authToken = 'bearer-token-abcdefghijklmnopqrstuvwxyz1234567890';
        """
        
        result = self.sanitizer.sanitize(code_with_secret)
        
        assert result.is_safe is False
        assert result.critical_count >= 1
        
        secret_issues = [
            issue for issue in result.issues 
            if issue.type == SecurityIssueType.HARDCODED_SECRET
        ]
        assert len(secret_issues) >= 1
    
    def test_detect_sql_injection_template_literal(self):
        """Test detection of SQL injection via template literals."""
        code_with_sql = """
const userId = req.params.id;
const query = `SELECT * FROM users WHERE id = ${userId}`;
        """
        
        result = self.sanitizer.sanitize(code_with_sql)
        
        assert result.is_safe is False
        assert result.critical_count >= 1
        
        sql_issues = [
            issue for issue in result.issues 
            if issue.type == SecurityIssueType.SQL_INJECTION
        ]
        assert len(sql_issues) >= 1
        assert "template literal" in sql_issues[0].message.lower()
    
    def test_detect_sql_injection_concatenation(self):
        """Test detection of SQL injection via string concatenation."""
        code_with_sql = """
const name = getUserInput();
db.query("SELECT * FROM users WHERE name = '" + name + "'");
        """
        
        result = self.sanitizer.sanitize(code_with_sql)
        
        assert result.is_safe is False
        assert result.high_count >= 1
        
        sql_issues = [
            issue for issue in result.issues 
            if issue.type == SecurityIssueType.SQL_INJECTION
        ]
        assert len(sql_issues) >= 1
        assert "concatenation" in sql_issues[0].message.lower()
    
    def test_detect_process_env_exposure(self):
        """Test detection of process.env usage in client-side code."""
        code_with_env = """
'use client';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        """
        
        result = self.sanitizer.sanitize(code_with_env)
        
        assert result.is_safe is False
        assert result.issues_count >= 1
        assert result.medium_count >= 1
        
        env_issues = [
            issue for issue in result.issues 
            if issue.type == SecurityIssueType.ENV_VAR_EXPOSURE
        ]
        assert len(env_issues) >= 1
    
    def test_server_side_process_env_allowed(self):
        """Test that process.env in server-side code (without 'use client') is allowed."""
        code_with_server_env = """
// Server component - no 'use client' directive
const apiUrl = process.env.API_URL;
        """
        
        result = self.sanitizer.sanitize(code_with_server_env)
        
        # Should pass since no 'use client' directive
        assert result.is_safe is True
        assert result.issues_count == 0
    
    def test_detect_outer_html_assignment(self):
        """Test detection of outerHTML assignment."""
        code_with_outerhtml = """
element.outerHTML = '<div>replaced</div>';
        """
        
        result = self.sanitizer.sanitize(code_with_outerhtml)
        
        assert result.is_safe is False
        assert result.issues_count == 1
        assert result.medium_count == 1
        
        issue = result.issues[0]
        assert issue.type == SecurityIssueType.UNSAFE_HTML
        assert issue.severity == SecuritySeverity.MEDIUM
        assert "outerHTML" in issue.message
    
    def test_multiple_issues_detected(self):
        """Test detection of multiple security issues in same code."""
        code_with_multiple_issues = """
const result = eval(userInput);
element.innerHTML = userContent;
const apiKey = "sk-1234567890abcdefghij";
obj.__proto__.polluted = true;
        """
        
        result = self.sanitizer.sanitize(code_with_multiple_issues)
        
        assert result.is_safe is False
        assert result.issues_count >= 4  # At least 4 issues
        assert result.critical_count >= 2  # eval and api key
        assert result.high_count >= 2  # innerHTML and __proto__
    
    def test_line_number_tracking(self):
        """Test that line numbers are correctly tracked."""
        code = """
// Line 1
const safe = 'code';
// Line 3
const unsafe = eval('malicious');
// Line 5
        """
        
        result = self.sanitizer.sanitize(code)
        
        assert result.is_safe is False
        assert result.issues_count == 1
        
        issue = result.issues[0]
        assert issue.line == 5  # eval is on line 5
    
    def test_case_insensitive_detection(self):
        """Test that patterns are detected case-insensitively (where appropriate)."""
        code_with_mixed_case = """
element.InnerHTML = content;
Element.INNERHTML = content;
        """
        
        result = self.sanitizer.sanitize(code_with_mixed_case)
        
        assert result.is_safe is False
        assert result.issues_count >= 1  # Should detect at least one
    
    def test_include_code_snippets(self):
        """Test that code snippets are included when requested."""
        code = """
const safe = 'code';
const unsafe = eval('test');
const more = 'safe';
        """
        
        result = self.sanitizer.sanitize(code, include_snippets=True)
        
        assert result.is_safe is False
        assert result.issues_count == 1
        
        issue = result.issues[0]
        assert issue.code_snippet is not None
        assert "eval" in issue.code_snippet
        assert ">>>" in issue.code_snippet  # Line marker
    
    def test_no_code_snippets_by_default(self):
        """Test that code snippets are not included by default."""
        code = """
const unsafe = eval('test');
        """
        
        result = self.sanitizer.sanitize(code, include_snippets=False)
        
        assert result.is_safe is False
        assert result.issues_count == 1
        
        issue = result.issues[0]
        assert issue.code_snippet is None
    
    def test_get_forbidden_patterns_info(self):
        """Test getting information about forbidden patterns."""
        patterns_info = self.sanitizer.get_forbidden_patterns_info()
        
        assert len(patterns_info) > 0
        
        # Check structure of pattern info
        for pattern_info in patterns_info:
            assert "pattern" in pattern_info
            assert "type" in pattern_info
            assert "severity" in pattern_info
            assert "message" in pattern_info
            
            # Verify valid enum values
            assert pattern_info["severity"] in [s.value for s in SecuritySeverity]
            assert pattern_info["type"] in [t.value for t in SecurityIssueType]
    
    def test_empty_code(self):
        """Test sanitization of empty code."""
        result = self.sanitizer.sanitize("")
        
        assert result.is_safe is True
        assert result.issues_count == 0
    
    def test_whitespace_only_code(self):
        """Test sanitization of whitespace-only code."""
        result = self.sanitizer.sanitize("   \n\n   \t\t   ")
        
        assert result.is_safe is True
        assert result.issues_count == 0
    
    def test_comments_with_patterns(self):
        """Test that patterns in comments are still detected (intentional)."""
        code_with_commented_issue = """
// This is a comment with eval() in it
const safe = 'code';
        """
        
        result = self.sanitizer.sanitize(code_with_commented_issue)
        
        # Note: Current implementation will detect patterns in comments too
        # This is intentional as generated code shouldn't have suspicious
        # patterns even in comments
        assert result.is_safe is False
        assert result.issues_count == 1
    
    def test_realistic_safe_component(self):
        """Test sanitization of a realistic safe React component."""
        safe_component = """
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface UserProfileProps {
  name: string;
  email: string;
  onUpdate: (data: { name: string; email: string }) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ name, email, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name, email });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <Card>
      <h2>{formData.name}</h2>
      <p>{formData.email}</p>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Button type="submit">Save</Button>
        </form>
      ) : (
        <Button onClick={() => setIsEditing(true)}>Edit</Button>
      )}
    </Card>
  );
};
        """
        
        result = self.sanitizer.sanitize(safe_component)
        
        assert result.is_safe is True
        assert result.issues_count == 0
    
    def test_realistic_unsafe_component(self):
        """Test sanitization of a component with multiple security issues."""
        unsafe_component = """
import React from 'react';

const API_KEY = "sk-1234567890abcdefghij";  // Hardcoded secret

export const UnsafeComponent = ({ userInput }) => {
  // XSS vulnerability
  const handleClick = () => {
    eval(userInput);  // Code injection
  };

  // Prototype pollution
  const obj = {};
  obj.__proto__.isAdmin = true;

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: userInput }}  // XSS risk
      onClick={handleClick}
    >
      <script>alert('xss')</script>
    </div>
  );
};
        """
        
        result = self.sanitizer.sanitize(unsafe_component)
        
        assert result.is_safe is False
        assert result.issues_count >= 4  # api key, eval, __proto__, dangerouslySetInnerHTML
        assert result.critical_count >= 2  # api key and eval
        assert result.high_count >= 2  # __proto__ and dangerouslySetInnerHTML


class TestSecurityIssueModel:
    """Tests for SecurityIssue model."""
    
    def test_security_issue_creation(self):
        """Test creating a SecurityIssue."""
        from src.security.code_sanitizer import SecurityIssue
        
        issue = SecurityIssue(
            type=SecurityIssueType.CODE_INJECTION,
            severity=SecuritySeverity.CRITICAL,
            pattern=r'\beval\s*\(',
            line=10,
            column=5,
            message="Test message"
        )
        
        assert issue.type == SecurityIssueType.CODE_INJECTION
        assert issue.severity == SecuritySeverity.CRITICAL
        assert issue.line == 10
        assert issue.column == 5
        assert issue.message == "Test message"
        assert issue.code_snippet is None
    
    def test_security_issue_with_snippet(self):
        """Test SecurityIssue with code snippet."""
        from src.security.code_sanitizer import SecurityIssue
        
        issue = SecurityIssue(
            type=SecurityIssueType.XSS_RISK,
            severity=SecuritySeverity.HIGH,
            pattern=r'innerHTML',
            line=5,
            message="XSS risk",
            code_snippet=">>> 5 | element.innerHTML = content;"
        )
        
        assert issue.code_snippet is not None
        assert "innerHTML" in issue.code_snippet


class TestCodeSanitizationResult:
    """Tests for CodeSanitizationResult model."""
    
    def test_result_creation(self):
        """Test creating a CodeSanitizationResult."""
        from src.security.code_sanitizer import SecurityIssue
        
        issues = [
            SecurityIssue(
                type=SecurityIssueType.CODE_INJECTION,
                severity=SecuritySeverity.CRITICAL,
                pattern="eval",
                line=1,
                message="Critical issue"
            ),
            SecurityIssue(
                type=SecurityIssueType.XSS_RISK,
                severity=SecuritySeverity.HIGH,
                pattern="innerHTML",
                line=2,
                message="High issue"
            ),
        ]
        
        result = CodeSanitizationResult(
            is_safe=False,
            issues=issues,
            issues_count=2,
            critical_count=1,
            high_count=1,
            medium_count=0,
            low_count=0
        )
        
        assert result.is_safe is False
        assert result.issues_count == 2
        assert result.critical_count == 1
        assert result.high_count == 1
        assert len(result.issues) == 2
