#!/bin/bash
# Script to activate the correct Python environment for ComponentForge

# Get the project root directory (where this script lives)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🐍 Activating ComponentForge Python environment..."

# Activate virtual environment
source "$PROJECT_ROOT/backend/venv/bin/activate"

# NOTE: We don't add backend/src to PYTHONPATH to avoid conflicts with Python's built-in 'types' module
# Notebooks use the HybridRetriever wrapper in notebooks/utils/ which handles imports correctly

# Load environment variables from backend/.env if it exists
if [ -f "$PROJECT_ROOT/backend/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/backend/.env" | xargs)
    echo "✅ Loaded environment variables from backend/.env"
fi

# Add Docker to PATH if not already there
if ! command -v docker &> /dev/null; then
    if [ -f "/Applications/Docker.app/Contents/Resources/bin/docker" ]; then
        export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
        echo "✅ Added Docker to PATH"
    fi
fi

echo "✅ Environment activated!"
echo "📍 Python: $(which python)"
echo "📍 Version: $(python --version)"
echo "📍 PYTHONPATH: $PYTHONPATH"
echo ""
echo "🚀 You can now run:"
echo "   - cd notebooks/evaluation && jupyter notebook"
echo "   - python backend/scripts/your_script.py"
echo "   - Any Python commands with the correct environment"
echo ""
echo "🐳 Docker status:"
docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "   Docker not available"
