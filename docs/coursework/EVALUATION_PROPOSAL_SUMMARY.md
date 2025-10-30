# Evaluation Proposal: Jupyter Notebook Approach for Tasks 5-7

**Student**: Hou Chia
**Project**: ComponentForge (Agentic RAG for Design-to-Code Generation)
**Date**: 2025-10-17

---

## Executive Summary

I propose to complete Tasks 5-7 evaluation using **three Jupyter notebooks**.

---

## Evaluation Approach

### **Task 5: Golden Dataset + RAG Evaluation (RAGAS-Inspired)**

**Deliverable**: Assess pipeline with RAGAS framework; provide results table; draw conclusions

**Evaluation Methodology:**

**1. Golden Dataset Construction**

- **Test Corpus**: 10 curated component patterns (Button, Card, Input, etc.) from existing pattern library
- **Evaluation Queries**: Create 20+ test queries with ground truth (expected pattern matches)
  - Example: Query "Button with variant and size props" → Expected: `shadcn-button` pattern
- **Test Cases**: 6 representative end-to-end runs (screenshot → tokens → requirements → retrieval → code generation)

**2. RAG Evaluation Metrics (RAGAS-Inspired Framework)**

**Why Not Direct RAGAS Implementation?**
The standard RAGAS library (`ragas>=0.1.0`) is designed for **text-based question answering** systems where:

- Inputs are natural language questions
- Outputs are text answers
- Ground truth is reference text answers
- Metrics use LLM-based evaluation (e.g., LLM judges if answer is faithful to context)

ComponentForge generates **TypeScript code components**, not text answers. Direct RAGAS evaluation would require:

```python
# This doesn't fit our use case:
dataset = {
    'question': "Create a button",  # ✓ We have this
    'answer': "<generated TypeScript code>",  # ✓ We have this
    'ground_truth': "<reference answer text>",  # ✗ We don't have text answers
    'contexts': ["Pattern documentation"]  # ✓ We have retrieved patterns
}
```

**Our Approach: RAGAS-Inspired Custom Metrics**
I'll adapt RAGAS **principles** to code generation by creating domain-specific metrics that align with the four RAGAS dimensions:

| RAGAS Principle                                       | Custom Metric (Status)                          | How It's Calculated                                                                                |
| ----------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Context Precision** (Are retrieved docs relevant?)  | Retrieval MRR                                   | Is the correct pattern ranked highly? `MRR = (1/n) * Σ(1/rank_i)`                                  |
| **Context Recall** (Are all relevant docs retrieved?) | Hit@K (pattern found in top-K)                  | Is the correct pattern in top-3 results? `Hit@3 = matches_in_top3 / total_queries`                 |
| **Faithfulness** (Is output grounded in context?)     | TypeScript Compilation % (✅ **Already Built**) | Does generated code compile without errors? Uses `backend/scripts/validate_typescript.js`          |
| **Answer Relevancy** (Does output address the query?) | Token Adherence % (✅ **Already Built**)        | Does generated code use input design tokens? Uses `app/src/services/validation/token-validator.ts` |

**Implementation Status**:

- ✅ **Faithfulness & Answer Relevancy**: Already implemented with production-ready validators
- 🔨 **Context Precision & Recall**: Need to implement retrieval evaluation logic in notebooks

**Future Enhancement**: AST-based pattern similarity (Improvement #7) will strengthen Faithfulness metric beyond compilation checks.

**3. Why This Approach is Rigorous**

- **Ground Truth**: Pre-defined expected results for objective measurement
- **RAGAS Alignment**: Evaluates the same four dimensions (context precision/recall, faithfulness, relevancy) adapted for code generation
- **Multiple Dimensions**: Measures retrieval quality, generation quality, and performance
- **Statistical Rigor**: Confidence intervals, variance analysis across test cases
- **Honest Labeling**: Clearly states these are custom metrics, not claiming to be official RAGAS

**4. Conclusions Derivation**

- Identify strengths: Which metrics exceed targets? Why?
- Identify gaps: Which metrics fall short? Root cause analysis
- Production readiness: Synthesize findings to assess real-world viability

---

### **Task 6: Advanced Retrieval Techniques**

**Deliverable**: Swap out base retriever with advanced methods

**Evaluation Methodology:**

**1. Baseline Establishment**

- **Naive RAG**: Semantic-only retrieval (query → OpenAI embedding → Qdrant vector search → top-K patterns)
- **Test on 10 queries**: Measure MRR, Hit@3, latency as baseline

**2. Advanced Techniques Implementation**

**Technique #1: BM25 Lexical Retrieval**

- **What**: Keyword-based search with multi-field weighting (component name 3x, category 2x, props 1.5x, description 1x)
- **Why**: Exact keyword matches (e.g., "Button component") should rank higher than semantic-only
- **How Tested**: Same 10 queries, compare MRR to baseline

**Technique #2: Query Enhancement**

- **What**: Transform structured requirements → rich natural language for better embeddings
- **Why**: `{component_type: "Button"}` (JSON) embeds poorly vs "A Button component for user actions..." (natural language)
- **How Tested**: Measure MRR improvement from enhanced queries

**Technique #3: Hybrid Fusion**

- **What**: Weighted combination (0.3 BM25 + 0.7 semantic) after score normalization
- **Why**: Combine keyword precision (BM25) with semantic understanding (embeddings)
- **How Tested**: Measure MRR on all queries, show improvement over individual methods

**Technique #4: Explainability Layer**

- **What**: Confidence scoring + match highlighting (which props/variants matched?)
- **Why**: Users need to understand WHY a pattern was recommended
- **How Tested**: Display sample explanations, assess clarity

**Technique #5: RAG-Fusion (Experimental)**

- **What**: Query expansion with LLM → multi-retrieval → Reciprocal Rank Fusion
- **Why**: Test if query variations improve accuracy for our use case
- **How Tested**: Measure MRR, latency, cost vs baseline
- **Expected Outcome**: Document whether it helps/hurts (negative results are valid!)

**3. Comparative Evaluation**

- **Side-by-Side Table**: All 5 techniques tested on same queries
- **Metrics**: MRR, Hit@3, Latency for each method
- **Analysis**: Where does each technique excel? (keyword queries, semantic queries, mixed)

**4. Architectural Justification**

- **Evidence-Based Decision**: Choose final architecture based on measured performance
- **Trade-off Analysis**: Accuracy vs latency, complexity vs benefit

---

### **Task 7: Performance Assessment + Future Roadmap**

**Deliverable**: Compare naive vs advanced RAG; quantify improvements; articulate future changes

**Evaluation Methodology:**

**1. Controlled A/B Testing**

- **System A (Naive RAG)**: Semantic-only retrieval (baseline from Task 6)
- **System B (Advanced RAG)**: Hybrid fusion with explainability (best from Task 6)
- **Test Set**: Same 20+ queries used in Task 5 (controlled comparison)

**2. Comprehensive Performance Comparison**

**Retrieval Quality (RAGAS-Inspired Metrics)**

- **Context Precision**: Compare MRR between systems
- **Context Recall**: Compare Hit@3 between systems
- Test both systems on same queries, calculate improvements

**Generation Quality (RAGAS-Inspired Metrics)**

- **Faithfulness**: Compare Pattern Adherence Score (does better retrieval → better code?)
- **Answer Relevancy**: Compare token adherence % (does better pattern → better token usage?)

**Performance Metrics**

- **Latency**: Retrieval time, total generation time (p50, p95)
- **Cost**: API cost per query (naive vs advanced)

**3. Query Type Breakdown**
Analyze where improvements occur:

- **Keyword queries** (e.g., "Button component"): Expect BM25 to shine
- **Semantic queries** (e.g., "clickable action element"): Expect embeddings to shine
- **Mixed queries** (e.g., "Button with variant prop"): Expect fusion to shine

**4. Statistical Validation**

- **Paired t-test**: Are improvements statistically significant (α=0.05)?
- **Effect size**: How large are the improvements in practical terms?

**5. Future Improvements (Data-Driven)**
Based on evaluation gaps, propose 7 improvements:

| Improvement                   | Gap Identified                            | Proposed Solution                     | Measurable Target         | Validation Method                   |
| ----------------------------- | ----------------------------------------- | ------------------------------------- | ------------------------- | ----------------------------------- |
| #1 Enhanced Token Extraction  | If token adherence < 90%                  | Refine GPT-4V prompts, multi-sampling | Token adherence ≥ 90%     | Re-run Answer Relevancy metric      |
| #2 Fine-Tuned Embeddings      | If MRR < 0.95 on domain queries           | Fine-tune on component library docs   | MRR ≥ 0.95                | A/B test general vs fine-tuned      |
| #3 Cross-Encoder Re-Ranking   | If Precision@1 < 0.95                     | Add re-ranking stage after fusion     | Precision@1 ≥ 0.95        | Measure "close but wrong" reduction |
| #4 Expand Pattern Library     | If Hit@3 < 0.98                           | Curate 40+ more patterns              | Hit@3 ≥ 0.98              | Measure on expanded query set       |
| #5 Multi-Level Caching        | If p50 latency > 30s                      | L1 exact cache + L2 partial cache     | p50 ≤ 15s (20% hit rate)  | Measure cache hit rate, latency     |
| #6 User Feedback Loop         | No real-world quality data                | Rating system + analytics dashboard   | User satisfaction ≥ 4.5/5 | Correlation: confidence vs ratings  |
| **#7 AST Pattern Similarity** | TypeScript compilation only checks syntax | Implement AST-based pattern matching  | Pattern Adherence ≥ 0.90  | Compare with compilation results    |

**Key Principle**: Each improvement addresses a **measured gap** from evaluation, not hypothetical concerns

---

## Why This Evaluation Approach?

### Rigor & Validity:

- **Ground Truth Dataset**: Pre-defined expected results enable objective measurement
- **RAGAS-Inspired Framework**: Industry-standard RAG evaluation principles adapted to code generation domain
- **Controlled Comparison**: A/B testing isolates impact of retrieval improvements
- **Statistical Validation**: Paired t-tests confirm improvements are significant, not random
- **Multiple Dimensions**: Measures retrieval quality, generation quality, and performance
- **Honest Methodology**: Clearly states metrics are custom adaptations, not claiming official RAGAS compliance

### Transparency & Reproducibility:

- **Executable Code**: All metric calculations shown, not just claimed
- **Same Test Set**: All techniques tested on identical queries for fair comparison
- **Evidence-Based**: Architecture decisions justified by measured performance
- **Negative Results Welcome**: RAG-Fusion experiment shows willingness to test and reject ideas

---

## Deliverables Mapped to Methodology

| Task       | Required Deliverable          | My Approach                                                                                                                                                          |
| ---------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Task 5** | RAGAS metrics table           | Golden dataset (20+ queries) → Calculate custom metrics using **existing validators** (TypeScript, Token) + new retrieval metrics (MRR, Hit@3) → Present in 3 tables |
| **Task 5** | Conclusions about performance | Statistical analysis → Identify strengths/gaps → Assess production readiness → Identify AST similarity as future enhancement                                         |
| **Task 6** | Advanced retrieval methods    | Implement 5 techniques (BM25, enhancement, fusion, explainability, RAG-Fusion) → Comparative testing → Evidence-based justification                                  |
| **Task 7** | Performance comparison table  | A/B test (naive vs advanced) → RAGAS-inspired metrics for both → Statistical significance testing                                                                    |
| **Task 7** | Future improvements           | Identify gaps from evaluation → **7** data-driven improvements with measurable targets                                                                               |

---

## What Makes This Approach Rigorous?

**Task 5:**

- ✅ RAGAS principles adapted to code generation with honest labeling
- ✅ Multiple evaluation dimensions (retrieval + generation + performance)
- ✅ Ground truth enables objective measurement
- ✅ Statistical analysis (confidence intervals, variance)
- ✅ AST-based faithfulness measurement (not just compilation)

**Task 6:**

- ✅ Controlled baseline for fair comparison
- ✅ Each technique tested incrementally
- ✅ Same queries across all methods
- ✅ Willing to document failures (RAG-Fusion)

**Task 7:**

- ✅ A/B methodology isolates retrieval impact
- ✅ Statistical significance testing (not just raw numbers)
- ✅ Query type breakdown (keyword, semantic, mixed)
- ✅ Future improvements tied to measured gaps
