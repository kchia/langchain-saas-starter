import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./tooltip";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    )
  ]
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic tooltip
export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  )
};

// Tooltip with different placements
export const Placements: Story = {
  name: "Different Placements",
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Top (default)</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
};

// Tooltip with custom delay
export const CustomDelay: Story = {
  name: "Custom Delay",
  render: () => (
    <div className="flex gap-4">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button variant="outline">No delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Appears immediately</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={700}>
        <TooltipTrigger asChild>
          <Button variant="outline">Default (700ms)</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Default delay</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1500}>
        <TooltipTrigger asChild>
          <Button variant="outline">Long delay (1500ms)</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Longer delay</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
};

// Use case: Confidence score explanation
export const ConfidenceScore: Story = {
  name: "Use Case: Confidence Score",
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Requirements Page</h3>
      <div className="flex items-center gap-2">
        <span className="text-sm">Confidence:</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium cursor-help">
              95%
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              High confidence based on clear design tokens and multiple pattern
              matches
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Confidence:</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs font-medium cursor-help">
              65%
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Medium confidence - some ambiguity in design patterns</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Confidence:</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-800 text-xs font-medium cursor-help">
              35%
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Low confidence - manual review recommended</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
};

// Use case: Pattern match score
export const PatternMatch: Story = {
  name: "Use Case: Pattern Match Score",
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Pattern Selection</h3>
      <div className="p-4 border border-gray-200 rounded-md space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">shadcn/ui Button</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-gray-600 cursor-help">
                Match: 92%
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">Match Details:</p>
                <p>• Visual similarity: 95%</p>
                <p>• Token alignment: 88%</p>
                <p>• Behavior match: 93%</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
};

// Use case: Token adherence
export const TokenAdherence: Story = {
  name: "Use Case: Token Adherence",
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Component Preview</h3>
      <div className="p-4 border border-gray-200 rounded-md">
        <div className="flex items-center justify-between">
          <span className="text-sm">Token Adherence</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: "88%" }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">88%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">Design Token Usage:</p>
                <p>• Colors: 95% match</p>
                <p>• Spacing: 82% match</p>
                <p>• Typography: 86% match</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
};

// Use case: Dashboard metrics
export const DashboardMetric: Story = {
  name: "Use Case: Dashboard Metric",
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Dashboard</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 rounded-md">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-gray-600">Components Generated</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total components generated in the last 30 days</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="p-4 border border-gray-200 rounded-md">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <p className="text-2xl font-bold">92%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Components passing all quality checks on first generation</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
};

// Accessibility test
export const AccessibilityTest: Story = {
  name: "Accessibility Test",
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Keyboard Navigation Test</h3>
      <p className="text-sm text-gray-600">
        Tab to focus, press Enter or Space to show tooltip, Escape to dismiss
      </p>
      <div className="flex gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">First</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>First tooltip - keyboard accessible</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Second</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Second tooltip - keyboard accessible</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Third</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Third tooltip - keyboard accessible</p>
          </TooltipContent>
        </Tooltip>
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
            id: "aria-allowed-attr",
            enabled: true
          },
          {
            id: "aria-required-attr",
            enabled: true
          }
        ]
      }
    }
  }
};

// Multi-line content
export const MultiLineContent: Story = {
  name: "Multi-line Content",
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover for details</Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-2">
          <p className="font-semibold">Component Requirements:</p>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>Must support hover trigger</li>
            <li>Keyboard accessible (Tab, Enter, Escape)</li>
            <li>Customizable placement (top, right, bottom, left)</li>
            <li>Configurable delay duration</li>
          </ul>
        </div>
      </TooltipContent>
    </Tooltip>
  )
};
