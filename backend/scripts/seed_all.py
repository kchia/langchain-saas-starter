#!/usr/bin/env python3
"""
Main script to run all database seeders.

Usage:
    python scripts/seed_all.py [--clear]

Options:
    --clear     Clear existing data before seeding (WARNING: This will delete all data!)
"""

import argparse
import sys
from pathlib import Path

# Add src to Python path
backend_dir = Path(__file__).parent.parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

from scripts.base_seeder import run_seeds
from scripts.seeds.user_seeder import UserSeeder
from scripts.seeds.embedding_model_seeder import EmbeddingModelSeeder


def main():
    """Main function to run all seeders."""
    parser = argparse.ArgumentParser(description="Run database seeders")
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Clear existing data before seeding (WARNING: This will delete all data!)"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging"
    )

    args = parser.parse_args()

    if args.clear:
        print("⚠️  WARNING: You are about to clear all existing data!")
        print("This action cannot be undone.")
        confirm = input("Are you sure you want to continue? (yes/no): ")
        if confirm.lower() != "yes":
            print("Aborted.")
            return

    print("🌱 Starting database seeding...")

    try:
        # Define the order of seeders - important for foreign key constraints
        seeder_order = [
            UserSeeder,
            EmbeddingModelSeeder,
            # Add more seeders here as they're created
        ]

        # Run all seeders
        run_seeds(*seeder_order, clear_data=args.clear)

        print("✅ Database seeding completed successfully!")
        print("\nCreated:")
        print("  - Development users (admin, testuser, researcher, demo)")
        print("  - Embedding model configurations")
        print("\nTest credentials:")
        print("  Admin: admin@example.com / admin123")
        print("  User:  user@example.com / user123")
        print("  Demo:  demo@example.com / demo123")

    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()