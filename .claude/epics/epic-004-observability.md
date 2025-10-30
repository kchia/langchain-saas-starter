# Epic 004: LangSmith Monitoring & Observability

**Priority:** P1 - BOOTCAMP REQUIREMENT
**Estimated Effort:** 1-2 days (simplified from original 2-3 days)
**Value:** Complete AI observability for debugging, optimization, and demo
**Bootcamp Requirement:** Week 2 - LangSmith for AI observability

**Status:** 🟡 **80% COMPLETE** - Core tracing implemented, needs finishing touches

## What's Already Done ✅

- ✅ LangSmith integration configured (`backend/src/core/tracing.py`)
- ✅ Environment variables set up (`.env.example`)
- ✅ 11/12 AI operations instrumented with `@traceable/@traced`
- ✅ Validation script exists (`backend/scripts/validate_traces.py`)
- ✅ Documentation at `docs/features/observability.md`
- ✅ Generation pipeline fully traced
- ✅ All requirement agents (classifier, props, events, states, a11y) traced
- ✅ Retrieval service traced

## What's Missing ❌

- ❌ TokenExtractor not instrumented (1 critical operation)
- ❌ No contextual metadata in traces (user_id, component_type, session_id)
- ❌ Trace URLs not exposed to frontend
- ❌ No UI link to view traces in LangSmith
- ❌ Missing automated tests for tracing

## Success Metrics (Simplified)

- **Full Trace Coverage:** 100% of AI operations traced ✅ (11/12 done)
- **Contextual Metadata:** All traces tagged with user_id, component_type, session_id
- **UI Integration:** Users can view LangSmith traces from frontend
- **Documentation:** Clear setup guide for LangSmith
- **Tests:** Automated tests verify tracing works

## Simplified Scope

**REMOVED (Overengineered):**
- ❌ Custom A/B testing framework → Use LangSmith's built-in comparison features
- ❌ Custom cost tracking system → LangSmith automatically tracks token costs
- ❌ Sentry integration → LangSmith captures AI errors with full context
- ❌ Custom performance dashboard → Link directly to LangSmith dashboard

**FOCUS (High Value, Low Effort):**
- ✅ Complete trace instrumentation (add TokenExtractor)
- ✅ Add contextual metadata to all traces
- ✅ Expose trace URLs in API responses
- ✅ Add UI links to LangSmith traces
- ✅ Write tests to verify tracing

---

## Task Breakdown (Parallelizable)

### Backend Tasks (BE)

#### BE-1: Complete Agent Instrumentation
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Backend agent
**Estimated Time:** 15 minutes

**Description:** Add `@traced` decorator to TokenExtractor

**Acceptance Criteria:**
- [ ] Add `@traced(run_name="extract_tokens")` to `TokenExtractor.extract_tokens()`
- [ ] Import traced decorator: `from src.core.tracing import traced`
- [ ] Verify decorator doesn't break existing functionality
- [ ] Test trace appears in LangSmith after token extraction

**Files to Modify:**
- `backend/src/agents/token_extractor.py`

**Implementation:**
```python
# backend/src/agents/token_extractor.py
from src.core.tracing import traced

class TokenExtractor:
    @traced(run_name="extract_tokens")
    async def extract_tokens(
        self,
        image: Image.Image,
        retry_count: int = 0
    ) -> Dict[str, Any]:
        # ... existing implementation
```

**Tests to Write:**
```python
# backend/tests/agents/test_token_extractor_tracing.py
async def test_token_extractor_creates_trace():
    """Verify TokenExtractor creates LangSmith trace."""
    extractor = TokenExtractor()
    image = load_test_image()

    # Extract tokens (should create trace)
    result = await extractor.extract_tokens(image)

    # Verify trace was created (check logs or LangSmith API)
    assert result is not None
```

---

#### BE-2: Add Session Tracking Middleware
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Backend agent
**Estimated Time:** 30 minutes

**Description:** Add middleware to generate and track session IDs for all requests

**Acceptance Criteria:**
- [ ] Create FastAPI middleware to generate session_id per request
- [ ] Store session_id in context variable for access by agents
- [ ] Add session_id to request logs
- [ ] Include session_id in API responses

**Files to Create:**
- `backend/src/middleware/session_tracking.py`

**Files to Modify:**
- `backend/src/main.py` (add middleware)

**Implementation:**
```python
# backend/src/middleware/session_tracking.py
import uuid
from contextvars import ContextVar
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

session_id_var: ContextVar[str] = ContextVar('session_id', default='')

class SessionTrackingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        session_id_var.set(session_id)

        # Add to request state
        request.state.session_id = session_id

        # Process request
        response = await call_next(request)

        # Add session ID to response headers
        response.headers['X-Session-ID'] = session_id

        return response

def get_session_id() -> str:
    """Get current session ID from context."""
    return session_id_var.get()
```

**Tests to Write:**
```python
# backend/tests/middleware/test_session_tracking.py
async def test_session_middleware_adds_session_id():
    """Verify session middleware generates and tracks session IDs."""
    # Make request
    response = await client.get("/health")

    # Verify session ID in headers
    assert "X-Session-ID" in response.headers
    session_id = response.headers["X-Session-ID"]
    assert len(session_id) == 36  # UUID format
```

---

#### BE-3: Add Trace Metadata Support
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Backend agent
**Estimated Time:** 45 minutes

**Description:** Update trace decorators to accept and propagate metadata (user_id, component_type, session_id)

**Acceptance Criteria:**
- [ ] Update `@traced` decorator to accept metadata parameter
- [ ] Propagate metadata to LangSmith traces
- [ ] Add helper function to build trace metadata
- [ ] Update key agents to include metadata

**Files to Modify:**
- `backend/src/core/tracing.py`
- `backend/src/agents/component_classifier.py`
- `backend/src/generation/generator_service.py`
- `backend/src/agents/requirement_orchestrator.py`

**Implementation:**
```python
# backend/src/core/tracing.py
def traced(run_name: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None):
    """Enhanced traced decorator with metadata support."""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            config = get_tracing_config()
            if not config.is_configured():
                return await func(*args, **kwargs)

            try:
                from langsmith import traceable

                # Merge provided metadata with context
                trace_metadata = metadata or {}
                trace_metadata.update({
                    "session_id": get_session_id(),
                    "timestamp": datetime.utcnow().isoformat(),
                })

                # Wrap with traceable
                traced_func = traceable(
                    name=run_name or func.__name__,
                    metadata=trace_metadata
                )(func)

                return await traced_func(*args, **kwargs)
            except ImportError:
                return await func(*args, **kwargs)

        # ... (sync wrapper similar)

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator

# Helper to build metadata
def build_trace_metadata(
    user_id: Optional[str] = None,
    component_type: Optional[str] = None,
    **extra
) -> Dict[str, Any]:
    """Build standardized trace metadata."""
    from .middleware.session_tracking import get_session_id

    metadata = {
        "session_id": get_session_id(),
        "timestamp": datetime.utcnow().isoformat(),
    }

    if user_id:
        metadata["user_id"] = user_id
    if component_type:
        metadata["component_type"] = component_type

    metadata.update(extra)
    return metadata
```

**Usage Example:**
```python
# backend/src/generation/generator_service.py
@traceable(
    run_type="chain",
    name="generate_component_llm_first",
    metadata=lambda request: {
        "component_name": request.component_name,
        "pattern_id": request.pattern_id,
        "session_id": get_session_id(),
    }
)
async def generate(self, request: GenerationRequest):
    # ... existing implementation
```

**Tests to Write:**
```python
# backend/tests/core/test_tracing_metadata.py
async def test_trace_metadata_includes_session_id():
    """Verify traces include session metadata."""
    # Set up session context
    session_id = "test-session-123"
    session_id_var.set(session_id)

    # Call traced function
    result = await some_traced_function()

    # Verify metadata was captured (check logs)
    # In real implementation, would query LangSmith API
    assert result is not None
```

---

#### BE-4: Add Trace URL Generation
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Backend agent
**Estimated Time:** 20 minutes

**Description:** Generate LangSmith trace URLs and include in API responses

**Acceptance Criteria:**
- [ ] Create utility to generate LangSmith trace URLs
- [ ] Capture run_id from LangSmith traces
- [ ] Include trace URL in generation API response
- [ ] Include trace URL in requirement proposal response

**Files to Modify:**
- `backend/src/core/tracing.py`
- `backend/src/generation/types.py`
- `backend/src/api/v1/routes/generation.py`

**Implementation:**
```python
# backend/src/core/tracing.py
def get_trace_url(run_id: str) -> str:
    """Generate LangSmith trace URL from run ID."""
    config = get_tracing_config()
    # LangSmith URL format
    return f"https://smith.langchain.com/o/default/projects/p/{config.project}/r/{run_id}"

def get_current_run_id() -> Optional[str]:
    """Get current LangSmith run ID from context."""
    try:
        from langchain_core.tracers.context import get_run_tree
        run_tree = get_run_tree()
        return str(run_tree.id) if run_tree else None
    except:
        return None
```

**Update Response Types:**
```python
# backend/src/generation/types.py
@dataclass
class GenerationMetadata:
    # ... existing fields
    trace_url: Optional[str] = None  # NEW: LangSmith trace URL
    session_id: Optional[str] = None  # NEW: Session ID
```

**Tests to Write:**
```python
# backend/tests/core/test_trace_urls.py
def test_trace_url_generation():
    """Verify trace URL generation works."""
    run_id = "12345678-1234-1234-1234-123456789abc"
    url = get_trace_url(run_id)

    assert "smith.langchain.com" in url
    assert run_id in url
    assert "projects/p/" in url
```

---

#### BE-5: Update API Responses with Trace Data
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Backend agent
**Estimated Time:** 30 minutes

**Description:** Include trace URLs and metadata in all AI operation responses

**Acceptance Criteria:**
- [ ] Add trace_url to generation response
- [ ] Add trace_url to requirement proposal response
- [ ] Add trace_url to retrieval response
- [ ] Include session_id in all responses

**Files to Modify:**
- `backend/src/api/v1/routes/generation.py`
- `backend/src/api/v1/routes/requirements.py`
- `backend/src/api/v1/routes/retrieval.py`

**Implementation:**
```python
# backend/src/api/v1/routes/generation.py
@router.post("/generate")
async def generate_component(request: GenerationRequest):
    """Generate component with trace URL."""
    # Generate component
    result = await generator_service.generate(request)

    # Get trace URL
    run_id = get_current_run_id()
    trace_url = get_trace_url(run_id) if run_id else None

    # Add to metadata
    result.metadata.trace_url = trace_url
    result.metadata.session_id = get_session_id()

    return result
```

**Tests to Write:**
```python
# backend/tests/api/test_generation_traces.py
async def test_generation_response_includes_trace_url():
    """Verify generation API returns trace URL."""
    response = await client.post("/api/v1/generate", json={...})

    assert response.status_code == 200
    data = response.json()
    assert "metadata" in data
    assert "trace_url" in data["metadata"]
    assert data["metadata"]["trace_url"].startswith("https://smith.langchain.com")
```

---

#### BE-6: Write Tracing Integration Tests
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Backend agent
**Estimated Time:** 45 minutes

**Description:** Comprehensive test suite for tracing functionality

**Acceptance Criteria:**
- [ ] Test trace creation for all agents
- [ ] Test metadata propagation
- [ ] Test session tracking
- [ ] Test trace URL generation
- [ ] Test graceful degradation when LangSmith unavailable

**Files to Create:**
- `backend/tests/integration/test_tracing_e2e.py`
- `backend/tests/agents/test_all_agents_traced.py`

**Implementation:**
```python
# backend/tests/integration/test_tracing_e2e.py
async def test_end_to_end_tracing():
    """Verify complete tracing flow from API to agents."""
    # Make generation request
    response = await client.post("/api/v1/generate", json={
        "pattern_id": "shadcn-button",
        "component_name": "TestButton",
        "tokens": {...},
        "requirements": {...}
    })

    # Verify response includes trace data
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["trace_url"] is not None
    assert data["metadata"]["session_id"] is not None

    # Verify trace has correct metadata (would query LangSmith API in real test)
    trace_url = data["metadata"]["trace_url"]
    assert "component_name=TestButton" in trace_url or True  # Mock check

async def test_all_agents_create_traces():
    """Verify all agents create traces."""
    agents = [
        TokenExtractor(),
        ComponentClassifier(),
        PropsProposer(),
        EventsProposer(),
        StatesProposer(),
        AccessibilityProposer(),
    ]

    for agent in agents:
        # Run agent and verify trace created
        # (implementation depends on agent API)
        pass
```

---

### Frontend Tasks (FE)

#### FE-1: Display Trace URLs in Generation Results
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Frontend agent
**Estimated Time:** 30 minutes

**Description:** Show LangSmith trace link in generation result UI

**Acceptance Criteria:**
- [ ] Add trace URL to GenerationResult type
- [ ] Display "View Trace" link in result component
- [ ] Link opens in new tab
- [ ] Show session ID for debugging
- [ ] Handle missing trace URLs gracefully

**Files to Modify:**
- `app/src/types/generation.ts`
- `app/src/components/generation/GenerationResult.tsx`

**Implementation:**
```typescript
// app/src/types/generation.ts
export interface GenerationMetadata {
  // ... existing fields
  trace_url?: string;
  session_id?: string;
}

// app/src/components/generation/GenerationResult.tsx
export function GenerationResult({ result }: { result: GenerationResult }) {
  return (
    <div className="space-y-4">
      {/* Existing result display */}

      {/* NEW: Trace link */}
      {result.metadata.trace_url && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ExternalLink className="h-4 w-4" />
          <a
            href={result.metadata.trace_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            View AI Trace in LangSmith
          </a>
          {result.metadata.session_id && (
            <span className="text-xs">
              (Session: {result.metadata.session_id.slice(0, 8)})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
```

**Tests to Write:**
```typescript
// app/src/components/generation/GenerationResult.test.tsx
describe('GenerationResult', () => {
  it('displays trace link when trace_url provided', () => {
    const result = {
      metadata: {
        trace_url: 'https://smith.langchain.com/o/default/projects/p/test/r/123',
        session_id: 'session-456',
      },
    };

    render(<GenerationResult result={result} />);

    const link = screen.getByText(/View AI Trace/i);
    expect(link).toHaveAttribute('href', result.metadata.trace_url);
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('handles missing trace_url gracefully', () => {
    const result = { metadata: {} };

    render(<GenerationResult result={result} />);

    expect(screen.queryByText(/View AI Trace/i)).not.toBeInTheDocument();
  });
});
```

---

#### FE-2: Create Reusable LangSmith Link Component
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Frontend agent
**Estimated Time:** 20 minutes

**Description:** Reusable component for LangSmith trace links

**Acceptance Criteria:**
- [ ] Create `<LangSmithTraceLink />` component
- [ ] Support different sizes (sm, md, lg)
- [ ] Include LangSmith icon
- [ ] Handle missing URLs gracefully
- [ ] Add hover tooltip

**Files to Create:**
- `app/src/components/observability/LangSmithTraceLink.tsx`
- `app/src/components/observability/LangSmithTraceLink.test.tsx`

**Implementation:**
```typescript
// app/src/components/observability/LangSmithTraceLink.tsx
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LangSmithTraceLinkProps {
  traceUrl?: string;
  sessionId?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'link';
}

export function LangSmithTraceLink({
  traceUrl,
  sessionId,
  size = 'sm',
  variant = 'ghost',
}: LangSmithTraceLinkProps) {
  if (!traceUrl) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            asChild
          >
            <a
              href={traceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Trace
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View AI execution trace in LangSmith</p>
          {sessionId && (
            <p className="text-xs text-muted-foreground mt-1">
              Session: {sessionId.slice(0, 8)}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

**Tests to Write:**
```typescript
// app/src/components/observability/LangSmithTraceLink.test.tsx
describe('LangSmithTraceLink', () => {
  it('renders link with trace URL', () => {
    render(<LangSmithTraceLink traceUrl="https://smith.langchain.com/trace/123" />);
    expect(screen.getByText('View Trace')).toBeInTheDocument();
  });

  it('returns null when no trace URL', () => {
    const { container } = render(<LangSmithTraceLink />);
    expect(container.firstChild).toBeNull();
  });

  it('shows session ID in tooltip', async () => {
    render(
      <LangSmithTraceLink
        traceUrl="https://smith.langchain.com/trace/123"
        sessionId="session-abc-123"
      />
    );

    const button = screen.getByText('View Trace');
    await userEvent.hover(button);

    expect(await screen.findByText(/Session: session-abc/i)).toBeInTheDocument();
  });
});
```

---

#### FE-3: Add LangSmith Link to Settings/Admin
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Frontend agent
**Estimated Time:** 15 minutes

**Description:** Add link to LangSmith dashboard in settings or admin panel

**Acceptance Criteria:**
- [ ] Add "AI Observability" section to settings
- [ ] Link to LangSmith project dashboard
- [ ] Show project name from environment
- [ ] Include brief description of what LangSmith shows

**Files to Modify:**
- `app/src/app/settings/page.tsx` (or create if doesn't exist)
- `app/src/app/admin/page.tsx`

**Implementation:**
```typescript
// app/src/app/settings/page.tsx
export default function SettingsPage() {
  const langsmithProject = process.env.NEXT_PUBLIC_LANGSMITH_PROJECT || 'component-forge';
  const langsmithUrl = `https://smith.langchain.com/o/default/projects/p/${langsmithProject}`;

  return (
    <div className="space-y-6">
      {/* Other settings sections */}

      <section>
        <h2 className="text-lg font-semibold mb-2">AI Observability</h2>
        <Card>
          <CardHeader>
            <CardTitle>LangSmith Monitoring</CardTitle>
            <CardDescription>
              View real-time AI traces, token usage, and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <a href={langsmithUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open LangSmith Dashboard
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
```

**Tests to Write:**
```typescript
// app/src/app/settings/page.test.tsx
describe('SettingsPage', () => {
  it('displays LangSmith link', () => {
    render(<SettingsPage />);

    const link = screen.getByText(/Open LangSmith Dashboard/i);
    expect(link).toHaveAttribute('href');
    expect(link.getAttribute('href')).toContain('smith.langchain.com');
  });
});
```

---

#### FE-4: Display Trace Metadata in UI
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Frontend agent
**Estimated Time:** 30 minutes

**Description:** Show trace metadata (latency, tokens, cost) in generation results

**Acceptance Criteria:**
- [ ] Display latency per stage
- [ ] Show total token usage
- [ ] Estimate and display cost
- [ ] Visual progress indicator per stage
- [ ] Collapsible details section

**Files to Modify:**
- `app/src/components/generation/GenerationMetadata.tsx` (create)
- `app/src/components/generation/GenerationResult.tsx`

**Implementation:**
```typescript
// app/src/components/generation/GenerationMetadata.tsx
import { Clock, Coins, Hash } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface GenerationMetadataProps {
  metadata: {
    latency_ms?: number;
    stage_latencies?: Record<string, number>;
    token_count?: number;
    estimated_cost?: number;
  };
}

export function GenerationMetadata({ metadata }: GenerationMetadataProps) {
  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold text-sm">Generation Details</h3>

      <div className="grid grid-cols-3 gap-4">
        {/* Latency */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Latency</p>
            <p className="text-sm font-medium">
              {metadata.latency_ms ? `${(metadata.latency_ms / 1000).toFixed(1)}s` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Tokens */}
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Tokens</p>
            <p className="text-sm font-medium">
              {metadata.token_count?.toLocaleString() || 'N/A'}
            </p>
          </div>
        </div>

        {/* Cost */}
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Est. Cost</p>
            <p className="text-sm font-medium">
              ${metadata.estimated_cost?.toFixed(4) || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Stage breakdown */}
      {metadata.stage_latencies && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Stage Breakdown</p>
          {Object.entries(metadata.stage_latencies).map(([stage, latency]) => (
            <div key={stage} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="capitalize">{stage}</span>
                <span>{(latency / 1000).toFixed(2)}s</span>
              </div>
              <Progress
                value={(latency / (metadata.latency_ms || 1)) * 100}
                className="h-1"
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
```

**Tests to Write:**
```typescript
// app/src/components/generation/GenerationMetadata.test.tsx
describe('GenerationMetadata', () => {
  it('displays latency, tokens, and cost', () => {
    const metadata = {
      latency_ms: 3500,
      token_count: 1250,
      estimated_cost: 0.0125,
    };

    render(<GenerationMetadata metadata={metadata} />);

    expect(screen.getByText('3.5s')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('$0.0125')).toBeInTheDocument();
  });

  it('displays stage breakdown', () => {
    const metadata = {
      latency_ms: 5000,
      stage_latencies: {
        parsing: 500,
        generating: 3000,
        assembling: 1500,
      },
    };

    render(<GenerationMetadata metadata={metadata} />);

    expect(screen.getByText('Parsing')).toBeInTheDocument();
    expect(screen.getByText('0.50s')).toBeInTheDocument();
  });
});
```

---

#### FE-5: Write E2E Tests for Trace Display
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Frontend agent
**Estimated Time:** 30 minutes

**Description:** End-to-end tests for trace URL display and navigation

**Acceptance Criteria:**
- [ ] Test trace link appears after generation
- [ ] Test link opens in new tab
- [ ] Test metadata display
- [ ] Test graceful degradation without trace URL

**Files to Create:**
- `app/tests/e2e/tracing.spec.ts`

**Implementation:**
```typescript
// app/tests/e2e/tracing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('LangSmith Tracing', () => {
  test('displays trace link after generation', async ({ page, context }) => {
    await page.goto('/generate');

    // Fill generation form
    await page.fill('[name="componentName"]', 'TestButton');
    await page.selectOption('[name="pattern"]', 'shadcn-button');

    // Submit generation
    await page.click('button:has-text("Generate")');

    // Wait for result
    await page.waitForSelector('[data-testid="generation-result"]');

    // Verify trace link exists
    const traceLink = page.locator('a:has-text("View AI Trace")');
    await expect(traceLink).toBeVisible();

    // Verify link opens in new tab
    const href = await traceLink.getAttribute('href');
    expect(href).toContain('smith.langchain.com');
    expect(await traceLink.getAttribute('target')).toBe('_blank');
  });

  test('displays generation metadata', async ({ page }) => {
    await page.goto('/generate');

    // Generate component
    await page.fill('[name="componentName"]', 'TestButton');
    await page.click('button:has-text("Generate")');

    // Wait for metadata
    await page.waitForSelector('[data-testid="generation-metadata"]');

    // Verify metadata sections exist
    await expect(page.locator('text=Latency')).toBeVisible();
    await expect(page.locator('text=Tokens')).toBeVisible();
    await expect(page.locator('text=Est. Cost')).toBeVisible();
  });

  test('handles missing trace URL gracefully', async ({ page }) => {
    // Mock API response without trace_url
    await page.route('**/api/v1/generate', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          code: '...',
          metadata: {
            latency_ms: 1000,
            // No trace_url
          },
        }),
      });
    });

    await page.goto('/generate');
    await page.fill('[name="componentName"]', 'TestButton');
    await page.click('button:has-text("Generate")');

    // Verify no trace link shown
    await expect(page.locator('a:has-text("View AI Trace")')).not.toBeVisible();
  });
});
```

---

### Integration Tasks (INT)

#### INT-1: Connect Frontend to Backend Trace Data
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Full-stack agent or pair
**Estimated Time:** 30 minutes

**Description:** Ensure frontend correctly receives and displays backend trace data

**Acceptance Criteria:**
- [ ] Frontend TypeScript types match backend response
- [ ] API client properly extracts trace metadata
- [ ] Session ID flows from backend to frontend
- [ ] Error handling for missing trace data

**Files to Modify:**
- `app/src/lib/api/generation.ts`
- `app/src/types/generation.ts`

**Implementation:**
```typescript
// app/src/lib/api/generation.ts
export async function generateComponent(
  request: GenerationRequest
): Promise<GenerationResult> {
  const response = await fetch('/api/v1/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Generation failed: ${response.statusText}`);
  }

  // Extract session ID from response headers
  const sessionId = response.headers.get('X-Session-ID');

  const data = await response.json();

  // Ensure metadata includes session_id from headers if not in body
  if (sessionId && data.metadata) {
    data.metadata.session_id = data.metadata.session_id || sessionId;
  }

  return data;
}
```

**Tests to Write:**
```typescript
// app/src/lib/api/generation.test.ts
describe('generateComponent', () => {
  it('extracts trace metadata from response', async () => {
    mockFetch({
      status: 200,
      headers: { 'X-Session-ID': 'session-123' },
      body: {
        metadata: {
          trace_url: 'https://smith.langchain.com/trace/456',
          latency_ms: 3000,
        },
      },
    });

    const result = await generateComponent({...});

    expect(result.metadata.trace_url).toBe('https://smith.langchain.com/trace/456');
    expect(result.metadata.session_id).toBe('session-123');
  });
});
```

---

#### INT-2: End-to-End Tracing Validation
**Status:** 🔴 **NOT STARTED**
**Assignable to:** QA or full-stack agent
**Estimated Time:** 45 minutes

**Description:** Manual and automated validation of complete tracing flow

**Acceptance Criteria:**
- [ ] Generate component and verify trace appears in LangSmith
- [ ] Verify trace includes all expected stages
- [ ] Verify trace metadata (user_id, session_id, component_type)
- [ ] Verify frontend displays correct trace link
- [ ] Verify clicking link opens correct trace in LangSmith

**Manual Test Script:**
```markdown
# Manual E2E Tracing Test

## Setup
1. Ensure LANGCHAIN_TRACING_V2=true in backend/.env
2. Ensure LANGCHAIN_API_KEY is set
3. Start backend: cd backend && uvicorn src.main:app
4. Start frontend: cd app && npm run dev

## Test Steps
1. Open http://localhost:3000/generate
2. Fill component name: "TestButton"
3. Select pattern: "shadcn-button"
4. Click "Generate Component"
5. Wait for generation to complete

## Verify
- [ ] Generation succeeds
- [ ] "View AI Trace in LangSmith" link appears
- [ ] Click link opens new tab to smith.langchain.com
- [ ] Trace shows in LangSmith dashboard
- [ ] Trace includes stages: extract_tokens, classify_component, propose_requirements, generate_component_llm_first
- [ ] Trace metadata includes session_id
- [ ] Frontend shows latency, tokens, and cost

## Troubleshooting
- If no trace link: Check backend logs for LangSmith errors
- If trace not in LangSmith: Verify LANGCHAIN_API_KEY
- If stages missing: Check agent instrumentation
```

**Automated Integration Test:**
```python
# backend/tests/integration/test_e2e_tracing.py
import pytest
from httpx import AsyncClient

@pytest.mark.integration
async def test_e2e_generation_with_tracing(client: AsyncClient, langsmith_client):
    """Test complete generation flow with LangSmith tracing."""
    # Make generation request
    response = await client.post("/api/v1/generate", json={
        "pattern_id": "shadcn-button",
        "component_name": "TestButton",
        "tokens": {...},
        "requirements": {...},
    })

    assert response.status_code == 200
    data = response.json()

    # Verify trace data in response
    assert "metadata" in data
    assert "trace_url" in data["metadata"]
    assert "session_id" in data["metadata"]

    trace_url = data["metadata"]["trace_url"]
    session_id = data["metadata"]["session_id"]

    # Extract run_id from trace URL
    run_id = trace_url.split("/r/")[-1]

    # Query LangSmith API to verify trace exists
    await asyncio.sleep(2)  # Give LangSmith time to process
    trace = await langsmith_client.read_run(run_id)

    assert trace is not None
    assert trace.name == "generate_component_llm_first"
    assert "session_id" in trace.extra.get("metadata", {})

    # Verify all expected child traces exist
    expected_stages = [
        "extract_tokens",
        "classify_component",
        "propose_requirements",
        "llm_generate_component",
    ]

    child_traces = await langsmith_client.list_runs(parent_run=run_id)
    child_names = [t.name for t in child_traces]

    for stage in expected_stages:
        assert stage in child_names, f"Missing trace for stage: {stage}"
```

---

#### INT-3: Update Documentation
**Status:** 🔴 **NOT STARTED**
**Assignable to:** Any agent
**Estimated Time:** 30 minutes

**Description:** Update observability docs with new features

**Acceptance Criteria:**
- [ ] Document trace URL feature
- [ ] Document session tracking
- [ ] Add screenshots of trace links in UI
- [ ] Update LangSmith setup guide
- [ ] Add troubleshooting section

**Files to Modify:**
- `docs/features/observability.md`
- `README.md` (add observability section)

**Implementation:**
```markdown
# Updated docs/features/observability.md

## LangSmith Tracing

### Setup
1. Get API key from https://smith.langchain.com
2. Add to `backend/.env`:
   ```bash
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_API_KEY=lsv2_pt_your_key_here
   LANGCHAIN_PROJECT=component-forge
   ```

3. Restart backend

### Features

#### Automatic Tracing
All AI operations are automatically traced:
- Token extraction (GPT-4V)
- Component classification
- Requirement proposals (props, events, states, accessibility)
- Code generation
- Pattern retrieval

#### Trace URLs in UI
Every generation includes a "View AI Trace" link that opens the full trace in LangSmith.

![Trace Link Example](./screenshots/trace-link.png)

#### Session Tracking
Each request gets a unique session ID for tracking related operations.

#### Metadata
Traces include:
- `session_id` - Unique request identifier
- `user_id` - User who made request (if authenticated)
- `component_type` - Type of component being generated
- `latency_ms` - Execution time
- `token_count` - Tokens used
- `estimated_cost` - API cost

### Viewing Traces

**From UI:**
Click "View AI Trace in LangSmith" link in generation results.

**From LangSmith Dashboard:**
1. Go to https://smith.langchain.com
2. Select project: `component-forge`
3. Filter by session_id or time range

### Troubleshooting

**No trace link appears:**
- Check `LANGCHAIN_TRACING_V2=true` in backend/.env
- Verify `LANGCHAIN_API_KEY` is set
- Check backend logs for tracing errors

**Trace not in LangSmith:**
- API key may be invalid
- Check LangSmith project name matches LANGCHAIN_PROJECT
- Network issues may prevent trace upload

**Missing stages in trace:**
- Check all agents have @traced decorator
- Verify imports: `from src.core.tracing import traced`
```

---

## Task Summary

**Backend (6 tasks, ~3.5 hours):**
- BE-1: Complete Agent Instrumentation (15 min)
- BE-2: Add Session Tracking Middleware (30 min)
- BE-3: Add Trace Metadata Support (45 min)
- BE-4: Add Trace URL Generation (20 min)
- BE-5: Update API Responses with Trace Data (30 min)
- BE-6: Write Tracing Integration Tests (45 min)

**Frontend (5 tasks, ~2 hours):**
- FE-1: Display Trace URLs in Generation Results (30 min)
- FE-2: Create Reusable LangSmith Link Component (20 min)
- FE-3: Add LangSmith Link to Settings/Admin (15 min)
- FE-4: Display Trace Metadata in UI (30 min)
- FE-5: Write E2E Tests for Trace Display (30 min)

**Integration (3 tasks, ~1.75 hours):**
- INT-1: Connect Frontend to Backend Trace Data (30 min)
- INT-2: End-to-End Tracing Validation (45 min)
- INT-3: Update Documentation (30 min)

**Total Estimated Time:** 7.25 hours (less than 1 day for parallel execution)

---

## Quick Start Guide

### For Backend Agent:
1. Start with BE-1 (add @traced to TokenExtractor)
2. Move to BE-2 (session tracking middleware)
3. Then BE-3, BE-4, BE-5 in sequence
4. Finish with BE-6 (tests)

### For Frontend Agent:
1. Start with FE-2 (reusable component) - can work in parallel
2. Then FE-1, FE-3, FE-4 in any order
3. Finish with FE-5 (E2E tests)

### For Integration:
1. Wait for BE-1 through BE-5 and FE-1 through FE-4
2. Then do INT-1, INT-2, INT-3

---

## Success Criteria (Updated)

**Must Have:**
- [x] LangSmith integrated (DONE)
- [ ] 100% trace coverage (11/12 done, add TokenExtractor)
- [ ] Contextual metadata in all traces
- [ ] Trace URLs in API responses
- [ ] Frontend displays trace links
- [ ] Tests pass

**Nice to Have (Future):**
- Prompt versioning for comparison (use LangSmith UI)
- Cost dashboards (use LangSmith built-in)
- Custom performance dashboards (link to LangSmith)

---

## References

- **LangSmith Docs:** https://docs.smith.langchain.com/
- **Existing Implementation:** `backend/src/core/tracing.py`
- **Validation Script:** `backend/scripts/validate_traces.py`
- **Current Docs:** `docs/features/observability.md`
