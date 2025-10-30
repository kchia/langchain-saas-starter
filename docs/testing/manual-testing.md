# Manual Integration Test Checklist
## Epic 11 - Tasks 12 & 13

Use this checklist to manually verify all integration requirements are met.

---

## Setup Prerequisites

- [ ] Backend is running (`make dev` or manual start)
- [ ] Frontend is running (`npm run dev`)
- [ ] Services are healthy (PostgreSQL, Qdrant, Redis via docker-compose)
- [ ] Environment variables are set:
  - [ ] Backend: `OPENAI_API_KEY` in `backend/.env`
  - [ ] Frontend: API URL configured in `app/.env.local`

---

## TASK 12.1: API Endpoints Verification

### Test /tokens/defaults
- [ ] Run: `curl http://localhost:8000/tokens/defaults`
- [ ] Response includes all 4 categories (colors, typography, spacing, borderRadius)
- [ ] Colors use semantic names (primary, secondary, accent, destructive, muted, background, foreground, border)
- [ ] Typography includes font scale (fontSizeXs through fontSize4xl)
- [ ] Spacing includes scale (xs, sm, md, lg, xl, 2xl, 3xl)
- [ ] BorderRadius includes scale (sm, md, lg, xl, full)

### Test /tokens/extract/screenshot
- [ ] Upload a design system screenshot
- [ ] Response includes `tokens` object with all 4 categories
- [ ] Response includes `confidence` scores
- [ ] Response includes `metadata` with filename and image info
- [ ] Confidence scores are numeric values between 0 and 1
- [ ] Test with invalid file type → returns 400 error
- [ ] Test with >10MB file → returns 400 error

### Test /tokens/extract/figma
- [ ] Authenticate with valid Figma PAT
- [ ] Extract from Figma file with published styles
- [ ] Response includes all 4 token categories
- [ ] Style names mapped to semantic tokens correctly
- [ ] Test invalid PAT → returns authentication error
- [ ] Test invalid URL → returns appropriate error

---

## TASK 12.2: Screenshot Extraction End-to-End

- [ ] Navigate to `/extract`
- [ ] Screenshot tab is selected by default
- [ ] Upload a design system screenshot (drag-and-drop or file picker)
- [ ] Progress indicator appears during extraction
- [ ] All 4 token categories appear after extraction:
  - [ ] **Colors** section with semantic names
  - [ ] **Typography** section with font scale
  - [ ] **Spacing** section with scale values
  - [ ] **BorderRadius** section with visual previews
- [ ] Semantic color names are correctly mapped:
  - [ ] Primary color identified
  - [ ] Secondary color identified
  - [ ] Accent color identified
  - [ ] Destructive/error color identified
- [ ] Confidence scores flow to UI:
  - [ ] Badges visible on token fields
  - [ ] Badge colors match confidence level (see TASK 13.6)

---

## TASK 12.3: Figma Extraction End-to-End

- [ ] Navigate to `/extract`
- [ ] Switch to Figma tab
- [ ] Enter valid Figma Personal Access Token
- [ ] Authentication succeeds
- [ ] Enter Figma file URL
- [ ] Click Extract button
- [ ] All 4 token categories appear
- [ ] Keyword matching works for semantic tokens:
  - [ ] "Primary/Blue" → `colors.primary`
  - [ ] "Brand/Main" → `colors.primary`
  - [ ] "Error/Red" → `colors.destructive`
  - [ ] "Heading/Large" → `typography.fontSize3xl` or similar
- [ ] Test various naming conventions:
  - [ ] Slash notation: "Primary/Blue"
  - [ ] Dash notation: "primary-blue"
  - [ ] Space notation: "Primary Blue"

---

## TASK 12.4: Token Editing Flow

### Edit Colors
- [ ] After extraction, find a color field (e.g., primary)
- [ ] Change the hex value
- [ ] Color preview updates immediately
- [ ] Confidence badge remains visible
- [ ] Change persists when switching between categories

### Edit BorderRadius
- [ ] Find BorderRadius section
- [ ] Change a value (e.g., "md" from "6px" to "8px")
- [ ] Visual preview box updates with new border radius
- [ ] Try different values:
  - [ ] Small values (2px, 4px)
  - [ ] Large values (16px, 24px)
  - [ ] Full rounded (9999px or 50%)

### Edit Typography
- [ ] Change a font size value
- [ ] Change font family (select from dropdown or enter custom)
- [ ] Change font weight
- [ ] Changes reflect immediately
- [ ] Confidence badges remain visible during editing

---

## TASK 12.5: Export Functionality

### Export as JSON
- [ ] Click Export button
- [ ] Select JSON format
- [ ] Download file
- [ ] Open JSON file and verify:
  - [ ] All 4 categories present (colors, typography, spacing, borderRadius)
  - [ ] Semantic color names preserved
  - [ ] Font scale included (fontSizeXs through fontSize4xl)
  - [ ] Spacing scale complete
  - [ ] BorderRadius scale complete
  - [ ] Structure matches backend `DesignTokens` model

### Export as CSS Variables
- [ ] Select CSS format
- [ ] Download file
- [ ] Open CSS file and verify:
  - [ ] `:root` selector present
  - [ ] Variables use semantic naming:
    - `--color-primary`, `--color-secondary`, etc.
    - `--font-size-xs` through `--font-size-4xl`
    - `--spacing-xs` through `--spacing-3xl`
    - `--border-radius-sm` through `--border-radius-full`

### Export as Tailwind Config
- [ ] Select Tailwind config format
- [ ] Download file
- [ ] Verify borderRadius section included in config
- [ ] Verify all token categories properly formatted for Tailwind

---

## TASK 12.6: Error Handling

### Frontend Validation
- [ ] Try uploading PDF file → Shows error message
- [ ] Try uploading 20MB image → Shows error message
- [ ] Error messages are user-friendly (not technical stack traces)

### Backend Error Handling
- [ ] Disconnect backend, try extraction → Shows appropriate error
- [ ] Shows retry option or clear next steps
- [ ] Network timeout handled gracefully

### Missing Token Categories
- [ ] If backend returns incomplete data, UI handles gracefully
- [ ] Shows warning for missing categories
- [ ] Doesn't crash or show blank page

---

## TASK 12.7 & 13.6: Confidence Score Integration

### Badge Color Coding
- [ ] High confidence (>0.9) shows green badge
- [ ] Medium confidence (0.7-0.9) shows yellow badge  
- [ ] Low confidence (<0.7) shows red badge

### Threshold Logic
- [ ] Test with extracted tokens that have various confidence scores
- [ ] Verify each badge color matches its confidence value
- [ ] Hover or inspect badges to see exact confidence percentage

### Edge Cases
- [ ] Tokens with null confidence handled gracefully
- [ ] Tokens with missing confidence don't crash UI
- [ ] Tokens with confidence = 0 or 1 display correctly

---

## TASK 13.1: Screenshot Extraction Returns All Categories

- [ ] Upload design system screenshot
- [ ] Verify response includes:
  - [ ] `colors` object with semantic fields
  - [ ] `typography` object with font scale
  - [ ] `spacing` object with scale values
  - [ ] `borderRadius` object with scale values
- [ ] Each category has confidence scores
- [ ] No category is empty or null

---

## TASK 13.2: Figma Extraction Returns Semantic Tokens

- [ ] Connect to Figma file
- [ ] Extract tokens
- [ ] Verify semantic tokens returned:
  - [ ] Colors mapped to primary/secondary/accent/etc.
  - [ ] Typography includes font families and sizes
  - [ ] Spacing scale extracted
  - [ ] BorderRadius values extracted
- [ ] Keyword matching functional (see TASK 12.3)

---

## TASK 13.3: TokenEditor Displays All Categories

After extraction, verify TokenEditor shows:

### Colors Section
- [ ] Semantic color fields visible
- [ ] Color pickers functional
- [ ] Hex validation works
- [ ] Confidence badges visible

### Typography Section
- [ ] Font family dropdown
- [ ] Font size fields (xs through 4xl)
- [ ] Font weight selectors
- [ ] Line height fields
- [ ] All values editable

### Spacing Section
- [ ] Scale fields (xs through 3xl)
- [ ] Visual preview of spacing
- [ ] Validation for 4px multiples

### BorderRadius Section
- [ ] Scale fields (sm through full)
- [ ] Visual preview boxes showing rounded corners
- [ ] Preview updates on value change

---

## TASK 13.4: Onboarding Modal First Visit

- [ ] Open app in incognito/private window
- [ ] Modal appears automatically
- [ ] Modal shows "Welcome to ComponentForge!" title
- [ ] Three workflow cards visible:
  - [ ] Design System Screenshot
  - [ ] Component Mockups
  - [ ] Figma File
- [ ] Each card shows icon, title, description, and example text
- [ ] Skip button visible
- [ ] Help text visible: "You can always access this guide from the Help menu"

### Modal Does NOT Appear on Subsequent Visits
- [ ] After completing or skipping onboarding, refresh page
- [ ] Modal does NOT appear
- [ ] Close browser and reopen → Modal still doesn't appear
- [ ] Only appears after clearing localStorage

---

## TASK 13.5: Workflow Selection

### Design System Workflow
- [ ] Click "Design System Screenshot" card
- [ ] Navigates to `/extract` page
- [ ] Modal closes
- [ ] Preference saved (verify in localStorage: `componentforge-onboarding`)
- [ ] Subsequent visits don't show modal

### Components Workflow
- [ ] Clear localStorage, reload to show modal
- [ ] Click "Component Mockups" card
- [ ] Navigates to `/extract` page
- [ ] Modal closes
- [ ] Preference saved

### Figma Workflow
- [ ] Clear localStorage, reload to show modal
- [ ] Click "Figma File" card
- [ ] Navigates to `/extract` page
- [ ] Modal closes
- [ ] Preference saved

### Skip Functionality
- [ ] Clear localStorage, reload to show modal
- [ ] Click "Skip for now" button
- [ ] Modal closes
- [ ] Stays on current page (doesn't navigate)
- [ ] `hasSeenOnboarding: true` saved to localStorage

---

## TASK 12.8: Complete Integration Flows

### Screenshot Flow: Upload → Extract → Edit → Export
1. [ ] Navigate to `/extract`
2. [ ] Upload design system screenshot
3. [ ] Wait for extraction to complete
4. [ ] Verify all 4 categories appear
5. [ ] Edit a color value
6. [ ] Edit a borderRadius value
7. [ ] Click Export
8. [ ] Select JSON format
9. [ ] Download and verify file contains edits
10. [ ] File includes all 4 categories with correct values

### Figma Flow: Connect → Extract → Edit → Export
1. [ ] Navigate to `/extract`
2. [ ] Switch to Figma tab
3. [ ] Enter Figma PAT
4. [ ] Authenticate
5. [ ] Enter Figma file URL
6. [ ] Click Extract
7. [ ] Verify semantic token mapping
8. [ ] Verify all 4 categories present
9. [ ] Edit a typography value
10. [ ] Export as Tailwind config
11. [ ] Verify exported config is valid and includes all categories

### Performance Test
- [ ] Upload/extract design system with 50+ tokens
- [ ] Extraction completes in <10 seconds
- [ ] UI remains responsive during extraction
- [ ] All tokens render correctly
- [ ] No lag when editing tokens

---

## Summary Checklist

### TASK 12: Frontend-Backend Integration
- [ ] 12.1: API endpoints verified ✓
- [ ] 12.2: Screenshot extraction E2E ✓
- [ ] 12.3: Figma extraction E2E ✓
- [ ] 12.4: Token editing flow ✓
- [ ] 12.5: Export functionality ✓
- [ ] 12.6: Error handling ✓
- [ ] 12.7: Confidence score integration ✓
- [ ] 12.8: Complete integration flows ✓

### TASK 13: Testing & Validation
- [ ] 13.1: Screenshot extraction all categories ✓
- [ ] 13.2: Figma extraction semantic tokens ✓
- [ ] 13.3: TokenEditor displays all categories ✓
- [ ] 13.4: Onboarding modal first visit ✓
- [ ] 13.5: Workflow selection ✓
- [ ] 13.6: Confidence badge colors ✓

---

## Notes

**Date Tested:** _____________  
**Tester:** _____________  
**Environment:** Local / Staging / Production

**Issues Found:**
- 
- 
- 

**Overall Status:** ☐ Pass  ☐ Pass with minor issues  ☐ Fail

