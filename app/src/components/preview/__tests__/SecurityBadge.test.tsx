import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SecurityBadge } from '../SecurityBadge'
import { CodeSanitizationResults } from '@/types'

describe('SecurityBadge', () => {
  describe('Security Check Not Run', () => {
    it('renders neutral badge when sanitizationResults is undefined', () => {
      render(<SecurityBadge sanitizationResults={undefined} />)
      
      expect(screen.getByText('Security Check Skipped')).toBeInTheDocument()
    })
  })

  describe('Safe Code', () => {
    it('renders success badge when code is safe', () => {
      const safeResults: CodeSanitizationResults = {
        is_safe: true,
        issues: [],
      }
      
      render(<SecurityBadge sanitizationResults={safeResults} />)
      
      expect(screen.getByText('Security Verified')).toBeInTheDocument()
    })
  })

  describe('Code with Security Issues', () => {
    it('renders error badge with single issue count', () => {
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
      
      render(<SecurityBadge sanitizationResults={unsafeResults} />)
      
      expect(screen.getByText('1 Security Issue')).toBeInTheDocument()
    })

    it('renders error badge with multiple issues count', () => {
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
      
      render(<SecurityBadge sanitizationResults={unsafeResults} />)
      
      expect(screen.getByText('2 Security Issues')).toBeInTheDocument()
    })
  })

  describe('Compact Mode', () => {
    it('hides label in compact mode', () => {
      const safeResults: CodeSanitizationResults = {
        is_safe: true,
        issues: [],
      }
      
      render(<SecurityBadge sanitizationResults={safeResults} compact />)
      
      expect(screen.queryByText('Security Verified')).not.toBeInTheDocument()
    })
  })

  describe('Click Handler', () => {
    it('calls onClick when badge is clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      const safeResults: CodeSanitizationResults = {
        is_safe: true,
        issues: [],
      }
      
      render(
        <SecurityBadge
          sanitizationResults={safeResults}
          onClick={handleClick}
        />
      )
      
      const badge = screen.getByText('Security Verified')
      await user.click(badge)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('CSS Classes', () => {
    it('applies custom className', () => {
      const safeResults: CodeSanitizationResults = {
        is_safe: true,
        issues: [],
      }
      
      const { container } = render(
        <SecurityBadge
          sanitizationResults={safeResults}
          className="custom-class"
        />
      )
      
      const badge = container.querySelector('.custom-class')
      expect(badge).toBeInTheDocument()
    })
  })
})
