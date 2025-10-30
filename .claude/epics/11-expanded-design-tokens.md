# EPIC 11: Expanded Design Tokens + Smart Onboarding

**Status**: Planning
**Priority**: High
**Dependencies**: None

---

## 📋 Overview

**Goal**: Expand design token schema to include semantic colors, typography scales, spacing scales, and border radius + add smart onboarding modal for first-time users.

**Scope**: Backend + Frontend changes across type definitions, extraction logic, UI components, and user onboarding.

**Why**:

- Current token schema is too generic (just `Record<string, string>`)
- Real design systems use semantic naming (primary, secondary, accent, etc.)
- Users don't understand what to upload or where to start
- Need structured tokens that match shadcn/ui and Tailwind conventions

**Success Criteria**:

- ✅ 4 token categories (colors, typography, spacing, borderRadius) with semantic naming
- ✅ GPT-4V extraction returns structured tokens with confidence scores
- ✅ Figma extraction maps styles to semantic tokens
- ✅ All tokens editable in UI with visual previews
- ✅ First-time users guided through workflow selection
- ✅ Onboarding state persisted (doesn't re-show)

---

## 🎯 Epic Breakdown

### TASK 1: Expand Backend Token Schema (6 tasks)

**Goal**: Update Pydantic models to use semantic tokens

**Tasks**:

1. **TASK 1.1**: Create `ColorTokens` Pydantic model with semantic fields (primary, secondary, accent, destructive, muted, background, foreground, border)
2. **TASK 1.2**: Create `TypographyTokens` Pydantic model with font scale (xs-4xl), weights, line heights, and font families
3. **TASK 1.3**: Create `SpacingTokens` Pydantic model with Tailwind-compatible scale (xs, sm, md, lg, xl, 2xl, 3xl)
4. **TASK 1.4**: Create `BorderRadiusTokens` Pydantic model with scale (sm, md, lg, xl, full)
5. **TASK 1.5**: Update `DesignTokens` model to use nested Pydantic models instead of `Dict[str, Any]`

**Files Affected**:

- `backend/src/api/v1/routes/figma.py`
- `backend/src/api/v1/routes/tokens.py`

---

### TASK 2: Update GPT-4V Extraction (6 tasks)

**Goal**: Expand prompt to request structured semantic tokens with confidence scores

**Tasks**:

1. **TASK 2.1**: Update `TOKEN_EXTRACTION_PROMPT` to include semantic color names (primary, secondary, accent, etc.)
2. **TASK 2.2**: Update `TOKEN_EXTRACTION_PROMPT` to include typography scale (fontSizeXs through fontSize4xl, weights, line heights)
3. **TASK 2.3**: Update `TOKEN_EXTRACTION_PROMPT` to include spacing scale (xs through 3xl)
4. **TASK 2.4**: Add borderRadius extraction to `TOKEN_EXTRACTION_PROMPT` (sm, md, lg, xl, full)
5. **TASK 2.5**: Update extraction guidelines with semantic naming conventions and confidence scoring rules

**Files Affected**:

- `backend/src/prompts/token_extraction.py`

---

### TASK 3: Update Figma Extraction Logic (5 tasks)

**Goal**: Implement semantic token mapping from Figma styles

**Tasks**:

1. **TASK 3.1**: Rewrite `_extract_color_tokens()` to map Figma style names to semantic tokens with keyword matching
2. **TASK 3.2**: Rewrite `_extract_typography_tokens()` to return structured font scale, weights, and line heights
3. **TASK 3.3**: Rewrite `_extract_spacing_tokens()` to return Tailwind-compatible spacing scale
4. **TASK 3.4**: Create `_extract_border_radius_tokens()` function to extract border radius values
5. **TASK 3.5**: Update `_extract_tokens()` to call all 4 extraction functions and return structured dict

**Files Affected**:

- `backend/src/api/v1/routes/figma.py`

---

### TASK 4: Update Token Validation (1 task)

**Goal**: Validate new token structure in backend

**Tasks**:

1. **TASK 4.1**: Update `_validate_token_structure()` to require 4 categories (colors, typography, spacing, borderRadius)

**Files Affected**:

- `backend/src/agents/token_extractor.py`

---

### TASK 5: Update Frontend Type Definitions (5 tasks)

**Goal**: Mirror backend Pydantic models in TypeScript

**Tasks**:

1. **TASK 5.1**: Create `ColorTokens` TypeScript interface with semantic fields
2. **TASK 5.2**: Create `TypographyTokens` TypeScript interface with font scale and properties
3. **TASK 5.3**: Create `SpacingTokens` TypeScript interface with scale properties
4. **TASK 5.4**: Create `BorderRadiusTokens` TypeScript interface
5. **TASK 5.5**: Update `DesignTokens` interface to use nested typed objects

**Files Affected**:

- `app/src/types/api.types.ts`

---

### TASK 6: Update TokenEditor Component (4 tasks)

**Goal**: Support new token structure in UI

**Tasks**:

1. **TASK 6.1**: Update `TokenData` interface in TokenEditor.tsx to match new structure
2. **TASK 6.2**: Update ColorPicker to handle semantic color names (primary, secondary, etc.)
3. **TASK 6.3**: Update TypographyEditor to display font scale, weights, and line heights
4. **TASK 6.4**: Update SpacingEditor to display Tailwind-compatible spacing scale

**Files Affected**:

- `app/src/components/tokens/TokenEditor.tsx`
- `app/src/components/tokens/ColorPicker.tsx`
- `app/src/components/tokens/TypographyEditor.tsx`
- `app/src/components/tokens/SpacingEditor.tsx`

---

### TASK 7: Create BorderRadiusEditor Component (3 tasks)

**Goal**: New UI component for border radius editing

**Tasks**:

1. **TASK 7.1**: Create BorderRadiusEditor.tsx with visual preview of rounded corners
2. **TASK 7.2**: Add confidence badges to BorderRadiusEditor (color-coded by confidence level)
3. **TASK 7.3**: Integrate BorderRadiusEditor into TokenEditor component

**Files Created**:

- `app/src/components/tokens/BorderRadiusEditor.tsx`

**Files Affected**:

- `app/src/components/tokens/TokenEditor.tsx`

---

### TASK 8: Update Extract Page (2 tasks)

**Goal**: Handle new token structure in extraction flow

**Tasks**:

1. **TASK 8.1**: Update extract/page.tsx `getEditorTokens()` to map new structure with confidence scores
2. **TASK 8.2**: Ensure all 4 token categories render correctly in UI after extraction

**Files Affected**:

- `app/src/app/extract/page.tsx`

---

### TASK 9: Create Onboarding Store (3 tasks)

**Goal**: Zustand store for onboarding state management

**Tasks**:

1. **TASK 9.1**: Create useOnboardingStore.ts with localStorage persistence
2. **TASK 9.2**: Add hasSeenOnboarding, preferredWorkflow, extractionCount state
3. **TASK 9.3**: Implement completeOnboarding, skipOnboarding, incrementExtractionCount actions

**Files Created**:

- `app/src/stores/useOnboardingStore.ts`

---

### TASK 10: Create Onboarding Modal Component (5 tasks)

**Goal**: Smart first-time user guide

**Tasks**:

1. **TASK 10.1**: Create OnboardingModal.tsx with Dialog component from shadcn/ui
2. **TASK 10.2**: Add three workflow cards (Design System, Component Mockups, Figma)
3. **TASK 10.3**: Implement workflow selection logic (navigates to /extract and saves preference)
4. **TASK 10.4**: Add skip button and help text
5. **TASK 10.5**: Integrate modal state with useOnboardingStore

**Files Created**:

- `app/src/components/onboarding/OnboardingModal.tsx`

---

### TASK 11: Integrate Onboarding into App (3 tasks)

Goal: Add modal to application layout

Tasks:

TASK 11.1: Import and add OnboardingModal to app/layout.tsx
TASK 11.2: Test modal shows on first visit only (localStorage check)
TASK 11.3: Add Help button to Navigation component to re-trigger modal
Files Affected:

app/src/app/layout.tsx
app/src/components/layout/Navigation.tsx

### TASK 12: Frontend-Backend Integration (11 tasks)

**Goal**: Ensure complete data flow between frontend and backend for expanded token system, including onboarding integration

**Tasks**:

#### 12.1: API & Data Flow Integration (8 tasks)

1. **TASK 12.1**: Verify API endpoints accept/return new DesignTokens structure

   - Test POST `/tokens/extract/screenshot` with expanded schema (4 categories)
   - Test POST `/tokens/extract/figma` returns semantic tokens
   - Validate confidence scores in API responses
   - Verify error responses for invalid token structures

2. **TASK 12.2**: Test screenshot extraction end-to-end

   - Upload screenshot → verify 4 categories returned (colors, typography, spacing, borderRadius)
   - Check semantic color names mapped correctly (primary, secondary, accent, etc.)
   - Verify borderRadius tokens extracted and displayed
   - Confirm confidence scores flow to UI and badges render

3. **TASK 12.3**: Test Figma extraction end-to-end

   - Connect Figma → verify keyword matching works (primary, brand, main → colors.primary)
   - Check style names mapped to semantic tokens correctly
   - Verify all 4 categories extracted from Figma styles
   - Test with various Figma naming conventions (Primary/Blue, Brand/Main, etc.)

4. **TASK 12.4**: Test token editing flow

   - Edit colors → verify updates persist in state
   - Edit borderRadius → verify visual preview updates in real-time
   - Edit typography → verify font scale changes reflect immediately
   - Test confidence badges remain visible during editing

5. **TASK 12.5**: Test export functionality with new schema

   - Export tokens → verify all 4 categories included in JSON
   - Check Tailwind config includes borderRadius scale
   - Verify CSS variables include all semantic colors
   - Test JSON export matches backend DesignTokens structure

6. **TASK 12.6**: Implement comprehensive error handling

   - Display backend validation errors in UI (e.g., "Missing borderRadius category")
   - Handle missing token categories gracefully with user feedback
   - Show user-friendly messages for API failures
   - Implement retry logic for network errors

7. **TASK 12.7**: Test confidence score integration

   - Verify badges show correct colors: 🟢 High (>0.9), 🟡 Medium (>0.7), 🔴 Low (<0.7)
   - Test threshold logic with various confidence values
   - Confirm confidence data flows from backend to all token editors
   - Test edge cases (null confidence, missing scores)

8. **TASK 12.8**: Integration smoke tests (use Playwright for E2E testing)
   - Complete flow: Upload → Extract → Edit → Export (screenshot)
   - Complete flow: Connect → Extract → Edit → Export (Figma)
   - Test with real design system screenshots (Material, Tailwind palette)
   - Verify with actual Figma files with published styles
   - Performance test with large token sets (50+ tokens)
   - **Testing Framework**: Use Playwright for all E2E integration tests

**Files Affected**:

- `app/src/app/layout.tsx` - Onboarding modal
- `app/src/components/layout/Navigation.tsx` - Help button
- `app/src/app/extract/page.tsx` - API integration and data flow
- `app/src/lib/api.ts` - API client functions (if exists)
- `app/src/components/tokens/TokenEditor.tsx` - Data display and editing
- `app/src/components/tokens/BorderRadiusEditor.tsx` - New component integration
- Backend endpoints - Verification only (no changes)

**Integration Checklist**:

- [ ] All 4 token categories flow from backend to frontend
- [ ] Semantic naming works (primary, secondary, accent, etc.)
- [ ] Confidence scores display correctly in all editors
- [ ] BorderRadius visual previews work
- [ ] Figma keyword matching functions correctly
- [ ] Export includes all new token fields
- [ ] Error messages are user-friendly
- [ ] Onboarding modal appears on first visit only

---

### TASK 13: Testing & Validation (6 tasks)

**Goal**: End-to-end testing of new features

**Tasks**:

1. **TASK 13.1**: Test screenshot extraction returns all 4 token categories with confidence scores
2. **TASK 13.2**: Test Figma extraction returns semantic tokens and borderRadius
3. **TASK 13.3**: Test TokenEditor displays all categories correctly with visual previews
4. **TASK 13.4**: Test onboarding modal shows on first visit and doesn't re-appear
5. **TASK 13.5**: Test workflow selection saves preference and navigates correctly
6. **TASK 13.6**: Verify confidence badges show correct colors (green >0.9, yellow >0.7, red <0.7)

## 🏗️ Technical Architecture

### Backend Token Structure (Pydantic)

```python
class ColorTokens(BaseModel):
    primary: Optional[str] = None
    secondary: Optional[str] = None
    accent: Optional[str] = None
    destructive: Optional[str] = None
    muted: Optional[str] = None
    background: Optional[str] = None
    foreground: Optional[str] = None
    border: Optional[str] = None

class TypographyTokens(BaseModel):
    # Font families
    fontFamily: Optional[str] = None
    fontFamilyHeading: Optional[str] = None
    fontFamilyMono: Optional[str] = None

    # Font scale
    fontSizeXs: Optional[str] = None  # 12px
    fontSizeSm: Optional[str] = None  # 14px
    fontSizeBase: Optional[str] = None  # 16px
    fontSizeLg: Optional[str] = None  # 18px
    fontSizeXl: Optional[str] = None  # 20px
    fontSize2xl: Optional[str] = None  # 24px
    fontSize3xl: Optional[str] = None  # 30px
    fontSize4xl: Optional[str] = None  # 36px

    # Font weights
    fontWeightNormal: Optional[int] = None  # 400
    fontWeightMedium: Optional[int] = None  # 500
    fontWeightSemibold: Optional[int] = None  # 600
    fontWeightBold: Optional[int] = None  # 700

    # Line heights
    lineHeightTight: Optional[str] = None  # 1.25
    lineHeightNormal: Optional[str] = None  # 1.5
    lineHeightRelaxed: Optional[str] = None  # 1.75

class SpacingTokens(BaseModel):
    xs: Optional[str] = None  # 4px
    sm: Optional[str] = None  # 8px
    md: Optional[str] = None  # 16px
    lg: Optional[str] = None  # 24px
    xl: Optional[str] = None  # 32px
    xl2: Optional[str] = Field(None, alias="2xl")  # 48px
    xl3: Optional[str] = Field(None, alias="3xl")  # 64px

class BorderRadiusTokens(BaseModel):
    sm: Optional[str] = None  # 2px
    md: Optional[str] = None  # 6px
    lg: Optional[str] = None  # 8px
    xl: Optional[str] = None  # 12px
    full: Optional[str] = None  # 9999px

class DesignTokens(BaseModel):
    colors: ColorTokens = Field(default_factory=ColorTokens)
    typography: TypographyTokens = Field(default_factory=TypographyTokens)
    spacing: SpacingTokens = Field(default_factory=SpacingTokens)
    borderRadius: BorderRadiusTokens = Field(default_factory=BorderRadiusTokens)
```

### Frontend Token Structure (TypeScript)

```typescript
export interface ColorTokens {
  primary?: string;
  secondary?: string;
  accent?: string;
  destructive?: string;
  muted?: string;
  background?: string;
  foreground?: string;
  border?: string;
}

export interface TypographyTokens {
  fontFamily?: string;
  fontFamilyHeading?: string;
  fontFamilyMono?: string;
  fontSizeXs?: string;
  fontSizeSm?: string;
  fontSizeBase?: string;
  fontSizeLg?: string;
  fontSizeXl?: string;
  fontSize2xl?: string;
  fontSize3xl?: string;
  fontSize4xl?: string;
  fontWeightNormal?: number;
  fontWeightMedium?: number;
  fontWeightSemibold?: number;
  fontWeightBold?: number;
  lineHeightTight?: string;
  lineHeightNormal?: string;
  lineHeightRelaxed?: string;
}

export interface SpacingTokens {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  "2xl"?: string;
  "3xl"?: string;
}

export interface BorderRadiusTokens {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  full?: string;
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
}
```

### Onboarding State (Zustand)

```typescript
interface OnboardingState {
  hasSeenOnboarding: boolean;
  preferredWorkflow: "design-system" | "components" | "figma" | null;
  extractionCount: number;

  completeOnboarding: (
    workflow: "design-system" | "components" | "figma"
  ) => void;
  skipOnboarding: () => void;
  incrementExtractionCount: () => void;
  resetOnboarding: () => void;
}
```

---

## 🔧 Detailed Implementation Guide

### Phase 1.1: Backend Token Schema (TASK 1)

**File**: `backend/src/api/v1/routes/figma.py` (lines 71-76)

**Current Code**:

```python
class DesignTokens(BaseModel):
    colors: Dict[str, str] = Field(default_factory=dict)
    typography: Dict[str, Any] = Field(default_factory=dict)
    spacing: Dict[str, Any] = Field(default_factory=dict)
```

**New Code** (add before DesignTokens):

```python
class ColorTokens(BaseModel):
    """Semantic color tokens matching shadcn/ui convention."""
    primary: Optional[str] = Field(None, description="Primary brand color")
    secondary: Optional[str] = Field(None, description="Secondary accent color")
    accent: Optional[str] = Field(None, description="Accent highlight color")
    destructive: Optional[str] = Field(None, description="Destructive/error color")
    muted: Optional[str] = Field(None, description="Muted/subtle color")
    background: Optional[str] = Field(None, description="Main background")
    foreground: Optional[str] = Field(None, description="Main text color")
    border: Optional[str] = Field(None, description="Border color")

class TypographyTokens(BaseModel):
    """Typography scale and properties."""
    # Font families
    fontFamily: Optional[str] = Field(None, description="Primary font family")
    fontFamilyHeading: Optional[str] = Field(None, description="Heading font family")
    fontFamilyMono: Optional[str] = Field(None, description="Monospace font family")

    # Font scale (xs to 4xl)
    fontSizeXs: Optional[str] = Field(None, description="12px")
    fontSizeSm: Optional[str] = Field(None, description="14px")
    fontSizeBase: Optional[str] = Field(None, description="16px")
    fontSizeLg: Optional[str] = Field(None, description="18px")
    fontSizeXl: Optional[str] = Field(None, description="20px")
    fontSize2xl: Optional[str] = Field(None, description="24px")
    fontSize3xl: Optional[str] = Field(None, description="30px")
    fontSize4xl: Optional[str] = Field(None, description="36px")

    # Font weights
    fontWeightNormal: Optional[int] = Field(None, description="400")
    fontWeightMedium: Optional[int] = Field(None, description="500")
    fontWeightSemibold: Optional[int] = Field(None, description="600")
    fontWeightBold: Optional[int] = Field(None, description="700")

    # Line heights
    lineHeightTight: Optional[str] = Field(None, description="1.25")
    lineHeightNormal: Optional[str] = Field(None, description="1.5")
    lineHeightRelaxed: Optional[str] = Field(None, description="1.75")

class SpacingTokens(BaseModel):
    """Tailwind-compatible spacing scale."""
    xs: Optional[str] = Field(None, description="4px")
    sm: Optional[str] = Field(None, description="8px")
    md: Optional[str] = Field(None, description="16px")
    lg: Optional[str] = Field(None, description="24px")
    xl: Optional[str] = Field(None, description="32px")
    xl2: Optional[str] = Field(None, alias="2xl", description="48px")
    xl3: Optional[str] = Field(None, alias="3xl", description="64px")

class BorderRadiusTokens(BaseModel):
    """Border radius scale."""
    sm: Optional[str] = Field(None, description="2px")
    md: Optional[str] = Field(None, description="6px")
    lg: Optional[str] = Field(None, description="8px")
    xl: Optional[str] = Field(None, description="12px")
    full: Optional[str] = Field(None, description="9999px or 50%")
```

**Replace DesignTokens with**:

```python
class DesignTokens(BaseModel):
    """Structured design tokens with semantic naming."""
    colors: ColorTokens = Field(default_factory=ColorTokens)
    typography: TypographyTokens = Field(default_factory=TypographyTokens)
    spacing: SpacingTokens = Field(default_factory=SpacingTokens)
    borderRadius: BorderRadiusTokens = Field(default_factory=BorderRadiusTokens)
```

---

### Phase 1.2: GPT-4V Prompt Updates (TASK 2)

**File**: `backend/src/prompts/token_extraction.py`

**Update TOKEN_EXTRACTION_PROMPT**:

```python
TOKEN_EXTRACTION_PROMPT = """
You are a design token extraction expert. Analyze this UI screenshot and extract design tokens.

CRITICAL: Return a valid JSON object with this EXACT structure:

{
  "colors": {
    "primary": "#hexvalue",
    "secondary": "#hexvalue",
    "accent": "#hexvalue",
    "destructive": "#hexvalue",
    "muted": "#hexvalue",
    "background": "#hexvalue",
    "foreground": "#hexvalue",
    "border": "#hexvalue"
  },
  "typography": {
    "fontFamily": "string",
    "fontFamilyHeading": "string",
    "fontFamilyMono": "string",
    "fontSizeXs": "12px",
    "fontSizeSm": "14px",
    "fontSizeBase": "16px",
    "fontSizeLg": "18px",
    "fontSizeXl": "20px",
    "fontSize2xl": "24px",
    "fontSize3xl": "30px",
    "fontSize4xl": "36px",
    "fontWeightNormal": 400,
    "fontWeightMedium": 500,
    "fontWeightSemibold": 600,
    "fontWeightBold": 700,
    "lineHeightTight": "1.25",
    "lineHeightNormal": "1.5",
    "lineHeightRelaxed": "1.75"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px"
  },
  "borderRadius": {
    "sm": "2px",
    "md": "6px",
    "lg": "8px",
    "xl": "12px",
    "full": "9999px"
  },
  "confidence": {
    "colors.primary": 0.95,
    "colors.secondary": 0.85,
    "typography.fontSizeBase": 0.9,
    "spacing.md": 0.8,
    "borderRadius.md": 0.75
  }
}

EXTRACTION GUIDELINES:

1. **Colors** - Map to semantic roles:
   - primary: Main brand color (buttons, links, accents)
   - secondary: Supporting color (secondary buttons, badges)
   - accent: Highlight/focus color (selections, active states)
   - destructive: Error/danger color (delete, warnings)
   - muted: Subtle/disabled color (placeholders, disabled text)
   - background: Main canvas/page background
   - foreground: Main text color
   - border: Default border color

2. **Typography** - Extract font scale:
   - Look for heading sizes (h1-h6) and body text
   - Map smallest visible text to fontSizeXs
   - Map largest heading to fontSize4xl
   - Infer intermediate sizes based on visual hierarchy

3. **Spacing** - Extract padding/margin values:
   - xs: Smallest gap (icon padding, tight spacing)
   - sm: Small gap (compact lists, form labels)
   - md: Medium gap (card padding, section spacing)
   - lg: Large gap (major sections, generous padding)
   - xl/2xl/3xl: Extra large gaps (hero sections, page margins)

4. **Border Radius** - Extract corner rounding:
   - sm: Subtle rounding (inputs, badges)
   - md: Standard rounding (buttons, cards)
   - lg: Generous rounding (larger cards, modals)
   - xl: Heavy rounding (pills, special elements)
   - full: Circular/fully rounded (avatars, circular buttons)

5. **Confidence Scoring**:
   - 0.9-1.0: Explicitly visible and unambiguous
   - 0.7-0.9: Reasonably confident, some inference needed
   - 0.5-0.7: Uncertain, based on educated guess
   - <0.5: High uncertainty, may be placeholder

Return ONLY the JSON object, no markdown formatting.
"""
```

---

### Phase 1.3: Figma Extraction Logic (TASK 3)

**File**: `backend/src/api/v1/routes/figma.py`

**Rewrite color extraction**:

```python
def _extract_color_tokens(styles: List[Dict[str, Any]]) -> Dict[str, str]:
    """Map Figma color styles to semantic tokens using keyword matching."""
    tokens = {}

    # Keyword mapping for semantic colors
    keywords = {
        'primary': ['primary', 'brand', 'main', 'blue'],
        'secondary': ['secondary', 'accent-2', 'gray', 'grey'],
        'accent': ['accent', 'highlight', 'focus', 'teal', 'cyan'],
        'destructive': ['error', 'danger', 'red', 'destructive', 'warning'],
        'muted': ['muted', 'subtle', 'disabled', 'placeholder'],
        'background': ['background', 'bg', 'surface', 'canvas', 'white'],
        'foreground': ['foreground', 'text', 'body', 'black'],
        'border': ['border', 'divider', 'stroke', 'outline']
    }

    for style in styles:
        if style.get('styleType') == 'FILL':
            name = style.get('name', '').lower()
            color_value = _figma_color_to_hex(style.get('fills', [{}])[0])

            # Try to match to semantic token
            for token_name, keywords_list in keywords.items():
                if any(kw in name for kw in keywords_list):
                    tokens[token_name] = color_value
                    break

    return tokens
```

**Rewrite typography extraction**:

```python
def _extract_typography_tokens(styles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Extract typography tokens with font scale."""
    tokens = {}
    font_sizes = []

    for style in styles:
        if style.get('styleType') == 'TEXT':
            name = style.get('name', '').lower()
            font_size = style.get('fontSize')
            font_weight = style.get('fontWeight')
            font_family = style.get('fontFamily')
            line_height = style.get('lineHeight', {}).get('value')

            # Collect font sizes for scale generation
            if font_size:
                font_sizes.append(font_size)

            # Extract font families
            if 'heading' in name or 'title' in name:
                tokens['fontFamilyHeading'] = font_family
            elif 'mono' in name or 'code' in name:
                tokens['fontFamilyMono'] = font_family
            elif not tokens.get('fontFamily'):
                tokens['fontFamily'] = font_family

    # Generate font scale from collected sizes
    if font_sizes:
        sorted_sizes = sorted(set(font_sizes))
        size_map = ['fontSizeXs', 'fontSizeSm', 'fontSizeBase', 'fontSizeLg',
                    'fontSizeXl', 'fontSize2xl', 'fontSize3xl', 'fontSize4xl']

        for i, size in enumerate(sorted_sizes[:8]):
            if i < len(size_map):
                tokens[size_map[i]] = f"{size}px"

    # Default font weights
    tokens['fontWeightNormal'] = 400
    tokens['fontWeightMedium'] = 500
    tokens['fontWeightSemibold'] = 600
    tokens['fontWeightBold'] = 700

    # Default line heights
    tokens['lineHeightTight'] = "1.25"
    tokens['lineHeightNormal'] = "1.5"
    tokens['lineHeightRelaxed'] = "1.75"

    return tokens
```

**Create spacing extraction**:

```python
def _extract_spacing_tokens(layout_grids: List[Dict[str, Any]]) -> Dict[str, str]:
    """Extract Tailwind-compatible spacing scale."""
    # Common spacing values from design systems
    tailwind_scale = {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px'
    }

    # Try to extract from layout grids
    if layout_grids:
        grid_sizes = [g.get('sectionSize') for g in layout_grids if g.get('sectionSize')]
        if grid_sizes:
            sorted_sizes = sorted(set(grid_sizes))
            scale_keys = list(tailwind_scale.keys())

            for i, size in enumerate(sorted_sizes[:7]):
                if i < len(scale_keys):
                    tailwind_scale[scale_keys[i]] = f"{size}px"

    return tailwind_scale
```

**Create border radius extraction**:

```python
def _extract_border_radius_tokens(effects: List[Dict[str, Any]]) -> Dict[str, str]:
    """Extract border radius values."""
    radius_values = {
        'sm': '2px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        'full': '9999px'
    }

    # Extract from Figma effects/styles if available
    # This is a simplified version - actual implementation would inspect node cornerRadius

    return radius_values
```

**Update \_extract_tokens() function**:

```python
def _extract_tokens(file_data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract all token categories from Figma file."""
    styles = file_data.get('meta', {}).get('styles', [])
    layout_grids = file_data.get('document', {}).get('layoutGrids', [])

    return {
        'colors': _extract_color_tokens(styles),
        'typography': _extract_typography_tokens(styles),
        'spacing': _extract_spacing_tokens(layout_grids),
        'borderRadius': _extract_border_radius_tokens([])
    }
```

---

### Phase 1.4: Token Validation (TASK 4)

**File**: `backend/src/agents/token_extractor.py`

**Update validation function**:

```python
def _validate_token_structure(tokens: Dict[str, Any]) -> bool:
    """Validate that all 4 token categories are present."""
    required_categories = ['colors', 'typography', 'spacing', 'borderRadius']

    for category in required_categories:
        if category not in tokens:
            logger.warning(f"Missing required token category: {category}")
            return False

    return True
```

---

### Phase 2.1: Frontend Type Definitions (TASK 5)

**File**: `app/src/types/api.types.ts`

**Replace current types with**:

```typescript
export interface ColorTokens {
  primary?: string;
  secondary?: string;
  accent?: string;
  destructive?: string;
  muted?: string;
  background?: string;
  foreground?: string;
  border?: string;
}

export interface TypographyTokens {
  fontFamily?: string;
  fontFamilyHeading?: string;
  fontFamilyMono?: string;
  fontSizeXs?: string;
  fontSizeSm?: string;
  fontSizeBase?: string;
  fontSizeLg?: string;
  fontSizeXl?: string;
  fontSize2xl?: string;
  fontSize3xl?: string;
  fontSize4xl?: string;
  fontWeightNormal?: number;
  fontWeightMedium?: number;
  fontWeightSemibold?: number;
  fontWeightBold?: number;
  lineHeightTight?: string;
  lineHeightNormal?: string;
  lineHeightRelaxed?: string;
}

export interface SpacingTokens {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  "2xl"?: string;
  "3xl"?: string;
}

export interface BorderRadiusTokens {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  full?: string;
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
}

export interface TokenConfidence {
  [key: string]: number; // e.g., "colors.primary": 0.95
}

export interface ExtractedTokens {
  tokens: DesignTokens;
  confidence: TokenConfidence;
}
```

---

### Phase 2.2: BorderRadiusEditor Component (TASK 7)

**Create file**: `app/src/components/tokens/BorderRadiusEditor.tsx`

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BorderRadiusTokens } from "@/types/api.types";

interface BorderRadiusEditorProps {
  tokens: BorderRadiusTokens;
  confidence?: Record<string, number>;
  onChange: (tokens: BorderRadiusTokens) => void;
}

function getConfidenceBadge(confidence: number) {
  if (confidence >= 0.9) return { variant: "success", label: "High" };
  if (confidence >= 0.7) return { variant: "warning", label: "Medium" };
  return { variant: "error", label: "Low" };
}

export function BorderRadiusEditor({
  tokens,
  confidence = {},
  onChange
}: BorderRadiusEditorProps) {
  const radiusKeys: Array<keyof BorderRadiusTokens> = [
    "sm",
    "md",
    "lg",
    "xl",
    "full"
  ];

  const handleChange = (key: keyof BorderRadiusTokens, value: string) => {
    onChange({ ...tokens, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Border Radius</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {radiusKeys.map((key) => {
          const conf = confidence[`borderRadius.${key}`] || 0;
          const badge = getConfidenceBadge(conf);

          return (
            <Card key={key} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium capitalize">{key}</label>
                {conf > 0 && (
                  <Badge variant={badge.variant as any} size="sm">
                    {badge.label} ({Math.round(conf * 100)}%)
                  </Badge>
                )}
              </div>

              <Input
                type="text"
                value={tokens[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={`e.g., ${key === "full" ? "9999px" : "8px"}`}
                className="mb-3"
              />

              {/* Visual Preview */}
              <div className="flex items-center justify-center h-20 bg-muted rounded">
                <div
                  className="w-16 h-16 bg-primary"
                  style={{ borderRadius: tokens[key] || "0px" }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

---

### Phase 2.3: Update TokenEditor (TASK 6)

**File**: `app/src/components/tokens/TokenEditor.tsx`

**Update TokenData interface** (lines 11-23):

```typescript
interface TokenData {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
}
```

**Add import**:

```typescript
import { BorderRadiusEditor } from "./BorderRadiusEditor";
```

**Add to component JSX** (after SpacingEditor):

```typescript
<BorderRadiusEditor
  tokens={tokens.borderRadius}
  confidence={confidence}
  onChange={(borderRadius) => setTokens({ ...tokens, borderRadius })}
/>
```

---

### Phase 2.4: Update Extract Page (TASK 8)

**File**: `app/src/app/extract/page.tsx`

**Update getEditorTokens() function**:

```typescript
function getEditorTokens(extracted: ExtractedTokens): TokenData {
  return {
    colors: extracted.tokens.colors || {},
    typography: extracted.tokens.typography || {},
    spacing: extracted.tokens.spacing || {},
    borderRadius: extracted.tokens.borderRadius || {}
  };
}
```

---

### Phase 3.1: Onboarding Store (TASK 9)

**Create file**: `app/src/stores/useOnboardingStore.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

type WorkflowType = "design-system" | "components" | "figma";

interface OnboardingState {
  hasSeenOnboarding: boolean;
  preferredWorkflow: WorkflowType | null;
  extractionCount: number;

  completeOnboarding: (workflow: WorkflowType) => void;
  skipOnboarding: () => void;
  incrementExtractionCount: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      preferredWorkflow: null,
      extractionCount: 0,

      completeOnboarding: (workflow) =>
        set({ hasSeenOnboarding: true, preferredWorkflow: workflow }),

      skipOnboarding: () => set({ hasSeenOnboarding: true }),

      incrementExtractionCount: () =>
        set((state) => ({ extractionCount: state.extractionCount + 1 })),

      resetOnboarding: () =>
        set({
          hasSeenOnboarding: false,
          preferredWorkflow: null,
          extractionCount: 0
        })
    }),
    {
      name: "componentforge-onboarding"
    }
  )
);
```

---

### Phase 3.2: Onboarding Modal (TASK 10)

**Create file**: `app/src/components/onboarding/OnboardingModal.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { Palette, FileImage, Figma } from "lucide-react";

export function OnboardingModal() {
  const router = useRouter();
  const { hasSeenOnboarding, completeOnboarding, skipOnboarding } =
    useOnboardingStore();
  const [open, setOpen] = useState(!hasSeenOnboarding);

  const workflows = [
    {
      id: "design-system" as const,
      title: "Design System Screenshot",
      description: "Upload a screenshot of your design palette or style guide",
      icon: Palette,
      example: "Perfect for: Color palettes, typography scales, spacing systems"
    },
    {
      id: "components" as const,
      title: "Component Mockups",
      description:
        "Upload screenshots of UI components to extract their design tokens",
      icon: FileImage,
      example: "Perfect for: Buttons, cards, forms, navigation elements"
    },
    {
      id: "figma" as const,
      title: "Figma File",
      description: "Connect your Figma file to automatically extract styles",
      icon: Figma,
      example: "Perfect for: Complete design systems with defined styles"
    }
  ];

  const handleWorkflowSelect = (
    workflowId: (typeof workflows)[number]["id"]
  ) => {
    completeOnboarding(workflowId);
    setOpen(false);
    router.push("/extract");
  };

  const handleSkip = () => {
    skipOnboarding();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Welcome to ComponentForge!
          </DialogTitle>
          <p className="text-muted-foreground">
            Choose how you'd like to start extracting design tokens
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {workflows.map((workflow) => {
            const Icon = workflow.icon;
            return (
              <Card
                key={workflow.id}
                className="p-6 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleWorkflowSelect(workflow.id)}
              >
                <Icon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">{workflow.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {workflow.description}
                </p>
                <p className="text-xs text-muted italic">{workflow.example}</p>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            You can always access this guide from the Help menu
          </p>
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Phase 3.3: App Integration (TASK 11)

**File**: `app/src/app/layout.tsx`

**Add import**:

```typescript
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
```

**Add to layout** (before closing body tag):

```typescript
<OnboardingModal />
```

**File**: `app/src/components/layout/Navigation.tsx`

**Add Help button**:

```typescript
import { HelpCircle } from "lucide-react";
import { useOnboardingStore } from "@/stores/useOnboardingStore";

// Inside component:
const { resetOnboarding } = useOnboardingStore();

// Add to navigation:
<Button variant="ghost" size="sm" onClick={() => resetOnboarding()}>
  <HelpCircle className="h-4 w-4 mr-2" />
  Help
</Button>;
```

---

## 📁 Files to Create/Modify

### New Files (3)

1. `app/src/components/tokens/BorderRadiusEditor.tsx`
2. `app/src/components/onboarding/OnboardingModal.tsx`
3. `app/src/stores/useOnboardingStore.ts`

### Modified Files (9)

1. `backend/src/api/v1/routes/figma.py` - Pydantic models + extraction
2. `backend/src/prompts/token_extraction.py` - GPT-4V prompt
3. `backend/src/agents/token_extractor.py` - Validation
4. `app/src/types/api.types.ts` - TypeScript interfaces
5. `app/src/components/tokens/TokenEditor.tsx` - Add borderRadius
6. `app/src/components/tokens/ColorPicker.tsx` - Semantic colors
7. `app/src/components/tokens/TypographyEditor.tsx` - Font scale
8. `app/src/components/tokens/SpacingEditor.tsx` - Spacing scale
9. `app/src/app/layout.tsx` - Add OnboardingModal

---

## 🧪 Testing Strategy

### Unit Tests

- ✅ Pydantic model validation (accept/reject invalid data)
- ✅ Token extraction functions return correct structure
- ✅ TypeScript type checking passes

### Integration Tests

- ✅ POST `/tokens/extract/screenshot` returns structured tokens
- ✅ POST `/tokens/extract/figma` returns semantic tokens
- ✅ Confidence scores calculated correctly

### E2E Tests (Playwright)

- ✅ Upload screenshot → extract → display all 4 categories
- ✅ Connect Figma → extract → display semantic tokens
- ✅ Edit tokens in UI → save → export
- ✅ First visit → see modal → select workflow → navigate
- ✅ Second visit → no modal shown

### Visual Tests

- ✅ BorderRadiusEditor shows visual preview
- ✅ Confidence badges color-coded correctly
- ✅ Onboarding modal displays properly on mobile

---

## 🚨 Risks & Mitigation

### Risk 1: Breaking Changes to Existing API

**Impact**: High
**Probability**: High
**Mitigation**:

- Keep backward compatibility by making all new fields `Optional`
- Add API versioning if needed (`/api/v2/tokens`)
- Test with existing extraction flows before deploying

### Risk 2: GPT-4V Doesn't Extract Semantic Tokens Correctly

**Impact**: Medium
**Probability**: Medium
**Mitigation**:

- Provide clear extraction guidelines in prompt
- Use confidence scores to flag uncertain extractions
- Allow manual token mapping in UI

### Risk 3: Onboarding Modal Annoying to Power Users

**Impact**: Low
**Probability**: Low
**Mitigation**:

- Make modal dismissible with "Skip"
- Show only on first visit (localStorage)
- Add "Don't show again" option

---

## 📊 Success Metrics

### Quantitative

- ✅ 100% of extractions return all 4 token categories
- ✅ Confidence scores vary (not all 0.85)
- ✅ 80%+ of semantic tokens mapped correctly from Figma
- ✅ Onboarding completion rate >60%

### Qualitative

- ✅ Users understand what to upload (fewer support questions)
- ✅ Token editing feels intuitive
- ✅ BorderRadius visual preview helps users validate values
- ✅ Onboarding guides new users effectively

---

## 🔗 Related Documentation

- [Figma Extraction Bug Fix](./FIGMA-EXTRACTION-FIX.md)
- [Confidence Score Implementation](./CONFIDENCE-SCORES.md)
- [Base Components Specification](./BASE-COMPONENTS.md)
- [Product FAQ](../docs/FAQ.md)

---

**Last Updated**: 2025-10-05
**Next Review**: After Week 1 completion
