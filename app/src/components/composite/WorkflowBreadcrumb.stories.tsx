import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { WorkflowBreadcrumb } from './WorkflowBreadcrumb'
import { useWorkflowStore } from '@/stores/useWorkflowStore'
import { WorkflowStep } from '@/types'
import * as React from 'react'

const meta = {
  title: 'Composite/WorkflowBreadcrumb',
  component: WorkflowBreadcrumb,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-4xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkflowBreadcrumb>

export default meta
type Story = StoryObj<typeof meta>

// Helper component to mock workflow state
const WorkflowBreadcrumbDemo: React.FC<{
  currentStep: WorkflowStep
  completedSteps: WorkflowStep[]
}> = ({ currentStep, completedSteps }) => {
  React.useEffect(() => {
    const store = useWorkflowStore.getState()
    store.setStep(currentStep)
    
    // Clear completed steps and add the ones we want
    const resetStore = useWorkflowStore.getState().resetWorkflow
    resetStore()
    
    completedSteps.forEach(step => {
      useWorkflowStore.getState().completeStep(step)
    })
    
    useWorkflowStore.getState().setStep(currentStep)
  }, [currentStep, completedSteps])

  return <WorkflowBreadcrumb />
}

// Fresh start - only Extract accessible
export const FreshStart: Story = {
  name: 'Fresh Start - No Progress',
  render: () => (
    <WorkflowBreadcrumbDemo
      currentStep={WorkflowStep.EXTRACT}
      completedSteps={[]}
    />
  ),
}

// After completing Extract - Requirements unlocked
export const AfterExtract: Story = {
  name: 'After Extract - Requirements Unlocked',
  render: () => (
    <WorkflowBreadcrumbDemo
      currentStep={WorkflowStep.REQUIREMENTS}
      completedSteps={[WorkflowStep.EXTRACT]}
    />
  ),
}

// After completing Requirements - Patterns unlocked
export const AfterRequirements: Story = {
  name: 'After Requirements - Patterns Unlocked',
  render: () => (
    <WorkflowBreadcrumbDemo
      currentStep={WorkflowStep.PATTERNS}
      completedSteps={[WorkflowStep.EXTRACT, WorkflowStep.REQUIREMENTS]}
    />
  ),
}

// After completing Patterns - Preview unlocked
export const AfterPatterns: Story = {
  name: 'After Patterns - Preview Unlocked',
  render: () => (
    <WorkflowBreadcrumbDemo
      currentStep={WorkflowStep.PREVIEW}
      completedSteps={[WorkflowStep.EXTRACT, WorkflowStep.REQUIREMENTS, WorkflowStep.PATTERNS]}
    />
  ),
}

// Complete workflow
export const CompleteWorkflow: Story = {
  name: 'Complete Workflow - All Steps Done',
  render: () => (
    <WorkflowBreadcrumbDemo
      currentStep={WorkflowStep.PREVIEW}
      completedSteps={[
        WorkflowStep.EXTRACT,
        WorkflowStep.REQUIREMENTS,
        WorkflowStep.PATTERNS,
        WorkflowStep.PREVIEW,
      ]}
    />
  ),
}

// Interactive demo with auto-progression
export const InteractiveDemo: Story = {
  name: 'Interactive Demo - Auto-Progress',
  render: () => {
    const [stepIndex, setStepIndex] = React.useState(0)
    const steps = [
      WorkflowStep.EXTRACT,
      WorkflowStep.REQUIREMENTS,
      WorkflowStep.PATTERNS,
      WorkflowStep.PREVIEW,
    ]

    React.useEffect(() => {
      const timer = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= steps.length - 1) return 0
          return prev + 1
        })
      }, 2500)

      return () => clearInterval(timer)
    }, [])

    const currentStep = steps[stepIndex]
    const completedSteps = steps.slice(0, stepIndex)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Auto-progressing workflow</span>
          <span className="text-muted-foreground">
            Step {stepIndex + 1} of {steps.length}
          </span>
        </div>
        <WorkflowBreadcrumbDemo
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </div>
    )
  },
}

// Visual states showcase
export const VisualStatesShowcase: Story = {
  name: 'Visual States Showcase',
  render: () => (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">✅ Completed State</h3>
        <p className="text-xs text-muted-foreground mb-2">
          Steps already finished - clickable to navigate back
        </p>
        <WorkflowBreadcrumbDemo
          currentStep={WorkflowStep.PATTERNS}
          completedSteps={[WorkflowStep.EXTRACT, WorkflowStep.REQUIREMENTS]}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">🔄 Current State</h3>
        <p className="text-xs text-muted-foreground mb-2">
          Active step with spinner animation
        </p>
        <WorkflowBreadcrumbDemo
          currentStep={WorkflowStep.REQUIREMENTS}
          completedSteps={[WorkflowStep.EXTRACT]}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">🔒 Locked State</h3>
        <p className="text-xs text-muted-foreground mb-2">
          Steps blocked until prerequisites completed
        </p>
        <WorkflowBreadcrumbDemo
          currentStep={WorkflowStep.EXTRACT}
          completedSteps={[]}
        />
      </div>
    </div>
  ),
}

// Accessibility test
export const AccessibilityTest: Story = {
  name: 'Accessibility Test',
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">WorkflowBreadcrumb with ARIA attributes</h3>
        <WorkflowBreadcrumbDemo
          currentStep={WorkflowStep.REQUIREMENTS}
          completedSteps={[WorkflowStep.EXTRACT]}
        />
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Screen reader will announce:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>&ldquo;Workflow progress&rdquo; (navigation label)</li>
          <li>&ldquo;Extract&rdquo; button - completed, clickable</li>
          <li>&ldquo;Requirements&rdquo; button - current step</li>
          <li>&ldquo;Patterns (locked)&rdquo; button - disabled, aria-disabled</li>
          <li>&ldquo;Preview (locked)&rdquo; button - disabled, aria-disabled</li>
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
          {
            id: 'button-name',
            enabled: true,
          },
        ],
      },
    },
  },
}

// Mobile responsive demo
export const MobileResponsive: Story = {
  name: 'Mobile Responsive',
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Desktop View (flex-wrap enabled)</h3>
        <WorkflowBreadcrumbDemo
          currentStep={WorkflowStep.PATTERNS}
          completedSteps={[WorkflowStep.EXTRACT, WorkflowStep.REQUIREMENTS]}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        <p>On narrow screens, breadcrumb wraps to multiple lines</p>
        <p>Try resizing the viewport to see the responsive behavior</p>
      </div>
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
