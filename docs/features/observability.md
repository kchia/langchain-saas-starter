# Observability

Comprehensive observability and monitoring setup for ComponentForge.

## Overview

ComponentForge uses multiple observability tools:

- **LangSmith** - AI operation tracing and debugging
- **Prometheus** - Metrics collection and alerting
- **Structured Logging** - JSON logs with contextual info
- **OpenTelemetry** - Distributed tracing (future)

## LangSmith Integration

### Purpose

LangSmith provides **comprehensive AI observability**:

- ✅ **Trace every AI operation** - Token extraction, pattern search, generation
- ✅ **Track costs** - Token usage and API costs per request
- ✅ **Monitor latency** - Identify bottlenecks in AI pipeline
- ✅ **Debug failures** - View full context of failed operations
- ✅ **Compare prompts** - A/B test prompt variations
- ✅ **Session tracking** - Track related operations across a user session
- ✅ **Frontend integration** - View traces directly from the UI

### Setup

**1. Get API Key**

Sign up at [smith.langchain.com](https://smith.langchain.com) and get your API key.

**2. Configure Environment**

```bash
# backend/.env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=lsv2_pt_your_api_key_here
LANGCHAIN_PROJECT=component-forge
```

**3. Automatic Tracing**

All LangChain/LangGraph operations are automatically traced:

```python
# backend/src/agents/token_extractor.py
from langchain_openai import ChatOpenAI

# Automatically traced by LangSmith
llm = ChatOpenAI(model="gpt-4o", temperature=0)
response = await llm.ainvoke(messages)
```

**4. Session Tracking**

Every API request automatically gets a unique session ID via middleware:

```python
# backend/src/api/middleware/session_tracking.py
# Automatically applied to all requests
# Session ID is included in X-Session-ID response header
# and propagated to all traces for correlation
```

**5. Trace URLs in API Responses**

All AI operations return a direct link to view the trace in LangSmith:

```json
{
  "code": { "component": "...", "stories": "..." },
  "metadata": {
    "trace_url": "https://smith.langchain.com/o/default/projects/p/component-forge/r/abc-123",
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "latency_ms": 3500,
    "token_count": 1250
  }
}
```

### Trace Hierarchy

```
Component Generation Request
├── Token Extraction Agent
│   ├── GPT-4V Screenshot Analysis
│   └── Design Token Parsing
├── Pattern Search Agent
│   ├── Query Embedding Generation
│   └── Qdrant Vector Search
├── Code Generation Agent
│   ├── Pattern Template Retrieval
│   ├── GPT-4 Code Generation
│   └── TypeScript Validation
└── Quality Validation
    ├── ESLint Check
    └── axe-core Accessibility Test
```

### LangSmith Dashboard

View traces at: `https://smith.langchain.com/projects/component-forge`

**Key Metrics:**

- Average latency per agent
- Token usage per request
- Error rate by operation type
- Cost per component generation

### Frontend Integration

**Viewing Traces from the UI:**

After generating a component, click the "View Trace" link in the preview page to open the full trace in LangSmith. The trace link appears in the Observability section and shows:

- Complete execution flow with all AI operations
- Token usage and costs
- Latency breakdown by stage
- Session ID for tracking related operations

**Frontend Components:**

```typescript
// app/src/components/observability/LangSmithTraceLink.tsx
import { LangSmithTraceLink } from "@/components/observability/LangSmithTraceLink";

<LangSmithTraceLink
  traceUrl={metadata.trace_url}
  sessionId={metadata.session_id}
  variant="outline"
  size="default"
/>
```

**Generation Metadata Display:**

```typescript
// app/src/components/observability/GenerationMetadataDisplay.tsx
import { GenerationMetadataDisplay } from "@/components/observability/GenerationMetadataDisplay";

<GenerationMetadataDisplay
  metadata={{
    latency_ms: 3500,
    token_count: 1250,
    estimated_cost: 0.0125,
    stage_latencies: {
      llm_generating: 2500,
      validating: 800,
      post_processing: 200
    }
  }}
/>
```

The preview page displays:
- Total latency and stage breakdown with progress bars
- Token usage (prompt/completion) 
- Estimated cost
- Direct link to LangSmith trace

### Session Tracking

Each request gets a unique session ID that flows through:

1. **Middleware** generates UUID for each request
2. **Context variable** stores session ID for access by agents
3. **Trace metadata** includes session ID for correlation
4. **API response** returns session ID in both `X-Session-ID` header and `metadata.session_id` body field
5. **Frontend** displays session ID with trace link

**Session ID Flow:**

```
Request → SessionTrackingMiddleware
  ↓
  session_id = uuid4()
  ↓
  Context Variable (session_id_var)
  ↓
  Trace Metadata (build_trace_metadata)
  ↓
  API Response (X-Session-ID header + metadata.session_id)
  ↓
  Frontend Display (LangSmithTraceLink)
```

**Using Session ID:**

```python
from src.api.middleware.session_tracking import get_session_id

# In any traced function
session_id = get_session_id()  # Gets current request's session ID
logger.info(f"Processing request", extra={"session_id": session_id})
```

### Custom Metadata

Add custom metadata to traces:

```python
from src.core.tracing import traced, build_trace_metadata

@traced(
    run_name="generate_component",
    metadata={"user_id": user.id, "component_type": "button"}
)
async def generate_component(image: bytes):
    # Operation automatically traced with metadata
    # session_id is automatically included from context
    ...

# Or build metadata dynamically
metadata = build_trace_metadata(
    user_id=user.id,
    component_type="button",
    pattern_id="shadcn-button",
    custom_field="custom_value"
)
# Returns: {
#   "timestamp": "2025-10-28T20:30:00.000Z",
#   "session_id": "550e8400-e29b-41d4-a716-446655440000",
#   "user_id": "user.id",
#   "component_type": "button",
#   "pattern_id": "shadcn-button",
#   "custom_field": "custom_value"
# }
```

**Trace URL Generation:**

```python
from src.core.tracing import get_current_run_id, get_trace_url

# Get current trace run ID
run_id = get_current_run_id()  # Returns: "abc-123-def-456" or None

# Generate LangSmith URL
if run_id:
    trace_url = get_trace_url(run_id)
    # Returns: "https://smith.langchain.com/o/default/projects/p/component-forge/r/abc-123-def-456"
```

## Prometheus Metrics

### Exposed Metrics

Available at `http://localhost:8000/metrics`:

```
# Request metrics
http_requests_total{method="POST",endpoint="/api/v1/generate"}
http_request_duration_seconds{method="POST",endpoint="/api/v1/generate"}

# AI metrics
ai_generation_duration_seconds{agent="token_extractor"}
ai_token_usage_total{model="gpt-4o"}
ai_generation_errors_total{agent="code_generator"}

# Database metrics
db_query_duration_seconds{operation="insert"}
db_connection_pool_size{state="active"}

# Cache metrics
cache_hits_total{operation="pattern_search"}
cache_misses_total{operation="pattern_search"}
```

### Prometheus Client

```python
# backend/src/monitoring/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Custom metrics
generation_duration = Histogram(
    'ai_generation_duration_seconds',
    'Time spent generating components',
    ['agent']
)

token_usage = Counter(
    'ai_token_usage_total',
    'Total tokens used',
    ['model']
)

# Track metrics
with generation_duration.labels(agent='token_extractor').time():
    tokens = await extract_tokens(image)

token_usage.labels(model='gpt-4o').inc(response.usage.total_tokens)
```

### Grafana Dashboard

Import dashboard JSON from `backend/monitoring/grafana_dashboard.json`:

**Panels:**

- Request rate and latency
- AI generation performance
- Token usage and costs
- Error rates
- Database performance

## Structured Logging

### JSON Logs

All logs are structured JSON:

```json
{
  "timestamp": "2025-10-08T14:30:00Z",
  "level": "INFO",
  "logger": "component_generator",
  "message": "Component generated successfully",
  "user_id": "user_123",
  "component_id": "comp_456",
  "duration_ms": 2340,
  "tokens_used": 1250
}
```

### Log Configuration

```python
# backend/src/core/logging.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Add extra fields
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id

        if hasattr(record, 'duration_ms'):
            log_data['duration_ms'] = record.duration_ms

        return json.dumps(log_data)

# Configure
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

### Contextual Logging

```python
import logging
from contextvars import ContextVar

# Context variable for request ID
request_id_var: ContextVar[str] = ContextVar('request_id', default='')

logger = logging.getLogger(__name__)

# Log with context
logger.info(
    "Processing request",
    extra={
        'request_id': request_id_var.get(),
        'user_id': user.id,
        'operation': 'generate_component'
    }
)
```

### Log Levels

- **DEBUG** - Detailed diagnostic info (development only)
- **INFO** - General operational events
- **WARNING** - Unexpected behavior, but handled
- **ERROR** - Errors that need attention
- **CRITICAL** - System failure, immediate action required

### Example Logs

```python
# Info: Successful operation
logger.info(
    "Component generated",
    extra={'component_id': comp.id, 'user_id': user.id}
)

# Warning: Handled issue
logger.warning(
    "Retry attempted after rate limit",
    extra={'attempt': 2, 'max_retries': 3}
)

# Error: Operation failed
logger.error(
    "Failed to generate component",
    extra={'error': str(e), 'user_id': user.id},
    exc_info=True
)
```

## Health Checks

### Endpoint

```bash
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-08T14:30:00Z",
  "services": {
    "database": {
      "status": "up",
      "latency_ms": 5
    },
    "redis": {
      "status": "up",
      "latency_ms": 2
    },
    "qdrant": {
      "status": "up",
      "latency_ms": 8
    },
    "openai": {
      "status": "up",
      "latency_ms": 120
    }
  },
  "version": "1.0.0"
}
```

### Readiness Check

```bash
GET /ready
```

Checks if all dependencies are ready to accept traffic.

### Liveness Check

```bash
GET /health/live
```

Checks if the application is running (doesn't verify dependencies).

## Alerting

### Alert Rules

**High Error Rate:**

```yaml
alert: HighErrorRate
expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
for: 5m
labels:
  severity: warning
annotations:
  summary: "High error rate detected"
```

**Slow AI Generation:**

```yaml
alert: SlowAIGeneration
expr: histogram_quantile(0.95, rate(ai_generation_duration_seconds_bucket[5m])) > 60
for: 10m
labels:
  severity: warning
annotations:
  summary: "AI generation taking longer than 60s"
```

**High Token Usage:**

```yaml
alert: HighTokenUsage
expr: rate(ai_token_usage_total[1h]) > 1000000
for: 1h
labels:
  severity: info
annotations:
  summary: "High token usage detected"
```

## Performance Monitoring

### Key Metrics to Track

**Response Time:**

- P50: < 1s
- P95: < 5s
- P99: < 10s

**AI Operations:**

- Token extraction: < 3s
- Pattern search: < 500ms
- Code generation: < 5s

**Error Rates:**

- Overall: < 1%
- AI operations: < 2%
- Database: < 0.1%

### SLOs (Service Level Objectives)

- **Availability**: 99.5% uptime
- **Latency**: 95% of requests < 5s
- **Error Rate**: < 1% of requests fail

## Debugging

### LangSmith Debugging

1. Find failed request in dashboard
2. View full trace with inputs/outputs
3. Inspect intermediate steps
4. Replay with different inputs
5. Compare with successful traces

### Troubleshooting Trace URLs

**No trace link appears in UI:**

1. Check that `LANGCHAIN_TRACING_V2=true` in `backend/.env`
2. Verify `LANGCHAIN_API_KEY` is set and valid
3. Check backend logs for tracing errors
4. Confirm `trace_url` is in API response metadata

**Trace link appears but no trace in LangSmith:**

1. Verify API key is valid (check LangSmith dashboard)
2. Confirm project name matches `LANGCHAIN_PROJECT` environment variable
3. Check network connectivity to `api.smith.langchain.com`
4. Allow 1-2 seconds for traces to appear in LangSmith
5. Check LangSmith filters (may be filtered out)

**Missing stages in trace:**

1. Verify all agents have `@traced` decorator
2. Check imports: `from src.core.tracing import traced`
3. Ensure tracing is enabled before function calls
4. Review agent instrumentation

**Session ID not showing:**

1. Confirm `SessionTrackingMiddleware` is registered in `main.py`
2. Check `X-Session-ID` header in API response
3. Verify session ID is in response body `metadata.session_id`

**Frontend not displaying trace link:**

1. Verify `LangSmithTraceLink` component is imported
2. Check that `metadata.trace_url` is being passed to component
3. Confirm component is rendered in preview page
4. Check browser console for JavaScript errors

### Log Analysis

```bash
# Search logs for errors
cat logs/app.log | jq 'select(.level=="ERROR")'

# Find slow requests
cat logs/app.log | jq 'select(.duration_ms > 5000)'

# Track user activity
cat logs/app.log | jq 'select(.user_id=="user_123")'

# Find requests by session ID
cat logs/app.log | jq 'select(.session_id=="550e8400-e29b-41d4-a716-446655440000")'
```

## Production Setup

### Environment Variables

```bash
# Enable production logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Enable metrics
ENABLE_METRICS=true
METRICS_PORT=9090

# LangSmith production project
LANGCHAIN_PROJECT=component-forge-prod
```

### Log Aggregation

**Recommended:**

- **Datadog** - Full-stack observability
- **New Relic** - APM and logging
- **Elastic Stack** - Self-hosted logging

### Cost Tracking

Monitor AI costs with LangSmith:

```python
# Track cost per user
@traceable(metadata={"user_id": user.id})
async def generate_component(image: bytes):
    # LangSmith automatically tracks token costs
    ...
```

View cost breakdown:

- Per user
- Per model (GPT-4 vs GPT-4V)
- Per operation type
- Time-based trends

## See Also

- [Architecture Overview](../architecture/overview.md)
- [Backend Monitoring](../../backend/docs/monitoring.md)
- [API Reference](../api/overview.md)
