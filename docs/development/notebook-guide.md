# Advanced Retrieval Notebook Adaptation Guide for ComponentForge

**Version:** 1.0
**Last Updated:** 2025-10-07
**Purpose:** Adapt the "Advanced Retrieval with LangChain" notebook to work with ComponentForge shadcn/ui component patterns

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [File Structure Setup](#file-structure-setup)
4. [Task-by-Task Modifications](#task-by-task-modifications)
   - [Task 1: Dependencies](#task-1-dependencies-no-changes)
   - [Task 2: Data Loading](#task-2-data-loading-modified)
   - [Task 3: Qdrant Setup](#task-3-qdrant-setup-modified)
   - [Task 4: Naive Retrieval](#task-4-naive-retrieval-modified-queries)
   - [Task 5: BM25](#task-5-bm25-modified-queries)
   - [Task 6: Contextual Compression](#task-6-contextual-compression-modified-queries)
   - [Task 7: Multi-Query](#task-7-multi-query-modified-queries)
   - [Task 8: Parent-Document](#task-8-parent-document-modified)
   - [Task 9: Ensemble](#task-9-ensemble-no-changes)
   - [Task 10: Semantic Chunking](#task-10-semantic-chunking-modified)
5. [Activity 1: Evaluation](#activity-1-evaluation-complete-rewrite)
6. [Golden Dataset](#golden-dataset-template)
7. [Expected Results](#expected-results)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What's Changing?

The original notebook uses CSV data about projects. You'll adapt it to use **ComponentForge's shadcn/ui component pattern library** (10 JSON files containing Button, Card, Input, etc.).

### Why This Approach?

- ✅ **Educational**: See all retrieval strategies in one place
- ✅ **Self-contained**: No need to modify your existing app
- ✅ **Comparative**: Easy to compare strategies side-by-side
- ✅ **Portable**: Can share notebook with others

### What Stays the Same?

- All retrieval strategy logic (Tasks 4-10)
- RAG chain construction patterns
- LCEL syntax and structure
- Evaluation metrics (MRR, Hit@K)

### What Changes?

- Data source (CSV → JSON patterns)
- Document structure and content
- Test queries (projects → components)
- Golden dataset (project domains → component patterns)

---

## Prerequisites

### 1. Environment Setup

```bash
# Ensure you're in the backend directory
cd backend

# Activate virtual environment
source venv/bin/activate

# Install required packages
pip install langchain langchain-community langchain-openai langchain-cohere
pip install qdrant-client openai cohere
pip install langchain-experimental  # For semantic chunking
pip install pandas numpy  # For evaluation
```

### 2. API Keys Required

```bash
# Add to your .env or export directly
export OPENAI_API_KEY="your-openai-api-key"
export COHERE_API_KEY="your-cohere-api-key"
```

### 3. Data Files

Ensure these exist:
```
backend/data/patterns/
├── button.json
├── card.json
├── input.json
├── select.json
├── badge.json
├── alert.json
├── checkbox.json
├── radio.json
├── switch.json
└── tabs.json
```

### 4. Notebook Location

Create your notebook here:
```
backend/notebooks/retrieval_evaluation.ipynb
```

Or work in Google Colab and upload your patterns folder.

---

## File Structure Setup

### Directory Structure

```
component-forge/
├── backend/
│   ├── data/
│   │   ├── patterns/          # Your 10 JSON component files
│   │   └── evaluation/        # Golden dataset (you'll create)
│   │       └── golden_retrieval_tests.json
│   ├── notebooks/             # Create this folder
│   │   └── retrieval_evaluation.ipynb
│   └── docs/
│       └── NOTEBOOK_ADAPTATION_GUIDE.md  # This file
```

### Create Notebook Directory

```bash
mkdir -p backend/notebooks
cd backend/notebooks
jupyter notebook
# Create new notebook: retrieval_evaluation.ipynb
```

---

## Task-by-Task Modifications

### Task 1: Dependencies (NO CHANGES)

**Original Code:** Keep as-is

```python
import os
import getpass

os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API Key:")
os.environ["COHERE_API_KEY"] = getpass.getpass("Cohere API Key:")
```

**Notes:**
- If running in Colab, you can hardcode keys (but don't commit!)
- If running locally with .env, you can skip this cell

---

### Task 2: Data Loading (MODIFIED)

**❌ REMOVE Original Code:**

```python
from langchain_community.document_loaders.csv_loader import CSVLoader

loader = CSVLoader(
    file_path=f"./data/Projects_with_Domains.csv",
    metadata_columns=[...]
)
synthetic_usecase_data = loader.load()
```

**✅ REPLACE WITH ComponentForge Version:**

```python
## Task 2: Data Collection and Preparation (ComponentForge Version)

import json
from pathlib import Path
from langchain.docstore.document import Document

def load_component_patterns(patterns_dir="../data/patterns"):
    """
    Load shadcn/ui component patterns from JSON files.

    Each JSON file represents one component pattern with:
    - id, name, category, description
    - code (React TypeScript implementation)
    - metadata (variants, props, a11y features)

    Returns:
        List[Document]: LangChain documents with pattern content and metadata
    """
    patterns_path = Path(patterns_dir)
    documents = []

    if not patterns_path.exists():
        raise FileNotFoundError(
            f"Patterns directory not found: {patterns_path}\n"
            f"Please ensure you're running from the correct directory."
        )

    json_files = list(patterns_path.glob("*.json"))

    if not json_files:
        raise FileNotFoundError(
            f"No JSON files found in {patterns_path}\n"
            f"Expected files like button.json, card.json, etc."
        )

    for json_file in sorted(json_files):
        with open(json_file, 'r') as f:
            pattern = json.load(f)

        # Extract variant names
        variant_names = [v['name'] for v in pattern['metadata'].get('variants', [])]

        # Extract prop names and types
        prop_info = [
            f"{p['name']} ({p['type']})"
            for p in pattern['metadata'].get('props', [])
        ]

        # Extract a11y features
        a11y_features = pattern['metadata'].get('a11y', {}).get('features', [])

        # Create rich content for retrieval
        # This is what will be embedded and searched
        content = f"""
Component: {pattern['name']}
Category: {pattern['category']}
Description: {pattern['description']}
Framework: {pattern['framework']}
Library: {pattern['library']}

Variants Available: {', '.join(variant_names)}

Props: {', '.join(prop_info)}

Accessibility Features:
{chr(10).join(['- ' + feat for feat in a11y_features])}

Dependencies: {', '.join(pattern['metadata'].get('dependencies', []))}

Code Preview:
{pattern['code'][:500]}...
        """.strip()

        # Create LangChain Document with metadata
        doc = Document(
            page_content=content,
            metadata={
                "id": pattern["id"],
                "name": pattern["name"],
                "category": pattern["category"],
                "framework": pattern["framework"],
                "library": pattern["library"],
                "num_variants": len(variant_names),
                "num_props": len(prop_info),
                "source": str(json_file.name)
            }
        )
        documents.append(doc)

    return documents

# Load component patterns
component_patterns = load_component_patterns()

print(f"✅ Loaded {len(component_patterns)} component patterns")
print(f"📦 Components: {', '.join([d.metadata['name'] for d in component_patterns])}")

# View first pattern to verify structure
print("\n" + "="*60)
print("Sample Document (First Pattern):")
print("="*60)
print(f"Name: {component_patterns[0].metadata['name']}")
print(f"Category: {component_patterns[0].metadata['category']}")
print(f"\nContent Preview:")
print(component_patterns[0].page_content[:300] + "...")
```

**Expected Output:**

```
✅ Loaded 10 component patterns
📦 Components: Alert, Badge, Button, Card, Checkbox, Input, Radio, Select, Switch, Tabs

============================================================
Sample Document (First Pattern):
============================================================
Name: Alert
Category: feedback
...
```

**Notes:**
- Adjust `patterns_dir` path based on your notebook location
- If in Colab, upload patterns folder first
- Content is rich to enable good semantic search

---

### Task 3: Qdrant Setup (MODIFIED)

**❌ REMOVE Original Code:**

```python
vectorstore = Qdrant.from_documents(
    synthetic_usecase_data,
    embeddings,
    location=":memory:",
    collection_name="Synthetic_Usecases"
)
```

**✅ REPLACE WITH:**

```python
## Task 3: Setting up QDrant (ComponentForge Version)

from langchain_community.vectorstores import Qdrant
from langchain_openai import OpenAIEmbeddings

# Initialize embeddings model (same as original)
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# Create vector store with component patterns
vectorstore = Qdrant.from_documents(
    component_patterns,  # ← Changed from synthetic_usecase_data
    embeddings,
    location=":memory:",
    collection_name="ComponentForge_Patterns"  # ← New collection name
)

print(f"✅ Created Qdrant vector store with {len(component_patterns)} patterns")
print(f"📊 Collection: ComponentForge_Patterns")
print(f"🔢 Embedding dimension: 1536 (text-embedding-3-small)")
```

**Expected Output:**

```
✅ Created Qdrant vector store with 10 patterns
📊 Collection: ComponentForge_Patterns
🔢 Embedding dimension: 1536 (text-embedding-3-small)
```

---

### Task 4: Naive Retrieval (MODIFIED QUERIES)

**Keep all code the same EXCEPT the test queries at the end.**

**❌ REMOVE Original Queries:**

```python
naive_retrieval_chain.invoke({"question" : "What is the most common project domain?"})["response"].content
naive_retrieval_chain.invoke({"question" : "Were there any usecases about security?"})["response"].content
naive_retrieval_chain.invoke({"question" : "What did judges have to say about the fintech projects?"})["response"].content
```

**✅ REPLACE WITH ComponentForge Queries:**

```python
# Test queries specific to component patterns

print("🔍 Testing Naive Retrieval with ComponentForge queries...\n")

# Query 1: Direct component name match
print("Q1: What is a button component with multiple visual styles?")
result1 = naive_retrieval_chain.invoke({
    "question": "What is a button component with multiple visual styles?"
})
print(f"A1: {result1['response'].content}\n")
print(f"📄 Retrieved {len(result1['context'])} documents\n")

# Query 2: Category-based search
print("Q2: What form components are available?")
result2 = naive_retrieval_chain.invoke({
    "question": "What form components are available?"
})
print(f"A2: {result2['response'].content}\n")

# Query 3: Feature-based search
print("Q3: Which components have accessibility features for keyboard navigation?")
result3 = naive_retrieval_chain.invoke({
    "question": "Which components have accessibility features for keyboard navigation?"
})
print(f"A3: {result3['response'].content}\n")

# Query 4: Variant-based search
print("Q4: Show me components with primary and secondary variants")
result4 = naive_retrieval_chain.invoke({
    "question": "Show me components with primary and secondary variants"
})
print(f"A4: {result4['response'].content}\n")
```

**Expected Behavior:**
- Q1 should retrieve Button (exact match)
- Q2 should retrieve Input, Select, Checkbox, Radio (category match)
- Q3 should retrieve multiple components (semantic match on a11y)
- Q4 should retrieve Button, Badge (variant match)

---

### Task 5: BM25 (MODIFIED QUERIES)

**Keep code the same, replace queries:**

```python
print("🔍 Testing BM25 Retrieval with ComponentForge queries...\n")

# BM25 excels at exact keyword matching
print("Q1: What is a button component?")
result1 = bm25_retrieval_chain.invoke({
    "question": "What is a button component?"
})
print(f"A1: {result1['response'].content}\n")

print("Q2: Find components in the 'form' category")
result2 = bm25_retrieval_chain.invoke({
    "question": "Find components in the 'form' category"
})
print(f"A2: {result2['response'].content}\n")

print("Q3: Which component has a 'destructive' variant?")
result3 = bm25_retrieval_chain.invoke({
    "question": "Which component has a 'destructive' variant?"
})
print(f"A3: {result3['response'].content}\n")
```

**Answer Question #1:**

After running, add your answer:

```markdown
#### ❓ Question #1: BM25 vs Embeddings

**Example Query:** "Which component has a 'destructive' variant?"

**Why BM25 is better than embeddings for this query:**

1. **Exact Keyword Matching**: BM25 excels at finding the exact word "destructive"
   in the component metadata, while embeddings might match semantically similar
   terms like "dangerous", "warning", or "delete".

2. **Sparse Representation Advantage**: BM25 uses bag-of-words which directly
   matches the keyword "destructive" in the Button component's variants list.

3. **No Semantic Confusion**: Embeddings might retrieve Alert or Badge components
   because they have "warning" or "error" variants which are semantically similar
   to "destructive", but BM25 will only match the exact keyword.

4. **Other examples where BM25 outperforms for ComponentForge**:
   - "Find component with 'ghost' variant" (exact variant name)
   - "Which components use '@radix-ui/react-slot'?" (exact dependency)
   - "Show me components in 'shadcn/ui' library" (exact library name)

**When embeddings are better for ComponentForge**:
   - "A clickable element for user actions" (semantic: Button)
   - "Container for related information" (semantic: Card)
   - "Toggle between two states" (semantic: Switch/Checkbox)
```

---

### Task 6: Contextual Compression (MODIFIED QUERIES)

**Keep code the same, replace queries:**

```python
print("🔍 Testing Contextual Compression (Reranking) with ComponentForge queries...\n")

print("Q1: I need a button with visual feedback for actions")
result1 = contextual_compression_retrieval_chain.invoke({
    "question": "I need a button with visual feedback for actions"
})
print(f"A1: {result1['response'].content}\n")

print("Q2: Component for displaying status or categories")
result2 = contextual_compression_retrieval_chain.invoke({
    "question": "Component for displaying status or categories"
})
print(f"A2: {result2['response'].content}\n")

print("Q3: Form element with keyboard accessibility")
result3 = contextual_compression_retrieval_chain.invoke({
    "question": "Form element with keyboard accessibility"
})
print(f"A3: {result3['response'].content}\n")
```

**Expected Behavior:**
- Reranking should improve precision by filtering top-10 to best top-3
- Q2 should strongly prefer Badge over other components

---

### Task 7: Multi-Query (MODIFIED QUERIES)

**Keep code the same, replace queries and add logging:**

```python
# Enable logging to see generated query variations
import logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')

print("🔍 Testing Multi-Query Retrieval with ComponentForge queries...\n")

print("Q1: Interactive control for toggling states")
result1 = multi_query_retrieval_chain.invoke({
    "question": "Interactive control for toggling states"
})
print(f"A1: {result1['response'].content}\n")

print("Q2: Element for user input in forms")
result2 = multi_query_retrieval_chain.invoke({
    "question": "Element for user input in forms"
})
print(f"A2: {result2['response'].content}\n")

# Turn off logging for cleaner output
logging.basicConfig(level=logging.WARNING)
```

**Answer Question #2:**

```markdown
#### ❓ Question #2: Multi-Query Reformulations

**How generating multiple reformulations improves recall for ComponentForge:**

1. **Terminology Variation**: Different reformulations capture various ways to
   describe the same component:
   - Original: "Interactive control for toggling states"
   - Variation 1: "Switch component for on/off functionality"
   - Variation 2: "Toggle button for binary choices"
   - Variation 3: "UI element for enabling/disabling features"

2. **Semantic Coverage**: Each reformulation might match different aspects of
   the component's description, metadata, or code, collectively increasing the
   chance of finding the right pattern.

3. **Synonym Expansion**: Reformulations naturally include synonyms:
   - "button" → "clickable element", "action trigger", "interactive control"
   - "input" → "text field", "form element", "data entry component"

4. **Real Example from ComponentForge**:
   - Query: "Element for user input in forms"
   - Reformulation 1: "Text input component for data entry" → matches Input
   - Reformulation 2: "Form field for user information" → matches Input, Select
   - Reformulation 3: "Keyboard accessible input control" → matches Input, Checkbox
   - Combined results have higher recall than single query

5. **Reduces False Negatives**: If one query phrasing misses the correct component,
   alternative reformulations provide backup paths to finding it.
```

---

### Task 8: Parent-Document (MODIFIED)

**Keep most code, but adjust the child splitting strategy:**

**Original code works, but you can optimize for component patterns:**

```python
## Task 8: Parent Document Retriever (ComponentForge Version)

from langchain.retrievers import ParentDocumentRetriever
from langchain.storage import InMemoryStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient, models
from langchain_qdrant import QdrantVectorStore

# Parent documents are full component patterns
parent_docs = component_patterns

# Child splitter - adjusted for component structure
# Components have natural sections: description, variants, props, code, a11y
child_splitter = RecursiveCharacterTextSplitter(
    chunk_size=400,  # Smaller chunks for component metadata
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""]
)

# Create new Qdrant collection for child chunks
client = QdrantClient(location=":memory:")

client.create_collection(
    collection_name="component_patterns_children",
    vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE)
)

parent_document_vectorstore = QdrantVectorStore(
    collection_name="component_patterns_children",
    embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
    client=client
)

# In-memory store for parent documents
store = InMemoryStore()

# Create retriever
parent_document_retriever = ParentDocumentRetriever(
    vectorstore=parent_document_vectorstore,
    docstore=store,
    child_splitter=child_splitter,
)

# Add component patterns
parent_document_retriever.add_documents(parent_docs, ids=None)

print(f"✅ Created Parent-Document Retriever")
print(f"📄 Parent documents: {len(parent_docs)}")
print(f"🔍 Child chunks indexed in vector store")

# Test queries (same pattern as before)
print("\n🔍 Testing Parent-Document Retrieval...\n")

print("Q1: Component with size variants")
result1 = parent_document_retrieval_chain.invoke({
    "question": "Component with size variants"
})
print(f"A1: {result1['response'].content}\n")
```

**Expected Behavior:**
- Child chunks might match on specific features (e.g., "size: sm")
- Returns full parent pattern (complete component JSON content)

---

### Task 9: Ensemble (NO CHANGES)

**Keep all code exactly as-is.**

The ensemble combines all previous retrievers:

```python
from langchain.retrievers import EnsembleRetriever

retriever_list = [
    bm25_retriever,
    naive_retriever,
    parent_document_retriever,
    compression_retriever,
    multi_query_retriever
]

equal_weighting = [1/len(retriever_list)] * len(retriever_list)

ensemble_retriever = EnsembleRetriever(
    retrievers=retriever_list,
    weights=equal_weighting
)
```

**Replace queries with ComponentForge versions:**

```python
print("🔍 Testing Ensemble Retrieval (All Strategies Combined)...\n")

print("Q1: Accessible form component")
result1 = ensemble_retrieval_chain.invoke({
    "question": "Accessible form component"
})
print(f"A1: {result1['response'].content}\n")

print("Q2: Component for user actions with variants")
result2 = ensemble_retrieval_chain.invoke({
    "question": "Component for user actions with variants"
})
print(f"A2: {result2['response'].content}\n")
```

---

### Task 10: Semantic Chunking (MODIFIED)

**Adjust for component patterns:**

```python
## Task 10: Semantic Chunking (ComponentForge Version)

from langchain_experimental.text_splitter import SemanticChunker

semantic_chunker = SemanticChunker(
    embeddings,
    breakpoint_threshold_type="percentile",
    breakpoint_threshold_amount=75  # Adjust threshold for components
)

# For components, semantic chunking might break at:
# - Description → Variants
# - Variants → Props
# - Props → Code
# - Code → Accessibility

# Apply to all component patterns
print("🔧 Applying semantic chunking to component patterns...")
semantic_documents = semantic_chunker.split_documents(component_patterns)

print(f"✅ Original documents: {len(component_patterns)}")
print(f"✅ After semantic chunking: {len(semantic_documents)}")
print(f"📊 Average chunks per component: {len(semantic_documents) / len(component_patterns):.1f}")

# Create new vector store
semantic_vectorstore = Qdrant.from_documents(
    semantic_documents,
    embeddings,
    location=":memory:",
    collection_name="ComponentForge_SemanticChunks"
)

semantic_retriever = semantic_vectorstore.as_retriever(search_kwargs={"k": 10})

# Create chain
semantic_retrieval_chain = (
    {"context": itemgetter("question") | semantic_retriever, "question": itemgetter("question")}
    | RunnablePassthrough.assign(context=itemgetter("context"))
    | {"response": rag_prompt | chat_model, "context": itemgetter("context")}
)

# Test
print("\n🔍 Testing Semantic Chunking Retrieval...\n")

print("Q1: Button variants")
result1 = semantic_retrieval_chain.invoke({
    "question": "Button variants"
})
print(f"A1: {result1['response'].content}\n")
```

**Answer Question #3:**

```markdown
#### ❓ Question #3: Semantic Chunking with Repetitive Content

**If component patterns have short, repetitive sections (e.g., similar variant structures),
semantic chunking might:**

1. **Over-chunk**: Create too many small chunks because similarity scores are all high
   - Example: "default", "primary", "secondary" variants have similar semantic patterns

2. **Under-chunk**: Keep everything together if descriptions are too similar
   - Example: All buttons described as "clickable element" might not create boundaries

**Adjustments for ComponentForge:**

1. **Increase threshold**: Use `breakpoint_threshold_amount=90` (higher percentile)
   to only break at stronger semantic shifts

2. **Use different breakpoint type**: Try `gradient` instead of `percentile` to
   detect rate of change in semantic similarity

3. **Custom splitting logic**: Manually split on structural markers:
   ```python
   separators = ["Variants Available:", "Props:", "Accessibility Features:", "Code Preview:"]
   ```

4. **Combine with RecursiveCharacterTextSplitter**: Use semantic chunking for overall
   structure, then character-based for code sections

**For ComponentForge specifically**:
   - Components already have natural structure (metadata sections)
   - Semantic chunking may provide limited benefit over simple structural splitting
   - Best use case: Very long component descriptions or extensive usage examples
```

---

## Activity 1: Evaluation (COMPLETE REWRITE)

This is the most important section. Here's the complete evaluation implementation:

### Step 1: Create Golden Dataset

First, create this file manually:

**File:** `backend/data/evaluation/golden_retrieval_tests.json`

```json
[
  {
    "test_id": "button_exact",
    "query": "Button component",
    "expected_component": "Button",
    "expected_id": "shadcn-button",
    "difficulty": "easy",
    "type": "exact_match"
  },
  {
    "test_id": "button_semantic",
    "query": "Clickable element with multiple visual styles",
    "expected_component": "Button",
    "expected_id": "shadcn-button",
    "difficulty": "medium",
    "type": "semantic_match"
  },
  {
    "test_id": "button_variant",
    "query": "Component with destructive variant",
    "expected_component": "Button",
    "expected_id": "shadcn-button",
    "difficulty": "medium",
    "type": "variant_match"
  },
  {
    "test_id": "card_exact",
    "query": "Card component",
    "expected_component": "Card",
    "expected_id": "shadcn-card",
    "difficulty": "easy",
    "type": "exact_match"
  },
  {
    "test_id": "card_semantic",
    "query": "Container for grouping related content",
    "expected_component": "Card",
    "expected_id": "shadcn-card",
    "difficulty": "medium",
    "type": "semantic_match"
  },
  {
    "test_id": "card_feature",
    "query": "Component with header and footer sections",
    "expected_component": "Card",
    "expected_id": "shadcn-card",
    "difficulty": "hard",
    "type": "feature_match"
  },
  {
    "test_id": "input_exact",
    "query": "Input component",
    "expected_component": "Input",
    "expected_id": "shadcn-input",
    "difficulty": "easy",
    "type": "exact_match"
  },
  {
    "test_id": "input_semantic",
    "query": "Text field for user data entry",
    "expected_component": "Input",
    "expected_id": "shadcn-input",
    "difficulty": "medium",
    "type": "semantic_match"
  },
  {
    "test_id": "input_feature",
    "query": "Form element with validation support",
    "expected_component": "Input",
    "expected_id": "shadcn-input",
    "difficulty": "medium",
    "type": "feature_match"
  },
  {
    "test_id": "select_exact",
    "query": "Select component",
    "expected_component": "Select",
    "expected_id": "shadcn-select",
    "difficulty": "easy",
    "type": "exact_match"
  },
  {
    "test_id": "select_semantic",
    "query": "Dropdown menu for choosing options",
    "expected_component": "Select",
    "expected_id": "shadcn-select",
    "difficulty": "medium",
    "type": "semantic_match"
  },
  {
    "test_id": "select_feature",
    "query": "Component for selecting one option from multiple choices",
    "expected_component": "Select",
    "expected_id": "shadcn-select",
    "difficulty": "hard",
    "type": "semantic_match"
  },
  {
    "test_id": "badge_exact",
    "query": "Badge component",
    "expected_component": "Badge",
    "expected_id": "shadcn-badge",
    "difficulty": "easy",
    "type": "exact_match"
  },
  {
    "test_id": "badge_semantic",
    "query": "Small label for status indication",
    "expected_component": "Badge",
    "expected_id": "shadcn-badge",
    "difficulty": "medium",
    "type": "semantic_match"
  },
  {
    "test_id": "badge_variant",
    "query": "Component with success, warning, and error variants",
    "expected_component": "Badge",
    "expected_id": "shadcn-badge",
    "difficulty": "hard",
    "type": "variant_match"
  },
  {
    "test_id": "alert_exact",
    "query": "Alert component",
    "expected_component": "Alert",
    "expected_id": "shadcn-alert",
    "difficulty": "easy",
    "type": "exact_match"
  },
  {
    "test_id": "alert_semantic",
    "query": "Component for displaying important messages",
    "expected_component": "Alert",
    "expected_id": "shadcn-alert",
    "difficulty": "medium",
    "type": "semantic_match"
  },
  {
    "test_id": "alert_feature",
    "query": "Notification banner with icon support",
    "expected_component": "Alert",
    "expected_id": "shadcn-alert",
    "difficulty": "hard",
    "type": "feature_match"
  },
  {
    "test_id": "checkbox_exact",
    "query": "Checkbox component",
    "expected_component": "Checkbox",
    "expected_id": "shadcn-checkbox",
    "difficulty": "easy",
    "type": "exact_match"
  },
  {
    "test_id": "checkbox_semantic",
    "query": "Binary selection control",
    "expected_component": "Checkbox",
    "expected_id": "shadcn-checkbox",
    "difficulty": "medium",
    "type": "semantic_match"
  },
  {
    "test_id": "checkbox_feature",
    "query": "Form control with checked state",
    "expected_component": "Checkbox",
    "expected_id": "shadcn-checkbox",
    "difficulty": "hard",
    "type": "feature_match"
  },
  {
    "test_id": "radio_exact",
    "query": "Radio component",
    "expected_component": "Radio",
    "expected_id": "shadcn-radio",
    "difficulty": "easy",
    "type": "exact_match"
  },
  {
    "test_id": "radio_semantic",
    "query": "Single choice selector from group",
    "expected_component": "Radio",
    "expected_id": "shadcn-radio",
    "difficulty": "medium",
    "type": "semantic_match"
  },
  {
    "test_id": "radio_feature",
    "query": "Mutually exclusive option selector",
    "expected_component": "Radio",
    "expected_id": "shadcn-radio",
    "difficulty": "hard",
    "type": "semantic_match"
  },
  {
    "test_id": "switch_exact",
    "query": "Switch component",
    "expected_component": "Switch",
    "expected_id": "shadcn-switch",
    "difficulty": "easy",
    "type": "exact_match"
  },
  {
    "test_id": "switch_semantic",
    "query": "Toggle control for on/off states",
    "expected_component": "Switch",
    "expected_id": "shadcn-switch",
    "difficulty": "medium",
    "type": "semantic_match"
  },
  {
    "test_id": "switch_feature",
    "query": "Interactive toggle with visual feedback",
    "expected_component": "Switch",
    "expected_id": "shadcn-switch",
    "difficulty": "hard",
    "type": "feature_match"
  },
  {
    "test_id": "tabs_exact",
    "query": "Tabs component",
    "expected_component": "Tabs",
    "expected_id": "shadcn-tabs",
    "difficulty": "easy",
    "type": "exact_match"
  },
  {
    "test_id": "tabs_semantic",
    "query": "Navigation between content panels",
    "expected_component": "Tabs",
    "expected_id": "shadcn-tabs",
    "difficulty": "medium",
    "type": "semantic_match"
  },
  {
    "test_id": "tabs_feature",
    "query": "Component for organizing content in separate views",
    "expected_component": "Tabs",
    "expected_id": "shadcn-tabs",
    "difficulty": "hard",
    "type": "semantic_match"
  }
]
```

### Step 2: Evaluation Code

Add this as a new section in your notebook:

```python
# 🤝 Breakout Room Part #2 - ComponentForge Evaluation
## Activity #1: Evaluate All Retrieval Strategies

import json
import time
import numpy as np
import pandas as pd
from pathlib import Path

# Load golden dataset
golden_dataset_path = Path("../data/evaluation/golden_retrieval_tests.json")

if not golden_dataset_path.exists():
    raise FileNotFoundError(
        f"Golden dataset not found at {golden_dataset_path}\n"
        "Please create this file using the template in NOTEBOOK_ADAPTATION_GUIDE.md"
    )

with open(golden_dataset_path, 'r') as f:
    golden_dataset = json.load(f)

print(f"✅ Loaded {len(golden_dataset)} test cases")
print(f"📊 Breakdown by difficulty:")
for difficulty in ['easy', 'medium', 'hard']:
    count = sum(1 for t in golden_dataset if t['difficulty'] == difficulty)
    print(f"   - {difficulty}: {count} tests")

### Evaluation Functions

def calculate_mrr(results, expected_id):
    """
    Mean Reciprocal Rank: 1/rank of first correct result

    Returns:
        float: 1.0 if expected_id is rank 1, 0.5 if rank 2, 0.33 if rank 3, etc.
               0.0 if not found
    """
    for rank, doc in enumerate(results, 1):
        if doc.metadata.get('id') == expected_id:
            return 1.0 / rank
    return 0.0

def calculate_hit_at_k(results, expected_id, k=3):
    """
    Hit@K: Is correct result in top-K?

    Returns:
        float: 1.0 if found in top-K, 0.0 otherwise
    """
    top_k_ids = [doc.metadata.get('id') for doc in results[:k]]
    return 1.0 if expected_id in top_k_ids else 0.0

def calculate_hit_at_1(results, expected_id):
    """
    Hit@1: Is correct result the top result?

    Returns:
        float: 1.0 if rank 1, 0.0 otherwise
    """
    if results and results[0].metadata.get('id') == expected_id:
        return 1.0
    return 0.0

### Evaluate Single Retriever

def evaluate_retriever(retriever_name, retriever, golden_dataset, verbose=True):
    """
    Evaluate a single retriever on the golden dataset.

    Args:
        retriever_name: Name for display
        retriever: LangChain retriever instance
        golden_dataset: List of test cases
        verbose: Print progress

    Returns:
        dict: Evaluation results with metrics
    """
    if verbose:
        print(f"\n{'='*70}")
        print(f"Evaluating: {retriever_name}")
        print(f"{'='*70}")

    mrr_scores = []
    hit_at_1_scores = []
    hit_at_3_scores = []
    latencies = []
    errors = []

    for i, test in enumerate(golden_dataset):
        if verbose and (i + 1) % 5 == 0:
            print(f"  Progress: {i + 1}/{len(golden_dataset)} tests...")

        try:
            # Measure latency
            start = time.time()
            retrieved_docs = retriever.invoke(test["query"])
            latency = (time.time() - start) * 1000  # Convert to ms

            # Calculate metrics
            mrr = calculate_mrr(retrieved_docs, test["expected_id"])
            hit_at_1 = calculate_hit_at_1(retrieved_docs, test["expected_id"])
            hit_at_3 = calculate_hit_at_k(retrieved_docs, test["expected_id"], k=3)

            mrr_scores.append(mrr)
            hit_at_1_scores.append(hit_at_1)
            hit_at_3_scores.append(hit_at_3)
            latencies.append(latency)

        except Exception as e:
            errors.append({"test_id": test["test_id"], "error": str(e)})
            # Add zero scores for failed tests
            mrr_scores.append(0.0)
            hit_at_1_scores.append(0.0)
            hit_at_3_scores.append(0.0)
            latencies.append(0.0)

    # Calculate aggregate metrics
    results = {
        "Retriever": retriever_name,
        "MRR": round(np.mean(mrr_scores), 3),
        "Hit@1": round(np.mean(hit_at_1_scores), 3),
        "Hit@3": round(np.mean(hit_at_3_scores), 3),
        "Avg Latency (ms)": round(np.mean(latencies), 1),
        "Total Tests": len(golden_dataset),
        "Errors": len(errors)
    }

    if verbose:
        print(f"  ✅ Completed: {results['MRR']:.3f} MRR, {results['Hit@3']:.1%} Hit@3, {results['Avg Latency (ms)']:.0f}ms")
        if errors:
            print(f"  ⚠️  Errors: {len(errors)} test(s) failed")

    return results, errors

### Run Evaluation on All Retrievers

print("\n" + "="*70)
print("Starting Comprehensive Retrieval Evaluation")
print("="*70)

retrievers_to_test = {
    "1. Naive (Semantic)": naive_retriever,
    "2. BM25": bm25_retriever,
    "3. Multi-Query": multi_query_retriever,
    "4. Parent-Document": parent_document_retriever,
    "5. Contextual Compression (Rerank)": compression_retriever,
    "6. Ensemble (RRF)": ensemble_retriever,
    "7. Semantic Chunking": semantic_retriever
}

all_results = []
all_errors = {}

for name, retriever in retrievers_to_test.items():
    result, errors = evaluate_retriever(name, retriever, golden_dataset, verbose=True)
    all_results.append(result)
    if errors:
        all_errors[name] = errors

### Display Results

results_df = pd.DataFrame(all_results)
results_df = results_df.sort_values("MRR", ascending=False)

print("\n" + "="*80)
print("ComponentForge Retrieval Evaluation Results")
print("="*80)
print(results_df.to_string(index=False))
print("="*80)

### Detailed Analysis by Difficulty

print("\n" + "="*80)
print("Performance Breakdown by Query Difficulty")
print("="*80)

for difficulty in ['easy', 'medium', 'hard']:
    difficulty_tests = [t for t in golden_dataset if t['difficulty'] == difficulty]
    print(f"\n{difficulty.upper()} queries ({len(difficulty_tests)} tests):")

    for name, retriever in retrievers_to_test.items():
        result, _ = evaluate_retriever(
            name,
            retriever,
            difficulty_tests,
            verbose=False
        )
        print(f"  {name}: MRR={result['MRR']:.3f}, Hit@3={result['Hit@3']:.1%}")

### Cost Analysis

print("\n" + "="*80)
print("Cost Analysis (per 100 queries)")
print("="*80)

cost_estimates = {
    "1. Naive (Semantic)": 0.01,  # Embedding cost only
    "2. BM25": 0.00,  # No API calls
    "3. Multi-Query": 0.05,  # 3-5 LLM calls per query
    "4. Parent-Document": 0.01,  # Embedding cost only
    "5. Contextual Compression (Rerank)": 0.20,  # Cohere reranking
    "6. Ensemble (RRF)": 0.25,  # All above combined
    "7. Semantic Chunking": 0.01  # Embedding cost only
}

cost_df = results_df.copy()
cost_df["Cost per 100 Queries ($)"] = [cost_estimates[r] for r in cost_df["Retriever"]]
cost_df["Cost per Query ($)"] = cost_df["Cost per 100 Queries ($)"] / 100

print(cost_df[["Retriever", "MRR", "Hit@3", "Avg Latency (ms)", "Cost per 100 Queries ($)"]].to_string(index=False))

### Final Analysis and Recommendation

print("\n" + "="*80)
print("ANALYSIS & RECOMMENDATION")
print("="*80)

best_by_mrr = results_df.iloc[0]
best_by_hit3 = results_df.sort_values("Hit@3", ascending=False).iloc[0]
fastest = results_df.sort_values("Avg Latency (ms)", ascending=True).iloc[0]

analysis = f"""
📊 EVALUATION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dataset: {len(golden_dataset)} test queries across {len(component_patterns)} component patterns
Breakdown: {sum(1 for t in golden_dataset if t['difficulty']=='easy')} easy,
           {sum(1 for t in golden_dataset if t['difficulty']=='medium')} medium,
           {sum(1 for t in golden_dataset if t['difficulty']=='hard')} hard queries

🏆 BEST PERFORMERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Highest Accuracy (MRR): {best_by_mrr['Retriever']}
  ├─ MRR: {best_by_mrr['MRR']:.3f}
  ├─ Hit@3: {best_by_mrr['Hit@3']:.1%}
  └─ Latency: {best_by_mrr['Avg Latency (ms)']:.0f}ms

Best Top-3 Accuracy: {best_by_hit3['Retriever']}
  ├─ Hit@3: {best_by_hit3['Hit@3']:.1%}
  ├─ MRR: {best_by_hit3['MRR']:.3f}
  └─ Latency: {best_by_hit3['Avg Latency (ms)']:.0f}ms

Fastest Retrieval: {fastest['Retriever']}
  ├─ Latency: {fastest['Avg Latency (ms)']:.0f}ms
  ├─ MRR: {fastest['MRR']:.3f}
  └─ Cost: ${cost_estimates[fastest['Retriever']]:.4f}/query

💰 COST-PERFORMANCE TRADE-OFFS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Most Cost-Effective:
  - BM25: FREE, {results_df[results_df['Retriever']=='2. BM25']['MRR'].values[0]:.3f} MRR, {results_df[results_df['Retriever']=='2. BM25']['Avg Latency (ms)'].values[0]:.0f}ms
  - Good for exact keyword matches (component names, variant names)

Best Value (Performance/Cost):
  - Naive Semantic: $0.0001/query, {results_df[results_df['Retriever']=='1. Naive (Semantic)']['MRR'].values[0]:.3f} MRR
  - Good for semantic understanding, low cost

Premium Option (Highest Accuracy):
  - {best_by_mrr['Retriever']}: ${cost_estimates[best_by_mrr['Retriever']]:.4f}/query, {best_by_mrr['MRR']:.3f} MRR
  - Worth it if accuracy is critical

🎯 RECOMMENDATION FOR COMPONENTFORGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current State: {len(component_patterns)} component patterns (small corpus)

Best Strategy: [DETERMINE BASED ON YOUR RESULTS]

Reasoning:
1. Performance: [Which strategy had best MRR/Hit@3?]
2. Cost: [Is the performance gain worth the cost?]
3. Latency: [Is latency acceptable for your use case?]
4. Corpus Size: With only {len(component_patterns)} patterns, simpler strategies may suffice

Alternative Consideration:
- If expanding to 50+ patterns, re-evaluate reranking and ensemble strategies
- Current corpus is small enough that BM25 + Semantic fusion likely optimal

Production Deployment:
- Use: [YOUR CHOSEN STRATEGY]
- Fallback: BM25 for offline/low-cost scenarios
- Monitor: Hit@3 rate in production, adjust if < 90%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

print(analysis)

### Save Results

results_output_path = Path("../data/evaluation/retrieval_evaluation_results.json")
results_output_path.parent.mkdir(parents=True, exist_ok=True)

output_data = {
    "evaluation_date": pd.Timestamp.now().isoformat(),
    "corpus_size": len(component_patterns),
    "test_cases": len(golden_dataset),
    "results": all_results,
    "errors": all_errors,
    "cost_estimates": cost_estimates
}

with open(results_output_path, 'w') as f:
    json.dump(output_data, f, indent=2)

print(f"\n✅ Results saved to: {results_output_path}")
```

---

## Expected Results

### What Good Performance Looks Like

For a **10-pattern corpus**, expect:

| Retriever | MRR | Hit@3 | Latency | Cost/100 |
|-----------|-----|-------|---------|----------|
| BM25 | 0.65-0.75 | 85-90% | 15-30ms | $0 |
| Naive Semantic | 0.70-0.85 | 90-95% | 150-200ms | $0.01 |
| Multi-Query | 0.75-0.90 | 92-97% | 400-600ms | $0.05 |
| Compression/Rerank | 0.80-0.95 | 95-98% | 200-300ms | $0.20 |
| Ensemble | 0.75-0.90 | 93-97% | 500-700ms | $0.25 |

**Key Insights:**
- **Easy queries** (exact name): All retrievers should hit ~100%
- **Medium queries** (semantic): Naive/Compression excel
- **Hard queries** (ambiguous): Multi-Query and Ensemble help

### Interpreting MRR

- **MRR = 1.0**: Perfect (correct answer always rank 1)
- **MRR = 0.7**: Good (average rank ~1.4)
- **MRR = 0.5**: Acceptable (average rank 2)
- **MRR < 0.3**: Poor (average rank > 3)

### Interpreting Hit@3

- **Hit@3 > 95%**: Excellent retrieval
- **Hit@3 85-95%**: Good retrieval
- **Hit@3 < 85%**: Needs improvement

---

## Troubleshooting

### Issue 1: "Patterns directory not found"

**Solution:**
```python
# Adjust path based on notebook location
component_patterns = load_component_patterns("../../backend/data/patterns")

# Or use absolute path
import os
patterns_dir = os.path.join(os.getcwd(), "backend", "data", "patterns")
component_patterns = load_component_patterns(patterns_dir)
```

### Issue 2: "API rate limit exceeded"

**Solution:**
```python
import time

# Add delays between API calls
for test in golden_dataset:
    result = retriever.invoke(test["query"])
    time.sleep(0.5)  # 500ms delay
```

### Issue 3: "Multi-Query takes too long"

**Solution:**
```python
# Reduce number of query variations
# In MultiQueryRetriever, LLM generates ~3-5 queries by default
# You can't easily control this, but you can reduce test dataset size for quick tests

# Quick test with subset
quick_golden_dataset = golden_dataset[:10]  # Test with 10 instead of 30
```

### Issue 4: "Cohere API errors"

**Solution:**
```python
# Verify API key
import os
print(f"Cohere API Key set: {bool(os.getenv('COHERE_API_KEY'))}")

# Test with small batch first
compression_retriever.invoke("Button component")  # Should work if key is valid
```

### Issue 5: "Low MRR scores across all retrievers"

**Possible causes:**
1. **Incorrect expected_id in golden dataset**: Verify IDs match pattern JSONs exactly
2. **Poor document content**: Ensure patterns loaded correctly (check Task 2 output)
3. **Embedding issues**: Verify OpenAI API key and embeddings working

**Debug:**
```python
# Check what's actually being retrieved
test = golden_dataset[0]
results = naive_retriever.invoke(test["query"])

print(f"Query: {test['query']}")
print(f"Expected: {test['expected_id']}")
print(f"Retrieved IDs: {[d.metadata['id'] for d in results[:3]]}")

# If expected_id not in top-3, something is wrong with:
# - Document content (Task 2)
# - Expected IDs in golden dataset
# - Embeddings quality
```

---

## Summary Checklist

Before running evaluation, ensure:

- [ ] All 10 component pattern JSONs loaded successfully
- [ ] Qdrant vectorstores created (3 total: main, parent-doc children, semantic chunks)
- [ ] All 7 retrievers initialized without errors
- [ ] Golden dataset JSON created with 30 test cases
- [ ] API keys set (OPENAI_API_KEY, COHERE_API_KEY)
- [ ] Dependencies installed (langchain, cohere, pandas, numpy)
- [ ] Evaluation output directory exists: `backend/data/evaluation/`

**Run the notebook top-to-bottom and you should get complete evaluation results!**

---

## Next Steps After Evaluation

1. **Analyze Results**: Which retriever performed best for your patterns?
2. **Optimize Chosen Strategy**: Fine-tune parameters (k, weights, thresholds)
3. **Integrate into App**: Use winning strategy in `RetrievalService`
4. **Monitor Production**: Track Hit@3 with real user queries
5. **Re-evaluate at Scale**: When corpus grows to 50+ patterns, re-run evaluation

---

**Questions or Issues?** Refer to ComponentForge docs or LangChain documentation for advanced customization.
