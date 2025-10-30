import os
import sys
import logging
from pathlib import Path
from typing import List, Type
from sqlalchemy.orm import Session

# Add src to Python path
backend_dir = Path(__file__).parent.parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

from core.database import get_sync_session
from core.logging import setup_logging, get_logger

# Initialize logging
setup_logging(
    log_level=os.getenv("LOG_LEVEL", "INFO"),
    environment=os.getenv("ENVIRONMENT", "development")
)

logger = get_logger(__name__)


class BaseSeeder:
    """Base class for database seeders."""

    def __init__(self, session: Session = None):
        self.session = session or get_sync_session()
        self.logger = get_logger(self.__class__.__name__)

    def seed(self) -> None:
        """Override this method in subclasses to implement seeding logic."""
        raise NotImplementedError("Subclasses must implement the seed method")

    def run(self) -> None:
        """Execute the seeding process with proper transaction handling."""
        try:
            self.logger.info(f"Starting seeding: {self.__class__.__name__}")
            self.seed()
            self.session.commit()
            self.logger.info(f"Seeding completed successfully: {self.__class__.__name__}")
        except Exception as e:
            self.logger.error(f"Seeding failed: {self.__class__.__name__} - {e}")
            self.session.rollback()
            raise
        finally:
            self.session.close()

    def get_or_create(self, model_class, defaults=None, **kwargs):
        """Get existing record or create new one."""
        instance = self.session.query(model_class).filter_by(**kwargs).first()
        if instance:
            self.logger.debug(f"Found existing {model_class.__name__}: {kwargs}")
            return instance, False
        else:
            params = kwargs.copy()
            if defaults:
                params.update(defaults)
            instance = model_class(**params)
            self.session.add(instance)
            self.session.flush()  # Get the ID without committing
            self.logger.info(f"Created new {model_class.__name__}: {kwargs}")
            return instance, True

    def clear_table(self, model_class) -> int:
        """Clear all records from a table."""
        count = self.session.query(model_class).count()
        if count > 0:
            self.session.query(model_class).delete()
            self.logger.warning(f"Cleared {count} records from {model_class.__name__}")
        return count


class SeederRunner:
    """Utility class to run multiple seeders in order."""

    def __init__(self, session: Session = None):
        self.session = session or get_sync_session()
        self.logger = get_logger(self.__class__.__name__)

    def run_seeders(self, seeder_classes: List[Type[BaseSeeder]], clear_data: bool = False) -> None:
        """
        Run multiple seeders in sequence.

        Args:
            seeder_classes: List of seeder classes to run
            clear_data: Whether to clear existing data before seeding
        """
        try:
            self.logger.info("Starting database seeding process")

            for seeder_class in seeder_classes:
                seeder = seeder_class(self.session)

                if clear_data:
                    # This is a simplified approach - in production, you'd want
                    # more sophisticated data clearing with foreign key handling
                    self.logger.warning(f"Clear data mode enabled for {seeder_class.__name__}")

                seeder.seed()

            self.session.commit()
            self.logger.info("All seeders completed successfully")

        except Exception as e:
            self.logger.error(f"Seeding process failed: {e}")
            self.session.rollback()
            raise
        finally:
            self.session.close()


def run_seeds(*seeder_classes: Type[BaseSeeder], clear_data: bool = False) -> None:
    """
    Convenience function to run seeders.

    Usage:
        run_seeds(UserSeeder, DocumentSeeder, clear_data=True)
    """
    runner = SeederRunner()
    runner.run_seeders(list(seeder_classes), clear_data=clear_data)


if __name__ == "__main__":
    # Example usage - this would be implemented in specific seed files
    logger.info("Base seeder module loaded. Import specific seeders to run them.")