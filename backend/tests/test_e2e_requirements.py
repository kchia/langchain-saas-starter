"""End-to-end test for Epic 2 requirement proposal system.

This script tests the complete workflow from component classification
through props proposal with a sample button component.
"""

import asyncio
import json
import sys
import os
import pytest
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from PIL import Image, ImageDraw, ImageFont
from src.agents.requirement_orchestrator import RequirementOrchestrator
from src.types.requirement_types import get_confidence_level


def create_test_button_image() -> Image.Image:
    """Create a simple test button image for demonstration.
    
    Returns:
        PIL Image of a button component
    """
    # Create a 400x150 image with white background
    img = Image.new('RGB', (400, 150), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw a button-like rectangle (primary style)
    button_rect = (50, 50, 200, 100)
    draw.rectangle(button_rect, fill='#3B82F6', outline='#2563EB', width=2)
    
    # Add text to button
    try:
        # Try to use a default font
        font = ImageFont.load_default()
    except:
        font = None
    
    text = "Sign In"
    # Get text bbox for centering
    if font:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    else:
        text_width, text_height = 40, 10
    
    button_center_x = (button_rect[0] + button_rect[2]) // 2
    button_center_y = (button_rect[1] + button_rect[3]) // 2
    text_x = button_center_x - text_width // 2
    text_y = button_center_y - text_height // 2
    
    draw.text((text_x, text_y), text, fill='white', font=font)
    
    # Draw a secondary button variant
    button2_rect = (220, 50, 370, 100)
    draw.rectangle(button2_rect, fill='white', outline='#3B82F6', width=2)
    draw.text((text_x + 170, text_y), text, fill='#3B82F6', font=font)
    
    return img


@pytest.mark.asyncio
async def test_requirement_proposal():
    """Test the complete requirement proposal workflow."""
    
    print("=" * 80)
    print("EPIC 2: END-TO-END REQUIREMENT PROPOSAL TEST")
    print("=" * 80)
    print()
    
    # Check for OpenAI API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ ERROR: OPENAI_API_KEY environment variable not set")
        print("   Please set it to run this test:")
        print("   export OPENAI_API_KEY='your-api-key-here'")
        return False
    
    print("✅ OpenAI API key found")
    print()
    
    # Step 1: Create test image
    print("Step 1: Creating test button component image...")
    test_image = create_test_button_image()
    print(f"   ✓ Created test image: {test_image.size[0]}x{test_image.size[1]} pixels")
    print()
    
    # Save test image for reference
    test_image_path = Path("/tmp/test_button.png")
    test_image.save(test_image_path)
    print(f"   ✓ Saved test image to: {test_image_path}")
    print()
    
    # Step 2: Initialize orchestrator
    print("Step 2: Initializing requirement orchestrator...")
    orchestrator = RequirementOrchestrator(openai_api_key=api_key)
    print("   ✓ Component classifier initialized")
    print("   ✓ Props proposer initialized")
    print()
    
    # Step 3: Create sample design tokens (from Epic 1)
    print("Step 3: Preparing design tokens context...")
    sample_tokens = {
        "colors": [
            {"name": "primary", "value": "#3B82F6", "confidence": 0.95},
            {"name": "primary-dark", "value": "#2563EB", "confidence": 0.90},
        ],
        "spacing": [
            {"name": "md", "value": "16px", "confidence": 0.88},
            {"name": "lg", "value": "24px", "confidence": 0.85},
        ],
    }
    print("   ✓ Sample tokens prepared")
    print()
    
    # Step 4: Run requirement proposal workflow
    print("Step 4: Running requirement proposal workflow...")
    print("   (This may take 10-20 seconds depending on API response time)")
    print()
    
    try:
        state = await orchestrator.propose_requirements(
            image=test_image,
            figma_data=None,
            tokens=sample_tokens
        )
        
        print("   ✅ Workflow completed successfully!")
        print()
        
    except Exception as e:
        print(f"   ❌ Workflow failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Step 5: Display results
    print("=" * 80)
    print("RESULTS")
    print("=" * 80)
    print()
    
    # Component Classification
    if state.classification:
        print("📋 COMPONENT CLASSIFICATION")
        print("-" * 80)
        print(f"   Type: {state.classification.component_type.value}")
        print(f"   Confidence: {state.classification.confidence:.2f} ({get_confidence_level(state.classification.confidence).value})")
        print(f"   Rationale: {state.classification.rationale[:150]}...")
        
        if state.classification.candidates:
            print(f"   Alternative candidates: {len(state.classification.candidates)}")
            for i, candidate in enumerate(state.classification.candidates[:3], 1):
                print(f"      {i}. {candidate['type'].value} (confidence: {candidate['confidence']:.2f})")
        print()
    else:
        print("❌ No classification result")
        print()
    
    # Props Proposals
    print("🔧 PROPS REQUIREMENTS")
    print("-" * 80)
    
    if state.props_proposals:
        print(f"   Total proposed: {len(state.props_proposals)}")
        print()
        
        for i, prop in enumerate(state.props_proposals, 1):
            print(f"   {i}. {prop.name}")
            print(f"      Category: {prop.category.value}")
            if prop.values:
                print(f"      Values: {', '.join(prop.values)}")
            print(f"      Confidence: {prop.confidence:.2f} ({get_confidence_level(prop.confidence).value})")
            
            # Flag for review if confidence < 0.8
            if prop.confidence < 0.8:
                print(f"      ⚠️  FLAGGED FOR REVIEW (confidence < 0.8)")
            
            print(f"      Rationale: {prop.rationale}")
            print(f"      Approved: {prop.approved}")
            print()
    else:
        print("   ℹ️  No props proposals generated")
        print()
    
    # Events Proposals (not yet implemented)
    print("📡 EVENTS REQUIREMENTS")
    print("-" * 80)
    if state.events_proposals:
        print(f"   Total proposed: {len(state.events_proposals)}")
    else:
        print("   ℹ️  Not yet implemented (coming in commits 9-10)")
    print()
    
    # States Proposals (not yet implemented)
    print("🎨 STATES REQUIREMENTS")
    print("-" * 80)
    if state.states_proposals:
        print(f"   Total proposed: {len(state.states_proposals)}")
    else:
        print("   ℹ️  Not yet implemented (coming in commits 11-12)")
    print()
    
    # Accessibility Proposals (not yet implemented)
    print("♿ ACCESSIBILITY REQUIREMENTS")
    print("-" * 80)
    if state.accessibility_proposals:
        print(f"   Total proposed: {len(state.accessibility_proposals)}")
    else:
        print("   ℹ️  Not yet implemented (coming in commits 13-14)")
    print()
    
    # Performance Metrics
    print("⏱️  PERFORMANCE METRICS")
    print("-" * 80)
    if state.started_at and state.completed_at:
        from datetime import datetime
        start = datetime.fromisoformat(state.started_at)
        end = datetime.fromisoformat(state.completed_at)
        latency = (end - start).total_seconds()
        
        print(f"   Latency: {latency:.2f}s")
        print(f"   Target: ≤15s (p50)")
        
        if latency <= 15:
            print(f"   ✅ Within target!")
        else:
            print(f"   ⚠️  Exceeds target by {latency - 15:.2f}s")
        print()
    
    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print()
    
    total_proposals = len(state.get_all_proposals())
    high_confidence = sum(1 for p in state.get_all_proposals() if p.confidence >= 0.9)
    medium_confidence = sum(1 for p in state.get_all_proposals() if 0.7 <= p.confidence < 0.9)
    low_confidence = sum(1 for p in state.get_all_proposals() if p.confidence < 0.7)
    
    print(f"✅ Total Requirements Proposed: {total_proposals}")
    print(f"   - High confidence (≥0.9): {high_confidence}")
    print(f"   - Medium confidence (0.7-0.9): {medium_confidence}")
    print(f"   - Low confidence (<0.7): {low_confidence}")
    print()
    
    if state.error:
        print(f"❌ Errors: {state.error}")
    else:
        print("✅ No errors")
    print()
    
    # Export preview
    print("📦 EXPORT PREVIEW (requirements.json)")
    print("-" * 80)
    export_data = {
        "componentType": state.classification.component_type.value if state.classification else "Unknown",
        "confidence": state.classification.confidence if state.classification else 0.0,
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
            "source": "test"
        }
    }
    
    print(json.dumps(export_data, indent=2))
    print()
    
    print("=" * 80)
    print("TEST COMPLETED SUCCESSFULLY! ✅")
    print("=" * 80)
    
    return True


if __name__ == "__main__":
    print()
    success = asyncio.run(test_requirement_proposal())
    
    if success:
        print()
        print("✅ All tests passed!")
        print()
        print("Next steps:")
        print("1. Review the proposals above")
        print("2. Check /tmp/test_button.png to see the test image")
        print("3. Verify LangSmith traces at https://smith.langchain.com")
        print()
        sys.exit(0)
    else:
        print()
        print("❌ Tests failed - check errors above")
        print()
        sys.exit(1)
