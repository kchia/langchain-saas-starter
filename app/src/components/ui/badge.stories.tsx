import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge, ConfidenceBadge } from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info', 'neutral'],
      description: 'The visual style variant of the badge',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the badge',
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

// Default badge
export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Default',
  },
}

// Success variant (green)
export const Success: Story = {
  args: {
    variant: 'success',
    children: '✅ Success',
  },
}

// Warning variant (yellow)
export const Warning: Story = {
  args: {
    variant: 'warning',
    children: '⚠️ Warning',
  },
}

// Error variant (red)
export const Error: Story = {
  args: {
    variant: 'error',
    children: '❌ Error',
  },
}

// Info variant (blue)
export const Info: Story = {
  args: {
    variant: 'info',
    children: 'ℹ️ Info',
  },
}

// Neutral variant (gray)
export const Neutral: Story = {
  args: {
    variant: 'neutral',
    children: 'req-001',
  },
}

// Small size
export const Small: Story = {
  args: {
    size: 'sm',
    variant: 'success',
    children: '✓',
  },
}

// Medium size (default)
export const Medium: Story = {
  args: {
    size: 'md',
    variant: 'info',
    children: 'SELECTED',
  },
}

// Large size
export const Large: Story = {
  args: {
    size: 'lg',
    variant: 'success',
    children: '✓ Compiled successfully',
  },
}

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">With Icons</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">✅ Success</Badge>
          <Badge variant="warning">⚠️ Warning</Badge>
          <Badge variant="error">❌ Error</Badge>
          <Badge variant="info">ℹ️ Info</Badge>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Sizes</h3>
        <div className="flex items-center gap-3">
          <Badge size="sm" variant="success">Small</Badge>
          <Badge size="md" variant="success">Medium</Badge>
          <Badge size="lg" variant="success">Large</Badge>
        </div>
      </div>
    </div>
  ),
}

// Confidence Badge Examples
export const ConfidenceBadges: Story = {
  name: 'Confidence Badge',
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Confidence Scores</h3>
      <div className="flex flex-wrap gap-3">
        <ConfidenceBadge score={0.95} />
        <ConfidenceBadge score={0.88} />
        <ConfidenceBadge score={0.75} />
        <ConfidenceBadge score={0.65} />
      </div>
      <p className="text-xs text-gray-600 mt-2">
        High (≥0.9): ✅ Green | Medium (0.7-0.89): ⚠️ Yellow | Low (&lt;0.7): ❌ Red
      </p>
    </div>
  ),
}

// ComponentForge Use Cases
export const TokenExtractionPage: Story = {
  name: 'Use Case: Token Extraction',
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Token Extraction Page Badges</h3>
      <div className="space-y-3">
        <div className="flex gap-2">
          <span className="text-sm text-gray-600">Confidence indicators:</span>
          <Badge variant="success">✅</Badge>
          <Badge variant="warning">⚠️</Badge>
        </div>
      </div>
    </div>
  ),
}

export const RequirementsPage: Story = {
  name: 'Use Case: Requirements Review',
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Requirements Page Badges</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Confidence scores:</span>
          <Badge variant="success">✅</Badge>
          <Badge variant="warning">⚠️</Badge>
          <Badge variant="error">❌</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Requirement IDs:</span>
          <Badge variant="neutral">req-001</Badge>
          <Badge variant="neutral">req-002</Badge>
          <Badge variant="neutral">req-003</Badge>
        </div>
      </div>
    </div>
  ),
}

export const PatternSelectionPage: Story = {
  name: 'Use Case: Pattern Selection',
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Pattern Selection Page Badges</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Match scores:</span>
          <Badge variant="success">0.94</Badge>
          <Badge variant="warning">0.81</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Selected indicator:</span>
          <Badge variant="info">SELECTED</Badge>
        </div>
      </div>
    </div>
  ),
}

export const ComponentPreviewPage: Story = {
  name: 'Use Case: Component Preview',
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Component Preview Page Badges</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status indicators:</span>
          <Badge variant="success">✓ Compiled successfully</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Quality checks:</span>
          <Badge variant="success">✅</Badge>
          <Badge variant="warning">⚠️</Badge>
          <Badge variant="info">ℹ️</Badge>
        </div>
      </div>
    </div>
  ),
}

export const DashboardPage: Story = {
  name: 'Use Case: Dashboard',
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Dashboard Page Badges</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Success targets:</span>
          <Badge variant="success">✅</Badge>
          <Badge variant="warning">⚠️</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Component metrics:</span>
          <Badge variant="success">94% tokens</Badge>
          <Badge variant="success">0 critical a11y</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Progress indicators:</span>
          <Badge variant="success">Complete</Badge>
          <Badge variant="info">In Progress</Badge>
          <Badge variant="neutral">Pending</Badge>
        </div>
      </div>
    </div>
  ),
}

// Accessibility Test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Accessibility Testing</h3>
      <p className="text-sm text-gray-600">
        All badges should have sufficient color contrast for WCAG AA compliance
      </p>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">✅ Success</Badge>
          <Badge variant="warning">⚠️ Warning</Badge>
          <Badge variant="error">❌ Error</Badge>
          <Badge variant="info">ℹ️ Info</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
        <p className="text-xs text-gray-500">
          Each variant maintains minimum 4.5:1 contrast ratio for text
        </p>
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
        ],
      },
    },
  },
}
