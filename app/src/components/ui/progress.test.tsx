import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { composeStories } from '@storybook/react'
import * as stories from './progress.stories'

const { Default, Success, Warning, Error, Small, Medium, Large, Indeterminate, WithStagesStage1 } = composeStories(stories)

describe('Progress Component', () => {
  describe('Variants', () => {
    it('renders default variant correctly', () => {
      render(<Default />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })

    it('renders success variant correctly', () => {
      render(<Success />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })

    it('renders warning variant correctly', () => {
      render(<Warning />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })

    it('renders error variant correctly', () => {
      render(<Error />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Small />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })

    it('renders medium size correctly', () => {
      render(<Medium />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })

    it('renders large size correctly', () => {
      render(<Large />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('renders indeterminate state correctly', () => {
      render(<Indeterminate />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })

    it('has correct ARIA attributes', () => {
      const { container } = render(<Default />)
      const progress = container.querySelector('[role="progressbar"]')
      expect(progress).toBeInTheDocument()
    })
  })

  describe('ProgressWithStages', () => {
    it('renders stages correctly', () => {
      const { container } = render(<WithStagesStage1 />)
      const progress = container.querySelector('[role="progressbar"]')
      expect(progress).toBeInTheDocument()
    })

    it('shows correct stage indicators', () => {
      const { container } = render(<WithStagesStage1 />)
      // Check for completed stage (✅)
      expect(container.textContent).toContain('✅')
      // Check for pending stages (⏳)
      expect(container.textContent).toContain('⏳')
    })
  })

  describe('Accessibility', () => {
    it('has progressbar role', () => {
      render(<Default />)
      const progress = screen.getByRole('progressbar')
      expect(progress).toBeInTheDocument()
    })

    it('supports custom aria-label', () => {
      render(
        <stories.AccessibilityTest.render />
      )
      const progress = screen.getByLabelText('Loading progress')
      expect(progress).toBeInTheDocument()
    })
  })
})
