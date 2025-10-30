import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { EditModal, type Requirement } from "./EditModal";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Composite/EditModal",
  component: EditModal,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
} satisfies Meta<typeof EditModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample requirement data
const sampleRequirement: Requirement = {
  id: "req-001",
  name: "hover state",
  category: "Props",
  type: "Boolean",
  values: "true, false",
  rationale: "Button needs a hover state to provide visual feedback to users",
  confidence: 0.95
};

// Default story
export const Default: Story = {
  args: {
    requirement: sampleRequirement,
    open: true,
    onSave: () => {},
    onCancel: () => {}
  },
  render: () => {
    const [open, setOpen] = useState(true);
    const [requirement, setRequirement] = useState(sampleRequirement);

    return (
      <div>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          ✎ Edit Requirement
        </Button>
        <EditModal
          requirement={requirement}
          open={open}
          onOpenChange={setOpen}
          onSave={(updatedReq) => {
            setRequirement(updatedReq);
            setOpen(false);
            console.log("Saved requirement:", updatedReq);
          }}
          onCancel={() => {
            setOpen(false);
            console.log("Cancelled edit");
          }}
        />
      </div>
    );
  }
};

// Edit Props requirement
export const EditPropsRequirement: Story = {
  name: "Edit Props Requirement",
  render: () => {
    const [open, setOpen] = useState(false);
    const [requirement, setRequirement] = useState<Requirement>({
      id: "req-002",
      name: "disabled state",
      category: "Props",
      type: "Boolean",
      values: "true, false",
      rationale:
        "Button should support a disabled state to prevent user interaction",
      confidence: 0.92
    });

    return (
      <div>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          ✎ Edit Props
        </Button>
        <EditModal
          requirement={requirement}
          open={open}
          onOpenChange={setOpen}
          onSave={(updatedReq) => {
            setRequirement(updatedReq);
            setOpen(false);
            alert(`Saved: ${updatedReq.name}`);
          }}
          onCancel={() => setOpen(false)}
        />
      </div>
    );
  }
};

// Edit Events requirement
export const EditEventsRequirement: Story = {
  name: "Edit Events Requirement",
  render: () => {
    const [open, setOpen] = useState(false);
    const [requirement, setRequirement] = useState<Requirement>({
      id: "req-003",
      name: "onClick handler",
      category: "Events",
      type: "Function",
      values: "(event: MouseEvent) => void",
      rationale: "Button must trigger an onClick event when clicked",
      confidence: 0.98
    });

    return (
      <div>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          ✎ Edit Events
        </Button>
        <EditModal
          requirement={requirement}
          open={open}
          onOpenChange={setOpen}
          onSave={(updatedReq) => {
            setRequirement(updatedReq);
            setOpen(false);
            alert(`Saved: ${updatedReq.name}`);
          }}
          onCancel={() => setOpen(false)}
        />
      </div>
    );
  }
};

// Edit States requirement
export const EditStatesRequirement: Story = {
  name: "Edit States Requirement",
  render: () => {
    const [open, setOpen] = useState(false);
    const [requirement, setRequirement] = useState<Requirement>({
      id: "req-004",
      name: "loading state",
      category: "States",
      type: "Boolean",
      values: "true, false",
      rationale:
        "Button should display a loading indicator during async operations",
      confidence: 0.88
    });

    return (
      <div>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          ✎ Edit States
        </Button>
        <EditModal
          requirement={requirement}
          open={open}
          onOpenChange={setOpen}
          onSave={(updatedReq) => {
            setRequirement(updatedReq);
            setOpen(false);
            alert(`Saved: ${updatedReq.name}`);
          }}
          onCancel={() => setOpen(false)}
        />
      </div>
    );
  }
};

// Edit Accessibility requirement
export const EditAccessibilityRequirement: Story = {
  name: "Edit Accessibility Requirement",
  render: () => {
    const [open, setOpen] = useState(false);
    const [requirement, setRequirement] = useState<Requirement>({
      id: "req-005",
      name: "aria-label",
      category: "Accessibility",
      type: "String",
      values: "any descriptive text",
      rationale: "Button needs aria-label for screen reader accessibility",
      confidence: 0.96
    });

    return (
      <div>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          ✎ Edit A11y
        </Button>
        <EditModal
          requirement={requirement}
          open={open}
          onOpenChange={setOpen}
          onSave={(updatedReq) => {
            setRequirement(updatedReq);
            setOpen(false);
            alert(`Saved: ${updatedReq.name}`);
          }}
          onCancel={() => setOpen(false)}
        />
      </div>
    );
  }
};

// All type options
export const AllTypeOptions: Story = {
  name: "All Type Options (Radio)",
  render: () => {
    const [open, setOpen] = useState(false);
    const [requirement, setRequirement] = useState<Requirement>({
      id: "req-006",
      name: "variant",
      category: "Props",
      type: "String",
      values: "primary, secondary, ghost",
      rationale: "Button supports multiple visual variants",
      confidence: 0.94
    });

    return (
      <div>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          ✎ Show All Types
        </Button>
        <EditModal
          requirement={requirement}
          open={open}
          onOpenChange={setOpen}
          onSave={(updatedReq) => {
            setRequirement(updatedReq);
            setOpen(false);
            alert(`Saved: ${updatedReq.name} (Type: ${updatedReq.type})`);
          }}
          onCancel={() => setOpen(false)}
        />
      </div>
    );
  }
};

// Empty rationale
export const EmptyRationale: Story = {
  name: "Empty Rationale",
  render: () => {
    const [open, setOpen] = useState(false);
    const [requirement, setRequirement] = useState<Requirement>({
      id: "req-007",
      name: "size",
      category: "Props",
      type: "String",
      values: "sm, md, lg",
      confidence: 0.85
    });

    return (
      <div>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          ✎ Edit (No Rationale)
        </Button>
        <EditModal
          requirement={requirement}
          open={open}
          onOpenChange={setOpen}
          onSave={(updatedReq) => {
            setRequirement(updatedReq);
            setOpen(false);
            alert(`Saved: ${updatedReq.name}`);
          }}
          onCancel={() => setOpen(false)}
        />
      </div>
    );
  }
};

// Accessibility test
export const AccessibilityTest: Story = {
  name: "Accessibility Test",
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <EditModal
        requirement={sampleRequirement}
        open={open}
        onOpenChange={setOpen}
        onSave={(updatedReq) => {
          console.log("Saved:", updatedReq);
          setOpen(false);
        }}
        onCancel={() => {
          console.log("Cancelled");
          setOpen(false);
        }}
      />
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
            id: "label",
            enabled: true
          }
        ]
      }
    }
  }
};

// Interactive example with multiple edits
export const InteractiveExample: Story = {
  name: "Interactive Example",
  render: () => {
    const [open, setOpen] = useState(false);
    const [requirements, setRequirements] = useState<Requirement[]>([
      {
        id: "req-001",
        name: "hover state",
        category: "Props",
        type: "Boolean",
        values: "true, false",
        rationale: "Visual feedback on hover",
        confidence: 0.95
      },
      {
        id: "req-002",
        name: "onClick",
        category: "Events",
        type: "Function",
        values: "() => void",
        rationale: "Handle click events",
        confidence: 0.98
      },
      {
        id: "req-003",
        name: "aria-label",
        category: "Accessibility",
        type: "String",
        values: "descriptive text",
        rationale: "Screen reader support",
        confidence: 0.92
      }
    ]);
    const [editingRequirement, setEditingRequirement] =
      useState<Requirement | null>(null);

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Requirements List</h3>
        <div className="space-y-2">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between border rounded-lg p-4"
            >
              <div>
                <p className="font-medium">{req.name}</p>
                <p className="text-sm text-gray-600">
                  {req.category} • {req.type}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingRequirement(req);
                  setOpen(true);
                }}
              >
                ✎ Edit
              </Button>
            </div>
          ))}
        </div>
        {editingRequirement && (
          <EditModal
            requirement={editingRequirement}
            open={open}
            onOpenChange={setOpen}
            onSave={(updatedReq) => {
              setRequirements((prev) =>
                prev.map((r) => (r.id === updatedReq.id ? updatedReq : r))
              );
              setOpen(false);
              setEditingRequirement(null);
            }}
            onCancel={() => {
              setOpen(false);
              setEditingRequirement(null);
            }}
          />
        )}
      </div>
    );
  }
};
