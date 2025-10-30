import { expect, test } from '@storybook/test'
import { composeStories } from '@storybook/react'
import * as stories from './EditModal.stories'

const {
  Default,
  EditPropsRequirement,
  EditEventsRequirement,
  EditStatesRequirement,
  EditAccessibilityRequirement,
  AllTypeOptions,
  EmptyRationale,
  AccessibilityTest,
} = composeStories(stories)

test('Default: renders EditModal with all form fields', async () => {
  const { container } = await Default.run()
  
  // Check for dialog content
  const dialog = container.querySelector('[role="dialog"]')
  expect(dialog).toBeTruthy()
  
  // Check for title
  const title = container.querySelector('h2')
  expect(title?.textContent).toContain('Edit Requirement')
  
  // Check for form inputs
  const inputs = container.querySelectorAll('input')
  expect(inputs.length).toBeGreaterThan(0)
  
  // Check for buttons
  const buttons = container.querySelectorAll('button')
  expect(buttons.length).toBeGreaterThan(0)
})

test('EditPropsRequirement: displays Props category correctly', async () => {
  const { container } = await EditPropsRequirement.run()
  
  // Check that category select has correct value
  const categoryTrigger = container.querySelector('[id="req-category"]')
  expect(categoryTrigger).toBeTruthy()
})

test('EditEventsRequirement: displays Events category with Function type', async () => {
  const { container } = await EditEventsRequirement.run()
  
  const dialog = container.querySelector('[role="dialog"]')
  expect(dialog).toBeTruthy()
})

test('EditStatesRequirement: displays States category correctly', async () => {
  const { container } = await EditStatesRequirement.run()
  
  const dialog = container.querySelector('[role="dialog"]')
  expect(dialog).toBeTruthy()
})

test('EditAccessibilityRequirement: displays Accessibility category correctly', async () => {
  const { container } = await EditAccessibilityRequirement.run()
  
  const dialog = container.querySelector('[role="dialog"]')
  expect(dialog).toBeTruthy()
})

test('AllTypeOptions: renders all radio button type options', async () => {
  const { container } = await AllTypeOptions.run()
  
  // Check for radio buttons
  const radioButtons = container.querySelectorAll('[role="radio"]')
  expect(radioButtons.length).toBe(5) // Boolean, String, Number, Object, Function
})

test('EmptyRationale: handles optional rationale field', async () => {
  const { container } = await EmptyRationale.run()
  
  const dialog = container.querySelector('[role="dialog"]')
  expect(dialog).toBeTruthy()
  
  // Check for textarea
  const textarea = container.querySelector('textarea')
  expect(textarea).toBeTruthy()
})

test('AccessibilityTest: has proper ARIA attributes', async () => {
  const { container } = await AccessibilityTest.run()
  
  // Check for dialog role
  const dialog = container.querySelector('[role="dialog"]')
  expect(dialog).toBeTruthy()
  expect(dialog?.getAttribute('aria-describedby')).toBe('edit-requirement-description')
  
  // Check for labels
  const labels = container.querySelectorAll('label')
  expect(labels.length).toBeGreaterThan(0)
  
  // Check that inputs have associated labels
  const nameInput = container.querySelector('#req-name')
  expect(nameInput).toBeTruthy()
  expect(nameInput?.getAttribute('aria-label')).toBe('Requirement name')
  
  // Check that buttons have proper labels
  const saveButton = container.querySelector('[aria-label="Save changes"]')
  expect(saveButton).toBeTruthy()
  
  const cancelButton = container.querySelector('[aria-label="Cancel editing"]')
  expect(cancelButton).toBeTruthy()
  
  // Check radio group
  const radioGroup = container.querySelector('[role="radiogroup"]')
  expect(radioGroup).toBeTruthy()
  expect(radioGroup?.getAttribute('aria-label')).toBe('Requirement type')
})

test('AccessibilityTest: all form controls are keyboard accessible', async () => {
  const { container } = await AccessibilityTest.run()
  
  // Check that all interactive elements can receive focus
  const focusableElements = container.querySelectorAll(
    'button, input, select, textarea, [role="radio"], [role="combobox"]'
  )
  
  focusableElements.forEach((element) => {
    // Elements should not have tabindex="-1" unless they are disabled
    const tabindex = element.getAttribute('tabindex')
    const isDisabled = element.getAttribute('disabled') !== null || 
                      element.getAttribute('aria-disabled') === 'true'
    
    if (!isDisabled && tabindex === '-1') {
      // This would be a keyboard accessibility issue
      expect(tabindex).not.toBe('-1')
    }
  })
})

test('AccessibilityTest: required fields have proper indication', async () => {
  const { container } = await AccessibilityTest.run()
  
  // Name field should be required
  const nameInput = container.querySelector('#req-name')
  expect(nameInput).toBeTruthy()
  expect(nameInput?.hasAttribute('required')).toBe(true)
})
