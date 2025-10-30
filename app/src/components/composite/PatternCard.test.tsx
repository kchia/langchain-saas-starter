import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PatternCard } from './PatternCard'

describe('PatternCard', () => {
  const defaultProps = {
    patternId: 'pattern-001',
    name: 'Button Component',
    version: '2.1.0',
    matchScore: 0.94,
  }

  describe('Component Rendering', () => {
    it('renders pattern card with required props', () => {
      render(<PatternCard {...defaultProps} />)
      
      expect(screen.getByText('Button Component')).toBeInTheDocument()
      expect(screen.getByText(/v2\.1\.0/)).toBeInTheDocument()
      expect(screen.getByText(/pattern-001/)).toBeInTheDocument()
      expect(screen.getByText('94%')).toBeInTheDocument()
    })

    it('renders metadata when provided', () => {
      const metadata = {
        description: 'A fully accessible button component',
        author: 'shadcn',
        tags: ['button', 'interactive'],
      }
      
      render(<PatternCard {...defaultProps} metadata={metadata} />)
      
      expect(screen.getByText('A fully accessible button component')).toBeInTheDocument()
      expect(screen.getByText('By shadcn')).toBeInTheDocument()
      expect(screen.getByText('button')).toBeInTheDocument()
      expect(screen.getByText('interactive')).toBeInTheDocument()
    })

    it('does not render metadata when not provided', () => {
      render(<PatternCard {...defaultProps} />)
      
      expect(screen.queryByText(/By /)).not.toBeInTheDocument()
    })

    it('renders action buttons when callbacks provided', () => {
      const onSelect = vi.fn()
      const onPreview = vi.fn()
      
      render(
        <PatternCard
          {...defaultProps}
          onSelect={onSelect}
          onPreview={onPreview}
        />
      )
      
      expect(screen.getByRole('button', { name: /select this pattern/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /preview code/i })).toBeInTheDocument()
    })

    it('does not render action buttons when callbacks not provided', () => {
      render(<PatternCard {...defaultProps} />)
      
      expect(screen.queryByRole('button', { name: /select/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /preview/i })).not.toBeInTheDocument()
    })
  })

  describe('Match Score Variants', () => {
    it('renders success badge for high match score (>= 0.9)', () => {
      const { container } = render(
        <PatternCard {...defaultProps} matchScore={0.94} />
      )
      
      const badge = screen.getByText('94%')
      expect(badge).toHaveClass('bg-green-100')
      expect(badge).toHaveClass('text-green-800')
    })

    it('renders warning badge for medium match score (0.7-0.9)', () => {
      const { container } = render(
        <PatternCard {...defaultProps} matchScore={0.81} />
      )
      
      const badge = screen.getByText('81%')
      expect(badge).toHaveClass('bg-yellow-100')
      expect(badge).toHaveClass('text-yellow-800')
    })

    it('renders error badge for low match score (< 0.7)', () => {
      const { container } = render(
        <PatternCard {...defaultProps} matchScore={0.65} />
      )
      
      const badge = screen.getByText('65%')
      expect(badge).toHaveClass('bg-red-100')
      expect(badge).toHaveClass('text-red-800')
    })

    it('displays match score with 2 decimal precision', () => {
      render(<PatternCard {...defaultProps} matchScore={0.876} />)
      
      expect(screen.getByText('0.88')).toBeInTheDocument()
    })
  })

  describe('Selected State', () => {
    it('renders SELECTED badge when selected', () => {
      render(<PatternCard {...defaultProps} selected={true} />)
      
      expect(screen.getByText('SELECTED')).toBeInTheDocument()
    })

    it('does not render SELECTED badge when not selected', () => {
      render(<PatternCard {...defaultProps} selected={false} />)
      
      expect(screen.queryByText('SELECTED')).not.toBeInTheDocument()
    })

    it('applies selected styles when selected', () => {
      const { container } = render(
        <PatternCard {...defaultProps} selected={true} />
      )
      
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('border-primary')
    })

    it('changes button text when selected', () => {
      const onSelect = vi.fn()
      
      const { rerender } = render(
        <PatternCard {...defaultProps} selected={false} onSelect={onSelect} />
      )
      
      expect(screen.getByRole('button', { name: /select this pattern/i })).toBeInTheDocument()
      
      rerender(<PatternCard {...defaultProps} selected={true} onSelect={onSelect} />)
      
      expect(screen.getByRole('button', { name: /deselect/i })).toBeInTheDocument()
      expect(screen.getByText('Selected')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onSelect when select button is clicked', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      
      render(<PatternCard {...defaultProps} onSelect={onSelect} />)
      
      const selectButton = screen.getByRole('button', { name: /select this pattern/i })
      await user.click(selectButton)
      
      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('calls onPreview when preview button is clicked', async () => {
      const user = userEvent.setup()
      const onPreview = vi.fn()
      
      render(<PatternCard {...defaultProps} onPreview={onPreview} />)
      
      const previewButton = screen.getByRole('button', { name: /preview code/i })
      await user.click(previewButton)
      
      expect(onPreview).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('has accessible label for the card', () => {
      render(<PatternCard {...defaultProps} matchScore={0.94} />)
      
      const card = screen.getByLabelText(/pattern button component.*94%/i)
      expect(card).toBeInTheDocument()
    })

    it('has accessible label for the card when selected', () => {
      render(<PatternCard {...defaultProps} matchScore={0.94} selected={true} />)
      
      const card = screen.getByLabelText(/pattern button component.*94%.*selected/i)
      expect(card).toBeInTheDocument()
    })

    it('has accessible labels for action buttons', () => {
      const onSelect = vi.fn()
      const onPreview = vi.fn()
      
      render(
        <PatternCard
          {...defaultProps}
          name="Test Component"
          onSelect={onSelect}
          onPreview={onPreview}
        />
      )
      
      expect(screen.getByRole('button', { name: /select test component/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /preview code for test component/i })).toBeInTheDocument()
    })

    it('has aria-pressed attribute on select button', () => {
      const onSelect = vi.fn()
      
      const { rerender } = render(
        <PatternCard {...defaultProps} selected={false} onSelect={onSelect} />
      )
      
      const selectButton = screen.getByRole('button', { name: /select/i })
      expect(selectButton).toHaveAttribute('aria-pressed', 'false')
      
      rerender(<PatternCard {...defaultProps} selected={true} onSelect={onSelect} />)
      
      const selectedButton = screen.getByRole('button', { name: /deselect/i })
      expect(selectedButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('has accessible label for match score badge', () => {
      render(<PatternCard {...defaultProps} matchScore={0.94} />)
      
      expect(screen.getByLabelText('Match score 94%')).toBeInTheDocument()
    })

    it('has accessible label for progress bar', () => {
      render(<PatternCard {...defaultProps} matchScore={0.94} />)
      
      expect(screen.getByLabelText('Match score progress: 94%')).toBeInTheDocument()
    })

    it('has accessible label for tags section', () => {
      const metadata = {
        tags: ['button', 'interactive'],
      }
      
      render(<PatternCard {...defaultProps} metadata={metadata} />)
      
      expect(screen.getByLabelText('Pattern tags')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles very long pattern names', () => {
      const longName = 'Very Long Pattern Name That Should Truncate With Ellipsis'
      
      render(<PatternCard {...defaultProps} name={longName} />)
      
      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('handles match score of 1.0', () => {
      render(<PatternCard {...defaultProps} matchScore={1.0} />)
      
      expect(screen.getByText('100%')).toBeInTheDocument()
      expect(screen.getByText('1.00')).toBeInTheDocument()
    })

    it('handles match score of 0.0', () => {
      render(<PatternCard {...defaultProps} matchScore={0.0} />)
      
      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByText('0.00')).toBeInTheDocument()
    })

    it('handles empty tags array', () => {
      const metadata = {
        tags: [],
      }
      
      render(<PatternCard {...defaultProps} metadata={metadata} />)
      
      expect(screen.queryByLabelText('Pattern tags')).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <PatternCard {...defaultProps} className="custom-class" />
      )
      
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('Visual Regression', () => {
    it('matches snapshot for default state', () => {
      const { container } = render(<PatternCard {...defaultProps} />)
      expect(container).toMatchSnapshot()
    })

    it('matches snapshot for selected state', () => {
      const { container } = render(
        <PatternCard {...defaultProps} selected={true} />
      )
      expect(container).toMatchSnapshot()
    })

    it('matches snapshot with full metadata', () => {
      const metadata = {
        description: 'A fully accessible button component',
        author: 'shadcn',
        tags: ['button', 'interactive', 'accessible'],
      }
      
      const { container } = render(
        <PatternCard {...defaultProps} metadata={metadata} />
      )
      expect(container).toMatchSnapshot()
    })
  })
})
