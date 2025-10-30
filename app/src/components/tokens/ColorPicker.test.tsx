import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorPicker } from './ColorPicker'

describe('ColorPicker', () => {
  describe('Rendering', () => {
    it('renders with label and value', () => {
      render(
        <ColorPicker
          label="Primary"
          value="#3B82F6"
          confidence={0.92}
        />
      )
      
      expect(screen.getByTestId('color-picker')).toBeInTheDocument()
      expect(screen.getByText('Primary')).toBeInTheDocument()
      expect(screen.getByDisplayValue('#3B82F6')).toBeInTheDocument()
    })

    it('displays confidence badge', () => {
      render(
        <ColorPicker
          label="Primary"
          value="#3B82F6"
          confidence={0.92}
        />
      )
      
      expect(screen.getByText('✅')).toBeInTheDocument()
      expect(screen.getByText('0.92')).toBeInTheDocument()
    })

    it('shows color preview swatch', () => {
      render(
        <ColorPicker
          label="Primary"
          value="#3B82F6"
          confidence={0.92}
        />
      )
      
      const swatch = screen.getByLabelText('Color preview: #3B82F6')
      expect(swatch).toBeInTheDocument()
      expect(swatch).toHaveStyle({ backgroundColor: '#3B82F6' })
    })
  })

  describe('Validation', () => {
    it('accepts valid hex colors', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(
        <ColorPicker
          label="Primary"
          value="#000000"
          confidence={0.92}
          onChange={onChange}
        />
      )
      
      const input = screen.getByDisplayValue('#000000')
      await user.clear(input)
      await user.type(input, '#FF5733')
      
      expect(onChange).toHaveBeenCalledWith('#FF5733')
    })

    it('shows error for invalid hex format', async () => {
      const user = userEvent.setup()
      
      render(
        <ColorPicker
          label="Primary"
          value="#3B82F6"
          confidence={0.92}
        />
      )
      
      const input = screen.getByDisplayValue('#3B82F6')
      await user.clear(input)
      await user.type(input, 'invalid')
      
      expect(screen.getByText(/invalid hex color/i)).toBeInTheDocument()
    })

    it('does not call onChange for invalid values', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(
        <ColorPicker
          label="Primary"
          value="#3B82F6"
          confidence={0.92}
          onChange={onChange}
        />
      )
      
      const input = screen.getByDisplayValue('#3B82F6')
      await user.clear(input)
      await user.type(input, 'GGGGGG')
      
      expect(onChange).not.toHaveBeenCalled()
    })

    it('accepts uppercase and lowercase hex', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(
        <ColorPicker
          label="Primary"
          value="#000000"
          confidence={0.92}
          onChange={onChange}
        />
      )
      
      const input = screen.getByDisplayValue('#000000')
      await user.clear(input)
      await user.type(input, '#ff5733')
      
      expect(onChange).toHaveBeenCalledWith('#ff5733')
    })
  })

  describe('Native Color Picker', () => {
    it('renders native color input', () => {
      render(
        <ColorPicker
          label="Primary"
          value="#3B82F6"
          confidence={0.92}
        />
      )
      
      const colorInput = screen.getByLabelText('Color picker for Primary')
      expect(colorInput).toBeInTheDocument()
      expect(colorInput).toHaveAttribute('type', 'color')
    })

    it('updates value when native picker changes', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(
        <ColorPicker
          label="Primary"
          value="#3B82F6"
          confidence={0.92}
          onChange={onChange}
        />
      )
      
      const colorInput = screen.getByLabelText('Color picker for Primary') as HTMLInputElement
      
      // Simulate color picker change
      await user.click(colorInput)
      colorInput.value = '#ff5733'
      colorInput.dispatchEvent(new Event('change', { bubbles: true }))
      
      expect(onChange).toHaveBeenCalledWith('#FF5733')
    })
  })

  describe('Error Display', () => {
    it('shows custom error message when provided', () => {
      render(
        <ColorPicker
          label="Primary"
          value="#3B82F6"
          confidence={0.92}
          error="Custom error message"
        />
      )
      
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('marks input as invalid when error exists', () => {
      render(
        <ColorPicker
          label="Primary"
          value="#3B82F6"
          confidence={0.92}
          error="Error"
        />
      )
      
      const input = screen.getByDisplayValue('#3B82F6')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Accessibility', () => {
    it('has proper labels', () => {
      render(
        <ColorPicker
          label="Primary"
          value="#3B82F6"
          confidence={0.92}
        />
      )
      
      const input = screen.getByDisplayValue('#3B82F6')
      expect(input).toHaveAttribute('id', 'color-Primary')
      
      const label = screen.getByText('Primary')
      expect(label).toHaveAttribute('for', 'color-Primary')
    })

    it('links error message with aria-describedby', () => {
      render(
        <ColorPicker
          label="Primary"
          value="#3B82F6"
          confidence={0.92}
          error="Error message"
        />
      )
      
      const input = screen.getByDisplayValue('#3B82F6')
      expect(input).toHaveAttribute('aria-describedby', 'color-Primary-error')
      
      const error = screen.getByText('Error message')
      expect(error).toHaveAttribute('id', 'color-Primary-error')
      expect(error).toHaveAttribute('role', 'alert')
    })
  })

  describe('Value Synchronization', () => {
    it('syncs with external value changes', () => {
      const { rerender } = render(
        <ColorPicker
          label="Primary"
          value="#3B82F6"
          confidence={0.92}
        />
      )
      
      expect(screen.getByDisplayValue('#3B82F6')).toBeInTheDocument()
      
      rerender(
        <ColorPicker
          label="Primary"
          value="#FF5733"
          confidence={0.92}
        />
      )
      
      expect(screen.getByDisplayValue('#FF5733')).toBeInTheDocument()
    })
  })
})
