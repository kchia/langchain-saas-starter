import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SecurityBadge } from './SecurityBadge'
import { CodeSanitizationResults } from '@/types'

const meta = {
  title: 'Preview/SecurityBadge',
  component: SecurityBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof SecurityBadge>

export default meta
type Story = StoryObj<typeof meta>

// Safe code - no issues
const safeResults: CodeSanitizationResults = {
  is_safe: true,
  issues: [],
}

// Code with one security issue
const oneIssueResults: CodeSanitizationResults = {
  is_safe: false,
  issues: [
    {
      type: 'security_violation',
      pattern: 'eval\\s*\\(',
      line: 10,
      severity: 'high',
    },
  ],
}

// Code with multiple security issues
const multipleIssuesResults: CodeSanitizationResults = {
  is_safe: false,
  issues: [
    {
      type: 'security_violation',
      pattern: 'eval\\s*\\(',
      line: 10,
      severity: 'high',
    },
    {
      type: 'security_violation',
      pattern: 'dangerouslySetInnerHTML',
      line: 25,
      severity: 'high',
    },
    {
      type: 'security_violation',
      pattern: '__proto__',
      line: 42,
      severity: 'medium',
    },
  ],
}

export const Safe: Story = {
  args: {
    sanitizationResults: safeResults,
  },
}

export const OneIssue: Story = {
  args: {
    sanitizationResults: oneIssueResults,
  },
}

export const MultipleIssues: Story = {
  args: {
    sanitizationResults: multipleIssuesResults,
  },
}

export const NotChecked: Story = {
  args: {
    sanitizationResults: undefined,
  },
}

export const Compact: Story = {
  args: {
    sanitizationResults: safeResults,
    compact: true,
  },
}

export const CompactWithIssues: Story = {
  args: {
    sanitizationResults: multipleIssuesResults,
    compact: true,
  },
}
