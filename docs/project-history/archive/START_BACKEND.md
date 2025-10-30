# Starting the Backend Server - Architecture Fix

## Problem
Your Python venv was created with ARM64 packages, but when you run Python commands through the terminal, they execute in x86_64 (Rosetta) mode. This causes `ImportError: incompatible architecture` errors.

## Solution

### Option 1: Run in Native ARM64 Mode (Recommended)

Open a **new terminal** and force it to run in native ARM64 mode:

```bash
# Force ARM64 mode
arch -arm64 zsh

# Verify you're in ARM64
arch
# Should output: arm64

# Navigate to backend
cd /Users/houchia/Desktop/component-forge/backend

# Activate venv
source venv/bin/activate

# Start server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Recreate venv for x86_64

If you prefer to keep using Rosetta mode:

```bash
cd /Users/houchia/Desktop/component-forge/backend

# Remove existing venv
rm -rf venv

# Create new x86_64 venv
arch -x86_64 /Library/Frameworks/Python.framework/Versions/3.11/bin/python3 -m venv venv

# Activate and install
source venv/bin/activate
pip install -r requirements.txt

# Start server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 3: Use Docker (Clean Solution)

```bash
cd /Users/houchia/Desktop/component-forge

# Start all services including backend
make dev

# Or manually:
docker-compose up -d
```

## Verify Backend is Running

```bash
curl http://localhost:8000/health
```

Should return: `{"status":"healthy"}`

## Check Backend Logs

```bash
# If running in terminal
# Just look at the uvicorn output

# If running in background
tail -f /tmp/backend.log
```

---

## Testing Epic 4 After Backend Starts

1. **Frontend**: Make sure it's running on http://localhost:3000
2. **Backend**: Should be on http://localhost:8000
3. **Go to**: http://localhost:3000/patterns
4. **Click**: "🔧 Manually Complete PATTERNS Step" (debug button)
5. **Click**: "Continue to Preview"
6. **Wait**: ~15-30 seconds for generation to complete
7. **See**: Generated component code, types, and Storybook story

---

## Current Status

- ✅ Docker services (Postgres, Qdrant, Redis) are running
- ✅ Frontend is running
- ❌ **Backend needs to be started in ARM64 mode**

Use **Option 1** above to start the backend correctly.
