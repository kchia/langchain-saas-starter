# Epic 3: Pattern Retrieval - Frontend Implementation

## Overview
This directory contains all frontend components for Epic 3 Pattern Retrieval & Matching feature. The implementation follows the task breakdown in `.claude/epics/03-pattern-retrieval-tasks.md` and commit strategy in `.claude/epics/03-commit-strategy.md`.

## Architecture

### State Management
- **Pattern Selection Store** (`store/patternSelectionStore.ts`)
  - Zustand store with localStorage persistence
  - Tracks selected pattern (single selection)
  - Tracks comparison patterns (up to 3)
  - Type-safe with TypeScript

### API Integration
- **Types** (`types/retrieval.ts`)
  - `RetrievalRequest` - Request payload with requirements
  - `RetrievalResponse` - Response with patterns and metadata
  - `PatternMatch` - Individual pattern with scores and explanation
  - `RetrievalMetadata` - Search performance metrics

- **API Client** (`lib/api/retrieval.ts`)
  - Type-safe Axios client
  - POST `/api/v1/retrieval/search` endpoint

- **React Query Hook** (`hooks/usePatternRetrieval.ts`)
  - TanStack Query integration
  - 5-minute cache with retry logic
  - Loading, success, and error states

### UI Components (`components/patterns/`)

#### Core Display Components
1. **SearchSummary** - Displays retrieval metadata
   - Query construction
   - Methods used (BM25, Semantic badges)
   - Total patterns searched
   - Latency with target comparison

2. **DetailedPatternCard** - Enhanced pattern card
   - Rank numbering (1️⃣, 2️⃣, 3️⃣)
   - Pattern name, source, version
   - Confidence score with color-coding
   - SELECTED badge for chosen pattern
   - Score visualization (Progress bar)
   - Match highlights
   - Retrieval details accordion
   - Action buttons (Preview, Select)

3. **MatchHighlights** - Matched features display
   - Matched props (green badges)
   - Matched variants (green badges)
   - Matched a11y features (green badges)

4. **RetrievalDetails** - Score breakdown accordion
   - BM25 score + rank (weight: 30%)
   - Semantic score + rank (weight: 70%)
   - Final weighted score
   - Match reason explanation

5. **PatternLibraryInfo** - Library metadata sidebar
   - Total patterns available
   - Supported component types
   - Quality metrics (MRR, Hit@3)

6. **PatternList** - Pattern orchestrator
   - Maps over patterns
   - Handles selection state
   - Shows empty state

#### State Components
7. **PatternSkeleton** - Loading state
   - Matches DetailedPatternCard structure
   - Shows 3 skeleton cards

8. **ErrorState** - Error display
   - User-friendly error messages
   - Retry button
   - Network error detection

9. **EmptyState** - No patterns found
   - Helpful suggestions
   - Back to requirements button

### Page Integration (`app/patterns/page.tsx`)
- Fetches patterns based on Epic 2 requirements
- Displays loading, error, and success states
- 2-column responsive layout with sticky sidebar
- Pattern preview dialog with code display
- Navigation to Epic 4 (Preview)

## Component Tree

```
PatternsPage
├── SearchSummary (if data)
├── Grid Layout
│   ├── Main Column (2/3)
│   │   ├── PatternSkeletonList (if loading)
│   │   ├── ErrorState (if error)
│   │   ├── EmptyState (if no patterns)
│   │   └── PatternList (if patterns)
│   │       └── DetailedPatternCard (per pattern)
│   │           ├── MatchHighlights
│   │           └── RetrievalDetails
│   └── Sidebar (1/3)
│       └── PatternLibraryInfo
├── Navigation Buttons
└── Pattern Preview Dialog
```

## State Flow

```
Epic 2 (Requirements)
    ↓
useWorkflowStore
    ↓
Build requirements object
    ↓
usePatternRetrieval hook
    ↓
TanStack Query → API call
    ↓
Display patterns
    ↓
User selects pattern
    ↓
usePatternSelection store
    ↓
Epic 4 (Preview/Generation)
```

## Usage Example

```typescript
import { usePatternRetrieval } from '@/hooks/usePatternRetrieval';
import { usePatternSelection } from '@/store/patternSelectionStore';
import { PatternList, SearchSummary } from '@/components/patterns';

function MyComponent() {
  // Fetch patterns
  const { data, isLoading, error } = usePatternRetrieval({
    requirements: {
      component_type: 'Button',
      props: ['variant', 'size'],
      variants: ['primary', 'secondary'],
      a11y: ['aria-label', 'keyboard-navigation'],
    },
  });

  // Selection state
  const { selectedPattern, selectPattern } = usePatternSelection();

  // Handle selection
  const handleSelect = (pattern) => {
    selectPattern(pattern);
  };

  return (
    <>
      {data?.retrieval_metadata && (
        <SearchSummary metadata={data.retrieval_metadata} />
      )}
      <PatternList
        patterns={data?.patterns || []}
        selectedPatternId={selectedPattern?.pattern_id}
        onSelectPattern={handleSelect}
      />
    </>
  );
}
```

## Component Props

### SearchSummary
```typescript
interface SearchSummaryProps {
  metadata: RetrievalMetadata;
}
```

### DetailedPatternCard
```typescript
interface DetailedPatternCardProps {
  pattern: PatternMatch;
  rank: number;
  selected?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
  className?: string;
}
```

### PatternList
```typescript
interface PatternListProps {
  patterns: PatternMatch[];
  selectedPatternId?: string | null;
  onSelectPattern?: (pattern: PatternMatch) => void;
  onPreviewPattern?: (pattern: PatternMatch) => void;
}
```

## Styling

All components use:
- **Tailwind CSS** for styling
- **shadcn/ui** base components (Card, Badge, Button, Progress, Accordion, Alert)
- **Lucide React** for icons
- **Color-coded badges**:
  - ≥0.9 confidence: `success` (green)
  - 0.7-0.9 confidence: `warning` (yellow)
  - <0.7 confidence: `error` (red)

## Responsive Design

- **Mobile**: Single column layout
- **Tablet**: 2-column grid
- **Desktop**: 2-column with sticky sidebar (2/3 + 1/3)

## Accessibility

- Semantic HTML with ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Color contrast compliance

## Testing

### TypeScript
```bash
cd app && npx tsc --noEmit
```

### Build
```bash
cd app && npm run build
```

### Linting
```bash
cd app && npm run lint
```

## Dependencies

- `zustand` - State management
- `@tanstack/react-query` - Data fetching
- `axios` - HTTP client
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `@radix-ui/*` - UI primitives (via shadcn/ui)

## Next Steps

### F3: Pattern Code Preview Modal (P1 - Optional)
- Enhance preview modal with:
  - Syntax-highlighted code display
  - Tabs (Code, Metadata, Examples)
  - Copy to clipboard
  - Props table
  - Usage examples

### F2: Pattern Comparison Modal (P2 - Optional)
- Side-by-side comparison
- Highlight differences
- Compare 2-3 patterns
- Pros/cons display

### Testing
- Unit tests for components
- Integration tests for page
- E2E tests with Playwright

## Files Created

```
app/src/
├── store/
│   └── patternSelectionStore.ts
├── types/
│   └── retrieval.ts
├── lib/api/
│   └── retrieval.ts
├── hooks/
│   └── usePatternRetrieval.ts
├── components/patterns/
│   ├── SearchSummary.tsx
│   ├── MatchHighlights.tsx
│   ├── RetrievalDetails.tsx
│   ├── PatternLibraryInfo.tsx
│   ├── DetailedPatternCard.tsx
│   ├── PatternList.tsx
│   ├── PatternSkeleton.tsx
│   ├── ErrorState.tsx
│   ├── EmptyState.tsx
│   └── index.ts
└── app/patterns/
    └── page.tsx (updated)
```

## Success Metrics

✅ All P0 and P1 frontend tasks completed
✅ Type-safe implementation with TypeScript
✅ Responsive design (mobile, tablet, desktop)
✅ Comprehensive error handling
✅ Loading states for UX
✅ State persistence across navigation
✅ Integration with Epic 2 (Requirements)
✅ Ready for Epic 4 (Preview/Generation)

## References

- Task Document: `.claude/epics/03-pattern-retrieval-tasks.md`
- Commit Strategy: `.claude/epics/03-commit-strategy.md`
- Wireframe: `.claude/wireframes/pattern-selection-page.html`
- Base Components: `.claude/BASE-COMPONENTS.md`
