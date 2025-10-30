import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Alert, AlertTitle, AlertDescription } from './alert'

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'The visual style variant of the alert',
    },
    dismissible: {
      control: 'boolean',
      description: 'Whether the alert can be dismissed',
    },
    onDismiss: {
      action: 'dismissed',
      description: 'Callback fired when alert is dismissed',
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

// Default variant
export const Default: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the cli.
        </AlertDescription>
      </>
    ),
  },
}

// Info variant (blue) - most common in wireframes
export const Info: Story = {
  args: {
    variant: 'info',
    children: (
      <>
        <AlertTitle>🤖 AI Analysis Complete</AlertTitle>
        <AlertDescription>Completed in 12s</AlertDescription>
      </>
    ),
  },
}

// Success variant (green)
export const Success: Story = {
  args: {
    variant: 'success',
    children: (
      <>
        <AlertTitle>Component Generated Successfully</AlertTitle>
        <AlertDescription>
          Your component has been generated and is ready to use.
        </AlertDescription>
      </>
    ),
  },
}

// Warning variant (yellow)
export const Warning: Story = {
  args: {
    variant: 'warning',
    children: (
      <>
        <AlertTitle>Low Confidence Detected</AlertTitle>
        <AlertDescription>
          Some requirements have confidence scores below 0.75. Review them carefully.
        </AlertDescription>
      </>
    ),
  },
}

// Error variant (red)
export const Error: Story = {
  args: {
    variant: 'error',
    children: (
      <>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to extract tokens from screenshot. Please try again.
        </AlertDescription>
      </>
    ),
  },
}

// Dismissible alert
export const Dismissible: Story = {
  args: {
    variant: 'info',
    dismissible: true,
    children: (
      <>
        <AlertTitle>Extraction in progress</AlertTitle>
        <AlertDescription>
          Analyzing screenshot and extracting design tokens...
        </AlertDescription>
      </>
    ),
  },
}

// Title only
export const TitleOnly: Story = {
  args: {
    variant: 'success',
    children: <AlertTitle>✅ All requirements accepted</AlertTitle>,
  },
}

// Description only
export const DescriptionOnly: Story = {
  args: {
    variant: 'info',
    children: (
      <AlertDescription>
        This component uses the shadcn/ui design system.
      </AlertDescription>
    ),
  },
}

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-[600px]">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Alert Variants</h3>
        
        <Alert variant="default">
          <AlertTitle>Default Alert</AlertTitle>
          <AlertDescription>This is a default alert message.</AlertDescription>
        </Alert>
        
        <Alert variant="info">
          <AlertTitle>🤖 AI Analysis Complete</AlertTitle>
          <AlertDescription>Completed in 12s</AlertDescription>
        </Alert>
        
        <Alert variant="success">
          <AlertTitle>Component Generated Successfully</AlertTitle>
          <AlertDescription>Your component is ready to use.</AlertDescription>
        </Alert>
        
        <Alert variant="warning">
          <AlertTitle>Low Confidence Detected</AlertTitle>
          <AlertDescription>Review requirements with scores below 0.75.</AlertDescription>
        </Alert>
        
        <Alert variant="error">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to extract tokens. Please try again.</AlertDescription>
        </Alert>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Dismissible Alerts</h3>
        
        <Alert variant="info" dismissible>
          <AlertTitle>Extraction in progress</AlertTitle>
          <AlertDescription>Analyzing screenshot...</AlertDescription>
        </Alert>
        
        <Alert variant="success" dismissible>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>This alert can be dismissed.</AlertDescription>
        </Alert>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Content Variations</h3>
        
        <Alert variant="info">
          <AlertTitle>Title only alert</AlertTitle>
        </Alert>
        
        <Alert variant="warning">
          <AlertDescription>Description only alert without a title.</AlertDescription>
        </Alert>
      </div>
    </div>
  ),
}

// ComponentForge Use Cases
export const RequirementsPage: Story = {
  render: () => (
    <div className="space-y-4 w-[600px]">
      <h3 className="text-sm font-semibold">Requirements Page Alerts</h3>
      <div className="space-y-3">
        <Alert variant="info">
          <AlertTitle>🤖 AI Analysis Complete</AlertTitle>
          <AlertDescription>
            Extracted 24 requirements in 12s. Review confidence scores below.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  ),
}

export const TokenExtractionPage: Story = {
  name: 'Use Case: Token Extraction',
  render: () => (
    <div className="space-y-4 w-[600px]">
      <h3 className="text-sm font-semibold">Token Extraction Page Alerts</h3>
      <div className="space-y-3">
        <Alert variant="info">
          <AlertTitle>Extraction in progress</AlertTitle>
          <AlertDescription>
            Analyzing screenshot and extracting design tokens...
          </AlertDescription>
        </Alert>
        
        <Alert variant="success" dismissible>
          <AlertTitle>Tokens Extracted Successfully</AlertTitle>
          <AlertDescription>
            Found 47 design tokens including colors, typography, and spacing.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  ),
}

export const ComponentPreview: Story = {
  name: 'Use Case: Component Preview',
  render: () => (
    <div className="space-y-4 w-[600px]">
      <h3 className="text-sm font-semibold">Component Preview Page Alerts</h3>
      <div className="space-y-3">
        <Alert variant="info">
          <AlertTitle>Generation metadata</AlertTitle>
          <AlertDescription>
            Component generated from pattern &quot;shadcn-button-v1&quot; with 95% confidence match.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  ),
}

// Accessibility Test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4 w-[600px]">
      <h3 className="text-sm font-semibold">Accessibility Features</h3>
      <p className="text-sm text-gray-600">
        All alerts have role=&quot;alert&quot; and aria-live=&quot;polite&quot; for screen readers.
        Dismissible alerts have aria-label on close button.
      </p>
      <div className="space-y-3">
        <Alert variant="info">
          <AlertTitle>Screen Reader Announcement</AlertTitle>
          <AlertDescription>
            This alert will be announced to screen reader users.
          </AlertDescription>
        </Alert>
        
        <Alert variant="warning" dismissible>
          <AlertTitle>Dismissible Alert</AlertTitle>
          <AlertDescription>
            The close button has proper aria-label and keyboard focus.
          </AlertDescription>
        </Alert>
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
            id: 'aria-allowed-attr',
            enabled: true,
          },
          {
            id: 'aria-valid-attr-value',
            enabled: true,
          },
        ],
      },
    },
  },
}
