# Golden Dataset for E2E Evaluation

Auto-generated component screenshots for end-to-end pipeline testing.

## Contents

- **11 screenshots** in `screenshots/`
- **11 ground truth files** in `ground_truth/`

## Components

- **Alert**: 2 variants (info, warning)
- **Badge**: 2 variants (success, error)
- **Button**: 3 variants (primary, secondary, outline)
- **Card**: 2 variants (default, with_footer)
- **Checkbox**: 1 variants (default)
- **Input**: 2 variants (text, email)
- **Select**: 1 variants (default)

## Usage

This dataset is used by the E2E evaluator to validate the full screenshot-to-code pipeline:
1. Token extraction accuracy
2. Pattern retrieval accuracy
3. Code generation quality
4. End-to-end pipeline success rate

## Regeneration

To regenerate this dataset:

```bash
cd backend
python scripts/generate_golden_dataset.py
```

## Ground Truth Format

Each ground truth JSON includes:
- `screenshot_id`: Unique identifier
- `expected_tokens`: Design tokens (colors, spacing, typography)
- `expected_pattern_id`: Pattern to retrieve
- `expected_code_properties`: Expected code characteristics

## Notes

- Screenshots are synthetic (created with PIL/Pillow)
- Ground truth is exact (derived from generation code)
- Suitable for automated testing and regression detection
