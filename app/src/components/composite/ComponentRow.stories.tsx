import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ComponentRow } from "./ComponentRow";

const meta = {
  title: "Composite/ComponentRow",
  component: ComponentRow,
  parameters: {
    layout: "padded"
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "text",
      description: "Name of the component"
    },
    timestamp: {
      control: "text",
      description: "When the component was generated"
    },
    tokenAdherence: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Token adherence percentage (0-100)"
    },
    a11yScore: {
      control: { type: "number", min: 0, max: 10, step: 1 },
      description: "Number of critical accessibility issues"
    },
    latency: {
      control: { type: "number", min: 0, max: 300, step: 1 },
      description: "Generation latency in seconds"
    },
    pattern: {
      control: "text",
      description: "Pattern used for generation"
    },
    onView: {
      action: "view clicked",
      description: "Callback when View button is clicked"
    }
  }
} satisfies Meta<typeof ComponentRow>;

export default meta;
type Story = StoryObj<typeof meta>;

// Excellent component (high token adherence, no a11y issues)
export const Excellent: Story = {
  args: {
    name: "Button",
    timestamp: "Today, 2:34 PM",
    tokenAdherence: 94,
    a11yScore: 0,
    latency: 48,
    pattern: "shadcn/ui Button v2.1.0"
  }
};

// Good component (decent scores)
export const Good: Story = {
  args: {
    name: "Card",
    timestamp: "Today, 11:20 AM",
    tokenAdherence: 91,
    a11yScore: 0,
    latency: 52,
    pattern: "shadcn/ui Card v1.0.0"
  }
};

// Warning component (lower token adherence)
export const Warning: Story = {
  args: {
    name: "Input",
    timestamp: "Yesterday, 4:15 PM",
    tokenAdherence: 87,
    a11yScore: 0,
    latency: 61,
    pattern: "shadcn/ui Input v1.5.0"
  }
};

// Component with accessibility issues
export const WithA11yIssues: Story = {
  args: {
    name: "CustomModal",
    timestamp: "Oct 2, 3:30 PM",
    tokenAdherence: 92,
    a11yScore: 3,
    latency: 58,
    pattern: "Custom Modal Pattern v1.0.0"
  }
};

// Poor component (low scores)
export const Poor: Story = {
  args: {
    name: "DatePicker",
    timestamp: "Oct 1, 10:00 AM",
    tokenAdherence: 65,
    a11yScore: 5,
    latency: 89,
    pattern: "react-datepicker v3.2.0"
  }
};

// List of components (how they appear on dashboard)
export const ComponentList: Story = {
  args: {
    name: "Sample Component",
    timestamp: "2024-01-15T10:30:00Z",
    tokenAdherence: 85,
    a11yScore: 92,
    latency: 120,
    pattern: "shadcn/ui Button"
  },
  render: () => (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">📦 RECENT COMPONENTS</h2>
      </div>
      <div>
        <ComponentRow
          name="Button"
          timestamp="Today, 2:34 PM"
          tokenAdherence={94}
          a11yScore={0}
          latency={48}
          pattern="shadcn/ui Button v2.1.0"
          onView={() => console.log("View Button")}
        />
        <ComponentRow
          name="Card"
          timestamp="Today, 11:20 AM"
          tokenAdherence={91}
          a11yScore={0}
          latency={52}
          pattern="shadcn/ui Card v1.0.0"
          onView={() => console.log("View Card")}
        />
        <ComponentRow
          name="Input"
          timestamp="Yesterday, 4:15 PM"
          tokenAdherence={87}
          a11yScore={0}
          latency={61}
          pattern="shadcn/ui Input v1.5.0"
          onView={() => console.log("View Input")}
        />
        <ComponentRow
          name="Badge"
          timestamp="Oct 2, 9:30 AM"
          tokenAdherence={96}
          a11yScore={0}
          latency={42}
          pattern="shadcn/ui Badge v1.0.0"
          onView={() => console.log("View Badge")}
        />
      </div>
    </div>
  )
};

// Accessibility test with keyboard navigation
export const AccessibilityTest: Story = {
  name: "Accessibility Test",
  args: {
    name: "Accessibility Test Component",
    timestamp: "2024-01-15T10:30:00Z",
    tokenAdherence: 95,
    a11yScore: 100,
    latency: 80,
    pattern: "Accessible Button"
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Keyboard Navigation Test</h3>
      <p className="text-sm text-gray-600">
        Tab through components, press Enter/Space on View buttons
      </p>
      <div className="bg-white border border-gray-200 rounded-lg">
        <ComponentRow
          name="Button"
          timestamp="Today, 2:34 PM"
          tokenAdherence={94}
          a11yScore={0}
          latency={48}
          pattern="shadcn/ui Button v2.1.0"
          onView={() => alert("View Button clicked!")}
        />
        <ComponentRow
          name="Card"
          timestamp="Today, 11:20 AM"
          tokenAdherence={91}
          a11yScore={0}
          latency={52}
          pattern="shadcn/ui Card v1.0.0"
          onView={() => alert("View Card clicked!")}
        />
        <ComponentRow
          name="Input"
          timestamp="Yesterday, 4:15 PM"
          tokenAdherence={87}
          a11yScore={0}
          latency={61}
          pattern="shadcn/ui Input v1.5.0"
          onView={() => alert("View Input clicked!")}
        />
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

// Different metric states
export const VariousMetrics: Story = {
  args: {
    name: "Various Metrics Component",
    timestamp: "2024-01-15T10:30:00Z",
    tokenAdherence: 75,
    a11yScore: 88,
    latency: 150,
    pattern: "Mixed Metrics"
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold mb-2">Different Metric States</h3>
      <div className="bg-white border border-gray-200 rounded-lg">
        <ComponentRow
          name="Excellent (94% tokens, 0 a11y)"
          timestamp="Now"
          tokenAdherence={94}
          a11yScore={0}
          latency={48}
          pattern="Perfect Pattern"
        />
        <ComponentRow
          name="Good (80% tokens, 1 a11y)"
          timestamp="Now"
          tokenAdherence={80}
          a11yScore={1}
          latency={55}
          pattern="Good Pattern"
        />
        <ComponentRow
          name="Warning (75% tokens, 2 a11y)"
          timestamp="Now"
          tokenAdherence={75}
          a11yScore={2}
          latency={67}
          pattern="Warning Pattern"
        />
        <ComponentRow
          name="Poor (60% tokens, 5 a11y)"
          timestamp="Now"
          tokenAdherence={60}
          a11yScore={5}
          latency={89}
          pattern="Poor Pattern"
        />
      </div>
    </div>
  )
};
