"""
Tests for retrieval-only test queries.

Validates:
- Query structure and format
- Category filtering
- Query statistics
- Expected patterns
"""

import pytest
from src.evaluation.retrieval_queries import (
    TEST_QUERIES,
    KEYWORD_QUERIES,
    SEMANTIC_QUERIES,
    MIXED_QUERIES,
    get_queries_by_category,
    get_all_queries,
    get_query_statistics,
    get_expected_patterns,
)


class TestRetrievalQueries:
    """Tests for retrieval query definitions."""

    def test_total_query_count(self):
        """Test that we have exactly 22 test queries."""
        assert len(TEST_QUERIES) == 22
        assert len(get_all_queries()) == 22

    def test_category_distribution(self):
        """Test that queries are distributed across categories."""
        assert len(KEYWORD_QUERIES) == 7
        assert len(SEMANTIC_QUERIES) == 10
        assert len(MIXED_QUERIES) == 5
        assert len(KEYWORD_QUERIES) + len(SEMANTIC_QUERIES) + len(MIXED_QUERIES) == 22

    def test_query_structure(self):
        """Test that all queries have required fields."""
        required_fields = ['query', 'expected_pattern', 'category', 'description']

        for query_data in TEST_QUERIES:
            for field in required_fields:
                assert field in query_data, f"Query missing field: {field}"
                assert query_data[field], f"Query has empty field: {field}"

            # Verify field types
            assert isinstance(query_data['query'], str)
            assert isinstance(query_data['expected_pattern'], str)
            assert isinstance(query_data['category'], str)
            assert isinstance(query_data['description'], str)

    def test_valid_categories(self):
        """Test that all queries have valid categories."""
        valid_categories = ['keyword', 'semantic', 'mixed']

        for query_data in TEST_QUERIES:
            assert query_data['category'] in valid_categories, (
                f"Invalid category: {query_data['category']}"
            )

    def test_get_queries_by_category_keyword(self):
        """Test filtering by keyword category."""
        keyword_queries = get_queries_by_category('keyword')
        assert len(keyword_queries) == 7
        assert all(q['category'] == 'keyword' for q in keyword_queries)

    def test_get_queries_by_category_semantic(self):
        """Test filtering by semantic category."""
        semantic_queries = get_queries_by_category('semantic')
        assert len(semantic_queries) == 10
        assert all(q['category'] == 'semantic' for q in semantic_queries)

    def test_get_queries_by_category_mixed(self):
        """Test filtering by mixed category."""
        mixed_queries = get_queries_by_category('mixed')
        assert len(mixed_queries) == 5
        assert all(q['category'] == 'mixed' for q in mixed_queries)

    def test_get_queries_by_category_invalid(self):
        """Test that invalid category raises ValueError."""
        with pytest.raises(ValueError, match="Invalid category"):
            get_queries_by_category('invalid')

    def test_get_all_queries(self):
        """Test getting all queries."""
        all_queries = get_all_queries()
        assert len(all_queries) == 22
        assert all_queries == TEST_QUERIES

    def test_get_query_statistics(self):
        """Test query statistics calculation."""
        stats = get_query_statistics()

        assert stats['total'] == 22
        assert stats['keyword'] == 7
        assert stats['semantic'] == 10
        assert stats['mixed'] == 5

    def test_get_expected_patterns(self):
        """Test getting unique expected patterns."""
        patterns = get_expected_patterns()

        # Should be sorted
        assert patterns == sorted(patterns)

        # Should have no duplicates
        assert len(patterns) == len(set(patterns))

        # Should include common component types
        assert 'button' in patterns
        assert 'card' in patterns
        assert 'badge' in patterns
        assert 'input' in patterns

    def test_keyword_queries_contain_component_names(self):
        """Test that keyword queries explicitly mention component names."""
        for query_data in KEYWORD_QUERIES:
            query = query_data['query'].lower()
            expected_pattern = query_data['expected_pattern'].lower()

            # Keyword queries should contain the component name
            # (with some flexibility for variations like "checkbox" vs "check")
            assert (
                expected_pattern in query or
                expected_pattern[:4] in query  # First 4 chars for partial matches
            ), f"Keyword query '{query}' doesn't contain pattern '{expected_pattern}'"

    def test_semantic_queries_avoid_component_names(self):
        """Test that semantic queries avoid explicit component names."""
        # Common component names to avoid
        component_names = ['button', 'card', 'badge', 'input', 'checkbox', 'select', 'alert']

        for query_data in SEMANTIC_QUERIES:
            query = query_data['query'].lower()

            # Semantic queries should NOT explicitly mention component names
            for component in component_names:
                assert component not in query, (
                    f"Semantic query '{query}' should not contain '{component}'"
                )

    def test_mixed_queries_contain_both(self):
        """Test that mixed queries contain both keywords and semantics."""
        for query_data in MIXED_QUERIES:
            query = query_data['query'].lower()

            # Should contain component name (keyword)
            pattern = query_data['expected_pattern'].lower()
            assert pattern in query or pattern[:4] in query

            # Should also contain descriptive terms (semantic)
            descriptive_terms = ['with', 'for', 'component', 'handler', 'state', 'prop']
            assert any(term in query for term in descriptive_terms), (
                f"Mixed query '{query}' should contain descriptive terms"
            )

    def test_no_duplicate_queries(self):
        """Test that there are no duplicate query strings."""
        query_strings = [q['query'] for q in TEST_QUERIES]
        assert len(query_strings) == len(set(query_strings)), (
            "Found duplicate queries"
        )

    def test_expected_patterns_are_consistent(self):
        """Test that expected patterns use consistent naming."""
        patterns = get_expected_patterns()

        # All patterns should be lowercase
        for pattern in patterns:
            assert pattern == pattern.lower(), (
                f"Pattern '{pattern}' should be lowercase"
            )

        # All patterns should be single words or hyphenated
        for pattern in patterns:
            assert ' ' not in pattern, (
                f"Pattern '{pattern}' should not contain spaces"
            )

    def test_query_coverage(self):
        """Test that queries cover a reasonable variety of components."""
        patterns = get_expected_patterns()

        # Should cover at least 5 different component types
        assert len(patterns) >= 5, (
            f"Only {len(patterns)} component types covered. Need at least 5."
        )

        # Should include fundamental UI components
        fundamental_components = ['button', 'input', 'card']
        for component in fundamental_components:
            assert component in patterns, (
                f"Missing fundamental component: {component}"
            )
