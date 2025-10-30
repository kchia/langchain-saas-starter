#!/usr/bin/env python3
"""
Script to load all fixture data into the database.

This script loads sample data for development and testing:
- Sample documents (markdown files, technical guides)
- Sample conversations and messages
- System prompt templates

Usage:
    python scripts/load_fixtures.py [--clear]

Options:
    --clear     Clear existing fixture data before loading
"""

import argparse
import sys
from pathlib import Path

# Add src to Python path
backend_dir = Path(__file__).parent.parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

from scripts.base_seeder import run_seeds
from scripts.fixtures.document_loader import DocumentFixtureLoader
from scripts.fixtures.conversation_loader import ConversationFixtureLoader, PromptFixtureLoader


def main():
    """Main function to load all fixtures."""
    parser = argparse.ArgumentParser(description="Load fixture data")
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Clear existing fixture data before loading"
    )
    parser.add_argument(
        "--documents-only",
        action="store_true",
        help="Load only document fixtures"
    )
    parser.add_argument(
        "--conversations-only",
        action="store_true",
        help="Load only conversation fixtures"
    )

    args = parser.parse_args()

    if args.clear:
        print("⚠️  WARNING: You are about to clear existing fixture data!")
        confirm = input("Are you sure you want to continue? (yes/no): ")
        if confirm.lower() != "yes":
            print("Aborted.")
            return

    print("📚 Loading fixture data...")

    try:
        if args.documents_only:
            loaders = [DocumentFixtureLoader]
            print("Loading documents only...")
        elif args.conversations_only:
            loaders = [ConversationFixtureLoader, PromptFixtureLoader]
            print("Loading conversations only...")
        else:
            loaders = [
                DocumentFixtureLoader,
                ConversationFixtureLoader,
                PromptFixtureLoader
            ]
            print("Loading all fixtures...")

        # Run all fixture loaders
        run_seeds(*loaders, clear_data=args.clear)

        print("✅ Fixture data loaded successfully!")
        print("\nLoaded fixtures:")
        print("  📄 Sample documents:")
        print("    - AI Development Best Practices Guide")
        print("    - Python Async Programming Patterns")
        print("    - Database Design Principles")
        print("  💬 Sample conversations:")
        print("    - RAG system setup discussion")
        print("    - Database performance optimization")
        print("    - Async Python patterns explanation")
        print("  🎯 System prompt templates:")
        print("    - AI Assistant, Code Reviewer, Database Expert")
        print("    - Security Analyst, Python Expert, RAG Specialist")

        print("\n🚀 Ready for AI development and testing!")

    except Exception as e:
        print(f"❌ Loading fixtures failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()