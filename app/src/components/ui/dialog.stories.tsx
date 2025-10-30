import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import { Button } from './button'

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled open state of the dialog',
    },
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

// Basic Dialog with trigger button
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
}

// Dialog with form inputs (Edit Requirement pattern)
export const WithForm: Story = {
  name: 'Dialog with Form (Edit Modal)',
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost">✎ Edit</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Requirement</DialogTitle>
            <DialogDescription>
              Make changes to this requirement here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                defaultValue="hover state"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option>Props</option>
                <option>Events</option>
                <option>States</option>
                <option>Accessibility</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="type" className="text-right text-sm font-medium">
                Type
              </label>
              <select
                id="type"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option>Boolean</option>
                <option>String</option>
                <option>Number</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="values" className="text-right text-sm font-medium">
                Values
              </label>
              <input
                id="values"
                defaultValue="true, false"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
}

// Dialog with tabs (Code Preview Modal pattern)
export const CodePreview: Story = {
  name: 'Dialog with Tabs (Code Preview)',
  render: () => {
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('code')

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">👁️ Preview Code</Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Pattern Preview: shadcn/ui Button v2.1.0</DialogTitle>
            <DialogDescription>
              View the code, visual preview, and metadata for this pattern
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'code'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab('visual')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'visual'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Visual
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'metadata'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Metadata
              </button>
            </div>

            {/* Tab Content */}
            <div className="overflow-auto max-h-[60vh]">
              {activeTab === 'code' && (
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                  <code>{`export function Button({ variant, ...props }) {
  return (
    <button
      className={buttonVariants({ variant })}
      {...props}
    />
  )
}`}</code>
                </pre>
              )}
              {activeTab === 'visual' && (
                <div className="p-4 space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="default">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </div>
              )}
              {activeTab === 'metadata' && (
                <div className="p-4 space-y-2 text-sm">
                  <div>
                    <strong>Pattern ID:</strong> button-2.1.0
                  </div>
                  <div>
                    <strong>Dependencies:</strong> @radix-ui/react-slot
                  </div>
                  <div>
                    <strong>Props:</strong> variant, size, disabled, asChild
                  </div>
                  <div>
                    <strong>Match Score:</strong> 0.92
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setOpen(false)}>✓ Select This Pattern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
}

// Controlled dialog example
export const Controlled: Story = {
  name: 'Controlled State',
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)}>Open Dialog</Button>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={!open}>
            Close Dialog
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Dialog is currently: <strong>{open ? 'Open' : 'Closed'}</strong>
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled Dialog</DialogTitle>
              <DialogDescription>
                This dialog&apos;s open state is controlled by external buttons.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm">
                You can close this dialog by:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>Clicking the X button</li>
                <li>Clicking outside the dialog</li>
                <li>Pressing the Escape key</li>
                <li>Clicking the external &quot;Close Dialog&quot; button</li>
              </ul>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
}

// Small dialog
export const Small: Story = {
  name: 'Small Size',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Small Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[325px]">
        <DialogHeader>
          <DialogTitle>Delete Component?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// Large dialog with scrollable content
export const Large: Story = {
  name: 'Large Size with Scroll',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Large Dialog</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Quality Report</DialogTitle>
          <DialogDescription>
            Complete accessibility and quality analysis
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-auto flex-1 py-4">
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Accessibility Score: 95%</h3>
              <p className="text-sm text-muted-foreground">
                Component meets WCAG 2.1 AA standards
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Token Adherence: 88%</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Colors match design tokens</li>
                <li>✓ Spacing uses 8px grid</li>
                <li>⚠ Font weight needs adjustment</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Code Quality: 92%</h3>
              <p className="text-sm text-muted-foreground">
                Follows best practices and style guide
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Performance: 98%</h3>
              <p className="text-sm text-muted-foreground">
                Optimized rendering and minimal re-renders
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Browser Support</h3>
              <p className="text-sm text-muted-foreground">
                Compatible with all modern browsers
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Download Report</Button>
          <Button>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

// Use case: Requirements Review page
export const RequirementsPage: Story = {
  name: 'Use Case: Requirements Review',
  render: () => {
    const [editOpen, setEditOpen] = useState(false)

    return (
      <div className="space-y-4 max-w-2xl">
        <h3 className="text-sm font-semibold">Requirements Page Dialog Usage</h3>
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-sm text-muted-foreground">req-006</span>
              <h4 className="font-medium">hover state</h4>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                ✓ Accept
              </Button>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    ✎ Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Requirement</DialogTitle>
                    <DialogDescription>
                      Modify the requirement details below
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm font-medium">Name</label>
                      <input
                        defaultValue="hover state"
                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm font-medium">Category</label>
                      <select className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>Props</option>
                        <option selected>States</option>
                        <option>Events</option>
                        <option>Accessibility</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setEditOpen(false)}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm">
                ✗ Remove
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  },
}
