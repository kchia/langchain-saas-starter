# Testing Epic 4: Pattern-Driven Generation

## Known Issue: Pattern Seeding

⚠️ **Architecture Conflict**: Your Python venv is running in x86_64 mode (Rosetta) but numpy was compiled for ARM64, preventing the seeding script from running.

### Quick Fix Options:

**Option 1: Recreate venv for ARM64** (Recommended)
```bash
cd backend
rm -rf venv
arch -arm64 /Library/Frameworks/Python.framework/Versions/3.11/bin/python3 -m venv venv
venv/bin/pip install -r requirements.txt
```

**Option 2: Skip seeding, test with pattern files directly**
The pattern JSON files exist in `backend/data/patterns/` and the API can load them without Qdrant.

---

## Testing Epic 4 Features

### 1. Verify Pattern Files

```bash
# Check patterns are present
ls -lh backend/data/patterns/

# Expected files (should see JSON files like):
# button.json, card.json, badge.json, tabs.json, etc.
```

### 2. Start the Backend API

```bash
cd backend
source venv/bin/activate
uvicorn src.main:app --reload
```

Visit: http://localhost:8000/docs for API documentation

### 3. Test Pattern Retrieval API (Without Seeding)

If seeding fails, you can test the raw pattern loading:

```bash
# Test health check
curl http://localhost:8000/health

# Test pattern listing (if you have an endpoint)
curl http://localhost:8000/api/v1/patterns
```

### 4. Test Generation Endpoints

Check the following endpoints are working:

#### a) POST /api/v1/generation/extract
Test requirement extraction from screenshot/Figma URL

```bash
curl -X POST http://localhost:8000/api/v1/generation/extract \
  -H "Content-Type: application/json" \
  -d '{
    "source": "https://example.com/screenshot.png",
    "sourceType": "screenshot"
  }'
```

#### b) POST /api/v1/generation/generate
Test component generation

```bash
curl -X POST http://localhost:8000/api/v1/generation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": {
      "componentName": "TestButton",
      "description": "A primary action button",
      "variant": "primary"
    }
  }'
```

### 5. Test Frontend Integration

```bash
# In separate terminal
cd app
npm run dev
```

Visit: http://localhost:3000

**Test the full flow:**
1. Navigate to the generation page
2. Upload a screenshot or enter a Figma URL
3. Click "Extract Requirements"
4. Review extracted requirements
5. Click "Generate Component"
6. Verify generated code appears
7. Check TypeScript types are generated
8. Check Storybook story is created

### 6. Test Pattern Matching (Once Seeded)

After fixing the seeding issue:

```bash
# Seed patterns
cd backend
source venv/bin/activate
source .env
python scripts/seed_patterns.py

# Verify in Qdrant dashboard
open http://localhost:6333/dashboard
```

Then test semantic search:

```bash
curl -X POST http://localhost:8000/api/v1/patterns/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "button with icon",
    "limit": 5
  }'
```

### 7. Verify Code Generation Quality

Check generated files:

```bash
# TypeScript component
cat app/src/components/generated/YourComponent.tsx

# Type definitions
cat app/src/components/generated/YourComponent.types.ts

# Storybook story
cat app/src/components/generated/YourComponent.stories.tsx
```

Verify:
- [ ] Component follows shadcn/ui patterns
- [ ] TypeScript types are properly defined
- [ ] Props are typed correctly
- [ ] Storybook story has proper args
- [ ] Accessibility props are included
- [ ] Variants are implemented if specified

### 8. Test E2E Flow

```bash
cd app
npm run test:e2e
```

Or test manually:
1. Upload screenshot → Extract → Generate → Verify code
2. Use Figma URL → Extract → Generate → Verify code
3. Edit requirements → Regenerate → Verify updates
4. Export component → Download files

### 9. Check LangSmith Traces

Visit: https://smith.langchain.com

Verify:
- [ ] Extraction traces are captured
- [ ] Generation traces are captured
- [ ] Token usage is tracked
- [ ] Errors are logged properly

### 10. Performance Testing

```bash
# Test generation speed
time curl -X POST http://localhost:8000/api/v1/generation/generate \
  -H "Content-Type: application/json" \
  -d @test_requirements.json
```

Expected timing:
- Extraction: < 10 seconds
- Pattern search: < 2 seconds
- Generation: < 15 seconds
- Total flow: < 30 seconds

---

## Common Issues

### Pattern Seeding Fails
- **Cause**: Architecture mismatch (x86_64 vs ARM64)
- **Fix**: Recreate venv with ARM64 Python (see Option 1 above)

### Generation Returns Empty
- **Cause**: Missing OPENAI_API_KEY
- **Fix**: Check `backend/.env` has valid API key

### Qdrant Connection Error
- **Cause**: Docker services not running
- **Fix**: Run `docker compose up -d`

### TypeScript Generation Errors
- **Cause**: Missing pattern templates
- **Fix**: Check `backend/data/patterns/` has JSON files

---

## Success Criteria

✅ **Epic 4 is working if:**
1. Pattern files load successfully
2. Qdrant is seeded with embeddings (or patterns load from files)
3. Extraction API returns structured requirements
4. Generation API returns valid TypeScript code
5. Generated components match shadcn/ui patterns
6. Type definitions are generated
7. Storybook stories are created
8. Frontend can trigger and display results
9. LangSmith captures all traces
10. E2E tests pass

---

## Next Steps

Once testing confirms everything works:
1. Fix the venv architecture issue for production
2. Add CI/CD to run seeding in deployment
3. Create integration tests for pattern matching
4. Add monitoring for generation quality
5. Document component generation guidelines
