import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PatternCard } from './PatternCard'

const meta = {
  title: 'Composite/PatternCard',
  component: PatternCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    patternId: {
      control: 'text',
      description: 'Unique identifier for the pattern',
    },
    name: {
      control: 'text',
      description: 'Name of the pattern',
    },
    version: {
      control: 'text',
      description: 'Version of the pattern',
    },
    matchScore: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Match score (0-1) indicating how well the pattern matches',
    },
    selected: {
      control: 'boolean',
      description: 'Whether this pattern is currently selected',
    },
  },
  args: {
    onSelect: () => console.log('Pattern selected'),
    onPreview: () => console.log('Preview requested'),
  },
} satisfies Meta<typeof PatternCard>

export default meta
type Story = StoryObj<typeof meta>

// High match score pattern (success)
export const HighMatchScore: Story = {
  args: {
    patternId: 'pattern-001',
    name: 'Button Component',
    version: '2.1.0',
    matchScore: 0.94,
    metadata: {
      description: 'A fully accessible button component with multiple variants and sizes',
      author: 'shadcn',
      tags: ['button', 'interactive', 'accessible'],
    },
    selected: false,
  },
}

// Medium match score pattern (warning)
export const MediumMatchScore: Story = {
  args: {
    patternId: 'pattern-002',
    name: 'Card Component',
    version: '1.5.2',
    matchScore: 0.81,
    metadata: {
      description: 'A versatile card component for displaying grouped content',
      author: 'Radix UI',
      tags: ['card', 'container', 'layout'],
    },
    selected: false,
  },
}

// Low match score pattern (error)
export const LowMatchScore: Story = {
  args: {
    patternId: 'pattern-003',
    name: 'Modal Dialog',
    version: '3.0.1',
    matchScore: 0.65,
    metadata: {
      description: 'A modal dialog component for displaying overlay content',
      author: 'Headless UI',
      tags: ['modal', 'dialog', 'overlay'],
    },
    selected: false,
  },
}

// Selected pattern
export const Selected: Story = {
  args: {
    patternId: 'pattern-001',
    name: 'Button Component',
    version: '2.1.0',
    matchScore: 0.94,
    metadata: {
      description: 'A fully accessible button component with multiple variants and sizes',
      author: 'shadcn',
      tags: ['button', 'interactive', 'accessible'],
    },
    selected: true,
  },
}

// Minimal metadata
export const MinimalMetadata: Story = {
  args: {
    patternId: 'pattern-004',
    name: 'Input Field',
    version: '1.0.0',
    matchScore: 0.88,
    selected: false,
  },
}

// No action buttons
export const NoActionButtons: Story = {
  args: {
    patternId: 'pattern-005',
    name: 'Badge Component',
    version: '1.2.0',
    matchScore: 0.92,
    metadata: {
      description: 'Simple badge component for status indicators',
      tags: ['badge', 'status', 'indicator'],
    },
    selected: false,
    onSelect: undefined,
    onPreview: undefined,
  },
}

// Long content
export const LongContent: Story = {
  args: {
    patternId: 'pattern-006',
    name: 'Advanced Data Table with Sorting, Filtering, and Pagination',
    version: '4.2.1',
    matchScore: 0.87,
    metadata: {
      description:
        'A comprehensive data table component with advanced features including sorting, filtering, pagination, column resizing, row selection, and keyboard navigation. Perfect for displaying large datasets with complex interactions.',
      author: 'TanStack Table Contributors',
      tags: [
        'table',
        'data-grid',
        'sorting',
        'filtering',
        'pagination',
        'accessible',
        'keyboard-navigation',
        'column-resizing',
      ],
    },
    selected: false,
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 w-[600px]">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Match Score Variants</h3>
        <div className="space-y-4">
          <PatternCard
            patternId="pattern-high"
            name="High Match Pattern"
            version="1.0.0"
            matchScore={0.95}
            metadata={{
              description: 'High match score (>90%) - shown in green',
              tags: ['success'],
            }}
            onSelect={() => {}}
            onPreview={() => {}}
          />
          <PatternCard
            patternId="pattern-medium"
            name="Medium Match Pattern"
            version="1.0.0"
            matchScore={0.75}
            metadata={{
              description: 'Medium match score (70-90%) - shown in yellow',
              tags: ['warning'],
            }}
            onSelect={() => {}}
            onPreview={() => {}}
          />
          <PatternCard
            patternId="pattern-low"
            name="Low Match Pattern"
            version="1.0.0"
            matchScore={0.60}
            metadata={{
              description: 'Low match score (<70%) - shown in red',
              tags: ['error'],
            }}
            onSelect={() => {}}
            onPreview={() => {}}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Selected State</h3>
        <div className="space-y-4">
          <PatternCard
            patternId="pattern-unselected"
            name="Unselected Pattern"
            version="1.0.0"
            matchScore={0.90}
            metadata={{
              description: 'Default unselected state',
            }}
            selected={false}
            onSelect={() => {}}
            onPreview={() => {}}
          />
          <PatternCard
            patternId="pattern-selected"
            name="Selected Pattern"
            version="1.0.0"
            matchScore={0.90}
            metadata={{
              description: 'Active selected state with blue background',
            }}
            selected={true}
            onSelect={() => {}}
            onPreview={() => {}}
          />
        </div>
      </div>
    </div>
  ),
}

// Accessibility test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4 w-[600px]">
      <h3 className="text-sm font-semibold">Keyboard Navigation Test</h3>
      <p className="text-sm text-muted-foreground">
        Tab through buttons, press Enter/Space to activate. Use arrow keys within button groups.
      </p>
      <div className="space-y-3">
        <PatternCard
          patternId="pattern-a11y-1"
          name="First Pattern"
          version="1.0.0"
          matchScore={0.95}
          metadata={{
            description: 'Test keyboard navigation and screen reader announcements',
            tags: ['accessible', 'keyboard'],
          }}
          selected={false}
          onSelect={() => {}}
          onPreview={() => {}}
        />
        <PatternCard
          patternId="pattern-a11y-2"
          name="Second Pattern (Selected)"
          version="2.0.0"
          matchScore={0.88}
          metadata={{
            description: 'Selected pattern should announce selected state',
            tags: ['accessible', 'aria'],
          }}
          selected={true}
          onSelect={() => {}}
          onPreview={() => {}}
        />
        <PatternCard
          patternId="pattern-a11y-3"
          name="Third Pattern"
          version="1.5.0"
          matchScore={0.72}
          metadata={{
            description: 'All interactive elements should be keyboard accessible',
            tags: ['wcag', 'a11y'],
          }}
          selected={false}
          onSelect={() => {}}
          onPreview={() => {}}
        />
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
            id: 'aria-required-attr',
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

// Pattern Selection Page Example
export const PatternSelectionPage: Story = {
  render: () => (
    <div className="space-y-4 w-[800px]">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Pattern Matching Results</h2>
        <p className="text-muted-foreground">
          Top 3 patterns matching your requirements
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <PatternCard
          patternId="pattern-top-1"
          name="Button Component"
          version="2.1.0"
          matchScore={0.94}
          metadata={{
            description: 'Highly accessible button with all required variants',
            author: 'shadcn',
            tags: ['button', 'interactive', 'wcag-aa'],
          }}
          selected={true}
          onSelect={() => {}}
          onPreview={() => {}}
        />
        <PatternCard
          patternId="pattern-top-2"
          name="Input Field"
          version="3.0.2"
          matchScore={0.89}
          metadata={{
            description: 'Form input with validation and error states',
            author: 'Radix UI',
            tags: ['form', 'input', 'validation'],
          }}
          selected={false}
          onSelect={() => {}}
          onPreview={() => {}}
        />
        <PatternCard
          patternId="pattern-top-3"
          name="Card Layout"
          version="1.8.0"
          matchScore={0.81}
          metadata={{
            description: 'Flexible card component for content organization',
            author: 'Material UI',
            tags: ['card', 'layout', 'container'],
          }}
          selected={false}
          onSelect={() => {}}
          onPreview={() => {}}
        />
      </div>
    </div>
  ),
}
