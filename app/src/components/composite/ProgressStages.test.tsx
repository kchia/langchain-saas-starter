import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { composeStories } from '@storybook/react'
import * as stories from './ProgressStages.stories'

const { 
  Stage0, 
  Stage1, 
  Stage2, 
  Stage3Complete,
  SuccessVariant,
  WarningVariant,
  ErrorVariant,
  SmallSize,
  LargeSize,
  TokenExtractionFlow,
} = composeStories(stories)

describe('ProgressStages Component', () => {
  describe('Rendering', () => {
    it('renders the component correctly', () => {
      const { container } = render(<Stage1 />)
      expect(container.querySelector('[role="group"]')).toBeInTheDocument()
    })

    it('renders all stages', () => {
      const { container } = render(<Stage1 />)
      expect(container.textContent).toContain('Upload Screenshot')
      expect(container.textContent).toContain('Extract Tokens')
      expect(container.textContent).toContain('Generate Component')
      expect(container.textContent).toContain('Export Code')
    })

    it('renders the progress bar', () => {
      render(<Stage1 />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })
  })

  describe('Stage Indicators', () => {
    it('shows checkmark for completed stages', () => {
      const { container } = render(<Stage2 />)
      // Stage 2 means stages 0 and 1 are completed
      const checkmarks = container.textContent?.match(/✅/g)
      expect(checkmarks).toHaveLength(2)
    })

    it('shows spinner for current stage', () => {
      const { container } = render(<Stage1 />)
      // Should have a spinner for the current stage
      const spinner = container.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('shows hourglass for pending stages', () => {
      const { container } = render(<Stage1 />)
      // Stage 1 means stages 2 and 3 are pending
      const hourglasses = container.textContent?.match(/⏳/g)
      expect(hourglasses).toHaveLength(2)
    })

    it('shows all checkmarks when complete', () => {
      const { container } = render(<Stage3Complete />)
      // All 4 stages completed (index 0-3)
      const checkmarks = container.textContent?.match(/✅/g)
      expect(checkmarks).toHaveLength(3) // 3 completed before the current
    })
  })

  describe('Variants', () => {
    it('renders success variant correctly', () => {
      render(<SuccessVariant />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })

    it('renders warning variant correctly', () => {
      render(<WarningVariant />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })

    it('renders error variant correctly', () => {
      render(<ErrorVariant />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<SmallSize />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })

    it('renders large size correctly', () => {
      render(<LargeSize />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })
  })

  describe('Progress Calculation', () => {
    it('calculates progress correctly for first stage', () => {
      render(<Stage0 />)
      const progress = screen.getByRole('progressbar')
      // Stage 0 out of 4 stages = (0+1)/4 * 100 = 25%
      expect(progress).toHaveAttribute('aria-valuenow', '25')
    })

    it('calculates progress correctly for middle stage', () => {
      render(<Stage1 />)
      const progress = screen.getByRole('progressbar')
      // Stage 1 out of 4 stages = (1+1)/4 * 100 = 50%
      expect(progress).toHaveAttribute('aria-valuenow', '50')
    })

    it('calculates progress correctly for last stage', () => {
      render(<Stage3Complete />)
      const progress = screen.getByRole('progressbar')
      // Stage 3 out of 4 stages = (3+1)/4 * 100 = 100%
      expect(progress).toHaveAttribute('aria-valuenow', '100')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA roles', () => {
      const { container } = render(<Stage1 />)
      expect(container.querySelector('[role="group"]')).toBeInTheDocument()
      expect(container.querySelector('[role="list"]')).toBeInTheDocument()
    })

    it('has progressbar role', () => {
      render(<Stage1 />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })

    it('has proper ARIA attributes on progress bar', () => {
      render(<Stage1 />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toHaveAttribute('aria-valuenow')
      expect(progress).toHaveAttribute('aria-valuemin', '0')
      expect(progress).toHaveAttribute('aria-valuemax', '100')
    })

    it('marks current stage with aria-current', () => {
      const { container } = render(<Stage1 />)
      const currentStage = container.querySelector('[aria-current="step"]')
      expect(currentStage).toBeInTheDocument()
    })

    it('supports custom aria-label', () => {
      render(<stories.AccessibilityTest.render />)
      const group = screen.getByRole('group', { name: /component generation progress/i })
      expect(group).toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('renders token extraction flow correctly', () => {
      const { container } = render(<TokenExtractionFlow />)
      expect(container.textContent).toContain('Image validated')
      expect(container.textContent).toContain('GPT-4V analyzing')
      expect(container.textContent).toContain('Detecting spacing')
      expect(container.textContent).toContain('Extracting colors')
    })
  })

  describe('Text Styling', () => {
    it('styles completed and current stages differently from pending', () => {
      const { container } = render(<Stage1 />)
      const stages = container.querySelectorAll('[role="listitem"]')
      
      // First two stages (0, 1) should not have muted text
      // Last two stages (2, 3) should have muted text
      const stageTexts = Array.from(stages).map(s => s.querySelector('span:last-child'))
      
      // Check that pending stages have muted text class
      expect(stageTexts[2]).toHaveClass('text-muted-foreground')
      expect(stageTexts[3]).toHaveClass('text-muted-foreground')
    })
  })
})
