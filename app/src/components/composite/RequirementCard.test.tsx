import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RequirementCard } from './RequirementCard'

describe('RequirementCard', () => {
  const defaultProps = {
    id: 'req-001',
    name: 'disabled',
    type: 'Boolean',
    confidence: 0.95,
    rationale: 'This prop is commonly used to disable interactive elements.',
    values: ['true', 'false'],
    category: 'Props',
  }

  describe('Component Rendering', () => {
    it('renders all required information', () => {
      render(<RequirementCard {...defaultProps} />)

      // Check ID badge
      expect(screen.getByText('req-001')).toBeInTheDocument()

      // Check name/title
      expect(screen.getByText('disabled')).toBeInTheDocument()

      // Check type
      expect(screen.getByText('Boolean')).toBeInTheDocument()

      // Check category badge
      expect(screen.getByText('Props')).toBeInTheDocument()

      // Check values
      expect(screen.getByText('true, false')).toBeInTheDocument()

      // Check confidence badge exists
      expect(screen.getByText('0.95')).toBeInTheDocument()
    })

    it('renders without values when not provided', () => {
      const propsWithoutValues = { ...defaultProps, values: undefined }
      render(<RequirementCard {...propsWithoutValues} />)

      expect(screen.getByText('req-001')).toBeInTheDocument()
      expect(screen.queryByText('Values:')).not.toBeInTheDocument()
    })

    it('renders with empty values array', () => {
      const propsWithEmptyValues = { ...defaultProps, values: [] }
      render(<RequirementCard {...propsWithEmptyValues} />)

      expect(screen.getByText('req-001')).toBeInTheDocument()
      expect(screen.queryByText('Values:')).not.toBeInTheDocument()
    })
  })

  describe('Confidence Badge', () => {
    it('shows high confidence badge for score >= 0.9', () => {
      render(<RequirementCard {...defaultProps} confidence={0.95} />)
      expect(screen.getByText('0.95')).toBeInTheDocument()
      expect(screen.getByText('✅')).toBeInTheDocument()
    })

    it('shows medium confidence badge for score 0.7-0.9', () => {
      render(<RequirementCard {...defaultProps} confidence={0.78} />)
      expect(screen.getByText('0.78')).toBeInTheDocument()
      expect(screen.getByText('⚠️')).toBeInTheDocument()
    })

    it('shows low confidence badge for score < 0.7', () => {
      render(<RequirementCard {...defaultProps} confidence={0.65} />)
      expect(screen.getByText('0.65')).toBeInTheDocument()
      expect(screen.getByText('❌')).toBeInTheDocument()
    })
  })

  describe('Rationale Accordion', () => {
    it('renders collapsed by default', () => {
      render(<RequirementCard {...defaultProps} />)

      // Rationale text should not be visible initially
      expect(screen.queryByText(defaultProps.rationale)).not.toBeVisible()
    })

    it('expands to show rationale when clicked', async () => {
      const user = userEvent.setup()
      render(<RequirementCard {...defaultProps} />)

      // Find and click the accordion trigger
      const trigger = screen.getByText('View Rationale')
      await user.click(trigger)

      // Rationale should now be visible
      expect(screen.getByText(defaultProps.rationale)).toBeVisible()
    })

    it('collapses rationale when clicked again', async () => {
      const user = userEvent.setup()
      render(<RequirementCard {...defaultProps} />)

      const trigger = screen.getByText('View Rationale')

      // Expand
      await user.click(trigger)
      expect(screen.getByText(defaultProps.rationale)).toBeVisible()

      // Collapse
      await user.click(trigger)
      expect(screen.queryByText(defaultProps.rationale)).not.toBeVisible()
    })
  })

  describe('Action Buttons', () => {
    it('renders Accept button when onAccept is provided', () => {
      const onAccept = vi.fn()
      render(<RequirementCard {...defaultProps} onAccept={onAccept} />)

      expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument()
    })

    it('renders Edit button when onEdit is provided', () => {
      const onEdit = vi.fn()
      render(<RequirementCard {...defaultProps} onEdit={onEdit} />)

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('renders Remove button when onRemove is provided', () => {
      const onRemove = vi.fn()
      render(<RequirementCard {...defaultProps} onRemove={onRemove} />)

      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
    })

    it('calls onAccept when Accept button is clicked', async () => {
      const user = userEvent.setup()
      const onAccept = vi.fn()
      render(<RequirementCard {...defaultProps} onAccept={onAccept} />)

      const acceptButton = screen.getByRole('button', { name: /accept/i })
      await user.click(acceptButton)

      expect(onAccept).toHaveBeenCalledTimes(1)
    })

    it('calls onEdit when Edit button is clicked', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      render(<RequirementCard {...defaultProps} onEdit={onEdit} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(onEdit).toHaveBeenCalledTimes(1)
    })

    it('calls onRemove when Remove button is clicked', async () => {
      const user = userEvent.setup()
      const onRemove = vi.fn()
      render(<RequirementCard {...defaultProps} onRemove={onRemove} />)

      const removeButton = screen.getByRole('button', { name: /remove/i })
      await user.click(removeButton)

      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('does not render buttons when callbacks are not provided', () => {
      render(<RequirementCard {...defaultProps} />)

      expect(screen.queryByRole('button', { name: /accept/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
    })

    it('renders all three buttons when all callbacks are provided', () => {
      const onAccept = vi.fn()
      const onEdit = vi.fn()
      const onRemove = vi.fn()
      render(
        <RequirementCard
          {...defaultProps}
          onAccept={onAccept}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      )

      expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
    })
  })

  describe('Categories', () => {
    it('renders Props category', () => {
      render(<RequirementCard {...defaultProps} category="Props" />)
      expect(screen.getByText('Props')).toBeInTheDocument()
    })

    it('renders Events category', () => {
      render(<RequirementCard {...defaultProps} category="Events" />)
      expect(screen.getByText('Events')).toBeInTheDocument()
    })

    it('renders States category', () => {
      render(<RequirementCard {...defaultProps} category="States" />)
      expect(screen.getByText('States')).toBeInTheDocument()
    })

    it('renders Accessibility category', () => {
      render(<RequirementCard {...defaultProps} category="Accessibility" />)
      expect(screen.getByText('Accessibility')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper aria-labels for action buttons', () => {
      const onAccept = vi.fn()
      const onEdit = vi.fn()
      const onRemove = vi.fn()
      render(
        <RequirementCard
          {...defaultProps}
          onAccept={onAccept}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      )

      expect(screen.getByRole('button', { name: 'Accept requirement req-001' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit requirement req-001' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Remove requirement req-001' })
      ).toBeInTheDocument()
    })

    it('supports keyboard navigation for accordion', async () => {
      const user = userEvent.setup()
      render(<RequirementCard {...defaultProps} />)

      const trigger = screen.getByText('View Rationale')
      trigger.focus()

      // Press Enter to expand
      await user.keyboard('{Enter}')
      expect(screen.getByText(defaultProps.rationale)).toBeVisible()
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <RequirementCard {...defaultProps} className="custom-class" />
      )
      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Different Value Types', () => {
    it('renders multiple values correctly', () => {
      render(
        <RequirementCard
          {...defaultProps}
          values={['primary', 'secondary', 'ghost', 'outline']}
        />
      )
      expect(screen.getByText('primary, secondary, ghost, outline')).toBeInTheDocument()
    })

    it('renders single value correctly', () => {
      render(<RequirementCard {...defaultProps} values={['single']} />)
      expect(screen.getByText('single')).toBeInTheDocument()
    })
  })
})
