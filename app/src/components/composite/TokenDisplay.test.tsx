import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TokenDisplay } from './TokenDisplay'

describe('TokenDisplay', () => {
  describe('Component Rendering', () => {
    it('renders color token with correct value', () => {
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
        />
      )
      
      expect(screen.getByTestId('token-display')).toBeInTheDocument()
      expect(screen.getByText('#3B82F6')).toBeInTheDocument()
      expect(screen.getByText('COLOR')).toBeInTheDocument()
    })

    it('renders typography token with correct value', () => {
      render(
        <TokenDisplay
          tokenType="typography"
          value="Inter"
          confidence={0.91}
        />
      )
      
      expect(screen.getByText('Inter')).toBeInTheDocument()
      expect(screen.getByText('TYPOGRAPHY')).toBeInTheDocument()
    })

    it('renders spacing token with correct value', () => {
      render(
        <TokenDisplay
          tokenType="spacing"
          value="16px"
          confidence={0.93}
        />
      )
      
      expect(screen.getByText('16px')).toBeInTheDocument()
      expect(screen.getByText('SPACING')).toBeInTheDocument()
    })
  })

  describe('Confidence Badge', () => {
    it('displays high confidence badge for score >= 0.9', () => {
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
        />
      )
      
      expect(screen.getByText('✅')).toBeInTheDocument()
      expect(screen.getByText('0.94')).toBeInTheDocument()
    })

    it('displays medium confidence badge for score 0.7-0.89', () => {
      render(
        <TokenDisplay
          tokenType="color"
          value="#F59E0B"
          confidence={0.76}
        />
      )
      
      expect(screen.getByText('⚠️')).toBeInTheDocument()
      expect(screen.getByText('0.76')).toBeInTheDocument()
    })

    it('displays low confidence badge for score < 0.7', () => {
      render(
        <TokenDisplay
          tokenType="color"
          value="#EF4444"
          confidence={0.62}
        />
      )
      
      expect(screen.getByText('❌')).toBeInTheDocument()
      expect(screen.getByText('0.62')).toBeInTheDocument()
    })
  })

  describe('Edit Button', () => {
    it('shows edit button when editable is true', () => {
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
          editable
        />
      )
      
      expect(screen.getByRole('button', { name: /edit token/i })).toBeInTheDocument()
    })

    it('hides edit button when editable is false', () => {
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
          editable={false}
        />
      )
      
      expect(screen.queryByRole('button', { name: /edit token/i })).not.toBeInTheDocument()
    })

    it('calls onEdit callback when edit button is clicked', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
          editable
          onEdit={onEdit}
        />
      )
      
      const editButton = screen.getByRole('button', { name: /edit token/i })
      await user.click(editButton)
      
      expect(onEdit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Code Display', () => {
    it('initially hides code block', () => {
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
        />
      )
      
      expect(screen.getByRole('button', { name: /show code/i })).toBeInTheDocument()
      expect(screen.queryByText(/CSS Variable/)).not.toBeInTheDocument()
    })

    it('shows code block when "Show Code" button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
          name="primary"
        />
      )
      
      const showCodeButton = screen.getByRole('button', { name: /show code/i })
      await user.click(showCodeButton)
      
      expect(screen.getByRole('button', { name: /hide code/i })).toBeInTheDocument()
      expect(screen.getByText(/CSS Variable/)).toBeInTheDocument()
    })

    it('hides code block when "Hide Code" button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
        />
      )
      
      const showCodeButton = screen.getByRole('button', { name: /show code/i })
      await user.click(showCodeButton)
      
      const hideCodeButton = screen.getByRole('button', { name: /hide code/i })
      await user.click(hideCodeButton)
      
      expect(screen.getByRole('button', { name: /show code/i })).toBeInTheDocument()
      expect(screen.queryByText(/CSS Variable/)).not.toBeInTheDocument()
    })

    it('generates correct CSS code for color tokens', async () => {
      const user = userEvent.setup()
      
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
          name="primary"
        />
      )
      
      const showCodeButton = screen.getByRole('button', { name: /show code/i })
      await user.click(showCodeButton)
      
      expect(screen.getByText(/--primary: #3B82F6/)).toBeInTheDocument()
      expect(screen.getByText(/colors:/)).toBeInTheDocument()
    })

    it('generates correct CSS code for typography tokens', async () => {
      const user = userEvent.setup()
      
      render(
        <TokenDisplay
          tokenType="typography"
          value="Inter"
          confidence={0.91}
          name="sans"
        />
      )
      
      const showCodeButton = screen.getByRole('button', { name: /show code/i })
      await user.click(showCodeButton)
      
      expect(screen.getByText(/--font-sans: Inter/)).toBeInTheDocument()
      expect(screen.getByText(/fontFamily:/)).toBeInTheDocument()
    })

    it('generates correct CSS code for spacing tokens', async () => {
      const user = userEvent.setup()
      
      render(
        <TokenDisplay
          tokenType="spacing"
          value="16px"
          confidence={0.93}
          name="md"
        />
      )
      
      const showCodeButton = screen.getByRole('button', { name: /show code/i })
      await user.click(showCodeButton)
      
      expect(screen.getByText(/--spacing-md: 16px/)).toBeInTheDocument()
      expect(screen.getByText(/spacing:/)).toBeInTheDocument()
    })
  })

  describe('Token Previews', () => {
    it('renders color swatch for color tokens', () => {
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
        />
      )
      
      const swatch = screen.getByLabelText(/color swatch: #3B82F6/i)
      expect(swatch).toBeInTheDocument()
      expect(swatch).toHaveStyle({ backgroundColor: '#3B82F6' })
    })

    it('renders typography preview for typography tokens', () => {
      render(
        <TokenDisplay
          tokenType="typography"
          value="Inter"
          confidence={0.91}
        />
      )
      
      expect(screen.getByText('Aa')).toBeInTheDocument()
      expect(screen.getByText('Typography Token')).toBeInTheDocument()
    })

    it('renders spacing preview for spacing tokens', () => {
      render(
        <TokenDisplay
          tokenType="spacing"
          value="16px"
          confidence={0.93}
        />
      )
      
      const preview = screen.getByLabelText(/spacing preview: 16px/i)
      expect(preview).toBeInTheDocument()
      expect(preview).toHaveStyle({ width: '16px', height: '16px' })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels on edit button', () => {
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
          editable
        />
      )
      
      const editButton = screen.getByRole('button', { name: /edit token/i })
      expect(editButton).toHaveAttribute('aria-label', 'Edit token')
    })

    it('has proper ARIA labels on code toggle button', () => {
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
        />
      )
      
      const toggleButton = screen.getByRole('button', { name: /show code/i })
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
      expect(toggleButton).toHaveAttribute('aria-label', 'Show code')
    })

    it('updates ARIA attributes when code is shown', async () => {
      const user = userEvent.setup()
      
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
        />
      )
      
      const toggleButton = screen.getByRole('button', { name: /show code/i })
      await user.click(toggleButton)
      
      const hideButton = screen.getByRole('button', { name: /hide code/i })
      expect(hideButton).toHaveAttribute('aria-expanded', 'true')
      expect(hideButton).toHaveAttribute('aria-label', 'Hide code')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
          editable
          onEdit={onEdit}
        />
      )
      
      // Tab to edit button and activate with Enter
      await user.tab()
      expect(screen.getByRole('button', { name: /edit token/i })).toHaveFocus()
      await user.keyboard('{Enter}')
      expect(onEdit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
          className="custom-class"
        />
      )
      
      const element = screen.getByTestId('token-display')
      expect(element).toHaveClass('custom-class')
    })

    it('uses custom name in code generation', async () => {
      const user = userEvent.setup()
      
      render(
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
          name="custom-color"
        />
      )
      
      const showCodeButton = screen.getByRole('button', { name: /show code/i })
      await user.click(showCodeButton)
      
      expect(screen.getByText(/--custom-color: #3B82F6/)).toBeInTheDocument()
    })
  })
})
