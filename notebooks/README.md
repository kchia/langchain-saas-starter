# Jupyter Notebooks for AI Development

This directory contains Jupyter notebooks for AI development, experimentation, and analysis.

## Directory Structure

### 📊 `/exploration`
Data exploration and analysis notebooks:
- Database schema exploration
- Data quality analysis
- Performance monitoring
- User behavior analysis

### 🧪 `/experiments`
AI model experiments and testing:
- RAG system testing
- Embedding model comparisons
- Prompt engineering experiments
- Model performance evaluation

### 📈 `/evaluation`
Model and system evaluation notebooks:
- RAGAS evaluation workflows
- A/B testing analysis
- Performance benchmarking
- Quality assessment

### 📚 `/tutorials`
Learning and tutorial notebooks:
- Getting started guides
- Development workflows
- Best practices examples
- Feature demonstrations

## Getting Started

### 1. Install Dependencies
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Set Up Jupyter Kernel
```bash
# Install the kernel for this project
python -m ipykernel install --user --name=component-forge --display-name="Component Forge"
```

### 3. Start Jupyter
```bash
# From project root
jupyter notebook notebooks/
# or
jupyter lab notebooks/
```

### 4. Select Kernel
In Jupyter, select "Component Forge" as your kernel to ensure proper environment access.

## Environment Setup

The notebooks are configured to:
- Access the project's Python environment
- Connect to the development database
- Use environment variables from `.env` files
- Import project modules from `backend/src`

## Common Imports

Most notebooks will start with these imports:
```python
import sys
import os
from pathlib import Path

# Add backend/src to Python path
project_root = Path.cwd().parent if Path.cwd().name == 'notebooks' else Path.cwd()
backend_src = project_root / 'backend' / 'src'
sys.path.insert(0, str(backend_src))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(project_root / 'backend' / '.env')

# Common imports
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from core.database import get_async_session, AsyncSessionLocal
from core.models import *
```

## Best Practices

### 1. Notebook Organization
- Use clear, descriptive names for notebooks
- Include date/version in notebook names for experiments
- Add markdown cells to explain each section
- Clean up outputs before committing (use `nbstripout`)

### 2. Code Quality
- Keep cells focused and modular
- Extract reusable code into utility functions
- Use type hints where appropriate
- Handle errors gracefully

### 3. Data Handling
- Always use async database sessions
- Close connections properly
- Avoid loading large datasets entirely into memory
- Use sampling for initial exploration

### 4. Documentation
- Document assumptions and methodology
- Include data sources and timestamps
- Explain visualizations and insights
- Add conclusions and next steps

### 5. Version Control
- Use `nbstripout` to clean notebooks before committing
- Save important results as separate files
- Don't commit large data files or model outputs

## Utility Functions

Common utility functions are available in `notebooks/utils/`:
- Database helpers
- Plotting utilities
- Data processing functions
- Evaluation metrics

## Security Notes

- Never commit notebooks with sensitive data
- Use environment variables for API keys and credentials
- Be careful with database queries in shared notebooks
- Don't include production data in development notebooks

## Troubleshooting

### Kernel Issues
```bash
# List available kernels
jupyter kernelspec list

# Remove old kernel
jupyter kernelspec remove component-forge

# Reinstall kernel
python -m ipykernel install --user --name=component-forge --display-name="Component Forge"
```

### Import Errors
```python
# Check Python path
import sys
print(sys.path)

# Verify backend/src is included
backend_src = Path.cwd().parent / 'backend' / 'src'
if str(backend_src) not in sys.path:
    sys.path.insert(0, str(backend_src))
```

### Database Connection Issues
```python
# Test database connection
from core.database import check_database_connection
connection_ok = await check_database_connection()
print(f"Database connection: {'OK' if connection_ok else 'Failed'}")
```

For more help, check the tutorial notebooks or contact the development team.