import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SecurityIssuesPanel } from './SecurityIssuesPanel'
import { CodeSanitizationResults } from '@/types'

const meta = {
  title: 'Preview/SecurityIssuesPanel',
  component: SecurityIssuesPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SecurityIssuesPanel>

export default meta
type Story = StoryObj<typeof meta>

// Safe code - no issues
const safeResults: CodeSanitizationResults = {
  is_safe: true,
  issues: [],
}

// Code with eval() usage (high severity)
const evalIssueResults: CodeSanitizationResults = {
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

// Code with dangerouslySetInnerHTML (high severity)
const dangerousHTMLResults: CodeSanitizationResults = {
  is_safe: false,
  issues: [
    {
      type: 'security_violation',
      pattern: 'dangerouslySetInnerHTML',
      line: 25,
      severity: 'high',
    },
  ],
}

// Code with multiple issues of different severities
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
    {
      type: 'security_violation',
      pattern: 'process\\.env\\.',
      line: 55,
      severity: 'low',
    },
  ],
}

// Code with hardcoded secret (high severity)
const hardcodedSecretResults: CodeSanitizationResults = {
  is_safe: false,
  issues: [
    {
      type: 'security_violation',
      pattern: '(password|api[_-]?key|secret)\\s*=\\s*["\'][^"\']+["\']',
      line: 15,
      severity: 'high',
    },
  ],
}

// Code with custom message
const customMessageResults: CodeSanitizationResults = {
  is_safe: false,
  issues: [
    {
      type: 'security_violation',
      pattern: 'custom-pattern',
      line: 99,
      severity: 'medium',
      message: 'This is a custom security violation message explaining the issue in detail.',
    },
  ],
}

// Code with sanitized version available
const withSanitizedCodeResults: CodeSanitizationResults = {
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
  ],
  sanitized_code: `// Sanitized version of the code
const Button = () => {
  return <button>Click me</button>;
};`,
}

export const Safe: Story = {
  args: {
    sanitizationResults: safeResults,
  },
}

export const EvalViolation: Story = {
  args: {
    sanitizationResults: evalIssueResults,
  },
}

export const DangerouslySetInnerHTML: Story = {
  args: {
    sanitizationResults: dangerousHTMLResults,
  },
}

export const HardcodedSecret: Story = {
  args: {
    sanitizationResults: hardcodedSecretResults,
  },
}

export const MultipleIssues: Story = {
  args: {
    sanitizationResults: multipleIssuesResults,
  },
}

export const CustomMessage: Story = {
  args: {
    sanitizationResults: customMessageResults,
  },
}

export const WithSanitizedCode: Story = {
  args: {
    sanitizationResults: withSanitizedCodeResults,
  },
}
