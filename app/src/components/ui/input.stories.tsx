import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Input } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success'],
      description: 'The visual style variant of the input',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the input',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'url', 'password', 'number'],
      description: 'The type of the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

// Default input
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

// Error variant
export const Error: Story = {
  args: {
    variant: 'error',
    placeholder: 'Invalid input',
    defaultValue: 'invalid@example',
  },
}

// Success variant
export const Success: Story = {
  args: {
    variant: 'success',
    placeholder: 'Valid input',
    defaultValue: 'valid@example.com',
  },
}

// Small size
export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
}

// Medium size (default)
export const Medium: Story = {
  args: {
    size: 'md',
    placeholder: 'Medium input',
  },
}

// Large size
export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
  },
}

// Email type
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'name@example.com',
  },
}

// URL type
export const URL: Story = {
  args: {
    type: 'url',
    placeholder: 'https://example.com',
  },
}

// Password type
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

// Number type
export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
}

// Disabled state
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
    defaultValue: 'Cannot edit',
  },
}

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 min-w-[400px]">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Variants</h3>
        <div className="space-y-3">
          <Input variant="default" placeholder="Default variant" />
          <Input variant="error" placeholder="Error variant" />
          <Input variant="success" placeholder="Success variant" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Sizes</h3>
        <div className="space-y-3">
          <Input size="sm" placeholder="Small size" />
          <Input size="md" placeholder="Medium size (default)" />
          <Input size="lg" placeholder="Large size" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Types</h3>
        <div className="space-y-3">
          <Input type="text" placeholder="Text input" />
          <Input type="email" placeholder="Email input" />
          <Input type="url" placeholder="URL input" />
          <Input type="password" placeholder="Password input" />
          <Input type="number" placeholder="Number input" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">States</h3>
        <div className="space-y-3">
          <Input placeholder="Default state" />
          <Input disabled placeholder="Disabled state" />
        </div>
      </div>
    </div>
  ),
}

// Token Extraction Use Case
export const TokenExtractionPage: Story = {
  name: 'Use Case: Token Extraction',
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Token Extraction Page Inputs</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="figma-url" className="text-sm font-medium">
            Figma URL
          </label>
          <Input
            id="figma-url"
            type="url"
            placeholder="https://www.figma.com/file/..."
            aria-required="true"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="figma-token" className="text-sm font-medium">
            Personal Access Token
          </label>
          <Input
            id="figma-token"
            type="password"
            placeholder="figd_••••••••••••••••••••••••••"
            aria-required="true"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="color-override" className="text-sm font-medium">
            Manual Color Override
          </label>
          <Input
            id="color-override"
            type="text"
            placeholder="#FF5733"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="typography-override" className="text-sm font-medium">
            Manual Typography Override
          </label>
          <Input
            id="typography-override"
            type="text"
            placeholder="16px/1.5 'Inter', sans-serif"
          />
        </div>
      </div>
    </div>
  ),
}

// Requirements Edit Modal Use Case
export const RequirementsEditModal: Story = {
  name: 'Use Case: Requirements Edit Modal',
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Requirements Edit Modal Inputs</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="requirement-name" className="text-sm font-medium">
            Requirement Name
          </label>
          <Input
            id="requirement-name"
            type="text"
            placeholder="Button variants"
            aria-required="true"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="requirement-values" className="text-sm font-medium">
            Values (comma-separated)
          </label>
          <Input
            id="requirement-values"
            type="text"
            placeholder="primary, secondary, tertiary, ghost"
          />
        </div>
      </div>
    </div>
  ),
}

// Validation States Use Case
export const ValidationStates: Story = {
  name: 'Use Case: Validation States',
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Input Validation States</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="valid-email" className="text-sm font-medium">
            Valid Email
          </label>
          <Input
            id="valid-email"
            type="email"
            variant="success"
            defaultValue="user@example.com"
          />
          <p className="text-xs text-green-600">✓ Valid email address</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="invalid-email" className="text-sm font-medium">
            Invalid Email
          </label>
          <Input
            id="invalid-email"
            type="email"
            variant="error"
            defaultValue="invalid-email"
            aria-invalid="true"
          />
          <p className="text-xs text-red-600">✗ Please enter a valid email address</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="invalid-url" className="text-sm font-medium">
            Invalid URL
          </label>
          <Input
            id="invalid-url"
            type="url"
            variant="error"
            defaultValue="not-a-url"
            aria-invalid="true"
          />
          <p className="text-xs text-red-600">✗ Please enter a valid URL</p>
        </div>
      </div>
    </div>
  ),
}

// Accessibility Test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Keyboard Navigation Test</h3>
      <p className="text-sm text-gray-600">
        Tab through inputs, test focus indicators and screen reader labels
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="a11y-name" className="text-sm font-medium">
            Name (required)
          </label>
          <Input
            id="a11y-name"
            type="text"
            placeholder="John Doe"
            aria-required="true"
            aria-label="Your full name"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="a11y-email" className="text-sm font-medium">
            Email (required)
          </label>
          <Input
            id="a11y-email"
            type="email"
            placeholder="john@example.com"
            aria-required="true"
            aria-label="Your email address"
            aria-describedby="email-description"
          />
          <p id="email-description" className="text-xs text-gray-600">
            We&apos;ll never share your email with anyone else.
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="a11y-password" className="text-sm font-medium">
            Password (required)
          </label>
          <Input
            id="a11y-password"
            type="password"
            placeholder="••••••••"
            aria-required="true"
            aria-label="Your password"
            aria-describedby="password-description"
          />
          <p id="password-description" className="text-xs text-gray-600">
            Must be at least 8 characters long.
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="a11y-disabled" className="text-sm font-medium">
            Disabled Input
          </label>
          <Input
            id="a11y-disabled"
            type="text"
            disabled
            defaultValue="This field is disabled"
            aria-label="Disabled input field"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'label',
            enabled: true,
          },
          {
            id: 'aria-required-attr',
            enabled: true,
          },
        ],
      },
    },
  },
}
