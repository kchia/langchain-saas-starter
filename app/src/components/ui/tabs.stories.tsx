import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

// Default variant (horizontal)
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList variant="default">
        <TabsTrigger variant="default" value="tab1">Account</TabsTrigger>
        <TabsTrigger variant="default" value="tab2">Password</TabsTrigger>
        <TabsTrigger variant="default" value="tab3">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-sm">Account content goes here.</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-sm">Password content goes here.</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-sm">Settings content goes here.</p>
      </TabsContent>
    </Tabs>
  ),
}

// Pills variant
export const Pills: Story = {
  render: () => (
    <Tabs defaultValue="screenshot" className="w-[400px]">
      <TabsList variant="pills">
        <TabsTrigger variant="pills" value="screenshot">Screenshot Upload</TabsTrigger>
        <TabsTrigger variant="pills" value="figma">Figma Integration</TabsTrigger>
      </TabsList>
      <TabsContent value="screenshot">
        <p className="text-sm">Upload a screenshot to extract design tokens.</p>
      </TabsContent>
      <TabsContent value="figma">
        <p className="text-sm">Connect to Figma to import design tokens.</p>
      </TabsContent>
    </Tabs>
  ),
}

// Underline variant
export const Underline: Story = {
  render: () => (
    <Tabs defaultValue="preview" className="w-[600px]">
      <TabsList variant="underline">
        <TabsTrigger variant="underline" value="preview">Preview</TabsTrigger>
        <TabsTrigger variant="underline" value="code">Code</TabsTrigger>
        <TabsTrigger variant="underline" value="storybook">Storybook</TabsTrigger>
        <TabsTrigger variant="underline" value="quality">Quality</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <p className="text-sm">Component preview content.</p>
      </TabsContent>
      <TabsContent value="code">
        <p className="text-sm">Generated code preview.</p>
      </TabsContent>
      <TabsContent value="storybook">
        <p className="text-sm">Storybook stories preview.</p>
      </TabsContent>
      <TabsContent value="quality">
        <p className="text-sm">Quality validation results.</p>
      </TabsContent>
    </Tabs>
  ),
}

// Vertical orientation with default variant
export const VerticalDefault: Story = {
  render: () => (
    <Tabs defaultValue="tab1" orientation="vertical" className="flex gap-4">
      <TabsList variant="default" orientation="vertical">
        <TabsTrigger variant="default" orientation="vertical" value="tab1">Profile</TabsTrigger>
        <TabsTrigger variant="default" orientation="vertical" value="tab2">Security</TabsTrigger>
        <TabsTrigger variant="default" orientation="vertical" value="tab3">Notifications</TabsTrigger>
        <TabsTrigger variant="default" orientation="vertical" value="tab4">Billing</TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="tab1">
          <p className="text-sm">Profile settings content.</p>
        </TabsContent>
        <TabsContent value="tab2">
          <p className="text-sm">Security settings content.</p>
        </TabsContent>
        <TabsContent value="tab3">
          <p className="text-sm">Notification preferences content.</p>
        </TabsContent>
        <TabsContent value="tab4">
          <p className="text-sm">Billing information content.</p>
        </TabsContent>
      </div>
    </Tabs>
  ),
}

// Vertical orientation with pills variant
export const VerticalPills: Story = {
  render: () => (
    <Tabs defaultValue="tab1" orientation="vertical" className="flex gap-4">
      <TabsList variant="pills" orientation="vertical">
        <TabsTrigger variant="pills" orientation="vertical" value="tab1">Dashboard</TabsTrigger>
        <TabsTrigger variant="pills" orientation="vertical" value="tab2">Components</TabsTrigger>
        <TabsTrigger variant="pills" orientation="vertical" value="tab3">Patterns</TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="tab1">
          <p className="text-sm">Dashboard view.</p>
        </TabsContent>
        <TabsContent value="tab2">
          <p className="text-sm">Components list.</p>
        </TabsContent>
        <TabsContent value="tab3">
          <p className="text-sm">Design patterns library.</p>
        </TabsContent>
      </div>
    </Tabs>
  ),
}

// Vertical orientation with underline variant
export const VerticalUnderline: Story = {
  render: () => (
    <Tabs defaultValue="tab1" orientation="vertical" className="flex gap-4">
      <TabsList variant="underline" orientation="vertical">
        <TabsTrigger variant="underline" orientation="vertical" value="tab1">Overview</TabsTrigger>
        <TabsTrigger variant="underline" orientation="vertical" value="tab2">Analytics</TabsTrigger>
        <TabsTrigger variant="underline" orientation="vertical" value="tab3">Reports</TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="tab1">
          <p className="text-sm">Overview content.</p>
        </TabsContent>
        <TabsContent value="tab2">
          <p className="text-sm">Analytics data.</p>
        </TabsContent>
        <TabsContent value="tab3">
          <p className="text-sm">Reports and insights.</p>
        </TabsContent>
      </div>
    </Tabs>
  ),
}

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-3xl">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Default Variant (Horizontal)</h3>
        <Tabs defaultValue="tab1">
          <TabsList variant="default">
            <TabsTrigger variant="default" value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger variant="default" value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger variant="default" value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Pills Variant (Horizontal)</h3>
        <Tabs defaultValue="tab1">
          <TabsList variant="pills">
            <TabsTrigger variant="pills" value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger variant="pills" value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger variant="pills" value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Underline Variant (Horizontal)</h3>
        <Tabs defaultValue="tab1">
          <TabsList variant="underline">
            <TabsTrigger variant="underline" value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger variant="underline" value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger variant="underline" value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      </div>
    </div>
  ),
}

// ComponentForge Use Cases
export const TokenExtractionPage: Story = {
  name: 'Use Case: Token Extraction',
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Token Extraction Page - Input Source Selection</h3>
      <Tabs defaultValue="screenshot" className="w-full">
        <TabsList variant="pills">
          <TabsTrigger variant="pills" value="screenshot">Screenshot Upload</TabsTrigger>
          <TabsTrigger variant="pills" value="figma">Figma Integration</TabsTrigger>
        </TabsList>
        <TabsContent value="screenshot" className="pt-4">
          <div className="border border-border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Upload a screenshot of your design to automatically extract design tokens
            </p>
            <div className="inline-flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg">
              <p className="text-sm text-muted-foreground">Drop screenshot here or click to upload</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="figma" className="pt-4">
          <div className="border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Connect to Figma to import design tokens directly from your design files
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Paste Figma file URL"
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                Connect to Figma
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
}

export const ComponentPreviewPage: Story = {
  name: 'Use Case: Component Preview',
  render: () => (
    <div className="space-y-4 max-w-3xl">
      <h3 className="text-sm font-semibold">Component Preview Page - View Modes</h3>
      <Tabs defaultValue="preview" className="w-full">
        <TabsList variant="underline">
          <TabsTrigger variant="underline" value="preview">Preview</TabsTrigger>
          <TabsTrigger variant="underline" value="code">Code</TabsTrigger>
          <TabsTrigger variant="underline" value="storybook">Storybook</TabsTrigger>
          <TabsTrigger variant="underline" value="quality">Quality</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="pt-4">
          <div className="border border-border rounded-lg p-6">
            <p className="text-sm mb-4">Live component preview with all variants and states</p>
            <div className="bg-muted p-4 rounded">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                Example Component
              </button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="code" className="pt-4">
          <div className="border border-border rounded-lg p-6 bg-muted">
            <pre className="text-xs">
              <code>{`import { Button } from '@/components/ui/button'\n\nexport default function Example() {\n  return <Button>Click me</Button>\n}`}</code>
            </pre>
          </div>
        </TabsContent>
        <TabsContent value="storybook" className="pt-4">
          <div className="border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground">
              Generated Storybook stories for interactive component documentation
            </p>
          </div>
        </TabsContent>
        <TabsContent value="quality" className="pt-4">
          <div className="border border-border rounded-lg p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Quality Validation Results</p>
              <div className="space-y-1 text-sm">
                <p className="text-success">✓ Accessibility: Passed (0 issues)</p>
                <p className="text-success">✓ Token Adherence: 95%</p>
                <p className="text-success">✓ Pattern Matching: 92%</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
}

// Disabled state
export const DisabledTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList variant="default">
        <TabsTrigger variant="default" value="tab1">Enabled</TabsTrigger>
        <TabsTrigger variant="default" value="tab2" disabled>Disabled</TabsTrigger>
        <TabsTrigger variant="default" value="tab3">Enabled</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-sm">First tab content.</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-sm">This tab is disabled.</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-sm">Third tab content.</p>
      </TabsContent>
    </Tabs>
  ),
}

// Accessibility Test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Keyboard Navigation Test</h3>
      <p className="text-sm text-muted-foreground">
        Use arrow keys to navigate between tabs, Enter/Space to activate
      </p>
      <Tabs defaultValue="tab1" className="w-full">
        <TabsList variant="default">
          <TabsTrigger variant="default" value="tab1">First Tab</TabsTrigger>
          <TabsTrigger variant="default" value="tab2">Second Tab</TabsTrigger>
          <TabsTrigger variant="default" value="tab3">Third Tab</TabsTrigger>
          <TabsTrigger variant="default" value="tab4" disabled>Disabled Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <p className="text-sm">Content for first tab - accessible via keyboard navigation</p>
        </TabsContent>
        <TabsContent value="tab2">
          <p className="text-sm">Content for second tab - accessible via keyboard navigation</p>
        </TabsContent>
        <TabsContent value="tab3">
          <p className="text-sm">Content for third tab - accessible via keyboard navigation</p>
        </TabsContent>
        <TabsContent value="tab4">
          <p className="text-sm">This content should not be accessible</p>
        </TabsContent>
      </Tabs>
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
            id: 'tabindex',
            enabled: true,
          },
          {
            id: 'aria-valid-attr',
            enabled: true,
          },
        ],
      },
    },
  },
}
