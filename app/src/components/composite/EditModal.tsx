import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export interface Requirement {
  id: string
  name: string
  category: "Props" | "Events" | "States" | "Accessibility"
  type: "Boolean" | "String" | "Number" | "Object" | "Function"
  values?: string
  rationale?: string
  confidence?: number
}

export interface EditModalProps {
  requirement: Requirement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave: (requirement: Requirement) => void
  onCancel: () => void
}

export function EditModal({
  requirement,
  open,
  onOpenChange,
  onSave,
  onCancel,
}: EditModalProps) {
  const [formData, setFormData] = React.useState<Requirement>(requirement)

  // Update form data when requirement prop changes
  React.useEffect(() => {
    setFormData(requirement)
  }, [requirement])

  const handleSave = () => {
    onSave(formData)
  }

  const handleCancel = () => {
    setFormData(requirement) // Reset form data
    onCancel()
  }

  const handleChange = (field: keyof Requirement, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="edit-requirement-description">
        <DialogHeader>
          <DialogTitle>Edit Requirement</DialogTitle>
          <DialogDescription id="edit-requirement-description">
            Make changes to the requirement details below. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Requirement ID (read-only) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="req-id" className="text-right text-sm font-medium">
              ID
            </Label>
            <Input
              id="req-id"
              value={formData.id}
              disabled
              className="col-span-3"
              aria-label="Requirement ID"
            />
          </div>

          {/* Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="req-name" className="text-right text-sm font-medium">
              Name
            </Label>
            <Input
              id="req-name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="col-span-3"
              placeholder="Enter requirement name"
              aria-label="Requirement name"
              required
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="req-category" className="text-right text-sm font-medium">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                handleChange("category", value as Requirement["category"])
              }
            >
              <SelectTrigger id="req-category" className="col-span-3" aria-label="Category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Props">Props</SelectItem>
                <SelectItem value="Events">Events</SelectItem>
                <SelectItem value="States">States</SelectItem>
                <SelectItem value="Accessibility">Accessibility</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type (Radio Group) */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right text-sm font-medium pt-2">
              Type
            </Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) =>
                handleChange("type", value as Requirement["type"])
              }
              className="col-span-3"
              aria-label="Requirement type"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Boolean" id="type-boolean" />
                <Label htmlFor="type-boolean" className="font-normal cursor-pointer">
                  Boolean
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="String" id="type-string" />
                <Label htmlFor="type-string" className="font-normal cursor-pointer">
                  String
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Number" id="type-number" />
                <Label htmlFor="type-number" className="font-normal cursor-pointer">
                  Number
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Object" id="type-object" />
                <Label htmlFor="type-object" className="font-normal cursor-pointer">
                  Object
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Function" id="type-function" />
                <Label htmlFor="type-function" className="font-normal cursor-pointer">
                  Function
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Values */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="req-values" className="text-right text-sm font-medium">
              Values
            </Label>
            <Input
              id="req-values"
              value={formData.values || ""}
              onChange={(e) => handleChange("values", e.target.value)}
              className="col-span-3"
              placeholder="e.g., true, false (comma-separated)"
              aria-label="Requirement values"
            />
          </div>

          {/* Rationale (Textarea) */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="req-rationale" className="text-right text-sm font-medium pt-2">
              Rationale
            </Label>
            <Textarea
              id="req-rationale"
              value={formData.rationale || ""}
              onChange={(e) => handleChange("rationale", e.target.value)}
              className="col-span-3"
              placeholder="Explain why this requirement is needed..."
              rows={4}
              aria-label="Requirement rationale"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            aria-label="Cancel editing"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            aria-label="Save changes"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
