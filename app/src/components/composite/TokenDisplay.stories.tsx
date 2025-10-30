import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TokenDisplay } from './TokenDisplay'

const meta = {
  title: 'Composite/TokenDisplay',
  component: TokenDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tokenType: {
      control: 'select',
      options: ['color', 'typography', 'spacing'],
      description: 'Type of token being displayed',
    },
    value: {
      control: 'text',
      description: 'The value of the token',
    },
    confidence: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Confidence score from 0 to 1',
    },
    editable: {
      control: 'boolean',
      description: 'Whether the token is editable',
    },
    name: {
      control: 'text',
      description: 'Optional token name/label',
    },
  },
} satisfies Meta<typeof TokenDisplay>

export default meta
type Story = StoryObj<typeof meta>

// Color Token Examples
export const ColorTokenHighConfidence: Story = {
  args: {
    tokenType: 'color',
    value: '#3B82F6',
    confidence: 0.94,
    editable: true,
    name: 'primary',
    onEdit: () => alert('Edit color token'),
  },
}

export const ColorTokenMediumConfidence: Story = {
  args: {
    tokenType: 'color',
    value: '#10B981',
    confidence: 0.76,
    editable: true,
    name: 'success',
    onEdit: () => alert('Edit color token'),
  },
}

export const ColorTokenLowConfidence: Story = {
  args: {
    tokenType: 'color',
    value: '#EF4444',
    confidence: 0.62,
    editable: true,
    name: 'error',
    onEdit: () => alert('Edit color token'),
  },
}

// Typography Token Examples
export const TypographyTokenFont: Story = {
  args: {
    tokenType: 'typography',
    value: 'Inter',
    confidence: 0.91,
    editable: true,
    name: 'sans',
    onEdit: () => alert('Edit typography token'),
  },
}

export const TypographyTokenSize: Story = {
  args: {
    tokenType: 'typography',
    value: '16px',
    confidence: 0.88,
    editable: true,
    name: 'base',
    onEdit: () => alert('Edit typography token'),
  },
}

// Spacing Token Examples
export const SpacingTokenSmall: Story = {
  args: {
    tokenType: 'spacing',
    value: '8px',
    confidence: 0.95,
    editable: true,
    name: 'sm',
    onEdit: () => alert('Edit spacing token'),
  },
}

export const SpacingTokenMedium: Story = {
  args: {
    tokenType: 'spacing',
    value: '16px',
    confidence: 0.93,
    editable: true,
    name: 'md',
    onEdit: () => alert('Edit spacing token'),
  },
}

export const SpacingTokenLarge: Story = {
  args: {
    tokenType: 'spacing',
    value: '32px',
    confidence: 0.89,
    editable: true,
    name: 'lg',
    onEdit: () => alert('Edit spacing token'),
  },
}

// Non-editable examples
export const ColorTokenReadOnly: Story = {
  args: {
    tokenType: 'color',
    value: '#F59E0B',
    confidence: 0.97,
    editable: false,
    name: 'warning',
  },
}

export const TypographyTokenReadOnly: Story = {
  args: {
    tokenType: 'typography',
    value: 'Fira Code',
    confidence: 0.85,
    editable: false,
    name: 'mono',
  },
}

// All Token Types Showcase
export const AllTokenTypes: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <h3 className="text-lg font-semibold mb-4">Token Display Examples</h3>
      
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-600">Color Tokens</h4>
        <TokenDisplay
          tokenType="color"
          value="#3B82F6"
          confidence={0.94}
          editable
          name="primary"
          onEdit={() => alert('Edit primary color')}
        />
        <TokenDisplay
          tokenType="color"
          value="#10B981"
          confidence={0.76}
          editable
          name="success"
          onEdit={() => alert('Edit success color')}
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-600">Typography Tokens</h4>
        <TokenDisplay
          tokenType="typography"
          value="Inter"
          confidence={0.91}
          editable
          name="sans"
          onEdit={() => alert('Edit font')}
        />
        <TokenDisplay
          tokenType="typography"
          value="16px"
          confidence={0.88}
          editable
          name="base"
          onEdit={() => alert('Edit font size')}
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-600">Spacing Tokens</h4>
        <TokenDisplay
          tokenType="spacing"
          value="8px"
          confidence={0.95}
          editable
          name="sm"
          onEdit={() => alert('Edit spacing')}
        />
        <TokenDisplay
          tokenType="spacing"
          value="16px"
          confidence={0.93}
          editable
          name="md"
          onEdit={() => alert('Edit spacing')}
        />
      </div>
    </div>
  ),
}

// Confidence Levels Showcase
export const ConfidenceLevels: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <h3 className="text-lg font-semibold mb-4">Confidence Score Levels</h3>
      
      <div className="space-y-3">
        <TokenDisplay
          tokenType="color"
          value="#10B981"
          confidence={0.95}
          editable
          name="high-confidence"
        />
        <p className="text-xs text-gray-600 -mt-2 ml-2">
          High confidence (≥0.9): Green badge with ✅
        </p>
      </div>

      <div className="space-y-3">
        <TokenDisplay
          tokenType="color"
          value="#F59E0B"
          confidence={0.75}
          editable
          name="medium-confidence"
        />
        <p className="text-xs text-gray-600 -mt-2 ml-2">
          Medium confidence (0.7-0.89): Yellow badge with ⚠️
        </p>
      </div>

      <div className="space-y-3">
        <TokenDisplay
          tokenType="color"
          value="#EF4444"
          confidence={0.62}
          editable
          name="low-confidence"
        />
        <p className="text-xs text-gray-600 -mt-2 ml-2">
          Low confidence (&lt;0.7): Red badge with ❌
        </p>
      </div>
    </div>
  ),
}

// Accessibility Test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <h3 className="text-sm font-semibold">Keyboard Navigation Test</h3>
      <p className="text-sm text-gray-600">
        Tab to navigate, Enter/Space to activate buttons
      </p>
      
      <TokenDisplay
        tokenType="color"
        value="#3B82F6"
        confidence={0.94}
        editable
        name="primary"
        onEdit={() => alert('Edit button activated via keyboard')}
      />
      
      <TokenDisplay
        tokenType="typography"
        value="Inter"
        confidence={0.91}
        editable
        name="sans"
        onEdit={() => alert('Typography token edited')}
      />
      
      <TokenDisplay
        tokenType="spacing"
        value="16px"
        confidence={0.93}
        editable
        name="md"
        onEdit={() => alert('Spacing token edited')}
      />
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
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
        ],
      },
    },
  },
}
