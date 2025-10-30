/**
 * RequirementEditor component provides a modal dialog for editing
 * or creating custom requirements with validation.
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  RequirementProposal,
  RequirementCategory,
} from '@/types/requirement.types';

interface RequirementEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (requirement: RequirementProposal) => void;
  requirement?: RequirementProposal | null;
  mode: 'edit' | 'create';
}

export function RequirementEditor({
  open,
  onClose,
  onSave,
  requirement,
  mode,
}: RequirementEditorProps) {
  const [formData, setFormData] = React.useState<Partial<RequirementProposal>>(
    requirement || {
      id: `req-${Date.now()}`,
      category: RequirementCategory.PROPS,
      name: '',
      values: [],
      confidence: 1.0,
      rationale: '',
      approved: false,
      edited: true,
    }
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [valuesInput, setValuesInput] = React.useState(
    formData.values?.join(', ') || ''
  );

  // Update form when requirement prop changes
  React.useEffect(() => {
    if (requirement) {
      setFormData(requirement);
      setValuesInput(requirement.values?.join(', ') || '');
    }
  }, [requirement]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name (required, valid identifier)
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.name)) {
      newErrors.name = 'Name must be a valid identifier (e.g., variant, onClick)';
    }

    // Validate category
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Validate rationale
    if (!formData.rationale?.trim()) {
      newErrors.rationale = 'Rationale is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validate()) return;

    // Parse values from comma-separated input
    const values = valuesInput
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    const updatedRequirement: RequirementProposal = {
      ...formData,
      id: formData.id || `req-${Date.now()}`,
      category: formData.category!,
      name: formData.name!,
      values: values.length > 0 ? values : undefined,
      confidence: formData.confidence || 1.0,
      rationale: formData.rationale || '',
      approved: false,
      edited: true,
    } as RequirementProposal;

    onSave(updatedRequirement);
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Requirement' : 'Add Custom Requirement'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Modify the requirement details below'
              : 'Create a custom requirement not detected by AI'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value as RequirementCategory })
              }
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RequirementCategory.PROPS}>Props</SelectItem>
                <SelectItem value={RequirementCategory.EVENTS}>Events</SelectItem>
                <SelectItem value={RequirementCategory.STATES}>States</SelectItem>
                <SelectItem value={RequirementCategory.ACCESSIBILITY}>
                  Accessibility
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., variant, onClick, aria-label"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errors.name}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Values (for props) */}
          {formData.category === RequirementCategory.PROPS && (
            <div className="space-y-2">
              <Label htmlFor="values">Values (comma-separated)</Label>
              <Input
                id="values"
                placeholder="e.g., primary, secondary, ghost"
                value={valuesInput}
                onChange={(e) => setValuesInput(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Enter multiple values separated by commas
              </p>
            </div>
          )}

          {/* Description (for states/a11y) */}
          {(formData.category === RequirementCategory.STATES ||
            formData.category === RequirementCategory.ACCESSIBILITY) && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this requirement..."
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          )}

          {/* Required (for events/a11y) */}
          {(formData.category === RequirementCategory.EVENTS ||
            formData.category === RequirementCategory.ACCESSIBILITY) && (
            <div className="space-y-2">
              <Label htmlFor="required">Required</Label>
              <Select
                value={formData.required ? 'true' : 'false'}
                onValueChange={(value) =>
                  setFormData({ ...formData, required: value === 'true' })
                }
              >
                <SelectTrigger id="required">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Required</SelectItem>
                  <SelectItem value="false">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Rationale */}
          <div className="space-y-2">
            <Label htmlFor="rationale">Rationale</Label>
            <Textarea
              id="rationale"
              placeholder="Explain why this requirement is needed..."
              value={formData.rationale}
              onChange={(e) =>
                setFormData({ ...formData, rationale: e.target.value })
              }
              rows={3}
            />
            {errors.rationale && (
              <p className="text-sm text-red-600">{errors.rationale}</p>
            )}
          </div>

          {/* Validation errors summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the validation errors above before saving.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === 'edit' ? 'Save Changes' : 'Add Requirement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
