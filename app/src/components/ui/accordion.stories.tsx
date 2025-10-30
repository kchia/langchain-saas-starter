import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion'

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'Determines whether one or multiple items can be open at the same time',
    },
    collapsible: {
      control: 'boolean',
      description: 'When type is "single", allows closing content when clicking trigger for an open item',
    },
  },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

// Single accordion (only one section can be open)
export const Single: Story = {
  args: {
    type: 'single',
    collapsible: true,
  },
  render: (args) => (
    <Accordion {...args} className="w-[600px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is the purpose of this component?</AccordionTrigger>
        <AccordionContent>
          This accordion component is used to organize content in collapsible sections.
          It&apos;s perfect for FAQs, settings panels, and content organization.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I customize the styling?</AccordionTrigger>
        <AccordionContent>
          You can customize the accordion using Tailwind CSS classes. Pass className
          props to any of the accordion components to override default styles.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes! Built with Radix UI primitives, it follows WAI-ARIA design patterns
          and includes proper keyboard navigation and screen reader support.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// Multiple accordion (multiple sections can be open)
export const Multiple: Story = {
  args: {
    type: 'multiple',
  },
  render: (args) => (
    <Accordion {...args} className="w-[600px]">
      <AccordionItem value="props">
        <AccordionTrigger>Props</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">variant</span>
              <span className="text-gray-600">string</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">size</span>
              <span className="text-gray-600">string</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">disabled</span>
              <span className="text-gray-600">boolean</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="events">
        <AccordionTrigger>Events</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">onClick</span>
              <span className="text-gray-600">function</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">onChange</span>
              <span className="text-gray-600">function</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="states">
        <AccordionTrigger>States</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">hover</span>
              <span className="text-gray-600">underline</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">active</span>
              <span className="text-gray-600">open/closed</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="a11y">
        <AccordionTrigger>Accessibility</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <p>✓ Keyboard navigation (Tab, Enter, Space, Arrow keys)</p>
            <p>✓ Screen reader support (aria-expanded, role=region)</p>
            <p>✓ Focus indicators</p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// Default open sections
export const DefaultOpen: Story = {
  args: {
    type: 'single',
    collapsible: true,
    defaultValue: 'item-2',
  },
  render: (args) => (
    <Accordion {...args} className="w-[600px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>This section is closed by default.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2 (Default Open)</AccordionTrigger>
        <AccordionContent>
          This section is open by default because we set defaultValue=&quot;item-2&quot;.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section 3</AccordionTrigger>
        <AccordionContent>This section is also closed by default.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// Multiple with default open sections
export const MultipleDefaultOpen: Story = {
  args: {
    type: 'multiple',
    defaultValue: ['item-1', 'item-3'],
  },
  render: (args) => (
    <Accordion {...args} className="w-[600px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1 (Default Open)</AccordionTrigger>
        <AccordionContent>This section is open by default.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>This section is closed by default.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section 3 (Default Open)</AccordionTrigger>
        <AccordionContent>This section is also open by default.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// Pattern Selection use case (single section)
export const PatternSelectionDetails: Story = {
  args: {
    type: 'single',
    collapsible: true,
  },
  render: (args) => (
    <Accordion {...args} className="w-[600px]">
      <AccordionItem value="retrieval">
        <AccordionTrigger>📊 Retrieval Details</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-sm">Pattern Match Score</p>
              <p className="text-sm text-gray-600">95% confidence</p>
            </div>
            <div>
              <p className="font-medium text-sm">Source</p>
              <p className="text-sm text-gray-600">shadcn/ui button pattern</p>
            </div>
            <div>
              <p className="font-medium text-sm">Cached</p>
              <p className="text-sm text-gray-600">Yes - retrieved in 45ms</p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// Requirements page use case (multiple sections for categories)
export const RequirementsCategories: Story = {
  args: {
    type: 'multiple',
    defaultValue: ['props', 'states'],
  },
  render: (args) => (
    <Accordion {...args} className="w-[600px]">
      <AccordionItem value="props">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">12</span>
            Props
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium text-sm">variant: string</p>
              <p className="text-xs text-gray-600">Visual style of the button</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium text-sm">size: string</p>
              <p className="text-xs text-gray-600">Size of the button</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium text-sm">disabled: boolean</p>
              <p className="text-xs text-gray-600">Whether button is disabled</p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="events">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">5</span>
            Events
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium text-sm">onClick: function</p>
              <p className="text-xs text-gray-600">Fired when button is clicked</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium text-sm">onFocus: function</p>
              <p className="text-xs text-gray-600">Fired when button receives focus</p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="states">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">8</span>
            States
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium text-sm">default</p>
              <p className="text-xs text-gray-600">Normal state</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium text-sm">hover</p>
              <p className="text-xs text-gray-600">Mouse over state</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium text-sm">disabled</p>
              <p className="text-xs text-gray-600">Disabled state</p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="a11y">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">6</span>
            Accessibility
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium text-sm">Keyboard Navigation</p>
              <p className="text-xs text-gray-600">✓ Tab, Enter, Space supported</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium text-sm">Screen Reader</p>
              <p className="text-xs text-gray-600">✓ Proper ARIA labels</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-medium text-sm">Focus Indicators</p>
              <p className="text-xs text-gray-600">✓ Visible focus ring</p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

// Accessibility Test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Keyboard Navigation Test</h3>
      <p className="text-sm text-gray-600">
        Tab to focus triggers, press Enter/Space to toggle, Arrow keys to navigate
      </p>
      <Accordion type="single" collapsible className="w-[600px]">
        <AccordionItem value="item-1">
          <AccordionTrigger>First Section (Try Tab)</AccordionTrigger>
          <AccordionContent>
            Use keyboard to navigate. Press Enter or Space to toggle.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Second Section (Arrow Down)</AccordionTrigger>
          <AccordionContent>
            Arrow keys navigate between accordion triggers when focused.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Third Section (Arrow Up)</AccordionTrigger>
          <AccordionContent>
            All interactions are fully accessible via keyboard.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
            id: 'aria-allowed-attr',
            enabled: true,
          },
          {
            id: 'aria-required-attr',
            enabled: true,
          },
        ],
      },
    },
  },
}

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h3 className="text-sm font-semibold mb-3">Single Type (collapsible)</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="single-1">
            <AccordionTrigger>Only one section can be open</AccordionTrigger>
            <AccordionContent>Opening another section will close this one.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="single-2">
            <AccordionTrigger>Click to open this section</AccordionTrigger>
            <AccordionContent>The previous section will close automatically.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Multiple Type</h3>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="multi-1">
            <AccordionTrigger>Multiple sections can be open</AccordionTrigger>
            <AccordionContent>You can open as many sections as you want.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="multi-2">
            <AccordionTrigger>Try opening this too</AccordionTrigger>
            <AccordionContent>Both sections stay open!</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
}
