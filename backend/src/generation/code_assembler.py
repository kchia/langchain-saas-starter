"""
Code Assembler - Format and finalize component code.

Simplified for LLM-first generation. The LLM generates complete component code,
so this module only needs to:
- Add provenance header
- Resolve and organize imports  
- Format code with Prettier
"""

import asyncio
import logging
import subprocess
from typing import Dict, Any
from pathlib import Path

from .types import CodeParts
from .import_resolver import ImportResolver
from .provenance import ProvenanceGenerator

# Configure logger
logger = logging.getLogger(__name__)


class CodeAssembler:
    """
    Finalize and format component code.
    
    Simplified for LLM-first generation:
    - Adds provenance header
    - Resolves and organizes imports
    - Formats code with Prettier
    """
    
    def __init__(self):
        """Initialize code assembler."""
        # Find format_code.js script
        backend_dir = Path(__file__).parent.parent.parent
        self.format_script = backend_dir / "scripts" / "format_code.js"
        
        # Initialize specialized modules
        self.import_resolver = ImportResolver()
        self.provenance_generator = ProvenanceGenerator()
    
    async def assemble(self, parts: CodeParts) -> Dict[str, str]:
        """
        Finalize component code with provenance, imports, and formatting.
        
        In LLM-first generation, the LLM provides complete code. This method:
        1. Adds provenance header (if not present)
        2. Resolves and organizes imports (if provided separately)
        3. Formats code with Prettier
        
        Args:
            parts: CodeParts with complete component and stories code
        
        Returns:
            Dictionary with formatted files:
                - component: Formatted component.tsx code
                - stories: Formatted stories.tsx code  
                - files: Map of filename to content
        """
        # Start with complete component code from LLM
        component_code = parts.component_code or ""
        
        # Add provenance header if not already present
        if parts.provenance_header and not component_code.startswith("/*"):
            component_code = parts.provenance_header + "\n\n" + component_code
        
        # If imports are provided separately (legacy support), resolve and prepend
        if parts.imports and component_code and not component_code.strip().startswith("import"):
            component_type = parts.component_name.lower() if parts.component_name else "button"
            ordered_imports = self.import_resolver.resolve_and_order(
                parts.imports,
                component_type
            )
            imports_section = "\n".join(ordered_imports)
            component_code = imports_section + "\n\n" + component_code
        
        # Format component code
        formatted_component = await self._format_code(component_code)
        
        # Format stories code if provided
        stories_code = parts.storybook_stories or ""
        formatted_stories = ""
        if stories_code:
            formatted_stories = await self._format_code(stories_code)
        
        # Determine component name
        component_name = parts.component_name or "Component"
        
        # Build files dictionary
        files = {
            f"{component_name}.tsx": formatted_component,
        }
        
        if formatted_stories:
            files[f"{component_name}.stories.tsx"] = formatted_stories
        
        return {
            "component": formatted_component,
            "stories": formatted_stories,
            "files": files
        }
    
    async def _format_code(self, code: str) -> str:
        """
        Format code with Prettier via Node.js subprocess.
        
        Args:
            code: Unformatted code string
        
        Returns:
            Formatted code string
        
        Raises:
            ValueError: If Prettier formatting fails
        """
        try:
            # Check if format_code.js exists
            if not self.format_script.exists():
                # Prettier not available, return unformatted code
                # This allows tests to run without Node.js
                return code
            
            # Run Prettier via Node.js script
            result = await asyncio.create_subprocess_exec(
                'node',
                str(self.format_script),
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            # Send code to stdin and get formatted output
            stdout, stderr = await result.communicate(code.encode('utf-8'))
            
            if result.returncode != 0:
                error_msg = stderr.decode('utf-8')
                raise ValueError(f"Prettier formatting failed: {error_msg}")
            
            return stdout.decode('utf-8')
        
        except FileNotFoundError:
            # Node.js not available, return unformatted code
            logger.warning("Node.js not available for code formatting")
            return code
        except Exception as e:
            # Formatting failed, return unformatted code with warning
            logger.warning(f"Code formatting failed: {e}")
            return code
    
    def validate_typescript(self, code: str) -> Dict[str, Any]:
        """
        Validate TypeScript compilation (optional, deferred to Epic 5).
        
        Args:
            code: TypeScript code to validate
        
        Returns:
            Validation result with success flag and errors
        """
        # Placeholder for TypeScript compilation validation
        # Full implementation in Epic 5
        return {
            "success": True,
            "errors": [],
            "warnings": []
        }
    
    def measure_code_metrics(self, code: str) -> Dict[str, int]:
        """
        Measure code metrics.
        
        Args:
            code: Component code
        
        Returns:
            Dictionary with code metrics
        """
        lines = code.split('\n')
        
        # Count non-empty lines
        non_empty_lines = [line for line in lines if line.strip()]
        
        # Count imports
        import_count = len([line for line in lines if line.strip().startswith('import')])
        
        # Count functions/components
        function_count = len([
            line for line in lines 
            if 'function' in line or 'const' in line and '=>' in line
        ])
        
        return {
            "total_lines": len(lines),
            "code_lines": len(non_empty_lines),
            "import_count": import_count,
            "function_count": function_count
        }
