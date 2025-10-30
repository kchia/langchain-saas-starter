# Evaluation System

Comprehensive end-to-end evaluation framework for the ComponentForge screenshot-to-code pipeline.

## Overview

The evaluation system validates the complete pipeline from screenshot input to valid TypeScript code output:

1. **Token Extraction** - GPT-4V extracts design tokens from screenshots
2. **Pattern Retrieval** - Hybrid BM25+Semantic search selects component patterns
3. **Code Generation** - LLM generates code with TypeScript validation
4. **End-to-End Integration** - Full pipeline with latency and success metrics

## Components

### Golden Dataset

Location: `backend/data/golden_dataset/`

- **15 component screenshots** covering 8 types
- **Ground truth JSON files** with expected tokens, pattern IDs, and code properties
- **Comprehensive coverage**: Button (3), Card (2), Badge (3), Input (2), Checkbox, Radio, Switch, Tabs, Alert (2), Select

See `backend/data/golden_dataset/README.md` for format details.

### Metrics Module

Location: `backend/src/evaluation/metrics.py`

RAGAS-inspired metrics for each stage:

#### Token Extraction Metrics
- **Accuracy**: % of tokens correctly extracted
- **Missing Tokens**: Tokens in ground truth but not extracted
- **Incorrect Tokens**: Tokens extracted with wrong values

#### Retrieval Metrics
- **MRR** (Mean Reciprocal Rank): Context Precision - Target ≥ 0.90
- **Hit@3**: Context Recall - % with correct pattern in top-3 - Target ≥ 90%
- **Precision@1**: Answer Relevancy - % with correct pattern as top result

#### Generation Metrics
- **Compilation Rate**: % of generated code that compiles - Target ≥ 90%
- **Quality Score**: Average quality from validator - Target ≥ 0.85
- **Success Rate**: % of attempts that produced code

#### E2E Metrics
- **Pipeline Success Rate**: % producing valid code end-to-end - Target ≥ 80%
- **Average Latency**: Time from screenshot to code - Target < 20s
- **Stage Failures**: Breakdown by pipeline stage

### E2E Evaluator

Location: `backend/src/evaluation/e2e_evaluator.py`

Orchestrates full pipeline evaluation:
- Loads golden dataset
- Runs each screenshot through all stages
- Collects metrics at each step
- Calculates overall statistics

### Retrieval Queries

Location: `backend/src/evaluation/retrieval_queries.py`

**22 test queries** for isolated retrieval testing:
- **7 keyword queries**: Explicit component names
- **10 semantic queries**: Functional descriptions
- **5 mixed queries**: Keywords + semantics

## Usage

### CLI Script

Run evaluation from terminal:

```bash
cd backend
export OPENAI_API_KEY='your-key-here'
python scripts/run_e2e_evaluation.py
```

Output:
- Formatted terminal display with metrics
- JSON report saved to `backend/logs/e2e_evaluation_{timestamp}.json`
- Exit code 0 if success rate ≥ 80%, else 1

### Automated Tests

Run threshold validation tests:

```bash
cd backend
pytest tests/evaluation/test_e2e_pipeline.py -v -s
```

Tests validate:
- Pipeline success rate ≥ 80%
- Token accuracy ≥ 85%
- Retrieval MRR ≥ 0.90
- Compilation rate ≥ 90%
- E2E latency < 20s

Skip slow tests:
```bash
pytest -m "not slow"
```

### API Endpoints

#### GET /api/v1/evaluation/status

Check system readiness:

```bash
curl http://localhost:8000/api/v1/evaluation/status
```

Returns:
- `ready`: Boolean - system is ready
- `api_key_configured`: Boolean
- `golden_dataset`: Object with stats
- `retrieval_queries`: Object with query counts

#### GET /api/v1/evaluation/metrics

Run full evaluation:

```bash
curl http://localhost:8000/api/v1/evaluation/metrics
```

Returns:
- `overall`: Overall metrics for all stages
- `per_screenshot`: Detailed results per sample
- `retrieval_only`: Isolated retrieval metrics (22 queries)
- `dataset_size`: Number of samples
- `timestamp`: When evaluation ran

**Note**: This endpoint takes several minutes to complete as it runs GPT-4V and code generation for all samples.

### Dashboard

Access visual dashboard:

```
http://localhost:3000/evaluation
```

Features:
- Overall pipeline metrics cards
- Stage-by-stage performance breakdown
- Retrieval comparison table (E2E vs isolated)
- Failure analysis
- Per-screenshot results
- Export JSON button

## Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Pipeline Success Rate | ≥ 80% | Run evaluation to measure |
| Token Extraction Accuracy | ≥ 85% | Run evaluation to measure |
| Retrieval MRR | ≥ 0.90 | Run evaluation to measure |
| Retrieval Hit@3 | ≥ 90% | Run evaluation to measure |
| Code Compilation Rate | ≥ 90% | Run evaluation to measure |
| Code Quality Score | ≥ 0.85 | Run evaluation to measure |
| E2E Latency | < 20s | Run evaluation to measure |

## RAGAS Alignment

Metrics align with industry-standard RAGAS framework:

- **Context Precision** (MRR): Measures retrieval accuracy
- **Context Recall** (Hit@K): Measures retrieval coverage
- **Faithfulness** (Compilation Rate): Measures code validity
- **Answer Relevancy** (Quality Score): Measures code quality

## Files

```
backend/src/evaluation/
├── __init__.py                 # Module exports
├── types.py                    # Result dataclasses
├── metrics.py                  # Metric calculations
├── golden_dataset.py           # Dataset loader
├── e2e_evaluator.py            # Full pipeline evaluator
├── retrieval_queries.py        # Test queries
└── README.md                   # This file

backend/data/golden_dataset/
├── README.md                   # Dataset format
├── screenshots/                # Component screenshots
└── ground_truth/               # Expected results

backend/scripts/
└── run_e2e_evaluation.py       # CLI script

backend/tests/evaluation/
├── test_metrics.py             # Metrics tests
├── test_golden_dataset.py      # Dataset tests
├── test_e2e_evaluator.py       # Evaluator tests
└── test_e2e_pipeline.py        # Threshold validation tests

backend/src/api/v1/routes/
└── evaluation.py               # API endpoints

backend/tests/api/v1/
└── test_evaluation_routes.py   # API tests
```

## Development

### Adding New Ground Truth Samples

1. Obtain screenshot (from shadcn/ui or Figma)
2. Save to `backend/data/golden_dataset/screenshots/{id}.png`
3. Create ground truth JSON at `backend/data/golden_dataset/ground_truth/{id}.json`
4. Follow format in existing files
5. Re-run evaluation

### Adding New Metrics

1. Add calculation method to appropriate metrics class in `metrics.py`
2. Add tests in `tests/evaluation/test_metrics.py`
3. Update `E2EMetrics.calculate_overall_metrics()` to include new metric
4. Update API response structure if needed

### Modifying Thresholds

Update target values in:
- `tests/evaluation/test_e2e_pipeline.py` - Test assertions
- Documentation - Target metrics table
- Dashboard - MetricCard target props

## References

- Epic: `.claude/epics/epic-001-evaluation-framework.md`
- RAGAS Framework: https://docs.ragas.io/
- Bootcamp Week 4: Evaluation lecture notes
- Notebooks: `notebooks/evaluation/` (retrieval metrics)
