# Features Documentation

Feature-specific documentation for ComponentForge capabilities.

## Contents

- [Token Extraction](./token-extraction.md) - Design token extraction from screenshots/Figma
- [Figma Integration](./figma-integration.md) - Direct Figma file integration
- [Pattern Retrieval](./pattern-retrieval.md) - Semantic search for component patterns
- [Code Generation](./code-generation.md) - AI-powered code generation
- [Quality Validation](./quality-validation.md) - TypeScript, ESLint, and accessibility validation
- [Accessibility](./accessibility.md) - WCAG compliance and a11y testing
- [Observability](./observability.md) - LangSmith tracing and monitoring

## Core Features

### 🎨 Design-to-Code Pipeline

1. **Input**: Screenshot or Figma URL
2. **Extraction**: AI extracts design tokens (colors, spacing, typography)
3. **Retrieval**: Vector search finds matching shadcn/ui patterns
4. **Generation**: Creates production-ready TypeScript components
5. **Validation**: TypeScript + ESLint + axe-core accessibility checks

### 🤖 AI-Powered

- GPT-4V for vision and screenshot analysis
- LangGraph for multi-agent orchestration
- LangSmith for observability and tracing
- Qdrant for semantic pattern search

See individual feature docs for detailed implementation guides.
