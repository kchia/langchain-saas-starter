import sys
from pathlib import Path

# Add src to Python path
backend_dir = Path(__file__).parent.parent.parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

from core.models import EmbeddingModel
from scripts.base_seeder import BaseSeeder


class EmbeddingModelSeeder(BaseSeeder):
    """Seeder for creating embedding model configurations."""

    def seed(self) -> None:
        """Create embedding model configurations."""

        models_data = [
            {
                "name": "text-embedding-3-small",
                "provider": "openai",
                "model_id": "text-embedding-3-small",
                "dimension": 1536,
                "max_tokens": 8192,
                "is_active": True,
                "is_default": True,
                "description": "OpenAI's latest small embedding model with good performance and cost efficiency",
                "configuration": {
                    "api_version": "v1",
                    "cost_per_1k_tokens": 0.00002,
                    "supports_batching": True,
                    "max_batch_size": 2048
                }
            },
            {
                "name": "text-embedding-3-large",
                "provider": "openai",
                "model_id": "text-embedding-3-large",
                "dimension": 3072,
                "max_tokens": 8192,
                "is_active": True,
                "is_default": False,
                "description": "OpenAI's large embedding model with highest quality embeddings",
                "configuration": {
                    "api_version": "v1",
                    "cost_per_1k_tokens": 0.00013,
                    "supports_batching": True,
                    "max_batch_size": 2048
                }
            },
            {
                "name": "text-embedding-ada-002",
                "provider": "openai",
                "model_id": "text-embedding-ada-002",
                "dimension": 1536,
                "max_tokens": 8192,
                "is_active": False,
                "is_default": False,
                "description": "OpenAI's previous generation embedding model (deprecated)",
                "configuration": {
                    "api_version": "v1",
                    "cost_per_1k_tokens": 0.0001,
                    "supports_batching": True,
                    "max_batch_size": 2048,
                    "deprecated": True
                }
            },
            {
                "name": "all-MiniLM-L6-v2",
                "provider": "huggingface",
                "model_id": "sentence-transformers/all-MiniLM-L6-v2",
                "dimension": 384,
                "max_tokens": 512,
                "is_active": True,
                "is_default": False,
                "description": "Lightweight sentence transformer model, good for local deployment",
                "configuration": {
                    "local_model": True,
                    "model_size_mb": 90,
                    "inference_speed": "fast",
                    "supports_batching": True,
                    "max_batch_size": 32
                }
            },
            {
                "name": "all-mpnet-base-v2",
                "provider": "huggingface",
                "model_id": "sentence-transformers/all-mpnet-base-v2",
                "dimension": 768,
                "max_tokens": 512,
                "is_active": True,
                "is_default": False,
                "description": "High-quality sentence transformer model for semantic similarity",
                "configuration": {
                    "local_model": True,
                    "model_size_mb": 420,
                    "inference_speed": "medium",
                    "supports_batching": True,
                    "max_batch_size": 16
                }
            }
        ]

        for model_data in models_data:
            model, created = self.get_or_create(
                EmbeddingModel,
                name=model_data["name"],
                defaults=model_data
            )

            if created:
                self.logger.info(f"Created embedding model: {model.name}")
            else:
                self.logger.info(f"Embedding model already exists: {model.name}")

        # Ensure only one default model
        default_models = self.session.query(EmbeddingModel).filter_by(is_default=True).all()
        if len(default_models) > 1:
            # Keep only the first one as default
            for model in default_models[1:]:
                model.is_default = False
                self.logger.info(f"Removed default flag from: {model.name}")


if __name__ == "__main__":
    # Run this seeder directly
    seeder = EmbeddingModelSeeder()
    seeder.run()