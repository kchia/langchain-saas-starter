import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { CodePreviewModal, Pattern } from "./CodePreviewModal";
import { Button } from "@/components/ui/button";

const samplePattern: Pattern = {
  id: "shadcn-button-v2",
  name: "shadcn/ui Button",
  version: "v2.1.0",
  code: `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-8"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`,
  language: "typescript",
  metadata: {
    description:
      "A versatile button component built on Radix UI primitives with shadcn/ui styling",
    author: "shadcn",
    license: "MIT",
    repository: "https://github.com/shadcn-ui/ui",
    dependencies: [
      "@radix-ui/react-slot",
      "class-variance-authority",
      "clsx",
      "tailwind-merge"
    ]
  },
  visualPreview: `
    <div class="space-y-4">
      <div class="flex gap-3">
        <button class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium">
          Primary Button
        </button>
        <button class="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 font-medium">
          Secondary Button
        </button>
        <button class="px-4 py-2 text-gray-900 rounded-md hover:bg-gray-100 font-medium">
          Ghost Button
        </button>
      </div>
      <div class="flex gap-3">
        <button class="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 font-medium">
          Small
        </button>
        <button class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium">
          Medium
        </button>
        <button class="px-8 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium">
          Large
        </button>
      </div>
    </div>
  `
};

const meta = {
  title: "Composite/CodePreviewModal",
  component: CodePreviewModal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A composite modal that displays code, visual preview, and metadata for design patterns. Composes Dialog, Tabs, CodeBlock, and Button components."
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    pattern: {
      description:
        "The pattern object containing code, metadata, and preview information"
    },
    onSelect: {
      description: "Callback function when the user selects the pattern",
      action: "selected"
    },
    onClose: {
      description: "Callback function when the user closes the modal",
      action: "closed"
    },
    open: {
      control: "boolean",
      description: "Controls whether the modal is open"
    }
  }
} satisfies Meta<typeof CodePreviewModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with interactive trigger
export const Default: Story = {
  args: {
    pattern: samplePattern,
    onSelect: () => {},
    onClose: () => {},
    open: false
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(
      null
    );

    return (
      <div>
        <Button onClick={() => setOpen(true)}>👁️ Preview Code</Button>

        {open && (
          <CodePreviewModal
            pattern={samplePattern}
            open={open}
            onSelect={(pattern) => {
              setSelectedPattern(pattern);
              console.log("Selected pattern:", pattern);
            }}
            onClose={() => setOpen(false)}
          />
        )}

        {selectedPattern && (
          <div className="mt-4 p-4 border rounded-lg bg-muted">
            <p className="text-sm font-semibold">Selected Pattern:</p>
            <p className="text-sm text-muted-foreground">
              {selectedPattern.name} {selectedPattern.version}
            </p>
          </div>
        )}
      </div>
    );
  }
};

// Always open for documentation
export const AlwaysOpen: Story = {
  args: {
    pattern: samplePattern,
    onSelect: () => {},
    onClose: () => {},
    open: true
  },
  render: (args) => {
    const [open, setOpen] = useState(true);

    return (
      <CodePreviewModal
        {...args}
        open={open}
        onSelect={(pattern) => {
          console.log("Selected:", pattern);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    );
  }
};

// Pattern without visual preview
export const NoVisualPreview: Story = {
  args: {
    pattern: {
      ...samplePattern,
      visualPreview: undefined
    },
    onSelect: () => {},
    onClose: () => {},
    open: true
  },
  render: (args) => {
    const [open, setOpen] = useState(true);

    return (
      <CodePreviewModal
        {...args}
        open={open}
        onSelect={(pattern) => {
          console.log("Selected:", pattern);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    );
  }
};

// Pattern without metadata
export const NoMetadata: Story = {
  args: {
    pattern: {
      ...samplePattern,
      metadata: undefined
    },
    onSelect: () => {},
    onClose: () => {},
    open: true
  },
  render: (args) => {
    const [open, setOpen] = useState(true);

    return (
      <CodePreviewModal
        {...args}
        open={open}
        onSelect={(pattern) => {
          console.log("Selected:", pattern);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    );
  }
};

// Minimal pattern (only required fields)
export const MinimalPattern: Story = {
  args: {
    pattern: {
      id: "minimal-component",
      name: "Minimal Component",
      version: "v1.0.0",
      code: "export const MinimalComponent = () => <div>Hello World</div>"
    },
    onSelect: () => {},
    onClose: () => {},
    open: true
  },
  render: (args) => {
    const [open, setOpen] = useState(true);

    return (
      <CodePreviewModal
        {...args}
        open={open}
        onSelect={(pattern) => {
          console.log("Selected:", pattern);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    );
  }
};

// Long code example
export const LongCode: Story = {
  args: {
    pattern: {
      id: "long-example",
      name: "Complex Component",
      version: "v3.0.0",
      code: Array(50)
        .fill(null)
        .map(
          (_, i) =>
            `// Line ${
              i + 1
            }\nconst example${i} = () => console.log("Example ${i}");`
        )
        .join("\n\n"),
      language: "javascript",
      metadata: {
        description: "A very long code example to test scrolling behavior",
        author: "Test Author",
        license: "MIT"
      }
    },
    onSelect: () => {},
    onClose: () => {},
    open: true
  },
  render: (args) => {
    const [open, setOpen] = useState(true);

    return (
      <CodePreviewModal
        {...args}
        open={open}
        onSelect={(pattern) => {
          console.log("Selected:", pattern);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    );
  }
};

// Different language example
export const PythonCode: Story = {
  args: {
    pattern: {
      id: "python-example",
      name: "Python Component",
      version: "v1.0.0",
      code: `from typing import List, Optional

class DataProcessor:
    """A simple data processor class."""
    
    def __init__(self, name: str):
        self.name = name
        self.data: List[int] = []
    
    def add_item(self, item: int) -> None:
        """Add an item to the data list."""
        self.data.append(item)
    
    def process(self) -> Optional[float]:
        """Process the data and return the average."""
        if not self.data:
            return None
        return sum(self.data) / len(self.data)`,
      language: "python",
      metadata: {
        description: "A Python data processor example",
        author: "Python Team",
        license: "Apache-2.0",
        dependencies: ["typing"]
      }
    },
    onSelect: () => {},
    onClose: () => {},
    open: true
  },
  render: (args) => {
    const [open, setOpen] = useState(true);

    return (
      <CodePreviewModal
        {...args}
        open={open}
        onSelect={(pattern) => {
          console.log("Selected:", pattern);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    );
  }
};

// Accessibility test story
export const AccessibilityTest: Story = {
  name: "Accessibility Features",
  args: {
    pattern: samplePattern,
    onSelect: () => {},
    onClose: () => {},
    open: false
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-muted">
          <h3 className="text-sm font-semibold mb-2">
            Accessibility Features:
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Keyboard navigation (Tab, Shift+Tab, Enter, Escape)</li>
            <li>Focus management with focus trap in modal</li>
            <li>ARIA labels on Dialog, Tabs, and Buttons</li>
            <li>Screen reader announcements for tab changes</li>
            <li>Proper heading hierarchy (DialogTitle is h2)</li>
            <li>Close button accessible via keyboard</li>
          </ul>
        </div>

        <Button onClick={() => setOpen(true)}>
          Test Accessibility (Try Tab, Arrow keys, Escape)
        </Button>

        {open && (
          <CodePreviewModal
            pattern={samplePattern}
            open={open}
            onSelect={(pattern) => {
              console.log("Selected:", pattern);
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    );
  },
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
            id: "aria-allowed-attr",
            enabled: true
          }
        ]
      }
    }
  }
};
