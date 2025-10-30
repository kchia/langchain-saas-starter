import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MetricCard } from './MetricCard'
import { Users, Clock, TrendingUp, CheckCircle2, Zap, Activity } from 'lucide-react'

const meta = {
  title: 'Composite/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title/label of the metric',
    },
    value: {
      control: 'text',
      description: 'The main value to display',
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle or additional context',
    },
    trend: {
      control: 'text',
      description: 'Optional trend indicator (e.g., "+25%", "-12%")',
    },
    icon: {
      control: false,
      description: 'Optional icon component from lucide-react',
    },
  },
} satisfies Meta<typeof MetricCard>

export default meta
type Story = StoryObj<typeof meta>

// Default metric card
export const Default: Story = {
  args: {
    title: 'Components',
    value: 12,
    subtitle: '+3 this week',
    trend: '+25%',
    icon: Users,
  },
}

// Positive trend
export const PositiveTrend: Story = {
  args: {
    title: 'Cache Hit Rate',
    value: '78%',
    subtitle: 'Improved efficiency',
    trend: '+5%',
    icon: TrendingUp,
  },
}

// Negative trend
export const NegativeTrend: Story = {
  args: {
    title: 'Avg Generation Time',
    value: '48s',
    subtitle: 'Faster than last week',
    trend: '-12%',
    icon: Clock,
  },
}

// No trend
export const NoTrend: Story = {
  args: {
    title: 'Success Rate',
    value: '94%',
    subtitle: 'Quality maintained',
    icon: CheckCircle2,
  },
}

// No icon
export const NoIcon: Story = {
  args: {
    title: 'Total Patterns',
    value: 28,
    subtitle: 'Available patterns',
    trend: '+3%',
  },
}

// Large value
export const LargeValue: Story = {
  args: {
    title: 'Total Requests',
    value: '1,234,567',
    subtitle: 'All time',
    trend: '+15%',
    icon: Activity,
  },
}

// Simple metric
export const Simple: Story = {
  args: {
    title: 'Active Users',
    value: 42,
  },
}

// With custom icon
export const WithCustomIcon: Story = {
  args: {
    title: 'Performance',
    value: '99.9%',
    subtitle: 'Uptime this month',
    trend: '+0.1%',
    icon: Zap,
  },
}

// Dashboard metrics grid
export const DashboardMetrics: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[600px]">
      <MetricCard
        title="Components"
        value={12}
        subtitle="+3 this week"
        trend="+25%"
        icon={Users}
      />
      <MetricCard
        title="Avg Generation Time"
        value="48s"
        subtitle="Faster than last week"
        trend="-12%"
        icon={Clock}
      />
      <MetricCard
        title="Cache Hit Rate"
        value="78%"
        subtitle="Improved efficiency"
        trend="+5%"
        icon={TrendingUp}
      />
      <MetricCard
        title="Success Rate"
        value="94%"
        subtitle="Quality improved"
        trend="+2%"
        icon={CheckCircle2}
      />
    </div>
  ),
}

// Accessibility test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <h3 className="text-sm font-semibold">Screen Reader Test</h3>
      <p className="text-sm text-gray-600">
        Test with a screen reader to ensure all values are announced correctly
      </p>
      <div className="space-y-3">
        <MetricCard
          title="Components"
          value={12}
          subtitle="+3 this week"
          trend="+25%"
          icon={Users}
        />
        <MetricCard
          title="Avg Time"
          value="48s"
          subtitle="Faster"
          trend="-12%"
          icon={Clock}
        />
        <MetricCard
          title="Success Rate"
          value="94%"
          icon={CheckCircle2}
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
            id: 'label',
            enabled: true,
          },
        ],
      },
    },
  },
}

// All variations
export const AllVariations: Story = {
  render: () => (
    <div className="space-y-6 w-[400px]">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">With Icon and Trend</h3>
        <MetricCard
          title="Components"
          value={12}
          subtitle="+3 this week"
          trend="+25%"
          icon={Users}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Negative Trend</h3>
        <MetricCard
          title="Avg Generation Time"
          value="48s"
          subtitle="Faster than last week"
          trend="-12%"
          icon={Clock}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">No Trend</h3>
        <MetricCard
          title="Success Rate"
          value="94%"
          subtitle="Quality maintained"
          icon={CheckCircle2}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">No Icon</h3>
        <MetricCard
          title="Total Patterns"
          value={28}
          subtitle="Available patterns"
          trend="+3%"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Minimal</h3>
        <MetricCard
          title="Active Users"
          value={42}
        />
      </div>
    </div>
  ),
}
