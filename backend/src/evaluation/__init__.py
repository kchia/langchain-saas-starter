"""
Evaluation module for E2E pipeline assessment.

This module provides tools for evaluating the complete screenshot-to-code pipeline:
- Golden dataset management
- Metrics calculation at each stage
- E2E pipeline evaluation
- Performance analysis and reporting
"""

from .types import (
    TokenExtractionResult,
    RetrievalResult,
    GenerationResult,
    E2EResult,
)

from .metrics import (
    TokenExtractionMetrics,
    RetrievalMetrics,
    GenerationMetrics,
    E2EMetrics,
)

from .golden_dataset import GoldenDataset
from .e2e_evaluator import E2EEvaluator
from .retrieval_queries import (
    TEST_QUERIES,
    get_queries_by_category,
    get_all_queries,
    get_query_statistics,
    get_expected_patterns,
)

__all__ = [
    # Types
    'TokenExtractionResult',
    'RetrievalResult',
    'GenerationResult',
    'E2EResult',
    # Metrics
    'TokenExtractionMetrics',
    'RetrievalMetrics',
    'GenerationMetrics',
    'E2EMetrics',
    # Dataset
    'GoldenDataset',
    # Evaluator
    'E2EEvaluator',
    # Retrieval Queries
    'TEST_QUERIES',
    'get_queries_by_category',
    'get_all_queries',
    'get_query_statistics',
    'get_expected_patterns',
]
