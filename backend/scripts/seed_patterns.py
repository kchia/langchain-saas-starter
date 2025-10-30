"""Seed Qdrant with component patterns from JSON files.

This script loads component patterns from JSON files and creates embeddings
for them in Qdrant for semantic search and pattern retrieval.
"""

import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Any

# Load environment variables from .env file
from dotenv import load_dotenv
backend_dir = Path(__file__).parent.parent
load_dotenv(backend_dir / ".env")

# Add src to Python path
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

from core.logging import setup_logging, get_logger

# Try to import optional dependencies
try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams, PointStruct
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    print("Warning: qdrant-client not available. Install with: pip install qdrant-client")

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("Warning: openai not available. Install with: pip install openai")

# Initialize logging
setup_logging(
    log_level=os.getenv("LOG_LEVEL", "INFO"),
    environment=os.getenv("ENVIRONMENT", "development")
)

logger = get_logger(__name__)


class PatternSeeder:
    """Seed Qdrant with component patterns."""

    def __init__(
        self,
        qdrant_url: str = None,
        qdrant_api_key: str = None,
        openai_api_key: str = None,
        collection_name: str = "patterns",
        vector_size: int = 1536,  # text-embedding-3-small dimension
    ):
        """Initialize the pattern seeder.

        Args:
            qdrant_url: URL to Qdrant instance
            qdrant_api_key: API key for Qdrant (optional for local)
            openai_api_key: OpenAI API key for embeddings
            collection_name: Name of the Qdrant collection
            vector_size: Dimension of embedding vectors
        """
        self.qdrant_url = qdrant_url or os.getenv("QDRANT_URL", "http://localhost:6333")
        self.qdrant_api_key = qdrant_api_key or os.getenv("QDRANT_API_KEY")
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.collection_name = collection_name
        self.vector_size = vector_size

        if not QDRANT_AVAILABLE:
            raise ImportError("qdrant-client is required. Install with: pip install qdrant-client")

        if not OPENAI_AVAILABLE:
            raise ImportError("openai is required. Install with: pip install openai")

        # Initialize clients
        self.qdrant_client = QdrantClient(
            url=self.qdrant_url,
            api_key=self.qdrant_api_key,
        )

        self.openai_client = OpenAI(api_key=self.openai_api_key)

    def create_collection(self, recreate: bool = False) -> None:
        """Create or recreate the Qdrant collection.

        Args:
            recreate: If True, delete existing collection and create new one
        """
        try:
            # Check if collection exists
            collections = self.qdrant_client.get_collections().collections
            collection_exists = any(c.name == self.collection_name for c in collections)

            if collection_exists:
                if recreate:
                    logger.info(f"Deleting existing collection: {self.collection_name}")
                    self.qdrant_client.delete_collection(self.collection_name)
                else:
                    logger.info(f"Collection {self.collection_name} already exists")
                    return

            # Create collection
            logger.info(f"Creating collection: {self.collection_name}")
            self.qdrant_client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.vector_size,
                    distance=Distance.COSINE,
                ),
            )
            logger.info(f"Collection {self.collection_name} created successfully")

        except Exception as e:
            logger.error(f"Error creating collection: {e}")
            raise

    def create_embedding(self, text: str) -> List[float]:
        """Create embedding for text using OpenAI.

        Args:
            text: Text to embed

        Returns:
            List of floats representing the embedding vector
        """
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text,
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error creating embedding: {e}")
            raise

    def load_pattern(self, pattern_file: Path) -> Dict[str, Any]:
        """Load pattern from JSON file.

        Args:
            pattern_file: Path to pattern JSON file

        Returns:
            Dictionary containing pattern data
        """
        try:
            with open(pattern_file, 'r') as f:
                pattern = json.load(f)
            logger.info(f"Loaded pattern: {pattern.get('name')} from {pattern_file.name}")
            return pattern
        except Exception as e:
            logger.error(f"Error loading pattern from {pattern_file}: {e}")
            raise

    def create_searchable_text(self, pattern: Dict[str, Any]) -> str:
        """Create searchable text representation of pattern.

        Args:
            pattern: Pattern dictionary

        Returns:
            Combined text for embedding
        """
        parts = [
            f"Component: {pattern.get('name', '')}",
            f"Category: {pattern.get('category', '')}",
            f"Description: {pattern.get('description', '')}",
            f"Framework: {pattern.get('framework', '')}",
            f"Library: {pattern.get('library', '')}",
        ]

        # Add metadata information
        metadata = pattern.get('metadata', {})

        # Add variants
        if 'variants' in metadata:
            variants = [v.get('name', '') for v in metadata['variants']]
            parts.append(f"Variants: {', '.join(variants)}")

        # Add components (for composite components like Card)
        if 'components' in metadata:
            components = [c.get('name', '') for c in metadata['components']]
            parts.append(f"Sub-components: {', '.join(components)}")

        # Add a11y features
        if 'a11y' in metadata and 'features' in metadata['a11y']:
            features = metadata['a11y']['features']
            parts.append(f"Accessibility: {', '.join(features)}")

        return "\n".join(parts)

    def seed_pattern(self, pattern: Dict[str, Any], point_id: int) -> None:
        """Seed a single pattern into Qdrant.

        Args:
            pattern: Pattern dictionary
            point_id: Unique ID for the point
        """
        try:
            # Create searchable text
            searchable_text = self.create_searchable_text(pattern)

            # Create embedding
            logger.info(f"Creating embedding for pattern: {pattern.get('name')}")
            embedding = self.create_embedding(searchable_text)

            # Prepare payload (exclude code from payload for storage optimization)
            payload = {
                "id": pattern.get("id"),
                "name": pattern.get("name"),
                "category": pattern.get("category"),
                "description": pattern.get("description"),
                "framework": pattern.get("framework"),
                "library": pattern.get("library"),
                "metadata": pattern.get("metadata", {}),
                "searchable_text": searchable_text,
            }

            # Create point
            point = PointStruct(
                id=point_id,
                vector=embedding,
                payload=payload,
            )

            # Upload to Qdrant
            self.qdrant_client.upsert(
                collection_name=self.collection_name,
                points=[point],
            )

            logger.info(f"Seeded pattern: {pattern.get('name')} (ID: {point_id})")

        except Exception as e:
            logger.error(f"Error seeding pattern {pattern.get('name')}: {e}")
            raise

    def seed_from_directory(self, patterns_dir: Path, recreate: bool = False) -> int:
        """Seed all patterns from a directory.

        Args:
            patterns_dir: Directory containing pattern JSON files
            recreate: If True, recreate the collection

        Returns:
            Number of patterns seeded
        """
        # Create collection
        self.create_collection(recreate=recreate)

        # Find all JSON files
        pattern_files = sorted(patterns_dir.glob("*.json"))

        if not pattern_files:
            logger.warning(f"No pattern files found in {patterns_dir}")
            return 0

        logger.info(f"Found {len(pattern_files)} pattern files")

        # Seed each pattern and track failures
        seeded_count = 0
        failed_patterns = []
        
        for idx, pattern_file in enumerate(pattern_files, start=1):
            try:
                pattern = self.load_pattern(pattern_file)
                self.seed_pattern(pattern, point_id=idx)
                seeded_count += 1
            except Exception as e:
                logger.error(f"Failed to seed pattern from {pattern_file}: {e}")
                failed_patterns.append((pattern_file.name, str(e)))
                # Continue with other patterns

        # Report results
        logger.info(f"Successfully seeded {seeded_count}/{len(pattern_files)} patterns")
        
        if failed_patterns:
            logger.warning(f"Failed to seed {len(failed_patterns)} pattern(s):")
            for filename, error in failed_patterns:
                logger.warning(f"  - {filename}: {error}")
        
        return seeded_count


def main():
    """Main function to run pattern seeding."""
    logger.info("Starting pattern seeding process")

    # Get patterns directory
    backend_dir = Path(__file__).parent.parent
    patterns_dir = backend_dir / "data" / "patterns"

    if not patterns_dir.exists():
        logger.error(f"Patterns directory not found: {patterns_dir}")
        sys.exit(1)

    # Check for required environment variables
    if not os.getenv("OPENAI_API_KEY"):
        logger.error("OPENAI_API_KEY environment variable not set")
        sys.exit(1)

    try:
        # Initialize seeder
        seeder = PatternSeeder()

        # Seed patterns (recreate=True to start fresh)
        count = seeder.seed_from_directory(patterns_dir, recreate=True)

        logger.info(f"✅ Pattern seeding complete! Seeded {count} patterns.")
        logger.info(f"🔍 View patterns at: {seeder.qdrant_url}/dashboard")

    except Exception as e:
        logger.error(f"Pattern seeding failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
