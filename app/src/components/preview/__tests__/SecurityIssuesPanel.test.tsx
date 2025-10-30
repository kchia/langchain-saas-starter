import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SecurityIssuesPanel } from '../SecurityIssuesPanel'
import { CodeSanitizationResults } from '@/types'

describe('SecurityIssuesPanel', () => {
  describe('Safe Code', () => {
    it('renders success state when code is safe', () => {
      const safeResults: CodeSanitizationResults = {
        is_safe: true,
        issues: [],
      }
      
      render(<SecurityIssuesPanel sanitizationResults={safeResults} />)
      
      expect(screen.getByText('Safe')).toBeInTheDocument()
      expect(screen.getByText(/No security vulnerabilities detected/i)).toBeInTheDocument()
    })

    it('displays security analysis title', () => {
      const safeResults: CodeSanitizationResults = {
        is_safe: true,
        issues: [],
      }
      
      render(<SecurityIssuesPanel sanitizationResults={safeResults} />)
      
      expect(screen.getByText('Security Analysis')).toBeInTheDocument()
    })
  })

  describe('Code with Security Issues', () => {
    it('renders error state with issue count', () => {
      const unsafeResults: CodeSanitizationResults = {
        is_safe: false,
        issues: [
          {
            type: 'security_violation',
            pattern: 'eval\\s*\\(',
            line: 10,
            severity: 'high',
          },
        ],
      }
      
      render(<SecurityIssuesPanel sanitizationResults={unsafeResults} />)
      
      expect(screen.getByText('1 Issue Found')).toBeInTheDocument()
    })

    it('renders multiple issues with correct count', () => {
      const unsafeResults: CodeSanitizationResults = {
        is_safe: false,
        issues: [
          {
            type: 'security_violation',
            pattern: 'eval\\s*\\(',
            line: 10,
            severity: 'high',
          },
          {
            type: 'security_violation',
            pattern: 'dangerouslySetInnerHTML',
            line: 25,
            severity: 'high',
          },
          {
            type: 'security_violation',
            pattern: '__proto__',
            line: 42,
            severity: 'medium',
          },
        ],
      }
      
      render(<SecurityIssuesPanel sanitizationResults={unsafeResults} />)
      
      expect(screen.getByText('3 Issues Found')).toBeInTheDocument()
    })

    it('displays warning alert for security violations', () => {
      const unsafeResults: CodeSanitizationResults = {
        is_safe: false,
        issues: [
          {
            type: 'security_violation',
            pattern: 'eval\\s*\\(',
            line: 10,
            severity: 'high',
          },
        ],
      }
      
      render(<SecurityIssuesPanel sanitizationResults={unsafeResults} />)
      
      expect(screen.getByText(/Security violations detected/i)).toBeInTheDocument()
    })

    it('displays each security issue with line number', () => {
      const unsafeResults: CodeSanitizationResults = {
        is_safe: false,
        issues: [
          {
            type: 'security_violation',
            pattern: 'eval\\s*\\(',
            line: 10,
            severity: 'high',
          },
          {
            type: 'security_violation',
            pattern: 'dangerouslySetInnerHTML',
            line: 25,
            severity: 'high',
          },
        ],
      }
      
      render(<SecurityIssuesPanel sanitizationResults={unsafeResults} />)
      
      expect(screen.getByText('Line 10')).toBeInTheDocument()
      expect(screen.getByText('Line 25')).toBeInTheDocument()
    })

    it('displays pattern for each issue', () => {
      const unsafeResults: CodeSanitizationResults = {
        is_safe: false,
        issues: [
          {
            type: 'security_violation',
            pattern: 'eval\\s*\\(',
            line: 10,
            severity: 'high',
          },
        ],
      }
      
      render(<SecurityIssuesPanel sanitizationResults={unsafeResults} />)
      
      expect(screen.getByText('eval\\s*\\(')).toBeInTheDocument()
    })

    it('displays severity badge for each issue', () => {
      const unsafeResults: CodeSanitizationResults = {
        is_safe: false,
        issues: [
          {
            type: 'security_violation',
            pattern: 'eval\\s*\\(',
            line: 10,
            severity: 'high',
          },
          {
            type: 'security_violation',
            pattern: '__proto__',
            line: 20,
            severity: 'medium',
          },
          {
            type: 'security_violation',
            pattern: 'process\\.env\\.',
            line: 30,
            severity: 'low',
          },
        ],
      }
      
      render(<SecurityIssuesPanel sanitizationResults={unsafeResults} />)
      
      expect(screen.getByText('HIGH')).toBeInTheDocument()
      expect(screen.getByText('MEDIUM')).toBeInTheDocument()
      expect(screen.getByText('LOW')).toBeInTheDocument()
    })

    it('displays human-readable explanation for known patterns', () => {
      const unsafeResults: CodeSanitizationResults = {
        is_safe: false,
        issues: [
          {
            type: 'security_violation',
            pattern: 'eval\\s*\\(',
            line: 10,
            severity: 'high',
          },
        ],
      }
      
      render(<SecurityIssuesPanel sanitizationResults={unsafeResults} />)
      
      expect(screen.getByText(/arbitrary code execution/i)).toBeInTheDocument()
    })

    it('displays custom message when provided', () => {
      const unsafeResults: CodeSanitizationResults = {
        is_safe: false,
        issues: [
          {
            type: 'security_violation',
            pattern: 'custom-pattern',
            line: 10,
            severity: 'high',
            message: 'Custom security violation message',
          },
        ],
      }
      
      render(<SecurityIssuesPanel sanitizationResults={unsafeResults} />)
      
      expect(screen.getByText('Custom security violation message')).toBeInTheDocument()
    })

    it('displays recommendations section', () => {
      const unsafeResults: CodeSanitizationResults = {
        is_safe: false,
        issues: [
          {
            type: 'security_violation',
            pattern: 'eval\\s*\\(',
            line: 10,
            severity: 'high',
          },
        ],
      }
      
      render(<SecurityIssuesPanel sanitizationResults={unsafeResults} />)
      
      expect(screen.getByText(/Recommended actions:/i)).toBeInTheDocument()
      expect(screen.getByText(/Review each violation/i)).toBeInTheDocument()
    })
  })

  describe('Sanitized Code Available', () => {
    it('displays alert when sanitized code is available', () => {
      const unsafeResults: CodeSanitizationResults = {
        is_safe: false,
        issues: [
          {
            type: 'security_violation',
            pattern: 'eval\\s*\\(',
            line: 10,
            severity: 'high',
          },
        ],
        sanitized_code: 'const safe = "sanitized code";',
      }
      
      render(<SecurityIssuesPanel sanitizationResults={unsafeResults} />)
      
      expect(screen.getByText(/Sanitized version available/i)).toBeInTheDocument()
    })

    it('does not display sanitized alert when not available', () => {
      const unsafeResults: CodeSanitizationResults = {
        is_safe: false,
        issues: [
          {
            type: 'security_violation',
            pattern: 'eval\\s*\\(',
            line: 10,
            severity: 'high',
          },
        ],
      }
      
      render(<SecurityIssuesPanel sanitizationResults={unsafeResults} />)
      
      expect(screen.queryByText(/Sanitized version available/i)).not.toBeInTheDocument()
    })
  })

  describe('CSS Classes', () => {
    it('applies custom className', () => {
      const safeResults: CodeSanitizationResults = {
        is_safe: true,
        issues: [],
      }
      
      const { container } = render(
        <SecurityIssuesPanel
          sanitizationResults={safeResults}
          className="custom-class"
        />
      )
      
      const panel = container.querySelector('.custom-class')
      expect(panel).toBeInTheDocument()
    })
  })
})
