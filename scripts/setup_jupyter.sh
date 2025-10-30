#!/bin/bash

# Setup script for Jupyter environment
# This script configures Jupyter for the Component Forge project

set -e  # Exit on any error

echo "🔧 Setting up Jupyter environment for Component Forge..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
VENV_DIR="$BACKEND_DIR/venv"

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Backend directory: $BACKEND_DIR"
echo "📁 Virtual environment: $VENV_DIR"

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    echo "❌ Virtual environment not found at $VENV_DIR"
    echo "Please run 'make install' or create the virtual environment first."
    exit 1
fi

# Activate virtual environment
echo "🐍 Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Install Jupyter packages if not already installed
echo "📦 Installing Jupyter packages..."
pip install -q jupyter ipykernel matplotlib pandas seaborn plotly notebook

# Install the kernel for this project
echo "🔧 Installing Jupyter kernel for Component Forge..."
python -m ipykernel install --user --name=component-forge --display-name="Component Forge"

# Create Jupyter configuration directory if it doesn't exist
JUPYTER_CONFIG_DIR="$HOME/.jupyter"
mkdir -p "$JUPYTER_CONFIG_DIR"

# Create Jupyter configuration file
echo "⚙️ Creating Jupyter configuration..."
cat > "$JUPYTER_CONFIG_DIR/jupyter_notebook_config.py" << EOF
# Jupyter configuration for Component Forge

import os
import sys
from pathlib import Path

# Add project paths to Python path
project_root = Path.cwd()
if project_root.name == 'notebooks':
    project_root = project_root.parent

backend_src = project_root / 'backend' / 'src'
sys.path.insert(0, str(backend_src))

# Load environment variables from backend/.env
try:
    from dotenv import load_dotenv
    env_file = project_root / 'backend' / '.env'
    if env_file.exists():
        load_dotenv(env_file)
        print(f"Loaded environment from {env_file}")
except ImportError:
    print("python-dotenv not available, skipping .env file loading")

# Notebook configuration
c.NotebookApp.notebook_dir = str(project_root / 'notebooks')
c.NotebookApp.open_browser = True
c.NotebookApp.port = 8888
c.NotebookApp.ip = 'localhost'

# Security settings
c.NotebookApp.token = ''  # Remove token requirement for local development
c.NotebookApp.password = ''
EOF

# Create nbstripout configuration to clean notebooks before git commits
echo "🧹 Setting up nbstripout for clean git commits..."
pip install -q nbstripout

# Check if we're in a git repository
if [ -d "$PROJECT_ROOT/.git" ]; then
    cd "$PROJECT_ROOT"
    nbstripout --install --attributes .gitattributes
    echo "✅ nbstripout configured to clean notebooks before commits"
else
    echo "⚠️  Not in a git repository, skipping nbstripout git configuration"
fi

# Create startup script for notebooks
NOTEBOOK_STARTUP_DIR="$HOME/.ipython/profile_default/startup"
mkdir -p "$NOTEBOOK_STARTUP_DIR"

cat > "$NOTEBOOK_STARTUP_DIR/00-component-forge-setup.py" << 'EOF'
# Component Forge notebook startup script
# This script runs automatically when IPython/Jupyter starts

import sys
import os
from pathlib import Path

# Determine project root
if 'JUPYTER_CONFIG_DIR' in os.environ:
    # Running in Jupyter
    project_root = Path.cwd()
    if project_root.name == 'notebooks':
        project_root = project_root.parent
else:
    # Running in IPython
    project_root = Path.cwd()

# Add backend/src to Python path
backend_src = project_root / 'backend' / 'src'
if backend_src.exists() and str(backend_src) not in sys.path:
    sys.path.insert(0, str(backend_src))
    print(f"Added {backend_src} to Python path")

# Load environment variables
try:
    from dotenv import load_dotenv
    env_file = project_root / 'backend' / '.env'
    if env_file.exists():
        load_dotenv(env_file)
        print(f"Loaded environment from {env_file}")
except ImportError:
    pass

# Set up common imports
try:
    import pandas as pd
    import matplotlib.pyplot as plt
    import seaborn as sns
    import numpy as np

    # Set up plotting
    plt.style.use('default')
    sns.set_palette("husl")

    print("📊 Data science libraries loaded")
except ImportError as e:
    print(f"⚠️  Some data science libraries not available: {e}")

# Print welcome message
print("🚀 Component Forge environment ready!")
print(f"📁 Project root: {project_root}")
print("💡 Use 'notebooks/utils/database_helpers' for database operations")
EOF

echo "✅ Jupyter kernel and configuration complete!"
echo ""
echo "🚀 To start Jupyter:"
echo "   cd $PROJECT_ROOT"
echo "   source backend/venv/bin/activate"
echo "   jupyter notebook"
echo ""
echo "🔧 In Jupyter, select 'Component Forge' as your kernel"
echo "📚 Check out the notebooks/README.md for usage guide"

# Test the kernel installation
echo "🧪 Testing kernel installation..."
python -c "
import jupyter_client
km = jupyter_client.KernelManager(kernel_name='component-forge')
print('✅ Component Forge kernel is properly installed')
"

echo "🎉 Jupyter setup complete!"