"""HybridRetriever for ComponentForge evaluation notebooks.

This module provides a unified hybrid retriever that combines BM25 and semantic search
for pattern retrieval. It automatically falls back to mock mode when services are unavailable,
making it suitable for demonstration and testing scenarios.

Usage:
    from utils.hybrid_retriever import HybridRetriever

    # Initialize with patterns
    retriever = HybridRetriever(patterns=pattern_list, use_mock=False)

    # Retrieve patterns
    results = retriever.retrieve("button with primary variant", k=5)
"""

import os
import sys
import asyncio
from typing import List, Dict
from pathlib import Path
import importlib.util

# Try to import real modules first
try:
    # Import third-party dependencies
    from qdrant_client import QdrantClient
    from openai import AsyncOpenAI

    # Import retrieval modules with temporary types directory rename to avoid conflicts
    backend_src = Path(__file__).parent.parent.parent / 'backend' / 'src'
    types_dir = backend_src / 'types'
    types_backup = backend_src / '_types_temp'

    types_renamed = False
    try:
        # Temporarily rename types directory to avoid conflict with Python's built-in types
        if types_dir.exists() and not types_backup.exists():
            types_dir.rename(types_backup)
            types_renamed = True

        # Add backend/src to path
        sys.path.insert(0, str(backend_src))

        # Import modules
        from retrieval.bm25_retriever import BM25Retriever
        from retrieval.semantic_retriever import SemanticRetriever
        from retrieval.weighted_fusion import WeightedFusion

        print("✅ Retrieval modules imported successfully")
        RETRIEVAL_AVAILABLE = True

    finally:
        # Clean up: remove from path and restore types directory
        if str(backend_src) in sys.path:
            sys.path.remove(str(backend_src))
        if types_renamed and types_backup.exists():
            types_backup.rename(types_dir)

except Exception as e:
    print(f"⚠️  Import error: {e}")
    print("   Will use mock implementations for demonstration")
    RETRIEVAL_AVAILABLE = False
    # Ensure cleanup
    try:
        backend_src = Path(__file__).parent.parent.parent / 'backend' / 'src'
        types_backup = backend_src / '_types_temp'
        types_dir = backend_src / 'types'
        if types_backup.exists() and not types_dir.exists():
            types_backup.rename(types_dir)
    except:
        pass


class HybridRetriever:
    """Unified hybrid retriever combining BM25 and semantic search.

    Wraps BM25Retriever, SemanticRetriever, and WeightedFusion for
    convenient pattern retrieval with automatic fallback to mock mode.
    """

    def __init__(self, patterns: List[Dict] = None, use_mock: bool = False):
        """Initialize hybrid retriever.

        Args:
            patterns: List of pattern dictionaries
            use_mock: Force mock mode even if services are available
        """
        self.patterns = patterns or []
        self.use_mock = use_mock or not RETRIEVAL_AVAILABLE

        if self.use_mock:
            print("ℹ️  Running in MOCK mode - retrieval will return simulated results")
            self.bm25 = None
            self.semantic = None
            self.fusion = None
        else:
            try:
                # Initialize BM25 retriever
                self.bm25 = BM25Retriever(self.patterns)

                # Initialize semantic retriever (requires Qdrant and OpenAI)
                qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
                openai_key = os.getenv("OPENAI_API_KEY")

                if not openai_key:
                    print("⚠️  OPENAI_API_KEY not found, falling back to BM25-only mode")
                    self.semantic = None
                    self.fusion = None
                    print("✅ BM25 retriever initialized (keyword search only)")
                    return

                try:
                    qdrant_client = QdrantClient(url=qdrant_url)
                    openai_client = AsyncOpenAI(api_key=openai_key)
                    self.semantic = SemanticRetriever(
                        qdrant_client=qdrant_client,
                        openai_client=openai_client,
                        collection_name="patterns"
                    )

                    # Initialize weighted fusion combiner
                    self.fusion = WeightedFusion(
                        bm25_weight=0.3,
                        semantic_weight=0.7
                    )

                    print("✅ Hybrid retriever initialized (BM25 + Semantic)")

                except Exception as e:
                    print(f"⚠️  Failed to connect to Qdrant: {e}")
                    print("   Falling back to BM25-only mode")
                    self.semantic = None
                    self.fusion = None

            except Exception as e:
                print(f"⚠️  Retriever initialization error: {e}")
                print("   Falling back to mock mode")
                self.use_mock = True
                self.bm25 = None
                self.semantic = None
                self.fusion = None

    def retrieve(self, query: str, k: int = 5) -> List[Dict]:
        """Retrieve top-k patterns for query.

        Args:
            query: Search query string
            k: Number of results to return (default: 5)

        Returns:
            List of dictionaries with 'id' and 'score' keys
        """
        if self.use_mock:
            return self._mock_retrieve(query, k)

        try:
            # Get BM25 results (returns List[Tuple[Dict, float]])
            bm25_results = self.bm25.search(query, top_k=k)

            # If semantic search is available, use hybrid
            if self.semantic and self.fusion:
                # Get semantic results (async) - handle Jupyter's event loop
                try:
                    # Check if we're in a Jupyter/IPython environment with existing event loop
                    try:
                        loop = asyncio.get_running_loop()
                        # We're in Jupyter - use nest_asyncio or create task
                        import nest_asyncio
                        nest_asyncio.apply()
                        semantic_results = asyncio.run(
                            self.semantic.search(query, top_k=k)
                        )
                    except RuntimeError:
                        # No running loop - safe to use asyncio.run()
                        semantic_results = asyncio.run(
                            self.semantic.search(query, top_k=k)
                        )

                    # Fuse results - use top_k parameter (not k)
                    fused_results = self.fusion.fuse(
                        bm25_results=bm25_results,
                        semantic_results=semantic_results,
                        top_k=k
                    )

                    return [
                        {'id': pattern['id'], 'score': score}
                        for pattern, score in fused_results
                    ]

                except ImportError:
                    print(f"⚠️  nest_asyncio not available, using BM25 only")
                    return [
                        {'id': pattern['id'], 'score': score}
                        for pattern, score in bm25_results[:k]
                    ]
                except Exception as e:
                    print(f"⚠️  Semantic search failed: {e}, using BM25 only")
                    return [
                        {'id': pattern['id'], 'score': score}
                        for pattern, score in bm25_results[:k]
                    ]
            else:
                # BM25 only
                return [
                    {'id': pattern['id'], 'score': score}
                    for pattern, score in bm25_results[:k]
                ]

        except Exception as e:
            print(f"⚠️  Retrieval error: {e}, falling back to mock")
            return self._mock_retrieve(query, k)

    def _mock_retrieve(self, query: str, k: int = 5) -> List[Dict]:
        """Mock retrieval for demonstration purposes.

        Returns patterns with simulated scores based on simple keyword matching.
        """
        # Simple keyword matching for mock
        query_lower = query.lower()
        results = []

        for pattern in self.patterns:
            name = pattern.get('name', '').lower()
            category = pattern.get('category', '').lower()
            desc = pattern.get('description', '').lower()

            # Simple scoring: exact name match > partial name match > category > description
            if name == query_lower:
                score = 1.0
            elif query_lower in name:
                score = 0.9
            elif query_lower in category:
                score = 0.7
            elif query_lower in desc:
                score = 0.5
            else:
                # Check for semantic similarity (very simple)
                keywords = {
                    'button': ['clickable', 'action', 'submit', 'click'],
                    'card': ['container', 'section', 'panel', 'box'],
                    'input': ['text', 'entry', 'field', 'form'],
                    'badge': ['label', 'tag', 'indicator', 'status'],
                    'alert': ['notification', 'message', 'banner', 'warning']
                }

                score = 0.0
                for component, synonyms in keywords.items():
                    if component in name:
                        if any(syn in query_lower for syn in synonyms):
                            score = 0.6
                            break

            if score > 0:
                results.append({
                    'id': pattern['id'],
                    'score': score,
                    'name': pattern.get('name')
                })

        # Sort by score and return top k
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:k]
