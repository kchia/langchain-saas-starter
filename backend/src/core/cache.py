"""Redis cache utilities for caching API responses."""

import os
import json
from typing import Optional
from redis.asyncio import Redis, ConnectionPool
from contextlib import asynccontextmanager

from .logging import get_logger

logger = get_logger(__name__)


class CacheConfig:
    """Cache configuration from environment variables."""

    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.default_ttl = int(os.getenv("CACHE_DEFAULT_TTL", "300"))  # 5 minutes
        self.enabled = os.getenv("CACHE_ENABLED", "true").lower() == "true"


# Global connection pool
_connection_pool: Optional[ConnectionPool] = None
_config: Optional[CacheConfig] = None


def get_cache_config() -> CacheConfig:
    """Get cache configuration singleton."""
    global _config
    if _config is None:
        _config = CacheConfig()
    return _config


async def get_redis_pool() -> ConnectionPool:
    """Get or create Redis connection pool."""
    global _connection_pool
    if _connection_pool is None:
        config = get_cache_config()
        _connection_pool = ConnectionPool.from_url(
            config.redis_url,
            decode_responses=True,
            max_connections=10,
        )
        logger.info(f"Created Redis connection pool: {config.redis_url}")
    return _connection_pool


@asynccontextmanager
async def get_redis() -> Redis:
    """Get Redis connection from pool."""
    pool = await get_redis_pool()
    redis = Redis(connection_pool=pool)
    try:
        yield redis
    finally:
        await redis.close()


async def close_redis_pool():
    """Close Redis connection pool."""
    global _connection_pool
    if _connection_pool is not None:
        await _connection_pool.disconnect()
        _connection_pool = None
        logger.info("Closed Redis connection pool")


class BaseCache:
    """Base cache class with common functionality."""

    def __init__(self, ttl: Optional[int] = None):
        """
        Initialize cache.

        Args:
            ttl: Time-to-live in seconds. If None, uses default from config.
        """
        self.config = get_cache_config()
        self.ttl = ttl or self.config.default_ttl

    async def get(self, key: str) -> Optional[dict]:
        """
        Get value from cache.

        Args:
            key: Cache key

        Returns:
            Cached data as dict, or None if not found
        """
        if not self.config.enabled:
            return None

        try:
            async with get_redis() as redis:
                cached = await redis.get(key)
                if cached:
                    logger.debug(f"Cache hit: {key}")
                    return json.loads(cached)
                logger.debug(f"Cache miss: {key}")
                return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None

    async def set(self, key: str, value: dict, ttl: Optional[int] = None) -> bool:
        """
        Set value in cache.

        Args:
            key: Cache key
            value: Data to cache
            ttl: Optional TTL override

        Returns:
            True if successful, False otherwise
        """
        if not self.config.enabled:
            return False

        try:
            async with get_redis() as redis:
                cache_ttl = ttl or self.ttl
                await redis.setex(key, cache_ttl, json.dumps(value))
                logger.debug(f"Cache set: {key} (TTL: {cache_ttl}s)")
                return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """
        Delete value from cache.

        Args:
            key: Cache key

        Returns:
            True if successful, False otherwise
        """
        if not self.config.enabled:
            return False

        try:
            async with get_redis() as redis:
                deleted = await redis.delete(key)
                logger.debug(f"Cache delete: {key} (deleted: {deleted})")
                return deleted > 0
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False

    async def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching pattern.

        Args:
            pattern: Key pattern (e.g., "prefix:*")

        Returns:
            Number of keys deleted
        """
        if not self.config.enabled:
            return 0

        try:
            async with get_redis() as redis:
                keys = await redis.keys(pattern)
                if keys:
                    deleted = await redis.delete(*keys)
                    logger.debug(f"Cache delete pattern: {pattern} ({deleted} keys)")
                    return deleted
                return 0
        except Exception as e:
            logger.error(f"Cache delete pattern error for {pattern}: {e}")
            return 0

    async def incr(self, key: str, ttl: Optional[int] = None) -> int:
        """
        Increment counter in cache.

        Args:
            key: Cache key
            ttl: Optional TTL for the key

        Returns:
            New value after increment
        """
        if not self.config.enabled:
            return 0

        try:
            async with get_redis() as redis:
                value = await redis.incr(key)
                if ttl and value == 1:  # Only set TTL on first increment
                    await redis.expire(key, ttl)
                return value
        except Exception as e:
            logger.error(f"Cache incr error for key {key}: {e}")
            return 0

    async def get_int(self, key: str) -> Optional[int]:
        """
        Get integer value from cache.

        Args:
            key: Cache key

        Returns:
            Integer value or None if not found
        """
        if not self.config.enabled:
            return None

        try:
            async with get_redis() as redis:
                value = await redis.get(key)
                return int(value) if value else None
        except Exception as e:
            logger.error(f"Cache get_int error for key {key}: {e}")
            return None
