.PHONY: help install dev test build deploy demo clean template-setup lint lint-check migrate migrate-rollback seed-patterns

help:
	@echo "🤖 ComponentForge - AI-Powered Component Generation"
	@echo "===================================================="
	@echo "  make install         - Install dependencies"
	@echo "  make dev             - Start development environment"
	@echo "  make test            - Run all tests"
	@echo "  make lint            - Run linters and auto-fix issues"
	@echo "  make lint-check      - Check code style (no fixes)"
	@echo "  make migrate         - Apply database migrations"
	@echo "  make migrate-rollback - Rollback last migration"
	@echo "  make seed-patterns   - Seed Qdrant with component patterns"
	@echo "  make demo            - Prepare demo environment"
	@echo "  make clean           - Clean up containers and dependencies"
	@echo "  make template-setup  - Setup guide for template users"

install:
	@echo "📦 Installing dependencies..."
	@echo "Installing frontend dependencies..."
	cd app && npm install && npx playwright install
	@echo "Setting up backend environment..."
	cd backend && rm -rf venv 2>/dev/null || true
	cd backend && python3 -m venv venv && ./venv/bin/pip install --upgrade pip
	@echo "Installing backend dependencies..."
	cd backend && ./venv/bin/pip install -r requirements.txt
	@echo "Installing backend validation scripts dependencies..."
	cd backend/scripts && npm install
	@echo "Setting up environment files..."
	cp backend/.env.example backend/.env 2>/dev/null || true
	cp app/.env.local.example app/.env.local 2>/dev/null || true
	@echo "✅ Installation complete!"
	@echo "📝 Next: Edit .env files with your API keys"
	@echo "🚀 Then run: make dev"

dev:
	@echo "🚀 Starting development..."
	@echo "Checking Docker availability..."
	@if [ -f "/Applications/Docker.app/Contents/Resources/bin/docker" ]; then \
		DOCKER_CMD="/Applications/Docker.app/Contents/Resources/bin/docker"; \
	elif command -v docker >/dev/null 2>&1; then \
		DOCKER_CMD="docker"; \
	else \
		echo "❌ Docker not found. Please install Docker Desktop and start it."; \
		exit 1; \
	fi; \
	if ! $$DOCKER_CMD info >/dev/null 2>&1; then \
		echo "❌ Docker daemon not running. Please start Docker Desktop."; \
		exit 1; \
	fi; \
	echo "✅ Docker is running"; \
	echo "Starting services..."; \
	$$DOCKER_CMD compose up -d 2>/dev/null || $$DOCKER_CMD-compose up -d
	@echo ""
	@echo "🎯 Next steps - Run these in separate terminals:"
	@echo "1. cd backend && source venv/bin/activate && uvicorn src.main:app --reload"
	@echo "2. cd app && npm run dev"
	@echo ""
	@echo "📱 Access points:"
	@echo "- Frontend: http://localhost:3000"
	@echo "- Backend API: http://localhost:8000"
	@echo "- API Docs: http://localhost:8000/docs"

test:
	cd backend && source venv/bin/activate && pytest tests/ -v
	cd app && npm test
	cd app && npm run test:e2e

lint:
	@echo "🧹 Running linters and auto-fixing..."
	@echo "Linting backend (black + isort)..."
	cd backend && source venv/bin/activate && black src/ tests/ scripts/
	cd backend && source venv/bin/activate && isort src/ tests/ scripts/
	@echo "Linting frontend (ESLint)..."
	cd app && npm run lint:fix
	@echo "✅ Linting complete!"

lint-check:
	@echo "🔍 Checking code style (no fixes)..."
	@echo "Checking backend (black + isort)..."
	cd backend && source venv/bin/activate && black src/ tests/ scripts/ --check
	cd backend && source venv/bin/activate && isort src/ tests/ scripts/ --check-only
	@echo "Checking frontend (ESLint)..."
	cd app && npm run lint
	@echo "✅ Style check complete!"

migrate:
	@echo "📊 Applying database migrations..."
	cd backend && source venv/bin/activate && alembic upgrade head
	@echo "✅ Migrations applied successfully!"

migrate-rollback:
	@echo "⏪ Rolling back last migration..."
	cd backend && source venv/bin/activate && alembic downgrade -1
	@echo "✅ Migration rolled back successfully!"

seed-patterns:
	@echo "🌱 Seeding Qdrant with component patterns..."
	cd backend && source venv/bin/activate && python scripts/seed_patterns.py
	@echo "✅ Pattern seeding complete!"

demo:
	@echo "🎬 Preparing demo..."
	docker-compose up -d
	@echo "📊 Opening dashboards..."
	@echo "- App: http://localhost:3000"
	@echo "- API Docs: http://localhost:8000/docs"
	@echo "- Qdrant: http://localhost:6333/dashboard"

clean:
	docker-compose down -v
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	rm -rf backend/venv app/node_modules backend/scripts/node_modules

template-setup:
	@echo "🎯 Template Setup Guide"
	@echo "======================"
	@echo "1. Update package.json name and description"
	@echo "2. Configure environment variables (.env files)"
	@echo "3. Update README.md with your project details"
	@echo "4. Customize authentication in app/auth.config.ts"
	@echo "5. Add your AI models and prompts"
	@echo "6. Run 'make install' to install dependencies"
	@echo ""
	@echo "📖 For detailed instructions, see TEMPLATE_SETUP.md"
