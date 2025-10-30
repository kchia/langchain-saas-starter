import { describe, it, expect } from 'vitest'
import { composeStories } from '@storybook/react'
import { render } from '@storybook/test'
import * as stories from './badge.stories'

const { Default, Success, Warning, Error, Info, Neutral, Small, Medium, Large, ConfidenceBadges } = composeStories(stories)

describe('Badge Component', () => {
  describe('Variants', () => {
    it('renders default variant', async () => {
      const { container } = render(<Default />)
      expect(container.textContent).toContain('Default')
    })

    it('renders success variant', async () => {
      const { container } = render(<Success />)
      expect(container.textContent).toContain('Success')
    })

    it('renders warning variant', async () => {
      const { container } = render(<Warning />)
      expect(container.textContent).toContain('Warning')
    })

    it('renders error variant', async () => {
      const { container } = render(<Error />)
      expect(container.textContent).toContain('Error')
    })

    it('renders info variant', async () => {
      const { container } = render(<Info />)
      expect(container.textContent).toContain('Info')
    })

    it('renders neutral variant', async () => {
      const { container } = render(<Neutral />)
      expect(container.textContent).toContain('req-001')
    })
  })

  describe('Sizes', () => {
    it('renders small size', async () => {
      const { container } = render(<Small />)
      expect(container.textContent).toContain('✓')
    })

    it('renders medium size', async () => {
      const { container } = render(<Medium />)
      expect(container.textContent).toContain('SELECTED')
    })

    it('renders large size', async () => {
      const { container } = render(<Large />)
      expect(container.textContent).toContain('Compiled successfully')
    })
  })

  describe('ConfidenceBadge', () => {
    it('renders confidence badges with correct icons and scores', async () => {
      const { container } = render(<ConfidenceBadges />)
      
      // Check for high confidence (>= 0.9) - green with checkmark
      expect(container.textContent).toContain('0.95')
      expect(container.textContent).toContain('✅')
      
      // Check for medium confidence (0.7-0.89) - yellow with warning
      expect(container.textContent).toContain('0.88')
      expect(container.textContent).toContain('0.75')
      expect(container.textContent).toContain('⚠️')
      
      // Check for low confidence (< 0.7) - red with error
      expect(container.textContent).toContain('0.65')
      expect(container.textContent).toContain('❌')
    })
  })
})
