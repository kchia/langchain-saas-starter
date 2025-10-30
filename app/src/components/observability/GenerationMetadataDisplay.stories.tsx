import type { Meta, StoryObj } from "@storybook/react";
import { GenerationMetadataDisplay } from "./GenerationMetadataDisplay";

const meta = {
  title: "Observability/GenerationMetadataDisplay",
  component: GenerationMetadataDisplay,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    metadata: {
      control: "object",
      description: "Metadata from generation response",
    },
  },
} satisfies Meta<typeof GenerationMetadataDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Complete metadata with all fields
 */
export const Complete: Story = {
  args: {
    metadata: {
      latency_ms: 5000,
      stage_latencies: {
        llm_generating: 3000,
        validating: 1500,
        post_processing: 500,
      },
      token_count: 1250,
      estimated_cost: 0.0125,
      llm_token_usage: {
        prompt_tokens: 500,
        completion_tokens: 750,
        total_tokens: 1250,
      },
    },
  },
};

/**
 * Basic metadata without stage breakdown
 */
export const BasicMetadata: Story = {
  args: {
    metadata: {
      latency_ms: 3500,
      token_count: 850,
      estimated_cost: 0.0085,
    },
  },
};

/**
 * With LLM token usage breakdown
 */
export const WithTokenBreakdown: Story = {
  args: {
    metadata: {
      latency_ms: 4200,
      llm_token_usage: {
        prompt_tokens: 1200,
        completion_tokens: 1800,
        total_tokens: 3000,
      },
      estimated_cost: 0.0300,
    },
  },
};

/**
 * With stage latencies
 */
export const WithStageBreakdown: Story = {
  args: {
    metadata: {
      latency_ms: 8500,
      stage_latencies: {
        llm_generating: 5000,
        validating: 2000,
        post_processing: 1500,
      },
      token_count: 2500,
    },
  },
};

/**
 * Fast generation (< 2 seconds)
 */
export const FastGeneration: Story = {
  args: {
    metadata: {
      latency_ms: 1500,
      token_count: 500,
      estimated_cost: 0.0050,
      llm_token_usage: {
        prompt_tokens: 200,
        completion_tokens: 300,
        total_tokens: 500,
      },
    },
  },
};

/**
 * Large generation with high token count
 */
export const LargeGeneration: Story = {
  args: {
    metadata: {
      latency_ms: 12000,
      stage_latencies: {
        llm_generating: 8000,
        validating: 2500,
        post_processing: 1500,
      },
      llm_token_usage: {
        prompt_tokens: 2000,
        completion_tokens: 6000,
        total_tokens: 8000,
      },
      estimated_cost: 0.0800,
    },
  },
};

/**
 * Minimal metadata (all N/A)
 */
export const MinimalMetadata: Story = {
  args: {
    metadata: {},
  },
};

/**
 * In context - as it appears in the preview page
 */
export const InPreviewContext: Story = {
  render: () => (
    <div className="max-w-2xl space-y-4">
      <div className="text-sm font-semibold">Generation Complete</div>
      <GenerationMetadataDisplay
        metadata={{
          latency_ms: 5000,
          stage_latencies: {
            llm_generating: 3000,
            validating: 1500,
            post_processing: 500,
          },
          llm_token_usage: {
            prompt_tokens: 500,
            completion_tokens: 750,
            total_tokens: 1250,
          },
          estimated_cost: 0.0125,
        }}
      />
    </div>
  ),
};

/**
 * Multiple instances showing different generation speeds
 */
export const Comparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      <div className="space-y-2">
        <p className="text-sm font-medium">Fast Generation (1.5s)</p>
        <GenerationMetadataDisplay
          metadata={{
            latency_ms: 1500,
            token_count: 500,
            estimated_cost: 0.0050,
          }}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Slow Generation (12s)</p>
        <GenerationMetadataDisplay
          metadata={{
            latency_ms: 12000,
            token_count: 8000,
            estimated_cost: 0.0800,
          }}
        />
      </div>
    </div>
  ),
};
