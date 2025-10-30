# AI Pipeline Documentation

Comprehensive guide to ComponentForge's AI pipeline, covering LangChain, LangGraph, multi-agent orchestration, and LangSmith observability.

## Overview

ComponentForge's AI pipeline powers the entire design-to-code transformation using a sophisticated multi-agent architecture built on LangChain and LangGraph.

**Technology Stack:**
- **LangChain 0.1+** - LLM application framework
- **LangGraph 0.0.13+** - Multi-agent orchestration
- **LangSmith** - Observability, tracing, and monitoring
- **OpenAI GPT-4V** - Vision model for screenshot analysis
- **OpenAI GPT-4** - Text generation for code
- **text-embedding-3-small** - Semantic search embeddings (1536 dims)

**Key Features:**
- 🤖 Multi-agent system with 7 specialized agents
- 🔍 LangSmith tracing for all AI operations
- ♻️ Automatic retry logic with exponential backoff
- 📊 Token usage tracking and cost monitoring
- ⚡ Parallel agent execution
- 🎯 Structured output validation

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│            ComponentForge AI Pipeline                        │
└──────────────────────────────────────────────────────────────┘

Epic 1: Token Extraction (GPT-4V)
       ↓
┌──────────────────────────────────────────────────────────────┐
│  TokenExtractor Agent                                        │
│  • Model: GPT-4V                                             │
│  • Input: Screenshot/Figma file                              │
│  • Output: Design tokens (colors, typography, spacing)       │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
Epic 2: Requirement Extraction (Multi-Agent)
       ↓
┌──────────────────────────────────────────────────────────────┐
│  RequirementOrchestrator (LangGraph)                         │
│  Coordinates 5 specialized agents                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Agent 1: ComponentClassifier                                │
│  • Model: GPT-4V                                             │
│  • Task: Classify component type                             │
│  • Output: component_type + confidence                       │
│          ↓                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Parallel Agent Execution (asyncio.gather)           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                                                      │   │
│  │  Agent 2: PropsProposer                              │   │
│  │  • Model: GPT-4V                                     │   │
│  │  • Task: Propose component props                     │   │
│  │  • Output: List[RequirementProposal]                 │   │
│  │                                                      │   │
│  │  Agent 3: EventsProposer                             │   │
│  │  • Model: GPT-4V                                     │   │
│  │  • Task: Propose event handlers                      │   │
│  │  • Output: List[RequirementProposal]                 │   │
│  │                                                      │   │
│  │  Agent 4: StatesProposer                             │   │
│  │  • Model: GPT-4V                                     │   │
│  │  • Task: Propose state management                    │   │
│  │  • Output: List[RequirementProposal]                 │   │
│  │                                                      │   │
│  │  Agent 5: AccessibilityProposer                      │   │
│  │  • Model: GPT-4V                                     │   │
│  │  • Task: Propose a11y requirements                   │   │
│  │  • Output: List[RequirementProposal]                 │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│          ↓                                                   │
│  Aggregate & Deduplicate Results                             │
│          ↓                                                   │
│  RequirementState (all proposals)                            │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
Epic 3: Pattern Retrieval (Semantic Search)
       ↓
┌──────────────────────────────────────────────────────────────┐
│  SemanticRetriever                                           │
│  • Model: text-embedding-3-small (1536 dims)                 │
│  • Input: Requirements as text                               │
│  • Output: Query embedding                                   │
│          ↓                                                   │
│  Qdrant Vector Search (cosine similarity)                    │
│          ↓                                                   │
│  Top-3 shadcn/ui patterns                                    │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
Epic 4: Code Generation (GPT-4)
       ↓
┌──────────────────────────────────────────────────────────────┐
│  LLMComponentGenerator                                       │
│  • Model: GPT-4                                              │
│  • Input: Pattern + Tokens + Requirements                    │
│  • Output: Component.tsx + Stories + Showcase                │
│  • Features: Structured JSON output, retries                 │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  LangSmith Tracing (All Operations)                         │
│  • Trace every LLM call                                      │
│  • Track token usage and costs                               │
│  • Monitor latency and errors                                │
│  • Debug with full context                                   │
└──────────────────────────────────────────────────────────────┘
```

## Multi-Agent System (Epic 2)

### RequirementOrchestrator

**Purpose**: Coordinates the multi-agent workflow for requirement extraction

**Architecture:**
```python
class RequirementOrchestrator:
    def __init__(self, openai_api_key):
        # Initialize all agents
        self.classifier = ComponentClassifier(api_key)
        self.props_proposer = PropsProposer(api_key)
        self.events_proposer = EventsProposer(api_key)
        self.states_proposer = StatesProposer(api_key)
        self.a11y_proposer = AccessibilityProposer(api_key)

    @traced(run_name="propose_requirements")
    async def propose_requirements(self, image, figma_data, tokens):
        # Step 1: Classify component
        classification = await self.classifier.classify_component(image)

        # Step 2-5: Parallel execution of proposers
        props, events, states, a11y = await asyncio.gather(
            self.props_proposer.propose(image, classification, tokens),
            self.events_proposer.propose(image, classification, tokens),
            self.states_proposer.propose(image, classification, tokens),
            self.a11y_proposer.propose(image, classification, tokens)
        )

        # Aggregate results
        return RequirementState(
            classification=classification,
            props_proposals=props,
            events_proposals=events,
            states_proposals=states,
            accessibility_proposals=a11y
        )
```

**Execution Flow:**
1. **Sequential**: Component classification (must complete first)
2. **Parallel**: All 4 proposers run concurrently (4x faster)
3. **Aggregation**: Combine results into RequirementState

**Latency Optimization:**
- Without parallelization: ~20-30s (5 sequential API calls)
- With parallelization: ~8-12s (1 + 4 parallel calls)
- **Performance gain**: 2-3x faster

### Agent: ComponentClassifier

**Purpose**: Classify component type from screenshot

**Model**: GPT-4V (vision)

**Prompt Structure:**
```python
def create_classification_prompt(image_base64):
    return [
        {
            "role": "system",
            "content": "You are an expert at identifying UI components..."
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Classify this component into one of: button, card, input, modal, badge, tooltip, dropdown, navigation, layout, form, data_display"
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{image_base64}"}
                }
            ]
        }
    ]
```

**Output:**
```python
ComponentClassification(
    component_type=ComponentType.BUTTON,
    confidence=0.95,
    reasoning="The image shows a rounded button with 'Submit' text..."
)
```

**Tracing:**
```python
@traced(run_name="classify_component")
async def classify_component(self, image, figma_data):
    # Automatically traced in LangSmith
    response = await self.openai_client.chat.completions.create(...)
    return self._parse_response(response)
```

### Agent: PropsProposer

**Purpose**: Propose component props based on visual analysis

**Model**: GPT-4V (vision)

**Analysis:**
- Visual properties (colors, sizes, states)
- Interactive elements (clickable, hoverable)
- Customizable attributes (variant, size, disabled)

**Example Output:**
```python
[
    RequirementProposal(
        name="variant",
        value="primary | secondary | ghost",
        category=RequirementCategory.PROPS,
        confidence=0.92,
        reasoning="Button displays multiple visual styles"
    ),
    RequirementProposal(
        name="size",
        value="sm | md | lg",
        category=RequirementCategory.PROPS,
        confidence=0.88,
        reasoning="Button appears in different sizes"
    ),
    RequirementProposal(
        name="disabled",
        value="boolean",
        category=RequirementCategory.PROPS,
        confidence=0.90,
        reasoning="Disabled state visible in screenshot"
    )
]
```

### Agent: EventsProposer

**Purpose**: Propose event handlers for interactive elements

**Model**: GPT-4V (vision)

**Analysis:**
- Clickable elements
- Form inputs
- Hover interactions
- Focus events

**Example Output:**
```python
[
    RequirementProposal(
        name="onClick",
        value="() => void",
        category=RequirementCategory.EVENTS,
        confidence=0.95,
        reasoning="Button is interactive and requires click handler"
    ),
    RequirementProposal(
        name="onHover",
        value="() => void",
        category=RequirementCategory.EVENTS,
        confidence=0.75,
        reasoning="Button shows hover state in design"
    )
]
```

### Agent: StatesProposer

**Purpose**: Propose state management requirements

**Model**: GPT-4V (vision)

**Analysis:**
- Dynamic UI elements (loading, error states)
- Form controls (value, controlled components)
- Toggle states (expanded/collapsed)

**Example Output:**
```python
[
    RequirementProposal(
        name="isLoading",
        value="boolean",
        category=RequirementCategory.STATES,
        confidence=0.85,
        reasoning="Button shows loading spinner state"
    ),
    RequirementProposal(
        name="isOpen",
        value="boolean",
        category=RequirementCategory.STATES,
        confidence=0.90,
        reasoning="Modal requires open/closed state management"
    )
]
```

### Agent: AccessibilityProposer

**Purpose**: Propose WCAG accessibility requirements

**Model**: GPT-4V (vision)

**Analysis:**
- ARIA labels for screen readers
- Semantic HTML recommendations
- Keyboard navigation support
- Color contrast considerations

**Example Output:**
```python
[
    RequirementProposal(
        name="aria-label",
        value="string",
        category=RequirementCategory.ACCESSIBILITY,
        confidence=0.95,
        reasoning="Icon-only button needs descriptive label"
    ),
    RequirementProposal(
        name="role",
        value="dialog",
        category=RequirementCategory.ACCESSIBILITY,
        confidence=0.98,
        reasoning="Modal should use dialog role for semantics"
    ),
    RequirementProposal(
        name="keyboard-navigation",
        value="Tab, Escape, Enter",
        category=RequirementCategory.ACCESSIBILITY,
        confidence=0.90,
        reasoning="Modal requires keyboard accessibility"
    )
]
```

## Code Generation (Epic 4)

### LLMComponentGenerator

**Purpose**: Generate React/TypeScript code using GPT-4

**Model**: GPT-4 (text generation)

**Architecture:**
```python
class LLMComponentGenerator:
    def __init__(self, api_key, model="gpt-4o", max_retries=3):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
        self.max_retries = max_retries

    @traceable(run_type="llm", name="llm_generate_component")
    async def generate(self, system_prompt, user_prompt, temperature=0.7):
        # Retry loop with exponential backoff
        for attempt in range(self.max_retries):
            try:
                if attempt > 0:
                    await asyncio.sleep(2 ** attempt)  # 2s, 4s, 8s

                # Call OpenAI API with JSON mode
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=temperature,
                    response_format={"type": "json_object"},  # Structured output
                    timeout=60
                )

                # Parse and validate response
                result = json.loads(response.choices[0].message.content)
                self._validate_response(result)

                return LLMGeneratedCode(
                    component_code=result["component_code"],
                    stories_code=result["stories_code"],
                    showcase_code=result["showcase_code"],
                    imports=result["imports"],
                    exports=result["exports"],
                    explanation=result["explanation"],
                    token_usage={
                        "prompt_tokens": response.usage.prompt_tokens,
                        "completion_tokens": response.usage.completion_tokens
                    }
                )

            except Exception as e:
                last_error = e
                if attempt == self.max_retries - 1:
                    raise

        raise last_error
```

**Structured Output:**
```json
{
  "component_code": "// Complete TypeScript component...",
  "stories_code": "// Storybook stories...",
  "showcase_code": "// Live preview component...",
  "imports": ["React", "useState", "useEffect"],
  "exports": ["Button", "ButtonProps"],
  "explanation": "Generated a button component with variants..."
}
```

**Retry Logic:**
- **Attempt 1**: Immediate
- **Attempt 2**: 2s delay
- **Attempt 3**: 4s delay
- **Attempt 4**: 8s delay (if max_retries=3)

**Error Handling:**
- Rate limit errors → Retry with backoff
- Timeout errors → Retry with longer timeout
- Parse errors → Validate and retry
- Generic errors → Log and raise

### PromptBuilder

**Purpose**: Construct comprehensive prompts for code generation

**System Prompt:**
```python
SYSTEM_PROMPT = """You are an expert React and TypeScript developer specializing in creating accessible, production-ready UI components following shadcn/ui conventions.

Your expertise includes:
- Writing clean, type-safe TypeScript with strict mode (no 'any' types)
- Creating accessible components with proper ARIA attributes
- Following React best practices and modern patterns
- Implementing design systems with design tokens
- Writing comprehensive Storybook stories

CRITICAL REQUIREMENTS:
1. **Self-contained code**: Do NOT import from '@/lib/utils'
2. **ALWAYS inline the cn utility** at the top of your component
3. **Use cn() for all className merging**
4. **Static Tailwind classes only** - No dynamic class names
5. **Proper TypeScript** - NO 'any' types
6. **Conditional button semantics** - Only add role="button"/tabIndex if onClick exists
"""
```

**User Prompt:**
```python
USER_PROMPT = f"""Generate a React/TypeScript component based on this shadcn/ui pattern:

PATTERN REFERENCE:
{pattern_code}

DESIGN TOKENS:
Colors: {tokens['colors']}
Typography: {tokens['typography']}
Spacing: {tokens['spacing']}

REQUIREMENTS:
Props: {requirements['props']}
Events: {requirements['events']}
States: {requirements['states']}
Accessibility: {requirements['accessibility']}

Generate:
1. Component code (TypeScript)
2. Storybook stories
3. Showcase with variant examples

Return as JSON with keys: component_code, stories_code, showcase_code, imports, exports, explanation
"""
```

## Semantic Search (Epic 3)

### SemanticRetriever

**Purpose**: Vector search for component patterns

**Model**: text-embedding-3-small (1536 dimensions)

**Architecture:**
```python
class SemanticRetriever:
    def __init__(self, qdrant_client, openai_client):
        self.qdrant_client = qdrant_client
        self.openai_client = openai_client
        self.embedding_model = "text-embedding-3-small"
        self.collection_name = "patterns"

    async def search(self, query: str, top_k: int = 10):
        # Step 1: Generate query embedding
        embedding = await self._generate_embedding(query)

        # Step 2: Search Qdrant
        results = self.qdrant_client.search(
            collection_name=self.collection_name,
            query_vector=embedding,
            limit=top_k
        )

        return results

    async def _generate_embedding(self, text: str):
        # Call OpenAI embeddings API
        response = await self.openai_client.embeddings.create(
            model=self.embedding_model,
            input=text
        )
        return response.data[0].embedding
```

**Embedding Process:**
1. Transform requirements → search query text
2. Call OpenAI embeddings API
3. Get 1536-dimensional vector
4. Search Qdrant with cosine similarity

**Performance:**
- Embedding generation: ~200-300ms
- Qdrant search: ~50-100ms
- **Total**: <500ms

## LangSmith Tracing

### Setup

**Environment Variables:**
```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_your-api-key
LANGCHAIN_PROJECT=component-forge-production
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
```

**Automatic Tracing:**
All functions with `@traceable` or `@traced` are automatically traced:

```python
from langsmith import traceable

@traceable(run_type="llm", name="generate_component")
async def generate_component(prompt):
    # Automatically traced
    response = await llm.generate(prompt)
    return response
```

### Trace Hierarchy

**Example Trace Tree:**
```
📊 propose_requirements (8.2s)
├─ 🔍 classify_component (2.1s)
│  └─ 🤖 OpenAI GPT-4V call (2.0s)
│     • Model: gpt-4-vision-preview
│     • Tokens: 1,234 (prompt) + 156 (completion)
│     • Cost: $0.03
├─ 📋 propose_props (2.5s)
│  └─ 🤖 OpenAI GPT-4V call (2.4s)
├─ 🎯 propose_events (2.3s)
│  └─ 🤖 OpenAI GPT-4V call (2.2s)
├─ 📊 propose_states (2.1s)
│  └─ 🤖 OpenAI GPT-4V call (2.0s)
└─ ♿ propose_accessibility (2.4s)
   └─ 🤖 OpenAI GPT-4V call (2.3s)
```

**Trace Details:**
- **Inputs**: Function arguments
- **Outputs**: Return values
- **Metadata**: Model, temperature, tokens
- **Timing**: Start/end timestamps, duration
- **Errors**: Full stack trace if error occurred

### Monitoring Dashboard

**View in LangSmith:**
```
https://smith.langchain.com/

Project: component-forge-production
Filters:
- Time range: Last 7 days
- Operation: llm_generate_component
- Status: error
```

**Key Metrics:**
- **Latency**: p50, p95, p99 by operation
- **Token Usage**: Total tokens per day/week
- **Costs**: Estimated cost per operation
- **Error Rate**: % of failed operations
- **Throughput**: Requests per minute

**Alerts:**
- Latency > 60s for code generation
- Error rate > 5%
- Daily cost > $100
- Token usage spike

## Token Tracking

### Usage Monitoring

**Per-Operation Tracking:**
```python
@traceable(run_name="extract_tokens")
async def extract_tokens(image):
    response = await openai_client.chat.completions.create(...)

    # Log token usage
    token_usage = {
        "prompt_tokens": response.usage.prompt_tokens,
        "completion_tokens": response.usage.completion_tokens,
        "total_tokens": response.usage.total_tokens
    }

    logger.info(
        "Token extraction complete",
        extra={"extra": {"token_usage": token_usage}}
    )

    return result
```

**Cost Estimation:**
```python
def estimate_cost(token_usage, model="gpt-4o"):
    # Pricing (as of 2025-01)
    prices = {
        "gpt-4o": {
            "prompt": 0.00001,  # $0.01 per 1K tokens
            "completion": 0.00003  # $0.03 per 1K tokens
        },
        "gpt-4-vision-preview": {
            "prompt": 0.00001,
            "completion": 0.00003
        },
        "text-embedding-3-small": {
            "prompt": 0.00002,  # $0.02 per 1K tokens
            "completion": 0
        }
    }

    prompt_cost = (token_usage["prompt_tokens"] / 1000) * prices[model]["prompt"]
    completion_cost = (token_usage["completion_tokens"] / 1000) * prices[model]["completion"]

    return {
        "prompt_cost": prompt_cost,
        "completion_cost": completion_cost,
        "total_cost": prompt_cost + completion_cost
    }
```

**Typical Token Counts:**
- Component classification: ~1,500 prompt + 200 completion
- Requirement proposal (each): ~1,800 prompt + 300 completion
- Code generation: ~3,500 prompt + 1,200 completion
- Embedding generation: ~100 tokens

**Cost Per Operation:**
- Token extraction: ~$0.02
- Requirement extraction: ~$0.06 (4 proposers)
- Code generation: ~$0.05
- Pattern search (embedding): ~$0.0002
- **Total per component**: ~$0.13

## Prompt Engineering

### Best Practices

**1. Clear Instructions:**
```python
# Good
"Classify this component into one of: button, card, input, modal"

# Bad
"Tell me what kind of component this is"
```

**2. Structured Output:**
```python
# Good
"Return as JSON with keys: component_type, confidence, reasoning"

# Bad
"Give me the component type with confidence"
```

**3. Examples (Few-Shot Learning):**
```python
PROMPT = """
Examples:
1. Input: [button screenshot] → Output: {"type": "button", "confidence": 0.95}
2. Input: [card screenshot] → Output: {"type": "card", "confidence": 0.92}

Now classify this component: [new screenshot]
"""
```

**4. Constraints:**
```python
PROMPT = """
CRITICAL REQUIREMENTS:
1. NO dynamic class names (e.g., bg-${variant})
2. ALWAYS use cn() utility for className merging
3. NO 'any' types in TypeScript
"""
```

**5. Role Definition:**
```python
SYSTEM_PROMPT = """
You are an expert React and TypeScript developer specializing in accessible, production-ready components.
"""
```

### Prompt Templates

**Location**: `backend/src/prompts/`

**Files:**
- `component_classifier.py` - Classification prompts
- `token_extraction.py` - Token extraction prompts
- `props_proposer.py` - Props proposal prompts
- `events_proposer.py` - Events proposal prompts
- `states_proposer.py` - States proposal prompts
- `accessibility_proposer.py` - A11y proposal prompts

**Structure:**
```python
def create_props_proposal_prompt(
    image_base64: str,
    component_type: str,
    tokens: Dict[str, Any]
) -> List[Dict]:
    return [
        {
            "role": "system",
            "content": f"You are proposing props for a {component_type} component..."
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": f"Design tokens: {json.dumps(tokens)}\n\nPropose component props..."
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{image_base64}"}
                }
            ]
        }
    ]
```

## Performance Optimization

### 1. Parallel Execution

**Multi-Agent Orchestration:**
```python
# Sequential (slow): 20-30s
classification = await classify_component(...)
props = await propose_props(...)
events = await propose_events(...)
states = await propose_states(...)
a11y = await propose_accessibility(...)

# Parallel (fast): 8-12s
classification = await classify_component(...)
props, events, states, a11y = await asyncio.gather(
    propose_props(...),
    propose_events(...),
    propose_states(...),
    propose_accessibility(...)
)
```

**Performance Gain**: 2-3x faster

### 2. Caching

**Embedding Cache:**
```python
@cache_decorator(ttl=86400)  # 24 hours
async def get_pattern_embedding(pattern_id: str):
    # Cache embeddings for patterns
    embedding = await generate_embedding(pattern_text)
    return embedding
```

**Pattern Cache:**
```python
# Cache loaded patterns in memory
patterns = None

def get_patterns():
    global patterns
    if patterns is None:
        patterns = load_pattern_library()
    return patterns
```

### 3. Batch Processing

**Embedding Batches:**
```python
# Single calls (slow)
embedding1 = await generate_embedding(text1)
embedding2 = await generate_embedding(text2)
embedding3 = await generate_embedding(text3)

# Batch call (fast)
response = await openai_client.embeddings.create(
    model="text-embedding-3-small",
    input=[text1, text2, text3]
)
embeddings = [item.embedding for item in response.data]
```

### 4. Timeout Configuration

**Appropriate Timeouts:**
```python
# Classification: Fast operation
classification_timeout = 10

# Code generation: Slow operation
generation_timeout = 60

# Embedding: Very fast
embedding_timeout = 5
```

### 5. Model Selection

**Trade-offs:**
- **GPT-4 Turbo**: Faster, slightly lower quality
- **GPT-4**: Slower, higher quality
- **GPT-3.5 Turbo**: Very fast, lower quality

**Recommendation**: Use GPT-4 for code generation, GPT-4 Turbo for requirement extraction

## Error Handling

### Retry Strategies

**Exponential Backoff:**
```python
async def call_with_retry(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return await func()
        except RateLimitError:
            if attempt < max_retries - 1:
                delay = 2 ** attempt  # 1s, 2s, 4s
                await asyncio.sleep(delay)
            else:
                raise
        except TimeoutError:
            if attempt < max_retries - 1:
                timeout *= 1.5  # Increase timeout
            else:
                raise
```

### Error Types

**1. Rate Limit Errors:**
```python
try:
    response = await openai_client.chat.completions.create(...)
except RateLimitError as e:
    logger.warning("Rate limit hit, retrying...")
    await asyncio.sleep(2)
    response = await openai_client.chat.completions.create(...)
```

**2. Timeout Errors:**
```python
try:
    response = await asyncio.wait_for(
        openai_client.chat.completions.create(...),
        timeout=60
    )
except asyncio.TimeoutError:
    logger.error("OpenAI API timeout")
    raise ServiceError("Code generation timed out")
```

**3. Parse Errors:**
```python
try:
    result = json.loads(response.content)
except json.JSONDecodeError:
    logger.error("Failed to parse LLM response")
    raise ValidationError("Invalid JSON response from LLM")
```

**4. Validation Errors:**
```python
def validate_response(result):
    required_keys = ["component_code", "stories_code", "showcase_code"]
    missing = [k for k in required_keys if k not in result]

    if missing:
        raise ValidationError(f"Missing keys in LLM response: {missing}")
```

## Debugging

### LangSmith Debugging

**View Trace:**
1. Go to https://smith.langchain.com/
2. Select project: `component-forge-production`
3. Find trace by request ID
4. Inspect inputs, outputs, errors

**Debug Failed Operations:**
```python
# Filter for errors
https://smith.langchain.com/?filter=status:error

# View specific operation
https://smith.langchain.com/trace/<trace_id>
```

**Replay Failed Requests:**
- Copy inputs from trace
- Run locally with same inputs
- Debug step-by-step

### Local Debugging

**Print Prompts:**
```python
logger.info("Generated prompt", extra={"extra": {"prompt": user_prompt}})
```

**Inspect Responses:**
```python
logger.info("LLM response", extra={"extra": {"response": response.content}})
```

**Trace Execution:**
```python
import pdb; pdb.set_trace()  # Breakpoint
# Or use debugger in VS Code
```

## See Also

- [Backend Architecture](./architecture.md) - Overall backend design
- [Database Schema](./database-schema.md) - Data models
- [Observability](../features/observability.md) - LangSmith monitoring
- [Deployment Guide](../deployment.md) - Production deployment
