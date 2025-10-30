import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
        "success",
        "warning"
      ],
      description: "The visual style variant of the button"
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "The size of the button"
    },
    asChild: {
      control: "boolean",
      description: "Use Radix UI Slot to merge props with child element"
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled"
    }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary button (default variant)
export const Primary: Story = {
  args: {
    variant: "default",
    children: "Upload Screenshot"
  }
};

// Secondary button
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Export as JSON"
  }
};

// Success button (green)
export const Success: Story = {
  args: {
    variant: "success",
    children: "✓ Accept All"
  }
};

// Warning button (yellow)
export const Warning: Story = {
  args: {
    variant: "warning",
    children: "⚠️ Review Low Confidence"
  }
};

// Destructive button (red)
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "✗ Remove"
  }
};

// Ghost button (transparent)
export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Edit"
  }
};

// Outline button
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "View Pattern"
  }
};

// Link button
export const Link: Story = {
  args: {
    variant: "link",
    children: "Back to Home"
  }
};

// Small size
export const Small: Story = {
  args: {
    size: "sm",
    children: "✓ Accept"
  }
};

// Large size
export const Large: Story = {
  args: {
    size: "lg",
    children: "Continue →"
  }
};

// Disabled state
export const Disabled: Story = {
  args: {
    variant: "default",
    disabled: true,
    children: "Disabled Button"
  }
};

// Icon button
export const Icon: Story = {
  args: {
    variant: "outline",
    size: "icon",
    children: "⚙️"
  }
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Sizes</h3>
        <div className="flex items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">⚙️</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">States</h3>
        <div className="flex gap-3">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>
    </div>
  )
};

// ComponentForge Use Cases
export const TokenExtractionPage: Story = {
  name: "Use Case: Token Extraction",
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Token Extraction Page Buttons</h3>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button variant="default">Upload Screenshot</Button>
          <Button variant="secondary">Export as JSON</Button>
          <Button variant="secondary">Export as CSS</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            Edit
          </Button>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </div>
        <Button variant="default" className="w-full">
          Continue →
        </Button>
      </div>
    </div>
  )
};

export const RequirementsPage: Story = {
  name: "Use Case: Requirements Review",
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Requirements Page Buttons</h3>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button variant="success">✓ Accept All</Button>
          <Button variant="warning">⚠️ Review Low Confidence</Button>
          <Button variant="secondary">+ Add Custom Requirement</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            ✓ Accept
          </Button>
          <Button variant="ghost" size="sm">
            ✎ Edit
          </Button>
          <Button variant="ghost" size="sm">
            ✗ Remove
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">← Back to Tokens</Button>
          <Button variant="default" className="flex-1">
            Continue to Pattern Matching →
          </Button>
        </div>
      </div>
    </div>
  )
};

export const DashboardPage: Story = {
  name: "Use Case: Dashboard",
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold">Dashboard Page Buttons</h3>
      <div className="space-y-3">
        <Button variant="default">+ Generate Component</Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            View
          </Button>
          <Button variant="secondary" size="sm">
            View
          </Button>
          <Button variant="secondary" size="sm">
            View
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Extract Tokens</Button>
          <Button variant="secondary">View Pattern Library (12)</Button>
          <Button variant="secondary">Export All Components</Button>
        </div>
      </div>
    </div>
  )
};

// Accessibility Test
export const AccessibilityTest: Story = {
  name: "Accessibility Test",
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Keyboard Navigation Test</h3>
      <p className="text-sm text-gray-600">
        Tab through buttons, press Enter/Space to activate
      </p>
      <div className="flex gap-3">
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
        <Button disabled>Disabled (skipped)</Button>
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true
          },
          {
            id: "button-name",
            enabled: true
          },
          {
            id: "focus-order-semantics",
            enabled: true
          }
        ]
      }
    }
  }
};
