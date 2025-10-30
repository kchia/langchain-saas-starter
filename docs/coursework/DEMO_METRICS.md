# ComponentForge Evaluation Metrics (Demo Day)

## Proven End-to-End Performance

ComponentForge validates the **complete screenshot-to-code pipeline** with quantified metrics aligned to industry-standard RAGAS framework.

## Quick Demo Flow

1. **Show Golden Dataset** (`backend/data/golden_dataset/`)
   - 15 component screenshots with ground truth
   - Covers 8 component types: Button, Card, Badge, Input, Checkbox, Alert, Select, Switch

2. **Run CLI Evaluation** (`python backend/scripts/run_e2e_evaluation.py`)
   - Live terminal output with formatted metrics
   - Stage-by-stage performance breakdown
   - JSON report export

3. **Show Dashboard** (`http://localhost:3000/evaluation`)
   - Visual metrics display
   - E2E vs retrieval-only comparison
   - Per-screenshot results

4. **Highlight API** (`GET /api/v1/evaluation/metrics`)
   - Programmatic access to metrics
   - Real-time evaluation status

## Key Talking Points

### 1. End-to-End Pipeline Success

**Metric**: Pipeline Success Rate
- **What it means**: % of screenshots that produce valid, compilable TypeScript code through the full pipeline
- **Target**: ≥ 80%
- **Achieved**: *[Run evaluation to measure]*

**Why it matters**: This is the only metric that truly validates the user experience - from screenshot upload to production-ready code.

### 2. Token Extraction Accuracy

**Metric**: Token Extraction Accuracy
- **What it means**: % of design tokens (colors, spacing, typography) correctly extracted from screenshots by GPT-4V
- **Target**: ≥ 85%
- **Achieved**: *[Run evaluation to measure]*

**Why it matters**: Accurate token extraction ensures generated code matches the design visually.

### 3. Pattern Retrieval Performance

**Metrics**:
- **MRR** (Mean Reciprocal Rank): Context Precision - Target ≥ 0.90
- **Hit@3**: Context Recall - Target ≥ 90%
- **Precision@1**: Top-1 Accuracy - *[Run evaluation to measure]*

**Achieved**: *[Run evaluation to measure]*

**Why it matters**: Correct pattern selection is critical - wrong pattern means wrong component structure, regardless of token accuracy.

**Bonus**: We test retrieval in two ways:
1. **E2E**: Real screenshots with extracted tokens
2. **Isolated**: 22 hand-crafted queries (keyword, semantic, mixed)

This dual approach catches both integration and component-level issues.

### 4. Code Generation Quality

**Metrics**:
- **Compilation Rate**: % of code that compiles - Target ≥ 90%
- **Quality Score**: Average quality from validator - Target ≥ 0.85
- **Success Rate**: % that produced code

**Achieved**: *[Run evaluation to measure]*

**Why it matters**: Generated code must be production-ready - no manual fixes required.

### 5. Performance (Latency)

**Metric**: Average E2E Latency
- **Target**: < 20 seconds
- **Achieved**: *[Run evaluation to measure]*

**Why it matters**: User experience depends on reasonable response times. Sub-20s keeps users engaged.

## RAGAS Alignment

All metrics align with industry-standard RAGAS framework:

| RAGAS Metric | Our Implementation | Target | Achieved |
|--------------|-------------------|--------|----------|
| **Context Precision** | MRR (retrieval rank) | ≥ 0.70 | *[Run eval]* |
| **Context Recall** | Hit@3 (top-3 accuracy) | ≥ 0.80 | *[Run eval]* |
| **Faithfulness** | Compilation Rate | ≥ 0.90 | *[Run eval]* |
| **Answer Relevancy** | Quality Score | ≥ 0.85 | *[Run eval]* |

**Why RAGAS?** It's the industry standard for RAG evaluation. Using it makes our metrics instantly understandable to ML engineers.

## Continuous Validation

### 1. Golden Dataset
- 15 real component screenshots
- Ground truth with expected tokens, patterns, and code properties
- Covers diverse component types and variants

### 2. Automated Tests
```bash
pytest backend/tests/evaluation/test_e2e_pipeline.py -v
```
- Fails if metrics drop below thresholds
- Can run in CI/CD
- Prevents regression

### 3. CLI Script
```bash
python backend/scripts/run_e2e_evaluation.py
```
- Human-readable terminal output
- JSON report export
- Exit codes for automation

### 4. API Endpoint
```bash
curl http://localhost:8000/api/v1/evaluation/metrics
```
- Programmatic access
- Real-time metrics
- Integrates with monitoring

### 5. Dashboard
```
http://localhost:3000/evaluation
```
- Visual metrics display
- Stage-by-stage breakdown
- Export functionality

## Demo Script

### Before Running Evaluation

**Set the stage:**
> "Let me show you how we validate our entire pipeline - not just isolated components, but the real end-to-end flow from screenshot to production code."

### Golden Dataset

**Show screenshots directory:**
```bash
ls backend/data/golden_dataset/screenshots/
```

**Show one ground truth file:**
```bash
cat backend/data/golden_dataset/ground_truth/button_primary.json
```

**Explain:**
> "We have 15 component screenshots with ground truth. Each defines exactly what tokens should be extracted, which pattern should be retrieved, and what properties the generated code must have."

### Run CLI Evaluation

```bash
cd backend
export OPENAI_API_KEY='***'
python scripts/run_e2e_evaluation.py
```

**While running (takes 2-5 minutes):**
> "This is running the full pipeline for all 15 screenshots:
> 1. GPT-4V extracts design tokens
> 2. Hybrid search retrieves the best pattern
> 3. LLM generates TypeScript code
> 4. TypeScript compiler validates it
>
> Notice we're also running 22 additional retrieval-only queries to isolate that component."

**When complete, highlight:**
- Pipeline success rate
- Stage-by-stage metrics
- JSON report saved to logs/

### Show Dashboard

Navigate to `http://localhost:3000/evaluation`

**Highlight sections:**
1. **Overall metrics** - Three key cards
2. **Stage-by-stage** - Granular performance
3. **Retrieval comparison** - E2E vs isolated
4. **Per-screenshot results** - Debugging view

**Demonstrate Export JSON**

### API Endpoint

```bash
curl http://localhost:8000/api/v1/evaluation/metrics | jq '.overall'
```

**Explain:**
> "Everything you see in the UI is accessible via REST API. You could monitor these metrics in production, trigger evaluations on PR merges, or integrate with your existing observability stack."

### Automated Tests

```bash
pytest backend/tests/evaluation/test_e2e_pipeline.py::test_e2e_pipeline_success_rate -v
```

**Explain:**
> "Our CI runs these tests. If pipeline success drops below 80%, the build fails. This catches regressions before they reach users."

## Addressing Questions

### Q: "Why not just test retrieval?"

**A:** "We did test retrieval in isolation - MRR was 0.913 in our notebooks. But that doesn't tell us if the **full pipeline** works. What if token extraction fails? What if code generation introduces bugs? E2E testing is the only way to validate the real user experience."

### Q: "How do you ensure ground truth accuracy?"

**A:** "Ground truth is manually curated from shadcn/ui documentation and validated against actual component implementations. Each screenshot has expected tokens, pattern IDs, and code properties that we verify during dataset creation."

### Q: "What happens if metrics drop?"

**A:** "Three lines of defense:
1. **CI tests fail** - Blocks PR merge
2. **Dashboard shows red** - Visual alert
3. **CLI returns exit code 1** - Automation can trigger alerts

This gives us confidence to iterate fast without breaking production."

### Q: "Can you evaluate new components?"

**A:** "Absolutely. Just add:
1. Screenshot to `screenshots/`
2. Ground truth JSON to `ground_truth/`
3. Re-run evaluation

Takes 5 minutes to add, instantly included in all future evaluations."

## Conclusion

**Wrap up:**
> "ComponentForge doesn't just generate code - we **prove** it works. With end-to-end evaluation, RAGAS-aligned metrics, and continuous validation, we have confidence that our pipeline produces production-ready components. Every single time."

**Final stat to leave with:**
> "Pipeline Success Rate: [X%] - That's [Y] out of [Z] screenshots producing valid, compilable, high-quality TypeScript code with zero manual intervention."

## Post-Demo: Next Steps

If they're interested, mention:

1. **Expand golden dataset** - Add more component types and variants
2. **A/B test prompts** - Compare different LLM prompts using same metrics
3. **Production monitoring** - API endpoint in production for real-time metrics
4. **User feedback loop** - Collect actual generated components for ground truth

## Files to Have Ready

- Epic document: `.claude/epics/epic-001-evaluation-framework.md`
- Evaluation README: `backend/src/evaluation/README.md`
- Golden dataset README: `backend/data/golden_dataset/README.md`
- Latest evaluation report: `backend/logs/e2e_evaluation_*.json`
- Screenshots of dashboard for slides

## Slide Deck Outline

**Slide 1**: Title - ComponentForge Evaluation System

**Slide 2**: Problem - "How do we know the pipeline works?"

**Slide 3**: Solution - E2E evaluation framework

**Slide 4**: Architecture diagram - Screenshot → Tokens → Retrieval → Generation → Code

**Slide 5**: Golden dataset - 15 samples, 8 component types

**Slide 6**: RAGAS metrics alignment table

**Slide 7**: Results - Key metrics with targets vs achieved

**Slide 8**: Stage-by-stage breakdown

**Slide 9**: Continuous validation - 4 ways to run evaluation

**Slide 10**: Dashboard screenshot

**Slide 11**: Conclusion & impact

