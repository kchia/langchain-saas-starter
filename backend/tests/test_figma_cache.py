"""Tests for Figma cache functionality."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import json

from src.cache.figma_cache import FigmaCache


@pytest.mark.asyncio
class TestFigmaCacheBasics:
    """Tests for basic cache operations."""

    async def test_build_cache_key(self):
        """Test cache key construction."""
        cache = FigmaCache(ttl=300)
        key = cache._build_key("abc123", "file")
        assert key == "figma:file:abc123:file"

        key_styles = cache._build_key("abc123", "styles")
        assert key_styles == "figma:file:abc123:styles"

    async def test_build_metrics_key(self):
        """Test metrics key construction."""
        cache = FigmaCache(ttl=300)
        key = cache._build_metrics_key("abc123", "hits")
        assert key == "figma:metrics:abc123:hits"

    @patch("src.core.cache.get_redis")
    async def test_set_file_success(self, mock_get_redis):
        """Test successful file caching."""
        mock_redis = AsyncMock()
        mock_redis.setex = AsyncMock(return_value=True)
        mock_get_redis.return_value.__aenter__ = AsyncMock(return_value=mock_redis)
        mock_get_redis.return_value.__aexit__ = AsyncMock()

        cache = FigmaCache(ttl=300)
        data = {"name": "Test File"}

        result = await cache.set_file("abc123", data, endpoint="file")

        assert result is True
        # Verify setex was called with correct parameters
        mock_redis.setex.assert_called_once()
        call_args = mock_redis.setex.call_args[0]
        assert call_args[0] == "figma:file:abc123:file"
        assert call_args[1] == 300
        assert json.loads(call_args[2]) == data

    @patch("src.core.cache.get_redis")
    async def test_get_file_cache_hit(self, mock_get_redis):
        """Test cache hit returns data."""
        cached_data = {"name": "Cached File"}
        mock_redis = AsyncMock()
        mock_redis.get = AsyncMock(return_value=json.dumps(cached_data))
        mock_redis.incr = AsyncMock(return_value=1)
        mock_redis.rpush = AsyncMock()
        mock_redis.ltrim = AsyncMock()
        mock_redis.expire = AsyncMock()
        mock_get_redis.return_value.__aenter__ = AsyncMock(return_value=mock_redis)
        mock_get_redis.return_value.__aexit__ = AsyncMock()

        cache = FigmaCache(ttl=300)
        result = await cache.get_file("abc123", endpoint="file")

        assert result["name"] == cached_data["name"]
        assert result["_cached"] is True
        mock_redis.get.assert_called_once_with("figma:file:abc123:file")

    @patch("src.core.cache.get_redis")
    async def test_get_file_cache_miss(self, mock_get_redis):
        """Test cache miss returns None."""
        mock_redis = AsyncMock()
        mock_redis.get = AsyncMock(return_value=None)
        mock_redis.incr = AsyncMock(return_value=1)
        mock_get_redis.return_value.__aenter__ = AsyncMock(return_value=mock_redis)
        mock_get_redis.return_value.__aexit__ = AsyncMock()

        cache = FigmaCache(ttl=300)
        result = await cache.get_file("abc123", endpoint="file")

        assert result is None


@pytest.mark.asyncio
class TestFigmaCacheInvalidation:
    """Tests for cache invalidation."""

    @patch("src.core.cache.get_redis")
    async def test_invalidate_file_success(self, mock_get_redis):
        """Test successful cache invalidation."""
        mock_redis = AsyncMock()
        # Simulate 2 cache keys being found
        mock_redis.keys = AsyncMock(return_value=[
            "figma:file:abc123:file",
            "figma:file:abc123:styles"
        ])
        mock_redis.delete = AsyncMock(return_value=2)
        mock_get_redis.return_value.__aenter__ = AsyncMock(return_value=mock_redis)
        mock_get_redis.return_value.__aexit__ = AsyncMock()

        cache = FigmaCache(ttl=300)
        deleted = await cache.invalidate_file("abc123")

        assert deleted == 2
        
        # Check that both cache and metrics patterns were queried
        metrics_calls = [call for call in mock_redis.keys.call_args_list]
        assert len(metrics_calls) == 2  # Once for cache, once for metrics
        assert "figma:file:abc123:*" in str(metrics_calls[0])
        assert "figma:metrics:abc123:*" in str(metrics_calls[1])

    @patch("src.core.cache.get_redis")
    async def test_invalidate_file_no_entries(self, mock_get_redis):
        """Test invalidation when no cache entries exist."""
        mock_redis = AsyncMock()
        mock_redis.keys = AsyncMock(return_value=[])
        mock_get_redis.return_value.__aenter__ = AsyncMock(return_value=mock_redis)
        mock_get_redis.return_value.__aexit__ = AsyncMock()

        cache = FigmaCache(ttl=300)
        deleted = await cache.invalidate_file("nonexistent")

        assert deleted == 0


@pytest.mark.asyncio
class TestFigmaCacheMetrics:
    """Tests for cache metrics tracking."""

    @patch("src.core.cache.get_redis")
    async def test_track_hit(self, mock_get_redis):
        """Test tracking cache hits."""
        mock_redis = AsyncMock()
        mock_redis.incr = AsyncMock(return_value=5)
        mock_redis.rpush = AsyncMock()
        mock_redis.ltrim = AsyncMock()
        mock_redis.expire = AsyncMock()
        mock_get_redis.return_value.__aenter__ = AsyncMock(return_value=mock_redis)
        mock_get_redis.return_value.__aexit__ = AsyncMock()

        cache = FigmaCache(ttl=300)
        await cache._track_hit("abc123", 0.095)  # 95ms

        # Verify hit counter was incremented
        mock_redis.incr.assert_called_once()
        assert "figma:metrics:abc123:hits" in str(mock_redis.incr.call_args)

        # Verify latency was tracked
        mock_redis.rpush.assert_called_once()
        mock_redis.ltrim.assert_called_once()

    @patch("src.core.cache.get_redis")
    async def test_track_miss(self, mock_get_redis):
        """Test tracking cache misses."""
        mock_redis = AsyncMock()
        mock_redis.incr = AsyncMock(return_value=3)
        mock_get_redis.return_value.__aenter__ = AsyncMock(return_value=mock_redis)
        mock_get_redis.return_value.__aexit__ = AsyncMock()

        cache = FigmaCache(ttl=300)
        await cache._track_miss("abc123")

        # Verify miss counter was incremented
        mock_redis.incr.assert_called_once()
        assert "figma:metrics:abc123:misses" in str(mock_redis.incr.call_args)

    @patch("src.core.cache.get_redis")
    async def test_get_hit_rate_with_data(self, mock_get_redis):
        """Test calculating hit rate with data."""
        mock_redis = AsyncMock()
        mock_redis.get = AsyncMock(side_effect=["10", "2"])  # 10 hits, 2 misses
        mock_redis.lrange = AsyncMock(return_value=["95", "100", "90"])  # latency samples
        mock_get_redis.return_value.__aenter__ = AsyncMock(return_value=mock_redis)
        mock_get_redis.return_value.__aexit__ = AsyncMock()

        cache = FigmaCache(ttl=300)
        metrics = await cache.get_hit_rate("abc123")

        assert metrics["file_key"] == "abc123"
        assert metrics["hits"] == 10
        assert metrics["misses"] == 2
        assert metrics["total_requests"] == 12
        assert metrics["hit_rate"] == 10 / 12
        assert metrics["avg_latency_ms"] == (95 + 100 + 90) / 3

    @patch("src.core.cache.get_redis")
    async def test_get_hit_rate_no_data(self, mock_get_redis):
        """Test calculating hit rate with no data."""
        mock_redis = AsyncMock()
        mock_redis.get = AsyncMock(return_value=None)
        mock_redis.lrange = AsyncMock(return_value=[])
        mock_get_redis.return_value.__aenter__ = AsyncMock(return_value=mock_redis)
        mock_get_redis.return_value.__aexit__ = AsyncMock()

        cache = FigmaCache(ttl=300)
        metrics = await cache.get_hit_rate("abc123")

        assert metrics["file_key"] == "abc123"
        assert metrics["hits"] == 0
        assert metrics["misses"] == 0
        assert metrics["total_requests"] == 0
        assert metrics["hit_rate"] == 0.0
        assert metrics["avg_latency_ms"] == 0.0


class TestFigmaCacheConfiguration:
    """Tests for cache configuration."""

    def test_default_ttl(self):
        """Test default TTL is 5 minutes."""
        cache = FigmaCache()
        assert cache.ttl == 300

    def test_custom_ttl(self):
        """Test custom TTL."""
        cache = FigmaCache(ttl=600)
        assert cache.ttl == 600

    def test_get_all_metrics(self):
        """Test getting aggregated metrics."""
        cache = FigmaCache(ttl=300)
        # get_all_metrics is a sync method that returns a dict
        import asyncio
        metrics = asyncio.run(cache.get_all_metrics())

        assert "cache_enabled" in metrics
        assert "ttl_seconds" in metrics
        assert metrics["ttl_seconds"] == 300
