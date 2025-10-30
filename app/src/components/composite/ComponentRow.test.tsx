import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentRow } from './ComponentRow'

describe('ComponentRow', () => {
  const defaultProps = {
    name: 'Button',
    timestamp: 'Today, 2:34 PM',
    tokenAdherence: 94,
    a11yScore: 0,
    latency: 48,
    pattern: 'shadcn/ui Button v2.1.0',
  }

  describe('Component Rendering', () => {
    it('renders component name', () => {
      render(<ComponentRow {...defaultProps} />)
      expect(screen.getByText('Button')).toBeInTheDocument()
    })

    it('renders timestamp', () => {
      render(<ComponentRow {...defaultProps} />)
      expect(screen.getByText('Today, 2:34 PM')).toBeInTheDocument()
    })

    it('renders token adherence', () => {
      render(<ComponentRow {...defaultProps} />)
      expect(screen.getByText('94% tokens')).toBeInTheDocument()
    })

    it('renders a11y score', () => {
      render(<ComponentRow {...defaultProps} />)
      expect(screen.getByText('0 critical a11y')).toBeInTheDocument()
    })

    it('renders latency', () => {
      render(<ComponentRow {...defaultProps} />)
      expect(screen.getByText('48s')).toBeInTheDocument()
    })

    it('renders pattern', () => {
      render(<ComponentRow {...defaultProps} />)
      expect(screen.getByText('Pattern: shadcn/ui Button v2.1.0')).toBeInTheDocument()
    })

    it('renders View button', () => {
      render(<ComponentRow {...defaultProps} />)
      expect(screen.getByRole('button', { name: /view button component details/i })).toBeInTheDocument()
    })
  })

  describe('Badge Variants', () => {
    it('shows success badge for high token adherence (>=90%)', () => {
      render(<ComponentRow {...defaultProps} tokenAdherence={94} />)
      const tokenText = screen.getByText('94% tokens')
      const badge = tokenText.closest('div')
      expect(badge).toHaveClass('bg-green-100')
      expect(badge).toHaveClass('text-green-800')
    })

    it('shows warning badge for medium token adherence (70-89%)', () => {
      render(<ComponentRow {...defaultProps} tokenAdherence={85} />)
      const tokenText = screen.getByText('85% tokens')
      const badge = tokenText.closest('div')
      expect(badge).toHaveClass('bg-yellow-100')
      expect(badge).toHaveClass('text-yellow-800')
    })

    it('shows error badge for low token adherence (<70%)', () => {
      render(<ComponentRow {...defaultProps} tokenAdherence={65} />)
      const tokenText = screen.getByText('65% tokens')
      const badge = tokenText.closest('div')
      expect(badge).toHaveClass('bg-red-100')
      expect(badge).toHaveClass('text-red-800')
    })

    it('shows success badge for no a11y issues', () => {
      render(<ComponentRow {...defaultProps} a11yScore={0} />)
      const a11yText = screen.getByText('0 critical a11y')
      const badge = a11yText.closest('div')
      expect(badge).toHaveClass('bg-green-100')
      expect(badge).toHaveClass('text-green-800')
    })

    it('shows warning badge for minor a11y issues (1-2)', () => {
      render(<ComponentRow {...defaultProps} a11yScore={2} />)
      const a11yText = screen.getByText('2 critical a11y')
      const badge = a11yText.closest('div')
      expect(badge).toHaveClass('bg-yellow-100')
      expect(badge).toHaveClass('text-yellow-800')
    })

    it('shows error badge for major a11y issues (>2)', () => {
      render(<ComponentRow {...defaultProps} a11yScore={5} />)
      const a11yText = screen.getByText('5 critical a11y')
      const badge = a11yText.closest('div')
      expect(badge).toHaveClass('bg-red-100')
      expect(badge).toHaveClass('text-red-800')
    })
  })

  describe('Icons', () => {
    it('shows ✅ icon for high token adherence', () => {
      render(<ComponentRow {...defaultProps} tokenAdherence={94} />)
      const tokenText = screen.getByText('94% tokens')
      const badge = tokenText.closest('div')
      expect(badge?.textContent).toContain('✅')
    })

    it('shows ⚠️ icon for medium token adherence', () => {
      render(<ComponentRow {...defaultProps} tokenAdherence={85} />)
      const tokenText = screen.getByText('85% tokens')
      const badge = tokenText.closest('div')
      expect(badge?.textContent).toContain('⚠️')
    })

    it('shows ❌ icon for low token adherence', () => {
      render(<ComponentRow {...defaultProps} tokenAdherence={65} />)
      const tokenText = screen.getByText('65% tokens')
      const badge = tokenText.closest('div')
      expect(badge?.textContent).toContain('❌')
    })

    it('shows ✅ icon for no a11y issues', () => {
      render(<ComponentRow {...defaultProps} a11yScore={0} />)
      const a11yText = screen.getByText('0 critical a11y')
      const badge = a11yText.closest('div')
      expect(badge?.textContent).toContain('✅')
    })

    it('shows ⚠️ icon for minor a11y issues', () => {
      render(<ComponentRow {...defaultProps} a11yScore={2} />)
      const a11yText = screen.getByText('2 critical a11y')
      const badge = a11yText.closest('div')
      expect(badge?.textContent).toContain('⚠️')
    })

    it('shows ❌ icon for major a11y issues', () => {
      render(<ComponentRow {...defaultProps} a11yScore={5} />)
      const a11yText = screen.getByText('5 critical a11y')
      const badge = a11yText.closest('div')
      expect(badge?.textContent).toContain('❌')
    })
  })

  describe('Interactions', () => {
    it('calls onView when View button is clicked', async () => {
      const handleView = vi.fn()
      const user = userEvent.setup()

      render(<ComponentRow {...defaultProps} onView={handleView} />)
      const viewButton = screen.getByRole('button', { name: /view button component details/i })

      await user.click(viewButton)

      expect(handleView).toHaveBeenCalledTimes(1)
    })

    it('does not throw error when onView is not provided', async () => {
      const user = userEvent.setup()

      render(<ComponentRow {...defaultProps} />)
      const viewButton = screen.getByRole('button', { name: /view button component details/i })

      await expect(user.click(viewButton)).resolves.not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA label on View button', () => {
      render(<ComponentRow {...defaultProps} name="TestComponent" />)
      const viewButton = screen.getByRole('button', { name: 'View TestComponent component details' })
      expect(viewButton).toBeInTheDocument()
    })

    it('has semantic heading for component name', () => {
      render(<ComponentRow {...defaultProps} />)
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Button')
    })

    it('is keyboard accessible', async () => {
      const handleView = vi.fn()
      const user = userEvent.setup()

      render(<ComponentRow {...defaultProps} onView={handleView} />)
      const viewButton = screen.getByRole('button', { name: /view button component details/i })

      // Tab to button and press Enter
      await user.tab()
      expect(viewButton).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(handleView).toHaveBeenCalledTimes(1)
    })
  })

  describe('Styling', () => {
    it('applies hover styles', () => {
      const { container } = render(<ComponentRow {...defaultProps} />)
      const row = container.firstChild as HTMLElement
      expect(row).toHaveClass('hover:bg-gray-50')
      expect(row).toHaveClass('transition-colors')
    })

    it('has border separator', () => {
      const { container } = render(<ComponentRow {...defaultProps} />)
      const row = container.firstChild as HTMLElement
      expect(row).toHaveClass('border-b')
      expect(row).toHaveClass('border-gray-200')
    })

    it('removes border on last item', () => {
      const { container } = render(<ComponentRow {...defaultProps} />)
      const row = container.firstChild as HTMLElement
      expect(row).toHaveClass('last:border-b-0')
    })

    it('applies custom className', () => {
      const { container } = render(<ComponentRow {...defaultProps} className="custom-class" />)
      const row = container.firstChild as HTMLElement
      expect(row).toHaveClass('custom-class')
    })

    it('merges custom className with default styles', () => {
      const { container } = render(<ComponentRow {...defaultProps} className="custom-class" />)
      const row = container.firstChild as HTMLElement
      expect(row).toHaveClass('custom-class')
      expect(row).toHaveClass('px-6')
      expect(row).toHaveClass('py-4')
    })
  })

  describe('Display Name', () => {
    it('has correct display name', () => {
      expect(ComponentRow.displayName).toBe('ComponentRow')
    })
  })

  describe('Edge Cases', () => {
    it('handles 0% token adherence', () => {
      render(<ComponentRow {...defaultProps} tokenAdherence={0} />)
      expect(screen.getByText('0% tokens')).toBeInTheDocument()
    })

    it('handles 100% token adherence', () => {
      render(<ComponentRow {...defaultProps} tokenAdherence={100} />)
      expect(screen.getByText('100% tokens')).toBeInTheDocument()
    })

    it('handles high a11y score', () => {
      render(<ComponentRow {...defaultProps} a11yScore={10} />)
      expect(screen.getByText('10 critical a11y')).toBeInTheDocument()
    })

    it('handles long component names', () => {
      const longName = 'VeryLongComponentNameThatMightWrapToMultipleLines'
      render(<ComponentRow {...defaultProps} name={longName} />)
      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('handles long pattern names', () => {
      const longPattern = 'very-long-pattern-name-with-lots-of-details-v12.34.56'
      render(<ComponentRow {...defaultProps} pattern={longPattern} />)
      expect(screen.getByText(`Pattern: ${longPattern}`)).toBeInTheDocument()
    })
  })

  describe('Forward Ref', () => {
    it('forwards ref correctly', () => {
      const ref = vi.fn()
      render(<ComponentRow {...defaultProps} ref={ref} />)
      expect(ref).toHaveBeenCalled()
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement)
    })
  })
})
