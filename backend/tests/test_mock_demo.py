"""Mock demonstration of Epic 2 requirement proposal system.

This script demonstrates the complete workflow with mocked responses
to show the structure and flow without requiring API calls.
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timezone

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from PIL import Image, ImageDraw, ImageFont
from src.types.requirement_types import (
    RequirementProposal,
    RequirementCategory,
    ComponentType,
    ComponentClassification,
    RequirementState,
    get_confidence_level,
)


def create_test_button_image() -> Image.Image:
    """Create a simple test button image for demonstration."""
    # Create a 600x200 image with white background
    img = Image.new('RGB', (600, 200), color='#F3F4F6')
    draw = ImageDraw.Draw(img)
    
    # Draw primary button
    draw.rectangle((30, 60, 180, 110), fill='#3B82F6', outline='#2563EB', width=2)
    
    # Draw secondary button
    draw.rectangle((200, 60, 350, 110), fill='white', outline='#3B82F6', width=2)
    
    # Draw ghost button
    draw.rectangle((370, 60, 520, 110), fill='#F3F4F6', outline='#9CA3AF', width=1)
    
    # Add labels
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
    except:
        font = ImageFont.load_default()
    
    draw.text((75, 80), "Primary", fill='white', font=font)
    draw.text((235, 80), "Secondary", fill='#3B82F6', font=font)
    draw.text((415, 80), "Ghost", fill='#6B7280', font=font)
    
    # Add title
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
    except:
        title_font = font
    draw.text((30, 30), "Button Component - Three Variants", fill='#374151', font=title_font)
    
    return img


def create_mock_classification() -> ComponentClassification:
    """Create a mock component classification result."""
    return ComponentClassification(
        component_type=ComponentType.BUTTON,
        confidence=0.95,
        candidates=[
            {"type": ComponentType.BUTTON, "confidence": 0.95},
            {"type": ComponentType.BADGE, "confidence": 0.15},
        ],
        rationale="Clear button pattern with solid background, action-oriented text, and interactive styling. "
                  "Rounded rectangle shape, multiple visual variants (primary, secondary, ghost) detected, "
                  "and typical button dimensions observed."
    )


def create_mock_props_proposals() -> list[RequirementProposal]:
    """Create mock props proposal results."""
    return [
        RequirementProposal(
            id="props-variant-a1b2c3d4",
            category=RequirementCategory.PROPS,
            name="variant",
            values=["primary", "secondary", "ghost"],
            confidence=0.95,
            rationale="Three distinct button styles detected: solid blue background for primary, "
                     "outlined blue border for secondary, and minimal ghost styling",
            approved=False,
            edited=False,
        ),
        RequirementProposal(
            id="props-size-e5f6g7h8",
            category=RequirementCategory.PROPS,
            name="size",
            values=["sm", "md", "lg"],
            confidence=0.82,
            rationale="Different button heights observed with varying padding and font sizes",
            approved=False,
            edited=False,
        ),
        RequirementProposal(
            id="props-disabled-i9j0k1l2",
            category=RequirementCategory.PROPS,
            name="disabled",
            confidence=0.78,
            rationale="Visual cues suggest disabled state capability: opacity reduction pattern",
            approved=False,
            edited=False,
        ),
        RequirementProposal(
            id="props-fullWidth-m3n4o5p6",
            category=RequirementCategory.PROPS,
            name="fullWidth",
            confidence=0.70,
            rationale="Button width variations observed, suggesting responsive width options",
            approved=False,
            edited=False,
        ),
    ]


def demonstrate_workflow():
    """Demonstrate the complete requirement proposal workflow with mocks."""
    
    print()
    print("=" * 80)
    print("EPIC 2: REQUIREMENT PROPOSAL SYSTEM - MOCK DEMONSTRATION")
    print("=" * 80)
    print()
    print("This demo shows the workflow with mocked AI responses")
    print("(No API key required)")
    print()
    
    # Step 1: Create test image
    print("Step 1: Creating test button component image...")
    test_image = create_test_button_image()
    print(f"   ✓ Created test image: {test_image.size[0]}x{test_image.size[1]} pixels")
    
    # Save test image
    test_image_path = Path("/tmp/test_button_mock.png")
    test_image.save(test_image_path)
    print(f"   ✓ Saved to: {test_image_path}")
    print()
    
    # Step 2: Mock classification
    print("Step 2: Component Classification (mocked GPT-4V response)...")
    classification = create_mock_classification()
    print(f"   ✓ Component Type: {classification.component_type.value}")
    print(f"   ✓ Confidence: {classification.confidence:.2f}")
    print()
    
    # Step 3: Mock props proposals
    print("Step 3: Props Requirement Proposal (mocked GPT-4V response)...")
    props_proposals = create_mock_props_proposals()
    print(f"   ✓ Generated {len(props_proposals)} props proposals")
    print()
    
    # Step 4: Create state
    print("Step 4: Building requirement state...")
    state = RequirementState(
        classification=classification,
        props_proposals=props_proposals,
        events_proposals=[],  # Not yet implemented
        states_proposals=[],  # Not yet implemented
        accessibility_proposals=[],  # Not yet implemented
        started_at=datetime.now(timezone.utc).isoformat(),
        completed_at=datetime.now(timezone.utc).isoformat(),
    )
    print("   ✓ State created")
    print()
    
    # Display results
    print("=" * 80)
    print("WORKFLOW RESULTS")
    print("=" * 80)
    print()
    
    # Component Classification
    print("📋 COMPONENT CLASSIFICATION")
    print("-" * 80)
    print(f"Type: {classification.component_type.value}")
    print(f"Confidence: {classification.confidence:.2f} ({get_confidence_level(classification.confidence).value})")
    print(f"Rationale: {classification.rationale}")
    print()
    if classification.candidates:
        print(f"Alternative Candidates ({len(classification.candidates)}):")
        for i, candidate in enumerate(classification.candidates, 1):
            print(f"  {i}. {candidate['type'].value} (confidence: {candidate['confidence']:.2f})")
    print()
    
    # Props Proposals
    print("🔧 PROPS REQUIREMENTS")
    print("-" * 80)
    print(f"Total Proposed: {len(props_proposals)}")
    print()
    
    for i, prop in enumerate(props_proposals, 1):
        confidence_level = get_confidence_level(prop.confidence)
        flag_emoji = "⚠️ " if prop.confidence < 0.8 else "✅"
        
        print(f"{flag_emoji} {i}. {prop.name.upper()}")
        print(f"   Category: {prop.category.value}")
        
        if prop.values:
            print(f"   Type: enum")
            print(f"   Values: {', '.join(prop.values)}")
        else:
            print(f"   Type: boolean")
        
        print(f"   Confidence: {prop.confidence:.2f} ({confidence_level.value})")
        
        if prop.confidence < 0.8:
            print(f"   🚨 FLAGGED FOR REVIEW (confidence < 0.8)")
        
        print(f"   Rationale: {prop.rationale}")
        print(f"   ID: {prop.id}")
        print()
    
    # Future implementations
    print("📡 EVENTS REQUIREMENTS")
    print("-" * 80)
    print("ℹ️  Coming in Phase 2, Commits 9-10")
    print("   Will detect: onClick, onChange, onHover, onFocus")
    print()
    
    print("🎨 STATES REQUIREMENTS")
    print("-" * 80)
    print("ℹ️  Coming in Phase 2, Commits 11-12")
    print("   Will detect: hover, focus, disabled, loading states")
    print()
    
    print("♿ ACCESSIBILITY REQUIREMENTS")
    print("-" * 80)
    print("ℹ️  Coming in Phase 2, Commits 13-14")
    print("   Will detect: aria-label, semantic HTML, keyboard navigation")
    print()
    
    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print()
    
    total = len(state.get_all_proposals())
    high = sum(1 for p in state.get_all_proposals() if p.confidence >= 0.9)
    medium = sum(1 for p in state.get_all_proposals() if 0.7 <= p.confidence < 0.9)
    low = sum(1 for p in state.get_all_proposals() if p.confidence < 0.7)
    
    print(f"📊 Requirement Statistics:")
    print(f"   Total Proposed: {total}")
    print(f"   High Confidence (≥0.9): {high}")
    print(f"   Medium Confidence (0.7-0.9): {medium}")
    print(f"   Low Confidence (<0.7): {low}")
    print()
    
    print(f"✅ Phase 1 Complete: AI Infrastructure")
    print(f"✅ Phase 2 Partial: Props Proposer Implemented")
    print(f"⏳ Phase 2 Remaining: Events, States, Accessibility")
    print(f"⏳ Phase 3: API & UI Integration")
    print(f"⏳ Phase 4: Export & Pipeline Integration")
    print()
    
    # Export preview
    print("=" * 80)
    print("EXPORT PREVIEW (requirements.json)")
    print("=" * 80)
    print()
    
    export_data = {
        "componentType": state.classification.component_type.value,
        "confidence": state.classification.confidence,
        "requirements": [
            {
                "id": p.id,
                "category": p.category.value,
                "name": p.name,
                "values": p.values,
                "confidence": p.confidence,
                "rationale": p.rationale,
                "approved": p.approved,
                "edited": p.edited,
            }
            for p in state.get_all_proposals()
        ],
        "metadata": {
            "extractedAt": state.started_at,
            "completedAt": state.completed_at,
            "source": "mock-demo"
        }
    }
    
    print(json.dumps(export_data, indent=2))
    print()
    
    # Save export
    export_path = Path("/tmp/requirements_mock.json")
    with open(export_path, 'w') as f:
        json.dump(export_data, f, indent=2)
    print(f"✅ Export saved to: {export_path}")
    print()
    
    print("=" * 80)
    print("DEMONSTRATION COMPLETE!")
    print("=" * 80)
    print()
    
    print("📁 Generated Files:")
    print(f"   1. Screenshot: {test_image_path}")
    print(f"   2. Requirements JSON: {export_path}")
    print()
    
    print("🎯 Key Achievements:")
    print("   ✅ Component type classification with confidence scoring")
    print("   ✅ Props requirement detection with visual cue analysis")
    print("   ✅ Unique UUID generation for proposals")
    print("   ✅ Confidence-based review flagging")
    print("   ✅ Structured JSON export format")
    print()
    
    print("🔍 Next Steps for Full Implementation:")
    print("   1. Add OpenAI API key to test with real GPT-4V")
    print("   2. Complete events, states, and accessibility proposers")
    print("   3. Build approval panel UI (Phase 3)")
    print("   4. Implement export and integration (Phase 4)")
    print()


if __name__ == "__main__":
    demonstrate_workflow()
    print("✅ Mock demonstration completed successfully!")
    print()
