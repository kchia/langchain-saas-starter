import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Skeleton, TokenSkeleton, CardSkeleton } from './skeleton'

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circle', 'rectangle'],
      description: 'The shape variant of the skeleton loader',
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', 'none'],
      description: 'The animation type for the loading effect',
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

// Text variant (default line of text)
export const Text: Story = {
  args: {
    variant: 'text',
    animation: 'pulse',
  },
  render: (args) => (
    <div className="w-[300px]">
      <Skeleton {...args} />
    </div>
  ),
}

// Circle variant (for avatars)
export const Circle: Story = {
  args: {
    variant: 'circle',
    animation: 'pulse',
  },
  render: (args) => (
    <div className="w-16 h-16">
      <Skeleton {...args} />
    </div>
  ),
}

// Rectangle variant
export const Rectangle: Story = {
  args: {
    variant: 'rectangle',
    animation: 'pulse',
  },
  render: (args) => (
    <div className="w-[300px]">
      <Skeleton {...args} className="h-24" />
    </div>
  ),
}

// Pulse animation (default)
export const PulseAnimation: Story = {
  args: {
    variant: 'rectangle',
    animation: 'pulse',
  },
  render: (args) => (
    <div className="w-[300px]">
      <Skeleton {...args} className="h-12" />
    </div>
  ),
}

// Wave animation
export const WaveAnimation: Story = {
  args: {
    variant: 'rectangle',
    animation: 'wave',
  },
  render: (args) => (
    <div className="w-[300px]">
      <Skeleton {...args} className="h-12" />
    </div>
  ),
}

// No animation
export const NoAnimation: Story = {
  args: {
    variant: 'rectangle',
    animation: 'none',
  },
  render: (args) => (
    <div className="w-[300px]">
      <Skeleton {...args} className="h-12" />
    </div>
  ),
}

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 w-[400px]">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Variants</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Text</p>
            <Skeleton variant="text" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Circle</p>
            <div className="w-12 h-12">
              <Skeleton variant="circle" />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Rectangle</p>
            <Skeleton variant="rectangle" className="h-20" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Animations</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pulse (default)</p>
            <Skeleton variant="rectangle" animation="pulse" className="h-12" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Wave</p>
            <Skeleton variant="rectangle" animation="wave" className="h-12" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">None</p>
            <Skeleton variant="rectangle" animation="none" className="h-12" />
          </div>
        </div>
      </div>
    </div>
  ),
}

// Token Skeleton preset
export const TokenSkeletonPreset: Story = {
  name: 'Preset: Token Skeleton',
  render: () => (
    <div className="w-[400px]">
      <TokenSkeleton />
    </div>
  ),
}

// Card Skeleton preset
export const CardSkeletonPreset: Story = {
  name: 'Preset: Card Skeleton',
  render: () => (
    <div className="w-[400px]">
      <CardSkeleton />
    </div>
  ),
}

// ComponentForge Use Cases
export const TokenExtractionPage: Story = {
  name: 'Use Case: Token Extraction Loading',
  render: () => (
    <div className="space-y-4 w-[600px]">
      <h3 className="text-sm font-semibold">Token Extraction - Loading Results</h3>
      <p className="text-sm text-muted-foreground">
        Loading skeleton for token extraction results while processing screenshot
      </p>
      <div className="border border-border rounded-lg p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8">
              <Skeleton variant="circle" />
            </div>
            <Skeleton variant="text" className="flex-1" />
          </div>
          <Skeleton variant="rectangle" className="h-12" />
          <Skeleton variant="rectangle" className="h-12" />
          <Skeleton variant="rectangle" className="h-12" />
        </div>
      </div>
    </div>
  ),
}

export const ComponentsListLoading: Story = {
  name: 'Use Case: Components List Loading',
  render: () => (
    <div className="space-y-4 w-[600px]">
      <h3 className="text-sm font-semibold">Dashboard - Loading Components</h3>
      <p className="text-sm text-muted-foreground">
        Loading skeleton for component list on dashboard
      </p>
      <div className="space-y-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  ),
}

// Complex Loading Pattern
export const ComplexLoadingPattern: Story = {
  render: () => (
    <div className="w-[600px] space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Component Preview Loading</h3>
        <div className="border border-border rounded-lg p-6 space-y-4">
          {/* Header with avatar and title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12">
              <Skeleton variant="circle" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="w-1/3" />
              <Skeleton variant="text" className="w-1/4" />
            </div>
          </div>
          
          {/* Content area */}
          <div className="space-y-2">
            <Skeleton variant="text" className="w-full" />
            <Skeleton variant="text" className="w-5/6" />
            <Skeleton variant="text" className="w-4/6" />
          </div>

          {/* Image/Preview area */}
          <Skeleton variant="rectangle" className="h-48" />

          {/* Actions */}
          <div className="flex gap-2">
            <Skeleton variant="rectangle" className="h-10 w-24" />
            <Skeleton variant="rectangle" className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  ),
}

// Dark Mode Support
export const DarkMode: Story = {
  name: 'Dark Mode Support',
  render: () => (
    <div className="space-y-6">
      <div className="p-6 bg-background rounded-lg space-y-4">
        <h3 className="text-sm font-medium">Light Mode</h3>
        <Skeleton variant="text" />
        <Skeleton variant="rectangle" className="h-12" />
        <div className="w-12 h-12">
          <Skeleton variant="circle" />
        </div>
      </div>
      <div className="p-6 bg-background rounded-lg space-y-4 dark">
        <h3 className="text-sm font-medium">Dark Mode</h3>
        <Skeleton variant="text" />
        <Skeleton variant="rectangle" className="h-12" />
        <div className="w-12 h-12">
          <Skeleton variant="circle" />
        </div>
      </div>
    </div>
  ),
}

// Accessibility Test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4 w-[500px]">
      <h3 className="text-sm font-semibold">Screen Reader Support</h3>
      <p className="text-sm text-muted-foreground">
        Each skeleton has role=&quot;status&quot;, aria-busy=&quot;true&quot;, and screen reader text &quot;Loading...&quot;
      </p>
      <div className="space-y-3 border border-border rounded-lg p-6">
        <Skeleton variant="text" />
        <Skeleton variant="rectangle" className="h-12" />
        <div className="w-12 h-12">
          <Skeleton variant="circle" />
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        <p>✓ role=&quot;status&quot; for screen readers</p>
        <p>✓ aria-busy=&quot;true&quot; indicates loading state</p>
        <p>✓ aria-live=&quot;polite&quot; for dynamic updates</p>
        <p>✓ Hidden text &quot;Loading...&quot; for screen readers</p>
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'aria-allowed-attr',
            enabled: true,
          },
          {
            id: 'aria-valid-attr',
            enabled: true,
          },
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
}
