"""Semantic retriever for pattern search using vector embeddings.

This module implements semantic search (B4) for Epic 3 using:
- OpenAI text-embedding-3-small for generating query embeddings
- Qdrant for vector similarity search
- Cosine similarity for ranking
"""

from typing import List, Dict, Tuple, Optional
from openai import AsyncOpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, Filter, FieldCondition, MatchValue
from tenacity import retry, stop_after_attempt, wait_exponential
import asyncio
import logging

logger = logging.getLogger(__name__)


class SemanticRetriever:
    """Semantic search retriever using vector embeddings and Qdrant.
    
    Uses OpenAI text-embedding-3-small (1536 dimensions) for embedding
    generation and Qdrant for fast vector similarity search.
    """
    
    def __init__(
        self,
        qdrant_client: QdrantClient,
        openai_client: AsyncOpenAI,
        collection_name: str = "patterns",
        embedding_model: str = "text-embedding-3-small"
    ):
        """Initialize semantic retriever.
        
        Args:
            qdrant_client: Initialized Qdrant client
            openai_client: Initialized async OpenAI client
            collection_name: Name of Qdrant collection (default: "patterns")
            embedding_model: OpenAI embedding model (default: "text-embedding-3-small")
        """
        self.qdrant = qdrant_client
        self.openai = openai_client
        self.collection_name = collection_name
        self.embedding_model = embedding_model
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def _create_embedding(self, text: str) -> List[float]:
        """Generate embedding for query text using OpenAI.
        
        Implements retry logic with exponential backoff for transient failures.
        
        Args:
            text: Input text to embed (natural language query)
        
        Returns:
            List of 1536 floats (embedding vector)
        
        Raises:
            Exception: If OpenAI API call fails after retries
        """
        try:
            response = await self.openai.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Failed to create embedding for '{text[:50]}...': {e}")
            raise
    
    async def search(
        self,
        query: str,
        top_k: int = 10,
        filters: Optional[Dict] = None
    ) -> List[Tuple[Dict, float]]:
        """Semantic search using vector similarity.
        
        Args:
            query: Natural language query (e.g., from query_builder)
            top_k: Number of top results to return (default: 10)
            filters: Optional Qdrant filters (e.g., {"type": "button"})
        
        Returns:
            List of (pattern, score) tuples, sorted by similarity (descending)
            Similarity scores are in range [0, 1] due to cosine similarity
        
        Raises:
            ValueError: If Qdrant collection doesn't exist
        
        Example:
            >>> retriever = SemanticRetriever(qdrant, openai)
            >>> query = "A Button component with variant and size props"
            >>> results = await retriever.search(query, top_k=3)
            >>> [(r[0]["name"], r[1]) for r in results]
            [('Button', 0.89), ('IconButton', 0.72), ('Link', 0.45)]
        """
        # Verify collection exists before searching
        try:
            collection_info = self.get_collection_info()
            if not collection_info:
                raise ValueError(
                    f"Qdrant collection '{self.collection_name}' not found. "
                    "Run seed_patterns.py to initialize the vector database."
                )
        except Exception as e:
            logger.error(f"Qdrant collection check failed: {e}")
            raise ValueError(
                f"Vector database unavailable. Ensure Qdrant is running and "
                f"patterns are seeded. Error: {str(e)}"
            )
        
        # Generate query embedding
        logger.info(f"Generating embedding for query: {query[:100]}...")
        query_vector = await self._create_embedding(query)
        
        # Build Qdrant filter if provided
        qdrant_filter = None
        if filters:
            qdrant_filter = self._build_qdrant_filter(filters)
        
        # Search Qdrant
        logger.info(f"Searching Qdrant collection '{self.collection_name}' with top_k={top_k}")
        search_results = self.qdrant.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=top_k,
            query_filter=qdrant_filter
        )
        
        # Format results as (pattern, score) tuples
        results = []
        for hit in search_results:
            pattern = hit.payload
            score = hit.score
            results.append((pattern, score))
        
        logger.info(f"Found {len(results)} results")
        return results
    
    def _build_qdrant_filter(self, filters: Dict) -> Filter:
        """Build Qdrant filter from filter dictionary.
        
        Args:
            filters: Dictionary of field: value pairs
                Example: {"type": "button", "category": "form"}
        
        Returns:
            Qdrant Filter object
        """
        conditions = []
        
        for field, value in filters.items():
            conditions.append(
                FieldCondition(
                    key=field,
                    match=MatchValue(value=value)
                )
            )
        
        if len(conditions) == 1:
            return Filter(must=[conditions[0]])
        elif len(conditions) > 1:
            return Filter(must=conditions)
        else:
            return None
    
    async def search_batch(
        self,
        queries: List[str],
        top_k: int = 10
    ) -> List[List[Tuple[Dict, float]]]:
        """Search multiple queries in batch.
        
        Useful for evaluation or comparing multiple requirement variations.
        
        Args:
            queries: List of natural language queries
            top_k: Number of results per query
        
        Returns:
            List of result lists (one per query)
        """
        tasks = [self.search(q, top_k) for q in queries]
        return await asyncio.gather(*tasks)
    
    async def search_with_explanation(
        self,
        query: str,
        top_k: int = 10,
        filters: Optional[Dict] = None
    ) -> List[Dict]:
        """Search with detailed result information.
        
        Returns results with additional metadata for debugging and explainability.
        
        Args:
            query: Natural language query
            top_k: Number of top results
            filters: Optional filters
        
        Returns:
            List of dicts with pattern, score, and metadata
        """
        results = await self.search(query, top_k, filters)
        
        detailed_results = []
        for pattern, score in results:
            detailed_results.append({
                "pattern": pattern,
                "score": round(score, 3),
                "similarity_percent": round(score * 100, 1),
                "pattern_id": pattern.get("id"),
                "pattern_name": pattern.get("name"),
                "pattern_category": pattern.get("category")
            })
        
        return detailed_results
    
    def get_collection_info(self) -> Dict:
        """Get information about the Qdrant collection.
        
        Returns:
            Dictionary with collection stats (count, vector size, etc.)
        """
        try:
            collection = self.qdrant.get_collection(self.collection_name)
            return {
                "name": self.collection_name,
                "vectors_count": collection.vectors_count,
                "points_count": collection.points_count,
                "status": collection.status,
                "config": {
                    "vector_size": collection.config.params.vectors.size,
                    "distance": collection.config.params.vectors.distance
                }
            }
        except Exception as e:
            logger.error(f"Failed to get collection info: {e}")
            return {}
