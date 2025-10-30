import type { Meta, StoryObj } from '@storybook/nextjs'
import { CodeBlock } from './code-block'

const meta = {
  title: 'UI/CodeBlock',
  component: CodeBlock,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    code: {
      control: 'text',
      description: 'The code content to display',
    },
    language: {
      control: 'select',
      options: ['typescript', 'tsx', 'javascript', 'jsx', 'json', 'css', 'html', 'python', 'bash'],
      description: 'Programming language for syntax highlighting',
    },
    showLineNumbers: {
      control: 'boolean',
      description: 'Whether to show line numbers',
    },
    maxHeight: {
      control: 'text',
      description: 'Maximum height of the code block (CSS value)',
    },
  },
} satisfies Meta<typeof CodeBlock>

export default meta
type Story = StoryObj<typeof meta>

// Sample TypeScript code
const typescriptCode = `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-white",
        outline: "border bg-background",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
      },
    },
  }
)`

// Sample TSX code
const tsxCode = `export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}`

// Sample JSON code
const jsonCode = `{
  "colors": {
    "primary": "#3B82F6",
    "success": "#10B981",
    "warning": "#F59E0B",
    "error": "#EF4444"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "fontSize": {
      "sm": "14px",
      "base": "16px",
      "lg": "18px"
    }
  }
}`

// Sample CSS code
const cssCode = `.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.button-primary {
  background-color: #3B82F6;
  color: white;
}

.button-primary:hover {
  background-color: #2563EB;
}`

// Default story with TypeScript code
export const Default: Story = {
  args: {
    code: typescriptCode,
    language: 'typescript',
    showLineNumbers: false,
    maxHeight: '400px',
  },
}

// TypeScript with line numbers
export const TypeScriptWithLineNumbers: Story = {
  args: {
    code: typescriptCode,
    language: 'typescript',
    showLineNumbers: true,
    maxHeight: '400px',
  },
}

// TSX code example
export const TSXComponent: Story = {
  args: {
    code: tsxCode,
    language: 'tsx',
    showLineNumbers: true,
    maxHeight: '300px',
  },
}

// JSON code example
export const JSONTokens: Story = {
  args: {
    code: jsonCode,
    language: 'json',
    showLineNumbers: false,
    maxHeight: '400px',
  },
}

// CSS code example
export const CSSStyles: Story = {
  args: {
    code: cssCode,
    language: 'css',
    showLineNumbers: true,
    maxHeight: '300px',
  },
}

// Short code snippet
export const ShortSnippet: Story = {
  args: {
    code: 'const greeting = "Hello, ComponentForge!"',
    language: 'javascript',
    showLineNumbers: false,
    maxHeight: '100px',
  },
}

// Long code with scrolling
const longCode = Array.from({ length: 50 }, (_, i) => 
  `// Line ${i + 1}\nfunction example${i + 1}() {\n  return "code";\n}`
).join('\n\n')

export const LongCodeWithScroll: Story = {
  args: {
    code: longCode,
    language: 'javascript',
    showLineNumbers: true,
    maxHeight: '400px',
  },
}

// ComponentForge Use Cases
export const ComponentPreviewUseCase: Story = {
  render: () => (
    <div className="space-y-4 max-w-4xl">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Generated Component Code
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        This is how the Code Block appears on the Component Preview page,
        showing the generated component code with 50+ lines.
      </p>
      <CodeBlock
        code={typescriptCode + '\n\n' + tsxCode}
        language="tsx"
        showLineNumbers={true}
        maxHeight="500px"
      />
    </div>
  ),
}

export const PatternSelectionUseCase: Story = {
  render: () => (
    <div className="space-y-4 max-w-4xl">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Pattern Code Preview
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Preview of pattern code on the Pattern Selection page (20+ lines).
      </p>
      <CodeBlock
        code={tsxCode}
        language="tsx"
        showLineNumbers={false}
        maxHeight="300px"
      />
    </div>
  ),
}

export const TokenExtractionUseCase: Story = {
  render: () => (
    <div className="space-y-4 max-w-4xl">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        JSON Token Output
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Extracted design tokens displayed as JSON on the Token Extraction page.
      </p>
      <CodeBlock
        code={jsonCode}
        language="json"
        showLineNumbers={false}
        maxHeight="300px"
      />
    </div>
  ),
}

// Accessibility Test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4 max-w-4xl">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Keyboard Navigation & Screen Reader Test
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Tab to the Copy button, press Enter or Space to copy code.
        Screen readers should announce the language and copy status.
      </p>
      <CodeBlock
        code={typescriptCode}
        language="typescript"
        showLineNumbers={true}
        maxHeight="300px"
      />
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
        <h4 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
          Accessibility Features:
        </h4>
        <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
          <li>✓ Keyboard accessible copy button</li>
          <li>✓ ARIA labels for screen readers</li>
          <li>✓ Visual feedback on copy action</li>
          <li>✓ Semantic HTML structure</li>
          <li>✓ High contrast text (gray-100 on gray-900)</li>
          <li>✓ Focus indicators on interactive elements</li>
        </ul>
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
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'aria-allowed-attr',
            enabled: true,
          },
        ],
      },
    },
  },
}
