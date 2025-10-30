import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

from .logging import get_logger
from .models import Base

logger = get_logger(__name__)


class DatabaseConfig:
    """Database configuration from environment variables."""

    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL")
        self.test_database_url = os.getenv("TEST_DATABASE_URL")
        self.echo_sql = os.getenv("LOG_SQL_QUERIES", "false").lower() == "true"
        self.pool_size = int(os.getenv("DB_POOL_SIZE", "10"))
        self.max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "20"))
        self.pool_timeout = int(os.getenv("DB_POOL_TIMEOUT", "30"))

    @property
    def async_database_url(self) -> str:
        """Convert PostgreSQL URL to async version."""
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")

        # Convert postgresql:// to postgresql+asyncpg://
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif self.database_url.startswith("postgresql+asyncpg://"):
            return self.database_url
        else:
            raise ValueError("DATABASE_URL must be a PostgreSQL URL")

    @property
    def sync_database_url(self) -> str:
        """Get synchronous database URL for migrations."""
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")

        # Ensure it's a sync URL for Alembic
        if self.database_url.startswith("postgresql+asyncpg://"):
            return self.database_url.replace("postgresql+asyncpg://", "postgresql://", 1)
        elif self.database_url.startswith("postgresql://"):
            return self.database_url
        else:
            raise ValueError("DATABASE_URL must be a PostgreSQL URL")


# Global database configuration
db_config = DatabaseConfig()

# Create async engine
engine = create_async_engine(
    db_config.async_database_url,
    echo=db_config.echo_sql,
    pool_size=db_config.pool_size,
    max_overflow=db_config.max_overflow,
    pool_timeout=db_config.pool_timeout,
    pool_pre_ping=True,  # Verify connections before use
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=True,
    autocommit=False,
)

# Sync engine for migrations and seeds
sync_engine = create_engine(
    db_config.sync_database_url,
    echo=db_config.echo_sql,
    pool_size=db_config.pool_size,
    max_overflow=db_config.max_overflow,
    pool_timeout=db_config.pool_timeout,
    pool_pre_ping=True,
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get async database session.

    Usage in FastAPI:
        @app.get("/endpoint")
        async def endpoint(db: AsyncSession = Depends(get_async_session)):
            # Use db session
    """
    async with AsyncSessionLocal() as session:
        try:
            logger.debug("Creating new database session")
            yield session
            await session.commit()
            logger.debug("Database session committed successfully")
        except Exception as e:
            logger.error(f"Database session error: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()
            logger.debug("Database session closed")


async def init_database():
    """Initialize database - create all tables."""
    try:
        logger.info("Initializing database tables")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def close_database():
    """Close database connections."""
    try:
        logger.info("Closing database connections")
        await engine.dispose()
        logger.info("Database connections closed successfully")
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")
        raise


async def check_database_connection() -> bool:
    """Check if database connection is working."""
    try:
        async with AsyncSessionLocal() as session:
            await session.execute("SELECT 1")
            logger.info("Database connection successful")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


# Context manager for database sessions
class DatabaseSession:
    """Context manager for database sessions with automatic cleanup."""

    def __init__(self):
        self.session = None

    async def __aenter__(self) -> AsyncSession:
        self.session = AsyncSessionLocal()
        logger.debug("Database session started")
        return self.session

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            if exc_type:
                logger.warning(f"Rolling back transaction due to exception: {exc_val}")
                await self.session.rollback()
            else:
                await self.session.commit()
                logger.debug("Database transaction committed")

            await self.session.close()
            logger.debug("Database session closed")


# Test database setup for pytest
def create_test_engine():
    """Create a test database engine with in-memory SQLite."""
    test_url = "sqlite+aiosqlite:///:memory:"

    test_engine = create_async_engine(
        test_url,
        echo=False,
        poolclass=StaticPool,
        connect_args={
            "check_same_thread": False,
        },
    )

    return test_engine


async def setup_test_database():
    """Set up test database for testing."""
    test_engine = create_test_engine()

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Create test session factory
    TestSessionLocal = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    return test_engine, TestSessionLocal


# Migration utilities
def get_sync_session():
    """Get synchronous session for migrations and seed scripts."""
    from sqlalchemy.orm import sessionmaker

    SyncSessionLocal = sessionmaker(
        bind=sync_engine,
        autoflush=True,
        autocommit=False,
    )

    return SyncSessionLocal()


# Health check function
async def database_health_check() -> dict:
    """
    Comprehensive database health check.

    Returns:
        dict: Health status with connection info and metrics
    """
    try:
        start_time = time.time()

        async with AsyncSessionLocal() as session:
            # Test basic connectivity
            result = await session.execute("SELECT version()")
            db_version = result.scalar()

            # Test table existence
            result = await session.execute(
                "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'"
            )
            table_count = result.scalar()

        connection_time = (time.time() - start_time) * 1000

        return {
            "status": "healthy",
            "database_version": db_version,
            "table_count": table_count,
            "connection_time_ms": round(connection_time, 2),
            "pool_size": engine.pool.size(),
            "checked_in_connections": engine.pool.checkedin(),
            "checked_out_connections": engine.pool.checkedout(),
        }

    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "connection_time_ms": None,
        }


# Import time module for health check
import time