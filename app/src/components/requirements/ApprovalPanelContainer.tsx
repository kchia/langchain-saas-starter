/**
 * ApprovalPanelContainer connects the ApprovalPanel to the Zustand store
 * and handles all requirement actions (accept, edit, remove, etc.).
 */

'use client';

import React from 'react';
import { ApprovalPanel } from './ApprovalPanel';
import { RequirementEditor } from './RequirementEditor';
import { useWorkflowStore } from '@/stores/useWorkflowStore';
import { RequirementProposal } from '@/types/requirement.types';

export function ApprovalPanelContainer() {
  const {
    componentType,
    componentConfidence,
    proposals,
    updateProposal,
    removeProposal,
    addProposal,
    acceptAllProposals,
  } = useWorkflowStore();

  // Editor state
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingRequirement, setEditingRequirement] =
    React.useState<RequirementProposal | null>(null);
  const [editorMode, setEditorMode] = React.useState<'edit' | 'create'>('edit');

  // Handle accept single requirement
  const handleAccept = (id: string) => {
    updateProposal(id, { approved: true });
  };

  // Handle edit requirement
  const handleEdit = (id: string) => {
    // Find the requirement across all categories
    const allProposals = [
      ...proposals.props,
      ...proposals.events,
      ...proposals.states,
      ...proposals.accessibility,
    ];
    const requirement = allProposals.find((p) => p.id === id);

    if (requirement) {
      setEditingRequirement(requirement);
      setEditorMode('edit');
      setEditorOpen(true);
    }
  };

  // Handle remove requirement
  const handleRemove = (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to remove this requirement? This action cannot be undone.'
      )
    ) {
      removeProposal(id);
    }
  };

  // Handle accept all
  const handleAcceptAll = () => {
    acceptAllProposals();
  };

  // Handle review low confidence (filter to show only low confidence items)
  const handleReviewLowConfidence = () => {
    // For now, this just scrolls to the first low confidence item
    // In a full implementation, this could filter the view
    const allProposals = [
      ...proposals.props,
      ...proposals.events,
      ...proposals.states,
      ...proposals.accessibility,
    ];
    const firstLowConfidence = allProposals.find((p) => p.confidence < 0.8);

    if (firstLowConfidence) {
      // Scroll to the element with the ID
      const element = document.getElementById(`req-${firstLowConfidence.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Handle add custom requirement
  const handleAddCustom = () => {
    setEditingRequirement(null);
    setEditorMode('create');
    setEditorOpen(true);
  };

  // Handle save from editor
  const handleSaveRequirement = (requirement: RequirementProposal) => {
    if (editorMode === 'edit') {
      // Update existing requirement
      updateProposal(requirement.id, requirement);
    } else {
      // Add new requirement
      addProposal(requirement);
    }
    setEditorOpen(false);
    setEditingRequirement(null);
  };

  // Don't render if no component type
  if (!componentType || !componentConfidence) {
    return (
      <div className="text-center py-8 text-gray-500">
        No requirements to display. Please analyze a component first.
      </div>
    );
  }

  return (
    <>
      <ApprovalPanel
        componentType={componentType}
        componentConfidence={componentConfidence}
        proposals={proposals}
        onAccept={handleAccept}
        onEdit={handleEdit}
        onRemove={handleRemove}
        onAcceptAll={handleAcceptAll}
        onReviewLowConfidence={handleReviewLowConfidence}
        onAddCustom={handleAddCustom}
      />

      <RequirementEditor
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingRequirement(null);
        }}
        onSave={handleSaveRequirement}
        requirement={editingRequirement}
        mode={editorMode}
      />
    </>
  );
}
