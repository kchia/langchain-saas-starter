"""Query builder for transforming requirements into retrieval queries.

This module implements the query construction service (B8) for Epic 3.
It transforms requirements JSON from Epic 2 into optimized queries for:
- BM25 lexical search (keyword-based)
- Semantic vector search (natural language)
- Qdrant filters
"""

from typing import Dict, List, Optional


class QueryBuilder:
    """Transforms requirements into retrieval queries for BM25 and semantic search."""
    
    def build_from_requirements(self, requirements: Dict) -> Dict:
        """Transform requirements.json into retrieval queries.
        
        Args:
            requirements: Dictionary containing component requirements from Epic 2
                Expected keys: component_type, props, variants, states, a11y
        
        Returns:
            Dictionary containing:
                - bm25_query: Weighted keyword query string
                - semantic_query: Natural language query string
                - filters: Qdrant filter conditions
        
        Example:
            >>> builder = QueryBuilder()
            >>> reqs = {
            ...     "component_type": "Button",
            ...     "props": ["variant", "size"],
            ...     "variants": ["primary", "secondary"]
            ... }
            >>> queries = builder.build_from_requirements(reqs)
            >>> queries["bm25_query"]
            'button button button variant size primary secondary'
        """
        return {
            "bm25_query": self._build_bm25_query(requirements),
            "semantic_query": self._build_semantic_query(requirements),
            "filters": self._build_filters(requirements)
        }
    
    def _build_bm25_query(self, req: Dict) -> str:
        """Build weighted keyword query for BM25 lexical search.
        
        This creates a space-separated keyword string with term repetition
        to simulate field weighting:
        - Component type: weight 3x (repeated 3 times)
        - Props: weight 1x
        - Variants: weight 1x
        - States: weight 1x
        
        Args:
            req: Requirements dictionary
        
        Returns:
            Space-separated keyword string
        
        Example:
            "button button button variant size primary secondary ghost disabled"
        """
        parts: List[str] = []
        
        # Component type (highest weight - 3x)
        component_type = req.get("component_type", "")
        if component_type:
            parts.extend([component_type.lower()] * 3)
        
        # Props (medium weight - 1x)
        props = req.get("props", [])
        if props:
            # Handle both list of strings and list of dicts with 'name' key
            prop_names = []
            for prop in props:
                if isinstance(prop, str):
                    prop_names.append(prop.lower())
                elif isinstance(prop, dict) and "name" in prop:
                    prop_names.append(prop["name"].lower())
            parts.extend(prop_names)
        
        # Variants (medium weight - 1x)
        variants = req.get("variants", [])
        if variants:
            parts.extend([v.lower() for v in variants])
        
        # States (medium weight - 1x)
        states = req.get("states", [])
        if states:
            parts.extend([s.lower() for s in states])
        
        return " ".join(parts)
    
    def _build_semantic_query(self, req: Dict) -> str:
        """Build natural language query for semantic vector search.
        
        Creates a grammatically correct sentence describing the component
        requirements in natural language for better semantic matching.
        
        Args:
            req: Requirements dictionary
        
        Returns:
            Natural language query string
        
        Example:
            "A Button component with variant, size and disabled props, 
            supporting primary, secondary, and ghost variants, 
            with accessibility features: aria-label, keyboard navigation."
        """
        component_type = req.get("component_type", "component")
        props = req.get("props", [])
        variants = req.get("variants", [])
        a11y = req.get("a11y", [])
        
        query_parts = [f"A {component_type} component"]
        
        # Add props description
        if props:
            # Extract prop names if list of dicts
            prop_names = []
            for prop in props:
                if isinstance(prop, str):
                    prop_names.append(prop)
                elif isinstance(prop, dict) and "name" in prop:
                    prop_names.append(prop["name"])
            
            if prop_names:
                if len(prop_names) == 1:
                    props_text = prop_names[0]
                else:
                    props_text = ", ".join(prop_names[:-1]) + f" and {prop_names[-1]}"
                query_parts.append(f"with {props_text} props")
        
        # Add variants description
        if variants:
            variants_text = ", ".join(variants)
            query_parts.append(f"supporting {variants_text} variants")
        
        # Add accessibility features
        if a11y:
            a11y_text = ", ".join(a11y)
            query_parts.append(f"with accessibility features: {a11y_text}")
        
        return ", ".join(query_parts) + "."
    
    def _build_filters(self, req: Dict) -> Dict:
        """Build Qdrant filter conditions based on requirements.
        
        Constructs filter dictionary for Qdrant vector search to narrow
        down results based on component type or other metadata.
        
        Args:
            req: Requirements dictionary
        
        Returns:
            Dictionary of filter conditions for Qdrant
        
        Example:
            {"type": "button"}
        """
        filters = {}
        
        # Add component type filter if present
        component_type = req.get("component_type", "")
        if component_type:
            filters["type"] = component_type.lower()
        
        return filters
