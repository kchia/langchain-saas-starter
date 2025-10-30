"""
Exemplar Loader

Loads hand-crafted exemplar components for few-shot learning.
"""

import json
from typing import Dict, Any, List, Optional
from pathlib import Path
from dataclasses import dataclass


@dataclass
class Exemplar:
    """Single exemplar component."""
    component_name: str
    component_type: str
    input_data: Dict[str, Any]  # input.json
    component_code: str  # output.tsx
    stories_code: str  # output.stories.tsx
    metadata: Dict[str, Any]  # metadata.json


class ExemplarLoader:
    """
    Load and select exemplar components for prompt construction.
    
    Exemplars are hand-crafted, high-quality components that serve
    as few-shot examples for the LLM.
    """
    
    def __init__(self, exemplars_dir: Optional[Path] = None):
        """
        Initialize exemplar loader.
        
        Args:
            exemplars_dir: Directory containing exemplar subdirectories
        """
        self.exemplars_dir = exemplars_dir or (
            Path(__file__).parent.parent.parent / "data" / "exemplars"
        )
        
        # Cache loaded exemplars
        self._cache: Dict[str, Exemplar] = {}
        
        # Load all available exemplars
        self._load_all_exemplars()
    
    def _load_all_exemplars(self) -> None:
        """Load all exemplars from disk into cache."""
        if not self.exemplars_dir.exists():
            return
        
        # Iterate through subdirectories (button, card, input, etc.)
        for exemplar_dir in self.exemplars_dir.iterdir():
            if not exemplar_dir.is_dir():
                continue
            
            component_type = exemplar_dir.name
            
            try:
                exemplar = self._load_exemplar(exemplar_dir, component_type)
                self._cache[component_type] = exemplar
            except Exception as e:
                # Skip exemplars that fail to load
                pass
    
    def _load_exemplar(self, exemplar_dir: Path, component_type: str) -> Exemplar:
        """
        Load a single exemplar from its directory.
        
        Args:
            exemplar_dir: Directory containing exemplar files
            component_type: Type of component (button, card, etc.)
        
        Returns:
            Loaded Exemplar object
        """
        # Load input.json
        input_file = exemplar_dir / "input.json"
        with open(input_file, 'r') as f:
            input_data = json.load(f)
        
        # Load output.tsx
        output_file = exemplar_dir / "output.tsx"
        with open(output_file, 'r') as f:
            component_code = f.read()
        
        # Load output.stories.tsx
        stories_file = exemplar_dir / "output.stories.tsx"
        with open(stories_file, 'r') as f:
            stories_code = f.read()
        
        # Load metadata.json
        metadata_file = exemplar_dir / "metadata.json"
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)
        
        return Exemplar(
            component_name=input_data.get("component_name", component_type.title()),
            component_type=component_type,
            input_data=input_data,
            component_code=component_code,
            stories_code=stories_code,
            metadata=metadata,
        )
    
    def get_exemplar(self, component_type: str) -> Optional[Exemplar]:
        """
        Get exemplar for a specific component type.
        
        Args:
            component_type: Type of component (button, card, input, etc.)
        
        Returns:
            Exemplar if found, None otherwise
        """
        return self._cache.get(component_type.lower())
    
    def get_relevant_exemplars(
        self,
        component_type: str,
        max_count: int = 2,
    ) -> List[Exemplar]:
        """
        Get relevant exemplars for prompt construction.
        
        Selection strategy:
        1. Prefer exact match (button -> button)
        2. Fall back to similar types
        3. Limit to max_count for token budget
        
        Args:
            component_type: Type of component being generated
            max_count: Maximum number of exemplars to return
        
        Returns:
            List of relevant exemplars
        """
        exemplars = []
        
        # First try exact match
        exact_match = self.get_exemplar(component_type)
        if exact_match:
            exemplars.append(exact_match)
        
        # If we need more, add other exemplars
        if len(exemplars) < max_count:
            for comp_type, exemplar in self._cache.items():
                if comp_type != component_type.lower() and len(exemplars) < max_count:
                    exemplars.append(exemplar)
        
        return exemplars[:max_count]
    
    def format_for_prompt(self, exemplar: Exemplar) -> str:
        """
        Format exemplar for inclusion in prompt.
        
        Args:
            exemplar: Exemplar to format
        
        Returns:
            Formatted string for prompt
        """
        return f"""### Example: {exemplar.component_name}

**Input Requirements:**
```json
{json.dumps(exemplar.input_data, indent=2)}
```

**Generated Component:**
```tsx
{exemplar.component_code}
```

**Generated Stories:**
```tsx
{exemplar.stories_code}
```

**Why this is a good example:**
{exemplar.metadata.get('why_exemplar', 'High-quality component example')}
"""
    
    def get_available_types(self) -> List[str]:
        """
        Get list of available exemplar types.
        
        Returns:
            List of component types with exemplars
        """
        return list(self._cache.keys())
    
    def get_count(self) -> int:
        """
        Get count of loaded exemplars.
        
        Returns:
            Number of exemplars in cache
        """
        return len(self._cache)
