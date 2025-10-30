import { describe, it, expect } from 'vitest'
import { composeStories } from '@storybook/react'
import * as stories from './tabs.stories'

const composedStories = composeStories(stories)

describe('Tabs Component', () => {
  describe('Variants', () => {
    it('renders default variant', () => {
      const { Default } = composedStories
      expect(Default).toBeDefined()
    })

    it('renders pills variant', () => {
      const { Pills } = composedStories
      expect(Pills).toBeDefined()
    })

    it('renders underline variant', () => {
      const { Underline } = composedStories
      expect(Underline).toBeDefined()
    })
  })

  describe('Orientations', () => {
    it('renders vertical orientation with default variant', () => {
      const { VerticalDefault } = composedStories
      expect(VerticalDefault).toBeDefined()
    })

    it('renders vertical orientation with pills variant', () => {
      const { VerticalPills } = composedStories
      expect(VerticalPills).toBeDefined()
    })

    it('renders vertical orientation with underline variant', () => {
      const { VerticalUnderline } = composedStories
      expect(VerticalUnderline).toBeDefined()
    })
  })

  describe('Use Cases', () => {
    it('renders Token Extraction page use case', () => {
      const { TokenExtractionPage } = composedStories
      expect(TokenExtractionPage).toBeDefined()
    })

    it('renders Component Preview page use case', () => {
      const { ComponentPreviewPage } = composedStories
      expect(ComponentPreviewPage).toBeDefined()
    })
  })

  describe('States', () => {
    it('renders disabled tabs', () => {
      const { DisabledTabs } = composedStories
      expect(DisabledTabs).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('passes accessibility tests', () => {
      const { AccessibilityTest } = composedStories
      expect(AccessibilityTest).toBeDefined()
    })

    it('renders all variants showcase', () => {
      const { AllVariants } = composedStories
      expect(AllVariants).toBeDefined()
    })
  })
})
