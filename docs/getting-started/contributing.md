# Contributing to ComponentForge

Thank you for your interest in contributing to ComponentForge! This document provides guidelines and instructions for setting up your development environment and contributing to the project.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/downloads/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/downloads))

### Recommended Tools

- **Code Editor**: Any modern editor works (VS Code, WebStorm, Vim, etc.)
  - VS Code users may find these extensions helpful:
    - Python
    - ESLint
    - Prettier
    - Tailwind CSS IntelliSense
- **Version Management** (optional but recommended):
  - **pyenv** for Python version management
  - **nvm** for Node.js version management

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/component-forge.git
cd component-forge

# Add upstream remote
git remote add upstream https://github.com/kchia/component-forge.git
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend, backend, and Playwright browsers)
make install
```

This command will:
- Install npm packages for the Next.js frontend
- Install Playwright browsers for E2E testing
- Create a Python virtual environment in `backend/venv/`
- Install all Python dependencies
- Copy environment template files

### 3. Configure Environment Variables

```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp app/.env.local.example app/.env.local
```

Edit the `.env` files and add your API keys:

**Required for development:**
- `OPENAI_API_KEY` - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- `LANGCHAIN_API_KEY` - Get from [LangSmith](https://smith.langchain.com/)
- `AUTH_SECRET` - Generate with: `openssl rand -base64 32`

**Optional:**
- `FIGMA_ACCESS_TOKEN` - For Figma integration
- `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` - For additional observability

### 4. Start Development Environment

```bash
# Start all Docker services (PostgreSQL, Qdrant, Redis)
make dev
```

Then in separate terminals:

```bash
# Terminal 1: Start backend API
cd backend && source venv/bin/activate && uvicorn src.main:app --reload

# Terminal 2: Start frontend
cd app && npm run dev
```

### 5. Verify Installation

Access these URLs to confirm everything is working:

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health
- Qdrant dashboard: http://localhost:6333/dashboard

### 6. Run Database Migrations

```bash
make migrate
```

### 7. Seed Sample Data (Optional)

```bash
# Seed Qdrant with component patterns
make seed-patterns
```

## 🧪 Development Workflow

### Running Tests

```bash
# Run all tests (backend + frontend + E2E)
make test

# Backend tests only
cd backend && source venv/bin/activate && pytest tests/ -v

# Frontend unit tests
cd app && npm test

# E2E tests with Playwright
cd app && npm run test:e2e
```

### Linting and Code Style

```bash
# Auto-fix linting issues (recommended)
make lint

# Check code style without fixing (for CI/CD)
make lint-check

# Backend linting (manual)
cd backend && source venv/bin/activate
black src/ tests/ scripts/      # Auto-fix formatting
isort src/ tests/ scripts/      # Auto-fix imports

# Frontend linting (manual)
cd app
npm run lint:fix                # Auto-fix issues
npm run lint                    # Check only
```

**Note**: `make lint` will automatically fix most style issues. Use `make lint-check` in CI/CD pipelines to verify code style without making changes.

### Code Style Guidelines

#### Python (Backend)

- Follow [PEP 8](https://pep8.org/) style guide
- Use [black](https://github.com/psf/black) for formatting (120 char line length)
- Use [isort](https://pycqa.github.io/isort/) for import sorting
- Type hints required for all function signatures
- Docstrings required for all public functions (Google style)

**Example:**

```python
from typing import List, Optional

async def get_patterns(
    query: str,
    limit: int = 10,
    filters: Optional[dict] = None
) -> List[Pattern]:
    """Retrieve component patterns from Qdrant.
    
    Args:
        query: Search query string
        limit: Maximum number of results to return
        filters: Optional metadata filters
        
    Returns:
        List of matching Pattern objects
        
    Raises:
        QdrantConnectionError: If unable to connect to Qdrant
    """
    # Implementation
```

#### TypeScript/React (Frontend)

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript strict mode
- Use functional components with hooks (no class components)
- Use server components by default, client components only when needed
- Follow Next.js 15 App Router conventions
- Use Tailwind CSS v4 with semantic class composition
- Use shadcn/ui components as base building blocks

**Example:**

```typescript
import { FC } from 'react';
import { Button } from '@/components/ui/button';

interface ComponentCardProps {
  name: string;
  description: string;
  onGenerate: () => void;
}

export const ComponentCard: FC<ComponentCardProps> = ({
  name,
  description,
  onGenerate,
}) => {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-muted-foreground">{description}</p>
      <Button onClick={onGenerate}>Generate</Button>
    </div>
  );
};
```

## 🔀 Git Workflow

### Branch Naming

- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`
- Refactor: `refactor/description`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(api): add pattern similarity search endpoint

Implements semantic search for component patterns using Qdrant.
Includes caching layer with Redis for improved performance.

Closes #123
```

```bash
fix(ui): resolve accessibility issues in component generator

- Add proper ARIA labels to form inputs
- Improve keyboard navigation
- Fix color contrast ratios

Fixes #456
```

### Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Write tests** for new features or bug fixes

4. **Run linters and tests**:
   ```bash
   make lint
   make test
   ```

5. **Commit your changes** using conventional commits

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub with:
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes
   - Test results

8. **Address review feedback** and update your PR

9. **Squash commits** if requested before merge

### PR Requirements

- ✅ All tests pass
- ✅ Code follows style guidelines
- ✅ New features include tests
- ✅ Documentation updated if needed
- ✅ No merge conflicts with `main`
- ✅ Approved by at least one maintainer

## 🏗️ Project Structure

```
component-forge/
├── app/                    # Next.js frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── app/          # App Router pages
│   │   └── lib/          # Utilities and hooks
│   └── package.json
├── backend/               # FastAPI backend
│   ├── src/
│   │   ├── api/          # API routes
│   │   ├── core/         # Core modules (database, logging)
│   │   ├── agents/       # LangGraph AI agents
│   │   └── prompts/      # AI prompt templates
│   ├── scripts/          # Database seeding scripts
│   ├── migrations/       # Alembic database migrations
│   └── requirements.txt
├── docs/                  # Documentation
├── docker-compose.yml     # Docker services
└── Makefile              # Development automation
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

- **Clear title** describing the issue
- **Steps to reproduce** the bug
- **Expected behavior** vs actual behavior
- **Environment details** (OS, Node/Python versions, browser)
- **Error messages** or logs
- **Screenshots** if applicable

## 💡 Suggesting Features

When suggesting features:

- **Check existing issues** to avoid duplicates
- **Describe the problem** the feature would solve
- **Propose a solution** or implementation approach
- **Consider alternatives** and trade-offs

## 📚 Additional Resources

- [Project Architecture](../architecture/overview.md)
- [API Documentation](../api/overview.md)
- [LangGraph Multi-Agent System](../architecture/ai-pipeline.md)
- [Security Guidelines](../deployment/security.md)
- [Deployment Guide](../deployment/overview.md)

## 🆘 Getting Help

- **GitHub Discussions**: Ask questions and share ideas
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the `docs/` directory

## 📄 License

By contributing to ComponentForge, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## 🙏 Thank You

Thank you for contributing to ComponentForge! Your efforts help make AI-powered design-to-code generation accessible to everyone.
