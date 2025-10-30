import type { Meta, StoryObj } from "@storybook/react";
import { LangSmithTraceLink } from "./LangSmithTraceLink";

const meta = {
  title: "Observability/LangSmithTraceLink",
  component: LangSmithTraceLink,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    traceUrl: {
      control: "text",
      description: "LangSmith trace URL",
    },
    sessionId: {
      control: "text",
      description: "Session ID for this trace",
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "Button size",
    },
    variant: {
      control: "select",
      options: ["default", "secondary", "ghost", "outline"],
      description: "Button variant",
    },
  },
} satisfies Meta<typeof LangSmithTraceLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default trace link with all data
 */
export const Default: Story = {
  args: {
    traceUrl: "https://smith.langchain.com/o/default/projects/p/component-forge/r/abc123def456",
    sessionId: "session-xyz-789",
    variant: "ghost",
    size: "sm",
  },
};

/**
 * Outline variant for use in cards
 */
export const OutlineVariant: Story = {
  args: {
    traceUrl: "https://smith.langchain.com/o/default/projects/p/component-forge/r/abc123def456",
    sessionId: "session-xyz-789",
    variant: "outline",
    size: "default",
  },
};

/**
 * Primary button variant
 */
export const PrimaryVariant: Story = {
  args: {
    traceUrl: "https://smith.langchain.com/o/default/projects/p/component-forge/r/abc123def456",
    sessionId: "session-xyz-789",
    variant: "default",
    size: "lg",
  },
};

/**
 * Without session ID
 */
export const WithoutSessionId: Story = {
  args: {
    traceUrl: "https://smith.langchain.com/o/default/projects/p/component-forge/r/abc123def456",
    variant: "ghost",
    size: "sm",
  },
};

/**
 * No trace URL - component returns null
 */
export const NoTraceUrl: Story = {
  args: {
    traceUrl: undefined,
    sessionId: "session-xyz-789",
  },
  render: () => (
    <div className="p-4 border rounded-md">
      <p className="text-sm text-muted-foreground mb-2">
        Component returns null when no trace URL:
      </p>
      <LangSmithTraceLink
        traceUrl={undefined}
        sessionId="session-xyz-789"
      />
      <p className="text-xs text-muted-foreground mt-2 italic">
        (Nothing rendered above - graceful degradation)
      </p>
    </div>
  ),
};

/**
 * In a card context (common use case)
 */
export const InCard: Story = {
  render: () => (
    <div className="w-96 border rounded-lg p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">AI Observability</h3>
        <p className="text-xs text-muted-foreground">
          View detailed AI operation logs and metrics
        </p>
      </div>
      <LangSmithTraceLink
        traceUrl="https://smith.langchain.com/o/default/projects/p/component-forge/r/abc123def456"
        sessionId="session-xyz-789"
        variant="outline"
        size="default"
        className="w-full"
      />
    </div>
  ),
};
