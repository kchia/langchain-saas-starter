"""
Import Resolver - Resolve and order imports correctly.

This module analyzes, resolves, and orders import statements for generated
TypeScript/React components, handling external, internal, utility, and type imports.
"""

import re
from typing import List, Set, Dict, Any
from enum import Enum


class ImportCategory(str, Enum):
    """Categories for import ordering."""
    EXTERNAL = "external"  # React, third-party packages
    INTERNAL = "internal"  # @/ aliased imports
    UTILS = "utils"        # Utility functions
    TYPES = "types"        # Type imports


class ImportResolver:
    """
    Resolve and order imports for TypeScript components.
    """
    
    def __init__(self):
        """Initialize import resolver."""
        # Common external packages
        self.external_packages = {
            "react", "react-dom", "@storybook/react",
            "@radix-ui", "class-variance-authority",
            "clsx", "tailwind-merge"
        }
        
        # Utility imports
        self.utility_imports = {"@/lib/utils", "@/utils"}
        
        # Type-only imports
        self.type_imports = set()
    
    def resolve_and_order(
        self,
        imports: List[str],
        component_type: str = "button"
    ) -> List[str]:
        """
        Resolve and order imports correctly.
        
        Args:
            imports: List of import statements
            component_type: Type of component (for adding missing imports)
        
        Returns:
            Ordered and deduplicated list of import statements
        """
        # Parse existing imports
        parsed_imports = self._parse_imports(imports)
        
        # Add any missing required imports
        parsed_imports = self._add_missing_imports(parsed_imports, component_type)
        
        # Remove duplicates
        parsed_imports = self._deduplicate_imports(parsed_imports)
        
        # Order imports by category
        ordered_imports = self._order_imports(parsed_imports)
        
        return ordered_imports
    
    def _parse_imports(self, imports: List[str]) -> Dict[ImportCategory, List[str]]:
        """
        Parse imports into categories.
        
        Args:
            imports: List of import statements
        
        Returns:
            Dictionary mapping categories to import statements
        """
        categorized = {
            ImportCategory.EXTERNAL: [],
            ImportCategory.INTERNAL: [],
            ImportCategory.UTILS: [],
            ImportCategory.TYPES: []
        }
        
        for import_stmt in imports:
            # Skip empty lines
            if not import_stmt.strip():
                continue
            
            category = self._categorize_import(import_stmt)
            categorized[category].append(import_stmt)
        
        return categorized
    
    def _categorize_import(self, import_stmt: str) -> ImportCategory:
        """
        Categorize a single import statement.
        
        Args:
            import_stmt: Import statement to categorize
        
        Returns:
            ImportCategory for this import
        """
        # Type imports
        if "import type" in import_stmt or "import { type" in import_stmt:
            return ImportCategory.TYPES
        
        # Utility imports
        if any(util in import_stmt for util in self.utility_imports):
            return ImportCategory.UTILS
        
        # Internal imports (using @/ alias)
        if '"@/' in import_stmt or "'@/" in import_stmt:
            return ImportCategory.INTERNAL
        
        # External imports
        return ImportCategory.EXTERNAL
    
    def _add_missing_imports(
        self,
        categorized: Dict[ImportCategory, List[str]],
        component_type: str
    ) -> Dict[ImportCategory, List[str]]:
        """
        Add any missing required imports.
        
        Args:
            categorized: Categorized imports
            component_type: Type of component
        
        Returns:
            Updated categorized imports with missing imports added
        """
        # Check if React is imported
        has_react = any("react" in imp.lower() for imp in categorized[ImportCategory.EXTERNAL])
        
        if not has_react:
            # Add React import
            categorized[ImportCategory.EXTERNAL].insert(
                0,
                'import * as React from "react"'
            )
        
        # Check if utils are imported (cn function)
        # NOTE: We no longer auto-add @/lib/utils import since we generate self-contained code
        # with inlined utility functions. This prevents missing dependency errors in
        # standalone environments like StackBlitz.

        return categorized
    
    def _deduplicate_imports(
        self,
        categorized: Dict[ImportCategory, List[str]]
    ) -> Dict[ImportCategory, List[str]]:
        """
        Remove duplicate imports.
        
        Args:
            categorized: Categorized imports
        
        Returns:
            Deduplicated categorized imports
        """
        deduplicated = {}
        
        for category, imports in categorized.items():
            # Use a set to track seen imports (by normalized form)
            seen = set()
            unique_imports = []
            
            for import_stmt in imports:
                # Normalize by removing whitespace variations
                normalized = self._normalize_import(import_stmt)
                
                if normalized not in seen:
                    seen.add(normalized)
                    unique_imports.append(import_stmt)
            
            deduplicated[category] = unique_imports
        
        return deduplicated
    
    def _normalize_import(self, import_stmt: str) -> str:
        """
        Normalize import statement for deduplication.
        
        Args:
            import_stmt: Import statement
        
        Returns:
            Normalized form
        """
        # Remove extra whitespace
        normalized = re.sub(r'\s+', ' ', import_stmt.strip())
        
        # Normalize quotes
        normalized = normalized.replace('"', "'")
        
        return normalized
    
    def _order_imports(
        self,
        categorized: Dict[ImportCategory, List[str]]
    ) -> List[str]:
        """
        Order imports by category.
        
        Args:
            categorized: Categorized imports
        
        Returns:
            Ordered list of import statements
        """
        ordered = []
        
        # Order: external, internal, utils, types
        # Add each category with blank line separator
        if categorized[ImportCategory.EXTERNAL]:
            ordered.extend(sorted(categorized[ImportCategory.EXTERNAL]))
        
        if categorized[ImportCategory.INTERNAL]:
            if ordered:
                ordered.append("")  # Blank line separator
            ordered.extend(sorted(categorized[ImportCategory.INTERNAL]))
        
        if categorized[ImportCategory.UTILS]:
            if ordered:
                ordered.append("")  # Blank line separator
            ordered.extend(sorted(categorized[ImportCategory.UTILS]))
        
        if categorized[ImportCategory.TYPES]:
            if ordered:
                ordered.append("")  # Blank line separator
            ordered.extend(sorted(categorized[ImportCategory.TYPES]))
        
        return ordered
    
    def extract_package_dependencies(self, imports: List[str]) -> Dict[str, str]:
        """
        Extract package.json dependencies from imports.
        
        Args:
            imports: List of import statements
        
        Returns:
            Dictionary of package names to version specifiers
        """
        dependencies = {}
        
        # Standard versions for common packages
        standard_versions = {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "@storybook/react": "^8.0.0",
            "@radix-ui/react-slot": "^1.0.2",
            "class-variance-authority": "^0.7.0",
            "clsx": "^2.0.0",
            "tailwind-merge": "^2.0.0"
        }
        
        for import_stmt in imports:
            # Extract package name from import
            # Match: import ... from "package-name" or '@package/name'
            match = re.search(r'from\s+["\']([^"\']+)["\']', import_stmt)
            
            if match:
                package_path = match.group(1)
                
                # Extract root package name
                if package_path.startswith('@'):
                    # Scoped package: @scope/package
                    parts = package_path.split('/')
                    if len(parts) >= 2:
                        package_name = f"{parts[0]}/{parts[1]}"
                    else:
                        continue
                else:
                    # Regular package: package or package/subpath
                    package_name = package_path.split('/')[0]
                
                # Skip internal imports
                if package_name.startswith('@/'):
                    continue
                
                # Add to dependencies with standard version
                if package_name in standard_versions:
                    dependencies[package_name] = standard_versions[package_name]
        
        return dependencies
