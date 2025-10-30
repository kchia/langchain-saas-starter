"""
Evaluation API routes for E2E pipeline metrics.

Endpoints:
- GET /api/v1/evaluation/metrics - Run full evaluation and return metrics
- GET /api/v1/evaluation/status - Check evaluation system readiness
- GET /api/v1/evaluation/logs - List available evaluation log files
- GET /api/v1/evaluation/logs/{filename} - Fetch a specific evaluation log file
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import os
import json
from pathlib import Path
from datetime import datetime

from ....evaluation.e2e_evaluator import E2EEvaluator
from ....evaluation.golden_dataset import GoldenDataset
from ....evaluation.retrieval_queries import TEST_QUERIES, get_query_statistics
from ....evaluation.metrics import RetrievalMetrics
from ....services.retrieval_service import RetrievalService
from ....core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/evaluation", tags=["evaluation"])


@router.get("/metrics")
async def get_evaluation_metrics() -> Dict[str, Any]:
    """
    Run E2E evaluation and return comprehensive metrics.

    This endpoint runs the full golden dataset evaluation pipeline:
    - Token extraction accuracy
    - Pattern retrieval accuracy (E2E + retrieval-only)
    - Code generation quality
    - End-to-end pipeline success rate

    The evaluation includes:
    1. E2E evaluation on golden dataset screenshots
    2. Retrieval-only evaluation on 22 test queries
    3. Per-category breakdown (keyword, semantic, mixed)

    Returns:
        JSON with overall metrics and per-screenshot results

    Raises:
        HTTPException: If evaluation fails or API key not configured
    """
    logger.info("Received request for evaluation metrics")

    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.error("OPENAI_API_KEY not configured")
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY not configured. Set the environment variable to run evaluation."
        )

    try:
        # ===== E2E Evaluation =====
        logger.info("Running E2E evaluation...")
        evaluator = E2EEvaluator(api_key=api_key)
        e2e_results = await evaluator.evaluate_all()

        logger.info(
            f"E2E evaluation complete. "
            f"Success rate: {e2e_results['overall']['pipeline_success_rate']:.1%}"
        )

        # ===== Retrieval-Only Evaluation =====
        logger.info("Running retrieval-only evaluation...")

        # Create mock patterns for retrieval testing
        # TODO: Load real patterns from database or pattern library
        mock_patterns = _create_mock_patterns()
        retrieval_service = RetrievalService(patterns=mock_patterns)
        retrieval_results = []

        for query_data in TEST_QUERIES:
            query = query_data['query']
            expected = query_data['expected_pattern']
            category = query_data['category']

            # Run retrieval
            results = await retrieval_service.search(
                requirements={'description': query},
                top_k=5
            )

            # Get top result
            if results and len(results) > 0:
                retrieved = results[0].get('pattern_id', '')
                confidence = results[0].get('score', 0.0)
            else:
                retrieved = ''
                confidence = 0.0

            correct = retrieved == expected

            # Find rank of correct pattern
            rank = 999
            for i, result in enumerate(results):
                if result.get('pattern_id') == expected:
                    rank = i + 1
                    break

            retrieval_results.append({
                'query': query,
                'expected': expected,
                'retrieved': retrieved,
                'correct': correct,
                'rank': rank,
                'confidence': confidence,
                'category': category,
            })

        # Calculate retrieval metrics
        from ....evaluation.types import RetrievalResult

        retrieval_result_objects = [
            RetrievalResult(
                screenshot_id=r['query'][:20],  # Truncate for ID
                expected_pattern_id=r['expected'],
                retrieved_pattern_id=r['retrieved'],
                correct=r['correct'],
                rank=r['rank'],
                confidence=r['confidence']
            )
            for r in retrieval_results
        ]

        # Overall retrieval metrics
        overall_mrr = RetrievalMetrics.mean_reciprocal_rank(retrieval_result_objects)
        overall_hit_at_3 = RetrievalMetrics.hit_at_k(retrieval_result_objects, k=3)
        overall_precision_at_1 = RetrievalMetrics.precision_at_k(retrieval_result_objects, k=1)

        # Per-category metrics
        def calculate_category_metrics(category: str) -> Dict[str, float]:
            """Calculate metrics for a specific category."""
            category_results = [
                RetrievalResult(
                    screenshot_id=r['query'][:20],
                    expected_pattern_id=r['expected'],
                    retrieved_pattern_id=r['retrieved'],
                    correct=r['correct'],
                    rank=r['rank'],
                    confidence=r['confidence']
                )
                for r in retrieval_results
                if r['category'] == category
            ]

            if not category_results:
                return {'mrr': 0.0, 'hit_at_3': 0.0, 'precision_at_1': 0.0}

            return {
                'mrr': RetrievalMetrics.mean_reciprocal_rank(category_results),
                'hit_at_3': RetrievalMetrics.hit_at_k(category_results, k=3),
                'precision_at_1': RetrievalMetrics.precision_at_k(category_results, k=1),
            }

        retrieval_only_metrics = {
            'mrr': overall_mrr,
            'hit_at_3': overall_hit_at_3,
            'precision_at_1': overall_precision_at_1,
            'test_queries': len(TEST_QUERIES),
            'per_category': {
                'keyword': calculate_category_metrics('keyword'),
                'semantic': calculate_category_metrics('semantic'),
                'mixed': calculate_category_metrics('mixed'),
            },
            'query_results': retrieval_results,
        }

        logger.info(
            f"Retrieval-only evaluation complete. "
            f"MRR: {overall_mrr:.3f}, Hit@3: {overall_hit_at_3:.1%}"
        )

        # Combine E2E and retrieval-only results
        combined_results = {
            **e2e_results,
            'retrieval_only': retrieval_only_metrics,
        }

        return combined_results

    except Exception as e:
        logger.error(f"Evaluation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation failed: {str(e)}"
        )


@router.get("/status")
async def get_evaluation_status() -> Dict[str, Any]:
    """
    Check if evaluation system is ready.

    Returns status information about:
    - API key configuration
    - Golden dataset availability
    - Retrieval query statistics

    Returns:
        Status information and readiness check
    """
    api_key_set = bool(os.getenv("OPENAI_API_KEY"))

    # Check golden dataset
    try:
        dataset = GoldenDataset()
        dataset_size = len(dataset)
        dataset_stats = dataset.get_statistics()
        dataset_loaded = True
    except Exception as e:
        logger.error(f"Failed to load golden dataset: {e}")
        dataset_size = 0
        dataset_stats = {}
        dataset_loaded = False

    # Get retrieval query statistics
    query_stats = get_query_statistics()

    return {
        "ready": api_key_set and dataset_loaded,
        "api_key_configured": api_key_set,
        "golden_dataset": {
            "loaded": dataset_loaded,
            "size": dataset_size,
            "statistics": dataset_stats,
        },
        "retrieval_queries": query_stats,
        "message": (
            "Evaluation system ready" if api_key_set and dataset_loaded
            else "Evaluation system not ready. Check API key and golden dataset."
        )
    }


@router.get("/logs")
async def list_evaluation_logs() -> Dict[str, Any]:
    """
    List available evaluation log files.
    
    Returns metadata about all evaluation JSON reports in backend/logs/.
    
    Returns:
        Dictionary with list of log files and their metadata
    """
    try:
        # Find logs directory (backend/logs/)
        # __file__ is at: backend/src/api/v1/routes/evaluation.py
        # Go up: routes -> v1 -> api -> src -> backend
        backend_dir = Path(__file__).parent.parent.parent.parent.parent
        logs_dir = backend_dir / "logs"
        
        if not logs_dir.exists():
            return {
                "logs": [],
                "logs_dir": str(logs_dir),
                "message": "Logs directory does not exist"
            }
        
        # Find all evaluation JSON files
        log_files = sorted(
            logs_dir.glob("e2e_evaluation_*.json"),
            key=lambda p: p.stat().st_mtime,
            reverse=True  # Most recent first
        )
        
        logs = []
        for log_file in log_files:
            try:
                stat = log_file.stat()
                # Try to read timestamp from filename (e2e_evaluation_YYYYMMDD_HHMMSS.json)
                filename = log_file.stem
                timestamp_str = filename.replace("e2e_evaluation_", "")
                
                logs.append({
                    "filename": log_file.name,
                    "path": str(log_file.relative_to(backend_dir)),
                    "size_bytes": stat.st_size,
                    "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "timestamp": timestamp_str,
                })
            except Exception as e:
                logger.warning(f"Failed to process log file {log_file}: {e}")
                continue
        
        return {
            "logs": logs,
            "logs_dir": str(logs_dir),
            "count": len(logs),
        }
        
    except Exception as e:
        logger.error(f"Failed to list evaluation logs: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list logs: {str(e)}"
        )


@router.get("/logs/{filename}")
async def get_evaluation_log(filename: str) -> Dict[str, Any]:
    """
    Fetch a specific evaluation log file.
    
    Args:
        filename: Name of the log file (e.g., "e2e_evaluation_20250109_143045.json")
    
    Returns:
        JSON content of the log file
    
    Raises:
        HTTPException: If file not found or invalid
    """
    try:
        # Security: Only allow JSON files matching expected pattern
        if not filename.startswith("e2e_evaluation_") or not filename.endswith(".json"):
            raise HTTPException(
                status_code=400,
                detail="Invalid log filename. Must match pattern: e2e_evaluation_*.json"
            )
        
        # Prevent path traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            raise HTTPException(
                status_code=400,
                detail="Invalid filename: path traversal not allowed"
            )
        
        # Find logs directory
        # __file__ is at: backend/src/api/v1/routes/evaluation.py
        # Go up: routes -> v1 -> api -> src -> backend
        backend_dir = Path(__file__).parent.parent.parent.parent.parent
        log_file = backend_dir / "logs" / filename
        
        if not log_file.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Log file not found: {filename}"
            )
        
        # Verify it's within logs directory (extra security)
        try:
            log_file.resolve().relative_to((backend_dir / "logs").resolve())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid log file path"
            )
        
        # Read and parse JSON
        with open(log_file, 'r') as f:
            log_data = json.load(f)
        
        # Add metadata
        stat = log_file.stat()
        log_data['_metadata'] = {
            'filename': filename,
            'size_bytes': stat.st_size,
            'modified_at': datetime.fromtimestamp(stat.st_mtime).isoformat(),
        }
        
        return log_data
        
    except HTTPException:
        raise
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON log file {filename}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON in log file: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Failed to fetch evaluation log {filename}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch log: {str(e)}"
        )


def _create_mock_patterns():
    """Create mock patterns for testing."""
    return [
        {"id": "button", "name": "Button", "description": "Interactive button component", "component_type": "button"},
        {"id": "card", "name": "Card", "description": "Content container card component", "component_type": "card"},
        {"id": "badge", "name": "Badge", "description": "Small label or tag badge component", "component_type": "badge"},
        {"id": "input", "name": "Input", "description": "Text input field component", "component_type": "input"},
        {"id": "checkbox", "name": "Checkbox", "description": "Checkbox selection component", "component_type": "checkbox"},
        {"id": "alert", "name": "Alert", "description": "Alert or notification banner component", "component_type": "alert"},
        {"id": "select", "name": "Select", "description": "Dropdown select component", "component_type": "select"},
        {"id": "switch", "name": "Switch", "description": "Toggle switch component", "component_type": "switch"},
    ]
