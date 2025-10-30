# Epic 8: Regeneration & Versioning

**Status**: Not Started
**Priority**: Medium
**Epic Owner**: Backend/Frontend Team
**Estimated Tasks**: 7
**Depends On**: Epic 4 (Code Generation), Epic 6 (Production Infrastructure)

---

## Overview

Build component versioning system that tracks changes over time and supports regeneration when tokens or designs change. Includes diff preview UI, version history, rollback mechanism, change detection, and automated regeneration triggers.

---

## Goals

1. Track component versions with full history
2. Regenerate components when tokens or designs change
3. Show diff preview before applying updates
4. Maintain version history with rollback capability
5. Implement rollback mechanism to previous versions
6. Detect changes in tokens, requirements, or patterns
7. Support automated regeneration triggers

---

## Success Criteria

- ✅ All component versions stored with metadata
- ✅ Regeneration preserves custom modifications (with warnings)
- ✅ Diff preview shows changes clearly
- ✅ Version history accessible via UI and API
- ✅ Rollback to any previous version works
- ✅ Change detection identifies token/design modifications
- ✅ Automated regeneration triggers on design updates
- ✅ Version branching for experimental changes

---

## Tasks

### Task 1: Component Version Tracking
**Acceptance Criteria**:
- [ ] Store all component versions in PostgreSQL
- [ ] Version metadata includes:
  - Version number (semantic: major.minor.patch)
  - Timestamp
  - Tokens hash
  - Requirements hash
  - Pattern ID and version
  - Generation parameters
  - Author/trigger (user or automated)
  - Status (draft, active, archived)
- [ ] Store full component code for each version
- [ ] Track relationships between versions
- [ ] Support version tags (e.g., "stable", "experimental")
- [ ] Query versions by component ID and filters

**Files**:
- `backend/src/database/models.py` (ComponentVersion model)
- `backend/alembic/versions/003_add_versioning.py`

**Database Model**:
```python
from sqlalchemy import Column, String, Integer, DateTime, JSON, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

class ComponentVersion(Base):
    __tablename__ = "component_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    component_id = Column(UUID(as_uuid=True), ForeignKey('components.id'), nullable=False)

    # Semantic version
    major = Column(Integer, nullable=False)
    minor = Column(Integer, nullable=False)
    patch = Column(Integer, nullable=False)

    # Version metadata
    created_at = Column(DateTime, nullable=False)
    created_by = Column(String(255))  # user_id or "system"
    trigger = Column(String(50))  # "manual", "token_change", "design_change"

    # Generation inputs (for reproducibility)
    tokens_hash = Column(String(64), nullable=False)
    requirements_hash = Column(String(64), nullable=False)
    pattern_id = Column(String(255), nullable=False)
    pattern_version = Column(String(50))

    tokens = Column(JSON, nullable=False)
    requirements = Column(JSON, nullable=False)

    # Generated code
    component_code = Column(Text, nullable=False)
    stories_code = Column(Text)

    # Status
    status = Column(String(20), default="active")  # draft, active, archived
    tags = Column(JSON)  # ["stable", "experimental", etc.]

    # Relationships
    component = relationship("Component", back_populates="versions")
    parent_version_id = Column(UUID(as_uuid=True), ForeignKey('component_versions.id'))
    children = relationship("ComponentVersion", backref="parent", remote_side=[id])

    # Indexes
    __table_args__ = (
        Index('idx_component_id_version', 'component_id', 'major', 'minor', 'patch'),
        Index('idx_tokens_hash', 'tokens_hash'),
        Index('idx_status', 'status'),
    )

    @property
    def version_string(self) -> str:
        """Return semantic version string."""
        return f"{self.major}.{self.minor}.{self.patch}"

class Component(Base):
    __tablename__ = "components"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)

    current_version_id = Column(UUID(as_uuid=True), ForeignKey('component_versions.id'))
    current_version = relationship("ComponentVersion", foreign_keys=[current_version_id])

    versions = relationship("ComponentVersion", back_populates="component",
                          foreign_keys=[ComponentVersion.component_id])

    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime)
```

**Tests**:
- Versions stored correctly
- Semantic versioning works
- Version history queryable
- Relationships maintained

---

### Task 2: Regeneration Pipeline
**Acceptance Criteria**:
- [ ] Implement regeneration endpoint: `POST /api/v1/regenerate/:id`
- [ ] Detect what changed (tokens, requirements, pattern)
- [ ] Determine version bump type:
  - Patch: Minor code improvements, bug fixes
  - Minor: Token changes, requirement additions
  - Major: Breaking changes, different pattern
- [ ] Preserve user customizations when possible
- [ ] Warn about conflicts with custom changes
- [ ] Run full generation pipeline
- [ ] Create new version record
- [ ] Update component's current_version
- [ ] Return diff and new version

**Files**:
- `backend/src/services/regeneration_service.py`

**Regeneration Service**:
```python
import difflib
from typing import Dict, Any

class RegenerationService:
    def __init__(self, generator_service, version_repository):
        self.generator = generator_service
        self.versions = version_repository

    async def regenerate(self, component_id: str,
                        new_tokens: Dict = None,
                        new_requirements: Dict = None,
                        reason: str = "manual") -> Dict[str, Any]:
        """Regenerate component with new inputs."""
        # Get current version
        component = await self.versions.get_component(component_id)
        current_version = component.current_version

        # Use new inputs or current ones
        tokens = new_tokens or current_version.tokens
        requirements = new_requirements or current_version.requirements

        # Detect changes
        changes = self._detect_changes(current_version, tokens, requirements)

        # Determine version bump
        bump_type = self._determine_version_bump(changes)

        # Generate new code
        result = await self.generator.generate(
            component_type=component.type,
            tokens=tokens,
            requirements=requirements
        )

        # Create new version
        new_version = await self._create_version(
            component_id=component_id,
            previous_version=current_version,
            bump_type=bump_type,
            tokens=tokens,
            requirements=requirements,
            code=result['code'],
            trigger=reason
        )

        # Generate diff
        diff = self._generate_diff(
            current_version.component_code,
            new_version.component_code
        )

        return {
            "component_id": component_id,
            "previous_version": current_version.version_string,
            "new_version": new_version.version_string,
            "changes": changes,
            "diff": diff,
            "version_id": str(new_version.id)
        }

    def _detect_changes(self, current_version, new_tokens, new_requirements):
        """Detect what changed between versions."""
        changes = {
            "tokens": {},
            "requirements": {},
            "summary": []
        }

        # Token changes
        current_tokens = current_version.tokens
        for category in ["colors", "typography", "spacing"]:
            current_cat = current_tokens.get(category, {})
            new_cat = new_tokens.get(category, {})

            for key in set(current_cat.keys()) | set(new_cat.keys()):
                if current_cat.get(key) != new_cat.get(key):
                    changes["tokens"][f"{category}.{key}"] = {
                        "old": current_cat.get(key),
                        "new": new_cat.get(key)
                    }
                    changes["summary"].append(
                        f"Token changed: {category}.{key}"
                    )

        # Requirement changes
        current_reqs = current_version.requirements
        new_reqs = new_requirements

        # Check for added/removed/modified requirements
        # ... implementation

        return changes

    def _determine_version_bump(self, changes: Dict) -> str:
        """Determine version bump type from changes."""
        if changes.get("breaking"):
            return "major"
        elif len(changes.get("tokens", {})) > 0 or \
             len(changes.get("requirements", {})) > 0:
            return "minor"
        else:
            return "patch"

    async def _create_version(self, component_id: str,
                             previous_version,
                             bump_type: str,
                             tokens: Dict,
                             requirements: Dict,
                             code: str,
                             trigger: str):
        """Create new component version."""
        # Calculate new version number
        major, minor, patch = self._bump_version(
            previous_version.major,
            previous_version.minor,
            previous_version.patch,
            bump_type
        )

        # Create version record
        new_version = ComponentVersion(
            component_id=component_id,
            major=major,
            minor=minor,
            patch=patch,
            tokens=tokens,
            requirements=requirements,
            tokens_hash=self._hash(tokens),
            requirements_hash=self._hash(requirements),
            component_code=code,
            parent_version_id=previous_version.id,
            trigger=trigger,
            status="active"
        )

        await self.versions.save(new_version)
        return new_version

    def _bump_version(self, major: int, minor: int, patch: int,
                     bump_type: str) -> tuple:
        """Bump semantic version."""
        if bump_type == "major":
            return (major + 1, 0, 0)
        elif bump_type == "minor":
            return (major, minor + 1, 0)
        else:  # patch
            return (major, minor, patch + 1)

    def _generate_diff(self, old_code: str, new_code: str) -> list:
        """Generate unified diff between versions."""
        return list(difflib.unified_diff(
            old_code.splitlines(keepends=True),
            new_code.splitlines(keepends=True),
            fromfile='current.tsx',
            tofile='new.tsx',
            lineterm=''
        ))
```

**Tests**:
- Regeneration creates new version
- Changes detected correctly
- Version bumping logic correct
- Diff generated accurately

---

### Task 3: Diff Preview UI
**Acceptance Criteria**:
- [ ] Build diff preview component
- [ ] Show side-by-side or unified diff view
- [ ] Syntax highlighting for TypeScript
- [ ] Highlight added/removed/modified lines
- [ ] Collapsible unchanged sections
- [ ] Summary of changes at top
- [ ] Accept/reject changes buttons
- [ ] Download new version
- [ ] Compare any two versions

**Files**:
- `app/src/components/versioning/DiffViewer.tsx`

**Diff Viewer Component**:
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { diffLines, Change } from 'diff';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DiffViewerProps {
  oldCode: string;
  newCode: string;
  oldVersion: string;
  newVersion: string;
  changes: Array<{
    type: string;
    path: string;
    oldValue?: any;
    newValue?: any;
  }>;
  onAccept: () => void;
  onReject: () => void;
}

export function DiffViewer({
  oldCode,
  newCode,
  oldVersion,
  newVersion,
  changes,
  onAccept,
  onReject
}: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');

  const diff = diffLines(oldCode, newCode);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Version Comparison</h2>
          <p className="text-gray-600">
            {oldVersion} → {newVersion}
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={onReject} variant="outline">
            Reject Changes
          </Button>
          <Button onClick={onAccept}>
            Accept & Apply
          </Button>
        </div>
      </div>

      {/* Changes Summary */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold mb-2">Changes Summary</h3>
        <ul className="space-y-1">
          {changes.map((change, i) => (
            <li key={i} className="text-sm">
              <span className="font-mono text-blue-600">{change.path}</span>
              {' '}changed from{' '}
              <code className="bg-red-100 px-1 rounded">{change.oldValue}</code>
              {' '}to{' '}
              <code className="bg-green-100 px-1 rounded">{change.newValue}</code>
            </li>
          ))}
        </ul>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
        <TabsList>
          <TabsTrigger value="unified">Unified</TabsTrigger>
          <TabsTrigger value="split">Split</TabsTrigger>
        </TabsList>

        <TabsContent value="unified">
          <UnifiedDiffView diff={diff} />
        </TabsContent>

        <TabsContent value="split">
          <SplitDiffView oldCode={oldCode} newCode={newCode} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UnifiedDiffView({ diff }: { diff: Change[] }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {diff.map((part, i) => (
        <div
          key={i}
          className={`
            font-mono text-sm p-2
            ${part.added ? 'bg-green-100 text-green-900' : ''}
            ${part.removed ? 'bg-red-100 text-red-900' : ''}
          `}
        >
          <span className="inline-block w-8 text-right mr-2 text-gray-500">
            {part.added ? '+' : part.removed ? '-' : ' '}
          </span>
          {part.value}
        </div>
      ))}
    </div>
  );
}

function SplitDiffView({ oldCode, newCode }: { oldCode: string; newCode: string }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="font-semibold mb-2">Previous Version</h4>
        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
          {oldCode}
        </SyntaxHighlighter>
      </div>
      <div>
        <h4 className="font-semibold mb-2">New Version</h4>
        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
          {newCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
```

**Tests**:
- Diff displays correctly
- Unified and split views work
- Syntax highlighting applies
- Accept/reject buttons functional

---

### Task 4: Version History UI
**Acceptance Criteria**:
- [ ] Display timeline of all component versions
- [ ] Show version number, timestamp, author
- [ ] Display change summary for each version
- [ ] Filter by date range, author, trigger type
- [ ] Compare any two versions
- [ ] View full code for any version
- [ ] Download any version
- [ ] Visual timeline with branching
- [ ] Tag versions (stable, experimental, etc.)

**Files**:
- `app/src/components/versioning/VersionHistory.tsx`

**Version History Component**:
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Version {
  id: string;
  version: string;
  createdAt: Date;
  createdBy: string;
  trigger: string;
  status: string;
  tags: string[];
  changes: string[];
}

interface VersionHistoryProps {
  componentId: string;
  versions: Version[];
  currentVersionId: string;
  onCompare: (v1: string, v2: string) => void;
  onRollback: (versionId: string) => void;
  onDownload: (versionId: string) => void;
}

export function VersionHistory({
  componentId,
  versions,
  currentVersionId,
  onCompare,
  onRollback,
  onDownload
}: VersionHistoryProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  const toggleSelection = (versionId: string) => {
    setSelectedVersions(prev =>
      prev.includes(versionId)
        ? prev.filter(id => id !== versionId)
        : [...prev, versionId].slice(-2) // Max 2 selections
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Version History</h2>

        {selectedVersions.length === 2 && (
          <Button
            onClick={() => onCompare(selectedVersions[0], selectedVersions[1])}
          >
            Compare Selected
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {versions.map((version) => {
          const isCurrent = version.id === currentVersionId;
          const isSelected = selectedVersions.includes(version.id);

          return (
            <div
              key={version.id}
              className={`
                border rounded-lg p-4 cursor-pointer
                ${isCurrent ? 'border-blue-500 bg-blue-50' : ''}
                ${isSelected ? 'ring-2 ring-blue-300' : ''}
              `}
              onClick={() => toggleSelection(version.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-lg">
                    v{version.version}
                  </span>

                  {isCurrent && (
                    <Badge variant="default">Current</Badge>
                  )}

                  {version.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(version.id);
                    }}
                  >
                    Download
                  </Button>

                  {!isCurrent && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRollback(version.id);
                      }}
                    >
                      Rollback
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                <p>
                  Created {formatDistanceToNow(version.createdAt, { addSuffix: true })}
                  {' '}by {version.createdBy}
                </p>
                <p>Trigger: {version.trigger}</p>
              </div>

              {version.changes.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold">Changes:</p>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {version.changes.map((change, i) => (
                      <li key={i}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Tests**:
- Version history displays correctly
- Selection works for comparison
- Download and rollback functional
- Timeline visual accurate

---

### Task 5: Rollback Mechanism
**Acceptance Criteria**:
- [ ] Implement rollback endpoint: `POST /api/v1/rollback/:id`
- [ ] Accept target version ID
- [ ] Validate rollback is allowed (no breaking changes)
- [ ] Create new version based on target
- [ ] Copy code and metadata from target version
- [ ] Increment patch version
- [ ] Update component's current_version
- [ ] Log rollback action
- [ ] Return confirmation with diff

**Files**:
- `backend/src/services/rollback_service.py`

**Rollback Service**:
```python
class RollbackService:
    def __init__(self, version_repository):
        self.versions = version_repository

    async def rollback(self, component_id: str,
                      target_version_id: str,
                      reason: str = "manual_rollback") -> Dict[str, Any]:
        """Rollback component to target version."""
        # Get component and versions
        component = await self.versions.get_component(component_id)
        current_version = component.current_version
        target_version = await self.versions.get_version(target_version_id)

        # Validate rollback
        if not self._can_rollback(current_version, target_version):
            raise ValueError("Rollback not allowed: breaking changes detected")

        # Create new version based on target
        new_version = await self._create_rollback_version(
            component_id=component_id,
            current_version=current_version,
            target_version=target_version,
            reason=reason
        )

        # Update current version pointer
        component.current_version_id = new_version.id
        await self.versions.save_component(component)

        # Generate diff
        diff = difflib.unified_diff(
            current_version.component_code.splitlines(),
            new_version.component_code.splitlines()
        )

        return {
            "component_id": component_id,
            "previous_version": current_version.version_string,
            "rolled_back_to": target_version.version_string,
            "new_version": new_version.version_string,
            "diff": list(diff)
        }

    def _can_rollback(self, current_version, target_version) -> bool:
        """Check if rollback is safe."""
        # Check for breaking changes
        # - TypeScript interface changes
        # - Required prop additions
        # - Event handler signature changes
        return True  # Simplified for now

    async def _create_rollback_version(self, component_id: str,
                                       current_version,
                                       target_version,
                                       reason: str):
        """Create new version from rollback."""
        # Bump patch version
        major, minor, patch = (
            current_version.major,
            current_version.minor,
            current_version.patch + 1
        )

        new_version = ComponentVersion(
            component_id=component_id,
            major=major,
            minor=minor,
            patch=patch,
            tokens=target_version.tokens,
            requirements=target_version.requirements,
            tokens_hash=target_version.tokens_hash,
            requirements_hash=target_version.requirements_hash,
            pattern_id=target_version.pattern_id,
            component_code=target_version.component_code,
            stories_code=target_version.stories_code,
            parent_version_id=current_version.id,
            trigger=reason,
            status="active",
            tags=["rollback"]
        )

        await self.versions.save(new_version)
        return new_version
```

**Tests**:
- Rollback creates new version
- Current version updated
- Validation prevents unsafe rollbacks
- Diff generated correctly

---

### Task 6: Change Detection System
**Acceptance Criteria**:
- [ ] Monitor Figma files for updates (webhook or polling)
- [ ] Detect token changes in design system
- [ ] Detect requirement changes (new props, states)
- [ ] Calculate change significance (minor, major)
- [ ] Notify users of available updates
- [ ] Suggest regeneration when appropriate
- [ ] Track change history
- [ ] Provide change impact analysis

**Files**:
- `backend/src/services/change_detector.py`
- `backend/src/services/figma_webhook.py`

**Change Detector**:
```python
import asyncio
from datetime import datetime, timedelta

class ChangeDetector:
    def __init__(self, figma_client, component_repository):
        self.figma = figma_client
        self.components = component_repository

    async def detect_changes(self, component_id: str) -> Dict[str, Any]:
        """Detect changes in Figma design."""
        component = await self.components.get(component_id)
        current_version = component.current_version

        # Fetch latest from Figma
        figma_data = await self.figma.get_file(component.figma_file_key)

        # Extract current tokens
        current_tokens = await self.figma.extract_tokens(figma_data)

        # Compare with stored tokens
        changes = self._compare_tokens(
            current_version.tokens,
            current_tokens
        )

        if len(changes) > 0:
            return {
                "has_changes": True,
                "component_id": component_id,
                "changes": changes,
                "severity": self._assess_severity(changes),
                "recommendation": self._generate_recommendation(changes)
            }

        return {"has_changes": False}

    def _compare_tokens(self, old_tokens: Dict, new_tokens: Dict) -> list:
        """Compare token dictionaries."""
        changes = []

        for category in ["colors", "typography", "spacing"]:
            old_cat = old_tokens.get(category, {})
            new_cat = new_tokens.get(category, {})

            for key in set(old_cat.keys()) | set(new_cat.keys()):
                if old_cat.get(key) != new_cat.get(key):
                    changes.append({
                        "path": f"{category}.{key}",
                        "old_value": old_cat.get(key),
                        "new_value": new_cat.get(key),
                        "type": "modified" if key in old_cat and key in new_cat else
                               "added" if key in new_cat else "removed"
                    })

        return changes

    def _assess_severity(self, changes: list) -> str:
        """Assess severity of changes."""
        if any(c["type"] == "removed" for c in changes):
            return "major"
        elif len(changes) > 5:
            return "major"
        elif len(changes) > 2:
            return "minor"
        else:
            return "patch"

    def _generate_recommendation(self, changes: list) -> str:
        """Generate recommendation for changes."""
        if len(changes) == 1:
            return f"Single token change detected. Consider regenerating to update {changes[0]['path']}."
        else:
            return f"{len(changes)} token changes detected. Recommend regenerating to apply updates."

    async def monitor_components(self):
        """Background task to monitor all components."""
        while True:
            components = await self.components.get_all_active()

            for component in components:
                try:
                    result = await self.detect_changes(component.id)
                    if result.get("has_changes"):
                        await self._notify_user(component, result)
                except Exception as e:
                    logger.error(f"Error detecting changes for {component.id}: {e}")

            # Check every hour
            await asyncio.sleep(3600)

    async def _notify_user(self, component, changes):
        """Notify user of available updates."""
        # Send notification via email, webhook, or in-app
        pass
```

**Tests**:
- Token changes detected correctly
- Severity assessment accurate
- Recommendations helpful
- Monitoring runs continuously

---

### Task 7: Automated Regeneration Triggers
**Acceptance Criteria**:
- [ ] Support automated regeneration on triggers:
  - Figma file updated (webhook)
  - Token file changed (file watcher)
  - Schedule (e.g., nightly)
  - Manual trigger via API
- [ ] Configure regeneration policy per component:
  - Auto-regenerate on any change
  - Notify and require approval
  - Never auto-regenerate
- [ ] Queue regeneration jobs
- [ ] Rate limit to prevent spam
- [ ] Send notifications on completion
- [ ] Generate summary report

**Files**:
- `backend/src/services/auto_regeneration.py`
- `backend/src/workers/regeneration_worker.py`

**Auto Regeneration**:
```python
from enum import Enum
from celery import Celery

class RegenerationPolicy(Enum):
    AUTO = "auto"
    NOTIFY = "notify"
    MANUAL = "manual"

class AutoRegenerationService:
    def __init__(self, celery_app: Celery,
                 change_detector, regeneration_service):
        self.celery = celery_app
        self.change_detector = change_detector
        self.regeneration = regeneration_service

    async def on_figma_update(self, file_key: str):
        """Handle Figma webhook update."""
        # Find affected components
        components = await self._find_components_by_file(file_key)

        for component in components:
            policy = component.regeneration_policy

            if policy == RegenerationPolicy.AUTO:
                # Queue regeneration job
                self.celery.send_task(
                    'tasks.regenerate_component',
                    args=[component.id],
                    kwargs={'reason': 'figma_update'}
                )
            elif policy == RegenerationPolicy.NOTIFY:
                # Send notification
                await self._notify_updates_available(component)

    async def on_token_change(self, component_id: str):
        """Handle token file change."""
        component = await self.components.get(component_id)

        if component.regeneration_policy == RegenerationPolicy.AUTO:
            # Queue regeneration
            self.celery.send_task(
                'tasks.regenerate_component',
                args=[component_id],
                kwargs={'reason': 'token_change'}
            )

    async def on_schedule(self):
        """Handle scheduled regeneration."""
        # Find components with scheduled regeneration
        components = await self._find_scheduled_components()

        for component in components:
            # Check for changes first
            changes = await self.change_detector.detect_changes(component.id)

            if changes.get("has_changes"):
                self.celery.send_task(
                    'tasks.regenerate_component',
                    args=[component.id],
                    kwargs={'reason': 'scheduled'}
                )

# Celery task
@celery_app.task
def regenerate_component(component_id: str, reason: str):
    """Regenerate component (Celery task)."""
    try:
        result = await regeneration_service.regenerate(
            component_id=component_id,
            reason=reason
        )

        # Send completion notification
        await notification_service.send(
            component_id=component_id,
            message=f"Component regenerated: v{result['new_version']}"
        )

        return result
    except Exception as e:
        logger.error(f"Regeneration failed for {component_id}: {e}")
        raise
```

**Tests**:
- Triggers fire correctly
- Jobs queued properly
- Rate limiting works
- Notifications sent
- Policies enforced

---

## Dependencies

**Requires**:
- Epic 4: Code generation pipeline
- Epic 6: Storage for version artifacts

**Blocks**:
- Design system maintenance workflows

---

## Technical Architecture

### Regeneration Flow

```
Design Change
     ↓
Change Detection
     ↓
Policy Check (auto/notify/manual)
     ↓
Queue Regeneration Job
     ↓
Run Generation Pipeline
     ↓
Create New Version
     ↓
Generate Diff
     ↓
Notify User
```

---

## Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Regeneration Success Rate** | ≥95% | Successful regenerations / Total attempts |
| **Version Storage** | <100MB per component | Database size tracking |
| **Change Detection Latency** | <5 min | Webhook to detection |
| **User Adoption** | 50% use auto-regen | Policy settings |

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Version storage costs high | Medium | Archive old versions, compression |
| Auto-regeneration breaks custom code | High | Warn users, require approval for breaking changes |
| Webhook failures | Medium | Fallback to polling, retry logic |
| Diff computation slow | Low | Cache diffs, compute async |

---

## Definition of Done

- [ ] All 7 tasks completed with acceptance criteria met
- [ ] Version tracking stores all metadata
- [ ] Regeneration pipeline works correctly
- [ ] Diff preview UI functional
- [ ] Version history accessible
- [ ] Rollback mechanism works
- [ ] Change detection identifies updates
- [ ] Automated triggers functional
- [ ] Integration tests passing
- [ ] Documentation updated

---

## Related Epics

- **Depends On**: Epic 4, Epic 6
- **Blocks**: Long-term design system maintenance
- **Related**: Epic 1 (token extraction for change detection)

---

## Notes

**Version Storage**: Consider archiving old versions after 90 days to control storage costs.

**Breaking Changes**: Be very conservative with auto-regeneration when breaking changes detected. Always require approval.

**User Control**: Give users full control over regeneration policy. Default to "notify" for safety.
