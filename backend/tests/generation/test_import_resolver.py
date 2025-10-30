"""
Tests for Import Resolver

Tests import resolution, ordering, and deduplication.
"""

import pytest

from src.generation.import_resolver import ImportResolver, ImportCategory


class TestImportResolver:
    """Test suite for ImportResolver."""
    
    @pytest.fixture
    def resolver(self):
        """Create import resolver instance."""
        return ImportResolver()
    
    @pytest.fixture
    def sample_imports(self):
        """Sample import statements."""
        return [
            'import { cn } from "@/lib/utils"',
            'import * as React from "react"',
            'import { Button } from "@/components/ui/button"',
            'import type { Meta } from "@storybook/react"',
        ]
    
    def test_resolver_initialization(self, resolver):
        """Test that resolver initializes correctly."""
        assert resolver is not None
        assert "react" in resolver.external_packages
        assert "@/lib/utils" in resolver.utility_imports
    
    def test_categorize_external_import(self, resolver):
        """Test categorizing external package imports."""
        import_stmt = 'import * as React from "react"'
        category = resolver._categorize_import(import_stmt)
        
        assert category == ImportCategory.EXTERNAL
    
    def test_categorize_internal_import(self, resolver):
        """Test categorizing internal imports with @/ alias."""
        import_stmt = 'import { Button } from "@/components/ui/button"'
        category = resolver._categorize_import(import_stmt)
        
        assert category == ImportCategory.INTERNAL
    
    def test_categorize_utils_import(self, resolver):
        """Test categorizing utility imports."""
        import_stmt = 'import { cn } from "@/lib/utils"'
        category = resolver._categorize_import(import_stmt)
        
        assert category == ImportCategory.UTILS
    
    def test_categorize_type_import(self, resolver):
        """Test categorizing type-only imports."""
        import_stmt = 'import type { Meta } from "@storybook/react"'
        category = resolver._categorize_import(import_stmt)
        
        assert category == ImportCategory.TYPES
    
    def test_resolve_and_order_basic(self, resolver, sample_imports):
        """Test basic import resolution and ordering."""
        ordered = resolver.resolve_and_order(sample_imports)
        
        # Should have imports
        assert len(ordered) > 0
        
        # External should come first
        assert "react" in ordered[0].lower()
        
        # Utils should come after internal
        utils_idx = next(i for i, imp in enumerate(ordered) if "utils" in imp)
        internal_idx = next(i for i, imp in enumerate(ordered) if "@/components" in imp)
        assert internal_idx < utils_idx
    
    def test_add_missing_react_import(self, resolver):
        """Test that React import is added if missing."""
        imports = ['import { cn } from "@/lib/utils"']
        
        ordered = resolver.resolve_and_order(imports)
        
        # Should have React import
        assert any("react" in imp.lower() for imp in ordered)
    
    def test_add_missing_utils_import(self, resolver):
        """Test that utils import is NOT added (self-contained code policy)."""
        imports = ['import * as React from "react"']
        
        ordered = resolver.resolve_and_order(imports)
        
        # Should NOT have utils import (self-contained code policy)
        assert not any("utils" in imp for imp in ordered)
    
    def test_deduplicate_imports(self, resolver):
        """Test that duplicate imports are removed."""
        imports = [
            'import * as React from "react"',
            'import * as React from "react"',  # Duplicate
            'import { cn } from "@/lib/utils"',
        ]
        
        ordered = resolver.resolve_and_order(imports)
        
        # Count React imports
        react_count = sum(1 for imp in ordered if imp and "react" in imp.lower())
        assert react_count == 1
    
    def test_normalize_import_quotes(self, resolver):
        """Test that imports with different quotes are normalized."""
        import1 = 'import * as React from "react"'
        import2 = "import * as React from 'react'"
        
        norm1 = resolver._normalize_import(import1)
        norm2 = resolver._normalize_import(import2)
        
        assert norm1 == norm2
    
    def test_normalize_import_whitespace(self, resolver):
        """Test that imports with different whitespace are normalized."""
        import1 = 'import  *  as  React  from  "react"'
        import2 = 'import * as React from "react"'
        
        norm1 = resolver._normalize_import(import1)
        norm2 = resolver._normalize_import(import2)
        
        assert norm1 == norm2
    
    def test_order_with_blank_lines(self, resolver):
        """Test that blank lines separate import categories."""
        imports = [
            'import * as React from "react"',
            'import { Button } from "@/components/ui/button"',
            'import { cn } from "@/lib/utils"',
            'import type { Meta } from "@storybook/react"',
        ]
        
        ordered = resolver.resolve_and_order(imports)
        
        # Should have blank lines between categories
        has_blank_lines = any(imp == "" for imp in ordered)
        assert has_blank_lines
    
    def test_extract_package_dependencies(self, resolver):
        """Test extracting package.json dependencies."""
        imports = [
            'import * as React from "react"',
            'import { Button } from "@radix-ui/react-slot"',
            'import { cn } from "clsx"',
        ]
        
        deps = resolver.extract_package_dependencies(imports)
        
        assert "react" in deps
        assert "@radix-ui/react-slot" in deps
        assert "clsx" in deps
        
        # Should have version specifiers
        assert deps["react"].startswith("^")
    
    def test_extract_dependencies_skips_internal(self, resolver):
        """Test that internal imports are not added to dependencies."""
        imports = [
            'import * as React from "react"',
            'import { Button } from "@/components/ui/button"',
        ]
        
        deps = resolver.extract_package_dependencies(imports)
        
        # Should have react but not internal imports
        assert "react" in deps
        assert not any("@/" in key for key in deps.keys())
    
    def test_scoped_package_extraction(self, resolver):
        """Test extracting scoped package names."""
        imports = [
            'import { Slot } from "@radix-ui/react-slot"',
        ]
        
        deps = resolver.extract_package_dependencies(imports)
        
        assert "@radix-ui/react-slot" in deps
    
    def test_alphabetical_ordering_within_category(self, resolver):
        """Test that imports are alphabetically sorted within categories."""
        imports = [
            'import { z } from "z-package"',
            'import { a } from "a-package"',
            'import { m } from "m-package"',
        ]
        
        ordered = resolver.resolve_and_order(imports)
        
        # Filter out empty lines and added imports
        external_imports = [
            imp for imp in ordered 
            if imp and '"a-package"' in imp or '"m-package"' in imp or '"z-package"' in imp
        ]
        
        # Should be alphabetically ordered
        assert '"a-package"' in external_imports[0]
        assert '"m-package"' in external_imports[1]
        assert '"z-package"' in external_imports[2]
    
    def test_component_type_parameter(self, resolver):
        """Test that component_type parameter is used."""
        imports = []
        
        # Should add missing imports based on component type
        ordered = resolver.resolve_and_order(imports, component_type="input")
        
        # Should have React but NOT utils (self-contained code policy)
        assert any("react" in imp.lower() for imp in ordered)
        assert not any("utils" in imp for imp in ordered)
    
    def test_empty_imports_list(self, resolver):
        """Test handling empty imports list."""
        ordered = resolver.resolve_and_order([])
        
        # Should still add required imports
        assert len(ordered) > 0
        assert any("react" in imp.lower() for imp in ordered)
