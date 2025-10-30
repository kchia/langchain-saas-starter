import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from './card'
import { Button } from './button'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated', 'interactive'],
      description: 'The visual style variant of the card',
    },
    padding: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The padding size of the card content',
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

// Default card
export const Default: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the default card variant with standard styling.</p>
        </CardContent>
      </>
    ),
  },
}

// Outlined card
export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: (
      <>
        <CardHeader>
          <CardTitle>Token Details</CardTitle>
          <CardDescription>Color, Typography, and Spacing sections</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Outlined cards are used for token extraction, requirements, and pattern selection.</p>
        </CardContent>
      </>
    ),
  },
}

// Elevated card with shadow
export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <CardHeader>
          <CardTitle>Metric Card</CardTitle>
          <CardDescription>Dashboard metrics display</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Components Generated</p>
            <p className="text-sm text-success">+25% this week</p>
          </div>
        </CardContent>
      </>
    ),
  },
}

// Interactive card with hover effects
export const Interactive: Story = {
  args: {
    variant: 'interactive',
    onClick: () => alert('Card clicked!'),
    children: (
      <>
        <CardHeader>
          <CardTitle>Pattern Match Card</CardTitle>
          <CardDescription>Click to select this pattern</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Interactive cards respond to clicks and keyboard navigation.</p>
        </CardContent>
      </>
    ),
  },
}

// Small padding
export const SmallPadding: Story = {
  args: {
    variant: 'outlined',
    children: (
      <>
        <CardHeader padding="sm">
          <CardTitle>Small Padding</CardTitle>
          <CardDescription>Compact layout</CardDescription>
        </CardHeader>
        <CardContent padding="sm">
          <p>This card uses smaller padding for compact layouts.</p>
        </CardContent>
      </>
    ),
  },
}

// Large padding
export const LargePadding: Story = {
  args: {
    variant: 'outlined',
    children: (
      <>
        <CardHeader padding="lg">
          <CardTitle>Large Padding</CardTitle>
          <CardDescription>Spacious layout</CardDescription>
        </CardHeader>
        <CardContent padding="lg">
          <p>This card uses larger padding for more breathing room.</p>
        </CardContent>
      </>
    ),
  },
}

// Card with footer
export const WithFooter: Story = {
  args: {
    variant: 'outlined',
    children: (
      <>
        <CardHeader>
          <CardTitle>Requirement Card</CardTitle>
          <CardDescription>req-001</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This requirement needs review and approval.</p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="success" size="sm">
            ✓ Accept
          </Button>
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            ✗ Remove
          </Button>
        </CardFooter>
      </>
    ),
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 w-[400px]">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Variants</h3>
        <div className="space-y-4">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Default card variant</p>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Outlined</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Outlined card with border</p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Elevated card with shadow</p>
            </CardContent>
          </Card>

          <Card variant="interactive" onClick={() => {}}>
            <CardHeader>
              <CardTitle>Interactive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Interactive card with hover effects (click me)</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Padding Options</h3>
        <div className="space-y-4">
          <Card variant="outlined">
            <CardHeader padding="sm">
              <CardTitle>Small Padding</CardTitle>
            </CardHeader>
            <CardContent padding="sm">
              <p className="text-sm">Compact layout</p>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader padding="md">
              <CardTitle>Medium Padding (Default)</CardTitle>
            </CardHeader>
            <CardContent padding="md">
              <p className="text-sm">Standard layout</p>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader padding="lg">
              <CardTitle>Large Padding</CardTitle>
            </CardHeader>
            <CardContent padding="lg">
              <p className="text-sm">Spacious layout</p>
            </CardContent>
          </Card>
        </div>
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
        Tab through interactive cards, press Enter/Space to activate
      </p>
      <div className="space-y-3">
        <Card variant="interactive" onClick={() => alert('First card clicked')}>
          <CardContent>
            <p className="text-sm font-medium">First Interactive Card</p>
            <p className="text-xs text-muted-foreground">Press Enter or Space to activate</p>
          </CardContent>
        </Card>

        <Card variant="interactive" onClick={() => alert('Second card clicked')}>
          <CardContent>
            <p className="text-sm font-medium">Second Interactive Card</p>
            <p className="text-xs text-muted-foreground">Keyboard accessible</p>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <p className="text-sm font-medium">Non-Interactive Card</p>
            <p className="text-xs text-muted-foreground">Not focusable (as expected)</p>
          </CardContent>
        </Card>
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
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
          {
            id: 'interactive-element-affordance',
            enabled: true,
          },
        ],
      },
    },
  },
}

// Dashboard Metrics Example
export const DashboardMetrics: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[600px]">
      <Card variant="elevated" className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Components</p>
          <p className="text-3xl font-bold mb-2">12</p>
          <p className="text-sm text-success">+25%</p>
          <p className="text-xs text-muted-foreground">+3 this week</p>
        </CardContent>
      </Card>

      <Card variant="elevated" className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Avg Generation Time</p>
          <p className="text-3xl font-bold mb-2">48s</p>
          <p className="text-sm text-success">-12%</p>
          <p className="text-xs text-muted-foreground">Faster than last week</p>
        </CardContent>
      </Card>

      <Card variant="elevated" className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Cache Hit Rate</p>
          <p className="text-3xl font-bold mb-2">78%</p>
          <p className="text-sm text-success">+5%</p>
          <p className="text-xs text-muted-foreground">Improved efficiency</p>
        </CardContent>
      </Card>

      <Card variant="elevated" className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
          <p className="text-3xl font-bold mb-2">94%</p>
          <p className="text-sm text-success">+2%</p>
          <p className="text-xs text-muted-foreground">Quality improved</p>
        </CardContent>
      </Card>
    </div>
  ),
}
