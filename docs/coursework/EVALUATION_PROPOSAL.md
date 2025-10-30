# Evaluation Proposal: Jupyter Notebook-Based Assessment for Tasks 5-7

**Project**: ComponentForge - End-to-End Agentic RAG Application
**Student**: Hou Chia
**Date**: 2025-10-17
**Course**: AI Engineering

---

## Executive Summary

I propose to complete the evaluation requirements for **Tasks 5-7** using **Jupyter notebooks** instead of static documentation. This approach provides:

1. **Reproducibility**: Graders can execute code cells and verify results
2. **Transparency**: All code, data, and outputs are visible in one place
3. **Visual Evidence**: Tables, charts, and metrics displayed inline
4. **Professional Standard**: Industry-standard format for ML/AI evaluation
5. **Easier Grading**: Clear mapping between notebook sections and deliverables

This proposal outlines three core notebooks that directly map to the stated deliverables in `AI_ENGINEERING_TASKS.md`. Each notebook section below describes the **planned methodology**—actual results will be generated during notebook execution.

---

## Proposed Notebook Structure

### **Notebook 1: `task5_golden_dataset_rag_evaluation.ipynb`**

#### **Maps to Task 5 Deliverables**

**Deliverable 1**:
> "Assess your pipeline using the RAGAS framework including key metrics faithfulness, response relevance, context precision, and context recall. Provide a table of your output results."

**Deliverable 2**:
> "What conclusions can you draw about the performance and effectiveness of your pipeline with this information?"

#### **How This Notebook Satisfies Requirements**

This notebook addresses both Task 5 deliverables by:

1. **Establishing a golden test dataset** of component patterns and evaluation queries that serve as ground truth for measuring pipeline quality
2. **Adapting RAGAS evaluation principles to code generation** (see detailed explanation in Section 3):
   - **Context Precision** → Retrieval accuracy (MRR: is the correct pattern ranked highly?)
   - **Context Recall** → Retrieval coverage (Hit@K: is the correct pattern found in top-K?)
   - **Faithfulness** → Pattern Adherence Score (does generated code use the retrieved pattern's structure via AST similarity?)
   - **Answer Relevancy** → Token adherence (does generated code use the input design tokens?)
3. **Executing the complete pipeline** on test cases and calculating all four metrics with executable code
4. **Presenting results in tabular format** as required by Deliverable 1
5. **Analyzing results to draw conclusions** about pipeline performance and effectiveness (Deliverable 2)

**Critical Methodology Note**: The deliverable requests "RAGAS framework" assessment. However, the standard RAGAS library (`ragas>=0.1.0`) is designed for **text-based question answering**, not code generation. This notebook will use **RAGAS-inspired custom metrics** that adapt the four RAGAS evaluation dimensions to the code generation domain. Section 3 provides detailed justification for this adaptation.

#### **Approach**

The notebook will follow a systematic evaluation methodology:

1. **Define Golden Dataset**: Curate 20+ test queries with expected pattern matches, using the 10 existing component patterns as retrieval targets
2. **Run Pipeline**: Execute end-to-end generation (screenshot → tokens → requirements → retrieval → code) on representative test cases
3. **Calculate RAGAS Metrics**: Implement formulas for each metric with transparent, executable code
4. **Generate Results Tables**: Present all metrics in tables for easy comparison against targets
5. **Statistical Analysis**: Calculate confidence intervals and identify patterns in successes/failures
6. **Draw Conclusions**: Analyze strengths, weaknesses, and overall pipeline effectiveness based on quantitative evidence

#### **Notebook Contents**

**Section 1: Golden Dataset Creation** (Deliverable setup)
- **1.1 Pattern Library**: Display the 10 curated shadcn/ui component patterns that serve as retrieval targets
- **1.2 Exemplars**: Show reference implementations from `backend/data/exemplars/` that define "gold standard" outputs
- **1.3 Test Queries**: Define 20+ evaluation queries with expected results (component type, props, variants)
- **1.4 Dataset Validation**: Verify all patterns compile (TypeScript strict) and pass accessibility tests

**Section 2: Pipeline Execution** (Evidence generation)
- **2.1 End-to-End Runs**: Execute complete pipeline (screenshot → tokens → requirements → retrieval → generation) on 6 representative test cases
- **2.2 Sample Outputs**: Display generated code for Button, Card, and Input components
- **2.3 Intermediate Results**: Show token extraction, requirement analysis, and retrieval results for transparency

**Section 3: RAG Evaluation Metrics (RAGAS-Inspired Framework)** (Deliverable 1)

**3.0 Why Custom Metrics Instead of Standard RAGAS?**

The RAGAS library (`ragas>=0.1.0`) is designed for **text-based question answering** systems:

```python
# Standard RAGAS expects this data structure:
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall

dataset = {
    'question': ["What is the capital of France?"],
    'answer': ["Paris is the capital of France"],  # Text answer
    'ground_truth': ["Paris"],  # Reference text answer
    'contexts': [["France is a country... Paris is its capital..."]]
}

results = evaluate(dataset, metrics=[faithfulness, answer_relevancy])
```

**ComponentForge generates TypeScript code, not text answers**. Key differences:

| RAGAS Assumption | ComponentForge Reality |
|------------------|------------------------|
| Output is text answer | Output is TypeScript code |
| Faithfulness = LLM checks if answer is grounded in context docs | Faithfulness = code structurally matches retrieved pattern |
| Answer Relevancy = LLM checks if answer addresses question | Answer Relevancy = code uses input design tokens |
| Ground truth = reference text answer | Ground truth = expected pattern ID + design tokens |

**Our Approach**: Adapt RAGAS **evaluation principles** (4 dimensions of RAG quality) to code generation with custom metrics.

**3.1 Context Precision** (RAGAS Principle: Are retrieved documents relevant?)
- **Custom Metric**: Mean Reciprocal Rank (MRR) for retrieval accuracy
  - Formula: `MRR = (1/n) * Σ(1/rank_i)` where rank_i is the position of the correct pattern for query i
  - Implementation: Run hybrid retrieval on all test queries, record rank of expected pattern
  - Target threshold: MRR ≥ 0.75 indicates good retrieval precision
  - **Why this aligns with RAGAS**: MRR measures if the most relevant pattern appears early in results, same goal as Context Precision

**3.2 Context Recall** (RAGAS Principle: Are all relevant documents retrieved?)
- **Custom Metric**: Hit@K metrics (correct pattern found in top-K results)
  - Formula: `Hit@K = (count of queries where correct pattern in top-K) / total queries`
  - Implementation: Check if expected pattern ID appears in top-3 and top-5 retrieval results
  - Target threshold: Hit@3 ≥ 0.85 indicates good retrieval coverage
  - **Why this aligns with RAGAS**: Hit@K measures if the correct pattern is retrieved at all, same goal as Context Recall

**3.3 Faithfulness** (RAGAS Principle: Is output grounded in retrieved context?)
- **Custom Metric**: TypeScript Strict Compilation Rate (with future AST enhancement)
  - **Current Implementation (Already Built)**: Uses existing `backend/scripts/validate_typescript.js`
    ```bash
    # Runs TypeScript compiler in strict mode
    echo "$generated_code" | node backend/scripts/validate_typescript.js
    # Returns: { valid: true/false, errors: [], warnings: [] }
    ```
  - **What it measures**: Does generated code compile without errors in TypeScript strict mode?
  - **Why this indicates faithfulness**: Code that compiles correctly likely uses the pattern's types, props, and structure appropriately
  - **Target threshold**: 100% compilation rate (all generated components must compile)
  - **Limitation**: Compilation only checks syntax/types, not semantic similarity to the pattern
  - **Future Enhancement** (See Task 7 Improvement #7): Add AST-based Pattern Adherence Score
    ```python
    # Proposed future metric (not yet implemented):
    def measure_pattern_similarity(generated_code, retrieved_pattern):
        gen_ast = parse_typescript(generated_code)
        pattern_ast = parse_typescript(retrieved_pattern['code'])

        import_match = check_imports_match(gen_ast, pattern_ast)
        props_match = check_props_match(gen_ast, pattern_ast)
        structure_match = check_component_structure(gen_ast, pattern_ast)

        return (import_match + props_match + structure_match) / 3
    ```
  - **Why this aligns with RAGAS**: Compilation ensures code is syntactically grounded in TypeScript patterns, analogous to faithfulness. Future AST similarity would strengthen this metric.

**3.4 Answer Relevancy** (RAGAS Principle: Does output address the input query?)
- **Custom Metric**: Token Adherence Percentage
  - **Current Implementation (Already Built)**: Uses existing `app/src/services/validation/token-validator.ts`
    ```typescript
    // Existing TokenValidator.validate() returns:
    {
      valid: true/false,
      adherenceScore: 95.2,  // Overall percentage
      byCategory: {
        colors: 98,       // Color token adherence
        typography: 92,   // Typography adherence
        spacing: 95       // Spacing adherence
      }
    }
    ```
  - **What it measures**:
    - Colors: Delta E ≤2 tolerance for color matching
    - Typography: Font families, sizes, and weights match design tokens
    - Spacing: Padding, margin, gap values match design tokens
  - **Calculation**: `Overall = (color_score + typography_score + spacing_score) / 3`
  - **Target threshold**: ≥90% adherence indicates high relevancy to user inputs
  - **Why this aligns with RAGAS**: Checks if generated code addresses the user's design requirements (input tokens), analogous to answer relevancy

**Section 4: Results Tables** (Deliverable 1 - Required output format)

The notebook will generate three tables presenting RAGAS metric results:

**Table 1: RAG Evaluation Metrics Summary (RAGAS-Inspired)**
| RAGAS Principle           | Custom Metric (Implementation Status) | Target | Measured Result | Status |
|---------------------------|---------------------------------------|--------|-----------------|--------|
| Context Precision         | Retrieval MRR                         | ≥0.75  | [to be calculated] | [to be determined] |
| Context Recall            | Hit@3                                 | ≥0.85  | [to be calculated] | [to be determined] |
| Faithfulness              | TypeScript Compilation % (✅ Built)   | 100%   | [to be calculated] | [to be determined] |
| Answer Relevancy          | Token Adherence % (✅ Built)          | ≥90%   | [to be calculated] | [to be determined] |

**Methodology Note**: These are custom metrics that adapt RAGAS evaluation principles to code generation, not direct RAGAS library implementation.

**Implementation Note**: Faithfulness and Answer Relevancy metrics use existing validation infrastructure (`validate_typescript.js` and `token-validator.ts`). Context Precision/Recall require implementing retrieval evaluation logic.

**Table 2: Per-Component Breakdown** (showing metric variation across test cases)
| Test Case              | MRR | Hit@3 | TypeScript Compiles | Token Adherence % |
|------------------------|-----|-------|---------------------|-------------------|
| Button Generation      | ... | ...   | ✅/❌               | ...               |
| Card Generation        | ... | ...   | ✅/❌               | ...               |
| [Additional test cases]| ... | ...   | ✅/❌               | ...               |
| **Average/Rate**       | ... | ...   | ...%                | ...               |

**Table 3: Performance Benchmarks** (supplementary metrics)
| Metric              | Target | Measured Result |
|---------------------|--------|-----------------|
| Retrieval Latency   | <1s    | [to be measured] |
| Generation p50      | ≤60s   | [to be measured] |
| Generation p95      | ≤90s   | [to be measured] |
| Success Rate        | ≥95%   | [to be measured] |

**Section 5: Visualizations** (Supporting evidence)
- Bar chart: RAG evaluation metrics (measured vs target) for all four dimensions
- Distribution plot: Generation latency across test cases
- Heatmap: Per-component metric breakdown showing variation
- Radar chart: Four-dimension evaluation (Context Precision, Context Recall, Faithfulness, Relevancy)

**Section 6: Conclusions & Analysis** (Deliverable 2)

This section will analyze the results and draw conclusions about pipeline performance:

**6.1 Strengths Identification**
- Identify which RAGAS metrics exceed targets and what this indicates about system capabilities
- Analyze patterns in successful test cases to understand when the pipeline performs well
- Assess retrieval quality (Context Precision/Recall) and its impact on downstream generation

**6.2 Weaknesses & Gaps**
- Identify metrics that fall short of targets and diagnose root causes
- Analyze failure patterns to understand when and why the pipeline struggles
- Assess generation quality (Faithfulness/Relevancy) issues and trace back to pipeline stages

**6.3 Statistical Analysis**
- Calculate confidence intervals for key metrics to assess measurement reliability
- Identify statistically significant patterns in successes vs failures
- Assess variance across test cases to understand consistency

**6.4 Overall Effectiveness Assessment**
- Synthesize findings to evaluate whether the pipeline is production-ready
- Compare results against industry benchmarks for RAG systems
- Articulate the user value proposition based on measured performance
- Identify priority areas for improvement based on quantitative evidence

---

### **Notebook 2: `task6_advanced_retrieval_techniques.ipynb`**

#### **Maps to Task 6 Deliverable**

**Deliverable**:
> "Swap out base retriever with advanced retrieval methods."

#### **How This Notebook Satisfies Requirements**

This notebook addresses the Task 6 deliverable by:

1. **Implementing a baseline naive retriever** (semantic-only vector search) to establish a control for comparison
2. **Developing and implementing multiple advanced retrieval techniques**:
   - BM25 lexical retrieval with multi-field weighting
   - Query enhancement for better semantic embeddings
   - Hybrid fusion combining BM25 and semantic search
   - Explainability layer with confidence scoring
3. **Testing each technique** with the same set of queries to demonstrate improvements
4. **Providing comparative analysis** showing how each advanced method performs vs. the baseline
5. **Justifying architectural choices** with empirical evidence

#### **Approach**

The notebook demonstrates an iterative refinement process:

1. **Establish Baseline**: Implement simple semantic vector search as the naive retriever
2. **Iterative Enhancement**: Add each advanced technique incrementally, measuring impact
3. **Comparative Testing**: Run all methods on identical test queries for fair comparison
4. **Empirical Justification**: Use measured metrics (MRR, Hit@K, latency) to justify each technique
5. **Document Trade-offs**: Analyze accuracy vs. latency, complexity vs. benefit for each method

#### **Notebook Contents**

**Section 1: Baseline Implementation** (Establishing control)
- **1.1 Naive Semantic Retriever**: Implement simple vector search using OpenAI embeddings + Qdrant
  - Implementation approach: Embed query → search vector database → return top-K by cosine similarity
  - Test on 10 representative queries, display ranked results
  - Measure baseline metrics: MRR, Hit@3, latency

**Section 2: Advanced Technique #1 - BM25 Lexical Retrieval**
- **2.1 Implementation**: BM25 with multi-field weighting
  - Create weighted documents by repeating terms (name 3x, category 2x, props 1.5x, description 1x)
  - Rationale: Component name is strongest signal, prevents long descriptions from dominating scores
  - Use BM25 parameters: k1=1.5 (term frequency saturation), b=0.75 (length normalization)
- **2.2 Testing**: Run on same 10 queries as baseline
  - Compare results: Show where BM25 excels (keyword matches) vs struggles (semantic queries)
  - Example analysis: Keyword query "Button component" vs semantic query "clickable action element"
- **2.3 Analysis**: Assess BM25 strengths (exact matching) and limitations (misses synonyms/concepts)

**Section 3: Advanced Technique #2 - Query Enhancement**
- **3.1 Implementation**: Transform structured requirements into rich natural language
  - Example: `{component_type: "Button", props: ["variant"]}` → "A Button component with variant prop for visual styles..."
  - Rationale: Natural language embeds better than JSON strings, adds implicit semantic context
- **3.2 Testing**: Compare enhanced vs raw query embeddings
  - Measure: MRR improvement, similarity score changes
- **3.3 Visualization**: t-SNE plot showing enhanced queries cluster closer to relevant patterns

**Section 4: Advanced Technique #3 - Hybrid Fusion**
- **4.1 Implementation**: Weighted combination of BM25 and semantic scores
  - Score normalization: Min-max scaling to [0,1] range for fair combination
  - Weight tuning: Test multiple weight combinations (0.5/0.5, 0.3/0.7, 0.2/0.8)
  - Rationale: Combine keyword precision (BM25) with semantic understanding (embeddings)
- **4.2 Testing**: Run on all test queries
  - Measure: MRR, Hit@3 vs baseline and individual methods
- **4.3 Example Analysis**: Show how fusion resolves ambiguous queries where BM25 and semantic disagree

**Section 5: Advanced Technique #4 - Explainability Layer**
- **5.1 Implementation**: Confidence scoring and match highlighting
  - Confidence formula: Based on score magnitude, feature alignment, and gap to second-best result
  - Explanation generation: Cite matched props, variants, accessibility features from metadata
- **5.2 Example Output**: Display sample explanation with highlighted matching features
- **5.3 Value Proposition**: Discuss benefits for user trust, debugging, and refinement

**Section 6: Advanced Technique #5 - RAG-Fusion (Experimental Exploration)**
- **6.1 Hypothesis**: Query expansion with Reciprocal Rank Fusion might improve accuracy
- **6.2 Implementation**: Generate query variations with LLM, retrieve for each, combine with RRF
  - Code: `variations = llm.generate_variations(query)` → multi-retrieval → RRF scoring
  - RRF formula: `score = Σ 1/(k + rank)` where k=60
- **6.3 Evaluation**: Test RAG-Fusion against baseline hybrid fusion
  - Measure: Accuracy (MRR), latency, cost per query
- **6.4 Analysis**: Determine if RAG-Fusion improves results for this specific use case
  - Discuss when/why it might succeed or fail
  - Consider query characteristics (structured vs ambiguous, domain-specific vs general)
- **6.5 Conclusion**: Document decision to adopt or reject based on empirical evidence

**Section 7: Comparative Summary**
- **7.1 Results Table**: All techniques on same test queries
  | Query Type | Naive | BM25 | Enhanced | Hybrid | RAG-Fusion | Latency |
  |------------|-------|------|----------|--------|------------|---------|
  | Keyword    | ...   | ...  | ...      | ...    | ...        | ...     |
  | Semantic   | ...   | ...  | ...      | ...    | ...        | ...     |
  | Mixed      | ...   | ...  | ...      | ...    | ...        | ...     |
  | **Average**| ...   | ...  | ...      | ...    | ...        | ...     |

- **7.2 Visualization**: Grouped bar chart comparing all methods across metrics

**Section 8: Architecture Justification**
- Synthesize findings to explain chosen architecture
- Discuss trade-offs: accuracy vs latency, simplicity vs sophistication
- Articulate when each technique adds value for this specific use case

---

### **Notebook 3: `task7_performance_assessment.ipynb`**

#### **Maps to Task 7 Deliverables**

**Deliverable 1**:
> "How does the performance compare to your original RAG application? Test the new retrieval pipeline using the RAGAS frameworks to quantify any improvements. Provide results in a table."

**Deliverable 2**:
> "Articulate the changes that you expect to make to your app in the second half of the course. How will you improve your application?"

#### **How This Notebook Satisfies Requirements**

This notebook addresses both Task 7 deliverables by:

1. **Conducting rigorous A/B comparison** between the naive baseline RAG (semantic-only) and the advanced retrieval system (hybrid fusion)
2. **Testing both systems** on the same evaluation dataset to ensure fair comparison
3. **Applying RAGAS metrics** (Context Precision, Context Recall, Faithfulness, Answer Relevancy) to both systems
4. **Quantifying improvements** with statistical significance testing to validate that gains are meaningful
5. **Presenting comparative results in tables** as required by Deliverable 1
6. **Articulating a detailed improvement roadmap** with 6 planned enhancements, measurable targets, and timelines (Deliverable 2)

#### **Approach**

The notebook will follow a comparative evaluation methodology:

1. **Controlled A/B Testing**: Run both systems (naive vs advanced) on identical test queries to isolate the impact of retrieval improvements
2. **Comprehensive Metrics**: Measure retrieval quality (MRR, Hit@K), generation quality (TypeScript%, token adherence), and performance (latency)
3. **Statistical Validation**: Use paired t-tests to determine if observed improvements are statistically significant
4. **Query Categorization**: Analyze performance by query type (keyword, semantic, mixed) to understand where improvements occur
5. **Evidence-Based Planning**: Use identified gaps to prioritize future improvements with measurable success criteria

#### **Notebook Contents**

**Section 1: Experimental Setup**
- **1.1 Systems Under Test**:
  - **System A (Naive RAG)**: Semantic-only retrieval with basic query embedding
  - **System B (Advanced RAG)**: Hybrid fusion (BM25 + semantic) with query enhancement and explainability
- **1.2 Test Queries**: 20 queries categorized by type
  - Keyword-heavy (5 queries): "Button component", "Card with header"
  - Semantic (5 queries): "Clickable action element", "Container with sections"
  - Mixed (10 queries): "Button with variant and size props"
- **1.3 Metrics**: MRR, Hit@3, Precision@1, Retrieval Latency
- **1.4 Statistical Method**: Paired t-test for significance testing (α=0.05)

**Section 2: Retrieval Accuracy Comparison** (Core of Deliverable 1)

**2.1 Overall Performance Table**
The notebook will generate a comprehensive comparison table:

| Metric                     | Naive RAG | Advanced RAG | Improvement | p-value | Significant? |
|----------------------------|-----------|--------------|-------------|---------|--------------|
| **Context Precision (RAGAS-Inspired)** |
| MRR (Mean Reciprocal Rank) | [measured] | [measured] | [calculated] | [calculated] | [yes/no] |
| Precision@1                | [measured] | [measured] | [calculated] | [calculated] | [yes/no] |
| **Context Recall (RAGAS-Inspired)**   |
| Hit@3                      | [measured] | [measured] | [calculated] | [calculated] | [yes/no] |
| Hit@5                      | [measured] | [measured] | [calculated] | [calculated] | [yes/no] |
| **Performance**             |
| Retrieval Latency (avg)    | [measured] | [measured] | [calculated] | [calculated] | [yes/no] |
| Total Generation p50       | [measured] | [measured] | [calculated] | [calculated] | [yes/no] |

Statistical significance will be determined using paired t-tests (α=0.05)

**Note**: These metrics are custom adaptations of RAGAS principles to code generation, as explained in Notebook 1 Section 3.

**2.2 Performance by Query Type** (Robustness analysis)
Analyze how each system performs across different query categories:

| Query Type | Naive RAG MRR | Advanced RAG MRR | Improvement | Analysis |
|------------|---------------|------------------|-------------|----------|
| Keyword    | [measured]    | [measured]       | [calculated]| [interpret where BM25 helps] |
| Semantic   | [measured]    | [measured]       | [calculated]| [interpret embedding strength] |
| Mixed      | [measured]    | [measured]       | [calculated]| [interpret fusion benefit] |

This breakdown will reveal where each retrieval method excels.

**2.3 Faithfulness & Answer Relevancy (RAGAS-Inspired)** (Generation quality)
Compare downstream generation quality between systems:

| Metric                      | Naive RAG | Advanced RAG | Improvement |
|-----------------------------|-----------|--------------|-------------|
| **Faithfulness (RAGAS-Inspired)**     |
| Pattern Adherence Score     | [measured]| [measured]   | [calculated]|
| TypeScript Compilation %    | [measured]| [measured]   | [calculated]|
| ESLint Pass Rate            | [measured]| [measured]   | [calculated]|
| **Answer Relevancy (RAGAS-Inspired)** |
| Token Adherence (overall)   | [measured]| [measured]   | [calculated]|
| - Color Adherence           | [measured]| [measured]   | [calculated]|
| - Typography Adherence      | [measured]| [measured]   | [calculated]|
| - Spacing Adherence         | [measured]| [measured]   | [calculated]|

Analysis will determine if better retrieval improves generation quality.

**Section 3: Visualizations**
- **3.1 Bar Charts**: Naive vs Advanced across all metrics
- **3.2 Box Plots**: Latency distribution comparison
- **3.3 Scatter Plot**: Latency vs Accuracy trade-off
- **3.4 Radar Chart**: Four-dimension RAG evaluation (Context Precision, Recall, Faithfulness, Relevancy)

**Section 4: Trade-Off Analysis**
- **4.1 Accuracy Gains**: Measure and report improvements in MRR, Hit@K, and query-type-specific accuracy
- **4.2 Latency Cost**: Measure additional retrieval time from BM25 indexing and fusion (target: maintain <1s total)
- **4.3 Complexity**: Analyze cost of additional BM25 indexing and fusion logic vs benefits
- **4.4 Conclusion**: Synthesize whether trade-offs are favorable based on measured results

**Section 5: Overall Assessment** (Summary for Deliverable 1)
This section will synthesize findings from the A/B comparison to assess:
- Whether advanced retrieval achieves statistically significant improvements (based on p-values)
- How the hybrid approach performs across query types (keyword, semantic, mixed)
- Whether latency increases are acceptable (vs <1s target)
- Whether better retrieval improves generation quality
- Overall value proposition of advanced techniques vs implementation complexity

**Section 6: Future Improvements Roadmap** (Deliverable 2)

This section will articulate 6 planned improvements based on evaluation results:

**6.1 Improvement #1: Enhanced Token Extraction**
- **Identified Gap**: Token adherence analysis will reveal which token types (colors, typography, spacing) need improvement
- **Proposed Solution**:
  - Refine GPT-4V prompts with more explicit measurement instructions
  - Implement multi-sample extraction approach (analyze multiple states, aggregate results)
  - Add token-specific confidence thresholds
- **Measurable Target**: Define target adherence percentage based on evaluation results
- **Timeline**: Weeks 1-2 of second half
- **Validation Method**: Re-run RAGAS evaluation, compare Answer Relevancy scores

**6.2 Improvement #2: Domain-Specific Embedding Model**
- **Identified Gap**: Semantic retrieval may struggle with component library-specific terminology
- **Proposed Solution**:
  - Fine-tune embedding model on component library documentation
  - Target domain-specific vocabulary (framework patterns, library conventions)
  - Use OpenAI fine-tuning API or similar approach
- **Measurable Target**: Set MRR improvement target for domain-specific queries
- **Timeline**: Weeks 3-4
- **Validation Method**: A/B test general vs fine-tuned embeddings

**6.3 Improvement #3: Cross-Encoder Re-Ranking Stage**
- **Identified Gap**: Fusion may not capture fine-grained feature alignment
- **Proposed Solution**:
  - Add cross-encoder re-ranking after initial retrieval
  - Use sentence-transformers or similar model
  - Re-rank top-K results based on detailed pattern-query matching
- **Measurable Target**: Set Precision@1 improvement target
- **Timeline**: Week 5
- **Validation Method**: Measure reduction in "close but wrong" matches

**6.4 Improvement #4: Expand Pattern Library**
- **Identified Gap**: Limited pattern coverage constrains system utility
- **Proposed Solution**:
  - Curate additional component patterns systematically
  - Develop automated curation pipeline for scalability
  - Validate all new patterns (compilation, accessibility tests)
- **Measurable Target**: Set target pattern count and coverage metrics
- **Timeline**: Ongoing throughout second half
- **Validation Method**: Measure Hit@K on expanded test set

**6.5 Improvement #5: Multi-Level Caching System**
- **Identified Gap**: Latency analysis will show opportunities for caching
- **Proposed Solution**:
  - Implement L1 exact cache (full request → response)
  - Implement L2 partial cache (intermediate results)
  - Configure appropriate TTLs based on design change frequency
- **Measurable Target**: Set latency reduction target based on cache hit rate projections
- **Timeline**: Weeks 2-3
- **Validation Method**: Measure cache hit rate, p50/p95 latency, cost savings

**6.6 Improvement #6: User Feedback Collection System**
- **Identified Gap**: No mechanism for real-world quality assessment
- **Proposed Solution**:
  - Implement rating system for generated components
  - Build analytics dashboard for feedback analysis
  - Create feedback-driven improvement loop
- **Measurable Target**: Set user satisfaction target (e.g., average rating)
- **Timeline**: Weeks 4-5
- **Validation Method**: Correlation analysis between system confidence and user ratings

**6.7 Improvement #7: AST-Based Pattern Similarity Metric**
- **Identified Gap**: TypeScript compilation only validates syntax/types, not semantic pattern adherence
- **Proposed Solution**:
  - Implement AST parsing for TypeScript code (using `@typescript-eslint/parser`)
  - Compare generated code structure with retrieved pattern:
    - Import matching (uses same UI library imports?)
    - Props matching (uses pattern's expected props?)
    - Component structure matching (similar JSX hierarchy?)
  - Calculate Pattern Adherence Score: `(import_match + props_match + structure_match) / 3`
- **Measurable Target**: Pattern Adherence Score ≥0.90 for valid generations
- **Timeline**: Weeks 3-4
- **Validation Method**: Compare AST similarity scores with TypeScript compilation results, identify cases where code compiles but doesn't use the pattern correctly
- **Why Important**: Provides a stronger Faithfulness metric that goes beyond compilation to measure true pattern grounding

**Section 7: Success Metrics Framework**

The notebook will present a framework for measuring success:

| Improvement Area         | Current Baseline | Target Metric | Validation Approach |
|--------------------------|------------------|---------------|---------------------|
| Token Adherence          | [from evaluation]| [% improvement]| Answer Relevancy metric |
| Retrieval Accuracy       | [from evaluation]| [MRR target]   | Context Precision metric |
| Pattern Adherence        | TypeScript only  | AST Score ≥0.90| Enhanced Faithfulness metric |
| Pattern Coverage         | [current count]  | [target count] | Hit@K on expanded queries |
| Generation Latency       | [measured p50]   | [target p50]   | Performance benchmarking |
| User Satisfaction        | N/A              | [rating target]| User feedback metrics |
| Cost Efficiency          | [measured cost]  | [target cost]  | Cost per generation tracking |

**Section 8: Prioritization Framework**
- Document prioritization criteria (impact, effort, dependencies)
- Explain rationale for proposed timeline
- Discuss risk mitigation for high-priority improvements
- Outline decision framework for adapting plan based on evaluation results

---

## Benefits for Graders

### 1. **Clear Deliverable Mapping**
Each notebook section explicitly states which deliverable it addresses, making grading straightforward:
- Task 5: Sections 3-4 (RAGAS metrics table), Section 6 (conclusions) → 15 points
- Task 6: Sections 2-5 (advanced techniques) → 5 points
- Task 7: Sections 2-5 (comparison table), Section 6 (future improvements) → 10 points

### 2. **Executable Evidence**
Graders can run cells to verify:
- Metrics are calculated correctly
- Code implementations work as described
- Results are reproducible

### 3. **Visual Communication**
Tables, charts, and inline outputs make results easy to understand at a glance.

### 4. **Self-Contained**
All code, data, and analysis in one place—no need to navigate multiple files.

### 5. **Professional Standard**
Jupyter notebooks are industry-standard for ML/AI evaluation, demonstrating professional data science practices.

---

## Implementation Plan

### **Timeline**
- **Week 1**: Create Notebook 1 (Task 5) + validate RAGAS metrics
- **Week 2**: Create Notebook 2 (Task 6) + test advanced techniques
- **Week 3**: Create Notebook 3 (Task 7) + A/B comparison
- **Week 4**: Review, polish, ensure reproducibility

### **Dependencies**
```python
# Required packages (add to backend/requirements.txt)
jupyter>=1.0.0           # Notebook environment
matplotlib>=3.7.0        # Visualizations
seaborn>=0.12.0          # Statistical plots
plotly>=5.18.0           # Interactive charts
pandas>=2.0.0            # Data manipulation
scipy>=1.11.0            # Statistical tests (t-tests, confidence intervals)
rank-bm25>=0.2.2         # BM25 retrieval (if not already present)

# Already in requirements.txt (no changes needed):
# - TypeScript validator uses existing node scripts
# - Token validator uses existing frontend code via bridge
```

**Note**: No RAGAS library dependency needed since we're using RAGAS-inspired custom metrics, not the official RAGAS library.

### **Data Files**
- `backend/data/patterns/*.json` (existing, 10 patterns)
- `backend/data/exemplars/*/` (existing, reference implementations)
- `backend/data/eval/test_queries.json` (to create, 20+ golden queries)
- `backend/data/eval/expected_results.json` (to create, expected retrieval outputs)

### **Code Reuse**
Notebooks will import and demonstrate existing production code:
- `backend/src/retrieval/*` (BM25, semantic, fusion implementations)
- `backend/src/agents/*` (requirement orchestrator, proposers)
- `backend/src/generation/*` (code generator, validator)
- `backend/scripts/validate_typescript.js` ✅ (TypeScript compilation validator)
- `app/src/services/validation/token-validator.ts` ✅ (Token adherence validator)
- `backend/src/validation/frontend_bridge.py` ✅ (Bridge to call frontend validators)
- `backend/tests/*` (convert test functions to notebook cells)

**Advantage**: Two of four RAGAS-inspired metrics already have production-ready implementations, reducing implementation time.

---

## Grading Checklist

To facilitate grading, each notebook includes a **"Grading Checklist"** section at the end:

### **Notebook 1 Checklist** (Task 5)
- [ ] Golden dataset defined with test queries and expected results (Section 1)
- [ ] Context Precision calculated with formula and code (MRR metric) (Section 3.1)
- [ ] Context Recall calculated with formula and code (Hit@K metric) (Section 3.2)
- [ ] Faithfulness calculated using existing TypeScript validator (Section 3.3)
  - ✅ Uses `backend/scripts/validate_typescript.js` (already implemented)
  - Measures compilation success rate
  - Documents limitation: only checks syntax/types, not pattern similarity
- [ ] Answer Relevancy calculated using existing token validator (Section 3.4)
  - ✅ Uses `app/src/services/validation/token-validator.ts` (already implemented)
  - Measures color, typography, and spacing adherence
- [ ] Results table with all 4 metrics provided (Section 4)
- [ ] Conclusions section analyzing pipeline performance and effectiveness (Section 6)
  - Strengths identified with evidence
  - Weaknesses and gaps identified
  - Overall effectiveness assessment
  - Identifies AST pattern similarity as future improvement

### **Notebook 2 Checklist** (Task 6)
- [ ] Baseline naive retriever implemented and tested (Section 1)
- [ ] Advanced technique #1: BM25 with multi-field weighting (Section 2)
- [ ] Advanced technique #2: Query enhancement (Section 3)
- [ ] Advanced technique #3: Hybrid fusion (Section 4)
- [ ] Advanced technique #4: Explainability layer (Section 5)
- [ ] Optional technique #5: RAG-Fusion exploration (Section 6)
- [ ] Comparative summary table showing all methods (Section 7)
- [ ] Architecture justification based on empirical results (Section 8)

### **Notebook 3 Checklist** (Task 7)
- [ ] A/B comparison experimental setup documented (Section 1)
- [ ] Performance comparison table with custom metrics for both systems (Section 2)
- [ ] Statistical significance testing results (Section 2.1)
- [ ] Performance breakdown by query type (Section 2.2)
- [ ] Visualizations of performance differences (Section 3)
- [ ] Trade-off analysis (accuracy vs latency) (Section 4)
- [ ] Overall assessment of improvements (Section 5)
- [ ] Future improvements roadmap (7 planned enhancements) (Section 6)
  - #1: Enhanced Token Extraction
  - #2: Domain-Specific Embedding Model
  - #3: Cross-Encoder Re-Ranking
  - #4: Expand Pattern Library
  - #5: Multi-Level Caching
  - #6: User Feedback Collection
  - **#7: AST-Based Pattern Similarity** (addresses Faithfulness limitation)
  - Each with: identified gap, solution, target, timeline, validation method
- [ ] Success metrics framework table (Section 7)

---

## Conclusion

This proposal outlines a notebook-based evaluation approach for Tasks 5-7 that provides:

- **Clear deliverable mapping**: Each notebook section explicitly addresses required deliverables
- **Reproducible methodology**: Executable code allows graders to verify results
- **Comprehensive coverage**: RAGAS-inspired RAG evaluation metrics, advanced retrieval techniques, and improvement roadmap
- **Professional presentation**: Tables, visualizations, and analysis in industry-standard format
- **Evidence-based approach**: All claims supported by measured data (not pre-determined results)
- **Honest methodology**: Custom metrics clearly labeled as RAGAS-inspired adaptations, not claiming official RAGAS compliance

The three notebooks will systematically evaluate the ComponentForge RAG pipeline:
1. **Notebook 1 (Task 5)**: Establish golden dataset and assess pipeline with RAGAS-inspired custom metrics adapted for code generation
2. **Notebook 2 (Task 6)**: Demonstrate evolution from naive to advanced retrieval methods
3. **Notebook 3 (Task 7)**: Quantify improvements and articulate future enhancement roadmap

**Critical Methodology Note**: The deliverable requests "RAGAS framework" assessment. The standard RAGAS library is designed for text-based Q&A systems. Since ComponentForge generates TypeScript code (not text), we adapt RAGAS **evaluation principles** (Context Precision, Context Recall, Faithfulness, Answer Relevancy) to code generation using custom metrics with AST-based similarity, retrieval ranking, and design token adherence.

**Key Distinction**: This proposal describes the **planned methodology**—actual metrics, results, and conclusions will be generated during notebook execution based on measured performance.

**Request**: Please approve this proposal so I can proceed with notebook creation. I'm happy to adjust the scope, format, or approach based on your feedback.

---

## Appendix: Project Context

**ComponentForge**: End-to-end agentic RAG application for design-to-code generation

**Architecture**:
- Multi-agent orchestration via LangGraph (6 specialized agents)
- Hybrid retrieval system (BM25 + semantic fusion with explainability)
- Production infrastructure (PostgreSQL, Qdrant, Redis, LangSmith monitoring)
- Comprehensive test coverage (100+ tests)

**Relevant Existing Files**:
- Pattern library: `/backend/data/patterns/*.json` (10 curated component patterns)
- Test suite: `/backend/tests/` (integration, performance, validation tests)
- Retrieval code: `/backend/src/retrieval/` (BM25, semantic, fusion implementations)
- Documentation: `/docs/coursework/AI_ENGINEERING_TASKS.md` (full project description)

---

**Proposal Date**: 2025-10-17
**Student**: Hou Chia
**Course**: AI Engineering
