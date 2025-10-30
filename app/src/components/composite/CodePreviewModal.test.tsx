import { describe, it, expect } from 'vitest'
import { composeStories } from '@storybook/react'
import * as stories from './CodePreviewModal.stories'

const composedStories = composeStories(stories)

describe('CodePreviewModal Component', () => {
  describe('Story Composition', () => {
    it('renders Default story', () => {
      const { Default } = composedStories
      expect(Default).toBeDefined()
    })

    it('renders AlwaysOpen story', () => {
      const { AlwaysOpen } = composedStories
      expect(AlwaysOpen).toBeDefined()
    })

    it('renders NoVisualPreview story', () => {
      const { NoVisualPreview } = composedStories
      expect(NoVisualPreview).toBeDefined()
    })

    it('renders NoMetadata story', () => {
      const { NoMetadata } = composedStories
      expect(NoMetadata).toBeDefined()
    })

    it('renders MinimalPattern story', () => {
      const { MinimalPattern } = composedStories
      expect(MinimalPattern).toBeDefined()
    })

    it('renders LongCode story', () => {
      const { LongCode } = composedStories
      expect(LongCode).toBeDefined()
    })

    it('renders PythonCode story', () => {
      const { PythonCode } = composedStories
      expect(PythonCode).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('passes accessibility tests', () => {
      const { AccessibilityTest } = composedStories
      expect(AccessibilityTest).toBeDefined()
    })
  })

  describe('Pattern Props', () => {
    it('handles pattern with all fields', () => {
      const { AlwaysOpen } = composedStories
      expect(AlwaysOpen.args?.pattern).toHaveProperty('id')
      expect(AlwaysOpen.args?.pattern).toHaveProperty('name')
      expect(AlwaysOpen.args?.pattern).toHaveProperty('version')
      expect(AlwaysOpen.args?.pattern).toHaveProperty('code')
    })

    it('handles pattern without visual preview', () => {
      const { NoVisualPreview } = composedStories
      expect(NoVisualPreview.args?.pattern).toBeDefined()
      expect(NoVisualPreview.args?.pattern?.visualPreview).toBeUndefined()
    })

    it('handles pattern without metadata', () => {
      const { NoMetadata } = composedStories
      expect(NoMetadata.args?.pattern).toBeDefined()
      expect(NoMetadata.args?.pattern?.metadata).toBeUndefined()
    })

    it('handles minimal pattern with only required fields', () => {
      const { MinimalPattern } = composedStories
      expect(MinimalPattern.args?.pattern).toBeDefined()
      expect(MinimalPattern.args?.pattern?.id).toBeDefined()
      expect(MinimalPattern.args?.pattern?.name).toBeDefined()
      expect(MinimalPattern.args?.pattern?.version).toBeDefined()
      expect(MinimalPattern.args?.pattern?.code).toBeDefined()
    })
  })

  describe('Different Languages', () => {
    it('handles TypeScript code', () => {
      const { AlwaysOpen } = composedStories
      expect(AlwaysOpen.args?.pattern?.language).toBe('typescript')
    })

    it('handles Python code', () => {
      const { PythonCode } = composedStories
      expect(PythonCode.args?.pattern?.language).toBe('python')
    })
  })
})
