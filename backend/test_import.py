#!/usr/bin/env python3
"""Test script to isolate the import issue"""

import sys
import os

print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version}")
print(f"Platform: {sys.platform}")
print(f"Architecture: {os.uname().machine}")

try:
    print("Testing numpy import...")
    import numpy as np
    print(f"✓ NumPy {np.__version__} imported successfully")
except Exception as e:
    print(f"✗ NumPy import failed: {e}")

try:
    print("Testing pydantic_core import...")
    import pydantic_core
    print(f"✓ pydantic_core imported successfully")
except Exception as e:
    print(f"✗ pydantic_core import failed: {e}")

try:
    print("Testing pydantic import...")
    import pydantic
    print(f"✓ pydantic {pydantic.__version__} imported successfully")
except Exception as e:
    print(f"✗ pydantic import failed: {e}")

try:
    print("Testing fastapi import...")
    import fastapi
    print(f"✓ fastapi {fastapi.__version__} imported successfully")
except Exception as e:
    print(f"✗ fastapi import failed: {e}")

try:
    print("Testing main app import...")
    from src.main import app
    print("✓ Main app imported successfully")
except Exception as e:
    print(f"✗ Main app import failed: {e}")
