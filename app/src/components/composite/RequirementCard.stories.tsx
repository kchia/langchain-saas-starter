import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RequirementCard } from './RequirementCard'

const meta = {
  title: 'Composite/RequirementCard',
  component: RequirementCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    id: {
      control: 'text',
      description: 'Unique identifier for the requirement',
    },
    name: {
      control: 'text',
      description: 'Name/title of the requirement',
    },
    type: {
      control: 'text',
      description: 'Type of the requirement (e.g., Boolean, String, Number)',
    },
    confidence: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Confidence score from 0 to 1',
    },
    category: {
      control: 'select',
      options: ['Props', 'Events', 'States', 'Accessibility'],
      description: 'Category of the requirement',
    },
    rationale: {
      control: 'text',
      description: 'Rationale explaining why this requirement was identified',
    },
    values: {
      control: 'object',
      description: 'Possible values for this requirement',
    },
  },
  args: {
    onAccept: () => console.log('Accept clicked'),
    onEdit: () => console.log('Edit clicked'),
    onRemove: () => console.log('Remove clicked'),
  },
} satisfies Meta<typeof RequirementCard>

export default meta
type Story = StoryObj<typeof meta>

// High confidence requirement (auto-accept)
export const HighConfidence: Story = {
  args: {
    id: 'req-001',
    name: 'disabled',
    type: 'Boolean',
    confidence: 0.95,
    rationale:
      'This prop is commonly used to disable interactive elements like buttons and inputs. Found in wireframes showing disabled state variations.',
    values: ['true', 'false'],
    category: 'Props',
  },
}

// Medium confidence requirement (review)
export const MediumConfidence: Story = {
  args: {
    id: 'req-006',
    name: 'hover state',
    type: 'Boolean',
    confidence: 0.78,
    rationale:
      'Hover interactions are visible in the wireframes for interactive cards and buttons. This indicates a need for hover state handling.',
    values: ['true', 'false'],
    category: 'States',
  },
}

// Low confidence requirement (needs review)
export const LowConfidence: Story = {
  args: {
    id: 'req-015',
    name: 'customTheme',
    type: 'Object',
    confidence: 0.65,
    rationale:
      'Some design tokens suggest customization capability, but this is inferred rather than explicitly shown in wireframes.',
    values: undefined,
    category: 'Props',
  },
}

// Events category
export const EventRequirement: Story = {
  args: {
    id: 'req-012',
    name: 'onClick',
    type: 'Function',
    confidence: 0.92,
    rationale:
      'Multiple interactive elements in wireframes (buttons, cards) require click handlers for navigation and actions.',
    values: undefined,
    category: 'Events',
  },
}

// Accessibility category
export const AccessibilityRequirement: Story = {
  args: {
    id: 'req-018',
    name: 'aria-label',
    type: 'String',
    confidence: 0.88,
    rationale:
      'Icons and icon-only buttons throughout the UI need accessible labels for screen readers to ensure WCAG compliance.',
    values: undefined,
    category: 'Accessibility',
  },
}

// String type with multiple values
export const StringWithValues: Story = {
  args: {
    id: 'req-003',
    name: 'variant',
    type: 'String',
    confidence: 0.94,
    rationale:
      'Wireframes show multiple visual variants for buttons (primary, secondary, ghost) and cards (outlined, elevated), indicating a variant prop is needed.',
    values: ['primary', 'secondary', 'ghost', 'outline', 'destructive'],
    category: 'Props',
  },
}

// Long rationale text
export const LongRationale: Story = {
  args: {
    id: 'req-024',
    name: 'tokenAdherence',
    type: 'Number',
    confidence: 0.82,
    rationale:
      'The Dashboard wireframe displays a "Token Adherence" metric (e.g., "92%") for each component row. This metric measures how closely the generated component follows the extracted design tokens (colors, typography, spacing). The percentage is calculated by comparing actual token usage against expected values from the Figma design. A high percentage indicates strong fidelity to the design system, while a lower percentage suggests deviations that may need review. This metric is crucial for ensuring design consistency across generated components.',
    values: undefined,
    category: 'Props',
  },
}

// Without action buttons
export const WithoutActions: Story = {
  args: {
    id: 'req-007',
    name: 'size',
    type: 'String',
    confidence: 0.91,
    rationale:
      'Wireframes show components in different sizes (small buttons, large buttons, etc.), requiring a size prop for flexibility.',
    values: ['sm', 'md', 'lg'],
    category: 'Props',
    onAccept: undefined,
    onEdit: undefined,
    onRemove: undefined,
  },
}

// Requirements Review page use case
export const RequirementsReviewPage: Story = {
  name: 'Use Case: Requirements Review',
  render: () => (
    <div className="space-y-4 max-w-3xl p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Requirements Review</h2>
        <p className="text-sm text-muted-foreground">
          Review and validate AI-extracted component requirements
        </p>
      </div>

      <div className="space-y-4">
        <RequirementCard
          id="req-001"
          name="disabled"
          type="Boolean"
          confidence={0.95}
          rationale="This prop is commonly used to disable interactive elements."
          values={['true', 'false']}
          category="Props"
          onAccept={() => console.log('Accept clicked')}
          onEdit={() => console.log('Edit clicked')}
          onRemove={() => console.log('Remove clicked')}
        />
        <RequirementCard
          id="req-006"
          name="hover state"
          type="Boolean"
          confidence={0.78}
          rationale="Hover interactions are visible in the wireframes for interactive cards and buttons."
          values={['true', 'false']}
          category="States"
          onAccept={() => console.log('Accept clicked')}
          onEdit={() => console.log('Edit clicked')}
          onRemove={() => console.log('Remove clicked')}
        />
        <RequirementCard
          id="req-012"
          name="onClick"
          type="Function"
          confidence={0.92}
          rationale="Multiple interactive elements require click handlers for navigation and actions."
          values={undefined}
          category="Events"
          onAccept={() => console.log('Accept clicked')}
          onEdit={() => console.log('Edit clicked')}
          onRemove={() => console.log('Remove clicked')}
        />
      </div>
    </div>
  ),
}

// Accessibility test
export const AccessibilityTest: Story = {
  args: {
    id: 'req-001',
    name: 'disabled',
    type: 'Boolean',
    confidence: 0.95,
    rationale:
      'This prop is commonly used to disable interactive elements like buttons and inputs.',
    values: ['true', 'false'],
    category: 'Props',
  },
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
            id: 'aria-valid-attr-value',
            enabled: true,
          },
          {
            id: 'heading-order',
            enabled: true,
          },
        ],
      },
    },
  },
}

// All confidence levels showcase
export const AllConfidenceLevels: Story = {
  name: 'All Confidence Levels',
  render: () => (
    <div className="space-y-4 max-w-3xl p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">High Confidence (≥0.9)</h3>
        <p className="text-sm text-muted-foreground">Auto-accept eligible</p>
      </div>
      <RequirementCard
        id="req-001"
        name="disabled"
        type="Boolean"
        confidence={0.95}
        rationale="Commonly used prop for interactive elements."
        values={['true', 'false']}
        category="Props"
        onAccept={() => console.log('Accept clicked')}
        onEdit={() => console.log('Edit clicked')}
        onRemove={() => console.log('Remove clicked')}
      />

      <div className="space-y-2 pt-4">
        <h3 className="text-lg font-semibold">Medium Confidence (0.7-0.9)</h3>
        <p className="text-sm text-muted-foreground">Requires review</p>
      </div>
      <RequirementCard
        id="req-006"
        name="hover state"
        type="Boolean"
        confidence={0.78}
        rationale="Hover interactions visible in wireframes."
        values={['true', 'false']}
        category="States"
        onAccept={() => console.log('Accept clicked')}
        onEdit={() => console.log('Edit clicked')}
        onRemove={() => console.log('Remove clicked')}
      />

      <div className="space-y-2 pt-4">
        <h3 className="text-lg font-semibold">Low Confidence (&lt;0.7)</h3>
        <p className="text-sm text-muted-foreground">Needs careful review</p>
      </div>
      <RequirementCard
        id="req-015"
        name="customTheme"
        type="Object"
        confidence={0.65}
        rationale="Inferred from design tokens, not explicitly shown."
        values={undefined}
        category="Props"
        onAccept={() => console.log('Accept clicked')}
        onEdit={() => console.log('Edit clicked')}
        onRemove={() => console.log('Remove clicked')}
      />
    </div>
  ),
}
