# Architecture Documentation

System architecture and design documentation for ComponentForge.

## Contents

- [System Architecture Overview](./overview.md) - High-level architecture
- [AI Pipeline & Agents](./ai-pipeline.md) - LangGraph multi-agent system
- [Tech Stack](./tech-stack.md) - Technologies and dependencies

## Quick Overview

ComponentForge uses a three-tier architecture:

- **Frontend**: Next.js 15 + shadcn/ui + Zustand + TanStack Query
- **Backend**: FastAPI + LangGraph + LangSmith + Qdrant
- **Services**: PostgreSQL + Redis + Qdrant (Docker Compose)

See [System Architecture](./overview.md) for detailed diagrams and data flows.
