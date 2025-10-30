"""
Retrieval-only test queries (ported from notebooks).

These queries validate the retrieval component in isolation,
complementing the E2E evaluation. They test:
- Keyword matching (exact component names)
- Semantic understanding (descriptions without keywords)
- Mixed queries (keywords + semantics)

Results align with RAGAS metrics:
- MRR (Mean Reciprocal Rank) = Context Precision
- Hit@K = Context Recall
- Precision@K = Answer Relevancy

Reference: notebooks/evaluation/tasks_6_7_consolidated_evaluation.ipynb
"""

from typing import List, Dict


# Keyword-heavy queries (10)
# These queries use explicit component names and technical terms
KEYWORD_QUERIES = [
    {
        "query": "Button component",
        "expected_pattern": "button",
        "category": "keyword",
        "description": "Direct button component name"
    },
    {
        "query": "Card with header and footer",
        "expected_pattern": "card",
        "category": "keyword",
        "description": "Card with structural keywords"
    },
    {
        "query": "Badge variant status",
        "expected_pattern": "badge",
        "category": "keyword",
        "description": "Badge with variant terminology"
    },
    {
        "query": "Input field with placeholder",
        "expected_pattern": "input",
        "category": "keyword",
        "description": "Input with attribute keyword"
    },
    {
        "query": "Checkbox component checked state",
        "expected_pattern": "checkbox",
        "category": "keyword",
        "description": "Checkbox with state keyword"
    },
    {
        "query": "Select dropdown options",
        "expected_pattern": "select",
        "category": "keyword",
        "description": "Select with dropdown keyword"
    },
    {
        "query": "Alert notification message",
        "expected_pattern": "alert",
        "category": "keyword",
        "description": "Alert with notification keyword"
    },
    {
        "query": "Switch toggle component",
        "expected_pattern": "switch",
        "category": "keyword",
        "description": "Switch with toggle keyword"
    },
    {
        "query": "Radio button group selection",
        "expected_pattern": "radio",
        "category": "keyword",
        "description": "Radio with button group keyword"
    },
    {
        "query": "Tabs navigation panel",
        "expected_pattern": "tabs",
        "category": "keyword",
        "description": "Tabs with navigation keyword"
    },
]

# Semantic queries (10)
# These queries describe functionality without using component names
SEMANTIC_QUERIES = [
    {
        "query": "clickable action element for user interactions",
        "expected_pattern": "button",
        "category": "semantic",
        "description": "Functional description of button"
    },
    {
        "query": "container for organizing related content in sections",
        "expected_pattern": "card",
        "category": "semantic",
        "description": "Functional description of card"
    },
    {
        "query": "visual indicator showing status or category",
        "expected_pattern": "badge",
        "category": "semantic",
        "description": "Functional description of badge"
    },
    {
        "query": "text field for user to enter information",
        "expected_pattern": "input",
        "category": "semantic",
        "description": "Functional description of input"
    },
    {
        "query": "binary choice control for selecting options",
        "expected_pattern": "checkbox",
        "category": "semantic",
        "description": "Functional description of checkbox"
    },
    {
        "query": "collapsible menu to pick from multiple choices",
        "expected_pattern": "select",
        "category": "semantic",
        "description": "Functional description of select"
    },
    {
        "query": "important message to notify users of status",
        "expected_pattern": "alert",
        "category": "semantic",
        "description": "Functional description of alert"
    },
    {
        "query": "toggle control to enable or disable a feature",
        "expected_pattern": "switch",
        "category": "semantic",
        "description": "Functional description of switch"
    },
    {
        "query": "mutually exclusive option selector",
        "expected_pattern": "radio",
        "category": "semantic",
        "description": "Functional description of radio group"
    },
    {
        "query": "navigation element for switching between views",
        "expected_pattern": "tabs",
        "category": "semantic",
        "description": "Functional description of tabs"
    },
]

# Mixed queries (5)
# These queries combine keywords with semantic descriptions
MIXED_QUERIES = [
    {
        "query": "Button component with variant prop for different styles",
        "expected_pattern": "button",
        "category": "mixed",
        "description": "Button with technical props and usage description"
    },
    {
        "query": "Card component that can have interactive elements",
        "expected_pattern": "card",
        "category": "mixed",
        "description": "Card with name and interactive capability"
    },
    {
        "query": "Switch component with onChange handler and checked state",
        "expected_pattern": "switch",
        "category": "mixed",
        "description": "Switch with technical props and state"
    },
    {
        "query": "Radio Group for form selection with multiple options",
        "expected_pattern": "radio",
        "category": "mixed",
        "description": "Radio with name and functional context"
    },
    {
        "query": "Tabs component for organizing content into panels",
        "expected_pattern": "tabs",
        "category": "mixed",
        "description": "Tabs with name and functional purpose"
    },
]

# All test queries combined
TEST_QUERIES = KEYWORD_QUERIES + SEMANTIC_QUERIES + MIXED_QUERIES


def get_queries_by_category(category: str) -> List[Dict]:
    """
    Filter queries by category.

    Args:
        category: One of "keyword", "semantic", "mixed"

    Returns:
        List of queries matching the category
    """
    valid_categories = ["keyword", "semantic", "mixed"]
    if category not in valid_categories:
        raise ValueError(
            f"Invalid category: {category}. Must be one of {valid_categories}"
        )

    return [q for q in TEST_QUERIES if q['category'] == category]


def get_all_queries() -> List[Dict]:
    """
    Get all test queries.

    Returns:
        List of all 25 test queries
    """
    return TEST_QUERIES


def get_query_statistics() -> Dict[str, int]:
    """
    Get statistics about test queries.

    Returns:
        Dictionary with counts per category
    """
    return {
        'total': len(TEST_QUERIES),
        'keyword': len(KEYWORD_QUERIES),
        'semantic': len(SEMANTIC_QUERIES),
        'mixed': len(MIXED_QUERIES),
    }


def get_expected_patterns() -> List[str]:
    """
    Get list of unique expected pattern IDs.

    Returns:
        Sorted list of unique pattern IDs
    """
    patterns = set(q['expected_pattern'] for q in TEST_QUERIES)
    return sorted(patterns)
