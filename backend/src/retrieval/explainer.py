"""Explainability and confidence scoring for retrieval results.

This module implements explainability (B6) for Epic 3.
Generates human-readable explanations and confidence scores
for pattern matches.
"""

from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class RetrievalExplainer:
    """Generates explanations and confidence scores for retrieval results.
    
    Analyzes pattern matches to provide:
    - Human-readable explanations
    - Confidence scores (0-1)
    - Match highlights (matching props, variants, a11y features)
    - Ranking details (BM25 rank, semantic rank, final rank)
    """
    
    def explain(
        self,
        pattern: Dict,
        requirements: Dict,
        bm25_score: float,
        bm25_rank: int,
        semantic_score: float,
        semantic_rank: int,
        final_score: float,
        final_rank: int
    ) -> Dict:
        """Generate comprehensive explanation for a pattern match.
        
        Args:
            pattern: Pattern dictionary with metadata
            requirements: Original requirements from Epic 2
            bm25_score: Normalized BM25 score (0-1)
            bm25_rank: Rank in BM25 results (1-indexed)
            semantic_score: Normalized semantic score (0-1)
            semantic_rank: Rank in semantic results (1-indexed)
            final_score: Final weighted combined score (0-1)
            final_rank: Final rank in combined results (1-indexed)
        
        Returns:
            Dictionary with:
                - pattern_id: Pattern identifier
                - confidence: Confidence score (0-1)
                - explanation: Human-readable explanation text
                - match_highlights: Matching features breakdown
                - ranking_details: Score and rank information
        
        Example:
            >>> explainer = RetrievalExplainer()
            >>> result = explainer.explain(button_pattern, requirements, ...)
            >>> result["confidence"]
            0.92
            >>> result["explanation"]
            "Matches 'button' type with 'variant' and 'size' props..."
        """
        # Find matching features
        match_highlights = self._find_matches(pattern, requirements)
        
        # Compute confidence score
        confidence = self._compute_confidence(
            final_score, bm25_rank, semantic_rank, pattern, match_highlights
        )
        
        # Generate explanation text
        explanation = self._generate_explanation(
            pattern, requirements, match_highlights, bm25_score, semantic_score
        )
        
        return {
            "pattern_id": pattern.get("id"),
            "confidence": round(confidence, 2),
            "explanation": explanation,
            "match_highlights": match_highlights,
            "ranking_details": {
                "bm25_score": round(bm25_score, 2),
                "bm25_rank": bm25_rank,
                "semantic_score": round(semantic_score, 2),
                "semantic_rank": semantic_rank,
                "final_score": round(final_score, 2),
                "final_rank": final_rank
            }
        }
    
    def _find_matches(self, pattern: Dict, requirements: Dict) -> Dict:
        """Identify matching props, variants, and a11y features.
        
        Args:
            pattern: Pattern with metadata
            requirements: Requirements to match against
        
        Returns:
            Dictionary with matched_props, matched_variants, matched_a11y
        """
        metadata = pattern.get("metadata", {})
        
        # Get pattern features
        pattern_props = {
            p.get("name", "").lower()
            for p in metadata.get("props", [])
            if isinstance(p, dict)
        }
        
        pattern_variants = {
            v.get("name", "").lower() if isinstance(v, dict) else str(v).lower()
            for v in metadata.get("variants", [])
        }
        
        pattern_a11y = set()
        a11y_info = metadata.get("a11y", {})
        if isinstance(a11y_info, dict):
            # Extract from features list
            features = a11y_info.get("features", [])
            pattern_a11y = {f.lower() for f in features if isinstance(f, str)}
        
        # Get requirement features
        req_props = set()
        for prop in requirements.get("props", []):
            if isinstance(prop, str):
                req_props.add(prop.lower())
            elif isinstance(prop, dict) and "name" in prop:
                req_props.add(prop["name"].lower())
        
        req_variants = {v.lower() for v in requirements.get("variants", [])}
        req_a11y = {a.lower() for a in requirements.get("a11y", [])}
        
        # Find matches
        matched_props = list(pattern_props & req_props)
        matched_variants = list(pattern_variants & req_variants)
        
        # For a11y, use fuzzy matching (contains)
        matched_a11y = []
        for req_feature in req_a11y:
            for pattern_feature in pattern_a11y:
                if req_feature in pattern_feature or pattern_feature in req_feature:
                    matched_a11y.append(req_feature)
                    break
        
        return {
            "matched_props": matched_props,
            "matched_variants": matched_variants,
            "matched_a11y": matched_a11y
        }
    
    def _compute_confidence(
        self,
        final_score: float,
        bm25_rank: Optional[int],
        semantic_rank: Optional[int],
        pattern: Dict,
        match_highlights: Dict
    ) -> float:
        """Compute confidence score (0-1) for the match.
        
        Confidence is based on:
        - Final ranking score (40% weight)
        - Agreement between BM25 and semantic (30% weight)
        - Pattern metadata completeness (20% weight)
        - Match coverage (10% weight)
        
        Args:
            final_score: Combined weighted score
            bm25_rank: Rank in BM25 results (None if not present)
            semantic_rank: Rank in semantic results (None if not present)
            pattern: Pattern dictionary
            match_highlights: Matched features
        
        Returns:
            Confidence score between 0 and 1
        """
        # Component 1: Final score (40% weight)
        score_component = final_score * 0.4
        
        # Component 2: Rank agreement (30% weight)
        # If both ranks available and close, higher confidence
        rank_component = 0.0
        if bm25_rank is not None and semantic_rank is not None:
            # Both retrievers found the pattern
            rank_diff = abs(bm25_rank - semantic_rank)
            # Agreement score: 1.0 if same rank, decreases with difference
            agreement = max(0, 1.0 - (rank_diff * 0.1))
            rank_component = agreement * 0.3
        elif bm25_rank is not None or semantic_rank is not None:
            # Only one retriever found it - moderate confidence
            rank_component = 0.15
        
        # Component 3: Metadata completeness (20% weight)
        metadata = pattern.get("metadata", {})
        has_props = len(metadata.get("props", [])) > 0
        has_variants = len(metadata.get("variants", [])) > 0
        has_a11y = bool(metadata.get("a11y"))
        has_description = bool(pattern.get("description"))
        
        completeness = (
            (0.25 if has_props else 0) +
            (0.25 if has_variants else 0) +
            (0.25 if has_a11y else 0) +
            (0.25 if has_description else 0)
        )
        metadata_component = completeness * 0.2
        
        # Component 4: Match coverage (10% weight)
        # Percentage of requested features that matched
        total_requested = (
            len(match_highlights.get("matched_props", [])) +
            len(match_highlights.get("matched_variants", [])) +
            len(match_highlights.get("matched_a11y", []))
        )
        coverage = min(1.0, total_requested / 5.0)  # Normalize to 5 features
        coverage_component = coverage * 0.1
        
        # Sum all components
        confidence = score_component + rank_component + metadata_component + coverage_component
        
        # Clamp to [0, 1]
        return max(0.0, min(1.0, confidence))
    
    def _generate_explanation(
        self,
        pattern: Dict,
        requirements: Dict,
        match_highlights: Dict,
        bm25_score: float,
        semantic_score: float
    ) -> str:
        """Generate human-readable explanation text.
        
        Args:
            pattern: Pattern dictionary
            requirements: Requirements dictionary
            match_highlights: Matched features
            bm25_score: BM25 similarity score
            semantic_score: Semantic similarity score
        
        Returns:
            Natural language explanation string
        """
        parts = []
        
        # Component type match
        component_type = requirements.get("component_type", "")
        pattern_name = pattern.get("name", "")
        if component_type.lower() == pattern_name.lower():
            parts.append(f"Exact match for '{component_type}' component type")
        else:
            parts.append(f"Matched '{pattern_name}' component")
        
        # Props matches
        matched_props = match_highlights.get("matched_props", [])
        if matched_props:
            if len(matched_props) == 1:
                parts.append(f"with '{matched_props[0]}' prop")
            else:
                props_text = ", ".join(matched_props[:-1]) + f" and {matched_props[-1]}"
                parts.append(f"with {props_text} props")
        
        # Variant matches
        matched_variants = match_highlights.get("matched_variants", [])
        if matched_variants:
            variants_text = ", ".join(matched_variants)
            parts.append(f"supporting {variants_text} variant(s)")
        
        # A11y matches
        matched_a11y = match_highlights.get("matched_a11y", [])
        if matched_a11y:
            a11y_text = ", ".join(matched_a11y)
            parts.append(f"with {a11y_text} accessibility feature(s)")
        
        # Scoring summary
        if bm25_score >= 0.8 and semantic_score >= 0.8:
            parts.append("Strong match on both keyword and semantic similarity")
        elif bm25_score >= 0.8:
            parts.append(f"High keyword similarity ({bm25_score:.2f})")
        elif semantic_score >= 0.8:
            parts.append(f"High semantic similarity ({semantic_score:.2f})")
        
        # Join with proper punctuation
        if not parts:
            return f"Matched '{pattern_name}' component"
        
        explanation = parts[0].capitalize()
        if len(parts) > 1:
            explanation += ", " + ", ".join(parts[1:])
        explanation += "."
        
        return explanation
