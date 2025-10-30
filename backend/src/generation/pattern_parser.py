"""
Pattern Parser - Extract component metadata from pattern JSON.

This module parses shadcn/ui pattern JSON files to extract basic component metadata
for use as reference in LLM-first code generation. The LLM generates complete code,
so we only need metadata (name, type, variants, dependencies).
"""

import json
import os
import re
from typing import Dict, List, Any, Optional
from pathlib import Path

from .types import PatternStructure


class PatternParser:
    """
    Parser for extracting component metadata from pattern JSON.
    
    Simplified for LLM-first generation - only loads pattern code and metadata
    as reference. No code analysis or modification point detection needed.
    """
    
    def __init__(self, patterns_dir: Optional[Path] = None):
        """
        Initialize pattern parser.
        
        Args:
            patterns_dir: Directory containing pattern JSON files.
                         Defaults to PATTERNS_DIR env var or backend/data/patterns/
        """
        if patterns_dir is None:
            # Check environment variable first
            env_patterns_dir = os.getenv("PATTERNS_DIR")
            if env_patterns_dir:
                patterns_dir = Path(env_patterns_dir)
            else:
                # Default to backend/data/patterns
                backend_dir = Path(__file__).parent.parent.parent
                patterns_dir = backend_dir / "data" / "patterns"
        
        self.patterns_dir = Path(patterns_dir)
    
    def load_pattern(self, pattern_id: str) -> Dict[str, Any]:
        """
        Load pattern JSON from file.
        
        Args:
            pattern_id: ID of the pattern (e.g., "shadcn-button")
        
        Returns:
            Pattern data as dictionary
        
        Raises:
            FileNotFoundError: If pattern file doesn't exist
            ValueError: If pattern JSON is invalid
        """
        # Map pattern ID to filename
        # E.g., "shadcn-button" -> "button.json"
        # E.g., "button-001" -> "button.json"
        pattern_name = pattern_id.replace("shadcn-", "").lower()

        # Remove version suffix (e.g., "-001", "-v1")
        pattern_name = re.sub(r'-\d+$', '', pattern_name)  # Remove "-001"
        pattern_name = re.sub(r'-v\d+$', '', pattern_name)  # Remove "-v1"

        pattern_file = self.patterns_dir / f"{pattern_name}.json"
        
        if not pattern_file.exists():
            raise FileNotFoundError(f"Pattern file not found: {pattern_file}")
        
        try:
            with open(pattern_file, "r") as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid pattern JSON in {pattern_file}: {e}")
    
    def parse(self, pattern_id: str) -> PatternStructure:
        """
        Parse pattern and extract basic metadata.
        
        Args:
            pattern_id: ID of the pattern to parse
        
        Returns:
            PatternStructure with pattern code and metadata
        """
        pattern_data = self.load_pattern(pattern_id)
        
        # Extract basic metadata
        component_name = pattern_data.get("name", "Component")
        code = pattern_data.get("code", "")
        metadata = pattern_data.get("metadata", {})
        
        # Extract component type from pattern_id or metadata
        # E.g., "shadcn-button" -> "button"
        component_type = pattern_id.replace("shadcn-", "").lower()
        component_type = re.sub(r'-\d+$', '', component_type)  # Remove "-001"
        component_type = re.sub(r'-v\d+$', '', component_type)  # Remove "-v1"
        
        # If metadata has explicit type, use that
        if "type" in metadata:
            component_type = metadata["type"]
        
        # Extract variants list
        variants = self._extract_variants(metadata)
        
        # Extract dependencies from metadata
        dependencies = metadata.get("dependencies", [])
        
        return PatternStructure(
            component_name=component_name,
            component_type=component_type,
            code=code,
            variants=variants,
            dependencies=dependencies,
            metadata=metadata
        )
    
    def _extract_variants(self, metadata: Dict[str, Any]) -> List[str]:
        """
        Extract variant names from pattern metadata.
        
        Args:
            metadata: Pattern metadata dictionary
        
        Returns:
            List of variant names
        """
        variants = []
        
        # Extract from metadata.variants
        if "variants" in metadata:
            for variant in metadata["variants"]:
                if isinstance(variant, dict):
                    variants.append(variant.get("name", ""))
                elif isinstance(variant, str):
                    variants.append(variant)
        
        return [v for v in variants if v]  # Filter empty strings
    
    def list_available_patterns(self) -> List[str]:
        """
        List all available pattern IDs.
        
        Returns:
            List of pattern IDs (e.g., ["shadcn-button", "shadcn-card"])
        """
        if not self.patterns_dir.exists():
            return []
        
        patterns = []
        for pattern_file in self.patterns_dir.glob("*.json"):
            # Convert filename to pattern ID
            # E.g., "button.json" -> "shadcn-button"
            pattern_name = pattern_file.stem
            pattern_id = f"shadcn-{pattern_name}"
            patterns.append(pattern_id)
        
        return sorted(patterns)
