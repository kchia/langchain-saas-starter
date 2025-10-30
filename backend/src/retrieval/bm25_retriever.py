"""BM25 lexical retriever for pattern search.

This module implements the BM25 (Best Matching 25) algorithm for
keyword-based pattern retrieval (B3) in Epic 3.

Uses the rank-bm25 library for efficient BM25 scoring with multi-field
weighting to prioritize component names over descriptions.
"""

from rank_bm25 import BM25Okapi
from typing import List, Dict, Tuple
import re


class BM25Retriever:
    """BM25-based lexical retriever for component patterns.
    
    Implements weighted multi-field search with tokenization support
    for camelCase and kebab-case identifiers.
    
    Field weights:
        - Component name: 3.0x
        - Component type/category: 2.0x
        - Props and variants: 1.5x
        - Description: 1.0x
    """
    
    def __init__(self, patterns: List[Dict]):
        """Initialize BM25 retriever with pattern corpus.
        
        Args:
            patterns: List of pattern dictionaries from pattern library
                Each pattern should have: id, name, category, description, metadata
        """
        self.patterns = patterns
        self.pattern_id_map = {p["id"]: p for p in patterns}
        
        # Create weighted corpus for BM25 indexing
        corpus = [self._create_document(p) for p in patterns]
        
        # Initialize BM25 with corpus (handle empty corpus)
        if corpus:
            tokenized_corpus = [self._tokenize(doc) for doc in corpus]
            self.bm25 = BM25Okapi(tokenized_corpus)
        else:
            # Create empty BM25 instance for empty corpus
            self.bm25 = BM25Okapi([[""]])
    
    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text with camelCase and kebab-case support.
        
        Splits on:
        - Whitespace
        - camelCase boundaries (e.g., "onClick" -> ["on", "click"])
        - kebab-case hyphens (e.g., "aria-label" -> ["aria", "label"])
        - Underscores (e.g., "is_active" -> ["is", "active"])
        
        Args:
            text: Input text string
        
        Returns:
            List of lowercase tokens
        
        Example:
            >>> _tokenize("onClick isActive aria-label")
            ['on', 'click', 'is', 'active', 'aria', 'label']
        """
        # Split camelCase: onClick -> on Click
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
        
        # Split on underscores, hyphens, and other non-alphanumeric characters
        text = re.sub(r'[_\-\s]+', ' ', text)
        
        # Split on whitespace and get words
        tokens = re.findall(r'\b\w+\b', text.lower())
        
        return tokens
    
    def _create_document(self, pattern: Dict) -> str:
        """Create weighted document string for BM25 indexing.
        
        Applies field weighting by repeating terms:
        - Name: 3x
        - Category/Type: 2x
        - Props + Variants: 1.5x (append half the list again)
        - Description: 1x
        
        Args:
            pattern: Pattern dictionary
        
        Returns:
            Space-separated weighted document string
        """
        doc_parts = []
        
        # Name (weight: 3.0x)
        name = pattern.get("name", "")
        if name:
            doc_parts.extend([name] * 3)
        
        # Category/Type (weight: 2.0x)
        category = pattern.get("category", "")
        if category:
            doc_parts.extend([category] * 2)
        
        # Props (weight: 1.5x)
        metadata = pattern.get("metadata", {})
        props = metadata.get("props", [])
        if props:
            prop_names = [p.get("name", "") for p in props if isinstance(p, dict)]
            # Add props 1.5x: full list + half the list
            doc_parts.extend(prop_names)
            doc_parts.extend(prop_names[:len(prop_names)//2])
        
        # Variants (weight: 1.5x)
        variants = metadata.get("variants", [])
        if variants:
            variant_names = [
                v.get("name", "") if isinstance(v, dict) else str(v)
                for v in variants
            ]
            # Add variants 1.5x: full list + half the list
            doc_parts.extend(variant_names)
            doc_parts.extend(variant_names[:len(variant_names)//2])
        
        # Description (weight: 1.0x)
        description = pattern.get("description", "")
        if description:
            doc_parts.append(description)
        
        return " ".join(doc_parts)
    
    def search(self, query: str, top_k: int = 10) -> List[Tuple[Dict, float]]:
        """Search patterns using BM25 keyword matching.
        
        Args:
            query: Keyword search query (can be from query_builder)
            top_k: Number of top results to return (default: 10)
        
        Returns:
            List of (pattern, score) tuples, sorted by BM25 score (descending)
            
        Example:
            >>> retriever = BM25Retriever(patterns)
            >>> results = retriever.search("button variant primary", top_k=3)
            >>> [(r[0]["name"], r[1]) for r in results]
            [('Button', 0.95), ('IconButton', 0.42), ('Card', 0.12)]
        """
        # Tokenize query
        query_tokens = self._tokenize(query)
        
        # Get BM25 scores
        scores = self.bm25.get_scores(query_tokens)
        
        # Create (pattern, score) tuples
        results = list(zip(self.patterns, scores))
        
        # Sort by score (descending)
        results = sorted(results, key=lambda x: x[1], reverse=True)
        
        # Return top-k
        return results[:top_k]
    
    def search_with_explanation(
        self,
        query: str,
        top_k: int = 10
    ) -> List[Dict]:
        """Search with detailed scoring breakdown.
        
        Returns results with BM25 score and matched terms for debugging.
        
        Args:
            query: Keyword search query
            top_k: Number of top results to return
        
        Returns:
            List of dicts with pattern, score, and matched_terms
        """
        query_tokens = self._tokenize(query)
        results = self.search(query, top_k)
        
        detailed_results = []
        for pattern, score in results:
            # Find which query terms matched in this pattern
            pattern_doc = self._create_document(pattern)
            pattern_tokens = set(self._tokenize(pattern_doc))
            matched_terms = [t for t in query_tokens if t in pattern_tokens]
            
            detailed_results.append({
                "pattern": pattern,
                "score": round(score, 3),
                "matched_terms": matched_terms,
                "match_count": len(matched_terms)
            })
        
        return detailed_results
