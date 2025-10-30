import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Progress } from './progress'
import * as React from 'react'

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
      description: 'The color variant of the progress bar',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size/height of the progress bar',
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'The progress value (0-100)',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Whether to show indeterminate/loading state',
    },
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

// Basic variants
export const Default: Story = {
  args: {
    value: 60,
    variant: 'default',
  },
}

export const Success: Story = {
  args: {
    value: 94,
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    value: 75,
    variant: 'warning',
  },
}

export const Error: Story = {
  args: {
    value: 30,
    variant: 'error',
  },
}

// Sizes
export const Small: Story = {
  args: {
    value: 60,
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    value: 60,
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    value: 60,
    size: 'lg',
  },
}

// Indeterminate state
export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    variant: 'default',
  },
}

export const IndeterminateSuccess: Story = {
  args: {
    indeterminate: true,
    variant: 'success',
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Variants (60% complete)</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Default (Blue)</div>
            <Progress value={60} variant="default" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Success (Green)</div>
            <Progress value={60} variant="success" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Warning (Yellow)</div>
            <Progress value={60} variant="warning" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Error (Red)</div>
            <Progress value={60} variant="error" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Sizes</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Small</div>
            <Progress value={60} size="sm" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Medium (Default)</div>
            <Progress value={60} size="md" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Large</div>
            <Progress value={60} size="lg" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Indeterminate States</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Loading (Default)</div>
            <Progress indeterminate variant="default" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Processing (Success)</div>
            <Progress indeterminate variant="success" />
          </div>
        </div>
      </div>
    </div>
  ),
}

// ComponentForge Use Cases
export const TokenExtraction: Story = {
  name: 'Use Case: Token Extraction (60%)',
  render: () => (
    <div className="space-y-2 max-w-md">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Extracting design tokens...</span>
        <span className="text-muted-foreground">60%</span>
      </div>
      <Progress value={60} variant="default" />
    </div>
  ),
}

export const ComponentPreview: Story = {
  name: 'Use Case: Token Adherence Meters',
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Color:</span>
          <span className="text-success">94% ✓</span>
        </div>
        <Progress value={94} variant="success" />
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>• Primary: #3B82F6 (exact match)</li>
          <li>• Background: #FFFFFF (exact match)</li>
        </ul>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Typography:</span>
          <span className="text-success">92% ✓</span>
        </div>
        <Progress value={92} variant="success" />
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>• Font: Inter (exact match)</li>
          <li>• Size: 16px (exact match)</li>
          <li>• Weight: 500 (exact match)</li>
        </ul>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Spacing:</span>
          <span className="text-success">96% ✓</span>
        </div>
        <Progress value={96} variant="success" />
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>• Padding: 16px (exact match)</li>
          <li>• Gap: 8px (exact match)</li>
        </ul>
      </div>
    </div>
  ),
}

export const DashboardMetrics: Story = {
  name: 'Use Case: Dashboard Cache Hit Rate',
  render: () => (
    <div className="space-y-2 max-w-md">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Cache Hit Rate</span>
        <span className="text-success">78%</span>
      </div>
      <Progress value={78} variant="success" />
      <p className="text-xs text-muted-foreground">
        Excellent caching performance this week
      </p>
    </div>
  ),
}

// ProgressWithStages Stories
type StagesStory = StoryObj<typeof meta>

export const WithStagesStage0: StagesStory = {
  args: {
    stages: ['Upload Screenshot', 'Extract Tokens', 'Generate Component', 'Export Code'],
    currentStage: 0,
  },
}

export const WithStagesStage1: StagesStory = {
  args: {
    stages: ['Upload Screenshot', 'Extract Tokens', 'Generate Component', 'Export Code'],
    currentStage: 1,
  },
}

export const WithStagesStage2: StagesStory = {
  args: {
    stages: ['Upload Screenshot', 'Extract Tokens', 'Generate Component', 'Export Code'],
    currentStage: 2,
  },
}

export const WithStagesComplete: StagesStory = {
  args: {
    stages: ['Upload Screenshot', 'Extract Tokens', 'Generate Component', 'Export Code'],
    currentStage: 3,
  },
}

export const WithStagesSuccess: StagesStory = {
  args: {
    stages: ['Analyze Design', 'Match Patterns', 'Generate Code'],
    currentStage: 1,
    variant: 'success',
  },
}

// Accessibility Test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <h3 className="text-sm font-semibold">Progress with ARIA attributes</h3>
      <div className="space-y-2">
        <label htmlFor="progress-1" className="text-sm">
          Loading progress:
        </label>
        <Progress
          id="progress-1"
          value={65}
          aria-label="Loading progress"
          aria-valuenow={65}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Screen readers will announce: &ldquo;Loading progress, 65 percent&rdquo;
      </p>
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
            id: 'aria-roles',
            enabled: true,
          },
        ],
      },
    },
  },
}

// Interactive progress demo
export const InteractiveDemo: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0
          return prev + 1
        })
      }, 50)

      return () => clearInterval(timer)
    }, [])

    return (
      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Auto-incrementing Progress</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} variant={
            progress < 33 ? 'error' : progress < 66 ? 'warning' : 'success'
          } />
        </div>
      </div>
    )
  },
}
