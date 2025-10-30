# Development Documentation

Developer setup and workflow documentation.

## Contents

- [Development Setup](./setup.md) - Initial environment setup
- [Backend Setup Guide](./backend-setup.md) - Backend-specific setup
- [Notebook Development Guide](./notebook-guide.md) - Jupyter notebook development
- [Debugging Guide](./debugging.md) - Debugging tips and tools

## Quick Setup

```bash
# Install all dependencies
make install

# Start development environment
make dev

# Run linters
make lint

# Run all tests
make test
```

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and write tests
3. Run linters: `make lint`
4. Run tests: `make test`
5. Commit using conventional commits
6. Push and create pull request

## Tools

- **Backend**: Python 3.11+, FastAPI, LangChain, pytest
- **Frontend**: Node.js 18+, Next.js 15, TypeScript, Playwright
- **Services**: Docker Desktop for PostgreSQL, Qdrant, Redis

See [Development Setup](./setup.md) for detailed instructions.
