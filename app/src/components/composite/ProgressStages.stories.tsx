import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProgressStages } from './ProgressStages'
import * as React from 'react'

const meta = {
  title: 'Composite/ProgressStages',
  component: ProgressStages,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    stages: {
      control: 'object',
      description: 'Array of stage names to display',
    },
    currentStage: {
      control: { type: 'number', min: 0, max: 3 },
      description: 'Current stage index (0-based)',
    },
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
    ariaLabel: {
      control: 'text',
      description: 'ARIA label for accessibility',
    },
  },
} satisfies Meta<typeof ProgressStages>

export default meta
type Story = StoryObj<typeof meta>

// Basic stages - First stage
export const Stage0: Story = {
  name: 'Stage 1 - Upload Screenshot',
  args: {
    stages: ['Upload Screenshot', 'Extract Tokens', 'Generate Component', 'Export Code'],
    currentStage: 0,
  },
}

// Second stage
export const Stage1: Story = {
  name: 'Stage 2 - Extract Tokens',
  args: {
    stages: ['Upload Screenshot', 'Extract Tokens', 'Generate Component', 'Export Code'],
    currentStage: 1,
  },
}

// Third stage
export const Stage2: Story = {
  name: 'Stage 3 - Generate Component',
  args: {
    stages: ['Upload Screenshot', 'Extract Tokens', 'Generate Component', 'Export Code'],
    currentStage: 2,
  },
}

// Final stage
export const Stage3Complete: Story = {
  name: 'Stage 4 - Export Code (Complete)',
  args: {
    stages: ['Upload Screenshot', 'Extract Tokens', 'Generate Component', 'Export Code'],
    currentStage: 3,
  },
}

// Variant examples
export const SuccessVariant: Story = {
  name: 'Success Variant',
  args: {
    stages: ['Analyze Design', 'Match Patterns', 'Generate Code'],
    currentStage: 1,
    variant: 'success',
  },
}

export const WarningVariant: Story = {
  name: 'Warning Variant',
  args: {
    stages: ['Validate Input', 'Process Data', 'Generate Output'],
    currentStage: 1,
    variant: 'warning',
  },
}

export const ErrorVariant: Story = {
  name: 'Error Variant',
  args: {
    stages: ['Connect to API', 'Fetch Data', 'Render Results'],
    currentStage: 0,
    variant: 'error',
  },
}

// Size variants
export const SmallSize: Story = {
  name: 'Small Size',
  args: {
    stages: ['Step 1', 'Step 2', 'Step 3'],
    currentStage: 1,
    size: 'sm',
  },
}

export const LargeSize: Story = {
  name: 'Large Size',
  args: {
    stages: ['Step 1', 'Step 2', 'Step 3'],
    currentStage: 1,
    size: 'lg',
  },
}

// Use case: Token extraction
export const TokenExtractionFlow: Story = {
  name: 'Use Case: Token Extraction',
  args: {
    stages: [
      'Image validated',
      'GPT-4V analyzing',
      'Detecting spacing',
      'Extracting colors',
    ],
    currentStage: 2,
    variant: 'default',
  },
}

// Use case: Component generation
export const ComponentGenerationFlow: Story = {
  name: 'Use Case: Component Generation',
  args: {
    stages: [
      'Requirements gathered',
      'Matching patterns',
      'Generating code',
      'Running tests',
    ],
    currentStage: 2,
    variant: 'success',
  },
}

// Accessibility Test
export const AccessibilityTest: Story = {
  name: 'Accessibility Test',
  render: () => (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">ProgressStages with ARIA attributes</h3>
        <ProgressStages
          stages={['Upload Screenshot', 'Extract Tokens', 'Generate Component', 'Export Code']}
          currentStage={1}
          ariaLabel="Component generation progress"
        />
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Screen reader will announce:</p>
        <ul className="list-disc list-inside">
          <li>&ldquo;Progress stages&rdquo; (group label)</li>
          <li>&ldquo;Progress: 2 of 4 stages complete, 50 percent&rdquo;</li>
          <li>&ldquo;Stage list&rdquo; with items marked as completed, in progress, or pending</li>
        </ul>
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
            id: 'aria-roles',
            enabled: true,
          },
        ],
      },
    },
  },
}

// Interactive demo with auto-progression
export const InteractiveDemo: Story = {
  name: 'Interactive Demo',
  render: () => {
    const [currentStage, setCurrentStage] = React.useState(0)
    const stages = ['Upload Screenshot', 'Extract Tokens', 'Generate Component', 'Export Code']

    React.useEffect(() => {
      const timer = setInterval(() => {
        setCurrentStage((prev) => {
          if (prev >= stages.length - 1) return 0
          return prev + 1
        })
      }, 2000)

      return () => clearInterval(timer)
    }, [])

    return (
      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Auto-progressing stages</span>
            <span className="text-muted-foreground">
              Stage {currentStage + 1} of {stages.length}
            </span>
          </div>
          <ProgressStages
            stages={stages}
            currentStage={currentStage}
            variant={currentStage === stages.length - 1 ? 'success' : 'default'}
          />
        </div>
      </div>
    )
  },
}

// All variants showcase
export const AllVariants: Story = {
  name: 'All Variants Showcase',
  render: () => (
    <div className="space-y-8 max-w-md">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Default Variant</h3>
        <ProgressStages
          stages={['Step 1', 'Step 2', 'Step 3', 'Step 4']}
          currentStage={1}
          variant="default"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Success Variant</h3>
        <ProgressStages
          stages={['Step 1', 'Step 2', 'Step 3', 'Step 4']}
          currentStage={2}
          variant="success"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Warning Variant</h3>
        <ProgressStages
          stages={['Step 1', 'Step 2', 'Step 3', 'Step 4']}
          currentStage={1}
          variant="warning"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Error Variant</h3>
        <ProgressStages
          stages={['Step 1', 'Step 2', 'Step 3', 'Step 4']}
          currentStage={0}
          variant="error"
        />
      </div>
    </div>
  ),
}
