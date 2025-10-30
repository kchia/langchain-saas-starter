import { expect, test } from '@storybook/test'
import { composeStories } from '@storybook/react'
import * as stories from './select.stories'

const { Default, CategorySelect, TypeSelect, Disabled, AccessibilityTest } = composeStories(stories)

test('Default: renders select component', async () => {
  const { container } = await Default.run()
  const trigger = container.querySelector('[data-radix-select-trigger]')
  expect(trigger).toBeTruthy()
})

test('CategorySelect: renders with correct default value', async () => {
  const { container } = await CategorySelect.run()
  const trigger = container.querySelector('[data-radix-select-trigger]')
  expect(trigger).toBeTruthy()
  // Default value should be "Props"
  expect(trigger?.textContent).toContain('Props')
})

test('TypeSelect: renders with correct default value', async () => {
  const { container } = await TypeSelect.run()
  const trigger = container.querySelector('[data-radix-select-trigger]')
  expect(trigger).toBeTruthy()
  // Default value should be "string"
  expect(trigger?.textContent).toContain('string')
})

test('Disabled: renders disabled select', async () => {
  const { container } = await Disabled.run()
  const trigger = container.querySelector('[data-radix-select-trigger]')
  expect(trigger).toBeTruthy()
  expect(trigger?.getAttribute('data-disabled')).toBe('')
  expect(trigger?.getAttribute('aria-disabled')).toBe('true')
})

test('AccessibilityTest: renders multiple selects with labels', async () => {
  const { container } = await AccessibilityTest.run()
  const labels = container.querySelectorAll('label')
  expect(labels.length).toBeGreaterThanOrEqual(3)
  
  const triggers = container.querySelectorAll('[data-radix-select-trigger]')
  expect(triggers.length).toBeGreaterThanOrEqual(3)
  
  // Check that each select has proper ARIA attributes
  triggers.forEach((trigger) => {
    expect(trigger.getAttribute('role')).toBe('combobox')
    expect(trigger.getAttribute('aria-expanded')).toBeDefined()
  })
})
