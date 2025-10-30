"""Tests for semantic retriever module (B4).

Tests the semantic search using vector embeddings with mocked
OpenAI and Qdrant clients.
"""

import pytest
from unittest.mock import Mock, AsyncMock, MagicMock
from src.retrieval.semantic_retriever import SemanticRetriever
from qdrant_client.models import ScoredPoint, Filter


class TestSemanticRetriever:
    """Test suite for SemanticRetriever class."""
    
    @pytest.fixture
    def mock_qdrant_client(self):
        """Create mock Qdrant client."""
        return Mock()
    
    @pytest.fixture
    def mock_openai_client(self):
        """Create mock async OpenAI client."""
        client = Mock()
        client.embeddings = Mock()
        return client
    
    @pytest.fixture
    def retriever(self, mock_qdrant_client, mock_openai_client):
        """Create SemanticRetriever with mocked dependencies."""
        return SemanticRetriever(
            qdrant_client=mock_qdrant_client,
            openai_client=mock_openai_client,
            collection_name="test_patterns"
        )
    
    @pytest.fixture
    def sample_embedding(self):
        """Create sample embedding vector (1536 dims)."""
        return [0.1] * 1536
    
    @pytest.fixture
    def sample_qdrant_results(self):
        """Create sample Qdrant search results."""
        return [
            ScoredPoint(
                id="1",
                score=0.89,
                payload={
                    "id": "shadcn-button",
                    "name": "Button",
                    "category": "form",
                    "description": "A button component"
                },
                version=1,
                vector=None
            ),
            ScoredPoint(
                id="2",
                score=0.72,
                payload={
                    "id": "shadcn-card",
                    "name": "Card",
                    "category": "layout",
                    "description": "A card container"
                },
                version=1,
                vector=None
            )
        ]
    
    @pytest.mark.asyncio
    async def test_create_embedding(self, retriever, sample_embedding):
        """Test embedding creation calls OpenAI correctly."""
        # Mock OpenAI response
        mock_response = Mock()
        mock_response.data = [Mock(embedding=sample_embedding)]
        retriever.openai.embeddings.create = AsyncMock(return_value=mock_response)
        
        # Call _create_embedding
        result = await retriever._create_embedding("test query")
        
        # Verify OpenAI was called correctly
        retriever.openai.embeddings.create.assert_called_once()
        call_kwargs = retriever.openai.embeddings.create.call_args.kwargs
        assert call_kwargs["model"] == "text-embedding-3-small"
        assert call_kwargs["input"] == "test query"
        
        # Verify embedding returned
        assert result == sample_embedding
        assert len(result) == 1536
    
    @pytest.mark.asyncio
    async def test_create_embedding_error(self, retriever):
        """Test embedding creation handles errors."""
        # Mock OpenAI to raise error
        retriever.openai.embeddings.create = AsyncMock(
            side_effect=Exception("API Error")
        )
        
        # Should raise exception
        with pytest.raises(Exception, match="API Error"):
            await retriever._create_embedding("test")
    
    @pytest.mark.asyncio
    async def test_search_basic(
        self,
        retriever,
        sample_embedding,
        sample_qdrant_results
    ):
        """Test basic semantic search."""
        # Mock OpenAI embedding
        mock_response = Mock()
        mock_response.data = [Mock(embedding=sample_embedding)]
        retriever.openai.embeddings.create = AsyncMock(return_value=mock_response)
        
        # Mock Qdrant search
        retriever.qdrant.search = Mock(return_value=sample_qdrant_results)
        
        # Mock collection info check
        retriever.get_collection_info = Mock(return_value={"name": "test_patterns"})
        
        # Perform search
        results = await retriever.search("Button component", top_k=5)
        
        # Verify results structure
        assert len(results) == 2
        assert all(isinstance(r, tuple) for r in results)
        assert all(len(r) == 2 for r in results)
        
        # Verify first result
        pattern, score = results[0]
        assert pattern["name"] == "Button"
        assert score == 0.89
        
        # Verify Qdrant was called correctly
        retriever.qdrant.search.assert_called_once()
        call_kwargs = retriever.qdrant.search.call_args.kwargs
        assert call_kwargs["collection_name"] == "test_patterns"
        assert call_kwargs["query_vector"] == sample_embedding
        assert call_kwargs["limit"] == 5
    
    @pytest.mark.asyncio
    async def test_search_with_filters(
        self,
        retriever,
        sample_embedding,
        sample_qdrant_results
    ):
        """Test search with Qdrant filters."""
        # Mock dependencies
        mock_response = Mock()
        mock_response.data = [Mock(embedding=sample_embedding)]
        retriever.openai.embeddings.create = AsyncMock(return_value=mock_response)
        retriever.qdrant.search = Mock(return_value=sample_qdrant_results)
        retriever.get_collection_info = Mock(return_value={"name": "test_patterns"})
        
        # Search with filters
        filters = {"type": "button"}
        results = await retriever.search("Button", top_k=3, filters=filters)
        
        # Verify filter was passed
        call_kwargs = retriever.qdrant.search.call_args.kwargs
        assert call_kwargs["query_filter"] is not None
    
    def test_build_qdrant_filter_single(self, retriever):
        """Test building Qdrant filter with single condition."""
        filters = {"type": "button"}
        qdrant_filter = retriever._build_qdrant_filter(filters)
        
        assert qdrant_filter is not None
        assert len(qdrant_filter.must) == 1
    
    def test_build_qdrant_filter_multiple(self, retriever):
        """Test building Qdrant filter with multiple conditions."""
        filters = {"type": "button", "category": "form"}
        qdrant_filter = retriever._build_qdrant_filter(filters)
        
        assert qdrant_filter is not None
        assert len(qdrant_filter.must) == 2
    
    def test_build_qdrant_filter_empty(self, retriever):
        """Test building Qdrant filter with empty dict."""
        filters = {}
        qdrant_filter = retriever._build_qdrant_filter(filters)
        
        assert qdrant_filter is None
    
    @pytest.mark.asyncio
    async def test_search_top_k_limit(
        self,
        retriever,
        sample_embedding,
        sample_qdrant_results
    ):
        """Test top_k parameter limits results."""
        # Mock dependencies
        mock_response = Mock()
        mock_response.data = [Mock(embedding=sample_embedding)]
        retriever.openai.embeddings.create = AsyncMock(return_value=mock_response)
        retriever.qdrant.search = Mock(return_value=sample_qdrant_results[:1])
        retriever.get_collection_info = Mock(return_value={"name": "test_patterns"})
        
        # Search with top_k=1
        results = await retriever.search("test", top_k=1)
        
        # Should return 1 result
        assert len(results) == 1
        
        # Verify Qdrant limit was set correctly
        call_kwargs = retriever.qdrant.search.call_args.kwargs
        assert call_kwargs["limit"] == 1
    
    @pytest.mark.asyncio
    async def test_search_empty_results(self, retriever, sample_embedding):
        """Test search with no matching results."""
        # Mock dependencies
        mock_response = Mock()
        mock_response.data = [Mock(embedding=sample_embedding)]
        retriever.openai.embeddings.create = AsyncMock(return_value=mock_response)
        retriever.qdrant.search = Mock(return_value=[])
        retriever.get_collection_info = Mock(return_value={"name": "test_patterns"})
        
        # Search
        results = await retriever.search("nonexistent", top_k=5)
        
        # Should return empty list
        assert results == []
    
    @pytest.mark.asyncio
    async def test_search_batch(self, retriever, sample_embedding, sample_qdrant_results):
        """Test batch search with multiple queries."""
        # Mock dependencies
        mock_response = Mock()
        mock_response.data = [Mock(embedding=sample_embedding)]
        retriever.openai.embeddings.create = AsyncMock(return_value=mock_response)
        retriever.qdrant.search = Mock(return_value=sample_qdrant_results)
        retriever.get_collection_info = Mock(return_value={"name": "test_patterns"})
        
        # Batch search
        queries = ["Button component", "Card component"]
        results = await retriever.search_batch(queries, top_k=3)
        
        # Should return list of result lists
        assert len(results) == 2
        assert all(isinstance(r, list) for r in results)
        
        # OpenAI should be called twice (once per query)
        assert retriever.openai.embeddings.create.call_count == 2
    
    @pytest.mark.asyncio
    async def test_search_with_explanation(
        self,
        retriever,
        sample_embedding,
        sample_qdrant_results
    ):
        """Test search with explanation returns detailed info."""
        # Mock dependencies
        mock_response = Mock()
        mock_response.data = [Mock(embedding=sample_embedding)]
        retriever.openai.embeddings.create = AsyncMock(return_value=mock_response)
        retriever.qdrant.search = Mock(return_value=sample_qdrant_results)
        retriever.get_collection_info = Mock(return_value={"name": "test_patterns"})
        
        # Search with explanation
        results = await retriever.search_with_explanation("Button", top_k=5)
        
        # Verify structure
        assert len(results) == 2
        assert all("pattern" in r for r in results)
        assert all("score" in r for r in results)
        assert all("similarity_percent" in r for r in results)
        assert all("pattern_id" in r for r in results)
        assert all("pattern_name" in r for r in results)
        
        # Verify first result details
        assert results[0]["pattern_id"] == "shadcn-button"
        assert results[0]["pattern_name"] == "Button"
        assert results[0]["score"] == 0.89
        assert results[0]["similarity_percent"] == 89.0
    
    def test_get_collection_info(self, retriever):
        """Test getting collection information."""
        # Mock collection info
        mock_collection = Mock()
        mock_collection.vectors_count = 10
        mock_collection.points_count = 10
        mock_collection.status = "green"
        mock_collection.config.params.vectors.size = 1536
        mock_collection.config.params.vectors.distance = "Cosine"
        
        retriever.qdrant.get_collection = Mock(return_value=mock_collection)
        
        # Get info
        info = retriever.get_collection_info()
        
        # Verify structure
        assert info["name"] == "test_patterns"
        assert info["vectors_count"] == 10
        assert info["points_count"] == 10
        assert info["status"] == "green"
        assert info["config"]["vector_size"] == 1536
        assert info["config"]["distance"] == "Cosine"
    
    def test_get_collection_info_error(self, retriever):
        """Test get_collection_info handles errors gracefully."""
        retriever.qdrant.get_collection = Mock(
            side_effect=Exception("Collection not found")
        )
        
        # Should return empty dict
        info = retriever.get_collection_info()
        assert info == {}
    
    @pytest.mark.asyncio
    async def test_similarity_scores_range(
        self,
        retriever,
        sample_embedding,
        sample_qdrant_results
    ):
        """Test similarity scores are in valid range [0, 1]."""
        # Mock dependencies
        mock_response = Mock()
        mock_response.data = [Mock(embedding=sample_embedding)]
        retriever.openai.embeddings.create = AsyncMock(return_value=mock_response)
        retriever.qdrant.search = Mock(return_value=sample_qdrant_results)
        
        # Search
        results = await retriever.search("test", top_k=5)
        
        # Verify all scores in range
        for _, score in results:
            assert 0 <= score <= 1
    
    @pytest.mark.asyncio
    async def test_results_sorted_by_score(
        self,
        retriever,
        sample_embedding,
        sample_qdrant_results
    ):
        """Test results are sorted by similarity score descending."""
        # Mock dependencies
        mock_response = Mock()
        mock_response.data = [Mock(embedding=sample_embedding)]
        retriever.openai.embeddings.create = AsyncMock(return_value=mock_response)
        retriever.qdrant.search = Mock(return_value=sample_qdrant_results)
        retriever.get_collection_info = Mock(return_value={"name": "test_patterns"})
        
        # Search
        results = await retriever.search("test", top_k=5)
        
        # Scores should be descending
        scores = [score for _, score in results]
        assert scores == sorted(scores, reverse=True)
    
    @pytest.mark.asyncio
    async def test_search_collection_not_found(self, retriever, sample_embedding):
        """Test search raises error when collection doesn't exist."""
        # Mock OpenAI embedding
        mock_response = Mock()
        mock_response.data = [Mock(embedding=sample_embedding)]
        retriever.openai.embeddings.create = AsyncMock(return_value=mock_response)
        
        # Mock collection info to return empty dict (collection not found)
        retriever.get_collection_info = Mock(return_value={})
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="collection.*not found"):
            await retriever.search("test", top_k=5)
    
    @pytest.mark.asyncio
    async def test_search_collection_check_failure(self, retriever, sample_embedding):
        """Test search handles collection check failures."""
        # Mock OpenAI embedding
        mock_response = Mock()
        mock_response.data = [Mock(embedding=sample_embedding)]
        retriever.openai.embeddings.create = AsyncMock(return_value=mock_response)
        
        # Mock collection info to raise exception
        retriever.get_collection_info = Mock(side_effect=Exception("Qdrant connection failed"))
        
        # Should raise ValueError with helpful message
        with pytest.raises(ValueError, match="Vector database unavailable"):
            await retriever.search("test", top_k=5)
