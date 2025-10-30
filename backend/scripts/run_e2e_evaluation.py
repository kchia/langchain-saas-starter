#!/usr/bin/env python3
"""
Run end-to-end evaluation on golden dataset.

This script evaluates the complete screenshot-to-code pipeline:
- Token extraction accuracy (GPT-4V)
- Pattern retrieval accuracy (Hybrid BM25+Semantic)
- Code generation quality (LLM + TypeScript validation)
- Overall pipeline success rate

Usage:
    # From backend directory with virtual environment activated:
    cd backend
    source venv/bin/activate
    python scripts/run_e2e_evaluation.py
    
    # Or use the activation script from project root:
    source activate_env.sh
    cd backend
    python scripts/run_e2e_evaluation.py

Requirements:
    - Virtual environment activated with backend dependencies installed
    - OPENAI_API_KEY environment variable must be set
    - Golden dataset must exist in backend/data/golden_dataset/
    - Services must be properly configured
"""

import asyncio
import json
import sys
import os
from pathlib import Path
from datetime import datetime

# Add backend directory to path for proper imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.evaluation.e2e_evaluator import E2EEvaluator
from src.core.logging import get_logger

logger = get_logger(__name__)


def print_banner(text: str):
    """Print formatted banner."""
    print()
    print("=" * 80)
    print(text)
    print("=" * 80)
    print()


def print_section(text: str):
    """Print formatted section header."""
    print()
    print(text)
    print("-" * 80)


async def main():
    """Run E2E evaluation and display results."""
    print_banner("ComponentForge: End-to-End Pipeline Evaluation")

    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ ERROR: OPENAI_API_KEY environment variable not set")
        print("   Please set it to run this evaluation:")
        print("   export OPENAI_API_KEY='your-api-key-here'")
        sys.exit(1)

    print("✅ OpenAI API key found")

    # Initialize evaluator
    print("📊 Initializing evaluator...")
    try:
        evaluator = E2EEvaluator(api_key=api_key)
        dataset_size = len(evaluator.dataset)
        print(f"   Loaded {dataset_size} samples from golden dataset")
        print(f"   Note: Samples without screenshot files will be skipped")
    except Exception as e:
        print(f"❌ ERROR: Failed to initialize evaluator: {e}")
        sys.exit(1)

    # Run evaluation
    print()
    print("🚀 Running evaluation...")
    print("   This may take a few minutes (GPT-4V calls + code generation)")
    print()

    try:
        results = await evaluator.evaluate_all()
    except Exception as e:
        print(f"❌ ERROR: Evaluation failed: {e}")
        logger.exception("Evaluation failed")
        sys.exit(1)

    # Display results
    print_banner("RESULTS")

    # Overall Metrics
    overall = results['overall']

    print_section("📈 OVERALL METRICS")
    print(f"   Total Samples: {results['dataset_size']}")
    print(f"   Evaluated: {len(results['per_screenshot'])} (samples with screenshots)")
    print(f"   Pipeline Success Rate: {overall['pipeline_success_rate']:.1%}")
    print(f"   Average Latency: {overall['avg_latency_ms']:.0f}ms")
    print()

    # Stage-by-Stage Metrics
    print_section("🔍 TOKEN EXTRACTION")
    token_metrics = overall['token_extraction']
    print(f"   Average Accuracy: {token_metrics['avg_accuracy']:.1%}")
    print()

    print_section("🎯 PATTERN RETRIEVAL")
    retrieval_metrics = overall['retrieval']
    print(f"   MRR (Context Precision): {retrieval_metrics['mrr']:.3f}")
    print(f"   Hit@3 (Context Recall): {retrieval_metrics['hit_at_3']:.1%}")
    print(f"   Precision@1 (Top-1 Accuracy): {retrieval_metrics['precision_at_1']:.1%}")
    print()

    print_section("💻 CODE GENERATION")
    gen_metrics = overall['generation']
    print(f"   Compilation Rate (TypeScript Validity): {gen_metrics['compilation_rate']:.1%}")
    print(f"   Average Quality Score: {gen_metrics['avg_quality_score']:.2f}")
    print(f"   Success Rate: {gen_metrics['success_rate']:.1%}")
    print()

    # Failure Analysis
    print_section("🔴 FAILURE ANALYSIS")
    failures = overall['stage_failures']
    total_failures = sum(failures.values())
    if total_failures > 0:
        print(f"   Total Failures: {total_failures}")
        print(f"   - Token Extraction: {failures['token_extraction']}")
        print(f"   - Pattern Retrieval: {failures['retrieval']}")
        print(f"   - Code Generation: {failures['generation']}")
    else:
        print("   ✅ No failures!")
    print()

    # Per-Screenshot Results
    print_section("📸 PER-SCREENSHOT RESULTS")
    for result in results['per_screenshot']:
        status = "✅" if result['pipeline_success'] else "❌"
        print(f"{status} {result['screenshot_id']}")
        print(f"      Token Accuracy: {result['token_extraction']['accuracy']:.1%}")

        retrieval = result['retrieval']
        retrieval_status = '✓' if retrieval['correct'] else '✗'
        print(f"      Retrieval: {retrieval_status} (expected: {retrieval['expected']}, got: {retrieval['retrieved']})")

        generation = result['generation']
        gen_status = '✓' if generation['code_compiles'] else '✗'
        print(f"      Generation: {gen_status} (quality: {generation['quality_score']:.2f})")

        print(f"      Latency: {result['total_latency_ms']:.0f}ms")
        print()

    # Save report
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    logs_dir = Path(__file__).parent.parent / 'logs'
    logs_dir.mkdir(parents=True, exist_ok=True)
    report_path = logs_dir / f'e2e_evaluation_{timestamp}.json'

    with open(report_path, 'w') as f:
        json.dump(results, f, indent=2)

    print_banner("REPORT SAVED")
    print(f"📄 Full report saved to: {report_path}")
    print()

    # Summary with exit code
    success_rate = overall['pipeline_success_rate']
    if success_rate >= 0.8:
        print("✅ Evaluation PASSED (success rate >= 80%)")
        sys.exit(0)
    else:
        print(f"❌ Evaluation FAILED (success rate {success_rate:.1%} < 80%)")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
